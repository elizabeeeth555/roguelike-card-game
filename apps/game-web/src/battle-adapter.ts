// The only bridge to the existing core. No DOM, persistence, audio or platform API.
export type Side = 'player' | 'boss';
export interface Actor { hp: number; maxHp: number; mana: number; manaCap: number; deck: string[]; ownTurn: number; used: string[]; readyOn: Record<string, number>; barrier: number; poison: number }
export interface BattleState { round: number; active: Side; end: Side | null; actors: Record<Side, Actor> }
export interface Skill { id: string; name: string; cost: number; cd: number; description: string }
export type Action = { type: 'card'; side: Side; id: string } | { type: 'endTurn' | 'accelerate'; side: Side };
export interface BattleCore {
  createState(options: { bossPresetId: string }): BattleState;
  snapshot(state: BattleState): BattleState;
  transition(state: BattleState, action: Action): { state: BattleState; ok: boolean; reason?: string };
  availability(state: BattleState, side: Side, id: string): { allowed: boolean; reason: string; remaining?: number };
  accelerationStatus(state: BattleState, side: Side): { allowed: boolean; reason: string };
}
export interface Catalog { CARDS: Record<string, Skill>; BOSSES: { id: string; character_id: string; card_ids: string[] }[] }
export interface Planner { plan(state: BattleState): { actions: Action[] } }
export function createBattleAdapter(core: BattleCore, catalog: Catalog, planner: Planner) {
  return {
    create: () => core.createState({ bossPresetId: catalog.BOSSES[0].id }),
    skills: (state: BattleState, side: Side) => state.actors[side].deck.map(id => {
      const skill = catalog.CARDS[id];
      const status = core.availability(state, side, id);
      return { ...skill, allowed: status.allowed, reason: status.reason,
        remaining: Math.max(0, (state.actors[side].readyOn[id] ?? 0) - state.actors[side].ownTurn - (state.actors[side].used.includes(id) ? 1 : 0)) };
    }),
    accelerateStatus: (state: BattleState) => core.accelerationStatus(state, 'player'),
    act(state: BattleState, action: Action) {
      if (action.side !== 'player') return { state, message: 'プレイヤー操作のみ受け付けます' };
      const result = core.transition(state, action);
      if (!result.ok) return { state, message: result.reason ?? '使用不可' };
      let next = result.state;
      // Keep the existing AI-2 planner and reducer; the React host only advances the turn.
      if (!next.end && next.active === 'boss') {
        for (const planned of planner.plan(core.snapshot(next)).actions) {
          if (next.end || next.active !== 'boss') break;
          const step = core.transition(next, planned);
          if (!step.ok) return { state: next, message: step.reason ?? 'AI操作不可' };
          next = step.state;
        }
        if (!next.end && next.active === 'boss') next = core.transition(next, { type: 'endTurn', side: 'boss' }).state;
      }
      return { state: next, message: next.end ? `${next.end === 'player' ? 'プレイヤー' : 'ボス'}勝利` : '操作を反映しました' };
    }
  };
}
