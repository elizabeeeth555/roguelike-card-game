'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),B=require('./engine.cjs');
const base=['slash','heavy_slash','barrier','corrosion','r_poison_release'];
const act=(s,id)=>B.execute(s,{type:'card',side:s.active,id});
const ult=s=>B.execute(s,{type:'ultimate',side:'player'});
const end=s=>B.execute(s,{type:'endTurn',side:s.active});
test('five distinct normal slots and an independent once-per-battle ultimate',()=>{
 assert.throws(()=>B.create([...base,'setup']));assert.throws(()=>B.create(['slash','slash',...base.slice(2)]));
 const s=B.create(base,{openingMP:3});assert.equal(ult(s).ok,false);act(s,'slash');
 const mana=s.actors.player.mana,used=[...s.actors.player.used],ready={...s.actors.player.readyOn};
 assert.equal(ult(s).ok,true);assert.equal(s.actors.player.mana,mana-1);assert.deepEqual(s.actors.player.used,used);assert.deepEqual(s.actors.player.readyOn,ready);assert.equal(ult(s).ok,false);
});
test('replay reference survives acceleration but never the end of the own turn',()=>{
 const s=B.create(base);s.actors.player.manaCap=4;s.actors.player.mana=4;act(s,'slash');B.execute(s,{type:'accelerate',side:'player'});assert.equal(s.hero.last,'slash');assert.ok(ult(s).ok);
 const t=B.create(base);act(t,'slash');end(t);end(t);assert.equal(t.hero.last,null);assert.equal(ult(t).ok,false);
});
test('stance break attack remains reduced; replay is a new direct attack and flash is prevented',()=>{
 const s=B.create(base,{openingMP:3});const first=act(s,'heavy_slash');assert.equal(s.actors.boss.hp,19);assert.equal(s.old.broken,true);
 const replay=ult(s);assert.equal(replay.events.find(e=>e.type==='damage').amount,4);assert.equal(s.actors.boss.hp,15);
 assert.ok(end(s).events.some(e=>e.type==='flashPrevented'));end(s);assert.equal(s.old.stance,'rupture');
 const t=B.create(base);act(t,'slash');assert.ok(end(t).events.some(e=>e.type==='flashTriggered'));end(t);act(t,'heavy_slash');assert.equal(t.actors.boss.hp,14);
});
test('new poison is fixed two, additive, unbounded, bypasses barriers and decrements after damage',()=>{
 const s=B.create(base);s.actors.boss.poison=100;act(s,'corrosion');assert.equal(s.actors.boss.poison,102);
 s.actors.boss.barrier=9;end(s);const out=end(s);assert.equal(s.actors.boss.hp,18);assert.equal(s.actors.boss.poison,101);assert.equal(s.old.gauge,0);assert.ok(out.events.some(e=>e.kind==='poison'&&e.amount===2));
});
test('poison thrust requires actual HP penetration, not a blocked or rounded-to-zero hit',()=>{
 for(const kind of ['guard','barrier','hp']){const s=B.create(['r_poison_thrust',...base.slice(1)]);if(kind!=='guard')s.old.broken=true;if(kind==='barrier')s.actors.boss.barrier=5;act(s,'r_poison_thrust');assert.equal(s.actors.boss.poison,kind==='hp'?1:0);}
});
test('a thrust replay can apply poison after the original thrust breaks guard with zero HP damage',()=>{
 const s=B.create(['r_poison_thrust',...base.slice(1)],{openingMP:3});s.old.gauge=3;
 act(s,'r_poison_thrust');assert.equal(s.actors.boss.poison,0);assert.equal(s.old.broken,true);
 ult(s);assert.equal(s.actors.boss.hp,19);assert.equal(s.actors.boss.poison,1);
});
test('blade rounding, consuming and replay recalculate from current remaining poison',()=>{
 for(const rounding of ['floor','ceil']){const s=B.create(['r_venom_blade',...base.slice(1)],{bladeRounding:rounding,bladeConsume:1,bladeCost:1,openingMP:3});s.old.broken=true;s.actors.boss.poison=5;act(s,'r_venom_blade');assert.equal(s.actors.boss.hp,20-(rounding==='floor'?3:4));assert.equal(s.actors.boss.poison,4);const replay=ult(s);assert.equal(replay.events.find(e=>e.type==='damage').amount,3);assert.equal(s.actors.boss.poison,3);}
});
test('release purges poison; replay ignores the vanished condition and deals recomputed zero',()=>{
 const s=B.create(base);s.old.broken=true;s.actors.player.mana=5;s.actors.boss.poison=6;act(s,'r_poison_release');assert.equal(s.actors.boss.hp,14);assert.equal(s.actors.boss.poison,0);assert.ok(ult(s).ok);assert.equal(s.actors.boss.hp,14);
});
test('replayed buff stacks, attacks consume current buffs once; no snapshot reuse',()=>{
 const s=B.create(['battle_spirit','slash',...base.slice(2)],{openingMP:3});act(s,'battle_spirit');ult(s);assert.equal(s.actors.player.attackBonus,6);const out=act(s,'slash');assert.equal(out.events.find(e=>e.type==='damage').raw,8);assert.equal(s.actors.player.attackBonus,0);
 const t=B.create(base,{openingMP:3});t.actors.player.attackBonus=3;t.old.broken=true;act(t,'slash');const r=ult(t);assert.equal(r.events.find(e=>e.type==='damage').raw,2);
});
test('replayed order-dependent skills recalculate rather than copying original damage',()=>{
 const s=B.create(['dash_slash',...base.slice(1)],{openingMP:3});s.old.broken=true;act(s,'dash_slash');assert.equal(s.actors.boss.hp,17);ult(s);assert.equal(s.actors.boss.hp,16);
 const t=B.create(['follow_up',...base.slice(1)],{openingMP:3});t.old.broken=true;act(t,'follow_up');ult(t);assert.equal(t.actors.boss.hp,16);
});
test('poison/barrier end-order variants and history variants do not mutate source states',()=>{
 const s=B.create(base);s.actors.boss.poison=2;s.actors.player.barrier=3;const a=B.transition(s,{type:'endTurn',side:'player'});assert.equal(s.active,'player');assert.equal(a.state.active,'boss');
 const t=B.clone(a.state);const u=B.clone(t);u.c.endOrder='barrier-first';end(t);end(u);assert.equal(t.actors.boss.hp,u.actors.boss.hp);
});
test('exhaustion is applied before boss flash and lethal poison ends immediately',()=>{
 const s=B.create(base);s.round=12;s.actors.boss.hp=1;const r=end(s);assert.equal(s.end,'player');assert.equal(s.endCause,'exhaustion');assert.ok(!r.events.some(e=>e.type==='flashTriggered'));
 const t=B.create(base);t.actors.player.hp=2;t.actors.player.poison=1;end(t);assert.equal(t.end,'boss');assert.equal(t.endCause,'poison');assert.equal(t.active,'player');
});
test('non-poison neutral research reducer matches production state transitions',()=>{
 const Core=require('../../src/game/battle-engine.js');const deck=['slash','heavy_slash','barrier','first_aid','battle_spirit'];
 let s=B.create(deck,{neutral:true,ultimate:false}),p=Core.createState({playerDeck:deck,bossPresetId:'boss_knight_defense'});p.actors.boss.deck=[...s.actors.boss.deck];
 let seed=17;for(let i=0;i<70&&!s.end;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const actions=B.legal(s),a=actions[seed%actions.length];const out=Core.transition(p,a);assert.ok(out.ok);B.execute(s,a);p=out.state;
  assert.deepEqual(s.actors,p.actors);assert.equal(s.active,p.active);assert.equal(s.round,p.round);assert.equal(s.end,p.end);
 }
});
