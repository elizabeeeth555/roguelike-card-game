import { UiImage } from './UiImage';
import { SKILL_ICONS } from '../ui-image-assets';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { SkillViewModel } from '../battle-view-model';
import { detailOrigin, detailPosition } from './detail-layout.ts';

// The same art, fields and information order are used at both inspection sizes.
export function SkillInformation({ skill, illustrated = false }: { skill: SkillViewModel; illustrated?: boolean }) {
 if (!illustrated) return <><h2>{skill.name}</h2><p className="detail-cost">♦ MP {skill.cost} · 基本CD {skill.cd}</p><p>{skill.description}</p><p>使用条件：{skill.condition}</p><p>{skill.stateLabel || '待機中'}{skill.reason ? ` ／ ${skill.reason}` : ''}</p></>;
 return <article className="asset-detail-card" aria-label={`${skill.name}の装飾詳細カード`}>
  <UiImage number={10} className="detail-frame-art" />
  <div className="detail-illustration" aria-label={`${skill.name}：専用イラスト未登録`}>{SKILL_ICONS[skill.id] ? <UiImage number={SKILL_ICONS[skill.id]} /> : <span>イラスト未登録</span>}</div>
  <header className="detail-heading"><h2>{skill.name}</h2><span className="detail-mp" aria-label={`消費MP ${skill.cost}`}><UiImage number={28} /><b>{skill.cost}</b></span></header>
  <div className="detail-copy" tabIndex={0} aria-label="効果と使用条件"><p>{skill.description}</p><p>使用条件：{skill.condition}</p><p>{skill.stateLabel || '待機中'}{skill.reason ? ` ／ ${skill.reason}` : ''}</p></div>
  <span className="detail-cd" aria-label={`基本CD ${skill.cd}`}><UiImage number={27} /><b>{skill.cd}</b></span>
 </article>;
}
export function SkillDetail({ skill, canUse, onUse, onClose, illustrated = false, anchor }: { illustrated?: boolean; anchor?: HTMLElement | null; skill: SkillViewModel; canUse: boolean; onUse?: () => void; onClose: () => void }) {
 const ref = useRef<HTMLDialogElement>(null), title = useId(), consumed = useRef(false);
 const [animating, setAnimating] = useState(illustrated);
 useLayoutEffect(() => {
  const dialog = ref.current!, previous = document.activeElement as HTMLElement | null;
  const origin = anchor?.isConnected ? anchor.getBoundingClientRect() : undefined;
  dialog.showModal();
  let animation: Animation | undefined, alive = true;
  if (illustrated && origin && typeof dialog.animate === 'function' && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
   const card = dialog.querySelector<HTMLElement>('.asset-detail-card')!, target = card.getBoundingClientRect(), from = detailOrigin(origin, target);
   dialog.style.transformOrigin = `${target.left - dialog.getBoundingClientRect().left}px ${target.top - dialog.getBoundingClientRect().top}px`;
   dialog.dataset.originX = String(origin.left + origin.width / 2); dialog.dataset.originY = String(origin.top + origin.height / 2);
   animation = dialog.animate([{ transform: `translate(${from.x}px,${from.y}px) scale(${from.scaleX},${from.scaleY})`, opacity: .75 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
   animation.finished.then(() => { if (alive) setAnimating(false); }, () => {});
  } else setAnimating(false);
  return () => { alive = false; animation?.cancel(); dialog.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
 }, []);
 function use() { if (animating || !canUse || consumed.current) return; consumed.current = true; onUse?.(); }
 return <dialog ref={ref} className={`skill-dialog ${illustrated ? 'image-detail' : ''}`} data-animating={animating} aria-label={`${skill.name}の詳細`} aria-describedby={title}
  onClick={event => { if (event.target === event.currentTarget) onClose(); }} onCancel={event => { event.preventDefault(); onClose(); }}>
  <div id={title}><SkillInformation skill={skill} illustrated={illustrated} /></div>
  <div className="dialog-actions"><button autoFocus onClick={onClose}>{illustrated && <UiImage number={29} className="button-frame-art" />}閉じる</button>{onUse && <button disabled={!canUse || animating} onClick={use}>{illustrated && <UiImage number={29} className="button-frame-art" />}使用する</button>}</div>
 </dialog>;
}
export function SkillTooltip({ skill, anchor, placement, illustrated = false, matchAnchorWidth = false, onKeepOpen, onDismiss }: { illustrated?: boolean; matchAnchorWidth?: boolean; skill: SkillViewModel; anchor: HTMLElement; placement: 'above' | 'below' | 'left' | 'right'; onKeepOpen?: () => void; onDismiss?: () => void }) {
 const ref = useRef<HTMLDivElement>(null); const [position, setPosition] = useState<{ left: number; top: number; width?: number }>({ left: 8, top: 8 });
 useLayoutEffect(() => {
  const update = () => { if (!anchor.isConnected || !ref.current) return; const box = anchor.getBoundingClientRect(); if (illustrated && matchAnchorWidth) ref.current.style.width = `${box.width}px`; const tip = ref.current.getBoundingClientRect(); setPosition({ ...detailPosition(box, tip.width, tip.height, { width: innerWidth, height: innerHeight }, placement), ...(illustrated && matchAnchorWidth ? { width: box.width } : {}) }); };
  update(); const observer = new ResizeObserver(update); observer.observe(anchor); observer.observe(ref.current!); window.addEventListener('resize', update); window.addEventListener('scroll', update, true);
  return () => { observer.disconnect(); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
 }, [anchor, placement, illustrated, matchAnchorWidth]);
 return <div ref={ref} id="skill-inspection" role="tooltip" data-placement={placement} className={`skill-tooltip ${illustrated ? 'image-detail' : ''}`} style={position} onPointerEnter={onKeepOpen} onPointerLeave={onDismiss}><SkillInformation skill={skill} illustrated={illustrated} /></div>;
}
