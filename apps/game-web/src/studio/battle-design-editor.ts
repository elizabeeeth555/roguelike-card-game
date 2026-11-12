import { validateBattleDesign } from '../battle-design.ts';
import type { BattleDesign, BattleDesignKey } from '../battle-design';
import { createSettingsCodec, createSettingsRepository } from './settings-document.ts';
import type { SettingsStorage } from './settings-document';
export const STUDIO_DESIGN_KEY = 'throne-studio.battle-design.v1';
export const designCodec = createSettingsCodec<BattleDesign>('throne-studio.battle-design', 1, value => {
  const { design, invalidKeys } = validateBattleDesign(value);
  if (invalidKeys.length) throw new Error('許可されていない設定キー、または不正な設定値があります。');
  return design;
});
export function createBattleDesignEditor(storage: () => SettingsStorage) {
  const repository = createSettingsRepository(storage, STUDIO_DESIGN_KEY, designCodec);
  const initial = repository.load();
  let design: BattleDesign = initial.value ?? {}, error: string | null = initial.error ? '保存データを復元できません。元のデータは保持しています。' : null;
  let message = initial.value ? '保存済みの設定を復元しました。' : '未指定の項目はCSS既定値を使用します。';
  const snapshot = () => ({ design: { ...design }, error, message });
  function commit(next: BattleDesign) { design = { ...next }; error = repository.save(design); message = error ? '編集内容は画面に保持されています。' : '編集を反映し、ローカル自動保存しました。'; return snapshot(); }
  return {
    snapshot,
    update(key: BattleDesignKey, text: string) {
      const next = { ...design };
      if (text === '') delete next[key];
      else {
        const value = key === 'skillGap' || key === 'bossScale' ? (text.trim() ? Number(text) : NaN) : text;
        const parsed = validateBattleDesign({ [key]: value });
        if (parsed.invalidKeys.length) { error = '入力値が不正です。直前の有効な設定を維持しています。'; return { ...snapshot(), inputValid: false }; }
        Object.assign(next, parsed.design);
      }
      return { ...commit(next), inputValid: true };
    },
    reset(key?: BattleDesignKey) { const next = { ...design }; if (key) delete next[key]; return commit(key ? next : {}); },
    importText(text: string) {
      try { const parsed = designCodec.parse(text); return { ...commit(parsed), accepted: true }; }
      catch (cause) { error = cause instanceof Error ? cause.message : '設定を読み込めません。'; return { ...snapshot(), accepted: false }; }
    },
    exportText() { return designCodec.stringify(design); },
    reload() {
      const loaded = repository.load();
      if (loaded.error) error = '保存データを読み込めません。現在の編集内容を維持しています。';
      else { design = loaded.value ?? {}; error = null; message = '保存済みの設定を読み込みました。'; }
      return snapshot();
    },
    save() { error = repository.save(design); message = error ? '編集内容は画面に保持されています。' : 'ローカル保存しました。'; return snapshot(); }
  };
}
