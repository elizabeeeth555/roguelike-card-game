import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBattleAdapter } from './battle-adapter';
import type { BattleCore, Catalog, Planner, Action } from './battle-adapter';
import { HealthBar } from './components/HealthBar';
import { SkillCard } from './components/SkillCard';
import './styles.css';

declare global { interface Window { GameBattle?: BattleCore; GameData?: Catalog; GamePlanner?: Planner } }
const host = document.getElementById('root')!;
const { GameBattle, GameData, GamePlanner } = window;
if (!GameBattle || !GameData || !GamePlanner) {
  createRoot(host).render(<main><h1>継世の王座 — 技術検証</h1><p role="alert">戦闘コアを読み込めませんでした。サーバーとengineファイルを確認してください。</p></main>);
} else {
  const adapter = createBattleAdapter(GameBattle, GameData, GamePlanner);
  function App() {
    const [state, setState] = useState(adapter.create);
    const [selected, setSelected] = useState<string | null>(null);
    const [message, setMessage] = useState('現行公開版とは独立した技術検証画面です。');
    const skills = adapter.skills(state, 'player');
    const current = skills.find(skill => skill.id === selected);
    function act(action: Action) {
      const result = adapter.act(state, action);
      setState(result.state); setMessage(result.message); setSelected(null);
    }
    return <main><header><h1>継世の王座</h1><p>React戦闘基盤・技術検証／王を討て。そして、王となれ。</p></header>
      <p aria-live="polite">ラウンド {state.round} · {state.end ? '戦闘終了' : state.active === 'player' ? 'プレイヤーターン' : 'ボスターン'}</p>
      {(['boss', 'player'] as const).map(side => { const actor = state.actors[side]; const label = side === 'player' ? 'プレイヤー' : 'ボス'; return <section key={side} aria-label={label}><h2>{label}</h2><HealthBar label={label} value={actor.hp} maximum={actor.maxHp} /><p>MP {actor.mana} / {actor.manaCap} · 自ターン {actor.ownTurn} · バリア {actor.barrier} · 毒 {actor.poison}</p>
        <div className="skills">{adapter.skills(state, side).map(skill => <SkillCard key={skill.id} {...skill} selected={side === 'player' && selected === skill.id} onSelect={side === 'player' ? () => setSelected(skill.id) : undefined} />)}</div></section>; })}
      {current && <aside aria-label="選択中スキル"><h2>{current.name}</h2><p>{current.description}</p><button disabled={!current.allowed} onClick={() => act({ type: 'card', side: 'player', id: current.id })}>使用する</button><button onClick={() => setSelected(null)}>閉じる</button></aside>}
      <nav aria-label="戦闘操作"><button disabled={!adapter.accelerateStatus(state).allowed} onClick={() => act({ type: 'accelerate', side: 'player' })}>マナ加速</button><button disabled={!!state.end} onClick={() => act({ type: 'endTurn', side: 'player' })}>ターン終了</button><button onClick={() => { setState(adapter.create()); setSelected(null); setMessage('初期状態に戻しました'); }}>再戦</button></nav><p role="status">{message}</p>
    </main>;
  }
  createRoot(host).render(<StrictMode><App /></StrictMode>);
}
