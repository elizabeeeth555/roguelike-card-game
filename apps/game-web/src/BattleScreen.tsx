import { useEffect, useRef, useState } from 'react';
import type { Action, BattleAdapter, Side } from './battle-adapter';
import { createBattleSession } from './battle-session';
import { SkillCard } from './components/SkillCard';
import { BattleHUD } from './components/BattleHUD';
import { BattleField } from './components/BattleField';
import { SkillDetail, SkillTooltip } from './components/SkillDetail';
import { ConfirmDialog } from './components/ConfirmDialog';

export function BattleScreen({ adapter }: { adapter: BattleAdapter }) {
  const [session] = useState(() => createBattleSession(adapter));
  const [view, setView] = useState(session.view);
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [inspection, setInspection] = useState<{ side: Side; id: string; anchor: HTMLElement } | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const inFlight = useRef(false);
  const { state, revision } = view;
  function act(action: Action) {
    if (inFlight.current) return;
    inFlight.current = true;
    try { setView(session.dispatch(action, revision)); setSelected(null); setInspection(null); setConfirmEnd(false); }
    finally { inFlight.current = false; }
  }
  function endTurn() {
    setInspection(null);
    if (adapter.hasRemainingActions(state)) setConfirmEnd(true);
    else act({ type: 'endTurn', side: 'player' });
  }
  function reset() { setView(session.reset()); setSelected(null); setInspection(null); setConfirmEnd(false); }
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) { setInspection(null); return; }
      if (document.querySelector('dialog[open]') || (event.target instanceof HTMLElement && event.target.closest('button,input,textarea,select'))) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < state.actors.player.deck.length) { setInspection(null); setSelected({ side: 'player', id: state.actors.player.deck[index] }); event.preventDefault(); }
      if (event.code === 'Space' && !state.end) { endTurn(); event.preventDefault(); }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  const selectedSkill = selected && adapter.skills(state, selected.side).find(skill => skill.id === selected.id);
  const inspectedSkill = inspection && adapter.skills(state, inspection.side).find(skill => skill.id === inspection.id);
  function skillRow(side: Side) {
    return <div className={`skills ${side}-skills`} aria-label={side === 'player' ? 'プレイヤースキル' : '敵スキル'}>{adapter.skills(state, side).map(skill => <SkillCard key={skill.id} {...skill} compact={side === 'boss'}
      inspected={inspection?.side === side && inspection.id === skill.id}
      selected={selected?.side === side && selected.id === skill.id}
      onSelect={() => { setInspection(null); setSelected({ side, id: skill.id }); }}
      onInspect={anchor => { if (!selected && !confirmEnd) setInspection({ side, id: skill.id, anchor }); }} onDismiss={() => setInspection(null)} />)}{side === 'player' && Array.from({ length: Math.max(0, 5 - state.actors.player.deck.length) }, (_, index) => <div key={`empty-${index}`} className="empty-skill-slot" aria-label="未習得スキル枠">未習得</div>)}</div>;
  }
  const result = state.end ? state.end === 'player' ? '勝利' : '敗北' : null;
  return <main className="battle-screen" style={{ backgroundImage: 'linear-gradient(#07101c70,#07101c50),url("./scene/background.webp")' }}>
    <header className="battle-header"><h1>継世の王座 <small>React戦闘UI検証</small></h1><button onClick={reset}>再戦</button></header>
    <section className="enemy-area" aria-label="敵情報"><BattleHUD label="蒼鋼の守護騎士" {...state.actors.boss} />{skillRow('boss')}</section>
    <BattleField portrait="./scene/boss.png" name="蒼鋼の守護騎士" round={state.round} turn={state.active === 'player' ? 'YOUR TURN' : 'ENEMY TURN'} result={result} />
    <section className="player-area" aria-label="プレイヤー領域"><BattleHUD label="夜刃の剣士" face="./scene/face.png" {...state.actors.player} />
      <div className="player-skill-set">{skillRow('player')}<div className="legacy-slot" aria-label="継承専用スキル 未解放">継承専用<br />未解放</div></div>
      <nav className="battle-controls" aria-label="戦闘操作"><button disabled={!adapter.accelerateStatus(state).allowed} title={adapter.accelerateStatus(state).reason} onClick={() => act({ type: 'accelerate', side: 'player' })}>♦ マナ加速 <small>2MP</small></button><button disabled={!!state.end} onClick={endTurn}>ターン終了</button></nav>
    </section>
    <p className="battle-message" role="status">{result ? `${result} — 再戦できます` : view.message}</p>
    {inspection && inspectedSkill && !selected && !confirmEnd && <SkillTooltip skill={inspectedSkill} anchor={inspection.anchor} placement={inspection.side === 'player' ? 'above' : 'below'} />}
    {selected && selectedSkill && <SkillDetail skill={selectedSkill} canUse={selected.side === 'player' && selectedSkill.allowed} onUse={selected.side === 'player' ? () => act({ type: 'card', side: 'player', id: selected.id }) : undefined} onClose={() => { setSelected(null); setInspection(null); }} />}
    {confirmEnd && <ConfirmDialog mana={state.actors.player.mana} onCancel={() => { setConfirmEnd(false); setInspection(null); }} onConfirm={() => act({ type: 'endTurn', side: 'player' })} />}
  </main>;
}
