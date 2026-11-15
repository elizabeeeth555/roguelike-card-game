'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const B=require('../src/game/battle-engine.js'),R=require('../src/game/first-era-rules.js'),AI=require('../src/game/boss-planner.js');
const deck=['slash','heavy_slash','barrier','first_aid','feint'],create=()=>B.createState({ruleset:R.RULESET,playerDeck:deck});
const act=(s,a)=>{const r=B.execute(s,{side:s.active,...a});assert.ok(r.ok,r.reason);return r;},end=s=>act(s,{type:'endTurn'});
function boss2(){const s=create();end(s);const warning=end(s);assert.equal(warning.events.at(-1).type,'bossWarning');assert.equal(warning.events.at(-1).bossTurn,2);assert.equal(s.bossState.charging,true);end(s);return s;}
test('B2/5/8/11 replace every normal action; warning only at preceding hero start',()=>{
 const s=create();s.actors.player.hp=s.actors.player.maxHp=1000;const flashes=[],warnings=[];
 while(s.actors.boss.ownTurn<12){if(s.active==='boss'&&B.bossAbilityStatus(s).allowed){const p=AI.plan(s);assert.deepEqual(p.actions,[{type:'ability',side:'boss',id:R.bossAbility.id}]);const before=B.snapshot(s);assert.equal(B.availability(s,'boss','slash').code,'ability');assert.equal(B.accelerationStatus(s,'boss').code,'ability');assert.equal(B.execute(s,{type:'endTurn',side:'boss'}).ok,false);assert.deepEqual(s,before);const r=act(s,p.actions[0]);flashes.push(s.actors.boss.ownTurn);assert.equal(r.events[0].type,'bossAbility');assert.deepEqual(B.legalActions(s),[{type:'endTurn',side:'boss'}]);assert.equal(B.execute(s,p.actions[0]).ok,false);}
 const r=end(s);warnings.push(...r.events.filter(e=>e.type==='bossWarning').map(e=>e.bossTurn));assert.ok(!r.events.some(e=>/stance|break|flash/i.test(e.type)));}
 assert.deepEqual(flashes,[2,5,8,11]);assert.deepEqual(warnings,[2,5,8,11]);
});
test('ability MP0, no CD/used/attack record; shared damage, weak, bonus and barrier once',()=>{
 const s=boss2();s.actors.boss.mana=0;s.actors.boss.weak=2;s.actors.boss.attackBonus=3;s.actors.player.barrier=3;const before=B.snapshot(s.actors.boss),r=act(s,{type:'ability',id:R.bossAbility.id}),hit=r.events[1];assert.equal(hit.baseDamage,8);assert.equal(hit.rawAmount,9);assert.equal(hit.amount,6);assert.equal(hit.blocked,3);assert.equal(hit.kind,'ability');assert.equal(s.actors.boss.mana,0);for(const k of ['deck','used','readyOn','attacks'])assert.deepEqual(s.actors.boss[k],before[k]);assert.equal(s.actors.boss.weak,0);assert.equal(s.actors.boss.attackBonus,0);assert.equal(s.bossState.charging,false);
 s.actors.boss.poison=4;const hp=s.actors.boss.hp;end(s);assert.equal(s.actors.boss.hp,hp-4);assert.equal(s.actors.boss.poison,3);assert.equal(s.active,'player');
});
test('charge clears on either lethal result, exhaustion before ability, no premature damage',()=>{
 const s=create();const hp=s.actors.player.hp;end(s);assert.equal(s.actors.player.hp,hp);assert.equal(B.bossAbilityStatus(s).code,'notDue');assert.equal(B.execute(s,{type:'ability',side:'boss',id:R.bossAbility.id}).ok,false);
 const a=boss2();a.actors.player.hp=2;act(a,{type:'ability',id:R.bossAbility.id});assert.equal(a.end,'boss');assert.equal(a.bossState.charging,false);assert.deepEqual(B.legalActions(a),[]);
 const b=create();end(b);end(b);b.actors.boss.hp=1;act(b,{type:'card',id:'slash'});assert.equal(b.end,'player');assert.equal(b.bossState.charging,false);
 const c=create();c.round=12;c.actors.boss.hp=1;end(c);assert.equal(c.end,'player');assert.equal(c.endCause,'exhaustion');assert.equal(c.bossState.charging,false);
});
test('new schema rejects old first-era snapshots; classic schema remains unchanged',()=>{
 const s=boss2();assert.equal(s.schemaVersion,4);assert.deepEqual(B.restore(B.snapshot(s)),s);const old=B.snapshot(s);old.schemaVersion=3;assert.throws(()=>B.restore(old));const legacy=B.createState();assert.equal(legacy.schemaVersion,2);assert.deepEqual(B.restore(legacy),legacy);
});
