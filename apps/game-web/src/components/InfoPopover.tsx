import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { detailPosition } from './detail-layout';
// Read-only shared inspection: no game state, legal-action or persistence dependencies.
export function InfoPopover({ label, children, icon, className = '', placement = 'above' }: { label: string; children: ReactNode; icon: ReactNode; className?: string; placement?: 'above' | 'below' }) {
 const [hover, setHover] = useState(false), [pinned, setPinned] = useState(false), [dismissed, setDismissed] = useState(false);
 const button = useRef<HTMLButtonElement>(null), tip = useRef<HTMLDivElement>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), id = useId();
 const suppressed = useRef(false);
 const open = pinned || hover && !dismissed;
 const [position, setPosition] = useState({ left: 8, top: 8 });
 const keep = () => { if (timer.current) clearTimeout(timer.current); };
 const enter = () => { keep(); if (!suppressed.current) { setHover(true); setDismissed(false); } };
 const leave = () => { suppressed.current = false; keep(); timer.current = setTimeout(() => setHover(false), 160); };
 const close = () => { suppressed.current = true; keep(); setPinned(false); setHover(false); setDismissed(true); };
 useEffect(() => { const outside = (e: PointerEvent) => { if (!button.current?.contains(e.target as Node) && !tip.current?.contains(e.target as Node)) close(); }; const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); }; document.addEventListener('pointerdown', outside); document.addEventListener('keydown', key); return () => { keep(); document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key); }; }, []);
 useLayoutEffect(() => { if (!open) return; const update = () => { if (button.current && tip.current) { const r = tip.current.getBoundingClientRect(); setPosition(detailPosition(button.current.getBoundingClientRect(), r.width, r.height, { width: innerWidth, height: innerHeight }, placement)); } }; update(); window.addEventListener('resize', update); window.addEventListener('scroll', update, true); return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); }; }, [open, placement, children]);
 return <><button type="button" className={`info-trigger ${className}`} ref={button} aria-label={label} aria-expanded={open} aria-controls={open ? id : undefined} aria-describedby={open ? id : undefined} onPointerEnter={e => { if (e.pointerType !== 'touch') enter(); }} onPointerLeave={leave} onFocus={enter} onBlur={leave} onClick={() => { if (pinned) close(); else { suppressed.current = false; keep(); setPinned(true); setDismissed(false); } }}>{icon}</button>{open && createPortal(<div ref={tip} id={id} role="tooltip" className="info-popover" style={position} onPointerEnter={keep} onPointerLeave={leave}><strong>{label}</strong>{children}{pinned && <button onClick={() => { button.current?.focus(); close(); }}>閉じる</button>}</div>, document.body)}</>;
}
