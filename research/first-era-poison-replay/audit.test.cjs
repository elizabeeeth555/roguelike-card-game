'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {parse,decode,compareResult,compareWithDiagnostic,caseKey,verifySummaries,sourceHashes}=require('./audit.cjs'),{aggregate}=require('./run.cjs'),{simulate}=require('./simulator.cjs');
const sample=()=>simulate(['slash','heavy_slash','barrier','corrosion','r_venom_blade'],{seed:1});
test('audit CSV parser preserves quoted JSON and rejects an unclosed quote',()=>{
 assert.deepEqual(parse('a,"{""x"":1,""y"":2}",'),['a','{"x":1,"y":2}','']);assert.throws(()=>parse('"broken'));
 assert.deepEqual(decode(['ultimateTarget','ultimateRound'],'null,null'),{ultimateTarget:null,ultimateRound:null});
 assert.deepEqual(decode(['seed','ultimateTarget','ultimateRound','skillUses'],'1,,,"{""slash"":1}"'),{seed:1,ultimateTarget:null,ultimateRound:null,skillUses:{slash:1}});
});
test('audit compares deterministic fields and excludes only measured AI time',()=>{
 const result=sample(),saved={...result,aiMs:result.aiMs+100};delete saved.deck;delete saved.config;saved.caseId='test';
 assert.doesNotThrow(()=>compareResult(result,saved));
 for(const key of ['winner','round','halfTurns','actionHash','remainingHP','skillUses','aiNodes'])assert.throws(()=>compareResult(result,{...saved,[key]:key==='skillUses'?{fake:1}:key==='winner'?'tampered':key==='actionHash'?'tampered':saved[key]+1}));
});
test('cache identity includes deck order, full conditions, seed, and planner parameters',()=>{
 const deck=['slash','heavy_slash'],key=caseKey(deck,{ultCost:1,openingMP:2},1,{budget:450});
 assert.equal(key,caseKey(deck,{openingMP:2,ultCost:1},1,{budget:450}));
 for(const alternative of [caseKey([...deck].reverse(),{ultCost:1,openingMP:2},1,{budget:450}),caseKey(deck,{ultCost:2,openingMP:2},1,{budget:450}),caseKey(deck,{ultCost:1,openingMP:2},2,{budget:450}),caseKey(deck,{ultCost:1,openingMP:2},1,{budget:451})])assert.notEqual(key,alternative);
});
test('saved group summary must match its CSV rows and cover every group',()=>{
 const row={...sample(),stage:'test',deckId:'deck',configId:'config',plannerId:'planner'},key=JSON.stringify(['test','deck','config','planner']),groups=new Map([[key,[row]]]);
 const record={stage:'test',deckId:'deck',configId:'config',plannerId:'planner',...aggregate([row])};
 assert.equal(verifySummaries({groups:[record],secondary:[record]},groups),2);
 assert.throws(()=>verifySummaries({groups:[{...record,wins:100}]},groups));assert.throws(()=>verifySummaries({groups:[]},groups));
});
test('source inventory includes final audit, tests, Python, README and immutable game core',()=>{
 const hashes=sourceHashes();for(const file of ['audit.cjs','audit.test.cjs','simulator.cjs','report.cjs','pairs.py','README.md'])assert.match(hashes.researchSourceSHA256['research/first-era-poison-replay/'+file],/^[a-f0-9]{64}$/);
 assert.match(hashes.productionCoreSHA256['src/game/battle-engine.js'],/^[a-f0-9]{64}$/);
});

test('the flash phase discrepancy is reported explicitly; other diagnostic or outcome drift fails',()=>{
 const saved={caseId:'legacy',cause:'flash',winner:'boss',round:5,halfTurns:9},actual={...saved,halfTurns:10};
 assert.deepEqual(compareWithDiagnostic(actual,saved),{field:'halfTurns',saved:9,recomputed:10,cause:'flash',reason:'Archived correction inferred the damage victim instead of the active boss-start phase'});
 assert.throws(()=>compareWithDiagnostic({...actual,winner:'player'},saved));
 assert.throws(()=>compareWithDiagnostic({...actual,halfTurns:11},saved));
 assert.throws(()=>compareWithDiagnostic({...actual,cause:'attack'},{...saved,cause:'attack'}));
});
