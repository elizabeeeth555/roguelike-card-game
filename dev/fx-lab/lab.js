/* FX Lab host: independent of game progression, rules, AI, and audio engine. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),Core=FxLabCore,Media=FxLabMedia;
 if(!['127.0.0.1','localhost','[::1]'].includes(location.hostname)){$('workspace').hidden=true;$('localOnly').hidden=false;return;}
 const rootURL=path=>new URL('../'+path,document.baseURI).href;
 const fxNames={slash:'斬撃',venom:'毒参照の斬撃',poison:'毒霧', 'poison-tick':'毒の発動',ward:'結界展開',block:'防御成功',break:'結界破壊',heal:'回復',buff:'強化',curse:'呪い・弱体',mana:'マナ集積',finish:'決着'};
 const seNames={hit_light:'軽い命中',hit_medium:'中程度の命中',hit_heavy:'重い命中',ward:'結界展開',block:'防御',break:'結界破壊',heal:'回復',buff:'強化',mana:'マナ',poison:'毒付与',poison_tick:'毒の発動',curse:'呪い'};
 let model=Core.defaults(),active='A',epoch=0,generation=0,playing=false,referenceSpeed=1,raf=0;
 let timers=new Map(),sources=new Set(),gains=new Set(),nativeURL=null,lastSchedule=null;
 const soundCache=new Map();const entries={A:entry(),B:entry()};
 function entry(){return {visual:null,files:[],sound:null,soundFile:null,visualToken:0,soundToken:0,loading:0};}
 window.$=$;window.app={mode:'battle',fxMode:'standard'};
 // Adapt the production FX lifetime to preview speed. No game state is created.
 window.battleTasks={schedule(fn,ms){return later(fn,ms/referenceSpeed);},cancel(){clearTimers();}};
 function later(fn,ms){let id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.set(id,true);return id;}
 function clearTimers(){for(const id of timers.keys())clearTimeout(id);timers.clear();}
 const canvas=$('fxCanvas'),ctx=canvas.getContext('2d'),native=$('nativeFx');
 function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
 function stop(message='停止しました'){
  generation++;playing=false;clearTimers();cancelAnimationFrame(raf);raf=0;
  for(const source of sources){try{source.stop();source.disconnect();}catch{}}sources.clear();for(const gain of gains)gain.disconnect();gains.clear();
  clearCombatFx();$('combatFxLayer').replaceChildren();ctx.clearRect(0,0,canvas.width,canvas.height);native.hidden=true;native.removeAttribute('src');
  if(nativeURL){URL.revokeObjectURL(nativeURL);nativeURL=null;}
  $('play').textContent='▶ 再生 / 最初から';$('previewBadge').textContent='パターン '+active;if(message)status(message);
 }
 function disposeEntry(e){Media.dispose(e.visual);e.visual=null;e.sound=null;e.files=[];e.soundFile=null;e.visualToken++;e.soundToken++;}
 function anchor(p){
  const r=$('arena').getBoundingClientRect(),a=$(p.target==='boss'?'enemyShadow':'playerHpTrack').getBoundingClientRect();
  return {x:Math.max(35,Math.min(r.width-35,a.left+a.width/2-r.left))+p.x,y:Math.max(45,Math.min(r.height-45,p.target==='boss'?a.top+a.height*.36-r.top:a.top+a.height/2-r.top))+p.y};
 }
 function updateMarker(){const a=anchor(current().playback);$('targetMarker').style.left=a.x+'px';$('targetMarker').style.top=a.y+'px';}
 function resize(){stop(null);const r=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);updateMarker();}
 function current(){return model.patterns[active];}
 function metadata(file){return {name:file.name,size:file.size,lastModified:file.lastModified};}
 function fillOptions(select,items){select.replaceChildren(...items.map(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;}));}
 fillOptions($('builtinFx'),Core.FX.map(id=>[id,fxNames[id]]));
 fillOptions($('soundMode'),[...Core.SE.map(id=>[id,'本編SE：'+seNames[id]]),['none','SEなし'],['local','ローカルのSEを選ぶ']]);
 fillOptions($('bossSelect'),Core.BOSSES.map(id=>[id,GAME_ASSETS.characterSets[id].name]));
 function setScene(){const character=GAME_ASSETS.characterSets[model.scene.boss];$('heroFace').src=rootURL(GAME_ASSETS.characterSets['01_black_swordsman'].images.boss);$('bossPortrait').src=rootURL(character.images.boss);$('bossPortrait').alt=character.name;$('bossCaption').textContent=character.name;$('bossSelect').value=model.scene.boss;}
 for(const id of ['heroFace','bossPortrait'])$(id).addEventListener('error',()=>status('既存キャラクター画像を読み込めませんでした。リポジトリルートからサーバーを起動してください。',true));
 const settings=['speed','size','x','y','opacity','rotation','flipX','target','volume','audioDelayMs','loop','gapMs','holdMs','columns','rows','frameCount','fps'];
 function refresh(){
  const c=current(),e=entries[active],p=c.playback,format=c.visual.kind==='builtin'?'builtin':c.visual.format;
  $('patternA').setAttribute('aria-pressed',String(active==='A'));$('patternB').setAttribute('aria-pressed',String(active==='B'));$('activePattern').textContent=active;
  $('patternLabel').value=c.label;$('configName').value=model.name;$('visualMode').value=format;$('builtinBox').hidden=format!=='builtin';$('fileBox').hidden=format==='builtin';$('builtinFx').value=c.visual.kind==='builtin'?c.visual.id:'slash';
  $('frameSettings').hidden=!['sheet','sequence'].includes(format);for(const id of ['columnsBox','rowsBox','countBox'])$(id).hidden=format!=='sheet';
  $('soundMode').value=c.sound.kind==='builtin'?c.sound.id:c.sound.kind;$('soundFileBox').hidden=c.sound.kind!=='local';
  $('visualInfo').textContent=c.visual.kind==='builtin'?'本編の描画関数を使用：'+fxNames[c.visual.id]:e.visual?`${e.files.map(f=>f.name).join(' / ')} · ${e.visual.kind==='native'?'ネイティブ再生':e.visual.frames?e.visual.frames.length+' フレーム':'画像読込済み'}`:c.visual.files.length?'JSONの識別情報のみ：'+c.visual.files.map(f=>f.name).join(' / ')+' — ファイルを再選択してください。':'まだ映像ファイルが選ばれていません。';
  $('soundInfo').textContent=c.sound.kind==='builtin'?'既存の自作SE：'+seNames[c.sound.id]:c.sound.kind==='none'?'映像のみ再生します。':e.sound?`${e.soundFile.name} · ${e.sound.duration.toFixed(2)}秒`:c.sound.file?c.sound.file.name+' — ファイルを再選択してください。':'まだSEファイルが選ばれていません。';
  for(const id of settings){if(typeof p[id]==='boolean')$(id).checked=p[id];else $(id).value=p[id];}
  for(const id of ['speed','size','x','y','opacity','rotation','volume','audioDelayMs'])$(id+'Out').textContent=id==='speed'?p[id].toFixed(2)+'×':id==='volume'||id==='opacity'?Math.round(p[id]*100)+'%':id==='audioDelayMs'?(p[id]>0?'+':'')+p[id]+' ms':p[id]+(id==='rotation'?'°':' px');
  const nativeMode=!!e.visual?.native;$('speed').disabled=nativeMode;$('loop').disabled=nativeMode;for(const b of document.querySelectorAll('[data-speed]'))b.disabled=nativeMode;
  $('capability').textContent=nativeMode?'ネイティブ再生：速度は1×固定、ループは素材の内蔵設定に従います。停止は非表示。表示時間で区切って比較できます。速度制御には対応ブラウザ・PNG連番・シートを使ってください。':format==='builtin'?'本編の自作FX＋既存SE。画像や音声を差し替えず、速度と配置だけを試写します。動きを減らすOS設定も本編と同じく反映します。':format==='sequence'||format==='sheet'?'FPSが素材の基準速度です。シートは左上から右へ、行ごとに再生。空きセルはフレーム数で除外します。':e.visual?.animated?'ImageDecoderで合成済みフレームと素材本来の表示時間を取得。速度変更・停止・1回再生・ループに対応しています。':'PNGは静止画です。APNG / アニメーションWebPは対応時にフレーム展開し、非対応時は制約を表示します。';
  $('play').disabled=e.loading>0;$('soundOnly').disabled=e.loading>0;if(!playing)$('previewBadge').textContent='パターン '+active;updateMarker();
 }
 function updateSetting(id){const live=id==='volume'&&playing&&lastSchedule?.pattern===active;if(!live)stop(null);const p=current().playback,previous={...p};p[id]=typeof previous[id]==='boolean'?$(id).checked:id==='target'?$(id).value:Number($(id).value);if(id==='columns'||id==='rows')p.frameCount=Math.min(p.frameCount,p.columns*p.rows);try{model.patterns[active]=Core.profile(current());if(live)for(const gain of gains)gain.gain.setTargetAtTime(p.volume,Media.audioContext().currentTime,.015);status(live?'音量を再生中に調整しました。':'調整しました。再生して比較できます。');}catch(error){current().playback=previous;status(error.message,true);}refresh();}
 for(const id of settings)$(id).addEventListener($(id).type==='range'?'input':'change',()=>updateSetting(id));
 $('patternLabel').addEventListener('input',()=>{current().label=$('patternLabel').value;});$('configName').addEventListener('input',()=>{model.name=$('configName').value;});
 for(const key of ['A','B'])$('pattern'+key).addEventListener('click',()=>{stop(null);active=key;refresh();status('パターン '+key+'：'+current().label);});
 $('bossSelect').addEventListener('change',()=>{stop(null);model.scene.boss=$('bossSelect').value;setScene();});
 $('visualMode').addEventListener('change',()=>{
  stop(null);const c=current(),e=entries[active],format=$('visualMode').value,oldFiles=e.files.slice();Media.dispose(e.visual);e.visual=null;e.visualToken++;
  c.visual=format==='builtin'?{kind:'builtin',id:$('builtinFx').value,amount:6}:{kind:'local',format,files:[]};e.files=[];refresh();
  if(format!=='builtin'&&oldFiles.length&&(format==='sequence'||oldFiles.length===1))loadVisual(oldFiles,format);else status('映像を選択してください。');
 });
 $('builtinFx').addEventListener('change',()=>{stop(null);current().visual={kind:'builtin',id:$('builtinFx').value,amount:6};refresh();});
 async function loadVisual(files,format){
  stop(null);const key=active,e=entries[key],token=++e.visualToken,capturedEpoch=epoch;e.loading++;status('映像を展開しています…');refresh();
  try{const asset=await Media.visual(files,format);if(capturedEpoch!==epoch||token!==e.visualToken){Media.dispose(asset);return;}
   Media.dispose(e.visual);e.visual=asset;e.files=format==='sequence'?Core.natural(files):files;
   model.patterns[key].visual={kind:'local',format,files:e.files.map(metadata)};if(asset.native){model.patterns[key].playback.speed=1;model.patterns[key].playback.loop=false;}status('映像を読み込みました。');
  }catch(error){if(capturedEpoch===epoch&&token===e.visualToken)status('映像の読込失敗：'+error.message,true);}
  finally{e.loading--;if(capturedEpoch===epoch)refresh();}
 }
 $('visualFiles').addEventListener('change',event=>{const files=[...event.target.files];event.target.value='';if(files.length)loadVisual(files,$('visualMode').value==='builtin'?'image':$('visualMode').value);});
 $('sampleImage').addEventListener('click',async()=>{try{const r=await fetch(rootURL(GAME_ASSETS.effects.particle));if(!r.ok)throw Error('HTTP '+r.status);loadVisual([new File([await r.blob()],'kenney-particle.png',{type:'image/png',lastModified:0})],$('visualMode').value==='sheet'?'sheet':'image');}catch(error){status('サンプルの読込失敗：'+error.message,true);}});
 $('soundMode').addEventListener('change',()=>{stop(null);entries[active].soundToken++;entries[active].sound=null;entries[active].soundFile=null;const id=$('soundMode').value;current().sound=id==='none'?{kind:'none'}:id==='local'?{kind:'local',file:null}:{kind:'builtin',id};refresh();});
 $('soundFile').addEventListener('change',async event=>{
  const file=event.target.files[0];event.target.value='';if(!file)return;stop(null);const key=active,e=entries[key],token=++e.soundToken,capturedEpoch=epoch;e.loading++;status('SEを読み込んでいます…');refresh();
  try{if(!/\.(wav|mp3|ogg)$/i.test(file.name))throw Error('WAV / MP3 / OGGを選択してください');const buffer=await Media.sound(file);if(epoch!==capturedEpoch||token!==e.soundToken)return;e.sound=buffer;e.soundFile=file;model.patterns[key].sound={kind:'local',file:metadata(file)};status('SEを読み込みました（再生はユーザー操作後のみ）。');}
  catch(error){if(epoch===capturedEpoch&&token===e.soundToken)status('SEの読込失敗：'+error.message,true);}finally{e.loading--;if(epoch===capturedEpoch)refresh();}
 });
 const presets={slash:['slash','hit_light',2],heavy:['slash','hit_heavy',6],poison:['poison','poison',3],ward:['ward','ward',3],heal:['heal','heal',2]};
 for(const button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>{stop(null);const [id,se,amount]=presets[button.dataset.preset];disposeEntry(entries[active]);current().visual={kind:'builtin',id,amount};current().sound={kind:'builtin',id:se};refresh();status('公開素材の組み合わせを選択しました。');});
 for(const button of document.querySelectorAll('[data-speed]'))button.addEventListener('click',()=>{$('speed').value=button.dataset.speed;updateSetting('speed');});
 $('matchSettings').addEventListener('click',()=>{stop(null);const other=active==='A'?'B':'A';for(const id of ['speed','size','x','y','opacity','rotation','flipX','target','volume','audioDelayMs','loop','holdMs','gapMs'])model.patterns[other].playback[id]=current().playback[id];if(entries[other].visual?.native){model.patterns[other].playback.speed=1;model.patterns[other].playback.loop=false;}status(`${active}の試写条件を${other}に揃えました（素材・フレーム指定は維持）。`);});
 async function resolveSound(key){
  const c=model.patterns[key],e=entries[key];if(c.sound.kind==='none')return null;
  if(c.sound.kind==='local'){if(!e.sound)throw Error(key+'：SEファイルを再選択してください');return e.sound;}
  const id=c.sound.id;if(!soundCache.has(id)){const response=await fetch(rootURL(GAME_ASSETS.sounds['fx_'+id]));if(!response.ok)throw Error('SEの取得に失敗：HTTP '+response.status);const buffer=await Media.audioContext().decodeAudioData(await response.arrayBuffer());soundCache.set(id,buffer);}return soundCache.get(id);
 }
 function prepareVisual(key){const c=model.patterns[key],e=entries[key],p=c.playback;if(c.visual.kind==='local'&&!e.visual)throw Error(key+'：映像ファイルを再選択してください');
  if(c.visual.kind==='builtin'){const duration=c.visual.id==='finish'?800:c.visual.id==='poison-tick'?300:c.visual.amount>=5?760:480;return {kind:'builtin',duration:Math.max(900,duration)/p.speed};}
  const a=e.visual;if(c.visual.format==='sheet'){if(a.kind!=='static')throw Error('シートは静止PNG/WebPを指定してください');if(a.width%p.columns||a.height%p.rows)throw Error('シート寸法が行列で割り切れません');return {kind:'sheet',asset:a,durations:Array(p.frameCount).fill(1000/p.fps),duration:p.frameCount*1000/p.fps/p.speed};}
  if(a.kind==='frames'||a.kind==='sequence'){const durations=a.frames.map(f=>a.kind==='sequence'?1000/p.fps:f.duration);return {kind:'frames',asset:a,durations,duration:durations.reduce((a,b)=>a+b,0)/p.speed};}
  return {kind:a.native?'native':'static',asset:a,duration:p.holdMs};
 }
 function drawFrame(v,p,elapsed){
  const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);if(elapsed<0||elapsed>=v.duration)return;
  const at=anchor(p);let image=v.asset.image,sx=0,sy=0,sw,sh;
  if(v.kind==='frames'){const index=Core.frameAt(v.durations,elapsed,p.speed);canvas.dataset.frame=String(index);image=v.asset.frames[index].image;sw=image.width;sh=image.height;}
  else if(v.kind==='sheet'){const index=Core.frameAt(v.durations,elapsed,p.speed);canvas.dataset.frame=String(index);sw=image.width/p.columns;sh=image.height/p.rows;sx=(index%p.columns)*sw;sy=Math.floor(index/p.columns)*sh;}
  else{canvas.dataset.frame='0';sw=image.width;sh=image.height;}
  const scale=p.size/Math.max(sw,sh);ctx.save();ctx.translate(at.x,at.y);ctx.rotate(p.rotation*Math.PI/180);ctx.scale(p.flipX?-1:1,1);ctx.globalAlpha=p.opacity;ctx.drawImage(image,sx,sy,sw,sh,-sw*scale/2,-sh*scale/2,sw*scale,sh*scale);ctx.restore();
 }
 function showVisual(v,c){const p=c.playback;
  if(v.kind==='builtin'){
   referenceSpeed=p.speed;combatFx(c.visual.id,p.target,c.visual.amount);const node=[...combatFxNodes].at(-1),at=anchor(p),wrapper=document.createElement('div');wrapper.className='reference-transform';wrapper.style.left=at.x+'px';wrapper.style.top=at.y+'px';wrapper.style.opacity=p.opacity;wrapper.style.transform=`rotate(${p.rotation}deg) scaleX(${p.flipX?-1:1})`;$('combatFxLayer').append(wrapper);wrapper.append(node);node.style.setProperty('--fx-x','0px');node.style.setProperty('--fx-y','0px');node.style.setProperty('--fx-size',p.size+'px');
   for(const animation of node.getAnimations({subtree:true}))animation.playbackRate=p.speed;return;
  }
  if(v.kind==='native'){
   nativeURL=URL.createObjectURL(v.asset.file);native.src=nativeURL;native.hidden=false;const at=anchor(p),w=p.size*v.asset.width/Math.max(v.asset.width,v.asset.height),h=p.size*v.asset.height/Math.max(v.asset.width,v.asset.height);native.style.width=w+'px';native.style.height=h+'px';native.style.left=(at.x-w/2)+'px';native.style.top=(at.y-h/2)+'px';native.style.opacity=p.opacity;native.style.transform=`rotate(${p.rotation}deg) scaleX(${p.flipX?-1:1})`;
  }
 }
 function start(keys,repeats=1,soundOnly=false){
  stop(null);const token=generation;playing=true;$('play').textContent='↻ 最初から再生';status('再生を準備しています…');
  let audio;try{audio=Media.audioContext();}catch(error){stop('このブラウザではWeb Audioを利用できません。Chrome / Edgeを使用してください。');return;}
  // This resume occurs directly in the user click/key handler, before any fetch.
  const unlocked=audio.resume();
  (async()=>{try{
   await unlocked;const prepared=[];
   for(const key of keys){if(entries[key].loading)throw Error(key+'：素材の読込完了を待ってください');prepared.push({key,visual:soundOnly?null:prepareVisual(key),sound:await resolveSound(key)});}
   if(token!==generation)return;
   function cycle(index,count){
    if(token!==generation)return;const item=prepared[index],c=model.patterns[item.key],p=c.playback,v=item.visual,buffer=item.sound;
    if(soundOnly&&!buffer){stop('SEを選択してください。');return;}
    const timing=Core.timeline(v?v.duration:0,buffer?buffer.duration*1000:0,soundOnly?0:p.audioDelayMs),lead=30,wall=performance.now()+lead;
    lastSchedule={pattern:item.key,...timing,leadMs:lead,soundOnly,iteration:count+1,startedAt:wall};$('previewBadge').textContent='再生中 '+item.key+' · '+c.label;status(`${item.key}：${(timing.duration/1000).toFixed(2)}秒 · SE ${soundOnly?0:p.audioDelayMs}ms`);
    if(buffer){const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=buffer;gain.gain.value=p.volume;source.connect(gain);gain.connect(audio.destination);sources.add(source);gains.add(gain);source.onended=()=>{sources.delete(source);gains.delete(gain);source.disconnect();gain.disconnect();};source.start(audio.currentTime+(lead+timing.audioOffset)/1000);}
    if(v){later(()=>{if(token===generation)showVisual(v,c);},lead+timing.visualOffset);if(!['builtin','native'].includes(v.kind)){function frame(now){if(token!==generation)return;drawFrame(v,p,now-wall-timing.visualOffset);raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);}}
    later(()=>{
     if(token!==generation)return;cancelAnimationFrame(raf);clearCombatFx();$('combatFxLayer').replaceChildren();ctx.clearRect(0,0,canvas.width,canvas.height);native.hidden=true;native.removeAttribute('src');if(nativeURL){URL.revokeObjectURL(nativeURL);nativeURL=null;}
     const next=index+1<prepared.length?index+1:0,nextCount=next===0?count+1:count;
     if(next!==0||nextCount<repeats||(keys.length===1&&repeats===1&&!soundOnly&&p.loop&&!entries[item.key].visual?.native))later(()=>cycle(next,nextCount),p.gapMs);else{playing=false;$('play').textContent='▶ 再生 / 最初から';status('再生完了。設定を変えてもう一度比較できます。');}
    },lead+timing.duration);
   }
   cycle(0,0);
  }catch(error){if(token===generation){stop(null);status('再生できません：'+error.message,true);}}})();
 }
 $('play').addEventListener('click',()=>start([active]));$('stop').addEventListener('click',()=>stop());$('repeat').addEventListener('click',()=>start([active],3));$('compare').addEventListener('click',()=>start(['A','B']));$('soundOnly').addEventListener('click',()=>start([active],1,true));
 $('exportConfig').addEventListener('click',()=>{try{const config=Core.normalize(model),blob=new Blob([JSON.stringify(config,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(config.name.replace(/[\\/:*?"<>|]/g,'_')||'fx-lab')+'.fx-lab.local.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);status('設定JSONを書き出しました。素材本体は含みません。');}catch(error){status(error.message,true);}});
 $('importConfig').addEventListener('click',()=>$('configFile').click());$('configFile').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>1024*1024)throw Error('設定JSONは1MiBまでです');const config=Core.normalize(JSON.parse(await file.text()));stop(null);epoch++;for(const key of ['A','B']){disposeEntry(entries[key]);entries[key]=entry();}model=config;setScene();refresh();status('設定を読み込みました。ローカル素材はファイルを再選択してください。');}catch(error){status('設定の読込失敗：'+error.message,true);}});
 document.addEventListener('keydown',event=>{if(event.code!=='Space'||event.repeat||event.target.closest('input,select,textarea,button'))return;event.preventDefault();if(playing)stop();else start([active]);});
 window.addEventListener('pagehide',()=>{stop(null);for(const e of Object.values(entries))disposeEntry(e);});
 window.addEventListener('resize',resize);new ResizeObserver(resize).observe($('arena'));
 window.FxLab=Object.freeze({getConfig:()=>Core.normalize(model),getPlayback:()=>({playing,lastSchedule:lastSchedule?{...lastSchedule}:null,frames:canvas.dataset.frame||null}),stop});
 setScene();refresh();resize();
})();
