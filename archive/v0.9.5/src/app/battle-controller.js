'use strict';
// Browser battle controller: input guards, asynchronous pacing and view coordination.
function grantBossAbility(){if(state&&!state.end)return applyBattleCommand('grantBossAbility');}
function expireBossBarrier(){if(state&&!state.end)return applyBattleCommand('expireBossBarrier');}
function triggerThirdBossAbility(){if(state&&!state.end)return applyBattleCommand('triggerThirdBossAbility');}
function initBattle(){
 version++;battleTasks.cancel();clearBattleVisuals();window.scrollTo(0,0);mode='battle';busy=true;enemyTurnActive=false;enemyActiveKey=null;enemyUsedKeys.clear();
 state=GameBattle.createState({era,draftCards,inherited,previousHeroDeck});
 $('draftStage').hidden=true;$('gameLayout').hidden=false;$('resultOverlay').hidden=true;GameAudio.setScene('battle');sound('battle_start');
 $('bossName').textContent=eraConfig(era).bossName;
 $('regionLabel').textContent=eraConfig(era).region;$('combatLog').replaceChildren();
 displayEnemyDeck();grantBossAbility();commitBossPlan();addLog('ROUND 1：あなた1マナ／敵初回2マナ。戦闘開始！','turn');announce('カードを使うか、ターン終了を選択');setHeader();applyVisualAssets();render();
 const battleVersion=version;
 turnMessage('YOUR TURN','player',fastFx?450:3000).then(()=>{if(version!==battleVersion||!state||state.end)return;busy=false;render();});
}
// 戦闘の切り替え時はCSSアニメーションの状態も初期化する。前の一撃が次のボスに残るのを防ぐ。

function heal(...args){return applyBattleCommand('heal',...args);}
function hit(...args){return applyBattleCommand('hit',...args);}
function playCard(...args){return applyBattleCommand('playCard',...args);}
function canPlay(c,who){return GameBattle.canPlay(state,c,who);}
function useCard(key){
 if(mode!=='battle'||!state||busy||state.end)return;
 if(applyBattleCommand('useCard',key))render();
}
function commitBossPlan(){return applyBattleCommand('commitBossPlan');}

const sleep=t=>battleTasks.wait(t);

async function endTurn(){
 if(mode!=='battle'||!state||state.end||busy)return;
 busy=true;enemyTurnActive=true;enemyUsedKeys.clear();enemyActiveKey=null;updateEnemyCardClasses();const myVersion=version;render();await turnMessage('ENEMY TURN','enemy',fastFx?450:3000);if(myVersion!==version||state.end)return;
 expireBossBarrier();triggerThirdBossAbility();render();
 const actions=applyBattleCommand('prepareEnemy');render();
 if(state.end){enemyTurnActive=false;busy=false;clearEnemyAction();render();return;}
 for(const c of actions){
  if(version!==myVersion||state.end)break;
  // 毎回カードを発光→テロップを表示→効果を発動→2秒間保持→消灯。
  enemyActiveKey=c.key;updateEnemyCardClasses();
  const toast=$('enemyActionToast');toast.textContent=`敵が「${nameOf(c)}」を使用！`;toast.hidden=false;
  announce(`敵が「${nameOf(c)}」を使用！`);
  await sleep(fastFx?110:250);if(version!==myVersion)return;
  if(!canPlay(c,'boss')){clearEnemyAction();continue;}
  applyBattleCommand('enemyCard',c);enemyUsedKeys.add(c.key);render();
  await sleep(fastFx?390:ENEMY_ACTION_DURATION-250);if(version!==myVersion)return;
  clearEnemyAction();
  if(state.end)break;
  await sleep(fastFx?70:140);if(version!==myVersion)return;
 }
 if(version!==myVersion)return;
 clearEnemyAction();enemyUsedKeys.clear();
 if(state.end){enemyTurnActive=false;busy=false;render();return;}
 applyBattleCommand('beginPlayer');
 if(state.end){busy=false;render();return;}
 enemyTurnActive=false;addLog(`ROUND ${state.round}：マナ${state.mana}で開始`,'turn');announce('次の行動を選択してください');render();await turnMessage('YOUR TURN','player',fastFx?450:3000);if(myVersion!==version||state.end)return;busy=false;render();
}

function finish(won,resolved=false){if(!state||(!resolved&&state.end))return;
 const myVersion=version;enemyTurnActive=false;enemyActiveKey=null;clearEnemyAction();state.end=won?'win':'lose';busy=true;
 render();
 // Show hit animation and HP reaching zero before displaying the result.
 battleTasks.schedule(()=>{if(myVersion!==version||!state)return;turnMessage(won?'VICTORY':'DEFEAT',won?'victory':'defeat',fastFx?650:1400);GameAudio.stop(350);},fastFx?220:580);
 battleTasks.schedule(()=>{if(myVersion!==version||!state)return;hideTransitions();busy=false;showResult(won);},fastFx?1100:2450);
}

function showResult(won){
 const snapshot=won&&era<LAST_ERA?GameProgression.normalDeck(state.deck):[];
 if(won&&era<LAST_ERA)previousHeroDeck=snapshot.map(clone);
 renderResult(won,snapshot);
}
function selectInheritance(key){
 const card=GameProgression.inheritCard(previousHeroDeck||[],key);
 if(card)inherited=card;
 return card;
}

function goNext(){if(era>=LAST_ERA||!inherited||!state||state.end!=='win')return;sound('stage_transition');era++;startEra();}
