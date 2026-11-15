export interface StatusEffectsProps { barrier: number; poison: number; weak: number; attackBonus: number; setupBonus: number; manaPenalty: number; accelerationPending: boolean; poisonDamage?: number }
// Explanations follow combat.md / skills.md. This module never resolves effects.
export function statusEntries(p: StatusEffectsProps) {
 return [
  { id: 'barrier', label: 'バリア', value: p.barrier, image: 2, symbol: '◇', description: '直接攻撃を吸収し、残りは次の相手ターン終了時に消滅する。毒は吸収しない。' },
  { id: 'poison', label: '毒', value: p.poison, image: 6, symbol: '◈', description: `自身のターン終了時に継続ダメージを受け、残数が減る。バリアを無視する。${p.poisonDamage === undefined ? '' : `現在の継続ダメージは${p.poisonDamage}。`}` },
  { id: 'weak', label: '弱体', value: p.weak, image: 8, symbol: '↓', description: '次の直接攻撃の威力を減らし、その攻撃で消費する。攻撃せず終了しても残る。' },
  { id: 'attackBonus', label: '攻撃強化', value: p.attackBonus, image: 7, symbol: '↑', description: 'この自ターンの次の直接攻撃に加算し、その攻撃で消費する。攻撃せず終了すると失効する。' },
  { id: 'setupBonus', label: '次ターン強化', value: p.setupBonus, image: 7, symbol: '次', description: '次の自ターンに攻撃強化へ移る。次の自ターンに攻撃せず終了すると失効する。' },
  { id: 'manaPenalty', label: 'MP妨害', value: p.manaPenalty, symbol: '◇−', description: '次の自ターン開始時のMP補充を減らす。共通の補充下限に従う。' },
  { id: 'accelerationPending', label: '加速予約', value: p.accelerationPending ? 1 : 0, symbol: '＋', description: '次の自ターン開始時にMP上限が増える。仮結晶は予約であり、現在使用できるMPではない。' }
 ].filter(e => e.value > 0);
}
