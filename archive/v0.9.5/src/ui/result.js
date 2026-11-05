'use strict';
// Result and inheritance selection presentation.
function renderResult(won,snapshot){
 const panel=$('resultOverlay'),dlg=panel.querySelector('.end-dialog');dlg.classList.toggle('lose',!won);panel.hidden=false;
 $('resultKicker').textContent=won?'VICTORY / 時代の継承':'DEFEAT / 挑戦は続く';$('resultTitle').textContent=won?'勝利':'敗北';$('resultRound').textContent=`ROUND ${state.round}`;$('resultHp').textContent=`残りHP ${state.playerHp}`;
 $('resultNote').textContent='Phase 3試作：強化は1枚1回、第三紀まで実装。カード性能は仮調整。';$('inheritChoices').hidden=true;$('nextGenerationButton').hidden=true;$('restartButton').hidden=false;
 if(won&&era<LAST_ERA){
  $('resultTitle').textContent=`第${era===1?'一':'二'}紀を突破`;
  $('resultText').textContent='今回の通常デッキから、次の英雄に託す1枚を選ぼう。';
  $('inheritChoices').hidden=false;$('nextGenerationButton').hidden=false;$('nextGenerationButton').disabled=true;$('restartButton').hidden=true;
  const choices=$('inheritChoices');choices.replaceChildren();
  for(const c of snapshot){const b=document.createElement('button');b.className='inherit-option';b.type='button';b.textContent=`${LIB[c.id].icon} ${nameOf(c)}（コスト${LIB[c.id].cost}）`;b.addEventListener('click',()=>{if(!selectInheritance(c.key))return;for(const x of choices.children)x.classList.remove('chosen');b.classList.add('chosen');$('nextGenerationButton').disabled=false;sound('legacy_pick');$('resultText').textContent=`${nameOf(c)}を次の英雄へ。先代ボスは今回の通常デッキを再現する。`;});choices.append(b);}
  $('nextGenerationButton').textContent=`継承して第${era===1?'二':'三'}紀の道中へ →`;
 }else if(won){$('resultText').textContent='三世代の英雄を突破した！ Ver.0.9.5の試作はここまで。';$('resultKicker').textContent='PHASE 3 COMPLETE';$('restartButton').textContent='第一紀からもう一度';}
 else{$('resultText').textContent='このデッキのまま再戦できる。道中から組み直す場合は右上の「最初から」。';$('restartButton').textContent='この戦闘を再戦';}
 addLog(won?'敵を倒した！':'英雄は倒れた……',won?'hero':'enemy');
}
