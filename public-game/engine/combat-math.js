/* Side-effect-free first-era calculations. */
(function(root,factory){
  'use strict';const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameMath=api;
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  function damage(base,bonus=0,weak=0,barrier=0){
    const raw=Math.max(0,base+bonus-weak),blocked=Math.min(raw,barrier);
    return {damage:raw-blocked,blocked,barrier:barrier-blocked};
  }
  function heal(hp,maxHp,amount){return Math.min(maxHp,hp+amount);}
  function poison(current,added){return Math.min(4,current+added);}
  function refill(cap,pending,penalty,firstTurn){
    const nextCap=Math.min(5,cap+(pending?1:0));
    return {manaCap:nextCap,mana:Math.max(2,(firstTurn?2:nextCap)-penalty)};
  }
  return Object.freeze({damage,heal,poison,refill});
});
