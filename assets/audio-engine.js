/* AudioEngine: separate, swappable BGM and SE, no external libraries. */
(function(){
  'use strict';
  const map=window.GAME_ASSETS||{};
  const opts={se:true,bgm:true,seVolume:0.47,bgmVolume:0.20};
  const pools=new Map();let scene='event',track=null,fadingTrack=null,fade=0,unlocked=false;
  function getPath(key){return map.sounds?.[key]||'';}
  function poolFor(key){
    if(!pools.has(key)){
      const path=getPath(key);if(!path)return null;
      const arr=Array.from({length:3},()=>{const a=new Audio(path);a.preload='auto';return a;});
      pools.set(key,{arr,pos:0});
    }
    return pools.get(key);
  }
  function se(key){
    if(!opts.se||opts.seVolume<=0)return;
    const pool=poolFor(key);if(!pool)return;
    const el=pool.arr[pool.pos++%pool.arr.length];el.pause();el.currentTime=0;el.volume=opts.seVolume;
    el.play().catch(()=>{});
  }
  function filename(mode){
    const primary=map.bgm?.[mode]||'';
    if(!primary)return map.bgmFallback?.[mode]||'';
    const isOgg=/\.ogg(?:$|\?)/i.test(primary);
    if(isOgg && !new Audio().canPlayType('audio/ogg; codecs="vorbis"'))return map.bgmFallback?.[mode]||primary;
    return primary;
  }
  function bgmLevel(){return opts.bgm ? opts.bgmVolume * Math.max(0,Math.min(1,Number(map.bgmGain?.[scene]??1))) : 0;}
  function clearFade(){if(fade){clearInterval(fade);fade=0;}if(fadingTrack){fadingTrack.pause();fadingTrack.currentTime=0;fadingTrack=null;}}
  function stop(fadeMs=250){
    clearFade();
    if(!track)return;
    const old=track;track=null;
    if(!fadeMs){old.pause();old.currentTime=0;return;}
    let elapsed=0;const initial=old.volume;fadingTrack=old;
    fade=setInterval(()=>{elapsed+=40;old.volume=Math.max(0,initial*(1-elapsed/fadeMs));if(elapsed>=fadeMs)clearFade();},40);
  }
  function applyVolumes(){if(track)track.volume=bgmLevel();for(const p of pools.values())for(const x of p.arr)x.volume=opts.seVolume;}
  function tryPlay(){if(track&&opts.bgm){track.play().then(()=>unlocked=true).catch(()=>{});}}
  function setScene(next){
    if(scene===next&&track){tryPlay();return;}
    scene=next;stop(0);
    const url=filename(next);if(!url)return;
    track=new Audio(url);track.preload='auto';track.loop=true;track.volume=bgmLevel();
    if(opts.bgm)tryPlay();
  }
  function activate(){unlocked=true;if(track&&opts.bgm&&track.paused)tryPlay();}
  function toggle(kind,on){
    opts[kind]=!!on;
    if(kind==='bgm'){
      if(opts.bgm){if(!track)setScene(scene);else tryPlay();}
      else if(track)track.pause();
    }
    applyVolumes();
  }
  function volume(kind,value){opts[kind+'Volume']=Math.max(0,Math.min(1,Number(value)));applyVolumes();}
  function getState(){return {...opts,scene,unlocked};}
  window.GameAudio={se,setScene,activate,toggle,volume,stop,getState};
  // A pointer or keyboard gesture unlocks audio on iOS/Safari. No audio auto-start before interaction.
  document.addEventListener('pointerdown',activate,{capture:true});
  document.addEventListener('keydown',activate,{capture:true});
})();
