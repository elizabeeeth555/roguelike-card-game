import { useRef, useState } from 'react';
import { BattleView } from '../BattleView';
import { BATTLE_DESIGN_FIELDS } from '../battle-design';
import type { BattleDesignKey } from '../battle-design';
import { createPreviewModel } from '../preview-presets';
import type { PreviewPreset } from '../preview-presets';
import type { SkillSelection } from '../battle-view-model';
import { createBattleDesignEditor } from './battle-design-editor';
import { MAX_SETTINGS_BYTES } from './settings-document';
import type { SettingsStorage } from './settings-document';

type Editor = ReturnType<typeof createBattleDesignEditor>;
const draftsFrom = (design: ReturnType<Editor['snapshot']>['design']) => Object.fromEntries(BATTLE_DESIGN_FIELDS.map(field => [field.key, design[field.key] === undefined ? '' : String(design[field.key])]));
export function StudioScreen({ storage }: { storage: () => SettingsStorage }) {
  const [editor] = useState(() => createBattleDesignEditor(storage));
  const [view, setView] = useState(editor.snapshot);
  const [drafts, setDrafts] = useState(() => draftsFrom(view.design));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<BattleDesignKey, string>>>({});
  const [fileError, setFileError] = useState('');
  const [preset, setPreset] = useState<PreviewPreset>('normal');
  const [selected, setSelected] = useState<SkillSelection | null>(null);
  const readRevision = useRef(0);
  function accept(next: typeof view) { setView(next); setDrafts(draftsFrom(next.design)); setFieldErrors({}); setFileError(''); }
  function update(key: BattleDesignKey, value: string) {
    readRevision.current++; setFileError(''); setDrafts(current => ({ ...current, [key]: value }));
    const next = editor.update(key, value); setView(next);
    // Keep invalid drafts visible, without applying or persisting them.
    setFieldErrors(current => ({ ...current, [key]: next.inputValid ? '' : '形式・許容範囲を確認してください。直前の設定を維持します。' }));
  }
  async function importFile(file?: File) {
    if (!file) return;
    const revision = ++readRevision.current; setFileError('');
    try {
      if (file.size > MAX_SETTINGS_BYTES) throw new Error('設定ファイルは32KiB以下にしてください。');
      const text = await file.text(); if (revision !== readRevision.current) return;
      const next = editor.importText(text); setView(next);
      // A storage failure does not undo an otherwise valid import.
      if (next.accepted) accept(next);
    } catch (error) { if (revision === readRevision.current) setFileError(error instanceof Error ? error.message : 'ファイルを読み込めません。'); }
  }
  function exportFile() {
    const url = URL.createObjectURL(new Blob([editor.exportText()], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'battle-design.studio.local.json'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="studio-shell"><aside className="studio-panel" aria-label="王座工房の外観編集">
    <h1>王座工房 <small>MVP 第1段階</small></h1><p>現行React技術検証画面の外観編集。新第一紀の最終デザインではありません。</p>
    <nav className="preview-tools" aria-label="開発用状態プリセット">{(['normal', 'special'] as const).map(value => <button key={value} aria-pressed={preset === value} onClick={() => { setSelected(null); setPreset(value); }}>{value === 'normal' ? '通常戦闘' : '特殊状態'}</button>)}</nav>
    {BATTLE_DESIGN_FIELDS.map(field => <fieldset key={field.key}><legend>{field.label}</legend>
      <label htmlFor={`studio-${field.key}`}>現在値（空欄はCSS既定）</label>
      <input id={`studio-${field.key}`} inputMode={field.kind === 'number' ? 'decimal' : 'text'} value={drafts[field.key]} placeholder="CSS既定" aria-invalid={!!fieldErrors[field.key]} aria-describedby={`hint-${field.key}`} onChange={event => update(field.key, event.target.value)} />
      <p id={`hint-${field.key}`}>{field.hint}{fieldErrors[field.key] && <span className="studio-error"> {fieldErrors[field.key]}</span>}</p>
      <button aria-label={`${field.label}を既定に戻す`} onClick={() => { readRevision.current++; accept(editor.reset(field.key)); }}>既定に戻す</button>
    </fieldset>)}
    <div className="studio-actions"><button onClick={() => setView(editor.save())}>ローカル保存</button><button onClick={() => { readRevision.current++; accept(editor.reload()); }}>保存済みを読込</button>
      <button onClick={exportFile}>JSONを書き出す</button><label className="studio-file">JSONを読み込む<input aria-label="JSONを読み込む" type="file" accept=".json,application/json" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void importFile(file); }} /></label>
      <button onClick={() => { readRevision.current++; accept(editor.reset()); }}>すべて既定に戻す</button></div>
    <p role="status">{view.message}</p>{(view.error || fileError) && <p className="studio-error" role="alert">{fileError || view.error}</p>}
    <p>有効な外観設定だけ端末・ブラウザ内へ自動保存します。端末間同期ではありません。保存できない場合はJSONで保管してください。未指定値は画面幅に応じたCSS既定に戻ります。HUD背景は検証用です。</p>
  </aside><section className="studio-preview" aria-label="共通戦闘プレビュー"><p className="studio-caption">開発専用・閲覧のみ／固定仮データ。戦闘は進行しません。</p>
    <BattleView model={createPreviewModel(preset)} design={view.design} selected={selected} confirmEnd={false} onSelect={setSelected} onClose={() => setSelected(null)} onCancelEnd={() => {}} onConfirmEnd={() => {}} />
  </section></div>;
}
