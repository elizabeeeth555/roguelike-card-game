/* Deterministic legal action-sequence search using the same reducer as the UI. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./battle-engine.js'));
  else root.GamePlanner=factory(root.GameBattle);
})(typeof globalThis==='object'?globalThis:this,function(Battle){
  'use strict';
  const poisonValue=(n,state)=>state.ruleset==='first-era-v1'?Array.from({length:n},(_,i)=>Battle.poisonTickDamage(state,n-i)).reduce((a,b)=>a+b,0):n*(n+1)/2;
  function evaluate(state,side){
    if(state.end)return state.end===side?100000:-100000;
    const a=state.actors[side],b=state.actors[Battle.other(side)];
    return (a.hp-b.hp)*5+(poisonValue(b.poison,state)-poisonValue(a.poison,state))*2+
      (a.manaCap-b.manaCap)*3+(a.barrier-b.barrier)*1.2+(b.weak-a.weak)*1.2+
      (b.manaPenalty-a.manaPenalty)+(a.setupBonus+a.attackBonus-b.setupBonus-b.attackBonus)*1.5;
  }
  const key=actions=>actions.map(a=>a.type==='card'?a.id:a.type==='accelerate'?'~accelerate':'~'+a.type).join('/');
  function enumerate(state,side){
    const results=[];let nodes=0;
    function walk(current,actions){
      nodes++;
      if(current.end){results.push({state:current,actions,score:evaluate(current,side)});return;}
      for(const action of Battle.legalActions(current)){
        const next=Battle.transition(current,action);if(!next.ok)continue;
        if(action.type==='endTurn')results.push({state:next.state,actions,score:evaluate(next.state,side)});
        else walk(next.state,[...actions,action]);
      }
    }
    walk(state,[]);
    results.sort((a,b)=>b.score-a.score||a.actions.length-b.actions.length||key(a.actions).localeCompare(key(b.actions),'en'));
    return {results,nodes};
  }
  function preparationStateKey(state){
    // Retain unknown fields and attack order. used is a membership set in this ruleset.
    function canonical(value){
      if(Array.isArray(value))return value.map(canonical);
      if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
      return value;
    }
    const actors=Object.fromEntries(Object.entries(state.actors).map(([side,a])=>[side,{...a,used:[...a.used].sort()}]));
    return JSON.stringify(canonical({...state,actors}));
  }
  function plan(state,{lookahead=true}={}){
    if(state.end)return {actions:[],score:0,nodes:0};
    const side=state.active,search=enumerate(state,side);
    const win=search.results.find(result=>result.state.end===side);
    if(win)return {actions:win.actions,score:win.score,nodes:search.nodes};
    if(!lookahead)return {actions:search.results[0].actions,score:search.results[0].score,nodes:search.nodes};
    // Preserve eight ordinary sequences; reserve up to two distinct outcomes
    // for each preparation type. This is AI-2, not global endpoint deduplication.
    const candidates=search.results.slice(0,8),selected=new Set(candidates.map(c=>key(c.actions)));
    for(const predicate of [c=>c.actions.some(a=>a.type==='accelerate'),c=>c.actions.some(a=>a.id==='setup')]){
      const seen=new Set();let count=0;
      for(const c of search.results){
        if(!predicate(c))continue;
        const endpoint=preparationStateKey(c.state);if(seen.has(endpoint))continue;
        seen.add(endpoint);if(!selected.has(key(c.actions))){candidates.push(c);selected.add(key(c.actions));}
        if(++count===2)break;
      }
    }
    let best=null,nodes=search.nodes;
    const evaluated=new Set();
    // If all selected lines lose, retain the existing safety search through the rest.
    for(const candidate of [...candidates,...search.results]){
      const actionKey=key(candidate.actions);if(evaluated.has(actionKey))continue;
      if(evaluated.size>=candidates.length&&best&&best.score>-50000)break;
      evaluated.add(actionKey);
      let replyScore=candidate.score,futureScore=candidate.score;
      if(!candidate.state.end){
        const replies=enumerate(candidate.state,Battle.other(side));nodes+=replies.nodes;
        replyScore=-replies.results[0].score;
        const response=replies.results[0].state;
        // A short third-ply view values delayed acceleration and setup against
        // actual next-turn card availability, rather than rewarding cap alone.
        if(!response.end){const future=enumerate(response,side);nodes+=future.nodes;futureScore=future.results[0].score;}
        else futureScore=replyScore;
      }
      const score=replyScore<=-100000?-100000:candidate.score*.15+replyScore*.5+futureScore*.35;
      if(!best||score>best.score)best={actions:candidate.actions,score};
    }
    return {...best,nodes};
  }
  return Object.freeze({plan,evaluate});
});
