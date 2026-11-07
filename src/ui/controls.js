'use strict';
let dialogReturnFocus=null;
let clearInfoTooltip=()=>{};
function canInspectBattle(){return app.mode==='battle'&&app.battle&&!app.battle.end&&app.battle.active==='player'&&(!app.busy||app.playerAnimating)&&$('endTurnOverlay').hidden;}
function canChangeBattle(){return app.mode==='battle'&&app.battle&&!app.battle.end&&app.battle.active==='player'&&!app.busy&&$('endTurnOverlay').hidden;}
function activateDialog(overlay){dialogReturnFocus=document.activeElement;const target=overlay.querySelector('button:not([disabled])');if(target)target.focus();}
function closeCardDetail(side){
 if(side==='player')app.selectedPlayer=null;
 else if(side==='boss')app.selectedBoss=null;
 else{app.selectedPlayer=null;app.selectedBoss=null;}
 $('cardDetailOverlay').hidden=true;app.selectedCard=null;
 if(dialogReturnFocus&&dialogReturnFocus.isConnected)dialogReturnFocus.focus();dialogReturnFocus=null;
 if(app.mode==='battle'&&app.battle)render();
}
function openCardDetail(id,side){
 if(!GameData.CARDS[id])return;
 if(['player','boss'].includes(side)){
  if(!canInspectBattle()||!app.battle.actors[side].deck.includes(id))return;
  if(side==='player'){app.selectedPlayer=app.selectedPlayer===id?null:id;app.selectedBoss=null;}
  else{app.selectedBoss=app.selectedBoss===id?null:id;app.selectedPlayer=null;}
  app.selectedCard=id;app.selectedSide=side;render();return;
 }
 if(app.mode!=='draft')return;
 app.selectedCard=id;app.selectedSide=side;$('cardDetailOverlay').hidden=false;updateCardDetail();activateDialog($('cardDetailOverlay'));
}
function updateCardDetail(){
 const id=app.selectedCard;if(!id)return;const spec=GameData.CARDS[id],side=app.selectedSide;
 $('cardDetailTitle').textContent=spec.name;
 $('cardDetailMeta').hidden=true;$('cardDetailStatus').hidden=true;
 $('cardDetailText').textContent=cardDescription(id);
 const confirm=$('confirmCard');confirm.hidden=side!=='draft';confirm.textContent='このスキルを選択';
 confirm.disabled=app.mode!=='draft'||!app.draftOptions.includes(id);
}
function closeEndTurn(){
 $('endTurnOverlay').hidden=true;
 if(app.mode==='battle')render();
 if(dialogReturnFocus&&dialogReturnFocus.isConnected)dialogReturnFocus.focus();dialogReturnFocus=null;
}
function setupDialogs(){
 $('closeCardDetail').addEventListener('click',closeCardDetail);
 $('confirmCard').addEventListener('click',()=>{const id=app.selectedCard,side=app.selectedSide;if(side!=='draft')return;closeCardDetail();acquireDraft(id);});
 $('cardDetailOverlay').addEventListener('click',e=>{if(e.target===$('cardDetailOverlay'))closeCardDetail();});
 $('cancelEndTurn').addEventListener('click',closeEndTurn);
 $('confirmEndTurn').addEventListener('click',()=>{if($('endTurnOverlay').hidden)return;closeEndTurn();endTurn(true);});
 $('endTurnOverlay').addEventListener('click',e=>{if(e.target===$('endTurnOverlay'))closeEndTurn();});
 document.addEventListener('click',e=>{
  if(app.mode!=='battle'||!canInspectBattle())return;
  if(e.target.closest('.game-card')||e.target.closest('.modal-overlay')||e.target.closest('.info-trigger'))return;
  if(app.selectedPlayer||app.selectedBoss){closeCardDetail();render();}
 });
 document.addEventListener('keydown',e=>{
  const overlay=!$('resultOverlay').hidden?$('resultOverlay'):!$('endTurnOverlay').hidden?$('endTurnOverlay'):!$('cardDetailOverlay').hidden?$('cardDetailOverlay'):null;
  if(e.key==='Escape'){
   if(!$('endTurnOverlay').hidden)closeEndTurn();else{closeCardDetail();if(app.mode==='battle')render();}
  }
  if(!overlay||e.key!=='Tab')return;
  const buttons=[...overlay.querySelectorAll('button:not([disabled]):not([hidden])')],first=buttons[0],last=buttons[buttons.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
}
function setupLogToggle(){
 const set=open=>{app.logOpen=open;$('logPanel').classList.toggle('expanded',open);$('logToggle').setAttribute('aria-expanded',String(open));if(open&&app.logFollow!==false)$('combatLog').scrollTop=$('combatLog').scrollHeight;sound(open?'ui_open':'ui_close');};
 $('combatLog').addEventListener('scroll',()=>{if(app.logOpen){const l=$('combatLog');app.logFollow=l.scrollHeight-l.scrollTop-l.clientHeight<36;}});
 $('logToggle').addEventListener('click',()=>set(!app.logOpen));$('logClose').addEventListener('click',()=>set(false));
}
function setupInfoTooltips(){
  const tooltip=$('infoTooltip');let pinned=null;
  function hide(){tooltip.hidden=true;pinned=null;}
  clearInfoTooltip=hide;
  function show(button){
    tooltip.textContent=button.dataset.info;tooltip.hidden=false;
    const rect=button.getBoundingClientRect();
    tooltip.style.left=Math.max(10,Math.min(window.innerWidth-tooltip.offsetWidth-10,rect.left))+'px';
    tooltip.style.top=Math.max(8,Math.min(window.innerHeight-tooltip.offsetHeight-8,rect.bottom+8))+'px';
  }
  document.addEventListener('pointerover',event=>{const b=event.target.closest('.info-trigger');if(b&&event.pointerType!=='touch'&&!pinned)show(b);});
  document.addEventListener('pointerout',event=>{if(event.target.closest('.info-trigger')&&!pinned)tooltip.hidden=true;});
  document.addEventListener('focusin',event=>{const b=event.target.closest('.info-trigger');if(b)show(b);});
  document.addEventListener('focusout',()=>{if(!pinned)tooltip.hidden=true;});
  document.addEventListener('click',event=>{const b=event.target.closest('.info-trigger');if(!b){hide();return;}if(pinned===b)hide();else{pinned=b;show(b);}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  window.addEventListener('resize',hide);document.addEventListener('scroll',hide,true);
}
function setupAudioMenu(){
  const panel=$('audioPanel');
  const toggle=open=>{panel.hidden=!open;$('soundButton').setAttribute('aria-expanded',String(open));};
  const settings=open=>{$('settingsPanel').hidden=!open;$('settingsButton').setAttribute('aria-expanded',String(open));};
  $('settingsButton').addEventListener('click',()=>{const open=$('settingsPanel').hidden;toggle(false);settings(open);});
  $('settingsClose').addEventListener('click',()=>settings(false));
  $('soundButton').addEventListener('click',()=>{const open=panel.hidden;settings(false);toggle(open);sound('ui_open');});
  $('audioClose').addEventListener('click',()=>toggle(false));
  for(const kind of ['bgm','se']){
    $(kind+'Enabled').addEventListener('change',event=>GameAudio.toggle(kind,event.target.checked));
    $(kind+'Volume').addEventListener('input',event=>{GameAudio.volume(kind,event.target.value/100);$(kind+'VolumeText').textContent=event.target.value+'%';});
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){toggle(false);settings(false);}});
  document.addEventListener('click',event=>{if(!event.target.closest('#audioPanel,#settingsPanel,#settingsButton,#soundButton')){toggle(false);settings(false);}});
}

// Keep the selected panel anchored; clamp only its independent detail and use controls.
function positionCardDetails(){
 if(!document.querySelectorAll)return;
 for(const card of document.querySelectorAll('.game-card.selected')){
  card.style.setProperty('--card-shift-x','0px');card.style.setProperty('--card-shift-y','0px');
  const detail=card.querySelector('.inline-card-details'),use=card.querySelector('.card-use');
  if(detail){
   detail.style.setProperty('--detail-shift-x','0px');detail.style.setProperty('--detail-shift-y','0px');
   const r=detail.getBoundingClientRect(),dx=Math.max(8-r.left,Math.min(0,window.innerWidth-8-r.right)),dy=Math.max(8-r.top,Math.min(0,window.innerHeight-8-r.bottom));
   detail.style.setProperty('--detail-shift-x',dx+'px');detail.style.setProperty('--detail-shift-y',dy+'px');
  }
  if(use){const r=card.getBoundingClientRect(),width=Math.min(170,window.innerWidth-16);use.style.setProperty('--use-width',width+'px');use.style.setProperty('--use-shift-x',Math.max(8-(r.left+r.width/2-width/2),Math.min(0,window.innerWidth-8-(r.left+r.width/2+width/2)))+'px');use.style.setProperty('--use-shift-y','0px');const u=use.getBoundingClientRect();use.style.setProperty('--use-shift-y',Math.max(8-u.top,Math.min(0,window.innerHeight-8-u.bottom))+'px');}

 }
}
window.addEventListener('resize',()=>{if(app.mode==='battle')positionCardDetails();});
