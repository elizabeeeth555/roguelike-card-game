'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),B=require('./engine.cjs'),Old=require('../first-era-poison-replay/engine.cjs'),{poisonTick,poisonFuture}=require('./poison-rules.cjs'),{simulate}=require('./simulator.cjs'),oldSim=require('../first-era-poison-replay/simulator.cjs'),{decks,config}=require('./conditions.cjs');
test('four formulas, zero, caps, uncapped duration and pre-decrement example',()=>{
 for(const mode of ['A','B','C','D'])assert.equal(poisonTick(0,mode),0);
 assert.deepEqual([4,3,2,1].map(n=>poisonTick(n,'C')),[4,3,2,2]);assert.equal(poisonFuture(4,'C'),11);
 assert.equal(poisonTick(20,'D'),6);assert.equal(poisonTick(20,'C'),4);assert.equal(poisonTick(2,'B'),3);
 for(const n of [-1,NaN,Infinity,1.5])assert.throws(()=>poisonTick(n));assert.throws(()=>poisonTick(1,'unknown'));
});
test('poison bypasses barrier/stance, ticks before decrement, does not add break gauge',()=>{
 for(const mode of ['A','B','C','D']){const s=B.create(decks.poison_stack,{...config,poisonMode:mode});s.active='boss';s.actors.boss.poison=4;s.actors.boss.barrier=7;const before=s.old.gauge;
 B.execute(s,{type:'endTurn',side:'boss'});assert.equal(s.actors.boss.hp,20-poisonTick(4,mode));assert.equal(s.actors.boss.poison,3);assert.equal(s.actors.boss.barrier,7);assert.equal(s.old.gauge,before);}
});
test('thrust failure and success require HP passage; poison/replay duration adds above caps',()=>{
 const s=B.create(decks.thrust_defense,config);B.execute(s,{type:'card',side:'player',id:'r_poison_thrust'});assert.equal(s.actors.boss.poison,0);
 const t=B.create(decks.thrust_defense,config);t.old.broken=true;t.actors.boss.barrier=1;B.execute(t,{type:'card',side:'player',id:'r_poison_thrust'});assert.equal(t.actors.boss.poison,0);
 const u=B.create(decks.thrust_defense,config);u.old.broken=true;B.execute(u,{type:'card',side:'player',id:'r_poison_thrust'});assert.equal(u.actors.boss.poison,1);
 const v=B.create(decks.poison_stack,config);v.actors.boss.poison=10;B.execute(v,{type:'card',side:'player',id:'corrosion'});B.execute(v,{type:'ultimate',side:'player'});assert.equal(v.actors.boss.poison,14);
});
test('fixed2 engine transitions match previous reducer except explicit research identity/config',()=>{
 const a=B.create(decks.previous_poison,config),b=Old.create(decks.previous_poison,config);
 for(const action of [{type:'card',side:'player',id:'corrosion'},{type:'card',side:'player',id:'barrier'},{type:'endTurn',side:'player'},{type:'card',side:'boss',id:'slash'},{type:'endTurn',side:'boss'}]){assert.deepEqual(B.execute(a,action),Old.execute(b,action));assert.deepEqual(a.actors,b.actors);assert.deepEqual(a.old,b.old);}
});
test('fixed2 legacy planner reproduces previous deterministic simulation fields',()=>{
 for(const deck of [decks.previous_attack,decks.previous_poison,decks.blade_defense])for(const seed of [1,7,24]){
 const now=simulate(deck,{config,seed}),old=oldSim.simulate(deck,{config,seed});for(const [k,v]of Object.entries(old))if(!['aiMs','config'].includes(k))assert.deepEqual(now[k],v,k);
 }
});
test('bounded opening enumeration is exhaustive over the legal first-turn tree and never mutates input',()=>{
 const {enumerate}=require('./openings.cjs'),s=B.create(decks.poison_stack,config),before=B.clone(s),lines=enumerate(s);assert.ok(lines.length>1);assert.deepEqual(s,before);
 const signatures=new Set();for(const line of lines){const t=B.clone(s);for(const a of line)assert.equal(B.execute(t,a).ok,true);assert.notEqual(t.active,'player');signatures.add(JSON.stringify(line));}assert.equal(signatures.size,lines.length);
 const expected=B.legal(s).length;assert.equal(new Set(lines.map(l=>JSON.stringify(l[0]))).size,expected);
});
