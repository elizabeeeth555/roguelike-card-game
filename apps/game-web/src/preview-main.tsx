import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BattleView } from './BattleView';
import { createPreviewModel } from './preview-presets';
import type { PreviewPreset } from './preview-presets';
import type { SkillSelection } from './battle-view-model';
import './styles.css';
import './dev-preview.css';

function DevelopmentPreview() {
  const [preset, setPreset] = useState<PreviewPreset>('normal');
  const [selected, setSelected] = useState<SkillSelection | null>(null);
  return <div className="preview-host"><nav className="preview-tools" aria-label="開発用状態プリセット"><strong>開発専用・閲覧のみ</strong>{(['normal', 'special'] as const).map(value => <button key={value} aria-pressed={preset === value} onClick={() => { setSelected(null); setPreset(value); }}>{value === 'normal' ? '通常戦闘' : '特殊状態'}</button>)}</nav>
    <BattleView model={createPreviewModel(preset)} selected={selected} confirmEnd={false} onSelect={setSelected} onClose={() => setSelected(null)} onCancelEnd={() => {}} onConfirmEnd={() => {}} />
  </div>;
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<StrictMode><DevelopmentPreview /></StrictMode>);
