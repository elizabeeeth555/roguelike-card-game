import { UiImage } from './UiImage';
import { SKILL_ICONS } from '../ui-image-assets';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { SkillViewModel } from '../battle-view-model';
export function SkillInformation({ skill, illustrated = false }: { skill: SkillViewModel; illustrated?: boolean }) {
  return <>{illustrated && SKILL_ICONS[skill.id] ? <div className="skill-art-placeholder registered-skill-art" aria-label={`${skill.name}のアイコン（専用イラスト未登録）`}><UiImage number={SKILL_ICONS[skill.id]} /></div> : illustrated && <div className="skill-art-placeholder" aria-label="スキル画像未登録">SKILL<br /><small>イラスト未登録</small></div>}<h2>{skill.name}</h2><p className="detail-cost">{illustrated ? <UiImage number={28} /> : '♦'} MP {skill.cost} · {illustrated && <UiImage number={27} />}基本CD {skill.cd}</p><p>{skill.description}</p><p>使用条件：{skill.condition}</p><p>{skill.stateLabel || '待機中'}{skill.reason ? ` ／ ${skill.reason}` : ''}</p></>;
}
export function SkillDetail({ skill, canUse, onUse, onClose, illustrated = false }: { illustrated?: boolean; skill: SkillViewModel; canUse: boolean; onUse?: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null); const title = useId();
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className={`skill-dialog ${illustrated ? 'image-detail' : ''}`} aria-label={`${skill.name}の詳細`} aria-describedby={title} onCancel={event => { event.preventDefault(); onClose(); }}>
    {illustrated && <UiImage number={10} className="detail-frame-art" />}<div id={title}><SkillInformation skill={skill} illustrated={illustrated} /></div><div className="dialog-actions"><button autoFocus onClick={onClose}>{illustrated && <UiImage number={29} className="button-frame-art" />}閉じる</button>{onUse && <button disabled={!canUse} onClick={onUse}>{illustrated && <UiImage number={29} className="button-frame-art" />}使用する</button>}</div>
  </dialog>;
}
export function SkillTooltip({ skill, anchor, placement, illustrated = false }: { illustrated?: boolean; skill: SkillViewModel; anchor: HTMLElement; placement: 'above' | 'below' }) {
  const ref = useRef<HTMLDivElement>(null); const [position, setPosition] = useState({ left: 8, top: 8 });
  useLayoutEffect(() => {
    const update = () => { const box = anchor.getBoundingClientRect(), tip = ref.current!.getBoundingClientRect(); setPosition({ left: Math.max(8, Math.min(innerWidth - tip.width - 8, box.left)), top: Math.max(8, Math.min(innerHeight - tip.height - 8, placement === 'above' ? box.top - tip.height - 8 : box.bottom + 8)) }); };
    update(); window.addEventListener('resize', update); window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [anchor, placement]);
  return <div ref={ref} id="skill-inspection" role="tooltip" className={`skill-tooltip ${illustrated ? 'image-detail' : ''}`} style={position}>{illustrated && <UiImage number={10} className="detail-frame-art" />}<SkillInformation skill={skill} illustrated={illustrated} /></div>;
}
