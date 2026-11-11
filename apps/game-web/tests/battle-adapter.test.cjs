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
test('core owns permission, CD/used display and poison/mana conditions',async()=>{
 const {createBattleAdapter}=await load(),adapter=createBattleAdapter(core,catalog,planner);
 let state=core.createState({playerDeck:['slash','barrier','battle_spirit','heart_corrosion','great_swing'],bossPresetId:catalog.BOSSES[0].id});
 const at=id=>adapter.skills(state,'player').find(s=>s.id===id);
 assert.equal(at('heart_corrosion').stateLabel,'条件未達');assert.equal(at('great_swing').stateLabel,'MP不足');
 state=core.transition(state,{type:'card',side:'player',id:'barrier'}).state;
 assert.equal(at('barrier').stateLabel,'使用済');assert.equal(at('barrier').used,true);
 state=core.transition(state,{type:'endTurn',side:'player'}).state;
 assert.equal(at('barrier').stateLabel,'CD中（残1T）');assert.equal(at('barrier').used,false);assert.equal(at('barrier').allowed,false);
 const before=core.snapshot(state);
 for(const side of ['player','boss'])for(const s of adapter.skills(state,side))assert.equal(s.allowed,core.availability(state,side,s.id).allowed);
 assert.deepEqual(state,before);
 state=core.transition(state,{type:'endTurn',side:'boss'}).state;
 assert.equal(at('barrier').stateLabel,'CD中（残1T）');
 state=core.transition(state,{type:'endTurn',side:'player'}).state;
 state=core.transition(state,{type:'endTurn',side:'boss'}).state;
 assert.equal(at('barrier').stateLabel,'');assert.equal(at('barrier').allowed,true);
});
test('turn confirmation checks legal cards or acceleration, not spare mana alone',async()=>{
 const {createBattleAdapter}=await load(),adapter=createBattleAdapter(core,catalog,planner);
 const state=core.createState({playerDeck:['great_swing'],bossPresetId:catalog.BOSSES[0].id});
 assert.equal(adapter.hasRemainingActions(state),true); // 2 MP allows acceleration
 state.actors.player.manaCap=5;
 assert.equal(adapter.hasRemainingActions(state),false); // 2 MP cannot use great swing or accelerate
 state.actors.player.mana=3;assert.equal(adapter.hasRemainingActions(state),true);
 state.end='boss';assert.equal(adapter.hasRemainingActions(state),false);
});
test('revision-bound commands reject double/stale input and old commands after replay',async()=>{
 const {createBattleAdapter}=await load(),{createBattleSession}=await import('../src/battle-session.ts');
 const session=createBattleSession(createBattleAdapter(core,catalog,planner)),initial=session.view();
 const first=session.dispatch({type:'card',side:'player',id:'slash'},initial.revision);
 assert.equal(first.state.actors.player.mana,1);
 assert.deepEqual(session.dispatch({type:'card',side:'player',id:'slash'},initial.revision),first);
 const replay=session.reset();assert.equal(replay.state.actors.boss.hp,20);
 assert.deepEqual(session.dispatch({type:'endTurn',side:'player'},first.revision),replay);
 assert.equal(initial.state.actors.player.mana,2);
});
test('CD0 clears used display off-turn; CD2 and terminal labels come from core availability',async()=>{
 const {createBattleAdapter}=await load(),adapter=createBattleAdapter(core,catalog,planner);
 let state=core.createState({playerDeck:['slash','battle_spirit'],bossPresetId:catalog.BOSSES[0].id});
 state=core.transition(state,{type:'card',side:'player',id:'battle_spirit'}).state;
 assert.equal(adapter.skills(state,'player').find(s=>s.id==='battle_spirit').stateLabel,'使用済');
 state=core.transition(state,{type:'card',side:'player',id:'slash'}).state;
 state=core.transition(state,{type:'endTurn',side:'player'}).state;
 assert.equal(adapter.skills(state,'player').find(s=>s.id==='slash').stateLabel,'');
 assert.equal(adapter.skills(state,'player').find(s=>s.id==='battle_spirit').stateLabel,'CD中（残2T）');
 state.end='boss';
 for(const s of adapter.skills(state,'player')){assert.equal(s.stateLabel,'戦闘終了');assert.equal(s.allowed,false);}
});
test('acceleration pending is preserved for view props and cleared by the core next turn',async()=>{
 const {createBattleAdapter}=await load(),adapter=createBattleAdapter(core,catalog,planner),initial=adapter.create();
 assert.equal(initial.actors.player.accelerationPending,false);
 const pending=adapter.act(initial,{type:'accelerate',side:'player'}).state;
 assert.equal(pending.actors.player.accelerationPending,true);
 assert.equal(pending.actors.player.manaCap,3);assert.equal(pending.actors.player.mana,0);
 const next=adapter.act(pending,{type:'endTurn',side:'player'}).state;
 assert.equal(next.active,'player');assert.equal(next.actors.player.accelerationPending,false);
 assert.equal(next.actors.player.manaCap,4);assert.equal(next.actors.player.mana,4);
 assert.equal(initial.actors.player.accelerationPending,false);
});
