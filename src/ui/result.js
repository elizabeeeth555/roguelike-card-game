'use strict';
function renderResult(winner){
  $('resultTitle').textContent=winner==='player'?'第一紀を突破':'英雄は倒れた';
  $('resultKicker').textContent=winner==='player'?'VICTORY':'DEFEAT';
  $('resultText').textContent='同じデッキ・同じボスで再戦するか、新しいビルドで挑戦できます。';
  $('resultStats').textContent=`ROUND ${app.battle.round} ／ 残りHP ${app.battle.actors.player.hp} ／ マナ上限 ${app.battle.actors.player.manaCap}`;
  $('resultOverlay').hidden=false;activateDialog($('resultOverlay'));
}
