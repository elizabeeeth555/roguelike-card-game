import { UiImage } from './UiImage';
export function ResourceDisplay({ value, maximum, crystalsOnly = false }: { value: number; maximum: number; crystalsOnly?: boolean }) {
  return <p className="resource" aria-label={`MP ${value} / ${maximum}`}><span className="mana-crystals" aria-hidden="true">{Array.from({ length: maximum }, (_, i) => <i key={i} className={i < value ? 'lit' : ''}>{crystalsOnly ? <UiImage number={28} /> : '♦'}</i>)}</span>{!crystalsOnly && <span className="resource-numbers"><span className="legacy-mana-symbol">♦</span> MP <strong>{value}</strong> / {maximum}</span>}</p>;
}
