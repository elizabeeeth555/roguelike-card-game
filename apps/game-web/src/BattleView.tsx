import { useEffect, useState } from 'react';
import type { BattleViewModel, SkillSelection, ViewSide } from './battle-view-model';
import { battleDesignStyle } from './battle-design';
import type { BattleDesign } from './battle-design';
import { SkillCard } from './components/SkillCard';
import { BattleHUD } from './components/BattleHUD';
import { BattleField } from './components/BattleField';
import { SkillDetail, SkillTooltip } from './components/SkillDetail';
import { ConfirmDialog } from './components/ConfirmDialog';

export interface BattleViewProps {
  model: BattleViewModel; design?: BattleDesign; selected: SkillSelection | null; confirmEnd: boolean;
  onSelect: (selection: SkillSelection) => void; onClose: () => void;
  onUse?: () => void; onAccelerate?: () => void; onEndTurn?: () => void; onReset?: () => void;
  onCancelEnd: () => void; onConfirmEnd: () => void;
}
// Layout and ephemeral inspection only. No core/planner/session/editor API.
export function BattleView({ model, design, selected, confirmEnd, onSelect, onClose, onUse, onAccelerate, onEndTurn, onReset, onCancelEnd, onConfirmEnd }: BattleViewProps) {
  const [inspection, setInspection] = useState<(SkillSelection & { anchor: HTMLElement }) | null>(null);
  useEffect(() => { setInspection(null); }, [model, selected, confirmEnd]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setInspection(null); };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);
  const selectedSkill = selected && model[selected.side].skills.find(skill => skill.id === selected.id);
  const inspectedSkill = inspection && model[inspection.side].skills.find(skill => skill.id === inspection.id);
  function skillRow(side: ViewSide) {
    return <div className={`skills ${side}-skills`} aria-label={side === 'player' ? 'プレイヤースキル' : '敵スキル'}>{model[side].skills.map(skill => <SkillCard key={skill.id} {...skill} compact={side === 'boss'}
      inspected={inspection?.side === side && inspection.id === skill.id}
      selected={selected?.side === side && selected.id === skill.id}
      onSelect={() => { setInspection(null); onSelect({ side, id: skill.id }); }}
      onInspect={anchor => { if (!selected && !confirmEnd) setInspection({ side, id: skill.id, anchor }); }} onDismiss={() => setInspection(null)} />)}{Array.from({ length: model[side].emptySlots }, (_, index) => <div key={`empty-${index}`} className="empty-skill-slot" aria-label="未習得スキル枠">未習得</div>)}</div>;
  }
  return <main className="battle-screen" style={{ ...battleDesignStyle(design), backgroundImage: `linear-gradient(#07101c70,#07101c50),url("${model.background}")` }}>
    <header className="battle-header"><h1>継世の王座 <small>React戦闘UI検証</small></h1><button disabled={!model.controls.reset || !onReset} onClick={onReset}>再戦</button></header>
    <section className="enemy-area" aria-label="敵情報"><BattleHUD label={model.boss.name} {...model.boss} />{skillRow('boss')}</section>
    <BattleField portrait={model.boss.portrait ?? ''} name={model.boss.name} round={model.round} turn={model.turn} result={model.result} />
    <section className="player-area" aria-label="プレイヤー領域"><BattleHUD label={model.player.name} {...model.player} />
      <div className="player-skill-set">{skillRow('player')}</div>
      <nav className="battle-controls" aria-label="戦闘操作"><button disabled={!model.controls.accelerate.allowed || !onAccelerate} title={model.controls.accelerate.reason} onClick={onAccelerate}>{model.controls.accelerate.label} <small>2MP</small></button><button disabled={!model.controls.endTurn || !onEndTurn} onClick={onEndTurn}>ターン終了</button></nav>
    </section>
    <p className="battle-message" role="status">{model.message}</p>
    {inspection && inspectedSkill && !selected && !confirmEnd && <SkillTooltip skill={inspectedSkill} anchor={inspection.anchor} placement={inspection.side === 'player' ? 'above' : 'below'} />}
    {selected && selectedSkill && <SkillDetail skill={selectedSkill} canUse={selected.side === 'player' && selectedSkill.allowed} onUse={selected.side === 'player' ? onUse : undefined} onClose={onClose} />}
    {confirmEnd && <ConfirmDialog mana={model.player.mana} onCancel={onCancelEnd} onConfirm={onConfirmEnd} />}
  </main>;
}
