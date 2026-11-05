/* Deterministic legal action-sequence search using the same reducer as the UI. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./battle-engine.js'));
  else root.GamePlanner=factory(root.GameBattle);
})(typeof globalThis==='object'?globalThis:this,function(Battle){
  'use strict';
  const poisonValue=n=>n*(n+1)/2;
  function evaluate(state,side){
    if(state.end)return state.end===side?100000:-100000;
    const a=state.actors[side],b=state.actors[Battle.other(side)];
    return (a.hp-b.hp)*5+(poisonValue(b.poison)-poisonValue(a.poison))*2+
      (a.manaCap-b.manaCap)*3+(a.barrier-b.barrier)*1.2+(b.weak-a.weak)*1.2+
      (b.manaPenalty-a.manaPenalty)+(a.setupBonus+a.attackBonus-b.setupBonus-b.attackBonus)*1.5;
  }
  const key=actions=>actions.map(a=>a.type==='card'?a.id:'~accelerate').join('/');
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
  function plan(state,{lookahead=true}={}){
    if(state.end)return {actions:[],score:0,nodes:0};
    const side=state.active,search=enumerate(state,side);
    const win=search.results.find(result=>result.state.end===side);
    if(win)return {actions:win.actions,score:win.score,nodes:search.nodes};
    if(!lookahead)return {actions:search.results[0].actions,score:search.results[0].score,nodes:search.nodes};
    // Evaluate best replies for top candidates. If all lose, search the remainder
    // until a safe line is found; a defense is never omitted solely by this cutoff.
    let best=null,nodes=search.nodes;
    for(let i=0;i<search.results.length;i++){
      if(i>=8&&best&&best.score>-50000)break;
      const candidate=search.results[i];let replyScore=candidate.score,futureScore=candidate.score;
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
