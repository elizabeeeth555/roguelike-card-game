import { HealthBar } from './HealthBar';
import { ResourceDisplay } from './ResourceDisplay';
import { StatusEffects } from './StatusEffects';
import type { StatusEffectsProps } from './StatusEffects';
export interface BattleHUDProps extends StatusEffectsProps { label: string; hp: number; maxHp: number; mana: number; manaCap: number; face?: string; facePlaceholder?: boolean; minimal?: boolean; adaptiveHealth?: boolean; predictedDamage?: number }
export function BattleHUD({ label, hp, maxHp, mana, manaCap, face, facePlaceholder, minimal = false, adaptiveHealth = false, predictedDamage, ...effects }: BattleHUDProps) {
  return <section className="battle-hud" aria-label={label}>{facePlaceholder && !face && <span className="hero-placeholder" aria-label="英雄肖像未登録">肖像<br />未登録</span>}{face && <img className="hero-face" src={face} alt="" />}<div><div className="hud-heading"><h2>{label}</h2>{minimal && <span>{hp} / {maxHp}</span>}</div><HealthBar label={label} value={hp} maximum={maxHp} hideLabel={minimal} adaptive={adaptiveHealth} prediction={predictedDamage} /><ResourceDisplay value={mana} maximum={manaCap} crystalsOnly={minimal} /><StatusEffects {...effects} /></div></section>;
}
