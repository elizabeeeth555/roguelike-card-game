import { useEffect, useRef, useState } from 'react';
import { BattleView } from '../BattleView';
import { SkillInformation } from '../components/SkillDetail';
import type { SkillViewModel, SkillSelection } from '../battle-view-model';
import { Modal, Panel, ThroneButton } from './ui';
import { createSaveRepository, freshSave, recordFirstWin } from './save';
import type { Save, StoragePort } from './save';
import type { Action, Frame, Runtime, State } from './core';
import { eventText } from './core';
import { category, moveSkill, toFirstEraModel } from './presentation';
type Screen = 'title' | 'hub' | 'deck' | 'battle' | 'result';
type Speed = 'slow' | 'normal' | 'fast';
export function FirstEraApp({ runtime, storage }: { runtime: Runtime; storage: () => StoragePort }) {
 const [repository] = useState(() => createSaveRepository(storage, runtime));
 const [loaded] = useState(repository.load);
 const [save, setSave] = useState<Save>(loaded.save ?? freshSave()); const saveRef = useRef(save);
 const [exists, setExists] = useState(loaded.exists), [warning, setWarning] = useState(loaded.error);
 const writable = useRef(!loaded.error);
 const [screen, setScreen] = useState<Screen>('title'), [fade, setFade] = useState(''); const navigating = useRef(false);
 const [draft, setDraft] = useState<string[]>([]), [detail, setDetail] = useState<string | null>(null), [dragged, setDragged] = useState<number | null>(null);
 const [settings, setSettings] = useState(false), [confirm, setConfirm] = useState<{ title: string; text: string; accept: () => void } | null>(null);
 const [state, setState] = useState<State | null>(null), actual = useRef<State | null>(null), initial = useRef<State | null>(null), frames = useRef<Frame[]>([]);
 const [selected, setSelected] = useState<SkillSelection | null>(null), [confirmEnd, setConfirmEnd] = useState(false);
 const [busy, setBusy] = useState(false), locked = useRef(false), generation = useRef(0), alive = useRef(true);
 const [speed, setSpeed] = useState<Speed>('slow'), speedRef = useRef<Speed>('slow'), skipping = useRef(false);
 const [impact, setImpact] = useState<{ target: 'player' | 'boss'; text: string; sequence: string } | null>(null);
 const [log, setLog] = useState<string[]>([]), [cue, setCue] = useState(''), [activeSkill, setActiveSkill] = useState<{ skillId?: string; side?: 'player' | 'boss' }>({});
 const delayRef = useRef<{ id: ReturnType<typeof setTimeout>; resolve: () => void } | null>(null);
 const fadeTimers = useRef(new Map<ReturnType<typeof setTimeout>, () => void>());
 const cancelCombat = () => { generation.current++; skipping.current = true; if (delayRef.current) { clearTimeout(delayRef.current.id); delayRef.current.resolve(); delayRef.current = null; } locked.current = false; setBusy(false); setImpact(null); };
 useEffect(() => () => { alive.current = false; generation.current++; if (delayRef.current) { clearTimeout(delayRef.current.id); delayRef.current.resolve(); } for (const [id, resolve] of fadeTimers.current) { clearTimeout(id); resolve(); } }, []);
 const pauseFade = () => new Promise<void>(resolve => { const id = setTimeout(() => { fadeTimers.current.delete(id); resolve(); }, 250); fadeTimers.current.set(id, resolve); });
 async function go(next: Screen) {
  if (navigating.current) return; navigating.current = true; setSelected(null); setConfirmEnd(false); setDetail(null); setFade('out');
  await pauseFade(); if (!alive.current) return; setScreen(next); setFade('in');
  await pauseFade(); if (!alive.current) return; setFade(''); navigating.current = false;
 }
 function persist(next: Save) { saveRef.current = next; setSave(next); if (!writable.current) { setWarning('保存先が利用できないため、メモリ内のみで続行しています。'); return; } const error = repository.write(next); setWarning(error); if (!error) setExists(true); }
 function beginNew() {
  if (navigating.current) return; cancelCombat(); setConfirm(null); setSettings(false); const error = repository.clear(); writable.current = !error; setWarning(error); setExists(!!error);
  const next = freshSave(); saveRef.current = next; setSave(next); setDraft([]); void go('hub');
 }
 function newGame() { if (navigating.current) return; if (exists || save.deck || save.firstWin) setConfirm({ title: 'はじめから', text: '現在の編成と初回勝利記録を消して開始しますか？', accept: beginNew }); else beginNew(); }
 function openDeck() { if (navigating.current) return; setDraft([...(save.deck ?? [])]); void go('deck'); }
 function leaveDeck() { if (navigating.current) return; if (JSON.stringify(draft) !== JSON.stringify(save.deck ?? [])) setConfirm({ title: '編成変更を破棄', text: '未確定の変更を破棄して拠点へ戻りますか？', accept: () => { setConfirm(null); void go('hub'); } }); else void go('hub'); }
 function commitDeck() { if (navigating.current) return; try { const deck = runtime.rules.validateDeck(draft); persist({ ...saveRef.current, deck }); void go('hub'); } catch { setWarning('異なる通常スキルを5種類選んでください。'); } }
 function startBattle() {
  if (navigating.current) return;
  try { const deck = runtime.rules.validateDeck(saveRef.current.deck ?? []); cancelCombat(); const next = runtime.core.createState({ ruleset: runtime.rules.RULESET, playerDeck: deck }); actual.current = next; initial.current = runtime.core.snapshot(next); frames.current = []; setState(next); setLog(['戦闘開始 — 英雄対灰鎖の老王']); setCue('スキルを選択してください'); setActiveSkill({}); setSelected(null); void go('battle'); } catch { setWarning('編成を確定してから挑戦してください。'); }
 }
 function wait(ms: number) { if (skipping.current) return Promise.resolve(); return new Promise<void>(resolve => { const id = setTimeout(() => { if (delayRef.current?.id === id) delayRef.current = null; resolve(); }, ms); delayRef.current = { id, resolve }; }); }
 async function step(action: Action, token: number) {
  if (token !== generation.current || !actual.current) return false;
  const result = runtime.core.transition(actual.current, action); if (!result.ok) { setCue(result.reason ?? '使用不可'); return false; }
  actual.current = result.state;
  const frame: Frame = { sequence: frames.current.length + 1, action, events: result.events, after: runtime.core.snapshot(result.state) }; frames.current.push(frame);
  setImpact(null); setActiveSkill({ skillId: action.type === 'card' ? action.id : undefined, side: action.side });
  setCue(action.type === 'card' ? `${action.side === 'boss' ? '老王' : '英雄'}：${runtime.rules.card(action.id).name} 発動` : action.type === 'ultimate' ? '戦技の残響' : 'ターン進行');
  const duration = { slow: 4500, normal: 1800, fast: 400 }[speedRef.current];
  await wait(duration * .2); if (token !== generation.current) return false;
  for (const [i, event] of result.events.entries()) {
   if (token !== generation.current) return false;
   const text = eventText(event, runtime); setCue(text); setLog(lines => [...lines, `${frame.sequence}.${i + 1} ${text}`]);
   if (['damage', 'heal', 'barrier', 'poisonApplied', 'weak', 'stanceBreak'].includes(event.type)) setImpact({ target: event.target ?? event.side ?? 'boss', text: event.type === 'damage' ? `${event.amount}ダメージ${event.blocked ? `／吸収${event.blocked}` : ''}` : text, sequence: `${frame.sequence}.${i}` });
   if (event.kind === 'flash') setActiveSkill({ side: 'boss', skillId: '@oath_strike' });
   await wait(duration * .5 / Math.max(1, result.events.length));
  }
  if (token !== generation.current) return false;
  // A core action is atomic. Display its committed snapshot after its ordered events; never recalculate combat in animation.
  setState(result.state); await wait(duration * .3); return token === generation.current;
 }
 async function act(action: Action) {
  if (locked.current || navigating.current || !actual.current || actual.current.end || actual.current.active !== 'player') return;
  locked.current = true; setBusy(true); skipping.current = false; setSelected(null); setConfirmEnd(false); const token = ++generation.current;
  try {
   if (!await step(action, token)) return;
   if (actual.current && !actual.current.end && (actual.current as State).active === 'boss') {
    const planned = runtime.planner.plan(runtime.core.snapshot(actual.current));
    for (const next of planned.actions) { if (token !== generation.current || actual.current.end || (actual.current as State).active !== 'boss') break; if (!await step(next, token)) return; }
    if (token === generation.current && !actual.current.end && (actual.current as State).active === 'boss') if (!await step({ type: 'endTurn', side: 'boss' }, token)) return;
   }
   if (token !== generation.current) return;
   if (actual.current?.end) {
    if (actual.current.end === 'player' && initial.current) persist(recordFirstWin(saveRef.current, { deck: [...initial.current.actors.player.deck], initial: initial.current, frames: frames.current, result: actual.current }));
    void go('result');
   }
  } catch { if (token === generation.current) setWarning('戦闘処理を継続できませんでした。状態を初期化して再挑戦してください。'); }
  finally { if (token === generation.current && alive.current) { locked.current = false; setBusy(false); setActiveSkill({}); setImpact(null); } }
 }
 function endTurn() { if (locked.current || navigating.current || !actual.current) return; if (runtime.core.legalActions(actual.current).some(a => a.type !== 'endTurn')) setConfirmEnd(true); else void act({ type: 'endTurn', side: 'player' }); }
 function skip() { skipping.current = true; if (delayRef.current) { clearTimeout(delayRef.current.id); delayRef.current.resolve(); delayRef.current = null; } }
 useEffect(() => { const key = (e: KeyboardEvent) => { if (screen !== 'battle' || navigating.current || document.querySelector('dialog[open]') || (e.target instanceof HTMLElement && e.target.closest('button,input,select'))) return; const n = Number(e.key) - 1; if (n >= 0 && n < 5 && state) { setSelected({ side: 'player', id: state.actors.player.deck[n] }); e.preventDefault(); } if (e.code === 'Space') { endTurn(); e.preventDefault(); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); });
 function skillInfo(id: string): SkillViewModel { const spec = id === runtime.rules.ultimate.id ? { ...runtime.rules.ultimate, cd: 0, tags: ['buff'] } : runtime.rules.card(id); return { ...spec, category: category(spec.tags), cd: spec.cd, allowed: false, reason: '', remaining: 0, used: false, stateLabel: '', condition: id === runtime.rules.ultimate.id ? 'この自ターンの再演元・戦闘中1回' : 'MP・CD・自ターンの使用制限' }; }
 const settingsButton = <ThroneButton disabled={!!fade} onClick={() => setSettings(true)}>設定</ThroneButton>;
 const speedSelect = <label>演出速度 <select aria-label="演出速度" value={speed} onChange={e => { const value = e.target.value as Speed; setSpeed(value); speedRef.current = value; }}><option value="slow">ゆっくり</option><option value="normal">通常</option><option value="fast">高速</option></select></label>;
 return <div className="first-era-app"><div className={`fade-stage fade-${fade}`} inert={!!fade} aria-busy={!!fade}>
  {screen === 'title' && <main className="story-screen title-screen" style={{ backgroundImage: 'url("./first-era/hub.jpg")' }}><h1>継世の王座</h1><div className="top-right">{settingsButton}</div><nav className="title-actions"><ThroneButton onClick={newGame}>はじめから</ThroneButton><ThroneButton disabled={!save.deck} onClick={() => void go('hub')}>続きから</ThroneButton></nav></main>}
  {screen === 'hub' && <main className="story-screen hub-screen" style={{ backgroundImage: 'url("./first-era/hub.jpg")' }}><ThroneButton className="top-left" onClick={() => void go('title')}>タイトルへ戻る</ThroneButton><div className="top-right">{settingsButton}</div><Panel className="hub-deck"><h1>出征の支度</h1><p>{save.deck ? '確定編成' : 'まず通常スキルを5種類編成してください'}</p><ol>{save.deck?.map(id => <li key={id}>{runtime.rules.card(id).name}</li>)}</ol><ThroneButton onClick={openDeck}>スキル編成</ThroneButton>{save.firstWin && <p>初回踏破記録あり（再戦では変更しません）</p>}</Panel><div className="hub-challenge"><ThroneButton disabled={!save.deck} onClick={startBattle}>王に挑む</ThroneButton><p>第一紀 — 灰鎖の老王</p></div></main>}
  {screen === 'deck' && <main className="deck-screen" style={{ backgroundImage: 'linear-gradient(#0008,#0009),url("./first-era/deck.png")' }}><header><ThroneButton onClick={leaveDeck}>拠点へ戻る</ThroneButton><h1>スキル編成</h1><ThroneButton disabled={draft.length !== 5} onClick={commitDeck}>編成を確定</ThroneButton></header><section className="deck-slots" aria-label="編成5枠"><h2>通常スキル {draft.length}/5</h2><ol>{Array.from({ length: 5 }, (_, i) => <li key={i} draggable={!!draft[i]} onDragStart={e => { setDragged(i); e.dataTransfer.setData('text/plain', String(i)); }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragged !== null && draft[i]) setDraft(moveSkill(draft, dragged, i)); setDragged(null); }}><strong>{draft[i] ? runtime.rules.card(draft[i]).name : '空き枠'}</strong>{draft[i] && <div><button aria-label={`${i + 1}番を前へ`} disabled={i === 0} onClick={() => setDraft(moveSkill(draft, i, i - 1))}>←</button><button aria-label={`${i + 1}番を後へ`} disabled={i >= draft.length - 1} onClick={() => setDraft(moveSkill(draft, i, i + 1))}>→</button><button aria-label={`${i + 1}番を外す`} onClick={() => setDraft(draft.filter((_, n) => n !== i))}>外す</button></div>}</li>)}</ol><ThroneButton className="deck-ultimate" onClick={() => setDetail(runtime.rules.ultimate.id)}>固定奥義：戦技の残響（枠外）</ThroneButton></section><section className="deck-catalog" aria-label="採用10スキル">{runtime.rules.pool.map(id => { const skill = skillInfo(id), added = draft.includes(id); return <article key={id} className={`deck-card category-${skill.category}`}><button className="deck-card-choice" aria-pressed={added} aria-label={`${skill.name}を${added ? '解除' : '追加'}`} disabled={!added && draft.length >= 5} onClick={() => setDraft(added ? draft.filter(x => x !== id) : [...draft, id])}><div className="skill-art-placeholder">SKILL<br /><small>イラスト未登録</small></div><h2>{skill.name}</h2><p>♦ {skill.cost}　⌛ {skill.cd}</p><p>{skill.description}</p><strong>{added ? '編成中・解除' : '編成へ追加'}</strong></button><ThroneButton onClick={() => setDetail(id)}>{skill.name}の詳細</ThroneButton></article>; })}</section></main>}
  {screen === 'battle' && state && <BattleView model={toFirstEraModel(runtime, state, busy, cue)} selected={selected} confirmEnd={confirmEnd} onSelect={setSelected} onClose={() => setSelected(null)} onUse={() => { if (selected?.side === 'player') void act({ type: 'card', side: 'player', id: selected.id }); }} onUltimate={() => void act({ type: 'ultimate', side: 'player' })} onAccelerate={() => void act({ type: 'accelerate', side: 'player' })} onEndTurn={endTurn} onCancelEnd={() => setConfirmEnd(false)} onConfirmEnd={() => void act({ type: 'endTurn', side: 'player' })} toolbar={<>{speedSelect}<ThroneButton disabled={!busy} onClick={skip}>演出スキップ</ThroneButton>{settingsButton}</>} log={log} presentation={{ ...activeSkill, cue, impact }} />}
  {screen === 'result' && state && <main className="story-screen result-screen" style={{ backgroundImage: 'url("./first-era/battle.jpg")' }}><Panel><h1>{state.end === 'player' ? '第一紀 踏破' : '敗北 — 拠点へ帰還'}</h1><p>決着ラウンド {state.round} ／ 英雄HP {state.actors.player.hp}</p><p>{state.end === 'player' ? '第二紀への進行は未実装です。初回勝利記録を保持して再戦できます。' : '同じ英雄で再挑戦できます。確定編成と進行は失われません。'}</p><ThroneButton onClick={() => void go(state.end === 'player' ? 'title' : 'hub')}>{state.end === 'player' ? 'タイトルに戻る' : '拠点へ戻る'}</ThroneButton><ThroneButton onClick={startBattle}>再戦する</ThroneButton></Panel></main>}
 </div>{warning && <p className="save-warning" role="alert">{warning}<button onClick={() => setWarning('')} aria-label="保存案内を閉じる">×</button></p>}
 {detail && <Modal title="スキル詳細" onClose={() => setDetail(null)}><SkillInformation skill={skillInfo(detail)} illustrated /></Modal>}
 {settings && <Modal title="設定" onClose={() => setSettings(false)}>{speedSelect}<p>専用音声は未実装です。演出速度はこのプレイ中に適用します。</p><ThroneButton onClick={() => { setSettings(false); setConfirm({ title: '最初からやり直す', text: '確定編成・初回勝利記録を初期化しますか？', accept: beginNew }); }}>最初からやり直す</ThroneButton></Modal>}
 {confirm && <Modal title={confirm.title} onClose={() => setConfirm(null)}><p>{confirm.text}</p><ThroneButton onClick={confirm.accept}>実行する</ThroneButton></Modal>}
 </div>;
}
