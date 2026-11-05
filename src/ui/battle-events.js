'use strict';
// Only this adapter translates rule events into browser effects.
function applyBattleCommand(command,...args){
  const outcome=GameBattle.execute(state,era,command,...args);
  for(const event of outcome.events){
    switch(event.type){
      case 'log':addLog(event.message,event.kind);break;
      case 'sound':sound(event.key);break;
      case 'cast':effectVisual(event.family,event.who);break;
      case 'hit':animateHit(event.damage,event.target);break;
      case 'finish':finish(event.won,true);break;
    }
  }
  return outcome.result;
}
