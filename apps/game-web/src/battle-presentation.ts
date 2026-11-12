import type { BattleAdapter, BattleState } from './battle-adapter';
import type { BattleViewModel, CharacterViewModel, ViewSide } from './battle-view-model';

// Game-host projection: copy explicit display fields, never pass actors/decks/revisions to the view.
export function toBattleViewModel(adapter: BattleAdapter, state: BattleState, message: string): BattleViewModel {
  const character = (side: ViewSide, name: string): CharacterViewModel => {
    const actor = state.actors[side];
    return {
      name, hp: actor.hp, maxHp: actor.maxHp, mana: actor.mana, manaCap: actor.manaCap,
      barrier: actor.barrier, poison: actor.poison, weak: actor.weak,
      attackBonus: actor.attackBonus, setupBonus: actor.setupBonus, manaPenalty: actor.manaPenalty,
      accelerationPending: actor.accelerationPending,
      skills: adapter.skills(state, side).map(({ id, name, cost, cd, description, condition, allowed, reason, remaining, used, stateLabel }) =>
        ({ id, name, cost, cd, description, condition, allowed, reason, remaining, used, stateLabel })),
      emptySlots: side === 'player' ? Math.max(0, 5 - actor.deck.length) : 0
    };
  };
  const result = state.end ? state.end === 'player' ? '勝利' : '敗北' : null;
  return {
    player: { ...character('player', '夜刃の剣士'), face: './scene/face.png' },
    boss: { ...character('boss', '蒼鋼の守護騎士'), portrait: './scene/boss.png' },
    background: './scene/background.webp', round: state.round,
    turn: state.active === 'player' ? 'YOUR TURN' : 'ENEMY TURN', result,
    message: result ? `${result} — 再戦できます` : message,
    controls: { accelerate: { ...adapter.accelerateStatus(state), label: '♦ マナ加速' }, endTurn: !state.end, reset: true }
  };
}
