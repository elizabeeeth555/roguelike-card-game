/* Effects are instructions; the battle engine owns validation and mutation. */
(function(root,factory){
  'use strict';const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameCardEffects=api;
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const hit=amount=>({kind:'damage',amount}),effect=(kind,amount)=>({kind,amount});
  const handlers={
    slash:()=>[hit(2)],heavy_slash:()=>[hit(4)],great_swing:()=>[hit(6)],
    barrier:()=>[effect('barrier',3)],fortress:()=>[effect('barrier',5)],first_aid:()=>[effect('heal',2)],
    dash_slash:actor=>[hit(actor.attacks.length===0?3:1)],
    follow_up:actor=>[hit(actor.attacks.length>0?3:1)],
    finisher_slash:(actor,target)=>[hit(target.hp<=target.maxHp/2?4:2)],
    charge:()=>[hit(5)],battle_spirit:()=>[effect('attackBonus',3)],
    feint:()=>[hit(1),effect('weak',2)],mana_bind:()=>[hit(1),effect('manaPenalty',1)],
    setup:()=>[hit(3),effect('setupBonus',2)],corrosion:()=>[effect('poison',2)],plague:()=>[effect('poison',3)],
    venom_blade:(actor,target)=>[hit(2+Math.min(4,target.poison*2)),effect('consumePoison',1)],
    heart_corrosion:(actor,target)=>[hit(target.poison),effect('consumePoison',1)],
    curse:(actor,target)=>[hit(1),...(target.poison>0?[effect('weak',2)]:[])]
  };
  function plan(id,actor,target){
    if(!Object.prototype.hasOwnProperty.call(handlers,id))throw new RangeError('Unknown card effect: '+id);
    return handlers[id](actor,target);
  }
  return Object.freeze({plan});
});
