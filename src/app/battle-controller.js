'use strict';
async function initBattle(presetId){
  if(app.draftCards.length!==5)return;
  cancelPresentation();app.mode='battle';app.busy=true;
  app.battle=GameBattle.createState({playerDeck:app.draftCards,bossPresetId:presetId});
  app.retryPreset=app.battle.bossPresetId;
  $('draftStage').hidden=true;$('gameLayout').hidden=false;$('resultOverlay').hidden=true;
  $('combatLog').replaceChildren();GameAudio.setScene('battle');sound('battle_start');
  applyVisualAssets();render();addLog('戦闘開始：先攻2/3、後攻3/3。','turn');
  const version=app.version;
  await turnMessage('YOUR TURN','player',app.fastFx?450:3000);
  if(version!==app.version||app.battle.end)return;
  app.busy=false;render();
}
function perform(action){
  const outcome=GameBattle.execute(app.battle,action);
  if(outcome.ok)presentBattleEvents(outcome.events);
  else announce(outcome.reason);
  render();return outcome;
}
function useCard(id){
  if(app.mode!=='battle'||app.busy||!app.battle||app.battle.active!=='player'||app.battle.end)return;
  closeCardDetail();perform({type:'card',side:'player',id});
}
function accelerate(){
  if(app.mode!=='battle'||app.busy||!app.battle||app.battle.active!=='player'||app.battle.end)return;
  closeCardDetail();perform({type:'accelerate',side:'player'});
}
async function endTurn(){
  if(app.mode!=='battle'||app.busy||!app.battle||app.battle.active!=='player'||app.battle.end)return;
  closeCardDetail();app.busy=true;const version=app.version;
  perform({type:'endTurn',side:'player'});if(app.battle.end)return;
  await turnMessage('ENEMY TURN','enemy',app.fastFx?450:3000);
  if(version!==app.version||app.battle.end)return;
  const plan=GamePlanner.plan(app.battle);
  for(const action of plan.actions){
    if(version!==app.version||app.battle.end)return;
    // Validation and effect happen before the activation display.
    if(!perform(action).ok)break;
    await battleTasks.wait(app.fastFx?180:1800);
    if(version!==app.version)return;
    clearEnemyAction();
  }
  if(version!==app.version||app.battle.end)return;
  perform({type:'endTurn',side:'boss'});if(app.battle.end)return;
  clearEnemyAction();app.enemyUsedKeys.clear();render();
  await turnMessage('YOUR TURN','player',app.fastFx?450:3000);
  if(version!==app.version||app.battle.end)return;
  app.busy=false;render();
}
function finishBattle(winner){
  app.busy=true;clearEnemyAction();const version=app.version;
  battleTasks.schedule(()=>{
    if(version!==app.version)return;
    turnMessage(winner==='player'?'VICTORY':'DEFEAT',winner==='player'?'victory':'defeat',app.fastFx?500:1200);
    GameAudio.stop(350);
  },app.fastFx?180:550);
  battleTasks.schedule(()=>{
    if(version!==app.version)return;
    hideTransitions();renderResult(winner);
  },app.fastFx?800:2000);
}
function retryBattle(){if(app.battle&&app.battle.end)initBattle(app.retryPreset);}
