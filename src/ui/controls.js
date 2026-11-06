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
  if(side==='player')app.selectedPlayer=app.selectedPlayer===id?null:id;
  else app.selectedBoss=app.selectedBoss===id?null:id;
  app.selectedCard=id;app.selectedSide=side;render();return;
 }
 if(app.mode!=='draft')return;
 app.selectedCard=id;app.selectedSide=side;$('cardDetailOverlay').hidden=false;updateCardDetail();activateDialog($('cardDetailOverlay'));
}
function updateCardDetail(){
 const id=app.selectedCard;if(!id)return;const spec=GameData.CARDS[id],side=app.selectedSide;
 $('cardDetailTitle').textContent=spec.name;
 $('cardDetailMeta').textContent=`${spec.cost}MP ／ ${spec.tags.map(t=>GameData.TAG_LABELS[t]).join('＋')} ／ 基本CD${spec.cd}`;
 $('cardDetailText').textContent=cardDescription(id);$('cardDetailStatus').textContent=cardDetailStatus(id,side);
 const confirm=$('confirmCard');confirm.hidden=side!=='draft';confirm.textContent='この技を獲得';
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
  $('soundButton').addEventListener('click',()=>{toggle(panel.hidden);sound('ui_open');});
  $('audioClose').addEventListener('click',()=>toggle(false));
  for(const kind of ['bgm','se']){
    $(kind+'Enabled').addEventListener('change',event=>GameAudio.toggle(kind,event.target.checked));
    $(kind+'Volume').addEventListener('input',event=>{GameAudio.volume(kind,event.target.value/100);$(kind+'VolumeText').textContent=event.target.value+'%';});
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape')toggle(false);});
}

// Clamp expanded descriptions, then separate the two panels without moving the card row.
function positionCardDetails(){
 if(!document.querySelectorAll)return;
 const panels=[...document.querySelectorAll('.inline-card-details')];
 const shift=(el,x,y=0)=>{const parent=el.parentElement,scale=parent.getBoundingClientRect().width/parent.offsetWidth||1;el.style.setProperty('--detail-x',x/scale+'px');el.style.setProperty('--detail-y',y/scale+'px');};
 for(const panel of panels){const r=panel.getBoundingClientRect();shift(panel,Math.max(8-r.left,Math.min(0,innerWidth-8-r.right)));}
 // On PC keep the permanently visible HP/MP HUDs clear as well.
 if(innerWidth>760&&panels.length){
  const obstacles=[...document.querySelectorAll('.player-status,.boss-hud')].map(n=>n.getBoundingClientRect());
  const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  const options=panels.map(panel=>{const r=panel.getBoundingClientRect();return {panel,r,candidates:[r.left,8,innerWidth-r.width-8,...obstacles.map(h=>h.right+10)]};});
  let best=null;
  for(const x of options[0].candidates)for(const y of (options[1]?options[1].candidates:[0])){
   const lefts=[x,y],rs=options.map((o,i)=>({...o.r,left:lefts[i],right:lefts[i]+o.r.width,top:o.r.top,bottom:o.r.bottom}));
   if(rs.some(r=>r.left<8||r.right>innerWidth-8||obstacles.some(h=>intersects(r,h)))||(rs[1]&&intersects(rs[0],rs[1])))continue;
   const cost=options.reduce((sum,o,i)=>sum+Math.abs(lefts[i]-o.r.left),0);
   if(!best||cost<best.cost)best={lefts,cost};
  }
  if(best){options.forEach((o,i)=>{const scale=o.panel.parentElement.getBoundingClientRect().width/o.panel.parentElement.offsetWidth||1;
   shift(o.panel,(parseFloat(o.panel.style.getPropertyValue('--detail-x'))||0)*scale+best.lefts[i]-o.r.left);});return;}
 }
 if(panels.length<2)return;
 const own=panels.find(p=>p.parentElement.dataset.side==='player'),enemy=panels.find(p=>p.parentElement.dataset.side==='boss');
 if(!own||!enemy)return;
 let a=own.getBoundingClientRect(),b=enemy.getBoundingClientRect();
 if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top){
  const desired=b.left>a.width+16?8:innerWidth-a.width-8;
  const original=parseFloat(own.style.getPropertyValue('--detail-x'))||0,scale=own.parentElement.getBoundingClientRect().width/own.parentElement.offsetWidth||1;
  shift(own,original*scale+desired-a.left);
  a=own.getBoundingClientRect();
  if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top){
   const next=Math.min(innerHeight-a.height-8,b.bottom+8);
   shift(own,(parseFloat(own.style.getPropertyValue('--detail-x'))||0)*scale,next-a.top);
   a=own.getBoundingClientRect();
   if(a.top<b.bottom){const es=enemy.parentElement.getBoundingClientRect().width/enemy.parentElement.offsetWidth||1;
    shift(enemy,(parseFloat(enemy.style.getPropertyValue('--detail-x'))||0)*es,Math.max(8-b.top,a.top-b.height-8-b.top));}
  }
 }
}
