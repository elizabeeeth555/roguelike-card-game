import { useEffect, useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
export function ThroneButton(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`throne-button ${props.className ?? ''}`} />; }
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`throne-panel ${className}`}>{children}</section>; }
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
 const ref = useRef<HTMLDialogElement>(null);
 useEffect(() => { const previous = document.activeElement as HTMLElement | null; const d = ref.current!; d.showModal(); return () => { d.close(); previous?.focus(); }; }, []);
 return <dialog ref={ref} className="throne-modal" aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }}><h2>{title}</h2>{children}<ThroneButton autoFocus onClick={onClose}>閉じる</ThroneButton></dialog>;
}
