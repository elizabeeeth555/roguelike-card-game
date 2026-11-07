'use strict';
async function initBattle(presetId){
  if(!app.draftCards.length||app.draftCards.length>5)return;
  cancelPresentation();app.mode='battle';app.busy=true;
  app.battle=GameBattle.createState({playerDeck:app.draftCards,bossPresetId:presetId});
  app.retryPreset=app.battle.bossPresetId;
  $('draftStage').hidden=true;$('gameLayout').hidden=false;$('resultOverlay').hidden=true;
  app.logFollow=true;$('combatLog').replaceChildren();GameAudio.setScene('battle');sound('battle_start');
  applyVisualAssets();render();addLog('戦闘開始：先攻2/3、後攻3/3。','turn');
  const version=app.version;
  await turnMessage('BATTLE START','start',app.fastFx?450:1100);
  if(version!==app.version||app.battle.end)return;
  await battleTasks.wait(app.fastFx?60:150);
  if(version!==app.version||app.battle.end)return;
  await turnMessage('YOUR TURN','player',app.fastFx?350:2000);
  if(version!==app.version||app.battle.end)return;
  app.busy=false;render();
}
function perform(action){
  const hp={player:app.battle.actors.player.hp,boss:app.battle.actors.boss.hp};
  const outcome=GameBattle.execute(app.battle,action);
  if(outcome.ok)presentBattleEvents(outcome.events.map(e=>{if(e.type==='damage'){const actualAmount=Math.min(hp[e.target],e.amount);hp[e.target]-=actualAmount;return {...e,actualAmount};}if(e.type==='heal')hp[e.side]+=e.amount;return e;}));
  else announce(skillText(outcome.reason));
  render();return outcome;
}
async function useCard(id){
 if(!canChangeBattle()||app.selectedPlayer!==id)return;
 if(!GameBattle.availability(app.battle,'player',id).allowed)return;
 closeCardDetail('player');app.busy=true;app.playerAnimating=true;app.playerActiveKey=id;
 const version=app.version;const outcome=perform({type:'card',side:'player',id});
 if(!outcome.ok||app.battle.end)return;
 await battleTasks.wait(app.fastFx?700:1800);
 if(version!==app.version||!app.battle||app.battle.end)return;
 app.playerAnimating=false;app.playerActiveKey=null;app.busy=false;render();
}
function accelerate(){
 if(!canChangeBattle())return;
 perform({type:'accelerate',side:'player'});
}
async function endTurn(confirmed=false){
 if(!canChangeBattle())return;
 const actions=GameBattle.legalActions(app.battle).filter(a=>a.type!=='endTurn');
 if(confirmed!==true&&actions.length){
  $('endTurnMessage').textContent=`残りMP ${app.battle.actors.player.mana}。使用可能スキル ${actions.filter(a=>a.type==='card').length}種${actions.some(a=>a.type==='accelerate')?'、マナ加速も可能':''}。未使用のまま終了しますか？`;
  $('endTurnOverlay').hidden=false;render();activateDialog($('endTurnOverlay'));return;
 }
 closeCardDetail();app.busy=true;const version=app.version;
 perform({type:'endTurn',side:'player'});if(app.battle.end)return;
 await turnMessage('ENEMY TURN','enemy',app.fastFx?350:2000);
 if(version!==app.version||app.battle.end)return;
 const plan=GamePlanner.plan(app.battle);
 for(const action of plan.actions){
  if(version!==app.version||app.battle.end)return;
  if(!perform(action).ok)break;
  await battleTasks.wait(app.fastFx?700:1800);
  if(version!==app.version)return;
  clearEnemyAction();render();
 }
 if(version!==app.version||app.battle.end)return;
 perform({type:'endTurn',side:'boss'});if(app.battle.end)return;
 clearEnemyAction();app.enemyUsedKeys.clear();render();
 await turnMessage('YOUR TURN','player',app.fastFx?350:2000);
 if(version!==app.version||app.battle.end)return;
 app.busy=false;render();
}
function finishBattle(winner){
  app.busy=true;app.playerAnimating=false;closeCardDetail();$('endTurnOverlay').hidden=true;const version=app.version;
  battleTasks.schedule(()=>{
    if(version!==app.version)return;
    turnMessage(winner==='player'?'VICTORY':'DEFEAT',winner==='player'?'victory':'defeat',app.fastFx?500:1200);
    GameAudio.stop(350);
  },app.fastFx?180:550);
  battleTasks.schedule(()=>{
    if(version!==app.version)return;
    app.playerActiveKey=null;clearEnemyAction();render();hideTransitions();renderResult(winner);
  },app.fastFx?800:2000);
}
function retryBattle(){if(app.battle&&app.battle.end)initBattle(app.retryPreset);}
