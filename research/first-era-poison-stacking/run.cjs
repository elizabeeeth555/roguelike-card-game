'use strict';
const fs=require('node:fs'),path=require('node:path'),B=require('./engine.cjs'),{simulate}=require('./simulator.cjs'),C=require('./conditions.cjs');
const {selectRepresentatives}=require('./representatives.cjs');
const {aggregate}=require('../first-era-poison-replay/run.cjs');
const groupKey=r=>[r.stage,r.deckId,r.mode,r.plannerId,r.variant||'main'].join('/');
function summarize(rows){const groups=new Map();for(const row of rows){const key=groupKey(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
 return [...groups].map(([key,rs])=>{const sum=k=>rs.reduce((a,r)=>a+r[k],0),win=rs.filter(r=>r.winner==='player');return {key,...aggregate(rs),minimumRound:Math.min(...rs.map(r=>r.round)),meanPoisonApplications:sum('poisonApplications')/rs.length,meanFailedThrusts:sum('failedThrusts')/rs.length,meanUnusedPoison:sum('unusedPoison')/rs.length,unusedSkills:C.decks[rs[0].deckId].filter(id=>!rs.some(r=>r.skillUses[id])),meanLosingBossHP:rs.length>win.length?rs.filter(r=>r.winner!=='player').reduce((n,r)=>n+r.bossHP,0)/(rs.length-win.length):null};});}
function main(){const root=path.resolve(process.argv[2]||'reports/first-era-poison-stacking');if(fs.existsSync(root))throw Error('Refusing overwrite output');fs.mkdirSync(path.join(root,'logs'),{recursive:true});
 const manifest={baseMain:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),decks:C.decks,config:C.config,planners:C.planners,seeds:C.seeds,stages:{screen:'12 fixed representative decks ×4 modes ×seed1, legacy',main:'same12 ×4 ×3 planners ×24 seeds',sensitivity:'two blade decks/settings; MP/ultimate unchanged'},notes:['All actual boss decisions use original legacy planner options {}','Seed controls existing tie selection only','No population win-rate inference','New halfTurns uses actual final actor; archived 565 rows untouched']};
 const rows=[];function trial(stage,deckId,mode,plannerId,seed,variant='main',extra={},opening=null){const options={config:{...C.config,poisonMode:mode,...extra},planner:C.planners[plannerId],seed,opening};const result=simulate(C.decks[deckId],options);const row={caseId:String(rows.length+1).padStart(6,'0'),stage,deckId,mode,plannerId,variant,options,...result};rows.push(row);return row;}
 for(const deckId of Object.keys(C.decks))for(const mode of ['A','B','C','D'])trial('screen',deckId,mode,'legacy',1);
 console.log('screen complete',rows.length);
 for(const plannerId of Object.keys(C.planners))for(const deckId of Object.keys(C.decks)){
  for(const mode of ['A','B','C','D'])for(const seed of C.seeds)trial('main',deckId,mode,plannerId,seed);
  console.log('main',plannerId,deckId,rows.length);
 }
 for(const [variant,extra]of [['cost2',{bladeCost:2}],['ceil',{bladeRounding:'ceil'}],['consume1',{bladeConsume:1}]])for(const mode of ['A','B','C','D'])for(const seed of C.seeds.slice(0,6))trial('sensitivity','blade_defense',mode,'matched',seed,variant,extra);
 const patterns={corrosion:['corrosion'],corrosion_replay:['corrosion','@ultimate'],corrosion_thrust:['corrosion','r_poison_thrust'],corrosion_blade:['corrosion','r_venom_blade'],corrosion_guard:['corrosion','barrier']};
 manifest.patterns=patterns;
 // Same legal opening resources; each pattern uses a declared five-skill deck then original opponent AI/continuation.
 manifest.patternDecks={corrosion:'previous_poison',corrosion_replay:'previous_poison',corrosion_thrust:'thrust_defense',corrosion_blade:'blade_defense',corrosion_guard:'previous_poison'};
 for(const [name,ids]of Object.entries(patterns))for(const mode of ['A','B','C','D']){
 const opening=[...ids.map(id=>id==='@ultimate'?{type:'ultimate',side:'player'}:{type:'card',side:'player',id}),{type:'endTurn',side:'player'}];
 trial('opening',manifest.patternDecks[name],mode,'matched',1,name,{},opening);
 }
 fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify({...manifest,cases:rows.length},null,2)+'\n');
 fs.writeFileSync(path.join(root,'battles.jsonl'),rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
 fs.writeFileSync(path.join(root,'summary.json'),JSON.stringify(summarize(rows),null,2)+'\n');
 // Every mode × each required actual behavior category, with traces selected from main only.
 const select=selectRepresentatives(rows);
 for(const r of select.values()){const trace=simulate(C.decks[r.deckId],{...r.options,trace:true});fs.writeFileSync(path.join(root,'logs',r.label+'-'+r.mode+'.json'),JSON.stringify({caseId:r.caseId,label:r.label,...trace})+'\n');}
 console.log('COMPLETE',rows.length,'rows',select.size,'logs');
}
if(require.main===module)main();module.exports={summarize,groupKey};
