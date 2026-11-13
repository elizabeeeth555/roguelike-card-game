'use strict';
const B=require('./engine.cjs'),{poisonFuture}=require('./poison-rules.cjs');
function evaluate(s,side,poisonWeight=2.3,poisonModel='legacy'){
 if(s.end)return s.end===side?10000:-10000;
 const a=s.actors[side],b=s.actors[B.other(side)];
 // Constant poison ticks: linear capped horizon, never the old triangular poison formula.
 const value=n=>poisonModel==='matched'?poisonFuture(n,s.c.poisonMode,6)/2:Math.min(6,n);
 let score=6*(a.hp-b.hp)+poisonWeight*(value(b.poison)-value(a.poison))+1.1*(a.barrier-b.barrier)+2.8*(a.manaCap-b.manaCap)+1.2*(b.weak-a.weak)+1.2*(a.attackBonus+a.setupBonus-b.attackBonus-b.setupBonus)+(b.manaPenalty-a.manaPenalty);
 const player=(s.old.stance==='steadfast'?(s.old.broken?5:s.old.gauge*.7):0)+(s.hero.available?2:0);
 return score+(side==='player'?player:-player);
}
const signature=actions=>actions.map(a=>a.id||a.type).join('/');
function beam(state,{width=10,budget=450,poisonWeight=2.3,poisonModel='legacy'}={}){
 const side=state.active;let frontier=[{state,actions:[]}],results=[],nodes=0;
 for(let depth=0;depth<8&&frontier.length;depth++){
  const next=[];
  for(const line of frontier){
   // Always allow ending a retained frontier before resource budget stops deeper expansion.
   const actions=B.legal(line.state).sort((a,b)=>(a.type==='endTurn'?-1:b.type==='endTurn'?1:0));
   for(const action of actions){if(nodes++>=budget)break;const out=B.transition(line.state,action);if(!out.ok)continue;
    const c={state:out.state,actions:[...line.actions,action],score:evaluate(out.state,side,poisonWeight,poisonModel)};
    if(out.state.end||out.state.active!==side)results.push(c);else next.push(c);
   }if(nodes>=budget)break;
  }
  next.sort((a,b)=>b.score-a.score||signature(a.actions).localeCompare(signature(b.actions)));
  const seen=new Set();frontier=next.filter(c=>{const key=JSON.stringify([c.state.actors,c.state.hero,c.state.old]);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,width);
  if(nodes>=budget)break;
 }
 results.sort((a,b)=>b.score-a.score||a.actions.length-b.actions.length||signature(a.actions).localeCompare(signature(b.actions)));
 return {results,nodes,limited:nodes>=budget};
}
function plan(s,{random=()=>0,width=10,budget=450,replyBudget=160,candidates=4,lookahead=true,poisonWeight=2.3,poisonModel='legacy'}={}){
 const own=beam(s,{width,budget,poisonWeight,poisonModel});let shortlist=own.results.slice(0,candidates),nodes=own.nodes,limited=own.limited;
 // Reserve genuinely different acceleration, preparation and unused-ultimate lines.
 for(const predicate of [c=>c.actions.some(a=>a.type==='accelerate'),c=>c.actions.some(a=>a.id==='setup'),c=>c.state.hero.available]){
  const c=own.results.find(predicate);if(c&&!shortlist.includes(c))shortlist.push(c);
 }
 const side=s.active;let scored=[];
 for(const c of shortlist){let score=c.score;
  if(lookahead&&!c.state.end){const response=beam(c.state,{width:6,budget:replyBudget,poisonWeight,poisonModel});nodes+=response.nodes;limited||=response.limited;
   if(response.results[0])score=.2*c.score+.8*evaluate(response.results[0].state,side,poisonWeight,poisonModel);
  }
  scored.push({...c,score});
 }
 scored.sort((a,b)=>b.score-a.score||signature(a.actions).localeCompare(signature(b.actions)));
 const ties=scored.filter(c=>Math.abs(c.score-(scored[0]?.score??0))<1e-9);
 const best=ties[Math.floor(random()*ties.length)]||scored[0];
 return {actions:best?.actions||[{type:'endTurn',side}],score:best?.score,nodes,limited};
}
module.exports={plan,beam,evaluate};
