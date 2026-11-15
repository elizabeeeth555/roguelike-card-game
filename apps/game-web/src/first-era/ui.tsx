import { UiImage } from '../components/UiImage';
import { useEffect, useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
export function ThroneButton(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`throne-button ${props.className ?? ''}`}><UiImage number={29} className="button-frame-art" />{props.children}</button>; }
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`throne-panel ${className}`}>{children}</section>; }
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
 const ref = useRef<HTMLDialogElement>(null);
 useEffect(() => { const previous = document.activeElement as HTMLElement | null; const d = ref.current!; d.setAttribute('autofocus', ''); d.showModal(); d.focus({ preventScroll: true }); return () => { d.close(); previous?.focus(); }; }, []);
 return <dialog ref={ref} className="throne-modal" tabIndex={-1} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }}><h2>{title}</h2>{children}<ThroneButton onClick={onClose}>閉じる</ThroneButton></dialog>;
}
