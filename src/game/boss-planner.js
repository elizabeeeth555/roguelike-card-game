/* Deterministic portion of enemy card selection, independent of the screen. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GamePlanner = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function chooseCards(cards, manaBudget, score, cost, canPlay, manaRefund = () => 0) {
    let mana = manaBudget;
    const sorted = [...cards].sort((a, b) => score(b) - score(a) || cost(a) - cost(b));
    const chosen = [];
    for (const card of sorted) {
      if (cost(card) <= mana && canPlay(card)) {
        chosen.push(card.key);
        mana -= cost(card);
        mana += manaRefund(card);
      }
    }
    return chosen;
  }
  const BASE_SCORES={slash:14,boost:18,guard:9,return:18,pierce:13,rally:15,rush:17,
    siphon:13,flurry:17,seal:15,poison:18,thorns:10,leech:13,burst:16,fortify:15,
    hex:13,spark:14,sunder:18,ember:16,pulse:22,repose:9,duel:17,storm:17,dusk:13};
  function scoreCard(card,state){
    let score=BASE_SCORES[card.id]||10;
    if(card.id==='boost'&&state.round>=5)score-=6;
    if(['guard','thorns'].includes(card.id)&&state.round%2===0)score+=5;
    if(card.id==='return'&&state.bossBlockedPrev===0&&!card.trait)score=-100;
    if(card.id==='seal'&&state.round>=5)score-=5;
    if(card.id==='laststand')score=16+Math.max(0,state.maxBossHp-state.bossHp)*.45;
    if(card.id==='venombloom')score=state.playerPoison.turns>0?28:0;
    return score+(card.lv||0)*.6+(card.trait?2:0);
  }
  return Object.freeze({ chooseCards, scoreCard });
});
