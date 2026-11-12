'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const src=path.resolve(__dirname,'../src');
test('host projection preserves core-owned permissions and detaches display data',async()=>{
 const {createBattleAdapter}=await import('../src/battle-adapter.ts');
 const {toBattleViewModel}=await import('../src/battle-presentation.ts');
 const core=require('../../../src/game/battle-engine.js'),catalog=require('../../../src/game/card-data.js'),planner=require('../../../src/game/boss-planner.js');
 const adapter=createBattleAdapter(core,catalog,planner),state=adapter.create(),before=core.snapshot(state);
 const model=toBattleViewModel(adapter,state,'test message');
 assert.equal(model.message,'test message');assert.equal(model.player.emptySlots,3);
 for(const side of ['player','boss']){
  for(const skill of model[side].skills)assert.equal(skill.allowed,core.availability(state,side,skill.id).allowed);
  assert.ok(!('deck' in model[side]));assert.ok(!('readyOn' in model[side]));
 }
 model.player.skills[0].name='changed';assert.equal(catalog.CARDS.slash.name,'斬撃');assert.deepEqual(state,before);
 const pending=adapter.act(state,{type:'accelerate',side:'player'}).state;
 assert.equal(toBattleViewModel(adapter,pending,'').player.accelerationPending,true);
 const next=adapter.act(pending,{type:'endTurn',side:'player'}).state;
 assert.equal(toBattleViewModel(adapter,next,'').player.accelerationPending,false);
});
test('normal/special presets work with no engine globals and do not share mutable data',async()=>{
 const {createPreviewModel}=await import('../src/preview-presets.ts');
 assert.equal(global.GameBattle,undefined);assert.equal(global.GamePlanner,undefined);
 const normal=createPreviewModel('normal'),special=createPreviewModel('special');
 assert.equal(normal.player.skills.length+normal.player.emptySlots,5);
 assert.equal(special.player.skills.length,5);assert.equal(special.player.emptySlots,0);
 assert.ok(special.player.skills.some(s=>s.used));assert.ok(special.player.skills.some(s=>s.remaining>0));
 assert.ok(special.player.skills.some(s=>s.stateLabel==='MP不足'));
 assert.equal(special.controls.endTurn,false);assert.equal(normal.controls.reset,false);
 normal.player.skills[0].name='changed';assert.notEqual(createPreviewModel('normal').player.skills[0].name,'changed');
});
test('design whitelist validates four inputs, preserves defaults and rejects CSS injection',async()=>{
 const {battleDesignStyle}=await import('../src/battle-design.ts');
 for(const input of [undefined,null,[],false,'bad',{}, {hudBackground:'url(https://example.com)',skillBorderColor:'red;display:none',skillGap:NaN,bossScale:Infinity,selector:'body',css:'display:none'}])assert.deepEqual(battleDesignStyle(input),{});
 assert.deepEqual(battleDesignStyle({hudBackground:'#1234',skillBorderColor:'#abcdef',skillGap:8,bossScale:.8}),{'--battle-hud-background':'#1234','--battle-skill-border':'#abcdef','--battle-skill-gap':'8px','--battle-boss-scale':'0.8'});
 for(const key of ['skillGap','bossScale'])for(const value of [-1,'1',100,NaN,Infinity])assert.deepEqual(battleDesignStyle({[key]:value}),{});
 const input={skillGap:0,bossScale:1.25,extra:'ignored'},before={...input};
 assert.equal(battleDesignStyle(input)['--battle-skill-gap'],'0px');assert.deepEqual(input,before);
 assert.deepEqual(battleDesignStyle(),{});
});
test('shared view dependency graph cannot import game hosts or core; both entries use the same view',()=>{
 const visited=new Set();
 function visit(file){if(visited.has(file))return;visited.add(file);const text=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(text,/GameBattle|GamePlanner|createBattleSession|from ['"].*(?:battle-adapter|battle-session|battle-presentation|BattleScreen)/);
  for(const match of text.matchAll(/(?:import|export)\s+(?!type\b)[^;]*?from\s+['"](\.[^'"]+)['"]/g)){
   const base=path.resolve(path.dirname(file),match[1]);const next=[base,...['.ts','.tsx'].map(ext=>base+ext)].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());if(next)visit(next);
  }
 }
 visit(path.join(src,'BattleView.tsx'));visit(path.join(src,'preview-main.tsx'));
 assert.match(fs.readFileSync(path.join(src,'BattleScreen.tsx'),'utf8'),/<BattleView\b/);
 assert.match(fs.readFileSync(path.join(src,'preview-main.tsx'),'utf8'),/<StudioScreen\b/);
 assert.match(fs.readFileSync(path.join(src,'studio/StudioScreen.tsx'),'utf8'),/<BattleView\b/);
});
