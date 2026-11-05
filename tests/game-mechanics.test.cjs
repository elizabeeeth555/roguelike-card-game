'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const GameMath = require('../src/game/combat-math.js');
const GamePlanner = require('../src/game/boss-planner.js');

function cardData() {
  // Card data is a classic script to keep index.html directly openable in file://.
  const sandbox = {};
  vm.runInNewContext(readFileSync(join(__dirname, '../src/game/card-data.js'), 'utf8') +
    '\n globalThis.__cards = { RULES, LIB, POOLS, STARTERS, ROUTE, ROUTES, routeForEra, upgradeGrade, hasUpgraded, effectSummary, upgradePreview };', sandbox);
  return sandbox.__cards;
}

test('回復：最大HPを超えず、回復量を正しく返す', () => {
  assert.deepEqual(GameMath.resolveHeal(35, 42, 10), { healed: 7, nextHp: 42 });
  assert.deepEqual(GameMath.resolveHeal(42, 42, 10), { healed: 0, nextHp: 42 });
  assert.deepEqual(GameMath.resolveHeal(12, 52, 3), { healed: 3, nextHp: 15 });
});

test('ダメージ：軽減・弱体・半分貫通・完全貫通が従来どおり動く', () => {
  assert.deepEqual(GameMath.resolveDamage({ base: 9, guard: 6 }), { damage: 3, blocked: 6, nextGuard: 0 });
  assert.deepEqual(GameMath.resolveDamage({ base: 9, weak: 2, guard: 6 }), { damage: 1, blocked: 6, nextGuard: 0 });
  assert.deepEqual(GameMath.resolveDamage({ base: 9, guard: 6, ignoreGuard: true }), { damage: 9, blocked: 0, nextGuard: 6 });
  assert.deepEqual(GameMath.resolveDamage({ base: 9, guard: 6, guardPierce: .5 }), { damage: 5, blocked: 4, nextGuard: 2 });
  assert.deepEqual(GameMath.resolveDamage({ base: 3, weak: 6, guard: 4 }), { damage: 0, blocked: 0, nextGuard: 4 });
});

test('毒：再付与で4層まで蓄積し、持続を更新する', () => {
  const first = GameMath.applyPoison({ stacks: 0, turns: 0, dmg: 0 }, 3, 2);
  assert.deepEqual(first, { stacks: 1, dmg: 3, turns: 2 });
  assert.deepEqual(GameMath.applyPoison(first, 3, 2), { stacks: 2, dmg: 6, turns: 2 });
  assert.deepEqual(GameMath.applyPoison({ stacks: 4, turns: 1, dmg: 12 }, 5, 3), { stacks: 4, dmg: 20, turns: 3 });
  assert.equal(first.stacks, 1, '入力オブジェクトを直接変更しない');
});

test('切り札：使用済みは再使用不可・次戦闘の未使用カードは使用可', () => {
  const { LIB } = cardData();
  const c = { id: 'laststand', key: 's1', lv: 0, trait: false };
  const st = { playerOneShots: new Set(['s1']), bossOneShots: new Set(), bossPoison: { turns: 0 }, playerPoison: { turns: 0 }, playerBlockedPrev: 0, bossBlockedPrev: 0 };
  assert.equal(GameMath.canPlayCard(c, 'player', st, LIB), false);
  assert.equal(GameMath.canPlayCard(c, 'boss', st, LIB), true);
  assert.equal(GameMath.canPlayCard(c, 'player', { ...st, playerOneShots: new Set() }, LIB), true);
});

test('劇毒開花：毒状態だけで使用可能、返礼は軽減が必要', () => {
  const { LIB } = cardData();
  const st = { playerOneShots: new Set(), bossOneShots: new Set(), bossPoison: { turns: 0 }, playerPoison: { turns: 0 }, playerBlockedPrev: 0, bossBlockedPrev: 0 };
  assert.equal(GameMath.canPlayCard({ id:'venombloom', key:'v', trait:false }, 'player', st, LIB), false);
  st.bossPoison.turns = 2;
  assert.equal(GameMath.canPlayCard({ id:'venombloom', key:'v', trait:false }, 'player', st, LIB), true);
  assert.equal(GameMath.canPlayCard({ id:'return', key:'r', trait:false }, 'player', st, LIB), false);
  st.playerBlockedPrev = 1;
  assert.equal(GameMath.canPlayCard({ id:'return', key:'r', trait:false }, 'player', st, LIB), true);
});

test('敵AI：スコア優先で使用し、ラウンドのマナ予算を超えない', () => {
  const cards = [ { key:'a', cost:2, score:11 }, { key:'b', cost:1, score:15 }, { key:'c', cost:1, score:12 } ];
  const result = GamePlanner.chooseCards(cards, 2, c=>c.score, c=>c.cost, ()=>true);
  assert.deepEqual(result, ['b','c']);
  assert.deepEqual(cards.map(c=>c.key), ['a','b','c'], '元デッキの順番は変えない');
  assert.deepEqual(GamePlanner.chooseCards(cards, 3, c=>c.score,c=>c.cost,c=>c.key!=='b'), ['c','a']);
  const manaLoop=[{key:'pulse',cost:1,score:20,refund:2},{key:'strike',cost:2,score:10,refund:0}];
  assert.deepEqual(GamePlanner.chooseCards(manaLoop,1,c=>c.score,c=>c.cost,()=>true,c=>c.refund),['pulse','strike']);
});

test('カード効果の表示：強化前後・刻印・劇毒開花が計算できる', () => {
  const { LIB, effectSummary, upgradePreview } = cardData();
  assert.equal(Object.keys(LIB).length, 26);
  assert.match(effectSummary({ id:'slash',lv:1,trait:false }), /攻撃力\+2/);
  assert.match(upgradePreview({ id:'slash',lv:0,trait:false }, false), /変更後：攻撃力\+2/);
  assert.match(upgradePreview({ id:'guard',lv:0,trait:false }, true), /追加効果/);
  assert.match(effectSummary({ id:'venombloom',lv:0,trait:false }), /毒の層数/);
});


test('周回：第一紀は強化なし／第二紀は強化／第三紀は改',()=>{
  const { ROUTES, upgradeGrade, hasUpgraded, POOLS, STARTERS, upgradePreview }=cardData();
  assert.equal(ROUTES[1].filter(x=>x==='upgrade'||x==='special').length,0);
  assert.equal(upgradeGrade(1),0);assert.equal(upgradeGrade(2),1);assert.equal(upgradeGrade(3),2);
  assert.equal(hasUpgraded({lv:0,trait:false}),false);
  assert.equal(hasUpgraded({lv:1,trait:false}),true);
  assert.equal(hasUpgraded({lv:0,trait:true}),true);
  assert.match(upgradePreview({id:'slash',lv:0,trait:false},false,3),/攻撃力\+4/);
  assert.equal(STARTERS[3].length,3);
  assert.equal(POOLS[3].length,8);
  assert.equal(POOLS[3].some(id=>POOLS[2].includes(id)||POOLS[1].includes(id)),false);
});

test('敵初回マナ補正：初回のみ2マナ、以後は通常進行',()=>{
  assert.equal(GameMath.bossTurnMana(1),2);
  assert.equal(GameMath.bossTurnMana(2),2);
  assert.equal(GameMath.bossTurnMana(3),3);
  assert.equal(GameMath.bossTurnMana(5),5);
});
