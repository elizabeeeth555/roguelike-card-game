'use strict';
// Reproducible observation harness, not a model of human play or a balance tuner.
const fs=require('node:fs'),path=require('node:path');
const Data=require('../src/game/card-data.js'),Progression=require('../src/game/progression.js');
const Battle=require('../src/game/battle-engine.js'),Planner=require('../src/game/boss-planner.js');
function randomFrom(seed){
  let value=seed>>>0;
  return ()=>{value+=0x6d2b79f5;let t=value;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
function simulate(seedCount=10){
  const games=[],usage={},selection={};
  for(const starter of Data.STARTERS)for(const boss of Data.BOSSES)for(let seed=1;seed<=seedCount;seed++){
    const random=randomFrom(seed),deck=Progression.starter(starter.id);
    for(let i=0;i<3;i++){const options=Progression.options(deck,random);Progression.acquire(deck,options[Math.floor(random()*3)]);}
    for(const id of deck)selection[id]=(selection[id]||0)+1;
    const state=Battle.createState({playerDeck:deck,bossPresetId:boss.id}),accelerations=[];
    // A harness bound only: there is no round cap in the game.
    while(!state.end&&state.round<=40){
      const side=state.active,plan=Planner.plan(state);
      for(const action of plan.actions){
        if(!Battle.execute(state,action).ok)throw new Error('Planner emitted an illegal action');
        if(action.type==='card')usage[action.id]=(usage[action.id]||0)+1;
        if(action.type==='accelerate')accelerations.push({side,ownTurn:state.actors[side].ownTurn});
      }
      if(!state.end)Battle.execute(state,{type:'endTurn',side});
    }
    games.push({starter:starter.id,boss:boss.id,seed,deck,winner:state.end,round:state.round,
      manaCaps:{player:state.actors.player.manaCap,boss:state.actors.boss.manaCap},accelerations});
  }
  const rounds=games.filter(g=>g.winner).map(g=>g.round).sort((a,b)=>a-b);
  const summarize=group=>{const resolved=group.filter(g=>g.winner);return {games:group.length,playerWins:group.filter(g=>g.winner==='player').length,meanRounds:resolved.length?Number((resolved.reduce((sum,g)=>sum+g.round,0)/resolved.length).toFixed(2)):null};};
  return {policy:'Both sides use deterministic planner; draft picks are seeded random, not human play.',
    ...summarize(games),totalGames:games.length,unresolved:games.filter(g=>!g.winner).length,medianRounds:rounds[Math.floor(rounds.length/2)],
    rounds1to2:games.filter(g=>g.round<=2).length,rounds3to5:games.filter(g=>g.round>=3&&g.round<=5).length,rounds6plus:games.filter(g=>g.round>=6).length,
    byMatchup:Data.STARTERS.flatMap(s=>Data.BOSSES.map(b=>({starter:s.id,boss:b.id,...summarize(games.filter(g=>g.starter===s.id&&g.boss===b.id))}))),selection,usage,games};
}
if(require.main===module){
  const count=Number(process.argv[2]||10);if(!Number.isInteger(count)||count<1||count>100)throw new RangeError('Seed count must be 1..100');
  const result=simulate(count),directory=path.join(__dirname,'../.test-artifacts');fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(path.join(directory,'balance-report.json'),JSON.stringify(result,null,2));
  const {games,...summary}=result;console.log(JSON.stringify(summary,null,2));
}
module.exports={simulate};
