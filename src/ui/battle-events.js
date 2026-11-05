'use strict';
function presentBattleEvents(events){
  for(const event of events){
    const label=event.side==='boss'?'敵':'あなた';
    switch(event.type){
      case 'card':{
        const spec=GameData.CARDS[event.id];
        effectVisual(GameData.category(spec),event.side);sound('card_cast');
        addLog(`${label}：${spec.name}を使用。${spec.description}`,event.side==='boss'?'enemy':'hero');
        if(event.side==='boss'){
          app.enemyActiveKey=event.id;app.enemyUsedKeys.add(event.id);
          $('enemyActionToast').textContent=`敵が「${spec.name}」を使用`;$('enemyActionToast').hidden=false;
        }
        break;
      }
      case 'damage':
        addLog(`${event.target==='boss'?'敵':'あなた'}：${event.kind==='poison'?'毒で':''}${event.amount}ダメージ${event.blocked?`（バリア${event.blocked}消費）`:''}`,event.target==='boss'?'hero':'enemy');
        if(event.amount>0){animateHit(event.amount,event.target);sound(event.kind==='poison'?'poison_tick':'hit');}else sound('block');
        break;
      case 'heal':addLog(`${label}：HPを${event.amount}回復`);sound('heal');break;
      case 'accelerate':
        addLog(`${label}：マナ加速。次の自ターンから上限${event.nextCap}`);sound('mana');
        if(event.side==='boss'){$('enemyActionToast').textContent='敵がマナ加速を使用';$('enemyActionToast').hidden=false;}
        break;
      case 'barrierExpired':addLog(`${label}のバリアが消滅`);break;
      case 'turn':addLog(`ROUND ${event.round} / ${label}の自ターン${event.ownTurn}`,'turn');break;
      case 'finish':finishBattle(event.winner);break;
    }
  }
}
