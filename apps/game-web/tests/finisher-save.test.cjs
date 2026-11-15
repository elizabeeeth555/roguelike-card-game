'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../../../src/game/battle-engine.js'),rules=require('../../../src/game/first-era-rules.js'),runtime={core,rules};
test('only known first-era v1 save is retired; v2 deck persists; unrelated data survives',async()=>{
 const {SAVE_KEY,createSaveRepository,freshSave}=await import('../src/first-era/save.ts');
 const data=new Map([[SAVE_KEY,JSON.stringify({format:'keisei-first-era',version:1,deck:['old'],firstWin:{old:true}})],['throne.studio.design','untouched'],['classic-settings','untouched']]);
 const port={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},repo=createSaveRepository(()=>port,runtime);
 const loaded=repo.load();assert.equal(loaded.save,null);assert.equal(loaded.exists,false);assert.ok(loaded.error.includes('初期化'));assert.equal(data.has(SAVE_KEY),false);assert.equal(data.size,2);
 const save={...freshSave(),deck:['slash','heavy_slash','barrier','first_aid','feint']};assert.equal(save.version,2);assert.equal(repo.write(save),'');assert.deepEqual(repo.load().save,save);assert.equal(data.get('classic-settings'),'untouched');assert.equal(data.get('throne.studio.design'),'untouched');
 data.set(SAVE_KEY,JSON.stringify({format:'other',version:1}));assert.equal(repo.load().exists,true);assert.ok(data.has(SAVE_KEY));
});
