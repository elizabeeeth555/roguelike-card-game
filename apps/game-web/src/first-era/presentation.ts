import type { Runtime, State, Action } from './core';
import type { BattleViewModel, SkillViewModel } from '../battle-view-model';
export function category(tags: string[]): string { return tags.includes('poison') || tags.includes('poison_reference') ? 'poison' : tags.includes('debuff') ? 'debuff' : tags.includes('defense') ? 'defense' : tags.includes('heal') ? 'heal' : tags.includes('buff') && !tags.includes('attack') ? 'buff' : 'attack'; }
export function toFirstEraModel(runtime: Runtime, state: State, busy: boolean, message: string): BattleViewModel {
 const { core, rules } = runtime;
 function skill(side: 'player' | 'boss', id: string): SkillViewModel {
  const spec = core.getCard(state, id), status = core.availability(state, side, id), inspection = core.availability({ ...state, active: side }, side, id);
  // Read-only core transition supplies actual current basic/HP damage, even when inspecting an unavailable skill.
  const probe = core.snapshot(state); probe.active = side; probe.end = null; probe.actors[side].mana = 5; probe.actors[side].used = []; probe.actors[side].readyOn = {};
  const preview = core.transition(probe, { type: 'card', side, id });
  const hit = preview.events.find(e => e.type === 'damage');
  const description = spec.description + (hit ? `（現在の威力${hit.baseDamage}／補正・バリア後のHPダメージ${hit.amount}）` : '');
  const used = state.active === side && state.actors[side].used.includes(id), remaining = inspection.remaining ?? 0;
  return { ...spec, description, category: category(spec.tags), allowed: !busy && status.allowed, reason: busy ? '演出中' : status.reason, remaining, used, stateLabel: used ? '使用済' : remaining ? `CD中 ${remaining}T` : status.code === 'mana' ? 'MP不足' : '', condition: 'MP・CD・自ターンの使用制限を満たす' };
 }
 const actor = (side: 'player' | 'boss') => ({ ...state.actors[side], name: side === 'boss' ? '灰鎖の老王' : '望郷の復讐者', facePlaceholder: side === 'player', skills: state.actors[side].deck.map(id => skill(side, id)), emptySlots: 0 });
 const echo = core.ultimateStatus(state), accel = core.accelerationStatus(state, 'player');
 const last = state.ultimate.lastSkillId ? rules.card(state.ultimate.lastSkillId).name : 'なし';
 return { layout: 'first-era', player: actor('player'), boss: { ...actor('boss'), portrait: './first-era/boss.png' }, background: './first-era/battle.jpg', round: state.round, turn: state.active === 'player' ? 'Player' : 'Old King', result: state.end ? state.end === 'player' ? '第一紀 踏破' : '敗北' : null, message,
  stance: `${state.bossState.stance === 'steadfast' ? '不退' : '断誓'}の構え${state.bossState.broken ? '・崩壊' : ''}`, breakGauge: state.bossState.gauge,
  ultimate: { id: rules.ultimate.id, name: rules.ultimate.name, cost: rules.ultimate.cost, cd: 0, category: 'buff', description: rules.ultimate.description + `。再演対象：${last}`, condition: 'この自ターンに通常スキルを使用・戦闘中1回', allowed: !busy && echo.allowed, reason: busy ? '演出中' : echo.reason, used: !state.ultimate.available, remaining: 0, stateLabel: !state.ultimate.available ? '使用済' : `再演：${last}` },
  controls: { accelerate: { allowed: !busy && accel.allowed, reason: accel.reason, label: 'マナ加速' }, endTurn: !busy && !state.end && state.active === 'player', reset: false } };
}
export function moveSkill(deck: string[], from: number, to: number) { const next = [...deck]; if (from < 0 || to < 0 || from >= next.length || to >= next.length) return next; const [id] = next.splice(from, 1); next.splice(to, 0, id); return next; }
export type { Action };
