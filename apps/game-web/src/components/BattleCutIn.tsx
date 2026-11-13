export interface CutIn { text: 'BATTLE START' | 'YOUR TURN' | 'ENEMY TURN' | 'VICTORY' | 'DEFEAT'; milliseconds: number; sequence: number }
export function BattleCutIn({ value, onSkip }: { value: CutIn; onSkip?: () => void }) {
 return <div key={value.sequence} className="battle-cutin" style={{ animationDuration: `${value.milliseconds}ms` }} role="status"><button type="button" onClick={onSkip} onKeyDown={e => { if (e.repeat && (e.key === 'Enter' || e.code === 'Space')) e.preventDefault(); }} aria-label={`${value.text}：このカットインをスキップ`}>{value.text}<small>クリック / Enter / Space でこの表示をスキップ</small></button></div>;
}
