export interface HealthBarProps { label: string; value: number; maximum: number }
export function HealthBar({ label, value, maximum }: HealthBarProps) {
  return <div><span>{label} HP {value} / {maximum}</span><progress aria-label={`${label}のHP`} value={value} max={maximum} /></div>;
}
