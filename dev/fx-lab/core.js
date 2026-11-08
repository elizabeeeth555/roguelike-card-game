/* Engine-neutral JSON configuration and timeline math. No DOM or asset data. */
(function(root,factory){'use strict';const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FxLabCore=api;})(globalThis,function(){
 'use strict';
 const FX=['slash','venom','poison','poison-tick','ward','block','break','heal','buff','curse','mana','finish'];
 const SE=['hit_light','hit_medium','hit_heavy','ward','block','break','heal','buff','mana','poison','poison_tick','curse'];
 const BOSSES=['02_heavy_knight','03_witch','04_giant_warrior','05_scout','06_sage'];
 const LIMITS={fileBytes:64*1024*1024,frames:300,pixels:32*1024*1024};
 function number(v,fallback,min,max,integer=false){if(v===undefined)return fallback;if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isInteger(v)))throw Error(`数値は${min}〜${max}${integer?'の整数':''}で指定してください`);return v;}
 function text(v,fallback,max=160){if(v===undefined)return fallback;if(typeof v!=='string'||v.length>max||/[\u0000-\u001f]/.test(v))throw Error('設定の文字列が不正です');return v;}
 function choice(v,fallback,values){v=v===undefined?fallback:v;if(!values.includes(v))throw Error('未対応の識別子・形式です');return v;}
 function object(v){if(!v||typeof v!=='object'||Array.isArray(v))throw Error('設定の構造が不正です');return v;}
 function boolean(v,fallback){if(v===undefined)return fallback;if(typeof v!=='boolean')throw Error('真偽値が不正です');return v;}
 function metadata(f){object(f);return {name:text(f.name,'未選択',240),size:number(f.size,0,0,LIMITS.fileBytes,true),lastModified:number(f.lastModified,0,0,Number.MAX_SAFE_INTEGER,true)};}
 function reference(raw,type){raw=object(raw);const kind=choice(raw.kind,'builtin',type==='visual'?['builtin','local']:['builtin','local','none']);
  if(kind==='none')return {kind};
  if(kind==='builtin')return type==='visual'?{kind,id:choice(raw.id,'slash',FX),amount:number(raw.amount,6,1,20,true)}:{kind,id:choice(raw.id,'hit_heavy',SE)};
  if(type==='sound')return {kind,file:raw.file?metadata(raw.file):null};
  const format=choice(raw.format,'image',['image','sequence','sheet']);if(!Array.isArray(raw.files)||raw.files.length>LIMITS.frames)throw Error('素材一覧が不正です');
  const files=raw.files.map(metadata);if(format!=='sequence'&&files.length>1)throw Error('画像/シートには1ファイルだけ指定してください');return {kind,format,files};
 }
 function profile(raw={}){object(raw);const p=object(raw.playback||{});const playback={
  speed:number(p.speed,1,.25,2),size:number(p.size,200,32,1000),x:number(p.x,0,-600,600),y:number(p.y,0,-600,600),opacity:number(p.opacity,1,0,1),rotation:number(p.rotation,0,-180,180),flipX:boolean(p.flipX,false),target:choice(p.target,'boss',['boss','player']),
  volume:number(p.volume,.5,0,1),audioDelayMs:number(p.audioDelayMs,0,-1000,1000),loop:boolean(p.loop,false),gapMs:number(p.gapMs,500,100,3000),holdMs:number(p.holdMs,1200,200,5000),columns:number(p.columns,4,1,32,true),rows:number(p.rows,4,1,32,true),frameCount:number(p.frameCount,16,1,LIMITS.frames,true),fps:number(p.fps,24,1,120)};
  const i=object(p.impact||{}),color=(v,f)=>{v=text(v,f,7);if(!/^#[0-9a-fA-F]{6}$/.test(v))throw Error('色は#RRGGBB形式で指定してください');return v;};
  playback.impact={
   hitDelayMs:number(i.hitDelayMs,140,0,2000,true),hitStopMs:number(i.hitStopMs,50,0,200,true),
   shakePx:number(i.shakePx,6,0,32),shakeMs:number(i.shakeMs,150,0,800,true),
   flashOpacity:number(i.flashOpacity,.2,0,1),flashMs:number(i.flashMs,110,0,600,true),
   damageEnabled:boolean(i.damageEnabled,true),damageText:text(i.damageText,'128',10),
   damageX:number(i.damageX,0,-400,400),damageY:number(i.damageY,-30,-400,400),
   damageSize:number(i.damageSize,54,12,160),damageDelayMs:number(i.damageDelayMs,0,-500,1500,true),
   damageDurationMs:number(i.damageDurationMs,650,100,2500,true),
   damageFont:choice(i.damageFont,'impact',['impact','serif','sans','mono','local']),
   damageMotion:choice(i.damageMotion,'pop',['pop','rise','static']),
   damageColor:color(i.damageColor,'#ffe5a7'),damageStrokeColor:color(i.damageStrokeColor,'#17151c'),
   damageStrokePx:number(i.damageStrokePx,3,0,10),
   fontFile:i.fontFile?metadata(i.fontFile):null
  };
  if(!/^[+\-]?[0-9]{1,8}$/.test(playback.impact.damageText))throw Error('ダメージ値は1〜8桁の整数（符号可）で指定してください');
  if(playback.frameCount>playback.columns*playback.rows)throw Error('フレーム数は行数×列数以内にしてください');
  const layers=raw.layers===undefined?[]:raw.layers;
  if(!Array.isArray(layers)||layers.length>3)throw Error('追加映像レイヤーは最大3つです');
  const parsedLayers=layers.map((l,n)=>{
   object(l);const visual=reference(l.visual||{kind:'local',format:'image',files:[]},'visual');
   if(visual.kind!=='local')throw Error('追加レイヤーにはローカル映像を選択してください');
   return {label:text(l.label,'レイヤー '+(n+2),60),enabled:boolean(l.enabled,true),visual,
    delayMs:number(l.delayMs,0,0,2000,true),x:number(l.x,0,-600,600),y:number(l.y,0,-600,600),
    size:number(l.size,200,32,1000),speed:number(l.speed,1,.25,2),opacity:number(l.opacity,1,0,1),
    rotation:number(l.rotation,0,-180,180),flipX:boolean(l.flipX,false),
    fps:number(l.fps,24,1,120),columns:number(l.columns,4,1,32,true),rows:number(l.rows,4,1,32,true),
    frameCount:number(l.frameCount,16,1,300,true),holdMs:number(l.holdMs,900,200,5000,true)};
  });
  for(const l of parsedLayers)if(l.frameCount>l.columns*l.rows)throw Error('追加レイヤーのフレーム指定が行×列を超えています');

  const soundLayers=raw.soundLayers===undefined?[]:raw.soundLayers;
  if(!Array.isArray(soundLayers)||soundLayers.length>3)throw Error('追加SEは最大3音です');
  const parsedSounds=soundLayers.map((l,n)=>{
   object(l);
   return {label:text(l.label,'追加SE '+(n+1),60),enabled:boolean(l.enabled,true),
    sound:reference(l.sound||{kind:'builtin',id:'hit_light'},'sound'),
    volume:number(l.volume,.5,0,1),delayMs:number(l.delayMs,0,-1000,2000,true)};
  });
  return {label:text(raw.label,'パターン'),visual:reference(raw.visual||{kind:'builtin',id:'slash'},'visual'),sound:reference(raw.sound||{kind:'builtin',id:'hit_heavy'},'sound'),playback,layers:parsedLayers,soundLayers:parsedSounds};
 }
 function normalize(raw){object(raw);if(raw.schema!=='keisei.fx-lab'||raw.version!==1)throw Error('FX Lab v1のJSONではありません');const patterns=object(raw.patterns);return {schema:'keisei.fx-lab',version:1,name:text(raw.name,'試作エフェクト'),scene:{boss:choice(raw.scene?.boss,'02_heavy_knight',BOSSES)},patterns:{A:profile(patterns.A),B:profile(patterns.B)}};}
 function defaults(){return normalize({schema:'keisei.fx-lab',version:1,name:'古城の試写',scene:{boss:BOSSES[0]},patterns:{A:{label:'本編・重い斬撃'},B:{label:'比較用（素材を選択）',visual:{kind:'builtin',id:'ward'},sound:{kind:'builtin',id:'ward'}}}});}
 function frameAt(durations,elapsed,speed=1){let t=Math.max(0,elapsed)*speed;for(let i=0;i<durations.length;i++){t-=durations[i];if(t<0)return i;}return Math.max(0,durations.length-1);}
 function timeline(visualMs,audioMs,delayMs){const visualOffset=Math.max(0,-delayMs),audioOffset=Math.max(0,delayMs);return {visualOffset,audioOffset,duration:Math.max(visualOffset+visualMs,audioOffset+audioMs)};}
 function mixTimeline(visualMs,tracks){
  if(!Array.isArray(tracks))throw Error('SEタイムラインの指定が不正です');
  const shift=Math.max(0,...tracks.map(t=>-t.delayMs));
  const offsets=tracks.map(t=>shift+t.delayMs);
  return {visualOffset:shift,audioOffsets:offsets,audioOffset:offsets[0]??0,
   duration:Math.max(shift+visualMs,0,...tracks.map((t,i)=>offsets[i]+t.durationMs))};
 }
 function natural(files){return [...files].sort((a,b)=>a.name.localeCompare(b.name,'en',{numeric:true}));}
 return Object.freeze({FX,SE,BOSSES,LIMITS,normalize,profile,defaults,frameAt,timeline,mixTimeline,natural});
});
