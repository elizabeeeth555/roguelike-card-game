import { createRoot } from 'react-dom/client';
import { FirstEraApp } from './FirstEraApp';
import type { Runtime } from './core';
import '../styles.css';
import './first-era.css';
const globals = window as unknown as { GameBattle: Runtime['core']; GameFirstEraRules: Runtime['rules']; GamePlanner: Runtime['planner'] };
const runtime: Runtime = { core: globals.GameBattle, rules: globals.GameFirstEraRules, planner: globals.GamePlanner };
createRoot(document.getElementById('root')!).render(runtime.core && runtime.rules && runtime.planner ? <FirstEraApp runtime={runtime} storage={() => localStorage} /> : <p role="alert">戦闘コアを読み込めません。</p>);
