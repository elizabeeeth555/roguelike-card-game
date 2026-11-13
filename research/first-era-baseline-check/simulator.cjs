'use strict';
const crypto=require('node:crypto'),B=require('./engine.cjs'),P=require('./planner.cjs');
function rng(seed){let value=seed>>>0;return()=>{value=(value+0x6d2b79f5)>>>0;let t=value;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function simulate(deck,{seed=1,config={},planner={},trace=false,opening=null}={}){
 const random=rng(seed),s=B.create(deck,config),initial=B.clone(s),log=[];
 const m={damage:0,taken:0,poisonDamage:0,releaseDamage:0,bladeDamage:0,ultimateDamage:0,ultimatePoison:0,poisonApplied:0,maxPoison:0,barrier:0,blocked:0,wastedBarrier:0,healed:0,breaks:0,breakAttempts:1,flashes:0,prevented:0,accelerations:0,spentMana:0,ultimateUsed:0,ultimateRound:null,ultimateTarget:null,attackActions:0,defenseActions:0,healActions:0,buffActions:0,cdWaitTurns:0,halfTurns:1,poisonTicks:[],poisonApplications:0,failedThrusts:0,unusedPoison:0,skillUses:{},aiNodes:0,aiLimited:0,aiCalls:0,aiMs:0};
 const actionSequence=[];let operations=0;
 while(!s.end&&s.round<=40&&operations<400){
  const side=s.active;
  if(side==='player'&&s.actors.player.deck.some(id=>(s.actors.player.readyOn[id]||0)>s.actors.player.ownTurn))m.cdWaitTurns++;
  const before=performance.now(),planned=(opening&&side==='player'&&s.round===1)?{actions:opening,nodes:0,limited:false}:P.plan(s,{...(side==='player'?planner:{}),random});m.aiMs+=performance.now()-before;m.aiNodes+=planned.nodes;m.aiLimited+=Number(planned.limited);m.aiCalls++;
  for(const action of planned.actions){
   if(s.end||s.active!==side)break;
   if(!B.allowed(s,action))throw Error('Planner emitted an illegal action '+JSON.stringify(action));
   const round=s.round,out=B.execute(s,action);operations++;actionSequence.push(action);
   for(const e of out.events){
    if(e.type==='card'&&e.side==='player'){
     m.skillUses[e.id]=(m.skillUses[e.id]||0)+1;m.spentMana+=e.cost;
     const tags=B.spec(e.id,s.c).tags;
     m.attackActions+=Number(tags.includes('attack'));m.defenseActions+=Number(tags.includes('defense'));m.healActions+=Number(tags.includes('heal'));m.buffActions+=Number(tags.includes('buff')||tags.includes('debuff'));
    }
    if(e.type==='ultimate'){m.ultimateUsed++;m.spentMana+=e.cost;m.ultimateRound=round;m.ultimateTarget=e.id;}
    if(e.type==='damage'&&e.kind==='poison'&&e.target==='boss')m.poisonTicks.push({round,amount:e.amount,remaining:e.remaining});
    if(e.type==='damage'){
     if(e.target==='boss'){m.damage+=e.amount;if(e.kind==='poison')m.poisonDamage+=e.amount;if(e.id==='r_poison_release')m.releaseDamage+=e.amount;if(e.id==='r_venom_blade')m.bladeDamage+=e.amount;if(e.replay)m.ultimateDamage+=e.amount;}
     else {m.taken+=e.amount;m.blocked+=e.blocked||0;}
    }
    if(e.type==='environmentDamage'&&e.target==='player')m.taken+=e.amount;
    if(e.type==='poisonApplied'&&e.side==='player'){m.poisonApplications++;m.poisonApplied+=e.amount;m.maxPoison=Math.max(m.maxPoison,e.remaining);if(e.replay)m.ultimatePoison+=e.amount;}
    if(e.type==='barrier'&&e.side==='player')m.barrier+=e.amount;
    if(e.type==='barrierExpired'&&e.side==='player')m.wastedBarrier+=e.amount;
    if(e.type==='heal'&&e.side==='player')m.healed+=e.amount;
    if(e.type==='stanceBreak')m.breaks++;
    if(e.type==='stanceReset')m.breakAttempts++;
    if(e.type==='flashTriggered')m.flashes++;
    if(e.type==='flashPrevented')m.prevented++;
    if(e.type==='accelerate'&&e.side==='player'){m.accelerations++;m.spentMana+=2;}
   }
   if(action.side==='player'&&action.id==='r_poison_thrust'&&!out.events.some(e=>e.type==='poisonApplied'))m.failedThrusts++;
   if(trace)log.push({round,action,events:out.events,player:B.clone(s.actors.player),boss:B.clone(s.actors.boss),old:B.clone(s.old),hero:B.clone(s.hero),active:s.active,end:s.end});
  }
 }
 // Count phases from the actual final actor, not an endTurn request that may kill by poison.
 m.unusedPoison=s.actors.boss.poison;
 m.halfTurns=2*s.round-(s.active==='player'?1:0);
 const actionHash=crypto.createHash('sha256').update(JSON.stringify(actionSequence)).digest('hex').slice(0,16);
 const result={seed,deck:[...deck],config:{...s.c},winner:s.end||'draw',cause:s.endCause||'cap',round:s.round,remainingHP:s.actors.player.hp,bossHP:s.actors.boss.hp,actionHash,...m};
 if(trace)return {result,initial,log};return result;
}
module.exports={simulate,rng};
if(require.main===module){const deck=['slash','heavy_slash','barrier','corrosion','r_venom_blade'];const before=performance.now();for(let i=1;i<=4;i++){const r=simulate(deck,{seed:i});console.log({seed:i,winner:r.winner,round:r.round,ms:r.aiMs,used:r.ultimateTarget,nodes:r.aiNodes});}console.log('wallMs',performance.now()-before);}
