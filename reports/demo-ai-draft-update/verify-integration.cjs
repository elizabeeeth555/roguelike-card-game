'use strict';
const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path'),assert=require('node:assert/strict');
const B=require('../../src/game/battle-engine.js'),P=require('../../src/game/boss-planner.js'),Data=require('../../src/game/card-data.js');
const oldModule={exports:{}};new Function('require','module','exports',fs.readFileSync(__dirname+'/baseline-planner.txt','utf8'))(()=>B,oldModule,oldModule.exports);const Old=oldModule.exports;
const batch={rows:JSON.parse(fs.readFileSync(path.join(__dirname,'reference-battles.json')))};
const cases=batch.rows.filter(x=>x.set==='primary'&&x.seed<5004||x.set==='curated'&&['new_heal','loop_fortress','regression_2020','regression_2055'].includes(x.name)&&x.boss==='boss_knight_defense');let parity=0;
for(const c of cases){const s=B.createState({playerDeck:c.deck,bossPresetId:c.boss});while(!s.end&&s.round<=40){const p=P.plan(s);for(const a of p.actions){if(s.end)break;assert(B.execute(s,a).ok);}if(!s.end)B.execute(s,{type:'endTurn'});}assert.equal(s.end,c.winner,c.id);assert.equal(s.round,c.round,c.id);parity++;}
const timings=[];for(const boss of Data.BOSSES)for(const mana of [3,5])for(let k=0;k<6;k++){
 const s=B.createState({playerDeck:['slash','barrier','first_aid','setup','corrosion'],bossPresetId:boss.id,firstSide:'boss'});s.round=[3,11,13][k%3];for(const a of Object.values(s.actors)){a.manaCap=mana;a.mana=mana;a.hp=20;a.poison=k%3;a.weak=k%2;}
 if(k===0){Old.plan(s);P.plan(s);}for(const [name,planner] of k%2?[['AI-2',P],['AI-0',Old]]:[['AI-0',Old],['AI-2',P]]){const t=performance.now(),p=planner.plan(s);timings.push({name,boss:boss.id,mana,round:s.round,nodes:p.nodes,ms:performance.now()-t});}}
const summary={};for(const name of ['AI-0','AI-2']){const rows=timings.filter(x=>x.name===name),a=rows.map(x=>x.ms).sort((a,b)=>a-b);summary[name]={n:a.length,mean:a.reduce((a,b)=>a+b)/a.length,median:(a[29]+a[30])/2,p95:a[Math.ceil(a.length*.95)-1],max:a.at(-1)};}
fs.writeFileSync(__dirname+'/integration.json',JSON.stringify({parityBattles:parity,scope:'Saved D+AI-2+exhaustion five-card study outcomes. Timing: same current engine for old/new planner, five real boss presets, MP3/5, cache disabled, Node only.',node:process.version,summary,timings},null,2));console.log(JSON.stringify({parity,summary}));
