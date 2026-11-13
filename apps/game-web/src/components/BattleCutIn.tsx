export interface CutIn { text: 'BATTLE START' | 'YOUR TURN' | 'ENEMY TURN' | 'VICTORY' | 'DEFEAT'; milliseconds: number; sequence: number }
export function BattleCutIn({ value, onSkip }: { value: CutIn; onSkip?: () => void }) {
 return <div key={value.sequence} className="battle-cutin" style={{ animationDuration: `${value.milliseconds}ms` }} role="status"><button type="button" onClick={onSkip} aria-label={`${value.text}：演出をスキップ`}>{value.text}<small>クリック / Enter / Space でスキップ</small></button></div>;
}
