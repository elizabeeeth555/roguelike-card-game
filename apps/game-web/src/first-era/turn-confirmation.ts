import type { Action } from './core';
// Presentation policy only. The core still owns every action's legality.
export const shouldConfirmTurnEnd = (actions: Action[]) => actions.some(a => a.type === 'card' || a.type === 'accelerate');
