export interface SkillCardProps { name: string; cost: number; cd: number; remaining: number; reason: string; selected?: boolean; onSelect?: () => void }
// View props only: no engine/global state. Studio can supply preview props later.
export function SkillCard({ name, cost, cd, remaining, reason, selected, onSelect }: SkillCardProps) {
  return <article className={selected ? 'skill selected' : 'skill'}><h3>{name}</h3><p>MP {cost} · 基本CD {cd}</p><p>残CD {remaining} · {reason || '使用可能'}</p>{onSelect && <button type="button" aria-pressed={!!selected} onClick={onSelect}>詳細を確認</button>}</article>;
}
