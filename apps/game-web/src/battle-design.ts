// Small, provisional appearance boundary, not the Studio JSON schema.
export interface BattleDesign { hudBackground?: string; skillBorderColor?: string; skillGap?: number; bossScale?: number }
const color = (value: unknown) => typeof value === 'string' && /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value) ? value : undefined;
const numberIn = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : undefined;
export function battleDesignStyle(input?: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const data = input as Record<string, unknown>, style: Record<string, string> = {};
  const hud = color(data.hudBackground), border = color(data.skillBorderColor);
  const gap = numberIn(data.skillGap, 0, 12), scale = numberIn(data.bossScale, 0.5, 1.25);
  if (hud) style['--battle-hud-background'] = hud;
  if (border) style['--battle-skill-border'] = border;
  if (gap !== undefined) style['--battle-skill-gap'] = `${gap}px`;
  if (scale !== undefined) style['--battle-boss-scale'] = String(scale);
  return style;
}
