'use strict';
function sound(key){GameAudio.se(key);}
function addLog(message,kind='info'){
  const list=$('combatLog'),row=document.createElement('div');row.className='log-item '+kind;row.textContent=message;
  list.append(row);$('logPeek').textContent=message;list.scrollTop=list.scrollHeight;
}
function announce(message){$('arenaMessage').textContent=message;}
function clearEnemyAction(){app.enemyActiveKey=null;$('enemyActionToast').hidden=true;}
function clearBattleVisuals(){
  app.enemyUsedKeys.clear();clearEnemyAction();
  for(const id of ['enemyShadow','heroFigure'])$(id).classList.remove('hurt','casting');
  for(const id of ['bossHit','playerHit']){$(id).textContent='';$(id).classList.remove('active');}
  $('attackFx').className='attack-fx';
}
function characterInfo(id){return GAME_ASSETS.characterSets[id];}
function setCharacterImage(image,id,pose){
  const info=characterInfo(id),fallback=image.parentElement.querySelector('.portrait-fallback');
  const showFallback=()=>{image.hidden=true;if(fallback)fallback.hidden=false;};
  image.onerror=showFallback;
  const path=info&&info.enabled?info.images[pose]:null;
  if(!path){image.removeAttribute('src');showFallback();return;}
  image.onload=()=>{image.hidden=false;if(fallback)fallback.hidden=true;};
  showFallback();image.src=path;
}
function applyVisualAssets(){
  const state=app.battle;
  $('bossName').textContent=characterInfo(state.bossCharacterId).name;
  setCharacterImage($('bossPortrait'),state.bossCharacterId,'boss');
  setCharacterImage($('heroPortrait'),state.playerCharacterId,'back');
  setCharacterImage($('heroFace'),state.playerCharacterId,'face');
  const bg=GAME_ASSETS.background;
  $('arena').style.setProperty('--battle-art',bg?`url("${bg}")`:'none');
}
function effectVisual(kind,side){
  const figure=$(side==='boss'?'enemyShadow':'heroFigure');figure.classList.remove('casting');void figure.offsetWidth;figure.classList.add('casting');
  const fx=$('attackFx');fx.className='attack-fx';void fx.offsetWidth;fx.classList.add(kind);
  sound(kind==='defense'?'block':kind==='poison'?'poison':kind==='buff'?'boost':'attack');
}
function animateHit(amount,side){
  const number=$(side+'Hit');number.textContent='−'+amount;number.classList.remove('active');void number.offsetWidth;number.classList.add('active');
  const figure=$(side==='boss'?'enemyShadow':'heroFigure');figure.classList.remove('hurt');void figure.offsetWidth;figure.classList.add('hurt');
}
function hideTransitions(){
  if(app.transitionTimer!==null){clearTimeout(app.transitionTimer);app.transitionTimer=null;}
  $('battleTransition').hidden=true;
  const resolve=app.transitionResolve;app.transitionResolve=null;if(resolve)resolve();
}
function turnMessage(label,kind,ms){
  hideTransitions();const overlay=$('battleTransition');overlay.className='battle-transition '+kind;overlay.hidden=false;
  const skippable=['player','enemy'].includes(kind);overlay.classList.toggle('skippable',skippable);
  $('transitionText').textContent=label;overlay.style.setProperty('--banner-time',ms+'ms');
  sound(kind==='player'?'player_turn':kind==='enemy'?'enemy_turn':kind==='victory'?'win':'lose');
  return new Promise(resolve=>{app.transitionResolve=resolve;app.transitionTimer=setTimeout(hideTransitions,ms);});
}
