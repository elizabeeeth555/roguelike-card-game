'use strict';

// Refactoring baseline: preserve both the opt-in first-era profile and classic callers.
const test = require('node:test');
const assert = require('node:assert/strict');
const Battle = require('../src/game/battle-engine.js');
const FirstEra = require('../src/game/first-era-rules.js');

const deck = ['slash', 'heavy_slash', 'barrier', 'first_aid', 'feint'];
const modern = () => Battle.createState({ ruleset: FirstEra.RULESET, playerDeck: deck });
const classic = () => Battle.createState({ ruleset: 'first-era-trial', playerDeck: ['slash'], bossPresetId: 'boss_knight_defense' });

test('profile boundary: first era and classic keep distinct state/schema/skill catalogs', () => {
  const first = modern();
  const old = classic();
  assert.deepEqual(
    [first.ruleset, first.schemaVersion, first.bossPresetId, first.actors.player.maxHp, first.actors.boss.maxHp],
    ['first-era-v1', 4, 'ashen_king', 34, 40]
  );
  assert.deepEqual(
    [old.ruleset, old.schemaVersion, old.bossPresetId, old.actors.player.maxHp, old.actors.boss.maxHp],
    ['first-era-trial', 2, 'boss_knight_defense', 20, 20]
  );
  assert.equal(first.actors.player.mana, 3);
  assert.equal(old.actors.player.mana, 2);
  assert.equal(Battle.getCard(first, 'first_era_corrosion').id, 'first_era_corrosion');
  assert.equal(Battle.getCard(old, 'first_era_corrosion'), undefined);
  assert.equal(old.bossState, undefined);
  assert.equal(first.bossState.charging, false);
  assert.deepEqual(Battle.restore(Battle.snapshot(first)), first);
  assert.deepEqual(Battle.restore(Battle.snapshot(old)), old);
  assert.throws(() => Battle.restore({ ...Battle.snapshot(first), schemaVersion: 2 }));
});

test('core contract: legal transitions are immutable; mutable execute has equivalent result', () => {
  for (const state of [modern(), classic()]) {
    const before = Battle.snapshot(state);
    const action = { type: 'card', side: 'player', id: 'slash' };
    assert.ok(Battle.legalActions(state).some(candidate => JSON.stringify(candidate) === JSON.stringify(action)));
    const step = Battle.transition(state, action);
    assert.equal(step.ok, true);
    assert.deepEqual(state, before);
    assert.notStrictEqual(step.state, state);
    const mutable = Battle.snapshot(state);
    const executed = Battle.execute(mutable, action);
    assert.equal(executed.ok, true);
    assert.deepEqual(mutable, step.state);
    assert.deepEqual(executed.events, step.events);
    const invalid = Battle.transition(state, { type: 'card', side: 'boss', id: 'slash' });
    assert.equal(invalid.ok, false);
    assert.deepEqual(invalid.state, before);
    assert.deepEqual(state, before);
    const detached = Battle.restore(Battle.snapshot(state));
    detached.actors.player.hp = 1;
    assert.deepEqual(state, before);
  }
});

test('first-era event/legality trace remains stable through warning and forced finisher', () => {
  const initial = modern();
  const card = Battle.transition(initial, { type: 'card', side: 'player', id: 'slash' });
  assert.deepEqual(card.events, [
    { type: 'card', side: 'player', id: 'slash' },
    {
      type: 'damage', source: 'player', target: 'boss', id: 'slash',
      replay: false, baseDamage: 2, rawAmount: 2, adjustedAmount: 2,
      amount: 2, blocked: 0, kind: 'attack'
    }
  ]);
  assert.equal(card.state.actors.boss.hp, 38);
  assert.equal(initial.actors.boss.hp, 40);

  const bossOne = Battle.transition(card.state, { type: 'endTurn', side: 'player' });
  assert.equal(bossOne.ok, true);
  const warning = Battle.transition(bossOne.state, { type: 'endTurn', side: 'boss' });
  assert.equal(warning.ok, true);
  assert.deepEqual(warning.events.map(event => event.type), ['turn', 'bossWarning']);
  assert.equal(warning.events.at(-1).bossTurn, 2);
  assert.equal(warning.state.bossState.charging, true);

  const bossTwo = Battle.transition(warning.state, { type: 'endTurn', side: 'player' });
  assert.equal(bossTwo.ok, true);
  assert.deepEqual(Battle.legalActions(bossTwo.state), [
    { type: 'ability', side: 'boss', id: FirstEra.bossAbility.id }
  ]);
  const skipped = Battle.transition(bossTwo.state, { type: 'endTurn', side: 'boss' });
  assert.equal(skipped.ok, false);
  assert.deepEqual(skipped.state, bossTwo.state);

  const finisher = Battle.transition(bossTwo.state, Battle.legalActions(bossTwo.state)[0]);
  assert.equal(finisher.ok, true);
  assert.deepEqual(finisher.events.map(event => event.type), ['bossAbility', 'damage']);
  assert.equal(finisher.events[1].kind, 'ability');
  assert.equal(finisher.events[1].amount, 8);
  assert.equal(finisher.state.actors.player.hp, 26);
  assert.deepEqual(Battle.legalActions(finisher.state), [{ type: 'endTurn', side: 'boss' }]);
  assert.equal(Battle.snapshot(bossTwo.state).bossState.charging, true);
});

test('classic event shape and boss actions do not inherit first-era ability rules', () => {
  const state = classic();
  const step = Battle.transition(state, { type: 'card', side: 'player', id: 'slash' });
  assert.equal(step.ok, true);
  assert.deepEqual(step.events, [
    { type: 'card', side: 'player', id: 'slash' },
    { type: 'damage', source: 'player', target: 'boss', amount: 2, blocked: 0, kind: 'attack' }
  ]);
  assert.equal(step.state.actors.boss.hp, 18);
  assert.equal(Battle.bossAbilityStatus(state).allowed, false);
  assert.ok(!Battle.legalActions(state).some(action => action.type === 'ability' || action.type === 'ultimate'));
});
