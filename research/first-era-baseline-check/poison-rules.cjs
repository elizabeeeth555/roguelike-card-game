'use strict';
function poisonTick(n,mode='baseline'){
 if(mode!=='baseline'||!Number.isInteger(n)||n<0||n>8)throw Error('Invalid baseline poison state');
 return Math.min(n,6);
}
function poisonFuture(n,mode,horizon=6){let total=0;for(let i=0;i<Math.min(n,horizon);i++)total+=poisonTick(n-i,mode);return total;}
module.exports={poisonTick,poisonFuture};
