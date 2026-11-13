import type { Event, State } from './core';

// Display projection only: consume resolved event amounts, never evaluate combat rules.
// The authoritative transition snapshot is always restored at each action boundary.
export function presentEvent(current: State, after: State, event: Event): State {
 const view = structuredClone(current), side = event.side, target = event.target;
 if ((event.type === 'card' || event.type === 'ultimate' || event.type === 'accelerate') && side) {
  const actor = view.actors[side], final = after.actors[side];
  actor.mana = final.mana; actor.used = [...final.used]; actor.readyOn = { ...final.readyOn };
  if (event.type === 'accelerate') { actor.accelerated = final.accelerated; actor.accelerationPending = final.accelerationPending; }
  if (side === 'player') view.ultimate = { ...after.ultimate };
 }
 if ((event.type === 'damage' || event.type === 'environmentDamage') && target) {
  view.actors[target].hp -= event.amount ?? 0;
  view.actors[target].barrier -= event.blocked ?? 0;
  if (event.kind === 'poison') view.actors[target].poison = after.actors[target].poison;
  else if (event.source === 'player' || event.source === 'boss') {
   const source = event.source;
   view.actors[source].attackBonus = after.actors[source].attackBonus;
   view.actors[source].weak = after.actors[source].weak;
   view.actors[source].attacks = [...after.actors[source].attacks];
  }
 }
 if (event.type === 'heal' && side) view.actors[side].hp += event.amount ?? 0;
 if (event.type === 'barrier' && side) view.actors[side].barrier += event.amount ?? 0;
 if (event.type === 'barrierExpired' && side) view.actors[side].barrier = after.actors[side].barrier;
 if (event.type === 'poisonApplied' && target) view.actors[target].poison = event.remaining!;
 if (event.type === 'weak' && target) view.actors[target].weak = event.remaining!;
 if (event.type === 'attackBonus' && side) view.actors[side].attackBonus = event.remaining!;
 if (event.type === 'setupBonus' && side) view.actors[side].setupBonus = event.remaining!;
 if (event.type === 'breakDamage') view.bossState.gauge += event.amount ?? 0;
 if (event.type === 'stanceBreak') view.bossState.broken = true;
 if (event.type === 'stanceChanged') view.bossState.stance = event.stance!;
 if (event.type === 'stanceReset') { view.bossState.gauge = after.bossState.gauge; view.bossState.broken = after.bossState.broken; }
 if (event.type === 'turn' && side) {
  view.active = after.active; view.round = after.round;
  const { hp, barrier, poison } = view.actors[side];
  view.actors[side] = { ...structuredClone(after.actors[side]), hp, barrier, poison };
  view.ultimate = { ...after.ultimate };
 }
 if (event.type === 'finish') view.end = after.end;
 return view;
}
export type ImpactKind = 'damage' | 'heal' | 'barrier' | 'state';
export interface Impact { target: 'player' | 'boss'; sequence: string; parts: { kind: ImpactKind; text: string }[] }
export function eventImpact(event: Event, sequence: string, stateText = event.type, barrierRemaining?: number): Impact | null {
 const target = event.target ?? event.side ?? 'boss';
 if (event.type === 'damage' || event.type === 'environmentDamage') {
  const parts: Impact['parts'] = [{ kind: 'damage', text: `${event.amount}ダメージ` }];
  if (event.blocked) parts.push({ kind: 'barrier', text: `バリア吸収 ${event.blocked}${barrierRemaining === 0 ? "／破壊" : ""}` });
  return { target, sequence, parts };
 }
 if (event.type === 'heal') return { target, sequence, parts: [{ kind: 'heal', text: `回復 +${event.amount}` }] };
 if (event.type === 'barrier' || event.type === 'barrierExpired') return { target, sequence, parts: [{ kind: 'barrier', text: event.type === 'barrier' ? `バリア +${event.amount}` : 'バリア消滅' }] };
 if (['poisonApplied', 'weak', 'stanceBreak'].includes(event.type)) return { target, sequence, parts: [{ kind: 'state', text: stateText }] };
 return null;
}
