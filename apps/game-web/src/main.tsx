import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBattleAdapter } from './battle-adapter';
import type { BattleCore, Catalog, Planner } from './battle-adapter';
import { BattleScreen } from './BattleScreen';
import './styles.css';

declare global { interface Window { GameBattle?: BattleCore; GameData?: Catalog; GamePlanner?: Planner } }
const host = document.getElementById('root')!;
const { GameBattle, GameData, GamePlanner } = window;
if (!GameBattle || !GameData || !GamePlanner) {
  createRoot(host).render(<main><h1>継世の王座 — 技術検証</h1><p role="alert">戦闘コアを読み込めませんでした。サーバーとengineファイルを確認してください。</p></main>);
} else {
  const adapter = createBattleAdapter(GameBattle, GameData, GamePlanner);
  createRoot(host).render(<StrictMode><BattleScreen adapter={adapter} /></StrictMode>);
}
