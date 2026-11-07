'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function audio(ogg=true){
 const instances=[];class Audio{constructor(src){this.src=src;this.paused=true;this.ended=false;instances.push(this);}canPlayType(){return ogg?'probably':'';}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
 const c={window:{},Audio,document:{addEventListener(){}},setInterval,clearInterval,Date,Map};vm.createContext(c);
 vm.runInContext(fs.readFileSync('assets/asset-map.js','utf8'),c);vm.runInContext(fs.readFileSync('assets/audio-engine.js','utf8'),c);
 return {api:c.window.GameAudio,map:c.window.GAME_ASSETS,instances};
}
test('選択したボス曲だけ生成、同ボス重複なし、再戦/道中復帰、互換形式と音量',()=>{
 const b=audio(false);b.map.bossBgm.boss_knight_defense={ogg:'knight.ogg',mp3:'knight.mp3',gain:.5};b.map.bossBgm.boss_sage_tempo={ogg:'sage.ogg',mp3:'sage.mp3',gain:.8};
 b.api.setScene('battle','boss_knight_defense');const knight=b.instances.at(-1);assert.equal(knight.src,'knight.mp3');assert.equal(knight.volume,.1);assert(knight.loop);
 b.api.setScene('battle','boss_knight_defense');assert.equal(b.instances.at(-1),knight);
 b.api.setScene('battle','boss_sage_tempo');assert(knight.paused);assert.equal(b.instances.at(-1).src,'sage.mp3');
 b.api.toggle('bgm',false);assert(b.instances.at(-1).paused);b.api.volume('bgm',.6);b.api.toggle('bgm',true);assert.equal(b.instances.at(-1).volume,.48);
 b.api.stop(0);b.api.setScene('battle','boss_sage_tempo');assert.equal(b.instances.at(-1).src,'sage.mp3');b.api.setScene('event');assert.equal(b.instances.at(-1).src,b.map.bgmFallback.event);
});
test('OGGロード失敗はMP3へ一度だけフォールバック、古い曲のエラーは無効',()=>{
 const b=audio();b.api.setScene('battle','boss_scout_rush');const a=b.instances.at(-1);assert(a.src.endsWith('.ogg'));a.onerror();assert(a.src.endsWith('.mp3'));a.onerror();assert(a.src.endsWith('.mp3'));
 b.api.setScene('event');const old=a.src;a.onerror();assert.equal(a.src,old);b.api.stop(0);
});
test('SEは最大6声、同音連打抑制、ミュート/終了で残音破棄',()=>{
 const b=audio();const keys=Object.keys(b.map.sounds).filter(k=>k.startsWith('fx_'));
 for(const key of keys)b.api.se(key);assert.equal(b.instances.filter(a=>!a.paused).length,6);
 const n=b.instances.length;b.api.se(keys.at(-1));assert.equal(b.instances.length,n);
 b.api.toggle('se',false);assert(b.instances.every(a=>a.paused));b.api.se(keys[0]);assert(b.instances.every(a=>a.paused));
 b.api.toggle('se',true);b.api.se(keys[0]);b.api.stopEffects();assert(b.instances.every(a=>a.paused));
});
