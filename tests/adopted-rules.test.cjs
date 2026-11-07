'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const B=require('../src/game/battle-engine.js'),D=require('../src/game/card-data.js'),P=require('../src/game/boss-planner.js'),G=require('../src/game/progression.js');
const state=()=>B.createState({playerDeck:['barrier','fortress','first_aid','setup','slash'],bossPresetId:'boss_knight_defense'});
test('D案：結界/堅守は使用翌自ターン不可、その次で再使用、他17枚CD維持',()=>{
 for(const id of ['barrier','fortress']){const s=state();s.actors.player.mana=5;B.execute(s,{type:'card',id});B.execute(s,{type:'endTurn'});B.execute(s,{type:'endTurn'});assert.equal(B.availability(s,'player',id).code,'cooldown');B.execute(s,{type:'endTurn'});B.execute(s,{type:'endTurn'});assert(B.availability(s,'player',id).allowed);}
 for(const c of require('./fixtures/first-era-cards.json').cards)assert.equal(D.CARDS[c.id].cd,['barrier','fortress'].includes(c.id)?1:c.cooldown_own_turns);
});
test('消耗：11R以前なし、12/14/16境界、両側、バリア無視、毒は終了時のまま',()=>{
 for(const round of [1,11,12,13,14,15,16,20,22])for(const side of ['player','boss']){
  const s=state(),other=B.other(side);s.round=round;s.active=other;s.firstSide=other;s.actors[side].hp=20;s.actors[side].barrier=50;
  const out=B.execute(s,{type:'endTurn'}),damage=B.exhaustionDamage(round);assert.equal(s.actors[side].hp,20-damage);const events=out.events.filter(e=>e.type==='environmentDamage');assert.equal(events.length,damage?1:0);if(damage){assert.equal(events[0].target,side);assert.equal(events[0].source,'environment');assert.equal(events[0].kind,'exhaustion');assert(!out.events.some(e=>e.type==='damage'));}
 }
 const s=state();s.actors.player.poison=2;B.execute(s,{type:'endTurn'});assert.equal(s.actors.player.hp,18);assert.equal(s.actors.player.poison,1);
 const t=state();t.round=13;t.active='boss';B.execute(t,{type:'endTurn'});assert.equal(t.round,14);assert.equal(t.actors.player.hp,18);
});
test('消耗致死では補充/加速/自ターン更新/行動を停止、AIも開始致死を認識',()=>{
 const s=state();s.round=12;s.actors.boss.hp=1;s.actors.boss.accelerationPending=true;const old=s.actors.boss.ownTurn,cap=s.actors.boss.manaCap;
 const plan=P.plan(s);const next=B.snapshot(s);for(const a of plan.actions)B.execute(next,a);if(!next.end)B.execute(next,{type:'endTurn'});assert.equal(next.end,'player');
 const out=B.execute(s,{type:'endTurn'});assert.equal(s.end,'player');assert.equal(s.endCause,'exhaustion');assert.equal(s.actors.boss.ownTurn,old);assert.equal(s.actors.boss.manaCap,cap);assert(s.actors.boss.accelerationPending);assert(!out.events.some(e=>e.type==='turn'));assert(!B.execute(s,{type:'card',id:'slash'}).ok);
});
test('再抽選：直前候補を避け、残りプールが少なくても重複/所持を返さない',()=>{
 const deck=G.starter('rush'),a=G.options(deck,()=>.5),b=G.options(deck,()=>.5,null,a);assert.equal(b.length,3);assert(!b.some(id=>a.includes(id)||deck.includes(id)));assert.equal(new Set(b).size,3);
 const almost=Object.keys(D.CARDS).slice(0,17),few=G.options(almost,()=>.5,null,Object.keys(D.CARDS));assert.equal(few.length,2);assert.equal(new Set(few).size,2);assert.deepEqual(G.options(Object.keys(D.CARDS)),[]);
 const full=Object.keys(D.CARDS).slice(0,5);assert(!G.replace(full,full[0],full[1]));assert(!G.replace(full,'unknown','curse'));assert(G.replace(full,full[0],'curse'));assert.equal(full.length,5);
});
test('研究のAI-2判断局面と本体が一致、入力不変、全手合法、即時勝利維持',()=>{
 for(const c of require('./fixtures/ai2-adopted-cases.json')){const before=B.snapshot(c.state),p=P.plan(c.state);assert.deepEqual(c.state,before);assert.deepEqual(p.actions,c.actions,`research case ${c.sourceIndex}`);const s=B.snapshot(c.state);for(const a of p.actions){assert(B.execute(s,a).ok);if(s.end)break;}}
 const s=state();s.actors.boss.hp=2;const p=P.plan(s);for(const a of p.actions)if(!s.end)B.execute(s,a);assert.equal(s.end,'player');
});
