'use strict';
function cancelPresentation(){
  app.version++;battleTasks.cancel();hideTransitions();clearBattleVisuals();closeCardDetail();app.busy=false;app.playerAnimating=false;app.playerActiveKey=null;$('endTurnOverlay').hidden=true;
}
function resetGame(){
  cancelPresentation();app.mode='draft';app.battle=null;app.retryPreset=null;
  app.draftCards=[];app.draftStep=0;app.draftOptions=[];app.draftRerolls=GameProgression.REROLLS;app.draftPending=null;
  $('resultOverlay').hidden=true;$('gameLayout').hidden=true;$('draftStage').hidden=false;
  GameAudio.setScene('event');renderDraft();
}
function applyStarter(id){
  if(app.mode!=='draft'||app.draftCards.length)return;
  app.draftCards=GameProgression.starter(id);
  app.draftOptions=GameProgression.options(app.draftCards);sound('ui_confirm');renderDraft();
}
function finishDraftEvent(){
  if(app.mode!=='draft'||!app.draftCards.length||app.draftStep>=GameProgression.DRAFT_EVENTS)return;
  closeCardDetail();app.draftPending=null;app.draftStep++;
  if(app.draftStep>=GameProgression.DRAFT_EVENTS){initBattle();return;}
  app.draftOptions=GameProgression.options(app.draftCards);renderDraft();
}
function acquireDraft(id){
  if(app.mode!=='draft'||!app.draftOptions.includes(id))return;
  if(app.draftCards.length===5){app.draftPending=id;renderDraft();$('draftReplacement').querySelector('button')?.focus();return;}
  if(!GameProgression.acquire(app.draftCards,id))return;
  sound('card_gain');finishDraftEvent();
}
function replaceDraft(outId){
  if(app.mode!=='draft'||!app.draftOptions.includes(app.draftPending)||!GameProgression.replace(app.draftCards,outId,app.draftPending))return;
  sound('card_gain');finishDraftEvent();
}
function cancelDraftReplacement(){if(app.mode!=='draft')return;app.draftPending=null;renderDraft();}
function rerollDraft(){
  if(app.mode!=='draft'||!app.draftCards.length||app.draftRerolls<=0)return;
  closeCardDetail();app.draftPending=null;
  app.draftOptions=GameProgression.options(app.draftCards,Math.random,null,app.draftOptions);
  app.draftRerolls--;sound('ui_confirm');renderDraft();
}
function skipDraft(){
  if(app.mode!=='draft'||!app.draftCards.length)return;
  finishDraftEvent();
}
