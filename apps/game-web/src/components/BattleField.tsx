export function BattleField({ portrait, name, round, turn, result }: { portrait: string; name: string; round: number; turn: string; result: string | null }) {
  return <section className="battle-field" aria-label="戦闘フィールド"><img className="boss-portrait" src={portrait} alt={name} /><p className="turn-label" aria-live="polite">ROUND {round} · {result ?? turn}</p></section>;
}
