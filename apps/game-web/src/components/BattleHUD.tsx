import { HealthBar } from './HealthBar';
import { ResourceDisplay } from './ResourceDisplay';
import { StatusEffects } from './StatusEffects';
import type { StatusEffectsProps } from './StatusEffects';
export interface BattleHUDProps extends StatusEffectsProps { label: string; hp: number; maxHp: number; mana: number; manaCap: number; face?: string }
export function BattleHUD({ label, hp, maxHp, mana, manaCap, face, ...effects }: BattleHUDProps) {
  return <section className="battle-hud" aria-label={label}>{face && <img className="hero-face" src={face} alt="" />}<div><h2>{label}</h2><HealthBar label={label} value={hp} maximum={maxHp} /><ResourceDisplay value={mana} maximum={manaCap} /><StatusEffects {...effects} /></div></section>;
}
