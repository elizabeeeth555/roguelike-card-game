import { UiImage } from './UiImage';
import { SKILL_ICONS, skillFrame } from '../ui-image-assets';
import type { FocusEvent, PointerEvent } from 'react';
export interface SkillCardProps {
  imageSide?: 'player' | 'boss'; category?: string; id: string; name: string; cost: number; cd: number; stateLabel: string; used: boolean; remaining: number;
  description: string; active?: boolean; compact?: boolean; selected?: boolean; inspected?: boolean;
  onSelect: () => void; onInspect: (anchor: HTMLElement) => void; onDismiss: () => void;
}
// No battle API: both the game and Studio may supply plain view props.
export function SkillCard(props: SkillCardProps) {
  const inspect = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch' && matchMedia('(hover:hover)').matches) props.onInspect(event.currentTarget);
  };
  return <article className={`skill ${props.active ? 'skill-active' : ''} category-${props.category ?? 'none'} ${props.compact ? 'compact' : ''} ${props.used ? 'used' : props.remaining ? 'cooling' : ''} ${props.selected ? 'selected' : ''}`} data-skill-id={props.id}>
    <button type="button" className="skill-open" aria-label={`${props.name}の詳細`} aria-haspopup="dialog" aria-pressed={!!props.selected} aria-describedby={props.inspected ? 'skill-inspection' : undefined}
      onClick={props.onSelect} onPointerEnter={inspect} onPointerLeave={props.onDismiss}
      onFocus={(event: FocusEvent<HTMLButtonElement>) => props.onInspect(event.currentTarget)} onBlur={props.onDismiss}>
      {props.imageSide && <UiImage number={skillFrame(props.imageSide, props.category)} className="skill-frame-art" />}<span className="skill-symbol" aria-hidden="true">{props.imageSide && SKILL_ICONS[props.id] ? <UiImage number={SKILL_ICONS[props.id]} /> : ({ attack: '⚔', defense: '◇', poison: '◈', heal: '✚', buff: '✦', debuff: '◉' } as Record<string, string>)[props.category ?? '']}</span><strong className="skill-name">{props.name}</strong><span className="skill-cost" aria-label={`消費MP ${props.cost}`}>{props.imageSide ? <UiImage number={28} /> : '♦'} {props.cost}</span>
      {!props.compact && <span className="skill-description">{props.description}</span>}
      {props.stateLabel && <span className="skill-state" title={props.stateLabel}>{props.remaining > 0 && !props.used ? `CD中 ${props.remaining}T` : props.stateLabel}</span>}
      <span className="skill-cd" aria-label={`基本CD ${props.cd}`}>{props.imageSide ? <UiImage number={27} /> : '⌛'} {props.cd}</span>
    </button>
  </article>;
}
