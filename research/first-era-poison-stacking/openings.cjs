'use strict';
// Exhaustive legal first-player-turn sequences only; continuation remains finite planner + fixed boss AI.
const fs=require('node:fs'),path=require('node:path'),B=require('./engine.cjs'),C=require('./conditions.cjs'),{simulate}=require('./simulator.cjs');
function enumerate(state){const lines=[];function visit(s,actions){for(const a of B.legal(s)){const t=B.transition(s,a);if(t.state.end||t.state.active!=='player')lines.push([...actions,a]);else visit(t.state,[...actions,a]);}}visit(state,[]);return lines;}
function main(){const root=process.argv[2]||'reports/first-era-poison-stacking',file=path.join(root,'opening-search.jsonl');if(fs.existsSync(file))throw Error('Refusing overwrite');const rows=[],deckIds=['previous_poison','blade_defense','poison_stack','corrosion_replay'];
 for(const deckId of deckIds)for(const mode of ['A','B','C','D']){const config={...C.config,poisonMode:mode},lines=enumerate(B.create(C.decks[deckId],config));
 for(const plannerId of ['matched','deep'])for(const opening of lines){const options={config,planner:C.planners[plannerId],seed:1,opening};rows.push({caseId:'o'+String(rows.length+1).padStart(5,'0'),stage:'opening-search',deckId,mode,plannerId,options,...simulate(C.decks[deckId],options)});}
 console.log(deckId,mode,'legal openings',lines.length,'rows',rows.length);
 }
 fs.writeFileSync(file,rows.map(r=>JSON.stringify(r)).join('\n')+'\n');fs.mkdirSync(path.join(root,'opening-logs'));
 for(const mode of ['A','B','C','D']){const candidates=rows.filter(r=>r.mode===mode&&r.winner==='player').sort((a,b)=>b.poisonDamage-a.poisonDamage||b.remainingHP-a.remainingHP);if(candidates[0]){const r=candidates[0];fs.writeFileSync(path.join(root,'opening-logs',mode+'.json'),JSON.stringify({caseId:r.caseId,...simulate(r.deck,{...r.options,trace:true})})+'\n');}}
 console.log('opening search complete',rows.length);
}
if(require.main===module)main();module.exports={enumerate};
