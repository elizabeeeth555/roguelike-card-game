/* Local-only layered visual material preview. 3 optional overlays per A/B pattern. */
(function(root){
 'use strict';
 const $=id=>document.getElementById(id), Core=FxLabCore, Media=FxLabMedia;
 const cache={A:[],B:[]};
 let getKey,getProfile,notify,halt,anchor,raf=0,runId=0;
 function entry(){return {asset:null,files:[],token:0,loading:false};}
 function getEntry(key,n){while(cache[key].length<=n)cache[key].push(entry());return cache[key][n];}
 function dispose(e){if(!e)return;e.token++;Media.dispose(e.asset);e.asset=null;e.files=[];e.loading=false;}
 function stop(){runId++;if(raf)cancelAnimationFrame(raf);raf=0;$('layerStage')?.replaceChildren();}
 function disposeAll(){stop();for(const key of ['A','B']){for(const e of cache[key])dispose(e);cache[key]=[];}}
 function clean(n){const a=getProfile(getKey()).layers,e=cache[getKey()][n];a.splice(n,1);if(e)dispose(e);cache[getKey()].splice(n,1);halt();notify();render();}
 function change(n,field,value){
  const item=getProfile(getKey()).layers[n],previous=item[field];item[field]=value;
  try{Core.profile(getProfile(getKey()));halt();notify();}catch(err){item[field]=previous;alert(err.message);}
  render();
 }
 async function load(n,files){
  const key=getKey(),i=getProfile(key).layers[n],e=getEntry(key,n),token=++e.token,format=i.visual.format;
  e.loading=true;halt();render();let asset;
  try{
   asset=await Media.visual(files,format);
   if(token!==e.token){Media.dispose(asset);return;}
   Media.dispose(e.asset);e.asset=asset;e.files=files;
   i.visual={kind:'local',format,files:files.map(f=>({name:f.name,size:f.size,lastModified:f.lastModified}))};
   notify();render();
  }catch(err){Media.dispose(asset);if(token===e.token)alert('レイヤー素材の読み込み失敗：'+err.message);}
  finally{if(token===e.token){e.loading=false;render();}}
 }
 function fieldHTML(name,label,type,value,min,max,step='1'){
  if(type==='checkbox')return '<label class="check"><input data-field="'+name+'" type="checkbox" '+(value?'checked':'')+'>'+label+'</label>';
  return '<label>'+label+'<input data-field="'+name+'" type="'+type+'" value="'+value+'" min="'+min+'" max="'+max+'" step="'+step+'"></label>';
 }
 function render(){
  const root=$('layerControls');if(!root)return;const key=getKey(),layers=getProfile(key).layers;
  root.replaceChildren();
  const top=document.createElement('div');top.className='layer-heading';
  const title=document.createElement('strong');title.textContent='追加映像レイヤー（'+layers.length+'/3）';
  const add=document.createElement('button');add.textContent='＋追加';add.disabled=layers.length>=3;add.type='button';
  add.onclick=()=>{
   const l={label:'レイヤー '+(layers.length+2),enabled:true,visual:{kind:'local',format:'image',files:[]},delayMs:0,x:0,y:0,size:200,speed:1,opacity:1,rotation:0,flipX:false,fps:24,columns:4,rows:4,frameCount:16,holdMs:900};
   layers.push(l);getEntry(key,layers.length-1);halt();notify();render();
  };
  top.append(title,add);root.append(top);
  const hint=document.createElement('p');hint.className='layer-meta';hint.textContent='斬撃・火花・衝撃波を重ねられます。A/Bで別設定。素材はPC内で読み込み、JSONにはファイル名だけ保存されます。';
  root.append(hint);
  layers.forEach((l,n)=>{
   const e=getEntry(key,n),box=document.createElement('section');box.className='layer-card';box.dataset.index=String(n);
   box.innerHTML='<div class="layer-heading"><input aria-label="レイヤー名" maxlength="60" data-field="label"><button type="button" data-remove>削除</button></div>'+
    fieldHTML('enabled','有効','checkbox',l.enabled)+
    '<label>素材形式<select data-field="format"><option value="image">PNG / APNG / WebP</option><option value="sequence">PNG連番</option><option value="sheet">スプライトシート</option></select></label>'+
    '<label class="file-picker">このレイヤーの画像ファイル<input type="file" data-files accept=".png,.apng,.webp" multiple></label>'+
    '<p class="layer-meta" data-file-status></p>'+
    '<div class="two">'+
    fieldHTML('delayMs','開始遅延 (ms)','number',l.delayMs,0,2000,10)+
    fieldHTML('speed','再生速度 (倍)','number',l.speed,.25,2,.05)+
    fieldHTML('x','X座標 (px)','number',l.x,-600,600)+
    fieldHTML('y','Y座標 (px)','number',l.y,-600,600)+
    fieldHTML('size','表示サイズ (px)','number',l.size,32,1000)+
    fieldHTML('opacity','透明度 (0〜1)','number',l.opacity,0,1,.05)+
    fieldHTML('rotation','回転 (°)','number',l.rotation,-180,180)+
    fieldHTML('holdMs','静止画表示 (ms)','number',l.holdMs,200,5000,50)+
    '</div>'+
    fieldHTML('flipX','左右反転','checkbox',l.flipX)+
    '<div class="two" data-frame>'+
    fieldHTML('fps','FPS','number',l.fps,1,120)+
    fieldHTML('columns','列数','number',l.columns,1,32)+
    fieldHTML('rows','行数','number',l.rows,1,32)+
    fieldHTML('frameCount','フレーム数','number',l.frameCount,1,300)+
    '</div>';
   box.querySelector('[data-field=label]').value=l.label;
   box.querySelector('[data-field=format]').value=l.visual.format;
   box.querySelector('[data-frame]').hidden=l.visual.format==='image';
   box.querySelector('[data-file-status]').textContent=e.loading?'素材を読み込んでいます…':e.asset?'読込済み：'+e.files.map(f=>f.name).join(' / '):l.visual.files.length?'再選択が必要：'+l.visual.files.map(f=>f.name).join(' / '):'画像未選択';
   box.querySelector('[data-remove]').onclick=()=>clean(n);
   box.querySelector('[data-files]').addEventListener('change',ev=>{const files=[...ev.target.files];ev.target.value='';if(files.length)load(n,files);});
   box.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('change',()=>{
    const field=input.dataset.field,value=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;
    if(field==='format'){
     if(value===l.visual.format)return;
     const old=getEntry(key,n);dispose(old);
     const prev=l.visual;l.visual={kind:'local',format:value,files:[]};
     try{Core.profile(getProfile(key));halt();notify();}catch(err){l.visual=prev;alert(err.message);}
     render();
    }else change(n,field,value);
   }));
   root.append(box);
  });
 }
 function durations(asset,l){
  if(asset.kind==='frames')return asset.frames.map(f=>f.duration);
  if(asset.kind==='sequence'||l.visual.format==='sheet')return Array(l.visual.format==='sheet'?l.frameCount:asset.frames.length).fill(1000/l.fps);
  return null;
 }
 function duration(l,asset){
  if(asset.kind==='native'||(asset.kind==='static'&&l.visual.format!=='sheet'))return l.holdMs;
  const ds=durations(asset,l);return ds.reduce((a,b)=>a+b,0)/l.speed;
 }
 function prepare(key){
  let ms=0;const layers=getProfile(key).layers;
  for(let n=0;n<layers.length;n++){
   const l=layers[n],e=getEntry(key,n);if(!l.enabled)continue;
   if(e.loading)throw Error('追加レイヤー '+(n+1)+' の読込が完了していません');
   if(!e.asset)throw Error('追加レイヤー '+(n+1)+' の素材を選択してください');
   if(l.visual.format==='sheet'){
    const a=e.asset;if(a.kind!=='static'||a.width%l.columns||a.height%l.rows)throw Error('追加シートの寸法が行×列で割り切れません');
   }
   ms=Math.max(ms,l.delayMs+duration(l,e.asset));
  }
  return ms;
 }
 function draw(frame,l,a,at,ctx){
  let img=a.image,sx=0,sy=0,sw,sh;
  if(a.kind==='sequence'||a.kind==='frames'){
   const ds=durations(a,l),index=Core.frameAt(ds,frame,l.speed);img=a.frames[index].image;
   sw=img.width;sh=img.height;
  }else if(l.visual.format==='sheet'){
   const index=Core.frameAt(durations(a,l),frame,l.speed);
   img=a.image;sw=img.width/l.columns;sh=img.height/l.rows;
   sx=(index%l.columns)*sw;sy=Math.floor(index/l.columns)*sh;
  }else{sw=img.width;sh=img.height;}
  const size=l.size/Math.max(sw,sh);
  ctx.save();ctx.translate(at.x+l.x,at.y+l.y);ctx.rotate(l.rotation*Math.PI/180);ctx.scale(l.flipX?-1:1,1);ctx.globalAlpha=l.opacity;
  ctx.drawImage(img,sx,sy,sw,sh,-sw*size/2,-sh*size/2,sw*size,sh*size);ctx.restore();
 }
 function play(key,wall,visualOffset){
  stop();const id=runId,items=[],scene=$('layerStage'),stage=$('arena'),profile=getProfile(key);
  for(let n=0;n<profile.layers.length;n++){
   const l=profile.layers[n],a=getEntry(key,n).asset;if(!l.enabled||!a)continue;
   const el=document.createElement(a.kind==='native'?'img':'canvas');el.className='layer-image';el.setAttribute('aria-hidden','true');
   let ctx=null,unit=1;
   if(a.kind==='native'){el.style.objectFit='contain';el.style.display='none';}
   else{unit=Math.min(2,window.devicePixelRatio||1);el.width=Math.round(stage.clientWidth*unit);el.height=Math.round(stage.clientHeight*unit);ctx=el.getContext('2d');ctx.setTransform(unit,0,0,unit,0,0);}
   scene.append(el);items.push({l,a,el,ctx});
  }
  if(!items.length)return;
  const impact=profile.playback.impact;
  function frame(now){
   if(id!==runId)return;
   const base=now-wall-visualOffset,clock=impact?FxLabImpact.elapsed(base,impact):base;
   let active=false;
   for(const {l,a,el,ctx} of items){
    const elapsed=clock-l.delayMs,total=duration(l,a);
    if(ctx)ctx.clearRect(0,0,stage.clientWidth,stage.clientHeight);
    if(elapsed<0){active=true;continue;}
    if(elapsed>=total){if(a.kind==='native')el.style.display='none';continue;}
    active=true;const at=anchor(profile.playback);
    if(a.kind==='native'){
     if(!el.src)el.src=a.url; // Start native animation on this layer's own delayed start.
     const w=l.size*a.width/Math.max(a.width,a.height),h=l.size*a.height/Math.max(a.width,a.height);
     el.style.width=w+'px';el.style.height=h+'px';el.style.left=(at.x+l.x-w/2)+'px';el.style.top=(at.y+l.y-h/2)+'px';
     el.style.opacity=l.opacity;el.style.transform='rotate('+l.rotation+'deg) scaleX('+(l.flipX?-1:1)+')';el.style.display='block';
    }else draw(elapsed,l,a,at,ctx);
   }
   if(active)raf=requestAnimationFrame(frame);else raf=0;
  }
  raf=requestAnimationFrame(frame);
 }
 function init(options){({getKey,getProfile,notify,halt,anchor}=options);render();}
 root.FxLabLayers=Object.freeze({init,render,stop,disposeAll,prepare,play});
})(globalThis);