'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),B=require('./engine.cjs');
function replay(file,quiet=false){
 const saved=JSON.parse(fs.readFileSync(file,'utf8')),state=B.clone(saved.initial);
 for(const frame of saved.log){
  const out=B.execute(state,frame.action);assert.ok(out.ok,'Illegal recorded action');
  assert.deepEqual(out.events,frame.events);assert.deepEqual(state.actors.player,frame.player);assert.deepEqual(state.actors.boss,frame.boss);assert.deepEqual(state.old,frame.old);assert.deepEqual(state.hero,frame.hero);
  if(!quiet)console.log(`R${frame.round} ${frame.action.side} ${frame.action.id||frame.action.type} | HP ${state.actors.player.hp}:${state.actors.boss.hp} MP ${state.actors.player.mana} 毒${state.actors.boss.poison} 構え${state.old.stance} 崩し${state.old.gauge}`);
 }
 assert.equal(state.end||'draw',saved.result.winner);return state;
}
if(require.main===module)replay(process.argv[2]);module.exports={replay};
