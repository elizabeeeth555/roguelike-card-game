export interface HealthBarProps { label: string; value: number; maximum: number; hideLabel?: boolean; adaptive?: boolean; prediction?: number }
export function HealthBar({ label, value, maximum, hideLabel = false, adaptive = false, prediction }: HealthBarProps) {
  const predicted = Math.min(value, Math.max(0, prediction ?? 0)), maximumForDisplay = Math.max(1, maximum);
  return <div className={prediction !== undefined ? 'health-preview' : undefined}>{!hideLabel && <span>{label} HP {value} / {maximum}</span>}<progress style={adaptive ? { accentColor: value / maximum > .5 ? '#63855f' : value / maximum > .25 ? '#d3af4f' : '#bc4b45' } : undefined} aria-label={`${label}のHP`} value={value} max={maximum} />{predicted > 0 && <span className="health-prediction" aria-hidden="true" style={{ left: `${(value - predicted) / maximumForDisplay * 100}%`, width: `${predicted / maximumForDisplay * 100}%` }} />}</div>;
}
