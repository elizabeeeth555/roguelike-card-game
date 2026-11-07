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
