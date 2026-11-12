'use strict';
// Independent research reducer derived from the published first-era engine contract.
// Production Data/Effects/Math are read-only dependencies; no untracked research imports.
const Data=require('../../src/game/card-data.js'),MathRules=require('../../src/game/combat-math.js'),Effects=require('../../src/game/card-effects.js'),Core=require('../../src/game/battle-engine.js');
const defaults=Object.freeze({openingMP:2,ultCost:1,ultimate:true,bladeCost:2,bladeCD:1,bladeRounding:'floor',bladeConsume:0,bladeNeedsPoison:true,bladeConsumeTiming:'after',releaseCost:3,releaseCD:2,endOrder:'poison-first',replayHistory:true,neutral:false});
const other=side=>side==='player'?'boss':'player',clone=s=>structuredClone(s);
const pool=[...Object.keys(Data.CARDS).filter(id=>!['venom_blade','heart_corrosion'].includes(id)),'r_poison_thrust','r_venom_blade','r_poison_release'];
function spec(id,c=defaults){
 if(id==='r_poison_thrust')return {id,name:'毒突き',cost:1,cd:1,tags:['attack','poison']};
 if(id==='r_venom_blade')return {id,name:'毒刃（新版候補）',cost:c.bladeCost,cd:c.bladeCD,tags:['attack','poison_reference']};
 if(id==='r_poison_release')return {id,name:'毒禍解放',cost:c.releaseCost,cd:c.releaseCD,tags:['attack','poison_reference']};
 return Data.CARDS[id];
}
function create(deck,config={}){
 if(deck.length!==5||new Set(deck).size!==5||deck.some(id=>!pool.includes(id)))throw Error('Research decks require five distinct pool skills');
 const c={...defaults,...config};
 const s=Core.createState({playerDeck:['slash'],bossPresetId:'boss_knight_defense'});
 s.ruleset='first-era-poison-replay-research-v1';s.actors.player.deck=[...deck];s.actors.player.mana=c.openingMP;
 s.actors.boss.deck=['slash','heavy_slash','great_swing','feint','battle_spirit'];
 s.c=c;s.old={stance:'steadfast',gauge:0,broken:false};s.hero={available:c.ultimate,last:null};return s;
}
function allowed(s,a){
 if(s.end||a.side!==s.active)return false;
 const who=s.actors[a.side],target=s.actors[other(a.side)];
 if(a.type==='endTurn')return true;
 if(a.type==='accelerate')return who.mana>=2&&who.manaCap<5&&!who.accelerated;
 if(a.type==='ultimate')return a.side==='player'&&s.hero.available&&s.hero.last!==null&&who.mana>=s.c.ultCost;
 if(a.type!=='card'||!who.deck.includes(a.id))return false;
 const card=spec(a.id,s.c);if(!card||who.mana<card.cost||who.used.includes(a.id)||(who.readyOn[a.id]||0)>who.ownTurn)return false;
 if(a.id==='r_poison_release'&&target.poison===0)return false;
 if(a.id==='r_venom_blade'&&s.c.bladeNeedsPoison&&target.poison===0)return false;
 return true;
}
function legal(s){if(s.end)return [];const side=s.active;return [...s.actors[side].deck.map(id=>({type:'card',side,id})),{type:'accelerate',side},{type:'ultimate',side},{type:'endTurn',side}].filter(a=>allowed(s,a));}
function finish(s,winner,cause,ev){s.end=winner;s.endCause=cause;ev.push({type:'finish',winner,cause});}
function hit(s,source,base,id,replay,ev,flash=false){
 const targetSide=other(source),who=s.actors[source],target=s.actors[targetSide];
 const raw=MathRules.damage(base,who.attackBonus,who.weak,0).damage;
 let amount=raw;
 if(targetSide==='boss'&&!s.c.neutral){
  const guard=s.old.stance==='steadfast'&&!s.old.broken;
  amount=Math.floor(raw*(guard?.25:s.old.stance==='rupture'?1.5:1));
  if(guard){const before=s.old.gauge;s.old.gauge=Math.min(4,before+raw);ev.push({type:'breakDamage',amount:s.old.gauge-before,raw});if(s.old.gauge===4){s.old.broken=true;ev.push({type:'stanceBreak'});}}
 }
 who.attackBonus=0;who.weak=0;
 if(!flash&&(!replay||s.c.replayHistory))who.attacks.push(id);
 const result=MathRules.damage(amount,0,0,target.barrier),actual=Math.min(target.hp,result.damage);
 target.barrier=result.barrier;target.hp-=actual;
 ev.push({type:'damage',source,target:targetSide,id,replay,raw,amount:actual,blocked:result.blocked,kind:flash?'flash':'attack'});
 return actual;
}
function applySkill(s,side,id,replay,ev){
 const who=s.actors[side],target=s.actors[other(side)];let instructions;
 if(id==='r_poison_thrust')instructions=[{kind:'damage',amount:1},{kind:'poisonOnHP',amount:1}];
 else if(id==='r_poison_release')instructions=[{kind:'damage',amount:target.poison},{kind:'purgePoison'}];
 else if(id==='r_venom_blade'){
  if(s.c.bladeConsumeTiming==='before')target.poison=Math.max(0,target.poison-s.c.bladeConsume);
  const extra=Math[s.c.bladeRounding](target.poison/2);
  instructions=[{kind:'damage',amount:1+extra},...(s.c.bladeConsumeTiming==='after'?[{kind:'consumePoison',amount:s.c.bladeConsume}]:[])];
 }else instructions=Effects.plan(id,who,target);
 let hpDamage=0;
 for(const effect of instructions){
  switch(effect.kind){
   case 'damage':hpDamage=hit(s,side,effect.amount,id,replay,ev);break;
   case 'barrier':who.barrier+=effect.amount;ev.push({type:'barrier',side,amount:effect.amount});break;
   case 'heal':{const before=who.hp;who.hp=MathRules.heal(who.hp,who.maxHp,effect.amount);ev.push({type:'heal',side,amount:who.hp-before});break;}
   case 'poison':target.poison+=effect.amount;ev.push({type:'poisonApplied',side,target:other(side),amount:effect.amount,remaining:target.poison,id,replay});break;
   case 'poisonOnHP':if(hpDamage>0){target.poison+=effect.amount;ev.push({type:'poisonApplied',side,target:other(side),amount:effect.amount,remaining:target.poison,id,replay});}break;
   case 'consumePoison':target.poison=Math.max(0,target.poison-effect.amount);break;
   case 'purgePoison':ev.push({type:'poisonPurged',remaining:target.poison});target.poison=0;break;
   case 'weak':target.weak+=effect.amount;break;
   case 'manaPenalty':target.manaPenalty+=effect.amount;break;
   case 'attackBonus':who.attackBonus+=effect.amount;break;
   case 'setupBonus':who.setupBonus+=effect.amount;break;
   default:throw Error('Unknown effect '+effect.kind);
  }
  // Complete resource consumption on a lethal poison-reference attack, but no new extra effects.
  if(target.hp<=0&&effect.kind==='damage'){
   if(id==='r_poison_release')target.poison=0;
   if(id==='r_venom_blade'&&s.c.bladeConsumeTiming==='after')target.poison=Math.max(0,target.poison-s.c.bladeConsume);
   finish(s,side,'attack',ev);break;
  }
 }
}
function start(s,side,ev){
 const who=s.actors[side],exhaustion=Core.exhaustionDamage(s.round);
 if(exhaustion){const actual=Math.min(who.hp,exhaustion);who.hp-=actual;ev.push({type:'environmentDamage',target:side,amount:actual});if(who.hp===0){finish(s,other(side),'exhaustion',ev);return;}}
 who.ownTurn++;Object.assign(who,MathRules.refill(who.manaCap,who.accelerationPending,who.manaPenalty,false));
 who.accelerationPending=false;who.manaPenalty=0;who.accelerated=false;who.used=[];who.attacks=[];who.attackBonus=who.setupBonus;who.setupBonus=0;
 if(side==='player')s.hero.last=null;
 else if(s.c.neutral)return;
 else if(s.old.stance==='steadfast'){
  s.old.stance='rupture';const blocked=s.old.broken;ev.push({type:blocked?'flashPrevented':'flashTriggered'});
  if(!blocked){hit(s,'boss',5,'@flash',false,ev,true);if(s.actors.player.hp===0)finish(s,'boss','flash',ev);}
 }else {s.old={stance:'steadfast',gauge:0,broken:false};ev.push({type:'stanceReset'});}
}
function execute(s,a,ev=[]){
 if(!allowed(s,a))return {ok:false,events:ev};const who=s.actors[a.side];
 if(a.type==='card'){
  const card=spec(a.id,s.c);who.mana-=card.cost;who.used.push(a.id);who.readyOn[a.id]=who.ownTurn+card.cd+1;
  if(a.side==='player')s.hero.last=a.id;
  ev.push({type:'card',side:a.side,id:a.id,cost:card.cost});applySkill(s,a.side,a.id,false,ev);
 }else if(a.type==='ultimate'){
  who.mana-=s.c.ultCost;s.hero.available=false;const id=s.hero.last;
  ev.push({type:'ultimate',side:a.side,id,cost:s.c.ultCost});applySkill(s,a.side,id,true,ev);
 }else if(a.type==='accelerate'){
  who.mana-=2;who.accelerated=true;who.accelerationPending=true;ev.push({type:'accelerate',side:a.side,cost:2});
 }else{
  who.attackBonus=0;if(a.side==='player')s.hero.last=null;
  const target=s.actors[other(a.side)];
  const expiry=()=>{if(target.barrier){ev.push({type:'barrierExpired',side:other(a.side),amount:target.barrier});target.barrier=0;}};
  if(s.c.endOrder==='barrier-first')expiry();
  if(who.poison>0){const amount=Math.min(2,who.hp);who.hp-=amount;who.poison--;ev.push({type:'damage',source:other(a.side),target:a.side,kind:'poison',amount,remaining:who.poison});if(who.hp===0){finish(s,other(a.side),'poison',ev);return {ok:true,events:ev};}}
  if(s.c.endOrder==='poison-first')expiry();
  s.active=other(a.side);if(s.active==='player')s.round++;start(s,s.active,ev);
 }
 return {ok:true,events:ev};
}
function transition(s,a){const state=clone(s),out=execute(state,a);return {...out,state};}
module.exports={defaults,pool,spec,create,allowed,legal,execute,transition,other,clone};
