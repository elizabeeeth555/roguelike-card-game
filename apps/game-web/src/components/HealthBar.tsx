export interface HealthBarProps { label: string; value: number; maximum: number; hideLabel?: boolean; adaptive?: boolean }
export function HealthBar({ label, value, maximum, hideLabel = false, adaptive = false }: HealthBarProps) {
  return <div>{!hideLabel && <span>{label} HP {value} / {maximum}</span>}<progress style={adaptive ? { accentColor: value / maximum > .5 ? '#63855f' : value / maximum > .25 ? '#d3af4f' : '#bc4b45' } : undefined} aria-label={`${label}のHP`} value={value} max={maximum} /></div>;
}
