// Display contract only: no engine, session, AI, save or editor dependencies.
export type ViewSide = 'player' | 'boss';
export interface SkillViewModel {
  statusCode?: string | null; category?: string; id: string; name: string; cost: number; cd: number; description: string;
  condition: string; allowed: boolean; reason: string; remaining: number; used: boolean; stateLabel: string;
}
export interface CharacterViewModel {
  name: string; facePlaceholder?: boolean; face?: string; portrait?: string;
  hp: number; maxHp: number; mana: number; manaCap: number;
  barrier: number; poison: number; weak: number; attackBonus: number; setupBonus: number;
  poisonDamage?: number; manaPenalty: number; accelerationPending: boolean;
  skills: SkillViewModel[]; emptySlots: number;
}
export interface BattleViewModel {
  manaForecast?: { pending: boolean }; damagePreview?: { hpDamage: number; barrierAbsorbed: number };
  layout?: 'first-era'; bossAbility?: { id: string; name: string; description: string; condition: string; status: string; charging: boolean }; ultimate?: SkillViewModel;
  player: CharacterViewModel; boss: CharacterViewModel;
  background: string; round: number; turn: string; result: string | null; message: string;
  controls: { accelerate: { allowed: boolean; reason: string; label: string; statusCode?: string | null }; endTurn: boolean; reset: boolean };
}
export interface SkillSelection { side: ViewSide; id: string }
