/* Deterministic portion of enemy card selection, independent of the screen. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GamePlanner = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function chooseCards(cards, manaBudget, score, cost, canPlay) {
    let mana = manaBudget;
    const sorted = [...cards].sort((a, b) => score(b) - score(a) || cost(a) - cost(b));
    const chosen = [];
    for (const card of sorted) {
      if (cost(card) <= mana && canPlay(card)) {
        chosen.push(card.key);
        mana -= cost(card);
      }
    }
    return chosen;
  }
  return Object.freeze({ chooseCards });
});
