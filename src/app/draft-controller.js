'use strict';
// Browser draft flow. Shared build and inheritance rules live in progression.js.
function getOptions(){return GameProgression.options(era,draftCards,inherited);}

function resetGame(){version++;battleTasks.cancel();era=1;inherited=null;previousHeroDeck=null;enemyTurnActive=false;enemyActiveKey=null;enemyUsedKeys.clear();clearBattleVisuals();hideTransitions();$('swapOverlay').hidden=true;startEra();}

function startEra(){version++;battleTasks.cancel();busy=false;enemyTurnActive=false;enemyActiveKey=null;enemyUsedKeys.clear();clearBattleVisuals();hideTransitions();state=null;mode='draft';draftIndex=-1;draftKind='starter';draftCards=[];selectedDraftKey=null;pendingCardId=null;$('swapOverlay').hidden=true;$('gameLayout').hidden=true;$('draftStage').hidden=false;$('resultOverlay').hidden=true;setHeader();renderDraft();GameAudio.setScene('event');}

function moveNext(){draftIndex++;const route=routeForEra(era);if(draftIndex>=route.length){initBattle();return;}draftKind=route[draftIndex];renderDraft();}

function applyStarter(cards){sound('ui_confirm');draftCards=cards.map(x=>newCard(x));moveNext();}

function addCard(id){if(draftCards.length>=RULES.cap){pendingCardId=id;showSwapDialog(id);return;}sound('card_gain');GameProgression.acquire(draftCards,newCard(id));moveNext();}

function replacePending(key,card){
 if(pendingCardId!==card.id||!GameProgression.replace(draftCards,key,card))return;
 pendingCardId=null;$('swapOverlay').hidden=true;sound('card_replace');moveNext();
}

function discardPending(){if(pendingCardId===null)return;pendingCardId=null;$('swapOverlay').hidden=true;sound('card_discard');moveNext();}

function upgradeCard(key,special=false){if(!GameProgression.upgrade(draftCards,key,era,special))return;selectedDraftKey=key;sound(special?'engraving':'upgrade');moveNext();}

function beginUpgradeFork(){if(era===1||!draftCards.some(c=>!hasUpgraded(c)))return;sound('ui_confirm');draftKind='upgradeFork';renderDraft();}

