'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const Core=require('../dev/fx-lab/core.js');

test('旧FX Lab v1 JSONは追加SEなしで読み込める',()=>{
 const legacy={schema:'keisei.fx-lab',version:1,patterns:{A:{},B:{}}};
 const value=Core.normalize(legacy);
 assert.deepEqual(value.patterns.A.soundLayers,[]);
 assert.deepEqual(value.patterns.B.soundLayers,[]);
 assert.equal(value.patterns.A.sound.id,'hit_heavy');
});
test('最大3つの追加SEをA/B独立で保存し、ローカルファイルのバイナリ情報は保持しない',()=>{
 const model=Core.defaults();
 model.patterns.A.soundLayers=[
  {label:'剣の風切り',sound:{kind:'builtin',id:'hit_light'},volume:.35,delayMs:-120},
  {label:'命中',sound:{kind:'local',file:{name:'impact.wav',size:1024,lastModified:44,secret:'do-not-save'}},volume:.7,delayMs:80},
  {label:'余韻',enabled:false,sound:{kind:'none'},volume:.2,delayMs:500}
 ];
 model.patterns.B.soundLayers=[{label:'別パターン',sound:{kind:'builtin',id:'ward'},delayMs:0}];
 const value=Core.normalize(model),json=JSON.stringify(value);
 assert.equal(value.patterns.A.soundLayers.length,3);
 assert.equal(value.patterns.B.soundLayers.length,1);
 assert.equal(value.patterns.A.soundLayers[0].delayMs,-120);
 assert.equal(value.patterns.A.soundLayers[1].sound.file.name,'impact.wav');
 assert.equal(value.patterns.A.soundLayers[1].volume,.7);
 assert(!json.includes('secret'));assert(!json.includes('do-not-save'));
 assert.deepEqual(Core.normalize(JSON.parse(json)),value);
});
test('追加音声の個数と値の不正を拒否',()=>{
 for(const layers of [
  Array(4).fill({sound:{kind:'builtin',id:'hit_light'}}),
  [{sound:{kind:'builtin',id:'invalid'}}],
  [{sound:{kind:'builtin',id:'hit_light'},delayMs:-1001}],
  [{sound:{kind:'builtin',id:'hit_light'},delayMs:2001}],
  [{sound:{kind:'builtin',id:'hit_light'},volume:1.01}],
  [{sound:{kind:'local',file:{name:'bad',size:1000000000,lastModified:0}}}]
 ]){
  const value=Core.defaults();value.patterns.A.soundLayers=layers;
  assert.throws(()=>Core.normalize(value));
 }
});
test('SE先行・遅延を組み合わせても負の再生時刻を作らず全音の末尾まで再生',()=>{
 const timing=Core.mixTimeline(600,[{durationMs:250,delayMs:-150},{durationMs:400,delayMs:200}]);
 assert.equal(timing.visualOffset,150);
 assert.deepEqual(timing.audioOffsets,[0,350]);
 assert.equal(timing.duration,750);
 assert.equal(Core.mixTimeline(500,[]).duration,500);
 assert.equal(Core.mixTimeline(0,[{durationMs:200,delayMs:-300}]).duration,300);
});
test('追加SEコントロールを開発ページにのみ配置',()=>{
 const html=fs.readFileSync('dev/fx-lab.html','utf8');
 assert(html.includes('id="soundLayers"'));
 assert(html.includes('fx-lab/sound-layers.js'));
 assert(html.indexOf('fx-lab/sound-layers.js')<html.indexOf('fx-lab/lab.js'));
 assert(!fs.readFileSync('index.html','utf8').includes('fx-lab/sound-layers.js'));
});
