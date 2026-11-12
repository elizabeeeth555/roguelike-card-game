'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {simulate}=require('./simulator.cjs'),{replay}=require('./replay.cjs'),{summarize}=require('./run.cjs'),{decode,parse,compareWithDiagnostic}=require('../first-era-poison-replay/audit.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function inventory(dirs){const out={};function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);if(entry.isDirectory())visit(f);else out[f]=sha(fs.readFileSync(f));}}for(const dir of dirs)visit(dir);return out;}
const baselineDirs=['research/first-era-poison-replay','reports/first-era-poison-replay','src/game'];
function main(){const root=process.argv[2]||'reports/first-era-poison-stacking',target=process.argv[3]||'/tmp/poison-stacking-audit.json';if(fs.existsSync(target))throw Error('Refusing overwrite audit');
 const sources=inventory(['research/first-era-poison-stacking']),protectedBefore=inventory(baselineDirs),inputs=inventory([root]);const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'))),rows=fs.readFileSync(path.join(root,'battles.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(rows.length,m.cases);assert.equal(rows.length,3596);
 const oldIndex=new Map();for(const part of ['data','focused','confirmation','validation']){
  const dir='reports/first-era-poison-replay/'+part,om=JSON.parse(fs.readFileSync(dir+'/manifest.json')),lines=fs.readFileSync(dir+'/battles.csv','utf8').trimEnd().split('\n'),keys=parse(lines.shift());
  for(const line of lines){const r=decode(keys,line);const deck=om.decks[r.deckId].deck;const cfg=om.configs[r.configId];if((om.plannerModes||om.planners||{})[r.plannerId]&&Object.keys((om.plannerModes||om.planners)[r.plannerId]).length)continue;
   oldIndex.set(JSON.stringify([deck,cfg.openingMP,cfg.ultCost,cfg.bladeCost,cfg.bladeCD,cfg.bladeRounding,cfg.bladeConsume,cfg.bladeNeedsPoison,cfg.bladeConsumeTiming,cfg.releaseCost,cfg.releaseCD,cfg.endOrder,cfg.replayHistory,cfg.ultimate,cfg.neutral,r.seed]),r);
  }
 }
 let previousRowsCompared=0,knownHistoricalPhaseDifferences=0;const cache=new Map(),caseIds=new Set();
 for(const [i,r]of rows.entries()){
  assert.ok(!caseIds.has(r.caseId));caseIds.add(r.caseId);assert.deepEqual(r.deck,m.decks[r.deckId]);assert.equal(r.options.config.poisonMode,r.mode);assert.deepEqual(r.options.planner,m.planners[r.plannerId]);
  const key=JSON.stringify([r.deck,r.options]);if(!cache.has(key))cache.set(key,simulate(r.deck,r.options));const actual=cache.get(key);
  for(const [k,v]of Object.entries(actual))if(k!=='aiMs')assert.deepEqual(v,r[k],`${r.caseId}:${k}`);
  assert.equal(r.damage+r.bossHP,20);assert.equal(20+r.healed-r.taken,r.remainingHP);assert.equal(r.poisonTicks.reduce((s,t)=>s+t.amount,0),r.poisonDamage);
  if(r.stage==='main'&&r.mode==='A'&&r.plannerId==='legacy'){
   const c=r.config,key=JSON.stringify([r.deck,c.openingMP,c.ultCost,c.bladeCost,c.bladeCD,c.bladeRounding,c.bladeConsume,c.bladeNeedsPoison,c.bladeConsumeTiming,c.releaseCost,c.releaseCD,c.endOrder,c.replayHistory,c.ultimate,c.neutral,r.seed]);const old=oldIndex.get(key);
   if(old){if(compareWithDiagnostic(r,old))knownHistoricalPhaseDifferences++;previousRowsCompared++;}
  }
  if(i%500===0)console.log('audited',i+1);
 }
 assert.ok(previousRowsCompared>=72,'Previous reference-deck coverage missing');assert.deepEqual(summarize(rows),JSON.parse(fs.readFileSync(path.join(root,'summary.json'))));
 const extraFile=path.join(root,'opening-search.jsonl'),extraRows=fs.readFileSync(extraFile,'utf8').trim().split('\n').map(JSON.parse);
 for(const r of extraRows){const actual=simulate(r.deck,r.options);for(const [k,v]of Object.entries(actual))if(k!=='aiMs')assert.deepEqual(v,r[k],r.caseId+':'+k);}
 const {enumerate}=require('./openings.cjs'),B=require('./engine.cjs');
 for(const deckId of ['previous_poison','blade_defense','poison_stack','corrosion_replay'])for(const mode of ['A','B','C','D'])for(const plannerId of ['matched','deep']){const rs=extraRows.filter(r=>r.deckId===deckId&&r.mode===mode&&r.plannerId===plannerId);assert.deepEqual(rs.map(r=>r.options.opening),enumerate(B.create(m.decks[deckId],{...m.config,poisonMode:mode})));}
 const byId=new Map(rows.map(r=>[r.caseId,r]));let logs=0;for(const name of fs.readdirSync(path.join(root,'logs'))){const file=path.join(root,'logs',name),saved=JSON.parse(fs.readFileSync(file)),row=byId.get(saved.caseId);assert.ok(row);const fresh=simulate(row.deck,{...row.options,trace:true});assert.deepEqual(fresh.log,saved.log);assert.deepEqual(fresh.initial,saved.initial);for(const [k,v]of Object.entries(saved.result))if(k!=='aiMs')assert.deepEqual(v,row[k]);replay(file,true);logs++;}
 for(const name of fs.readdirSync(path.join(root,'opening-logs'))){const file=path.join(root,'opening-logs',name),saved=JSON.parse(fs.readFileSync(file)),row=extraRows.find(r=>r.caseId===saved.caseId);assert.ok(row);const fresh=simulate(row.deck,{...row.options,trace:true});assert.deepEqual(fresh.log,saved.log);assert.deepEqual(fresh.initial,saved.initial);for(const [k,v]of Object.entries(saved.result))if(k!=='aiMs')assert.deepEqual(v,row[k]);replay(file,true);logs++;}
 for(const name of fs.readdirSync(path.join(root,'pattern-logs'))){const file=path.join(root,'pattern-logs',name),saved=JSON.parse(fs.readFileSync(file)),row=byId.get(saved.caseId);assert.ok(row);const fresh=simulate(row.deck,{...row.options,trace:true});assert.deepEqual(fresh.log,saved.log);assert.deepEqual(fresh.initial,saved.initial);for(const [k,v]of Object.entries(saved.result))if(k!=='aiMs')assert.deepEqual(v,row[k]);replay(file,true);logs++;}
 assert.deepEqual(require('./patterns.cjs').theoretical(),JSON.parse(fs.readFileSync(path.join(root,'theoretical.json'))));
 assert.deepEqual(inventory(baselineDirs),protectedBefore);assert.deepEqual(inventory(['research/first-era-poison-stacking']),sources);assert.deepEqual(inventory([root]),inputs);
 const base=m.baseMain;for(const [file,h]of Object.entries(protectedBefore))assert.equal(sha(cp.execFileSync('git',['show',`${base}:${file}`],{maxBuffer:32*1024*1024})),h,'Protected input changed');
 const result={schemaVersion:1,baseMain:base,generatedAt:new Date().toISOString(),status:'verified',rows:rows.length,supplementaryOpeningTrials:extraRows.length,totalStatisticalRows:rows.length+extraRows.length,uniqueSimulations:cache.size,previousRowsCompared,knownHistoricalPhaseDifferences,logs,summaryGroups:summarize(rows).length,excludedNondeterministic:['aiMs'],sourceSHA256:sources,protectedSHA256:protectedBefore,inputSHA256:inputs,notes:['Historical halfTurns discrepancies are recognized, never written back','No statistical independence assumption','Source hashes identify exact bytes; containing commit assigned afterwards']};fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');console.log({rows:result.rows,previousRowsCompared,logs});
}
if(require.main===module)main();module.exports={inventory,sha};
