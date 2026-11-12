'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),B=require('./engine.cjs'),{simulate}=require('./simulator.cjs'),{aggregate,combinations,family,pools}=require('./run.cjs');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,12);
const out=path.resolve(process.argv[2]||'reports/first-era-poison-replay/focused');if(fs.existsSync(out))throw Error('Refusing overwrite');fs.mkdirSync(out,{recursive:true});
const main=path.resolve(process.argv[3]||'reports/first-era-poison-replay/data'),M=JSON.parse(fs.readFileSync(path.join(main,'manifest.json'))),S=JSON.parse(fs.readFileSync(path.join(main,'summary.json')));
const rows=[],groups=[],decks={...M.decks},configs={},planners={};
function run(stage,deck,config={},seeds=[1],planner={}){
 const d=[...deck].sort(),deckId=hash(d),c={...B.defaults,...config},configId=hash(c),plannerId=hash(planner);
 decks[deckId]={deck:d,names:d.map(id=>B.spec(id).name),family:family(d)};configs[configId]=c;planners[plannerId]=planner;
 const results=seeds.map(seed=>{const r=simulate(d,{seed,config,planner}),row={stage,deckId,configId,plannerId,...r,caseId:'f'+String(rows.length+1).padStart(6,'0')};delete row.deck;delete row.config;rows.push(row);return row;});
 const summary={stage,deckId,configId,plannerId,...aggregate(results)};groups.push(summary);return summary;
}
const rank=s=>s.winRate*10000-s.meanBossHP*30+s.meanHP*2-s.meanRound*.1;
const sources=['corrosion','plague','r_poison_thrust'],defense=['barrier','fortress','first_aid'];
const focused=combinations(B.pool,5).filter(d=>d.filter(id=>defense.includes(id)).length>=2&&d.some(id=>sources.includes(id)));
for(const d of focused)for(const openingMP of [2,3])run('defensive-poison-screen',d,{openingMP});
console.log('focused candidates',focused.length,'battles',rows.length);
const chosen=new Map();
for(const openingMP of [2,3])for(const f of ['continuous','release']){
 const candidates=groups.filter(s=>configs[s.configId].openingMP===openingMP&&decks[s.deckId].family===f).sort((a,b)=>rank(b)-rank(a));
 for(const s of candidates.slice(0,3))chosen.set(s.deckId,decks[s.deckId].deck);
}
for(const f of ['continuous','release']){
 const candidates=S.groups.filter(s=>M.decks[s.deckId].family===f&&(f==='continuous'?s.meanPoisonDamage>=6:s.meanReleaseDamage>0)).sort((a,b)=>rank(b)-rank(a));
 for(const s of candidates.slice(0,3))chosen.set(s.deckId,M.decks[s.deckId].deck);
}
// Deliberate delayed-poison reference, independently of random screening.
for(const d of [['heavy_slash','corrosion','fortress','first_aid','barrier'],['heavy_slash','corrosion','fortress','first_aid','r_venom_blade'],['heavy_slash','corrosion','fortress','first_aid','r_poison_release']])chosen.set(hash([...d].sort()),d);
console.log('detailed chosen',chosen.size);
for(const deck of chosen.values())for(const openingMP of [2,3])for(const ultCost of [1,2])run('poison-focused-final',deck,{openingMP,ultCost},M.seeds);
console.log('detail cases',rows.length);
const aiDecks=[...chosen.values()].slice(0,8);
for(const deck of aiDecks)for(const openingMP of [2,3])for(const poisonWeight of [2.3,6,9.6])run('poison-aware-ai',deck,{openingMP},M.seeds.slice(0,8),{width:18,budget:1800,replyBudget:600,candidates:8,poisonWeight});
// Potential initial pools including fortress, suggested by the new focused screen.
const pool2={fortress:['slash','heavy_slash','fortress','first_aid','corrosion','plague','r_poison_thrust','r_venom_blade','r_poison_release','battle_spirit'],fortressBreak:['slash','heavy_slash','great_swing','fortress','first_aid','battle_spirit','corrosion','r_poison_thrust','r_venom_blade','r_poison_release']};
for(const [name,pool]of Object.entries(pool2))for(const deck of combinations(pool,5)){
 const f=family(deck);if(f==='attack'&&(deck.some(id=>id.startsWith('r_'))||deck.filter(id=>B.spec(id).tags.includes('attack')).length<2))continue;
 run('pool-'+name,deck,{openingMP:3});
}
for(const name of Object.keys(pool2))for(const f of ['attack','continuous','release']){
 const candidates=groups.filter(s=>s.stage==='pool-'+name&&decks[s.deckId].family===f).sort((a,b)=>rank(b)-rank(a));
 const qualified=candidates.filter(s=>f==='attack'||(f==='continuous'?s.meanPoisonDamage>=6:s.meanReleaseDamage>0));
 const choices=[...new Map([...candidates.slice(0,1),...qualified.slice(0,1)].map(s=>[s.deckId,s])).values()];
 for(const s of choices)for(const openingMP of [2,3])for(const ultCost of [1,2])run('pool-focused-final-'+name,decks[s.deckId].deck,{openingMP,ultCost},M.seeds);
}
console.log('pool focused cases',rows.length);
// Ult ablation and blade variants on poison decks selected by actual DoT/release contribution.
const genuine=groups.filter(s=>s.stage==='poison-focused-final'&&configs[s.configId].openingMP===3&&configs[s.configId].ultCost===1&&s.meanPoisonDamage>=6).sort((a,b)=>rank(b)-rank(a)).slice(0,3);
for(const g of genuine){const deck=decks[g.deckId].deck;run('focused-no-ultimate',deck,{openingMP:3,ultimate:false},M.seeds);
 if(deck.includes('r_venom_blade'))for(const [bladeCost,bladeCD]of [[1,1],[2,1],[2,0],[1,2]])for(const bladeRounding of ['floor','ceil'])for(const bladeConsume of [0,1])run('focused-blade-matrix',deck,{openingMP:3,bladeCost,bladeCD,bladeRounding,bladeConsume},M.seeds.slice(0,4));
}
const columns=Object.keys(rows[0]),csv=v=>{const s=typeof v==='object'?JSON.stringify(v):String(v??'');return /[",\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};
fs.writeFileSync(path.join(out,'battles.csv'),columns.join(',')+'\n'+rows.map(r=>columns.map(k=>csv(r[k])).join(',')).join('\n')+'\n');
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({groups},null,2));fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({seeds:M.seeds,configs,planners,decks,pools:pool2,focusedCandidates:focused.length,cases:rows.length},null,2));
const logDir=path.join(out,'logs');fs.mkdirSync(logDir);
for(const f of ['continuous','release'])for(const winner of ['player','boss']){
 const records=rows.filter(r=>r.stage==='poison-focused-final'&&decks[r.deckId].family===f&&r.winner===winner&&configs[r.configId].ultCost===1&&configs[r.configId].openingMP===3);
 const record=records.find(r=>(f==='continuous'?r.poisonDamage>=6:r.releaseDamage>0))||records[0];
 if(record){const trace=simulate(decks[record.deckId].deck,{seed:record.seed,config:configs[record.configId],planner:planners[record.plannerId],trace:true});fs.writeFileSync(path.join(logDir,'case-'+record.caseId+'.json'),JSON.stringify({caseId:record.caseId,...trace},null,2));}
}
console.log('COMPLETE focused trials',rows.length);
