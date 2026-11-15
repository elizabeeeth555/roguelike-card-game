import { useEffect, useId, useRef, useState } from 'react';
import type { BattleViewModel } from '../battle-view-model';
import { UiImage } from './UiImage';
// Display-only information. Game/studio hosts supply the same resolved model.
export function BossAbility({ ability }: { ability: NonNullable<BattleViewModel['bossAbility']> }) {
 const [hover, setHover] = useState(false), [pinned, setPinned] = useState(false), [dismissed, setDismissed] = useState(false);
 const ref = useRef<HTMLDivElement>(null), button = useRef<HTMLButtonElement>(null), id = useId();
 const open = pinned || hover && !dismissed;
 useEffect(() => {
  const outside = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) { setPinned(false); setHover(false); } };
  const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setPinned(false); setHover(false); setDismissed(true); } };
  document.addEventListener('pointerdown', outside); document.addEventListener('keydown', key);
  return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key); };
 }, []);
 return <div ref={ref} className="boss-ability" onPointerEnter={e => { if (e.pointerType !== 'touch') { setHover(true); setDismissed(false); } }} onPointerLeave={() => setHover(false)}>
  <button ref={button} className="boss-ability-icon" aria-label={`固有能力：${ability.name}`} aria-expanded={open} aria-controls={id} onFocus={() => { setHover(true); setDismissed(false); }} onBlur={e => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setHover(false); }} onClick={() => { setPinned(!pinned); setDismissed(pinned); }}><UiImage number={11} /></button>
  {open && <section id={id} className="boss-ability-detail" role="tooltip"><strong>{ability.name}</strong><p>{ability.description}</p><p>{ability.condition}</p><p>{ability.status}</p>{pinned && <button onClick={() => { button.current?.focus(); setPinned(false); setHover(false); setDismissed(true); }}>閉じる</button>}</section>}
 </div>;
}
