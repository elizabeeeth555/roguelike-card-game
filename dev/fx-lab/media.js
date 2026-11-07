/* Local files stay in browser memory. Only built-in allowlisted URLs are fetched. */
(function(){
 'use strict';
 const limits=FxLabCore.LIMITS;let context;
 function audioContext(){if(!context)context=new (window.AudioContext||window.webkitAudioContext)();return context;}
 function checkFile(file){if(file.size>limits.fileBytes)throw Error('1ファイル64MiBまでです');}
 function checkPixels(width,height,total=0){if(width*height+total>limits.pixels)throw Error('展開画像の合計が32Mピクセルを超えます。短い連番などに分割してください');return total+width*height;}
 function dispose(asset){if(!asset)return;for(const f of asset.frames||[])f.image.close?.();asset.image?.close?.();if(asset.url)URL.revokeObjectURL(asset.url);}
 function animationInfo(bytes){
  const v=new DataView(bytes);if(v.byteLength>=8&&v.getUint32(0)===0x89504e47){for(let p=8;p+12<=v.byteLength;){const len=v.getUint32(p),tag=v.getUint32(p+4);if(p+12+len>v.byteLength)break;if(tag===0x6163544c)return {type:'image/png',animated:true};p+=12+len;}return {type:'image/png',animated:false};}
  if(v.byteLength>=12&&v.getUint32(0)===0x52494646&&v.getUint32(8)===0x57454250){for(let p=12;p+8<=v.byteLength;){const tag=v.getUint32(p),len=v.getUint32(p+4,true);if(tag===0x414e494d)return {type:'image/webp',animated:true};p+=8+len+(len%2);}return {type:'image/webp',animated:false};}
  throw Error('PNG / APNG / WebPを選択してください（拡張子だけでなく内容を検証します）');
 }
 async function imageAsset(file,animated=true){
  checkFile(file);const data=await file.arrayBuffer(),info=animationInfo(data);
  if(info.animated&&animated&&window.ImageDecoder&&await ImageDecoder.isTypeSupported(info.type)){
   let decoder;const frames=[];try{
    decoder=new ImageDecoder({data:new Uint8Array(data),type:info.type,preferAnimation:true});await decoder.tracks.ready;
    const count=decoder.tracks.selectedTrack.frameCount;if(count>limits.frames)throw Error('アニメーションは300フレームまでです');let pixels=0;
    for(let i=0;i<count;i++){const result=await decoder.decode({frameIndex:i,completeFramesOnly:true});try{pixels=checkPixels(result.image.displayWidth,result.image.displayHeight,pixels);const image=await createImageBitmap(result.image);frames.push({image,duration:Math.max(10,(result.image.duration||100000)/1000)});}finally{result.image.close();}}
    return {kind:'frames',frames,animated:true,native:false,format:info.type};
   }catch(error){for(const f of frames)f.image.close();if(/300フレーム|32Mピクセル/.test(error.message))throw error;}
   finally{decoder?.close();}
  }
  if(info.animated&&animated){const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();checkPixels(image.naturalWidth,image.naturalHeight);return {kind:'native',file,url,width:image.naturalWidth,height:image.naturalHeight,native:true};}catch(error){URL.revokeObjectURL(url);throw error;}}
  const image=await createImageBitmap(file);try{checkPixels(image.width,image.height);}catch(error){image.close();throw error;}return {kind:'static',image,width:image.width,height:image.height,native:false};
 }
 async function visual(files,format){
  if(!files.length)throw Error('映像ファイルを選択してください');if(files.length>limits.frames)throw Error('連番は300枚までです');
  if(format==='sequence'){const sorted=FxLabCore.natural(files),frames=[];let pixels=0;try{for(const file of sorted){if(!/\.png$/i.test(file.name))throw Error('連番はPNGのみです');const asset=await imageAsset(file,false);try{pixels=checkPixels(asset.width,asset.height,pixels);}catch(error){dispose(asset);throw error;}frames.push({image:asset.image,duration:0});}return {kind:'sequence',frames,native:false};}catch(error){for(const f of frames)f.image.close();throw error;}}
  if(files.length!==1)throw Error('画像/スプライトシートは1ファイルを選択してください');return imageAsset(files[0],format==='image');
 }
 async function sound(file){checkFile(file);return audioContext().decodeAudioData(await file.arrayBuffer());}
 window.FxLabMedia=Object.freeze({visual,sound,dispose,audioContext});
})();
