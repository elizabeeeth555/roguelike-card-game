'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{spawnSync}=require('node:child_process');const Core=require('../dev/fx-lab/core.js');
test('FX Lab JSONは素材本体・URL・任意プロパティを含まず、A/Bを保持する',()=>{
 const model=Core.defaults();model.patterns.B.visual={kind:'local',format:'sequence',files:[{name:'frame01.png',size:120,lastModified:0,bytes:'PRIVATE'}]};model.patterns.B.sound={kind:'local',file:{name:'hit.wav',size:100,lastModified:0}};model.patterns.B.playback.audioDelayMs=-100;model.blob='blob:private';model.url='https://example.invalid';
 const safe=Core.normalize(model),text=JSON.stringify(safe);assert(!text.includes('PRIVATE'));assert(!text.includes('blob:'));assert(!text.includes('https:'));assert.deepEqual(Core.normalize(JSON.parse(text)),safe);assert.equal(safe.patterns.B.playback.audioDelayMs,-100);assert.notDeepEqual(safe.patterns.A,safe.patterns.B);
});
test('外部参照、壊れたJSON構造、範囲外・過大フレーム・不正真偽値を拒否',()=>{
 for(const mutate of [m=>m.version=2,m=>m.patterns.A.visual.id='https://invalid.test/fx.png',m=>m.patterns.A.playback.speed=0,m=>m.patterns.A.playback.speed='1',m=>m.patterns.A.playback.loop='false',m=>m.patterns.A.playback.frameCount=301,m=>m.patterns.A.playback.frameCount=17,m=>m.scene.boss='../../private']){const m=Core.defaults();mutate(m);assert.throws(()=>Core.normalize(m));}
 assert.throws(()=>Core.normalize(null));
});
test('素材時間基準のフレーム選択と正負SE遅延、音声/映像の長さを扱う',()=>{
 assert.equal(Core.frameAt([100,200,100],199,.5),0);assert.equal(Core.frameAt([100,200,100],200,.5),1);assert.equal(Core.frameAt([100,200,100],300,1),2);assert.equal(Core.frameAt([100,200,100],9999,1),2);
 assert.deepEqual(Core.timeline(700,300,100),{visualOffset:0,audioOffset:100,duration:700});assert.deepEqual(Core.timeline(700,300,-200),{visualOffset:200,audioOffset:0,duration:900});assert.deepEqual(Core.timeline(100,500,200),{visualOffset:0,audioOffset:200,duration:700});
 assert.deepEqual(Core.natural([{name:'f10.png'},{name:'f2.png'},{name:'f1.png'}]).map(x=>x.name),['f1.png','f2.png','f10.png']);
});
test('private-assetsをGit除外し、本編からFX Labへ依存を追加しない',()=>{
 for(const path of ['private-assets/vfx/paid.png','private-assets/sfx/paid.wav','private-assets/nested/archive.zip','foo.fx-lab.local.json'])assert.equal(spawnSync('git',['check-ignore','-q',path]).status,0,path);
 assert(!fs.readFileSync('index.html','utf8').includes('fx-lab'));assert(!fs.readFileSync('dev/fx-lab.html','utf8').includes('https://'));assert(fs.readFileSync('dev/fx-lab.html','utf8').includes("connect-src 'self' blob:"));
 const result=spawnSync(process.execPath,['--check','dev/fx-lab/lab.js']);assert.equal(result.status,0);for(const file of ['media.js','core.js'])assert.equal(spawnSync(process.execPath,['--check','dev/fx-lab/'+file]).status,0);
});

test('新しい命中演出と外部画像レイヤーは旧JSONを壊さずに保存・再読込できる',()=>{
 const old={schema:'keisei.fx-lab',version:1,name:'旧版',patterns:{A:{},B:{}}};
 const imported=Core.normalize(old);
 assert.equal(imported.patterns.A.layers.length,0);
 assert.equal(imported.patterns.A.playback.impact.damageText,'128');
 const model=Core.defaults();
 model.patterns.A.playback.impact.damageSize=72;
 model.patterns.A.playback.impact.damageFont='local';
 model.patterns.A.playback.impact.fontFile={name:'damage.woff2',size:350,lastModified:10};
 model.patterns.A.layers.push({
   label:'火花',enabled:true,visual:{kind:'local',format:'image',files:[{name:'spark.png',size:1600,lastModified:10}]},
   delayMs:120,x:14,y:-20,size:260,speed:.85,opacity:.75,rotation:15,flipX:false
 });
 const normalized=Core.normalize(model);
 assert.equal(normalized.patterns.A.layers[0].delayMs,120);
 assert.equal(normalized.patterns.A.playback.impact.damageSize,72);
 assert.deepEqual(Core.normalize(JSON.parse(JSON.stringify(normalized))),normalized);
 assert(!JSON.stringify(normalized).includes('data:'));
});
test('追加レイヤー数・素材参照・数値設定の不正値を拒否する',()=>{
 const layer={label:'火花',visual:{kind:'local',format:'image',files:[]}};
 for(const mutate of [
  m=>m.patterns.A.layers=Array(4).fill(layer),
  m=>m.patterns.A.layers=[{...layer,delayMs:-1}],
  m=>m.patterns.A.layers=[{...layer,opacity:1.5}],
  m=>m.patterns.A.layers=[{...layer,visual:{kind:'builtin',id:'slash'}}],
  m=>m.patterns.A.playback.impact.damageSize=999,
  m=>m.patterns.A.playback.impact.damageText='<script>',
  m=>m.patterns.A.playback.impact.damageColor='red'
 ]){const model=Core.defaults();mutate(model);assert.throws(()=>Core.normalize(model));}
});
