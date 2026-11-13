import type { Actor, Skill, Side } from '../battle-adapter';
export type Action = { type: 'card'; side: Side; id: string } | { type: 'ultimate' | 'accelerate' | 'endTurn'; side: Side };
export interface State { schemaVersion: number; ruleset: string; round: number; active: Side; end: Side | null; actors: Record<Side, Actor & { accelerated: boolean; attacks: string[] }>; bossState: { stance: string; gauge: number; broken: boolean }; ultimate: { available: boolean; lastSkillId: string | null } }
export interface Event { type: string; side?: Side; source?: Side; target?: Side; id?: string; kind?: string; amount?: number; blocked?: number; baseDamage?: number; rawAmount?: number; adjustedAmount?: number; remaining?: number; stance?: string; winner?: Side }
export interface Frame { sequence: number; action: Action; events: Event[]; after: State }
export interface RecordWin { deck: string[]; initial: State; frames: Frame[]; result: State }
export interface Core {
 createState(options: { ruleset: string; playerDeck: string[] }): State;
 snapshot(state: State): State; restore(value: unknown): State;
 transition(state: State, action: Action): { state: State; ok: boolean; reason?: string; events: Event[] };
 legalActions(state: State): Action[];
 availability(state: State, side: Side, id: string): { allowed: boolean; reason: string; remaining?: number; code?: string };
 ultimateStatus(state: State, side?: Side): { allowed: boolean; reason: string };
 accelerationStatus(state: State, side: Side): { allowed: boolean; reason: string };
 getCard(state: State, id: string): Skill;
}
export interface Rules { RULESET: string; pool: string[]; validateDeck(deck: string[]): string[]; card(id: string): Skill; ultimate: Pick<Skill, 'id' | 'name' | 'cost' | 'description'> }
export interface Planner { plan(state: State): { actions: Action[] } }
export interface Runtime { core: Core; rules: Rules; planner: Planner }
export function eventText(e: Event, runtime: Runtime): string {
 const who = e.side === 'boss' || e.source === 'boss' ? '老王' : '英雄';
 const name = e.id ? runtime.rules.card(e.id)?.name ?? e.id : '';
 switch (e.type) {
  case 'card': return `${who}：${name}`; case 'ultimate': return `戦技の残響：${name}を再演`;
  case 'damage': return `${e.target === 'boss' ? '老王' : '英雄'}：${e.kind === 'poison' ? '毒 ' : ''}${e.amount}ダメージ${e.blocked ? `／バリア吸収${e.blocked}` : ''}`;
  case 'barrier': return `${who}：バリア +${e.amount}`; case 'heal': return `${who}：回復 ${e.amount}`;
  case 'poisonApplied': return `毒 +${e.amount}（残数${e.remaining}）`; case 'weak': return `弱体 +${e.amount}`;
  case 'attackBonus': return `攻撃強化 +${e.amount}`; case 'setupBonus': return `次ターン強化 +${e.amount}`;
  case 'breakDamage': return `崩し +${e.amount}`; case 'stanceBreak': return '構えを崩した！';
  case 'stanceChanged': return e.stance === 'rupture' ? '断誓の構え' : '不退の構え';
  case 'stanceReset': return '崩しゲージをリセット';
  case 'flashTriggered': return '断誓一閃 発動！'; case 'flashPrevented': return '断誓一閃 阻止！';
  case 'turn': return `${who}のターン`; case 'accelerate': return `${who}：マナ加速予約`;
  case 'barrierExpired': return 'バリアが消滅'; case 'environmentDamage': return `消耗 ${e.amount}`;
  case 'finish': return e.winner === 'player' ? '第一紀 踏破' : '敗北 — 同じ英雄で再挑戦できます';
  default: return e.type;
 }
}
