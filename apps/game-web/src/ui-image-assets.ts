import inventory from '../ui-image-assets.json' with { type: 'json' };
// Visual classification only. Does not read or alter battle rules/tags.
export const UI_IMAGES = inventory as Record<string, { path: string; width: number; height: number; viewBox: number[] }>;
export const SKILL_ICONS: Record<string, number> = { slash: 20, heavy_slash: 26, barrier: 24, first_aid: 19, battle_spirit: 18, setup: 42, first_era_corrosion: 16, first_era_poison_thrust: 15, first_era_venom_blade: 13, feint: 12, first_era_echo: 14 };
const PLAYER_FRAMES: Record<string, number> = { heal: 30, defense: 31, buff: 32, attack: 33, poison: 34, debuff: 35 };
const BOSS_FRAMES: Record<string, number> = { buff: 36, heal: 37, debuff: 38, poison: 39, defense: 40, attack: 41 };
export function skillFrame(side: 'player' | 'boss', category?: string) { return (side === 'boss' ? BOSS_FRAMES : PLAYER_FRAMES)[category ?? '']; }
export function uiImageUrl(number: number) { const image = UI_IMAGES[number]; return image ? './first-era/ui/' + image.path.slice('assets/ui/'.length) : undefined; }
