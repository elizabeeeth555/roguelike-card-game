/* FX Lab impact preview. Local-only, independent of combat state. */
(function(root){
 'use strict';
 const $=id=>document.getElementById(id);
 const ids=['hitDelayMs','hitStopMs','shakePx','shakeMs','flashOpacity','flashMs','damageEnabled','damageText','damageX','damageY','damageSize','damageDelayMs','damageDurationMs','damageFont','damageMotion','damageColor','damageStrokeColor','damageStrokePx'];
 const faces=new Map(),faceTokens={A:0,B:0},timers=new Set(),animations=new Set();
 let getKey,getImpact,onChange,paused=[];
 const fonts={impact:'Impact, "Arial Black", sans-serif',serif:'Georgia, "Yu Mincho", serif',sans:'system-ui, "Yu Gothic", sans-serif',mono:'"Courier New", monospace'};
 function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);fn();},Math.max(0,ms));timers.add(id);}
 function animate(node,frames,options){const a=node.animate(frames,options);animations.add(a);a.onfinish=()=>animations.delete(a);return a;}
 function stop(){
  for(const t of timers)clearTimeout(t);timers.clear();
  for(const a of paused){try{a.play();}catch{}}paused=[];
  for(const a of animations){try{a.cancel();}catch{}}animations.clear();
  const flash=$('impactFlash'),number=$('damagePreview');
  if(flash)flash.style.opacity='0';
  if(number){number.hidden=true;number.textContent='';}
 }
 function clearFonts(){
  stop();
  for(const key of ['A','B'])faceTokens[key]++;
  for(const face of faces.values())try{document.fonts.delete(face);}catch{}
  faces.clear();
 }
 function previewFont(i,key){
  return i.damageFont==='local'&&faces.has(key)?'"FxLabCustom'+key+'", Impact, sans-serif':fonts[i.damageFont]||fonts.impact;
 }
 function refresh(i,key){
  if(!i)return;
  for(const id of ids){
   const el=$(id);if(!el)continue;
   if(el.type==='checkbox')el.checked=i[id];else el.value=i[id];
   const out=$(id+'ImpactOut');if(out)out.textContent=i[id]+(id==='flashOpacity'?'':/Ms$/.test(id)?' ms':/^(damageX|damageY|damageSize|shakePx|damageStrokePx)$/.test(id)?' px':'');
  }
  const f=$('damageFontInfo');
  if(f)f.textContent=i.damageFont==='local'?(faces.has(key)?'読込済み：'+(i.fontFile?.name||'ローカルフォント'):'要再選択：'+(i.fontFile?.name||'フォントファイル')):'任意の外部フォントを読み込むと「ローカル」に切り替わります。';
 }
 function init(options){
  ({getKey,getImpact,onChange}=options);
  for(const id of ids){
   const el=$(id);if(!el)throw Error('FX Lab impact control missing: '+id);
   el.addEventListener(el.type==='range'||el.type==='color'?'input':'change',()=>{
    const i=getImpact(),previous=i[id];i[id]=el.type==='checkbox'?el.checked:el.type==='range'||el.type==='number'?Number(el.value):el.value;
    if(onChange()===false){i[id]=previous;refresh(i,getKey());}
   });
  }
  $('damageFontFile').addEventListener('change',async event=>{
   const file=event.target.files?.[0];event.target.value='';if(!file)return;
   const key=getKey(),token=++faceTokens[key];
   try{
    if(!/\.(woff2?|ttf|otf)$/i.test(file.name)||file.size>4*1024*1024||!file.size)throw Error('WOFF2 / WOFF / TTF / OTF、4MiB以下のフォントを指定してください');
    if(typeof FontFace==='undefined')throw Error('このブラウザではローカルフォントを利用できません');
    const face=new FontFace('FxLabCustom'+key,await file.arrayBuffer());
    await face.load();
    if(token!==faceTokens[key])return;
    const old=faces.get(key);if(old)document.fonts.delete(old);
    document.fonts.add(face);faces.set(key,face);
    const i=getKey()===key?getImpact():null;
    if(i){i.damageFont='local';i.fontFile={name:file.name,size:file.size,lastModified:file.lastModified};onChange();}
    refresh(getImpact(),getKey());
   }catch(e){const f=$('damageFontInfo');if(f)f.textContent='読み込み失敗：'+e.message;}
  });
 }
 function elapsed(ms,i){
  if(ms<=i.hitDelayMs)return ms;
  if(ms<=i.hitDelayMs+i.hitStopMs)return i.hitDelayMs;
  return ms-i.hitStopMs;
 }
 function play(i,anchor,options={}){
  stop();
  const stage=$('arena'),number=$('damagePreview'),flash=$('impactFlash'),key=options.key||getKey();
  if(i.hitStopMs>0&&options.kind==='builtin')later(()=>{
   paused=[...$('combatFxLayer').getAnimations({subtree:true})].filter(a=>a.playState==='running');
   for(const a of paused)a.pause();
   later(()=>{for(const a of paused)a.play();paused=[];},i.hitStopMs);
  },i.hitDelayMs);
  later(()=>{
   if(i.shakePx>0&&i.shakeMs>0){
    const n=i.shakePx;
    animate(stage,[{transform:'translate(0,0)'},{transform:`translate(${n}px,${-n/2}px)`},{transform:`translate(${-n}px,${n/2}px)`},{transform:`translate(${n/2}px,${n}px)`},{transform:'translate(0,0)'}],{duration:i.shakeMs,easing:'ease-out'});
   }
   if(i.flashOpacity>0&&i.flashMs>0)animate(flash,[{opacity:0},{opacity:i.flashOpacity,offset:.22},{opacity:0}],{duration:i.flashMs,easing:'ease-out'});
  },i.hitDelayMs);
  if(i.damageEnabled)later(()=>{
   const at=anchor();
   number.hidden=false;number.textContent=i.damageText;
   number.style.left=(at.x+i.damageX)+'px';number.style.top=(at.y+i.damageY)+'px';
   number.style.fontFamily=previewFont(i,key);number.style.fontSize=i.damageSize+'px';
   number.style.color=i.damageColor;number.style.webkitTextStroke=i.damageStrokePx+'px '+i.damageStrokeColor;
   number.style.textShadow='0 2px 6px #000b';
   const rising=i.damageMotion==='rise',staticMode=i.damageMotion==='static';
   const frames=staticMode?[{opacity:1,transform:'translate(-50%,-50%)'},{opacity:1,offset:.8,transform:'translate(-50%,-50%)'},{opacity:0,transform:'translate(-50%,-50%)'}]:
    rising?[{opacity:0,transform:'translate(-50%,-20%) scale(.9)'},{opacity:1,offset:.16,transform:'translate(-50%,-50%) scale(1)'},{opacity:0,transform:'translate(-50%,-115%) scale(1)'}]:
    [{opacity:0,transform:'translate(-50%,-50%) scale(.55)'},{opacity:1,offset:.18,transform:'translate(-50%,-50%) scale(1.25)'},{opacity:1,offset:.48,transform:'translate(-50%,-50%) scale(1)'},{opacity:0,transform:'translate(-50%,-75%) scale(.95)'}];
   const a=animate(number,frames,{duration:i.damageDurationMs,easing:'ease-out'});
   a.onfinish=()=>{animations.delete(a);number.hidden=true;};
  },Math.max(0,i.hitDelayMs+i.damageDelayMs));
 }
 root.FxLabImpact=Object.freeze({init,refresh,stop,clearFonts,play,elapsed});
})(globalThis);
