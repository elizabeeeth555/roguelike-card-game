'use strict';
// Ver.0.9.4: extracted unchanged from Ver.0.9.3.
function setupLogToggle(){const btn=$('logToggle');btn.addEventListener('click',()=>{sound(logOpen?'ui_close':'ui_open');logOpen=!logOpen;$('logPanel').classList.toggle('expanded',logOpen);$('logPanel').classList.toggle('collapsed',!logOpen);btn.setAttribute('aria-expanded',String(logOpen));btn.textContent=logOpen?'ログを閉じる −':'ログを開く ＋';if(logOpen)$('combatLog').scrollTop=$('combatLog').scrollHeight;});}

function setupInfoTooltips(){const tooltip=$('infoTooltip');let pinned=null;function show(button){if(!button?.dataset?.info)return;const [heading,...text]=button.dataset.info.split('|');tooltip.replaceChildren();const h=document.createElement('strong');h.textContent=heading;const d=document.createElement('div');d.textContent=text.join('|');tooltip.append(h,d);tooltip.hidden=false;const rect=button.getBoundingClientRect(),w=tooltip.offsetWidth,hgt=tooltip.offsetHeight;tooltip.style.left=Math.max(10,Math.min(window.innerWidth-w-10,rect.left+rect.width/2-w/2))+'px';tooltip.style.top=(rect.top-hgt-10>=8?rect.top-hgt-8:Math.min(window.innerHeight-hgt-8,rect.bottom+8))+'px';}function hide(){tooltip.hidden=true;}
 document.addEventListener('pointerover',e=>{const b=e.target.closest('.info-trigger');if(b&&e.pointerType!=='touch'&&!pinned)show(b);});document.addEventListener('pointerout',e=>{const b=e.target.closest('.info-trigger');if(b&&!b.contains(e.relatedTarget)&&!pinned)hide();});document.addEventListener('focusin',e=>{const b=e.target.closest('.info-trigger');if(b&&!pinned)show(b);});document.addEventListener('focusout',e=>{if(e.target.closest('.info-trigger')&&!pinned)hide();});document.addEventListener('click',e=>{const b=e.target.closest('.info-trigger');if(b){if(pinned===b){pinned=null;hide();}else{pinned=b;show(b);}return;}if(pinned){pinned=null;hide();}});document.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=null;hide();}});
}

function setupAudioMenu(){
 const panel=$('audioPanel'),btn=$('soundButton');
 function toggle(open){panel.hidden=!open;btn.setAttribute('aria-expanded',String(open));}
 btn.addEventListener('click',()=>{toggle(panel.hidden);sound('ui_open');});
 $('audioClose').addEventListener('click',()=>{toggle(false);sound('ui_close');});
 $('bgmEnabled').addEventListener('change',e=>GameAudio.toggle('bgm',e.target.checked));
 $('seEnabled').addEventListener('change',e=>{GameAudio.toggle('se',e.target.checked);sound('ui_confirm');});
 $('bgmVolume').addEventListener('input',e=>{GameAudio.volume('bgm',e.target.value/100);$('bgmVolumeText').textContent=e.target.value+'%';});
 $('seVolume').addEventListener('input',e=>{GameAudio.volume('se',e.target.value/100);$('seVolumeText').textContent=e.target.value+'%';});
 panel.querySelectorAll('[data-test-se]').forEach(b=>b.addEventListener('click',()=>sound(b.dataset.testSe)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false);});
}
