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
  onUltimate?: () => void; toolbar?: import('react').ReactNode; log?: string[]; presentation?: { skillId?: string; side?: ViewSide; cue?: string; impact?: { target: ViewSide; sequence: string; parts: { kind: 'damage' | 'heal' | 'barrier' | 'state'; text: string }[] } | null };
  onCancelEnd: () => void; onConfirmEnd: () => void;
}
// Layout and ephemeral inspection only. No core/planner/session/editor API.
export function BattleView({ model, design, selected, confirmEnd, onSelect, onClose, onUse, onAccelerate, onEndTurn, onReset, onCancelEnd, onConfirmEnd, onUltimate, toolbar, log, presentation }: BattleViewProps) {
  const firstEra = model.layout === 'first-era';
  const [logOpen, setLogOpen] = useState(false);
  const [inspection, setInspection] = useState<(SkillSelection & { anchor: HTMLElement }) | null>(null);
  useEffect(() => { if (!firstEra || selected || confirmEnd) setInspection(null); }, [model, selected, confirmEnd, firstEra]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setInspection(null); };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);
  const selectedSkill = selected && (selected.id === model.ultimate?.id ? model.ultimate : model[selected.side].skills.find(skill => skill.id === selected.id));
  const inspectedSkill = inspection && (inspection.id === model.ultimate?.id ? model.ultimate : model[inspection.side].skills.find(skill => skill.id === inspection.id));
  function skillRow(side: ViewSide) {
    return <div className={`skills ${side}-skills`} aria-label={side === 'player' ? 'プレイヤースキル' : '敵スキル'}>{model[side].skills.map(skill => <SkillCard key={skill.id} {...skill} compact={side === 'boss'}
      active={presentation?.skillId === skill.id} inspected={inspection?.side === side && inspection.id === skill.id}
      selected={selected?.side === side && selected.id === skill.id}
      onSelect={() => { setInspection(null); onSelect({ side, id: skill.id }); }}
      onInspect={anchor => { if (!selected && !confirmEnd) setInspection({ side, id: skill.id, anchor }); }} onDismiss={() => setInspection(null)} />)}{Array.from({ length: model[side].emptySlots }, (_, index) => <div key={`empty-${index}`} className="empty-skill-slot" aria-label="未習得スキル枠">未習得</div>)}</div>;
  }
  return <main className={`battle-screen ${firstEra ? 'first-era-battle' : ''} ${presentation?.side === 'boss' ? 'enemy-performing' : ''}`} style={{ ...battleDesignStyle(design), backgroundImage: `linear-gradient(#07101c70,#07101c50),url("${model.background}")` }}>
    <header className="battle-header">{firstEra ? <><p>{model.round} Turn / {model.turn}</p><div className="battle-toolbar">{toolbar}</div></> : <><h1>継世の王座 <small>React戦闘UI検証</small></h1><button disabled={!model.controls.reset || !onReset} onClick={onReset}>再戦</button></>}</header>{firstEra && <svg className="battle-chains" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M24 30 L50 40 M24 42 L50 42 M24 54 L50 44 M76 35 L50 40 M76 51 L50 43" /></svg>}
    <section className="enemy-area" aria-label="敵情報"><BattleHUD minimal={firstEra} label={model.boss.name} {...model.boss} />{skillRow('boss')}</section>
    {firstEra && <div className="boss-stance"><span>{model.stance}</span><progress aria-label="崩しゲージ" value={model.breakGauge} max={4} /><small>崩し {model.breakGauge}/4</small></div>}<BattleField portrait={model.boss.portrait ?? ''} name={model.boss.name} round={model.round} turn={model.turn} result={model.result} />
    <section className="player-area" aria-label="プレイヤー領域"><BattleHUD minimal={firstEra} adaptiveHealth={firstEra} label={model.player.name} {...model.player} />
      <div className="player-skill-set">{skillRow('player')}</div>{model.ultimate && <button className="ultimate-button" onFocus={e => { if (!selected) setInspection({ side: 'player', id: model.ultimate!.id, anchor: e.currentTarget }); }} onBlur={() => setInspection(null)} onPointerEnter={e => { if (e.pointerType !== 'touch' && !selected) setInspection({ side: 'player', id: model.ultimate!.id, anchor: e.currentTarget }); }} onPointerLeave={() => setInspection(null)} onClick={() => onSelect({ side: 'player', id: model.ultimate!.id })}>{model.ultimate.name}<small>♦ {model.ultimate.cost} ／ {model.ultimate.stateLabel}</small></button>}
      <nav className="battle-controls" aria-label="戦闘操作"><button disabled={!model.controls.accelerate.allowed || !onAccelerate} title={model.controls.accelerate.reason} onClick={onAccelerate}>{model.controls.accelerate.label} <small>2MP</small></button><button disabled={!model.controls.endTurn || !onEndTurn} onClick={onEndTurn}>ターン終了</button></nav>
    </section>
    {firstEra && presentation?.impact && <div key={presentation.impact.sequence} className={`battle-impact target-${presentation.impact.target}`} aria-hidden="true">{presentation.impact.parts.map((part, i) => <span key={i} className={`impact-${part.kind}`}>{part.text}</span>)}</div>}<p className="battle-message" role="status">{presentation?.cue || model.message}</p>{firstEra && <><button className="log-toggle" aria-expanded={logOpen} onClick={() => setLogOpen(!logOpen)}>戦闘ログ</button>{logOpen && <aside className="battle-log" aria-label="戦闘ログ"><button onClick={() => setLogOpen(false)}>閉じる</button><ol>{log?.map((line, i) => <li key={i}>{line}</li>)}</ol></aside>}</>}
    {inspection && inspectedSkill && !selected && !confirmEnd && <SkillTooltip illustrated={firstEra} skill={inspectedSkill} anchor={inspection.anchor} placement={inspection.side === 'player' ? 'above' : 'below'} />}
    {selected && selectedSkill && <SkillDetail illustrated={firstEra} skill={selectedSkill} canUse={selected.side === 'player' && selectedSkill.allowed} onUse={selected.side === 'player' ? selected.id === model.ultimate?.id ? onUltimate : onUse : undefined} onClose={onClose} />}
    {confirmEnd && <ConfirmDialog mana={model.player.mana} onCancel={onCancelEnd} onConfirm={onConfirmEnd} />}
  </main>;
}
