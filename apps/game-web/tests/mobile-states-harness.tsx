// Browser-only display fixtures. Never imported by app entries or production builds.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BattleView } from '../src/BattleView';
import { createPreviewModel } from '../src/preview-presets';
import type { SkillSelection } from '../src/battle-view-model';
import '../src/styles.css';
import '../src/first-era/first-era.css';
const element = document.createElement('div'); document.body.replaceChildren(element); const root = createRoot(element);
function DisplayStates({ border, firstEra }: { border: string; firstEra: boolean }) {
 const [selected, setSelected] = useState<SkillSelection | null>(null);
 const model = createPreviewModel('normal'); if(firstEra) model.layout = 'first-era'; model.message = '';
 const states = ['ready','used','cooldown','mana','condition'] as const;
 model.player.skills = states.map((state,i) => ({ id:'fixture-'+state,name:['可能','使用済','CD中','MP不足','条件未達'][i],cost:1,cd:1,category:'attack',description:'状態表示の検証用仮データ。戦闘としての整合性は保証しない。',condition:'表示検証用',allowed:state==='ready',reason:state==='ready'?'':state==='used'?'使用済み':state==='cooldown'?'CD中':state==='mana'?'マナ不足':'条件未達',remaining:state==='cooldown'?2:0,used:state==='used',stateLabel:'',statusCode:state==='condition'?'poison':state==='ready'?null:state }));
 model.player.emptySlots=0;
 return <div className="first-era-app"><BattleView model={model} design={{skillBorderColor:border}} selected={selected} confirmEnd={false} onSelect={setSelected} onClose={()=>setSelected(null)} onUse={()=>{throw Error('Display inspection must not activate');}} onCancelEnd={()=>{}} onConfirmEnd={()=>{}} /></div>;
}
export function render(border='#245678',firstEra=true){root.render(<DisplayStates border={border} firstEra={firstEra} />);}
