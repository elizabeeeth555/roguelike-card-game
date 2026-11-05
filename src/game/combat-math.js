/* Pure battle calculations, shared by browser gameplay and Node.js tests.
   No DOM, audio, timers or mutable global state. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GameMath = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function resolveHeal(currentHp, maximumHp, amount) {
    const missing = Math.max(0, maximumHp - currentHp);
    const healed = Math.max(0, Math.min(amount, missing));
    return { healed, nextHp: Math.min(maximumHp, currentHp + healed) };
  }
  function resolveDamage({ base, weak = 0, guard = 0, ignoreGuard = false, ignoreWeak = false, guardPierce = 0 }) {
    const raw = Math.max(0, base - (ignoreWeak ? 0 : weak));
    const effectiveGuard = Math.floor(raw * (1 - guardPierce));
    const blocked = ignoreGuard ? 0 : Math.min(guard, effectiveGuard);
    return { damage: raw - blocked, blocked, nextGuard: guard - blocked };
  }
  function applyPoison(previous, perStackDamage, turns) {
    const stacks = Math.min(4, (previous.stacks || 0) + 1);
    return { stacks, dmg: stacks * perStackDamage, turns };
  }
  function canPlayCard(card, side, battleState, cardLibrary) {
    if (cardLibrary[card.id].oneShot && battleState[`${side}OneShots`].has(card.key)) return false;
    const target = side === 'player' ? 'boss' : 'player';
    if (card.id === 'venombloom' && battleState[`${target}Poison`].turns <= 0) return false;
    return card.id !== 'return' || battleState[`${side}BlockedPrev`] > 0 || card.trait;
  }
  return Object.freeze({ resolveHeal, resolveDamage, applyPoison, canPlayCard });
});
