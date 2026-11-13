'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict'),B=require('./engine.cjs'),{simulate}=require('./simulator.cjs');
const baseMain='4a1b96b7fea8fd9e51c43d7c49126fa1e81b327d';
const config={poisonMode:'baseline',openingMP:3,ultCost:1};
const attack=['slash','heavy_slash','great_swing','charge','follow_up'];
const cases=[
 {id:'attack-basic',family:'攻撃特化',deck:attack},
 {id:'attack-chain',family:'攻撃特化',deck:['slash','dash_slash','follow_up','finisher_slash','charge']},
 {id:'attack-buff',family:'攻撃特化',deck:['slash','heavy_slash','charge','battle_spirit','setup']},
 {id:'mixed-break',family:'攻守併用',deck:['barrier','battle_spirit','feint','finisher_slash','heavy_slash']},
 {id:'mixed-heal',family:'攻守併用',deck:['slash','heavy_slash','barrier','fortress','first_aid']},
 {id:'mixed-tempo',family:'攻守併用',deck:['slash','heavy_slash','barrier','feint','setup']},
 {id:'poison-attack',family:'毒＋攻撃',deck:['corrosion','r_poison_thrust','heavy_slash','feint','slash']},
 {id:'poison-guard',family:'毒＋攻撃',deck:['corrosion','barrier','fortress','finisher_slash','slash']},
 {id:'poison-buff',family:'毒＋攻撃',deck:['corrosion','r_poison_thrust','heavy_slash','barrier','battle_spirit']},
 {id:'opening-replay',family:'奥義速攻比較',deck:attack,opening:[{type:'card',side:'player',id:'heavy_slash'},{type:'ultimate',side:'player'},{type:'endTurn',side:'player'}]},
 {id:'opening-heavy',family:'奥義速攻比較',deck:attack,opening:[{type:'card',side:'player',id:'great_swing'},{type:'endTurn',side:'player'}]},
 {id:'opening-accelerate',family:'奥義速攻比較',deck:attack,opening:[{type:'accelerate',side:'player'},{type:'card',side:'player',id:'slash'},{type:'endTurn',side:'player'}]}
];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function protectedHashes(){const out={};for(const file of cp.execFileSync('git',['ls-tree','-r','--name-only',baseMain],{encoding:'utf8'}).trim().split('\n'))out[file]=sha(fs.readFileSync(file));return out;}
function main(){const out=path.resolve(process.argv[2]||'research/first-era-baseline-check/results');if(fs.existsSync(out))throw Error('Refusing overwrite');const before=protectedHashes();fs.mkdirSync(path.join(out,'logs'),{recursive:true});const results=[];
 for(const c of cases){const trace=simulate(c.deck,{config,seed:1,planner:{},opening:c.opening||null,trace:true});
 // Replay every saved action; all HP/MP/CD/status snapshots must agree.
 const state=B.clone(trace.initial);for(const f of trace.log){assert.equal(B.execute(state,f.action).ok,true);assert.deepEqual(state.actors.player,f.player);assert.deepEqual(state.actors.boss,f.boss);assert.deepEqual(state.old,f.old);assert.deepEqual(state.hero,f.hero);assert.ok(state.actors.boss.poison<=8);}
 const r=trace.result;assert.equal(r.damage+r.bossHP,40);assert.equal(34+r.healed-r.taken,r.remainingHP);
 fs.writeFileSync(path.join(out,'logs',c.id+'.json'),JSON.stringify({caseId:c.id,...trace})+'\n');results.push({caseId:c.id,family:c.family,...r});console.log(c.id,r.winner,r.round,r.remainingHP,r.bossHP,r.poisonDamage,r.maxPoison,r.ultimateTarget,r.accelerations);
 }
 fs.writeFileSync(path.join(out,'conditions.json'),JSON.stringify({baseMain,config,seed:1,planner:{},cases,heroHP:34,bossHP:40,initialMP:'both3/3',poison:{cap:8,tick:'min(N,6)',order:'target turn end: damage then N-1',barrierBypass:true},notes:['Prior legacy planner unchanged; no AI optimization','Forced openings are legal player choices, not rule changes','Exactly12 exploratory trials, no human-win-rate inference','Ultimate/acceleration causal optimality is not established']},null,2)+'\n');
 fs.writeFileSync(path.join(out,'battles.jsonl'),results.map(r=>JSON.stringify(r)).join('\n')+'\n');assert.deepEqual(protectedHashes(),before);
 const sourceSHA256={};for(const f of fs.readdirSync(__dirname).filter(f=>/\.(cjs|md)$/.test(f))){const file=path.relative(process.cwd(),path.join(__dirname,f));sourceSHA256[file]=sha(fs.readFileSync(file));}
 const resultSHA256={};for(const f of ['conditions.json','battles.jsonl',...cases.map(c=>'logs/'+c.id+'.json')])resultSHA256[f]=sha(fs.readFileSync(path.join(out,f)));
 fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify({baseMain,generatedAt:new Date().toISOString(),trials:12,replayedLogs:12,protectedFiles:Object.keys(before).length,protectedSHA256:before,sourceSHA256,resultSHA256,allExistingFilesUnchanged:true,notes:['Sources identify generation-time bytes; report and later verification are recorded separately','AI time is a local measurement, not a deterministic result']},null,2)+'\n');
}
if(require.main===module)main();module.exports={cases,config,baseMain,protectedHashes,sha};
