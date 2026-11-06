'use strict';
function cancelPresentation(){
  app.version++;battleTasks.cancel();hideTransitions();clearBattleVisuals();closeCardDetail();app.busy=false;app.playerAnimating=false;app.playerActiveKey=null;$('endTurnOverlay').hidden=true;
}
function resetGame(){
  cancelPresentation();app.mode='draft';app.battle=null;app.retryPreset=null;
  app.draftCards=[];app.draftStep=0;app.draftOptions=[];
  $('resultOverlay').hidden=true;$('gameLayout').hidden=true;$('draftStage').hidden=false;
  GameAudio.setScene('event');renderDraft();
}
function applyStarter(id){
  if(app.mode!=='draft'||app.draftCards.length)return;
  app.draftCards=GameProgression.starter(id);
  app.draftOptions=GameProgression.options(app.draftCards);sound('ui_confirm');renderDraft();
}
function acquireDraft(id){
  if(app.mode!=='draft'||!app.draftOptions.includes(id)||!GameProgression.acquire(app.draftCards,id))return;
  app.draftStep++;sound('card_gain');
  if(app.draftStep===3){initBattle();return;}
  app.draftOptions=GameProgression.options(app.draftCards);renderDraft();
}
