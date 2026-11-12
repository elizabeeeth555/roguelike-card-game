'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),B=require('./engine.cjs'),P=require('./planner.cjs'),{simulate,rng}=require('./simulator.cjs');
const deck=['battle_spirit','charge','dash_slash','feint','first_aid'];
const baseline=simulate(deck,{seed:1,config:{openingMP:2},trace:true});
assert.equal(baseline.result.winner,'player');
const first=baseline.log.filter(f=>f.round===1&&f.action.side==='player').map(f=>f.action);
const state=B.create(deck,{openingMP:3}),initial=B.clone(state),random=rng(1),log=[];let turns=0;
while(!state.end&&state.round<40){
 const side=state.active,normal=P.plan(state,{random});
 const actions=turns===0?first:normal.actions;
 for(const action of actions){if(state.end||state.active!==side)break;assert.ok(B.allowed(state,action));const round=state.round,out=B.execute(state,action);log.push({round,action,events:out.events,player:B.clone(state.actors.player),boss:B.clone(state.actors.boss),old:B.clone(state.old),hero:B.clone(state.hero),active:state.active,end:state.end});}
 turns++;
}
const standard=simulate(deck,{seed:1,config:{openingMP:3}});
const result={winner:state.end,round:state.round,remainingHP:state.actors.player.hp,actionHash:crypto.createHash('sha256').update(JSON.stringify(log.map(f=>f.action))).digest('hex').slice(0,16)};
const finding={caseId:'counterfactual-mp3-first-turn',description:'Only the first player turn uses the recorded MP2 line; later player and boss both replan with the same seeded model.',baseline:baseline.result,standardMP3:standard,result,initial,log};
if(require.main===module){const out=process.argv[2];if(out){if(fs.existsSync(out))throw Error('Refusing overwrite');fs.writeFileSync(out,JSON.stringify(finding,null,2));}console.log({baseline:baseline.result.winner,standardMP3:standard.winner,forcedFirstTurn:result});}
module.exports={finding};
