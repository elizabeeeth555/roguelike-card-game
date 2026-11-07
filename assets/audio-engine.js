/* Separate lazy-loaded BGM and bounded SE voices; no external requests. */
(function(){
 'use strict';
 const map=window.GAME_ASSETS||{};
 const opts={se:true,bgm:true,seVolume:.47,bgmVolume:.20};
 const pools=new Map(),lastPlayed=new Map();let scene='event',bossId=null,track=null,fadingTrack=null,fade=0,unlocked=false,voices=[];
 function poolFor(key){
  if(!pools.has(key)){const path=map.sounds?.[key];if(!path)return null;pools.set(key,{arr:Array.from({length:2},()=>{const a=new Audio(path);a.preload='auto';return a;}),pos:0});}
  return pools.get(key);
 }
 function se(key){
  if(!opts.se||opts.seVolume<=0)return;
  const now=Date.now();if(now-(lastPlayed.get(key)||0)<65)return;
  const pool=poolFor(key);if(!pool)return;lastPlayed.set(key,now);
  voices=voices.filter(a=>!a.paused&&!a.ended);if(voices.length>=6){const old=voices.shift();old.pause();}
  const a=pool.arr[pool.pos++%pool.arr.length];a.pause();a.currentTime=0;a.volume=opts.seVolume*(key.startsWith('fx_')?.8:1);
  voices=voices.filter(v=>v!==a);voices.push(a);a.play().catch(()=>{});
 }
 function stopEffects(){for(const p of pools.values())for(const a of p.arr){a.pause();a.currentTime=0;}voices=[];lastPlayed.clear();}
 function descriptor(){const boss=scene==='battle'?map.bossBgm?.[bossId]:null;return {ogg:boss?.ogg||map.bgm?.[scene]||'',mp3:boss?.mp3||map.bgmFallback?.[scene]||'',gain:boss?.gain??map.bgmGain?.[scene]??1};}
 function bgmLevel(){return opts.bgm?opts.bgmVolume*Math.max(0,Math.min(1,descriptor().gain)):0;}
 function clearFade(){if(fade){clearInterval(fade);fade=0;}if(fadingTrack){fadingTrack.pause();fadingTrack.currentTime=0;fadingTrack=null;}}
 function stop(fadeMs=250){
  clearFade();if(!track)return;const old=track;track=null;
  if(!fadeMs){old.pause();old.currentTime=0;return;}
  let elapsed=0;const initial=old.volume;fadingTrack=old;
  fade=setInterval(()=>{elapsed+=40;old.volume=Math.max(0,initial*(1-elapsed/fadeMs));if(elapsed>=fadeMs)clearFade();},40);
 }
 function applyVolumes(){if(track)track.volume=bgmLevel();for(const p of pools.values())for(const a of p.arr)a.volume=opts.se?opts.seVolume:0;}
 function tryPlay(){if(track&&opts.bgm)track.play().then(()=>unlocked=true).catch(()=>{});}
 function setScene(next,nextBoss=null){
  if(scene===next&&bossId===nextBoss&&track){tryPlay();return;}
  scene=next;bossId=nextBoss;stop(0);const d=descriptor();
  const supportsOgg=!!new Audio().canPlayType('audio/ogg; codecs="vorbis"');const url=supportsOgg?d.ogg||d.mp3:d.mp3||d.ogg;if(!url)return;
  const current=new Audio(url);track=current;current.preload='auto';current.loop=true;current.volume=bgmLevel();
  let fallbackTried=false;
  current.onerror=()=>{if(track!==current||fallbackTried)return;fallbackTried=true;if(url!==d.mp3&&d.mp3){current.src=d.mp3;if(opts.bgm)tryPlay();}};
  if(opts.bgm)tryPlay();
 }
 function activate(){unlocked=true;if(track&&opts.bgm&&track.paused)tryPlay();}
 function toggle(kind,on){
  opts[kind]=!!on;
  if(kind==='bgm'){if(opts.bgm){if(!track)setScene(scene,bossId);else tryPlay();}else if(track)track.pause();}
  if(kind==='se'&&!on)stopEffects();applyVolumes();
 }
 function volume(kind,value){const n=Number(value);if(Number.isFinite(n))opts[kind+'Volume']=Math.max(0,Math.min(1,n));applyVolumes();}
 window.GameAudio={se,setScene,activate,toggle,volume,stop,stopEffects,getState:()=>({...opts,scene,bossId,unlocked})};
 document.addEventListener('pointerdown',activate,{capture:true});document.addEventListener('keydown',activate,{capture:true});
})();
