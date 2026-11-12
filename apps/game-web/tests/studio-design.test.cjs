'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const load=()=>import('../src/studio/battle-design-editor.ts');
function memory(){const map=new Map([['game-progress','protected']]);return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};}
test('editor edits four whitelisted values, validates, autosaves, and resets to omitted CSS defaults',async()=>{
 const {createBattleDesignEditor,STUDIO_DESIGN_KEY}=await load(),storage=memory(),editor=createBattleDesignEditor(()=>storage);
 assert.deepEqual(editor.snapshot().design,{});
 for(const [key,value] of Object.entries({hudBackground:'#1234',skillBorderColor:'#abc',skillGap:'9',bossScale:'0.75'}))assert.equal(editor.update(key,value).error,null);
 const expected={hudBackground:'#1234',skillBorderColor:'#abc',skillGap:9,bossScale:.75};assert.deepEqual(editor.snapshot().design,expected);
 assert.deepEqual(createBattleDesignEditor(()=>storage).snapshot().design,expected);
 const saved=storage.map.get(STUDIO_DESIGN_KEY);
 for(const [key,value] of [['hudBackground','url(https://bad)'],['skillGap','-1'],['bossScale','Infinity'],['bossScale','0'],['skillGap',' '],['selector','body']]){
  assert.ok(editor.update(key,value).error);assert.deepEqual(editor.snapshot().design,expected);assert.equal(storage.map.get(STUDIO_DESIGN_KEY),saved);
 }
 assert.equal(storage.map.get('game-progress'),'protected');
 editor.reset('skillGap');assert.ok(!('skillGap' in editor.snapshot().design));editor.reset();assert.deepEqual(editor.snapshot().design,{});
 assert.deepEqual(JSON.parse(storage.map.get(STUDIO_DESIGN_KEY)).settings,{});
});
test('JSON roundtrip uses a versioned envelope; invalid imports preserve current settings and storage',async()=>{
 const {createBattleDesignEditor,designCodec,STUDIO_DESIGN_KEY}=await load(),storage=memory(),editor=createBattleDesignEditor(()=>storage);
 editor.update('skillGap','10');editor.update('bossScale','1.2');const text=editor.exportText(),document=JSON.parse(text);
 assert.equal(document.format,'throne-studio.battle-design');assert.equal(document.version,1);
 editor.reset();assert.equal(editor.importText(text).accepted,true);assert.deepEqual(editor.snapshot().design,document.settings);
 const before=editor.snapshot().design,saved=storage.map.get(STUDIO_DESIGN_KEY);
 for(const invalid of ['{','null','[]',JSON.stringify({...document,format:'fx-lab'}),JSON.stringify({...document,version:2}),JSON.stringify({...document,extra:'bad'}),JSON.stringify({...document,settings:{skillGap:99}}),JSON.stringify({...document,settings:{skillGap:'9'}}),JSON.stringify({...document,settings:{css:'display:none'}}),' '.repeat(32769)]){
  assert.equal(editor.importText(invalid).accepted,false);assert.deepEqual(editor.snapshot().design,before);assert.equal(storage.map.get(STUDIO_DESIGN_KEY),saved);
 }
 assert.throws(()=>designCodec.stringify({bossScale:Infinity}));
});
test('corrupt startup data is retained; unavailable storage does not prevent editing or exporting',async()=>{
 const {createBattleDesignEditor,STUDIO_DESIGN_KEY}=await load(),storage=memory();storage.map.set(STUDIO_DESIGN_KEY,'broken');
 const editor=createBattleDesignEditor(()=>storage);assert.ok(editor.snapshot().error);assert.equal(storage.map.get(STUDIO_DESIGN_KEY),'broken');
 editor.update('skillGap','8');storage.map.set(STUDIO_DESIGN_KEY,'broken again');const before=editor.snapshot().design;
 assert.ok(editor.reload().error);assert.deepEqual(editor.snapshot().design,before);
 const quota=createBattleDesignEditor(()=>({getItem:()=>null,setItem(){throw Error('quota');}}));
 assert.equal(quota.snapshot().error,null);assert.ok(quota.update('skillGap','7').error);assert.equal(quota.snapshot().design.skillGap,7);
 const blocked=createBattleDesignEditor(()=>{throw Error('blocked');});assert.ok(blocked.snapshot().error);
 const updated=blocked.update('bossScale','0.8');assert.equal(updated.design.bossScale,.8);assert.ok(updated.error);
 assert.equal(JSON.parse(blocked.exportText()).settings.bossScale,.8);
 const importing=blocked.importText(JSON.stringify({format:'throne-studio.battle-design',version:1,settings:{skillGap:5}}));
 assert.equal(importing.accepted,true);assert.equal(importing.design.skillGap,5);assert.ok(importing.error);
});
