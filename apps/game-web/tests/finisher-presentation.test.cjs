'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../../../src/game/battle-engine.js'),rules=require('../../../src/game/first-era-rules.js'),runtime={core,rules},deck=['slash','heavy_slash','barrier','feint','first_aid'];
test('shared view uses resolved charge/ability data; event display stays in core order',async()=>{
 const {toFirstEraModel}=await import('../src/first-era/presentation.ts'),{presentEvent,eventImpact}=await import('../src/first-era/event-presentation.ts');
 let s=core.createState({ruleset:rules.RULESET,playerDeck:deck});s=core.transition(s,{type:'endTurn',side:'player'}).state;
 const turn=core.transition(s,{type:'endTurn',side:'boss'});let view=core.snapshot(s);for(const e of turn.events){view=presentEvent(view,turn.state,e);if(e.type==='turn')assert.equal(view.bossState.charging,false);if(e.type==='bossWarning')assert.equal(toFirstEraModel(runtime,view,true,'').bossAbility.charging,true);}assert.equal(toFirstEraModel(runtime,turn.state,false,'').stance,undefined);assert.equal(toFirstEraModel(runtime,turn.state,false,'').breakGauge,undefined);
 s=core.transition(turn.state,{type:'endTurn',side:'player'}).state;s.actors.player.barrier=3;const step=core.transition(s,{type:'ability',side:'boss',id:rules.bossAbility.id}),original=structuredClone(step);view=core.snapshot(s);
 for(const e of step.events){const hp=view.actors.player.hp;view=presentEvent(view,step.state,e);if(e.type==='bossAbility'){assert.equal(view.bossState.charging,false);assert.equal(view.actors.player.hp,hp);}if(e.type==='damage'){assert.equal(view.actors.player.hp,hp-e.amount);assert.ok(eventImpact(e,'test').parts.some(p=>p.kind==='barrier'));}}
 assert.deepEqual(view.bossState,step.state.bossState);assert.equal(view.actors.player.hp,step.state.actors.player.hp);assert.deepEqual(step,original);
 const ended={...step.state,end:'boss',bossState:{...step.state.bossState,charging:false}};view.bossState.charging=true;assert.equal(presentEvent(view,ended,{type:'finish'}).bossState.charging,false);
});
