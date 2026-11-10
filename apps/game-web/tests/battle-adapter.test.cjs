'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../../../src/game/battle-engine.js');
const catalog=require('../../../src/game/card-data.js');
const planner=require('../../../src/game/boss-planner.js');
const load=()=>import('../src/battle-adapter.ts');
test('adapter uses existing initial rules and performs identical legal transition without mutating input',async()=>{
 const {createBattleAdapter}=await load(),adapter=createBattleAdapter(core,catalog,planner),state=adapter.create(),before=core.snapshot(state);
 assert.equal(state.actors.player.hp,20);assert.equal(state.actors.player.mana,2);assert.equal(state.actors.player.manaCap,3);
 const action=core.legalActions(state).find(a=>a.type==='card');
 const expected=core.transition(state,action),actual=adapter.act(state,action);
 assert.deepEqual(actual.state,expected.state);assert.deepEqual(state,before);
 assert.ok(actual.state.actors.boss.hp<state.actors.boss.hp);
 assert.equal(adapter.act(actual.state,action).state,actual.state);
});
test('view metadata and AI turn match original engine; reset is independent',async()=>{
 const {createBattleAdapter}=await load(),adapter=createBattleAdapter(core,catalog,planner),state=adapter.create();
 for(const skill of adapter.skills(state,'player')){
  assert.equal(skill.name,catalog.CARDS[skill.id].name);assert.equal(skill.cost,catalog.CARDS[skill.id].cost);assert.equal(skill.cd,catalog.CARDS[skill.id].cd);
 }
 let expected=core.transition(state,{type:'endTurn',side:'player'}).state;
 for(const action of planner.plan(core.snapshot(expected)).actions){if(expected.end||expected.active!=='boss')break;expected=core.transition(expected,action).state;}
 if(!expected.end&&expected.active==='boss')expected=core.transition(expected,{type:'endTurn',side:'boss'}).state;
 assert.deepEqual(adapter.act(state,{type:'endTurn',side:'player'}).state,expected);
 assert.equal(adapter.act(state,{type:'card',side:'boss',id:'slash'}).state,state);
 assert.deepEqual(adapter.create(),state);
});
