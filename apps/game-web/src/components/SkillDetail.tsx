import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { SkillView } from '../battle-adapter';
export function SkillInformation({ skill }: { skill: SkillView }) {
  return <><h2>{skill.name}</h2><p>♦ MP {skill.cost} · 基本CD {skill.cd}</p><p>{skill.description}</p><p>使用条件：{skill.condition}</p><p>{skill.stateLabel || '待機中'}{skill.reason ? ` ／ ${skill.reason}` : ''}</p></>;
}
export function SkillDetail({ skill, canUse, onUse, onClose }: { skill: SkillView; canUse: boolean; onUse?: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null); const title = useId();
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className="skill-dialog" aria-label={`${skill.name}の詳細`} aria-describedby={title} onCancel={event => { event.preventDefault(); onClose(); }}>
    <div id={title}><SkillInformation skill={skill} /></div><div className="dialog-actions"><button autoFocus onClick={onClose}>閉じる</button>{onUse && <button disabled={!canUse} onClick={onUse}>使用する</button>}</div>
  </dialog>;
}
export function SkillTooltip({ skill, anchor, placement }: { skill: SkillView; anchor: HTMLElement; placement: 'above' | 'below' }) {
  const ref = useRef<HTMLDivElement>(null); const [position, setPosition] = useState({ left: 8, top: 8 });
  useLayoutEffect(() => {
    const update = () => { const box = anchor.getBoundingClientRect(), tip = ref.current!.getBoundingClientRect(); setPosition({ left: Math.max(8, Math.min(innerWidth - tip.width - 8, box.left)), top: Math.max(8, Math.min(innerHeight - tip.height - 8, placement === 'above' ? box.top - tip.height - 8 : box.bottom + 8)) }); };
    update(); window.addEventListener('resize', update); window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [anchor, placement]);
  return <div ref={ref} id="skill-inspection" role="tooltip" className="skill-tooltip" style={position}><SkillInformation skill={skill} /></div>;
}
