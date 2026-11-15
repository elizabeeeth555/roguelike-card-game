'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../../../src/game/battle-engine.js'),rules=require('../../../src/game/first-era-rules.js'),runtime={core,rules},deck=['heavy_slash','barrier','first_aid','battle_spirit','setup'];
test('turn confirmation excludes only ultimate, not legal card/acceleration; no mutation',async()=>{
 const {shouldConfirmTurnEnd:f}=await import('../src/first-era/turn-confirmation.ts');
 assert.equal(f([{type:'ultimate',side:'player'},{type:'endTurn',side:'player'}]),false);
 for(const type of ['card','accelerate'])assert.equal(f([{type,side:'player',id:'barrier'}]),true);
 let s=core.createState({ruleset:rules.RULESET,playerDeck:deck});s=core.transition(s,{type:'card',side:'player',id:'heavy_slash'}).state;s=core.transition(s,{type:'card',side:'player',id:'barrier'}).state;assert.equal(s.actors.player.mana,0);const copy=core.snapshot(s);assert.ok(core.ultimateStatus(s).allowed);assert.equal(f(core.legalActions(s)),false);assert.deepEqual(s,copy);
});
test('shared status presenter has seven entries, accurate current poison from core, zero states hidden',async()=>{
 const {statusEntries}=await import('../src/components/status-effects.ts'),{toFirstEraModel}=await import('../src/first-era/presentation.ts');
 const s=core.createState({ruleset:rules.RULESET,playerDeck:deck}),zero=statusEntries(s.actors.player);assert.deepEqual(zero,[]);
 Object.assign(s.actors.player,{barrier:3,poison:8,weak:2,attackBonus:3,setupBonus:2,manaPenalty:1,accelerationPending:true});const before=core.snapshot(s),m=toFirstEraModel(runtime,s,false,'');const entries=statusEntries(m.player);assert.equal(entries.length,7);assert.equal(new Set(entries.map(e=>e.id)).size,7);assert.equal(entries.find(e=>e.id==='poison').value,8);assert.ok(entries.find(e=>e.id==='poison').description.includes('現在の継続ダメージは6'));assert.ok(entries.every(e=>e.description));assert.deepEqual(s,before);
});
test('display states preserve used/CD exclusivity, shortage, condition and core permission',async()=>{
 const {skillDisplay:d}=await import('../src/components/skill-display.ts');assert.deepEqual(d({used:true,remaining:1,allowed:false,statusCode:'used'}),{state:'used',label:'使用済'});assert.equal(d({used:false,remaining:2,allowed:false,statusCode:'cooldown'}).state,'cooldown');for(const [code,state]of [['mana','mana'],['reference','condition'],['poison','condition'],['turn','locked']])assert.equal(d({used:false,remaining:0,allowed:false,statusCode:code}).state,state);assert.equal(d({used:false,remaining:0,allowed:true}).state,'ready');
 const {toFirstEraModel}=await import('../src/first-era/presentation.ts');const s=core.createState({ruleset:rules.RULESET,playerDeck:deck});s.actors.player.mana=0;const m=toFirstEraModel(runtime,s,false,'');assert.ok(m.player.skills.every(x=>x.statusCode==='mana'&&!x.allowed));assert.equal(toFirstEraModel(runtime,{...s,end:'boss'},true,'').ultimate.reason,'戦闘終了');
});

test('Studio fixtures use the same display state codes without adding game conditions',async()=>{
 const {createPreviewModel}=await import('../src/preview-presets.ts'),{skillDisplay}=await import('../src/components/skill-display.ts');const model=createPreviewModel('special');assert.deepEqual(model.player.skills.slice(0,4).map(skill=>skillDisplay(skill).state),['mana','cooldown','used','condition']);assert.ok(model.player.skills.every(s=>!s.allowed));
});
