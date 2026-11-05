'use strict';
// DOM event wiring and game bootstrap only.
$('swapDiscard').addEventListener('click',discardPending);
setupAudioMenu();
// Soft tactile feedback for actions not already given a dedicated sound.
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled||b.closest('#audioPanel')||b.id==='soundButton'||b.id==='logToggle')return;
 if(b.matches('.draft-deck-chip'))sound('card_pick');
 else if(b.matches('.info-trigger'))sound('ui_open');
 else if(b.matches('.draft-choice'))sound('ui_click');
 else if(b.id==='resetButton'||b.id==='restartButton')sound('ui_confirm');
 else if(b.id==='endTurn'||b.id==='speedButton')sound('ui_click');
},true);
$('endTurn').addEventListener('click',endTurn);$('resetButton').addEventListener('click',resetGame);$('restartButton').addEventListener('click',()=>{if(state&&state.end==='lose')initBattle();else resetGame();});$('nextGenerationButton').addEventListener('click',goNext);
$('speedButton').addEventListener('click',()=>{fastFx=!fastFx;$('speedLabel').textContent=fastFx?'高速':'通常';});
setupLogToggle();setupInfoTooltips();
$('battleTransition').addEventListener('click',()=>{if(!$('battleTransition').hidden&&$('battleTransition').classList.contains('skippable'))hideTransitions();});
$('battleTransition').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&$('battleTransition').classList.contains('skippable')){e.preventDefault();hideTransitions();}});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey||e.repeat||e.target.closest('button,input,textarea,select'))return;if(mode!=='battle'||!state||state.end||busy)return;const i=Number(e.key)-1;if(i>=0&&i<state.deck.length){useCard(state.deck[i].key);e.preventDefault();}if(e.code==='Space'){endTurn();e.preventDefault();}});
window.phase3Debug=Object.freeze({effectSummary,heal,hit,playCard,renderDraftCardDetails,snapshot:()=>({mode,era,draftIndex,draftKind,draftCards:draftCards.map(clone),inherited:inherited&&clone(inherited),previousHeroDeck:previousHeroDeck&&previousHeroDeck.map(clone),state:state&&{...GameBattle.snapshot(state),bossPlan:'非公開'}}),reset:resetGame,goNext});
resetGame();
