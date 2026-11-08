/* Optional WebAudio sound layers for FX Lab. Local files are never uploaded. */
(function(root){
 'use strict';
 const $=id=>document.getElementById(id), Core=FxLabCore, Media=FxLabMedia;
 const cache={A:[],B:[]};
 let getKey,getProfile,notify,halt,report;
 function entry(){return {buffer:null,file:null,token:0,loading:false};}
 function runtime(key,n){while(cache[key].length<=n)cache[key].push(entry());return cache[key][n];}
 function dispose(e){if(!e)return;e.token++;e.buffer=null;e.file=null;e.loading=false;}
 function disposeAll(){for(const key of ['A','B']){for(const e of cache[key])dispose(e);cache[key]=[];}}
 function isLoading(key){return cache[key].some(e=>e.loading);}
 function checkChange(key,n,update,rollback){
  const profile=getProfile(key);
  update();
  try{Core.profile(profile);halt();notify();report('追加SEを更新しました。');}
  catch(error){rollback();report('追加SEの設定エラー：'+error.message,true);}
  render();
 }
 async function load(key,n,file){
  const profile=getProfile(key),item=profile.soundLayers[n],e=runtime(key,n),token=++e.token;
  if(!item||item.sound.kind!=='local')return;
  e.loading=true;halt();render();let buffer;
  try{
   if(!/\.(wav|mp3|ogg)$/i.test(file.name))throw Error('WAV / MP3 / OGGを選択してください');
   buffer=await Media.sound(file);
   if(token!==e.token||!getProfile(key).soundLayers.includes(item))return;
   e.buffer=buffer;e.file=file;
   item.sound={kind:'local',file:{name:file.name,size:file.size,lastModified:file.lastModified}};
   notify();report('追加SEを読み込みました。');render();
  }catch(error){if(token===e.token)report('追加SEの読み込み失敗：'+error.message,true);}
  finally{if(token===e.token){e.loading=false;render();}}
 }
 function render(){
  const target=$('soundLayers');if(!target||!getKey)return;
  target.replaceChildren();
  const key=getKey(),profile=getProfile(key),layers=profile.soundLayers;
  const head=document.createElement('div');head.className='sound-layer-head';
  const title=document.createElement('strong');title.textContent='追加SE（'+layers.length+'/3）';
  const add=document.createElement('button');add.type='button';add.textContent='＋追加';add.className='quiet';add.disabled=layers.length>=3;
  add.addEventListener('click',()=>{
   if(layers.length>=3)return;
   layers.push({label:'追加SE '+(layers.length+1),enabled:true,sound:{kind:'builtin',id:'hit_light'},volume:.5,delayMs:0});
   runtime(key,layers.length-1);halt();notify();render();
  });
  head.append(title,add);target.append(head);
  const hint=document.createElement('p');hint.className='asset-info';
  hint.textContent='メインSEとは独立して最大3音。遅延0ms＝映像と同時、負数＝映像より先。A/Bごとに別設定。';
  target.append(hint);
  layers.forEach((l,n)=>{
   const e=runtime(key,n),box=document.createElement('section');
   box.className='sound-layer-card';box.dataset.index=String(n);
   box.innerHTML='<div class="sound-layer-head"><input data-label aria-label="追加SE名" maxlength="60"><button type="button" data-remove>削除</button></div>'+
     '<label class="check"><input data-enabled type="checkbox">再生する</label>'+
     '<label>SE素材<select data-source></select></label>'+
     '<label data-picker class="file-picker" hidden>この音声を選ぶ<input data-file type="file" accept=".wav,.mp3,.ogg,audio/wav,audio/mpeg,audio/ogg"></label>'+
     '<p data-info class="asset-info"></p>'+
     '<label>個別音量 <output data-volume-out></output><input data-volume type="range" min="0" max="1" step="0.01"></label>'+
     '<label>開始遅延（ms）<input data-delay type="number" min="-1000" max="2000" step="10"></label>';
   const input=sel=>box.querySelector(sel);
   input('[data-label]').value=l.label;
   input('[data-enabled]').checked=l.enabled;
   const select=input('[data-source]');
   for(const id of Core.SE){const option=document.createElement('option');option.value=id;option.textContent='本編SE：'+id;select.append(option);}
   const localOption=document.createElement('option');localOption.value='local';localOption.textContent='ローカルのSEを選ぶ';select.append(localOption);
   const noneOption=document.createElement('option');noneOption.value='none';noneOption.textContent='SEなし';select.append(noneOption);
   select.value=l.sound.kind==='builtin'?l.sound.id:l.sound.kind;
   input('[data-picker]').hidden=l.sound.kind!=='local';
   input('[data-info]').textContent=e.loading?'読み込み中…':l.sound.kind==='none'?'このレイヤーは無音です。':l.sound.kind==='builtin'?'本編SE：'+l.sound.id:e.buffer?'読込済み：'+e.file.name:l.sound.file?'再選択が必要：'+l.sound.file.name:'音声未選択';
   input('[data-volume]').value=String(l.volume);
   input('[data-volume-out]').textContent=Math.round(l.volume*100)+'%';
   input('[data-delay]').value=String(l.delayMs);
   input('[data-remove]').addEventListener('click',()=>{
    const removed=runtime(key,n);dispose(removed);layers.splice(n,1);cache[key].splice(n,1);
    halt();notify();render();
   });
   input('[data-label]').addEventListener('change',()=>{
    const previous=l.label,proposed=input('[data-label]').value;
    checkChange(key,n,()=>{l.label=proposed;},()=>{l.label=previous;});
   });
   input('[data-enabled]').addEventListener('change',()=>{
    const previous=l.enabled,proposed=input('[data-enabled]').checked;
    checkChange(key,n,()=>{l.enabled=proposed;},()=>{l.enabled=previous;});
   });
   select.addEventListener('change',()=>{
    const previous=l.sound,value=select.value;
    const proposed=value==='local'?{kind:'local',file:null}:value==='none'?{kind:'none'}:{kind:'builtin',id:value};
    checkChange(key,n,()=>{l.sound=proposed;},()=>{l.sound=previous;});
    if(l.sound===proposed)dispose(e);
    render();
   });
   input('[data-file]').addEventListener('change',ev=>{
    const file=ev.target.files[0];ev.target.value='';if(file)load(key,n,file);
   });
   input('[data-volume]').addEventListener('change',()=>{
    const previous=l.volume,proposed=Number(input('[data-volume]').value);
    checkChange(key,n,()=>{l.volume=proposed;},()=>{l.volume=previous;});
   });
   input('[data-delay]').addEventListener('change',()=>{
    const previous=l.delayMs,proposed=Number(input('[data-delay]').value);
    checkChange(key,n,()=>{l.delayMs=proposed;},()=>{l.delayMs=previous;});
   });
   target.append(box);
  });
 }
 async function prepare(key,builtIn){
  const tracks=[],layers=getProfile(key).soundLayers;
  for(let n=0;n<layers.length;n++){
   const l=layers[n];if(!l.enabled||l.sound.kind==='none')continue;
   const e=runtime(key,n);if(e.loading)throw Error('追加SE '+(n+1)+' の読み込みが完了していません');
   let buffer;
   if(l.sound.kind==='builtin')buffer=await builtIn(l.sound.id);
   else{buffer=e.buffer;if(!buffer)throw Error('追加SE '+(n+1)+' のファイルを再選択してください');}
   tracks.push({buffer,delayMs:l.delayMs,volume:l.volume,kind:'layer',index:n});
  }
  return tracks;
 }
 function init(options){({getKey,getProfile,notify,halt,report}=options);render();}
 root.FxLabSoundLayers=Object.freeze({init,render,prepare,isLoading,disposeAll});
})(globalThis);
