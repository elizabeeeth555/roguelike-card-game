'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{replay}=require('./replay.cjs');
const root=path.resolve(process.argv[2]||'reports/first-era-poison-replay');
function parse(line){const values=[];let text='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){text+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){values.push(text);text='';}else text+=c;}values.push(text);return values;}
const summary={statisticalTrials:0,controlledWitnesses:1,artificialProbes:7,stages:{},uniqueDecks:new Set(),uniqueSequences:new Set(),long:0,exhaustion:0,draws:0,maxRound:0,aiMs:0,aiCalls:0,aiLimited:0,logs:[],files:{}};
for(const part of ['data','focused','confirmation','validation']){
 const dir=path.join(root,part),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'))),lines=fs.readFileSync(path.join(dir,'battles.csv'),'utf8').trim().split('\n'),keys=parse(lines.shift());assert.equal(lines.length,manifest.cases);
 for(const line of lines){const values=parse(line);assert.equal(values.length,keys.length);const r=Object.fromEntries(keys.map((key,i)=>[key,values[i]]));assert.ok(manifest.decks[r.deckId]);assert.ok(manifest.configs[r.configId]);assert.equal(manifest.decks[r.deckId].deck.length,5);assert.equal(new Set(manifest.decks[r.deckId].deck).size,5);
  for(const key of ['round','remainingHP','bossHP','ultimateUsed','aiNodes','aiMs'])assert.ok(Number.isFinite(Number(r[key])),key);
  assert.ok(Number(r.remainingHP)>=0&&Number(r.bossHP)>=0);assert.ok(Number(r.ultimateUsed)<=1);assert.ok(['player','boss','draw'].includes(r.winner));
  summary.statisticalTrials++;summary.stages[r.stage]=(summary.stages[r.stage]||0)+1;summary.uniqueDecks.add(r.deckId);summary.uniqueSequences.add(r.actionHash);summary.long+=Number(r.round>=10);summary.exhaustion+=Number(r.cause==='exhaustion');summary.draws+=Number(r.winner==='draw');summary.maxRound=Math.max(summary.maxRound,Number(r.round));summary.aiMs+=Number(r.aiMs);summary.aiCalls+=Number(r.aiCalls);summary.aiLimited+=Number(r.aiLimited);
 }
 for(const name of fs.readdirSync(path.join(dir,'logs'))){const file=path.join(dir,'logs',name);replay(file,true);summary.logs.push(path.relative(root,file));}
}
replay(path.join(root,'counterfactual-mp3-first-turn.json'),true);summary.uniqueDecks=summary.uniqueDecks.size;summary.uniqueSequences=summary.uniqueSequences.size;summary.aiMeanMs=summary.aiMs/summary.aiCalls;summary.aiLimitedRate=summary.aiLimited/summary.aiCalls;
for(const dir of ['research/first-era-poison-replay','src/game'])for(const name of fs.readdirSync(dir))if(/\.(?:cjs|js)$/.test(name)){const file=path.join(dir,name);summary.files[file]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
const output=path.join(root,process.argv[3]||'audit.json');if(fs.existsSync(output))throw Error('Refusing overwrite audit');fs.writeFileSync(output,JSON.stringify(summary,null,2));console.log(JSON.stringify({...summary,files:undefined,logs:summary.logs.length},null,2));
