'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),B=require('./engine.cjs'),{simulate}=require('./simulator.cjs'),{aggregate,combinations,family}=require('./run.cjs');
const out=path.resolve(process.argv[2]||'reports/first-era-poison-replay/confirmation');if(fs.existsSync(out))throw Error('Refusing overwrite');fs.mkdirSync(out,{recursive:true});
const source=path.resolve(process.argv[3]||'reports/first-era-poison-replay/focused'),M=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'))),S=JSON.parse(fs.readFileSync(path.join(source,'summary.json')));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,12),rows=[],groups=[],decks={...M.decks},configs={},planners={};
function run(stage,deck,config={},seeds=M.seeds,planner={}){
 const d=[...deck].sort(),deckId=hash(d),c={...B.defaults,...config},configId=hash(c),plannerId=hash(planner);
 decks[deckId]={deck:d,names:d.map(id=>B.spec(id).name),family:family(d)};configs[configId]=c;planners[plannerId]=planner;
 const batch=seeds.map(seed=>{const r=simulate(d,{seed,config,planner}),row={stage,deckId,configId,plannerId,...r,caseId:'c'+String(rows.length+1).padStart(6,'0')};delete row.deck;delete row.config;rows.push(row);return row;});const s={stage,deckId,configId,plannerId,...aggregate(batch)};groups.push(s);return s;
}
const rank=s=>s.winRate*10000-s.meanBossHP*30+s.meanHP*2-s.meanRound*.1;
// Do not let overall high-HP hybrids hide actual poison wins in the focused screen.
const qualified=[...new Map(S.groups.filter(s=>s.stage==='defensive-poison-screen'&&s.winRate>0&&s.meanPoisonDamage>=6).map(s=>[s.deckId,s])).values()];
const releases=S.groups.filter(s=>s.stage==='poison-focused-final'&&s.meanReleaseDamage>0&&M.configs[s.configId].openingMP===3&&M.configs[s.configId].ultCost===1).sort((a,b)=>rank(b)-rank(a)).slice(0,3);
console.log('genuine candidates',qualified.length,'release',releases.length);
for(const s of [...qualified,...releases])for(const openingMP of [2,3])for(const ultCost of [1,2])run('qualified-final',M.decks[s.deckId].deck,{openingMP,ultCost});
for(const s of qualified){run('qualified-no-ultimate',M.decks[s.deckId].deck,{openingMP:3,ultimate:false});}
const swaps=[['barrier','fortress','corrosion','slash','r_venom_blade'],['barrier','fortress','corrosion','finisher_slash','r_venom_blade']];
for(const d of swaps)for(const openingMP of [2,3])for(const [bladeCost,bladeCD]of [[1,1],[2,1],[2,0],[1,2]])for(const bladeRounding of ['floor','ceil'])for(const bladeConsume of [0,1])run('genuine-blade-swap',d,{openingMP,bladeCost,bladeCD,bladeRounding,bladeConsume},M.seeds.slice(0,4));
for(const s of qualified.slice(0,3))for(const openingMP of [2,3])for(const poisonWeight of [2.3,6,9.6])run('qualified-deeper-ai',M.decks[s.deckId].deck,{openingMP},M.seeds.slice(0,8),{width:18,budget:1800,replyBudget:600,candidates:8,poisonWeight});
console.log('confirmation cases',rows.length);
const pools={threePoison:['slash','heavy_slash','finisher_slash','barrier','fortress','battle_spirit','corrosion','r_poison_thrust','r_venom_blade','r_poison_release'],withoutRelease:['slash','heavy_slash','finisher_slash','barrier','fortress','battle_spirit','corrosion','r_poison_thrust','r_venom_blade','feint']};
for(const [name,pool]of Object.entries(pools)){
 const screen=[];for(const deck of combinations(pool,5)){if(family(deck)==='attack'&&(deck.some(id=>id.startsWith('r_'))||deck.filter(id=>B.spec(id).tags.includes('attack')).length<2))continue;screen.push(run('pool-'+name,deck,{openingMP:3},[1]));}
 const targets=[];for(const f of ['attack','continuous','release']){
  const candidates=screen.filter(s=>decks[s.deckId].family===f).sort((a,b)=>rank(b)-rank(a));targets.push(...candidates.slice(0,1));
  const actual=candidates.filter(s=>f==='continuous'?s.meanPoisonDamage>=6:f==='release'?s.meanReleaseDamage>0:false);targets.push(...actual.slice(0,1));
 }
 for(const s of [...new Map(targets.map(s=>[s.deckId,s])).values()])for(const openingMP of [2,3])for(const ultCost of [1,2])run('pool-confirmed-final-'+name,decks[s.deckId].deck,{openingMP,ultCost});
}
const columns=Object.keys(rows[0]),csv=v=>{const s=typeof v==='object'?JSON.stringify(v):String(v??'');return /[",\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};
fs.writeFileSync(path.join(out,'battles.csv'),columns.join(',')+'\n'+rows.map(r=>columns.map(k=>csv(r[k])).join(',')).join('\n')+'\n');
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({groups},null,2));fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({seeds:M.seeds,decks,configs,planners,pools,qualifiedCandidates:qualified.length,cases:rows.length},null,2));
const logs=path.join(out,'logs');fs.mkdirSync(logs);
for(const f of ['continuous','release']){
 const record=rows.filter(r=>r.stage==='qualified-final'&&decks[r.deckId].family===f&&configs[r.configId].openingMP===3&&configs[r.configId].ultCost===1).find(r=>f==='continuous'?r.winner==='player'&&r.poisonDamage>=6:r.releaseDamage>0);
 if(record){const trace=simulate(decks[record.deckId].deck,{seed:record.seed,config:configs[record.configId],planner:planners[record.plannerId],trace:true});fs.writeFileSync(path.join(logs,'case-'+record.caseId+'.json'),JSON.stringify({caseId:record.caseId,...trace},null,2));}
}
console.log('COMPLETE confirmation trials',rows.length);
