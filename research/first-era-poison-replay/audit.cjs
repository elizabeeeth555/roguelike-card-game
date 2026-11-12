'use strict';
// R-001: read-only full-case verification. No conditions, results or logs are rewritten.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {replay}=require('./replay.cjs'),{simulate}=require('./simulator.cjs'),{aggregate}=require('./run.cjs'),B=require('./engine.cjs');
const reviewedHead='7bfe4e861d8db20ff0f820cd9ff55024b3f8cdea';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function parse(line){const values=[];let text='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){text+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){values.push(text);text='';}else text+=c;}assert.ok(!quoted,'Unclosed CSV quote');values.push(text);return values;}
const metadata=new Set(['stage','deckId','configId','plannerId','caseId']);
const strings=new Set(['winner','cause','actionHash']);
function decode(keys,line){const values=parse(line);assert.equal(values.length,keys.length);return Object.fromEntries(keys.map((key,i)=>[key,metadata.has(key)||strings.has(key)?values[i]:key==='skillUses'?JSON.parse(values[i]):key==='ultimateTarget'?(!values[i]||values[i]==='null'?null:values[i]):values[i]===''||values[i]==='null'?null:Number(values[i])]));}
function compareResult(actual,saved){
 for(const [key,value]of Object.entries(saved)){
  if(metadata.has(key)||key==='aiMs')continue;
  assert.deepEqual(actual[key],value,`${saved.caseId||'log'}: ${key}`);
 }
}
function compareWithDiagnostic(actual,saved){
 if(actual.halfTurns!==saved.halfTurns){
  assert.equal(saved.cause,'flash','Unclassified diagnostic discrepancy');
  assert.equal(saved.halfTurns,2*saved.round-1,'Unexpected saved flash phase count');
  assert.equal(actual.halfTurns,2*saved.round,'Unexpected current flash phase count');
  compareResult(actual,{...saved,halfTurns:actual.halfTurns});
  return {field:'halfTurns',saved:saved.halfTurns,recomputed:actual.halfTurns,cause:'flash',reason:'Archived correction inferred the damage victim instead of the active boss-start phase'};
 }
 compareResult(actual,saved);return null;
}
const canonical=value=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const caseKey=(deck,config,seed,planner)=>canonical({deck,config,seed,planner});
function sourceHashes(){
 const researchSourceSHA256={},productionCoreSHA256={};
 for(const [dir,map,pattern]of [['research/first-era-poison-replay',researchSourceSHA256,/\.(?:cjs|py|md)$/],['src/game',productionCoreSHA256,/\.js$/]])for(const name of fs.readdirSync(dir).sort())if(pattern.test(name)){const file=path.join(dir,name);map[file]=sha(fs.readFileSync(file));}
 return {researchSourceSHA256,productionCoreSHA256};
}
function verifySummaries(summary,groups){
 let checked=0;
 const key=s=>canonical([s.stage,s.deckId,s.configId,s.plannerId||null]);
 const expected=new Map([...groups].map(([k,rows])=>[k,aggregate(rows)]));
 for(const [section,records]of Object.entries(summary)){
  assert.ok(Array.isArray(records),`Unknown summary section ${section}`);
  for(const saved of records){const actual=expected.get(key(saved));assert.ok(actual,`Missing CSV group ${key(saved)}`);
   const fields=Object.fromEntries(Object.entries(saved).filter(([k])=>!['stage','deckId','configId','plannerId'].includes(k)));
   assert.deepEqual(actual,fields,`Aggregate drift ${section} ${saved.deckId}`);checked++;
  }
 }
 assert.equal(summary.groups.length,groups.size,'Summary group coverage');return checked;
}
function audit(root,{log=console.log}={}){
 root=path.resolve(root);const sourceBefore=sourceHashes(),inputs={},cache=new Map();
 const reviewProvenance=JSON.parse(cp.execFileSync('git',['show',`${reviewedHead}:reports/first-era-poison-replay/provenance.json`],{encoding:'utf8'}));
 for(const map of [reviewProvenance.researchSourceSHA256,reviewProvenance.productionCoreSHA256])for(const [file,h]of Object.entries(map))assert.equal(sha(cp.execFileSync('git',['show',`${reviewedHead}:${file}`])),h,'Review HEAD source/provenance mismatch');
 const runtimeFiles=['engine.cjs','planner.cjs','simulator.cjs','run.cjs','focus.cjs','confirm.cjs','validate.cjs','probes.cjs','counterfactual.cjs','replay.cjs'];
 for(const name of runtimeFiles){const file=path.join('research/first-era-poison-replay',name);assert.equal(sha(fs.readFileSync(file)),sha(cp.execFileSync('git',['show',`${reviewedHead}:${file}`])),`Runtime/conditions changed from reviewed HEAD: ${file}`);}
 const summary={schemaVersion:2,purpose:'R-001 final-source read-only verification',generatedAt:new Date().toISOString(),gitWorktreeBase:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),reviewedHead,
  reviewedHeadSourceSHA256:{researchSourceSHA256:reviewProvenance.researchSourceSHA256,productionCoreSHA256:reviewProvenance.productionCoreSHA256},sourceIdentity:'Hashes identify the exact current worktree source bytes; the containing commit is assigned after this record is generated.',statisticalTrials:0,controlledWitnesses:0,artificialProbes:0,stages:{},uniqueDecks:new Set(),uniqueSequences:new Set(),long:0,exhaustion:0,draws:0,maxRound:0,aiMs:0,aiCalls:0,aiLimited:0,logs:[],files:{},inputFilesSHA256:inputs,
  verification:{rowsCompared:0,uniqueSimulations:0,duplicateRowsReused:0,deterministicFieldMismatches:0,numericOutcomeMismatches:0,diagnosticDiscrepancies:[],logDiagnosticDiscrepancies:[],aggregateRecordsCompared:0,logsReplanned:0,controlledWitnessesReplanned:0,excludedNondeterministicFields:['aiMs'],runtimeAndConditionsUnchangedFromReviewedHead:true,savedResultsRewritten:false}};
 function read(file){inputs[path.relative(process.cwd(),file)]=sha(fs.readFileSync(file));return JSON.parse(fs.readFileSync(file,'utf8'));}
 function verifiedSimulation(deck,config,seed,planner){const key=caseKey(deck,config,seed,planner);if(!cache.has(key)){cache.set(key,simulate(deck,{config,seed,planner}));summary.verification.uniqueSimulations++;}else summary.verification.duplicateRowsReused++;return cache.get(key);}
 for(const part of ['data','focused','confirmation','validation']){
  const dir=path.join(root,part),manifest=read(path.join(dir,'manifest.json')),csv=path.join(dir,'battles.csv');inputs[path.relative(process.cwd(),csv)]=sha(fs.readFileSync(csv));
  const lines=fs.readFileSync(csv,'utf8').trimEnd().split('\n'),keys=parse(lines.shift());assert.equal(lines.length,manifest.cases);
  const records=new Map(),groups=new Map(),modes=manifest.plannerModes||manifest.planners||{};
  for(const line of lines){const r=decode(keys,line),d=manifest.decks[r.deckId],config=manifest.configs[r.configId];assert.ok(d&&config,'Missing manifest definition');assert.equal(d.deck.length,5);assert.equal(new Set(d.deck).size,5);assert.ok(d.deck.every(id=>B.pool.includes(id)));assert.ok(manifest.seeds.includes(r.seed));assert.ok(!records.has(r.caseId),'Duplicate case id');
   const planner=r.plannerId?modes[r.plannerId]:{};assert.ok(planner,'Missing planner definition');
   for(const k of ['round','remainingHP','bossHP','ultimateUsed','aiNodes','aiMs'])assert.ok(Number.isFinite(r[k]));assert.ok(r.remainingHP>=0&&r.bossHP>=0&&r.ultimateUsed<=1&&r.aiMs>=0);
   const diagnostic=compareWithDiagnostic(verifiedSimulation(d.deck,config,r.seed,planner),r);
   if(diagnostic){summary.verification.deterministicFieldMismatches++;summary.verification.diagnosticDiscrepancies.push({dataset:part,caseId:r.caseId,...diagnostic});}
   records.set(r.caseId,r);const key=canonical([r.stage,r.deckId,r.configId,r.plannerId||null]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);
   summary.statisticalTrials++;summary.verification.rowsCompared++;summary.stages[r.stage]=(summary.stages[r.stage]||0)+1;summary.uniqueDecks.add(r.deckId);summary.uniqueSequences.add(r.actionHash);summary.long+=Number(r.round>=10);summary.exhaustion+=Number(r.cause==='exhaustion');summary.draws+=Number(r.winner==='draw');summary.maxRound=Math.max(summary.maxRound,r.round);summary.aiMs+=r.aiMs;summary.aiCalls+=r.aiCalls;summary.aiLimited+=r.aiLimited;
   if(summary.statisticalTrials%1000===0)log(`Verified ${summary.statisticalTrials} rows (${summary.verification.uniqueSimulations} unique simulations)`);
  }
  summary.verification.aggregateRecordsCompared+=verifySummaries(read(path.join(dir,'summary.json')),groups);
  for(const name of fs.readdirSync(path.join(dir,'logs')).sort()){
   const file=path.join(dir,'logs',name),saved=read(file),row=records.get(saved.caseId);assert.ok(row,'Log not linked to CSV');const deck=manifest.decks[row.deckId].deck,config=manifest.configs[row.configId],planner=row.plannerId?modes[row.plannerId]:{};
   assert.deepEqual(saved.initial,B.create(deck,config),'Initial snapshot vs manifest');const linkedDiagnostic=compareWithDiagnostic(saved.result,row);if(linkedDiagnostic)summary.verification.logDiagnosticDiscrepancies.push({file:path.relative(root,file),...linkedDiagnostic});
   const fresh=simulate(deck,{config,seed:row.seed,planner,trace:true});compareWithDiagnostic(fresh.result,row);assert.deepEqual(fresh.initial,saved.initial);assert.deepEqual(fresh.log,saved.log,'Replanned trace drift');
   const end=replay(file,true);assert.equal(end.active,saved.log.at(-1).active);assert.equal(end.end,saved.log.at(-1).end);assert.equal(end.round,saved.result.round);assert.equal(end.endCause,saved.result.cause);
   summary.logs.push(path.relative(root,file));summary.verification.logsReplanned++;
  }
  log(`Verified ${part}: ${lines.length} rows and aggregates/logs`);
 }
 const witnessPath=path.join(root,'counterfactual-mp3-first-turn.json'),witness=read(witnessPath),freshWitness=require('./counterfactual.cjs').finding;
 const stripTimes=value=>{const copy=structuredClone(value);delete copy.baseline.aiMs;delete copy.standardMP3.aiMs;return copy;};assert.deepEqual(stripTimes(freshWitness),stripTimes(witness),'Counterfactual replay/replanning drift');replay(witnessPath,true);summary.controlledWitnesses=1;summary.verification.controlledWitnessesReplanned=1;
 const probes=read(path.join(root,'interaction-probes.json'));assert.deepEqual(require('./probes.cjs').findings,probes,'Artificial probes drift');summary.artificialProbes=probes.length;
 for(const file of ['audit.json','audit-final-pre-r001.json']){
  const full=path.join(root,file);if(fs.existsSync(full)){read(full);assert.equal(sha(fs.readFileSync(full)),sha(cp.execFileSync('git',['show',`${reviewedHead}:${path.relative(process.cwd(),path.join(root,file==='audit.json'?'audit.json':'audit-final.json'))}`])),'Historical audit byte preservation');}
 }
 // Require every statistical artifact to be the reviewed committed file, not regenerated data.
 for(const [file,h]of Object.entries(inputs)){
  if(file.endsWith('audit-final-pre-r001.json'))continue;
  assert.equal(sha(cp.execFileSync('git',['show',`${reviewedHead}:${file}`],{maxBuffer:16*1024*1024})),h,`Input differs from review HEAD: ${file}`);
 }
 for(const [file,h]of Object.entries(inputs))assert.equal(sha(fs.readFileSync(file)),h,'Input changed during verification');
 assert.deepEqual(sourceHashes(),sourceBefore,'Source changed during verification');
 summary.uniqueDecks=summary.uniqueDecks.size;summary.uniqueSequences=summary.uniqueSequences.size;summary.aiMeanMs=summary.aiMs/summary.aiCalls;summary.aiLimitedRate=summary.aiLimited/summary.aiCalls;
 Object.assign(summary,sourceBefore);summary.files={...sourceBefore.researchSourceSHA256,...sourceBefore.productionCoreSHA256};
 summary.status=summary.verification.deterministicFieldMismatches?'verified-with-reported-diagnostic-discrepancies':'verified';
 assert.equal(summary.statisticalTrials,17903);return summary;
}
if(require.main===module){
 const root=path.resolve(process.argv[2]||'reports/first-era-poison-replay'),check=process.argv[3]==='--check';
 if(check){
  const record=JSON.parse(fs.readFileSync(path.join(root,'audit-final.json'))),provenance=JSON.parse(fs.readFileSync(path.join(root,'provenance.json'))),current=sourceHashes();
  assert.deepEqual(record.researchSourceSHA256,current.researchSourceSHA256);assert.deepEqual(record.productionCoreSHA256,current.productionCoreSHA256);
  assert.deepEqual(provenance.researchSourceSHA256,current.researchSourceSHA256);assert.deepEqual(provenance.productionCoreSHA256,current.productionCoreSHA256);
  assert.equal(provenance.verifiedBy.sha256,sha(fs.readFileSync(path.join(root,'audit-final.json'))));
  const actual=audit(root);
  for(const key of ['statisticalTrials','controlledWitnesses','artificialProbes','stages','uniqueDecks','uniqueSequences','long','exhaustion','draws','maxRound','aiMs','aiCalls','aiLimited','logs','files','inputFilesSHA256','verification'])assert.deepEqual(actual[key],record[key],`Final audit differs: ${key}`);
  console.log(`PASS: hashes/results/aggregates/logs verified; reported diagnostic discrepancies: ${actual.verification.deterministicFieldMismatches}`);
 }else{
  const output=path.resolve(root,process.argv[3]||'audit-r001-new.json');if(fs.existsSync(output))throw Error('Refusing overwrite audit');
  const summary=audit(root);fs.writeFileSync(output,JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({statisticalTrials:summary.statisticalTrials,status:summary.status,verification:{...summary.verification,diagnosticDiscrepancies:summary.verification.diagnosticDiscrepancies.length}},null,2));
 }
}
module.exports={parse,decode,compareResult,compareWithDiagnostic,caseKey,verifySummaries,sourceHashes,audit};
