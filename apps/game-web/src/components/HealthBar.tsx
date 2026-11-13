export interface HealthBarProps { label: string; value: number; maximum: number; hideLabel?: boolean }
export function HealthBar({ label, value, maximum, hideLabel = false }: HealthBarProps) {
  return <div>{!hideLabel && <span>{label} HP {value} / {maximum}</span>}<progress aria-label={`${label}のHP`} value={value} max={maximum} /></div>;
}
