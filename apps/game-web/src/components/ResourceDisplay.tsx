export function ResourceDisplay({ value, maximum }: { value: number; maximum: number }) {
  return <p className="resource" aria-label={`MP ${value} / ${maximum}`}><span className="mana-crystals" aria-hidden="true">{Array.from({ length: maximum }, (_, i) => <i key={i} className={i < value ? 'lit' : ''}>♦</i>)}</span><span className="resource-numbers"><span className="legacy-mana-symbol">♦</span> MP <strong>{value}</strong> / {maximum}</span></p>;
}
