'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const Core=require('../dev/fx-lab/core.js');
test('旧FX Lab v1 JSONとの互換性を維持し命中演出・レイヤーの既定値を補う',()=>{
 const legacy={schema:'keisei.fx-lab',version:1,name:'以前の設定',scene:{boss:'02_heavy_knight'},patterns:{A:{},B:{}}};
 const parsed=Core.normalize(legacy);
 assert.equal(parsed.patterns.A.playback.impact.hitStopMs,50);
 assert.equal(parsed.patterns.A.playback.impact.damageFont,'impact');
 assert.deepEqual(parsed.patterns.B.layers,[]);
});
test('追加エフェクトは各パターン最大3つ、位置・タイミング・透過などをJSONに安全に保存',()=>{
 const m=Core.defaults();
 m.patterns.B.layers=[
  {label:'火花',visual:{kind:'local',format:'image',files:[{name:'spark.webp',size:1024,lastModified:0,privateBytes:'DO-NOT-COPY'}]},delayMs:110,x:15,y:-30,opacity:.5,size:170},
  {label:'衝撃波',visual:{kind:'local',format:'sheet',files:[{name:'burst.png',size:2048,lastModified:0}]},columns:4,rows:4,frameCount:12,fps:24}
 ];
 m.patterns.A.playback.impact={damageText:'9999',damageSize:82,damageFont:'serif',damageStrokePx:4};
 const safe=Core.normalize(m),json=JSON.stringify(safe);
 assert.equal(safe.patterns.B.layers.length,2);
 assert.equal(safe.patterns.B.layers[0].delayMs,110);
 assert.equal(safe.patterns.B.layers[1].frameCount,12);
 assert.equal(safe.patterns.A.playback.impact.damageSize,82);
 assert(!json.includes('DO-NOT-COPY'));
 assert.deepEqual(Core.normalize(JSON.parse(json)),safe);
});
test('不正なフォント指定とレイヤー数・不正な外部素材URLなどを拒否',()=>{
 const m=Core.defaults();m.patterns.A.layers=Array(4).fill({visual:{kind:'local',format:'image',files:[]}});
 assert.throws(()=>Core.normalize(m));
 const n=Core.defaults();n.patterns.A.layers=[{visual:{kind:'builtin',id:'slash'}}];
 assert.throws(()=>Core.normalize(n));
 const p=Core.defaults();p.patterns.A.playback.impact.damageText='<img>';assert.throws(()=>Core.normalize(p));
 const q=Core.defaults();q.patterns.A.layers=[{delayMs:3000}];assert.throws(()=>Core.normalize(q));
});
test('本編と独立した開発ページからオーバーレイと命中演出の制御スクリプトを読み込む',()=>{
 const html=fs.readFileSync('dev/fx-lab.html','utf8');
 assert(html.includes('fx-lab/impact.js'));assert(html.includes('fx-lab/layers.js'));
 assert(html.includes('id="layerControls"'));assert(html.includes('id="damagePreview"'));
 assert(!fs.readFileSync('index.html','utf8').includes('fx-lab/layers.js'));
});
