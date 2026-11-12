'use strict';
const modes=Object.freeze({A:'固定2',B:'固定3',C:'蓄積上限4',D:'蓄積上限6'});
function poisonTick(n,mode='A'){
 if(!Number.isInteger(n)||n<0)throw Error('Invalid poison duration');
 if(!Object.hasOwn(modes,mode))throw Error('Unknown poison mode');
 if(n===0)return 0;
 return mode==='A'?2:mode==='B'?3:Math.min(mode==='C'?4:6,Math.max(2,n));
}
function poisonFuture(n,mode,horizon=6){let total=0;for(let i=0;i<Math.min(n,horizon);i++)total+=poisonTick(n-i,mode);return total;}
module.exports={modes,poisonTick,poisonFuture};
