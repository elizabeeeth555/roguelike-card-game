'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const B=require('./engine.cjs'),{simulate,rng}=require('./simulator.cjs');
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,12);
const seeds=Array.from({length:24},(_,i)=>i+1),source=['corrosion','plague','r_poison_thrust'];
const family=deck=>deck.some(id=>source.includes(id))?(deck.includes('r_poison_release')?'release':'continuous'):'attack';
const valid=deck=>family(deck)==='attack'?(!deck.some(id=>id.startsWith('r_'))&&deck.filter(id=>B.spec(id).tags.includes('attack')).length>=2):true;
function combinations(array,k){const out=[];function visit(start,chosen){if(chosen.length===k){out.push(chosen);return;}for(let i=start;i<=array.length-(k-chosen.length);i++)visit(i+1,[...chosen,array[i]]);}visit(0,[]);return out;}
function shuffle(items,random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function aggregate(rows){
 const mean=key=>rows.reduce((n,r)=>n+(r[key]??0),0)/rows.length;
 const rounds=rows.map(r=>r.round).sort((a,b)=>a-b),wins=rows.filter(r=>r.winner==='player');
 const uses={};for(const r of rows)for(const [id,count]of Object.entries(r.skillUses))uses[id]=(uses[id]||0)+count;
 const sum=key=>rows.reduce((n,r)=>n+(r[key]??0),0),ultimateTargets={};for(const r of rows)if(r.ultimateTarget)ultimateTargets[r.ultimateTarget]=(ultimateTargets[r.ultimateTarget]||0)+1;
 return {n:rows.length,wins:wins.length,winRate:wins.length/rows.length,meanRound:mean('round'),medianRound:rounds[Math.floor(rounds.length/2)],maxRound:rounds.at(-1),winHP:wins.length?wins.reduce((n,r)=>n+r.remainingHP,0)/wins.length:null,meanHP:mean('remainingHP'),meanBossHP:mean('bossHP'),short:rows.filter(r=>r.round<=3).length,long:rows.filter(r=>r.round>=10).length,exhaustion:rows.filter(r=>r.cause==='exhaustion').length,draws:rows.filter(r=>r.winner==='draw').length,meanDamage:mean('damage'),meanTaken:mean('taken'),meanPoisonDamage:mean('poisonDamage'),meanReleaseDamage:mean('releaseDamage'),meanBladeDamage:mean('bladeDamage'),meanBlocked:mean('blocked'),meanBarrier:mean('barrier'),meanWastedBarrier:mean('wastedBarrier'),meanHeal:mean('healed'),meanMana:mean('spentMana'),meanAcceleration:mean('accelerations'),meanCDWait:mean('cdWaitTurns'),meanMaxPoison:mean('maxPoison'),breakRate:sum('breaks')/sum('breakAttempts'),flashPreventRate:sum('prevented')/(sum('prevented')+sum('flashes')||1),ultimateUseRate:mean('ultimateUsed'),ultimateRound:rows.filter(r=>r.ultimateUsed).length?sum('ultimateRound')/sum('ultimateUsed'):null,meanUltimateDamage:mean('ultimateDamage'),meanUltimatePoison:mean('ultimatePoison'),meanAttackActions:mean('attackActions'),meanDefenseActions:mean('defenseActions'),meanHealActions:mean('healActions'),meanBuffActions:mean('buffActions'),aiMsPerCall:sum('aiMs')/sum('aiCalls'),aiLimitedRate:sum('aiLimited')/sum('aiCalls'),distinctSequences:new Set(rows.map(r=>r.actionHash)).size,uses,ultimateTargets};
}
const rank=s=>s.winRate*10000-s.meanBossHP*30+s.meanHP*2-s.meanRound*.1;
const references=[
 ['slash','dash_slash','follow_up','heavy_slash','battle_spirit'],['slash','heavy_slash','great_swing','battle_spirit','setup'],['heavy_slash','great_swing','charge','barrier','battle_spirit'],
 ['corrosion','plague','r_venom_blade','barrier','first_aid'],['corrosion','r_poison_thrust','r_venom_blade','barrier','heavy_slash'],['corrosion','plague','r_poison_thrust','r_venom_blade','curse'],
 ['corrosion','plague','r_poison_release','barrier','heavy_slash'],['corrosion','r_poison_thrust','r_venom_blade','r_poison_release','barrier'],['corrosion','plague','r_poison_release','battle_spirit','r_venom_blade']
];
const pools={
 legacy:['slash','heavy_slash','great_swing','barrier','first_aid','battle_spirit','setup','corrosion','r_venom_blade','feint'],
 break:['slash','heavy_slash','great_swing','barrier','battle_spirit','setup','corrosion','r_poison_thrust','r_venom_blade','r_poison_release'],
 dot:['slash','heavy_slash','barrier','battle_spirit','corrosion','plague','r_poison_thrust','r_venom_blade','r_poison_release','feint'],
 sustain:['slash','heavy_slash','barrier','first_aid','battle_spirit','corrosion','plague','r_poison_thrust','r_venom_blade','r_poison_release']
};
function main(){
 const out=path.resolve(process.argv[2]||'reports/first-era-poison-replay/data');if(fs.existsSync(out))throw Error('Refusing to overwrite '+out);fs.mkdirSync(out,{recursive:true});
 const records=[],decks={},configs={},plannerModes={},groups=[];let count=0;
 function trial(stage,deck,config={},seed=1,planner={}){
  const sorted=[...deck].sort(),deckId=hash(sorted),configId=hash({...B.defaults,...config}),plannerId=hash(planner);
  decks[deckId]={deck:sorted,names:sorted.map(id=>B.spec(id).name),family:family(sorted)};configs[configId]={...B.defaults,...config};plannerModes[plannerId]=planner;
  const result=simulate(sorted,{seed,config,planner});const row={stage,deckId,configId,plannerId,...result};delete row.deck;delete row.config;row.caseId=String(++count).padStart(6,'0');records.push(row);return row;
 }
 const evaluate=(stage,deck,config,ss=seeds,planner={})=>{const rows=ss.map(seed=>trial(stage,deck,config,seed,planner)),s=aggregate(rows);const result={stage,deckId:rows[0].deckId,configId:rows[0].configId,plannerId:rows[0].plannerId,...s};groups.push(result);return result;};
 function stage(name){console.log(name+' cases='+count);fs.writeFileSync(path.join(out,'progress.txt'),name+' '+count+'\n');}
 const all=combinations(B.pool,5),classified=all.filter(valid),sample=[];
 for(const f of ['attack','continuous','release'])sample.push(...shuffle(classified.filter(d=>family(d)===f),rng(101+f.length)).slice(0,200));
 const unique=new Map([...sample,...references].map(d=>[[...d].sort().join(','),d]));
 const screen=[...unique.values()].map(d=>evaluate('broad-screen',d,{},[1]));stage('broad-screen');
 const preliminary=[];
 for(const f of ['attack','continuous','release']){
  const top=screen.filter(s=>decks[s.deckId].family===f).sort((a,b)=>rank(b)-rank(a)).slice(0,10);
  for(const s of top)preliminary.push(evaluate('broad-shortlist',decks[s.deckId].deck,{},seeds.slice(0,6)));
 }
 stage('broad-shortlist');
 const selected=[];for(const f of ['attack','continuous','release']){
  const top=preliminary.filter(s=>decks[s.deckId].family===f).sort((a,b)=>rank(b)-rank(a)).slice(0,5);selected.push(...top.map(s=>decks[s.deckId].deck));
 }
 // Fixed representatives prevent picking every blade setting on its own winning deck.
 const variantReps=[references[3],references[7]],variants=[];
 for(const [bladeCost,bladeCD] of [[1,1],[2,1],[2,0],[1,2]])for(const bladeRounding of ['floor','ceil'])for(const bladeConsume of [0,1])for(const bladeNeedsPoison of [true,false])for(const ultCost of [1,2]){
  const config={bladeCost,bladeCD,bladeRounding,bladeConsume,bladeNeedsPoison,ultCost};
  for(const d of variantReps)variants.push(evaluate('blade-matrix',d,config,seeds.slice(0,4)));
 }
 stage('blade-matrix');
 // Default remains primary. A high-ranking aggressive alternative is measured, not silently adopted.
 const matrixScores=new Map();for(const s of variants){const c=configs[s.configId],key=hash({...c,ultCost:1});if(!matrixScores.has(key))matrixScores.set(key,{config:{...c,ultCost:1},score:0,n:0});const g=matrixScores.get(key);g.score+=rank(s);g.n++;}
 const bestBlade=[...matrixScores.values()].sort((a,b)=>b.score/b.n-a.score/a.n)[0].config;
 const broadFinal=[];for(const d of selected)for(const openingMP of [2,3])for(const ultCost of [1,2])broadFinal.push(evaluate('broad-final',d,{openingMP,ultCost}));stage('broad-final');
 const poolScreen={};for(const [poolName,pool] of Object.entries(pools)){
  poolScreen[poolName]=combinations(pool,5).filter(valid).map(d=>evaluate('pool-'+poolName,d,{},[1]));stage('pool-'+poolName);
 }
 const poolFinal=[];for(const [name,rows] of Object.entries(poolScreen))for(const f of ['attack','continuous','release']){
  const candidates=rows.filter(s=>decks[s.deckId].family===f).sort((a,b)=>rank(b)-rank(a));if(!candidates.length)continue;
  for(const s of candidates.slice(0,2))for(const openingMP of [2,3])for(const ultCost of [1,2])poolFinal.push(evaluate('pool-final-'+name,decks[s.deckId].deck,{openingMP,ultCost}));
 }
 stage('pool-final');
 const sensitivityDecks=[...new Map([...selected.slice(0,2),...selected.slice(5,7),...selected.slice(10,12),...references.slice(4,8)].map(d=>[[...d].sort().join(','),d])).values()];
 const sensitivity=[];
 for(const d of sensitivityDecks){
  for(const config of [{ultimate:false},{endOrder:'barrier-first'},{replayHistory:false},{bladeConsume:1,bladeConsumeTiming:'before'},{...bestBlade},{releaseCost:2,releaseCD:2}])sensitivity.push(evaluate('sensitivity',d,config));
  sensitivity.push(evaluate('deeper-ai',d,{},seeds.slice(0,8),{width:18,budget:1800,replyBudget:600,candidates:8}));
 }
 stage('sensitivity');
 const columns=Object.keys(records[0]);const csv=value=>{const text=typeof value==='object'?JSON.stringify(value):String(value??'');return /[",\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;};
 fs.writeFileSync(path.join(out,'battles.csv'),columns.join(',')+'\n'+records.map(r=>columns.map(k=>csv(r[k])).join(',')).join('\n')+'\n');
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({groups,screen,preliminary,broadFinal,poolFinal,sensitivity,variants},null,2));
 const manifest={schemaVersion:1,baseMain:'b5ba25d6dfcd292bd08f5245b94b012c276c4074',seeds,defaults:B.defaults,enumerated:all.length,eligible:classified.length,sampled:unique.size,cases:count,decks,configs,plannerModes,pools,bestBlade,node:process.version,platform:process.platform,cpu:os.cpus()[0]?.model};
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
 // Save representative action-by-action traces for replay, including wins/losses and ultimate uses.
 const logDir=path.join(out,'logs');fs.mkdirSync(logDir);const choices=[];
 for(const f of ['attack','continuous','release'])for(const winner of ['player','boss']){
  const candidates=records.filter(r=>r.stage==='broad-final'&&decks[r.deckId].family===f&&r.winner===winner&&configs[r.configId].openingMP===2&&configs[r.configId].ultCost===1);
  const used=candidates.find(r=>r.ultimateUsed)||candidates[0];if(used)choices.push(used);
 }
 for(const target of ['r_venom_blade','r_poison_release','battle_spirit','corrosion']){const found=records.find(r=>r.stage==='broad-final'&&r.ultimateTarget===target);if(found)choices.push(found);}
 for(const r of [...new Map(choices.map(r=>[r.caseId,r])).values()]){
  const trace=simulate(decks[r.deckId].deck,{seed:r.seed,config:configs[r.configId],planner:plannerModes[r.plannerId],trace:true});
  if(trace.result.actionHash!==r.actionHash)throw Error('Trace not reproducible');fs.writeFileSync(path.join(logDir,'case-'+r.caseId+'.json'),JSON.stringify({caseId:r.caseId,...trace},null,2));
 }
 fs.unlinkSync(path.join(out,'progress.txt'));console.log('COMPLETE '+count+' trials');
}
if(require.main===module)main();module.exports={aggregate,combinations,family,pools};
