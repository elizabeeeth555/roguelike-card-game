// Provisional appearance boundary. CSS defaults remain authoritative when keys are omitted.
export interface BattleDesign { hudBackground?: string; skillBorderColor?: string; skillGap?: number; bossScale?: number }
export const BATTLE_DESIGN_FIELDS = [
  { key: 'hudBackground', label: 'HUD背景色', kind: 'color', hint: '#RGB / #RGBA / #RRGGBB / #RRGGBBAA' },
  { key: 'skillBorderColor', label: 'スキル枠線色', kind: 'color', hint: '#RGB / #RGBA / #RRGGBB / #RRGGBBAA' },
  { key: 'skillGap', label: 'スキル間隔', kind: 'number', min: 0, max: 12, hint: '0〜12px' },
  { key: 'bossScale', label: 'ボス画像倍率', kind: 'number', min: 0.5, max: 1.25, hint: '0.5〜1.25倍' }
] as const;
export type BattleDesignKey = typeof BATTLE_DESIGN_FIELDS[number]['key'];
export function validateBattleDesign(input: unknown): { design: BattleDesign; invalidKeys: string[] } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { design: {}, invalidKeys: ['設定オブジェクト'] };
  const data = input as Record<string, unknown>, design: Record<string, string | number> = {};
  const invalidKeys = Object.keys(data).filter(key => !BATTLE_DESIGN_FIELDS.some(field => field.key === key));
  for (const field of BATTLE_DESIGN_FIELDS) {
    if (!Object.hasOwn(data, field.key)) continue;
    const value = data[field.key];
    const valid = field.kind === 'color'
      ? typeof value === 'string' && /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)
      : typeof value === 'number' && Number.isFinite(value) && value >= field.min && value <= field.max;
    if (valid) design[field.key] = value as string | number;
    else invalidKeys.push(field.key);
  }
  return { design, invalidKeys };
}
export function battleDesignStyle(input?: unknown): Record<string, string> {
  const { design } = validateBattleDesign(input), style: Record<string, string> = {};
  if (design.hudBackground) style['--battle-hud-background'] = design.hudBackground;
  if (design.skillBorderColor) style['--battle-skill-border'] = design.skillBorderColor;
  if (design.skillGap !== undefined) style['--battle-skill-gap'] = `${design.skillGap}px`;
  if (design.bossScale !== undefined) style['--battle-boss-scale'] = String(design.bossScale);
  return style;
}
