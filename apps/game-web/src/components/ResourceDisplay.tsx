export function ResourceDisplay({ value, maximum }: { value: number; maximum: number }) {
  return <p className="resource" aria-label={`MP ${value} / ${maximum}`}>♦ MP <strong>{value}</strong> / {maximum}</p>;
}
