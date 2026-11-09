'use strict';
setupCombatFx();setupAudioMenu();setupLogToggle();setupInfoTooltips();setupDialogs();setupSkillInspection();setupFullscreen();
$('resetButton').addEventListener('click',()=>{if(window.confirm('現在の進行を終了し、最初から始めますか？'))resetGame();});$('restartButton').addEventListener('click',resetGame);
$('retryButton').addEventListener('click',retryBattle);$('endTurn').addEventListener('click',endTurn);
$('draftReroll').addEventListener('click',rerollDraft);$('draftSkip').addEventListener('click',skipDraft);$('draftReplaceCancel').addEventListener('click',cancelDraftReplacement);
$('accelerateButton').addEventListener('click',accelerate);
$('speedButton').addEventListener('click',()=>{app.fastFx=!app.fastFx;$('speedLabel').textContent=app.fastFx?'高速':'通常';});
$('battleTransition').addEventListener('click',()=>{if($('battleTransition').classList.contains('skippable'))hideTransitions();});
document.addEventListener('keydown',event=>{
  if(!$('battleTransition').hidden&&$('battleTransition').classList.contains('skippable')&&['Enter',' '].includes(event.key)){
    event.preventDefault();hideTransitions();return;
  }
  if(event.ctrlKey||event.metaKey||event.altKey||event.repeat||event.target.closest('button,input,textarea,select')||!$('cardDetailOverlay').hidden||!$('resultOverlay').hidden||!$('endTurnOverlay').hidden||!$('settingsPanel').hidden||!$('audioPanel').hidden)return;
  if(!canInspectBattle())return;
  const index=Number(event.key)-1;
  if(index>=0&&index<5){openCardDetail(app.battle.actors.player.deck[index],'player');event.preventDefault();}
  if(event.code==='Space'){endTurn();event.preventDefault();}
});
window.trialDebug=Object.freeze({snapshot:()=>JSON.parse(JSON.stringify({...app,enemyUsedKeys:[...app.enemyUsedKeys],transitionResolve:undefined,transitionTimer:undefined})),reset:resetGame});
resetGame();
