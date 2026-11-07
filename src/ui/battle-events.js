'use strict';
function presentBattleEvents(events){
  for(const event of events){
    const label=event.side==='boss'?'敵':'あなた';
    switch(event.type){
      case 'card':{
        const spec=GameData.CARDS[event.id];
        effectVisual(GameData.category(spec),event.side);
        addLog(`${label}：${spec.name}を使用。${skillText(spec.description)}`,event.side==='boss'?'enemy':'hero');
        if(event.side==='boss'){
          app.enemyActiveKey=event.id;app.enemyUsedKeys.add(event.id);
          $('enemyActionToast').textContent=`敵が「${spec.name}」を使用`;$('enemyActionToast').hidden=false;
        }
        break;
      }
      case 'damage':{
        const damage=event.actualAmount===undefined?event.amount:event.actualAmount;
        addLog(`${event.target==='boss'?'敵':'あなた'}：${event.kind==='poison'?'毒で':''}${damage}ダメージ${event.blocked?`（バリア${event.blocked}消費）`:''}`,event.target==='boss'?'hero':'enemy');
        if(damage>0||event.blocked){animateHit(damage,event.target,event.blocked);}
        break;}
      case 'environmentDamage':
        addLog(`${event.target==='boss'?'敵':'あなた'}：消耗で${event.amount}ダメージ（TURN ${event.round}・バリア無視）`,'turn');
        animateHit(event.amount,event.target,0);sound('hit');break;
      case 'heal':animateHeal(event.amount,event.side);addLog(`${label}：HPを${event.amount}回復`);break;
      case 'accelerate':
        addLog(`${label}：マナ加速。次の自ターンから上限${event.nextCap}`);
        if(event.side==='boss'){$('enemyActionToast').textContent='敵がマナ加速を使用';$('enemyActionToast').hidden=false;}
        break;
      case 'barrierExpired':addLog(`${label}のバリアが消滅`);break;
      case 'turn':addLog(`TURN ${event.round} / ${label}の自ターン${event.ownTurn}`,'turn');break;
      case 'finish':finishBattle(event.winner);break;
    }
  }
}
