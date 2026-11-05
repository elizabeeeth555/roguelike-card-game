'use strict';
let dialogReturnFocus=null;
function activateDialog(overlay){
  dialogReturnFocus=document.activeElement;
  const target=overlay.querySelector('button:not([disabled])');if(target)target.focus();
}
function closeCardDetail(){
  $('cardDetailOverlay').hidden=true;app.selectedCard=null;
  if(dialogReturnFocus&&dialogReturnFocus.isConnected)dialogReturnFocus.focus();dialogReturnFocus=null;
}
function openCardDetail(id,side){
  app.selectedCard=id;app.selectedSide=side;$('cardDetailOverlay').hidden=false;updateCardDetail();activateDialog($('cardDetailOverlay'));
}
function updateCardDetail(){
  const id=app.selectedCard;if(!id)return;
  const spec=GameData.CARDS[id],side=app.selectedSide;
  $('cardDetailTitle').textContent=spec.name;
  $('cardDetailMeta').textContent=`コスト ${spec.cost} ／ ${spec.tags.map(tag=>GameData.TAG_LABELS[tag]).join('＋')} ／ ${spec.cd?'CD'+spec.cd:'CDなし'}`;
  $('cardDetailText').textContent=cardDescription(id);
  let status=cardStatusText(id,side);
  if(app.battle&&['boss','player'].includes(side)){
    const actor=app.battle.actors[side],ready=actor.readyOn[id]||0;
    if(ready>actor.ownTurn)status+=` ／ 自ターン${ready}から再使用可能`;
    if(spec.tags.includes('attack')){
      const target=app.battle.actors[GameBattle.other(side)];
      const raw=GameCardEffects.plan(id,actor,target).find(effect=>effect.kind==='damage');
      const actual=GameMath.damage(raw.amount,actor.attackBonus,actor.weak,target.barrier);
      status+=` ／ 現在のHPダメージ ${actual.damage}（バリア吸収 ${actual.blocked}）`;
    }
  }
  $('cardDetailStatus').textContent=app.busy&&side==='player'?'演出中 ／ '+status:status;
  const confirm=$('confirmCard');confirm.hidden=!['draft','player'].includes(side);
  confirm.textContent=side==='draft'?'この技を獲得':'使用する';
  confirm.disabled=side==='draft'?app.mode!=='draft'||!app.draftOptions.includes(id):app.busy||!app.battle||!GameBattle.availability(app.battle,'player',id).allowed;
}
function setupDialogs(){
  $('closeCardDetail').addEventListener('click',closeCardDetail);
  $('confirmCard').addEventListener('click',()=>{const id=app.selectedCard,side=app.selectedSide;closeCardDetail();if(side==='draft')acquireDraft(id);else useCard(id);});
  $('cardDetailOverlay').addEventListener('click',event=>{if(event.target===$('cardDetailOverlay'))closeCardDetail();});
  document.addEventListener('keydown',event=>{
    const overlay=!$('resultOverlay').hidden?$('resultOverlay'):!$('cardDetailOverlay').hidden?$('cardDetailOverlay'):null;
    if(!overlay)return;
    if(event.key==='Escape'&&overlay===$('cardDetailOverlay')){event.preventDefault();closeCardDetail();}
    if(event.key==='Tab'){
      const buttons=[...overlay.querySelectorAll('button:not([disabled]):not([hidden])')];
      const first=buttons[0],last=buttons[buttons.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
}
function setupLogToggle(){
  $('logToggle').addEventListener('click',()=>{
    app.logOpen=!app.logOpen;$('logPanel').classList.toggle('expanded',app.logOpen);
    $('logToggle').setAttribute('aria-expanded',String(app.logOpen));sound(app.logOpen?'ui_open':'ui_close');
  });
}
function setupInfoTooltips(){
  const tooltip=$('infoTooltip');let pinned=null;
  function hide(){tooltip.hidden=true;pinned=null;}
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
