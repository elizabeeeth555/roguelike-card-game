'use strict';
const {poisonTick}=require('./poison-rules.cjs');
const definitions={corrosion:{duration:2,mana:1},corrosion_replay:{duration:4,mana:2,ultimate:true},corrosion_thrust:{duration:3,mana:2,requiresHP:true},corrosion_blade:{duration:2,mana:2,bladeCost:1},corrosion_guard:{duration:2,mana:2}};
function theoretical(){return Object.entries(definitions).flatMap(([pattern,p])=>['A','B','C','D'].map(mode=>{const ticks=Array.from({length:p.duration},(_,i)=>poisonTick(p.duration-i,mode));return {pattern,mode,...p,ticks,total: ticks.reduce((a,b)=>a+b,0),scope:'Hypothetical full duration with no further application/purge and no early battle end; thrust requires HP passage, which fails in initial steadfast stance'};}));}
if(require.main===module)console.log(JSON.stringify(theoretical(),null,2));module.exports={theoretical};
