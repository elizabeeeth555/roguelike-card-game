export interface StatusEffectsProps { barrier: number; poison: number; weak: number; attackBonus: number; setupBonus: number; manaPenalty: number; accelerationPending: boolean }
export function StatusEffects(props: StatusEffectsProps) {
  const entries = [['バリア', props.barrier], ['毒', props.poison], ['弱体', props.weak], ['攻撃強化', props.attackBonus], ['次ターン強化', props.setupBonus], ['MP妨害', props.manaPenalty]] as const;
  return <ul className="status-effects" aria-label="状態効果">{entries.filter(([, value]) => value > 0).map(([label, value]) => <li key={label} className={label === '毒' ? 'poison' : ''}>{label} {value}</li>)}{props.accelerationPending && <li>加速予約</li>}{!props.accelerationPending && entries.every(([, value]) => value === 0) && <li className="muted">状態効果なし</li>}</ul>;
}
