'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),B=require('./engine.cjs'),{simulate}=require('./simulator.cjs'),{aggregate,combinations,family}=require('./run.cjs');
const out=path.resolve(process.argv[2]||'reports/first-era-poison-replay/validation');if(fs.existsSync(out))throw Error('Refusing overwrite');fs.mkdirSync(out,{recursive:true});
const seeds=Array.from({length:24},(_,i)=>i+1),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,12),rows=[],groups=[],decks={},configs={};
function run(stage,deck,config={},ss=seeds){
 const d=[...deck].sort(),deckId=hash(d),c={...B.defaults,...config},configId=hash(c);decks[deckId]={deck:d,names:d.map(id=>B.spec(id).name),family:family(d)};configs[configId]=c;
 const rs=ss.map(seed=>{const result=simulate(d,{seed,config}),row={stage,deckId,configId,...result,caseId:'v'+String(rows.length+1).padStart(6,'0')};delete row.deck;delete row.config;rows.push(row);return row;});const s={stage,deckId,configId,...aggregate(rs)};groups.push(s);return s;
}
const blade=['barrier','corrosion','finisher_slash','fortress','r_venom_blade'];
for(const openingMP of [2,3])for(const ultCost of [1,2])for(const bladeCost of [1,2])for(const bladeRounding of ['floor','ceil'])for(const bladeConsume of [0,1])run('blade-validation',blade,{openingMP,ultCost,bladeCost,bladeRounding,bladeConsume});
const release=['barrier','corrosion','finisher_slash','fortress','r_poison_release'];
for(const openingMP of [2,3])for(const ultCost of [1,2])for(const releaseCost of [2,3])run('release-validation',release,{openingMP,ultCost,releaseCost});
const pools={threePoison:['slash','heavy_slash','finisher_slash','barrier','fortress','battle_spirit','corrosion','r_poison_thrust','r_venom_blade','r_poison_release'],withoutRelease:['slash','heavy_slash','finisher_slash','barrier','fortress','battle_spirit','corrosion','r_poison_thrust','r_venom_blade','feint']};
for(const [name,pool]of Object.entries(pools)){
 const screen=[];for(const d of combinations(pool,5)){if(family(d)==='attack'&&(d.some(id=>id.startsWith('r_'))||d.filter(id=>B.spec(id).tags.includes('attack')).length<2))continue;screen.push(run('tuned-pool-'+name,d,{openingMP:3,bladeCost:1},[1]));}
 for(const f of ['attack','continuous','release']){
  const candidates=screen.filter(s=>decks[s.deckId].family===f).sort((a,b)=>b.winRate-a.winRate||b.meanHP-a.meanHP||a.meanBossHP-b.meanBossHP);
  const actual=candidates.filter(s=>f==='continuous'?s.meanPoisonDamage>=6:f==='release'?s.meanReleaseDamage>0:false);
  const chosen=[...new Map([...candidates.slice(0,1),...actual.slice(0,1)].map(s=>[s.deckId,s])).values()];
  for(const s of chosen)for(const openingMP of [2,3])for(const ultCost of [1,2])run('tuned-pool-final-'+name,decks[s.deckId].deck,{openingMP,ultCost,bladeCost:1});
 }
}
const columns=Object.keys(rows[0]),csv=v=>{const s=typeof v==='object'?JSON.stringify(v):String(v??'');return /[",\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};fs.writeFileSync(path.join(out,'battles.csv'),columns.join(',')+'\n'+rows.map(r=>columns.map(k=>csv(r[k])).join(',')).join('\n')+'\n');
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({groups},null,2));fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({seeds,cases:rows.length,configs,decks,pools},null,2));
fs.mkdirSync(path.join(out,'logs'));const record=rows.find(r=>r.stage==='blade-validation'&&r.winner==='player'&&configs[r.configId].bladeRounding==='floor');
if(record){const trace=simulate(decks[record.deckId].deck,{seed:record.seed,config:configs[record.configId],trace:true});fs.writeFileSync(path.join(out,'logs','case-'+record.caseId+'.json'),JSON.stringify({caseId:record.caseId,...trace},null,2));}
console.log('COMPLETE validation trials',rows.length);
