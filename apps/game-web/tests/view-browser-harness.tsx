// Browser test fixture only, never imported by app entries or production builds.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BattleView } from '../src/BattleView';
import { createPreviewModel } from '../src/preview-presets';
import type { PreviewPreset } from '../src/preview-presets';
import type { BattleDesign } from '../src/battle-design';
const container = document.createElement('div');
document.body.replaceChildren(container);
const root = createRoot(container);
export function render(preset: PreviewPreset, design?: BattleDesign, name?: string) {
  const model = createPreviewModel(preset);
  if (name) model.player.name = name;
  root.render(createElement(BattleView, { model, design, selected: null, confirmEnd: false,
    onSelect() {}, onClose() {}, onCancelEnd() {}, onConfirmEnd() {} }));
}

export async function renderGame(design?: BattleDesign) {
  const { BattleScreen } = await import('../src/BattleScreen');
  const { createBattleAdapter } = await import('../src/battle-adapter');
  if (!window.GameBattle || !window.GameData || !window.GamePlanner) throw new Error('Test host requires the real game entry');
  const adapter = createBattleAdapter(window.GameBattle, window.GameData, window.GamePlanner);
  root.render(createElement(BattleScreen, { adapter, design }));
}
