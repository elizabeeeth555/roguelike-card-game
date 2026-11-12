'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),B=require('./engine.cjs'),P=require('./planner.cjs'),{simulate}=require('./simulator.cjs');
test('seeded finite planner is reproducible and emits only legal sequential operations',()=>{
 const deck=['slash','heavy_slash','barrier','corrosion','r_venom_blade'];
 const a=simulate(deck,{seed:3}),b=simulate(deck,{seed:3});for(const key of Object.keys(a).filter(k=>k!=='aiMs'))assert.deepEqual(a[key],b[key]);
 const s=B.create(deck),original=B.clone(s),plan=P.plan(s);assert.deepEqual(s,original);
 for(const action of plan.actions){assert.ok(B.allowed(s,action));B.execute(s,action);if(s.end)break;}
});
test('trace frames match deterministic reducer replay',()=>{
 const result=simulate(['corrosion','plague','barrier','r_poison_release','r_venom_blade'],{seed:1,trace:true});
 const s=B.clone(result.initial);for(const frame of result.log){const out=B.execute(s,frame.action);assert.deepEqual(out.events,frame.events);assert.deepEqual(s.actors.player,frame.player);assert.deepEqual(s.actors.boss,frame.boss);}
});
