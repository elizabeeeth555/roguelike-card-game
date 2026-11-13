import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { chainSegment } from './chain-geometry';
interface Line { id: string; d: string }
export function SkillChains({ field, ids, active }: { field: RefObject<HTMLElement | null>; ids: string[]; active?: string }) {
 const [geometry, setGeometry] = useState({ width: 1, height: 1, lines: [] as Line[] });
 const key = ids.join('|');
 useEffect(() => {
  const root = field.current, portrait = root?.querySelector<HTMLImageElement>('.boss-portrait');
  if (!root || !portrait) return;
  let frame = 0, disposed = false;
  const measure = () => {
   frame = 0; if (disposed) return;
   const r = root.getBoundingClientRect(), b = portrait.getBoundingClientRect();
   const panels = [...root.querySelectorAll<HTMLElement>('.enemy-area .skill')];
   const lines = ids.flatMap((id, index) => { const panel = panels.find(n => n.dataset.skillId === id); if (!panel) return []; const p = chainSegment(r, panel.getBoundingClientRect(), b, index); const n = (v: number) => v.toFixed(1); return [{ id, d: `M${n(p.x1)} ${n(p.y1)} L${n(p.x2)} ${n(p.y2)}` }]; });
   const next = { width: r.width, height: r.height, lines };
   setGeometry(old => JSON.stringify(old) === JSON.stringify(next) ? old : next);
   if (active) frame = requestAnimationFrame(measure);
  };
  const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(measure); };
  const observer = new ResizeObserver(schedule); observer.observe(root); observer.observe(portrait); root.querySelectorAll('.enemy-area .skill').forEach(n => observer.observe(n));
  window.addEventListener('resize', schedule); window.addEventListener('scroll', schedule, true); window.visualViewport?.addEventListener('resize', schedule); portrait.addEventListener('load', schedule); measure();
  return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', schedule); window.removeEventListener('scroll', schedule, true); window.visualViewport?.removeEventListener('resize', schedule); portrait.removeEventListener('load', schedule); };
 }, [field, key, active]);
 return <svg className="battle-chains" viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true">{geometry.lines.map(line => <path key={line.id} data-skill-id={line.id} className={line.id === active ? 'chain-active' : ''} d={line.d} />)}</svg>;
}
