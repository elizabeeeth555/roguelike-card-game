import type { Runtime, RecordWin } from './core';
export const SAVE_KEY = 'keisei.first-era.progress.v1';
export interface Save { format: 'keisei-first-era'; version: 1; deck: string[] | null; firstWin: RecordWin | null }
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export const freshSave = (): Save => ({ format: 'keisei-first-era', version: 1, deck: null, firstWin: null });
export function validateSave(raw: unknown, runtime: Runtime): Save {
 const s = raw as Save;
 if (!s || s.format !== 'keisei-first-era' || s.version !== 1 || !Object.hasOwn(s, 'deck') || !Object.hasOwn(s, 'firstWin')) throw Error('未対応の保存形式です');
 if (s.deck !== null) runtime.rules.validateDeck(s.deck);
 if (s.firstWin !== null) {
  if (s.deck === null) throw Error('確定編成のない勝利記録です');
  const w = s.firstWin; runtime.rules.validateDeck(w.deck);
  if (!Array.isArray(w.frames) || w.frames.length === 0 || w.frames.length > 1000) throw Error('勝利ログが不正です');
  let state = runtime.core.restore(w.initial);
  if (JSON.stringify(state) !== JSON.stringify(runtime.core.createState({ ruleset: runtime.rules.RULESET, playerDeck: w.deck }))) throw Error('勝利ログの開始状態が不正です');
  for (const [i, frame] of w.frames.entries()) {
   if (frame.sequence !== i + 1) throw Error('勝利ログの順序が不正です');
   const step = runtime.core.transition(state, frame.action);
   if (!step.ok || JSON.stringify(step.events) !== JSON.stringify(frame.events) || JSON.stringify(step.state) !== JSON.stringify(runtime.core.restore(frame.after))) throw Error('勝利ログが一致しません');
   state = step.state;
  }
  if (state.end !== 'player' || JSON.stringify(state) !== JSON.stringify(runtime.core.restore(w.result))) throw Error('勝利結果が不正です');
 }
 return JSON.parse(JSON.stringify({ format: s.format, version: s.version, deck: s.deck, firstWin: s.firstWin })) as Save;
}
export function recordFirstWin(save: Save, win: RecordWin): Save {
 if (save.firstWin || win.result.end !== 'player') return save;
 return { ...save, firstWin: JSON.parse(JSON.stringify(win)) as RecordWin };
}
export function createSaveRepository(storage: () => StoragePort, runtime: Runtime) {
 return {
  load() { try { const text = storage().getItem(SAVE_KEY); if (text === null) return { save: null, error: '', exists: false }; if (text.length > 2_000_000) throw Error('保存容量が大きすぎます'); return { save: validateSave(JSON.parse(text), runtime), error: '', exists: true }; } catch { return { save: null, error: '保存を読み込めません。元データは保持しています。確認付きの初期化、またはメモリ内でプレイできます。', exists: true }; } },
  write(save: Save) { try { const valid = validateSave(save, runtime), text = JSON.stringify(valid); if (text.length > 2_000_000) throw Error('容量超過'); storage().setItem(SAVE_KEY, text); return ''; } catch { return '保存できませんでした。このブラウザを閉じると変更が失われます。'; } },
  clear() { try { storage().removeItem(SAVE_KEY); return ''; } catch { return '初期化を保存先へ反映できません。メモリ内だけで開始します。'; } }
 };
}
