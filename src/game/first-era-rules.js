/* Opt-in first-era profile. Catalog/rule hooks only; shared Battle owns execution. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./card-data.js'),require('./card-effects.js'));
  else root.GameFirstEraRules=factory(root.GameData,root.GameCardEffects);
})(typeof globalThis==='object'?globalThis:this,function(Data,Effects){
  'use strict';
  const RULESET='first-era-v1';
  const extra={
    first_era_corrosion:{id:'first_era_corrosion',name:'腐蝕',cost:1,cd:1,group:'D',tags:['poison'],description:'毒スタックを2付与する'},
    first_era_poison_thrust:{id:'first_era_poison_thrust',name:'毒突き',cost:1,cd:1,group:'D',tags:['attack','poison'],description:'1ダメージ。HPダメージが通った場合のみ毒スタックを1付与する'},
    first_era_venom_blade:{id:'first_era_venom_blade',name:'毒刃',cost:2,cd:1,group:'D',tags:['attack','poison_reference'],description:'1ダメージに、対象の毒スタックの半分を追加する（小数点以下切捨て）。毒は消費しない。毒がなくても使用可能'}
  };
  const pool=['slash','heavy_slash','barrier','first_aid','battle_spirit','setup','first_era_corrosion','first_era_poison_thrust','first_era_venom_blade','feint'];
  const bossDeck=['slash','heavy_slash','great_swing','feint','battle_spirit'];
  const ultimate={id:'first_era_echo',name:'戦技の残響',cost:0,description:'この自ターンに最後に使用した通常スキルを再演する。戦闘中1回'};
  function validateDeck(deck){if(!Array.isArray(deck)||deck.length!==5||new Set(deck).size!==5||deck.some(id=>!pool.includes(id)))throw new TypeError('First era requires five distinct adopted skills');return [...deck];}
  function card(id){return Object.prototype.hasOwnProperty.call(extra,id)?extra[id]:Object.prototype.hasOwnProperty.call(Data.CARDS,id)?Data.CARDS[id]:null;}
  function plan(id,who,target){
    if(id==='first_era_corrosion')return [{kind:'poison',amount:2}];
    if(id==='first_era_poison_thrust')return [{kind:'damage',amount:1},{kind:'poisonOnHP',amount:1}];
    if(id==='first_era_venom_blade')return [{kind:'damage',amount:1+Math.floor(target.poison/2)}];
    return Effects.plan(id,who,target);
  }
  const bossAbility={id:'ashen_king_finisher',name:'断誓一閃',cost:0,damage:8,description:'老王の2ターン目から3ターンごとに通常行動の代わりに直接攻撃を1回行う。バリア・弱体が有効'};
  const finisherDue=turn=>turn>=2&&(turn-2)%3===0;
  function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
  return freeze({RULESET,SCHEMA_VERSION:4,pool,bossDeck,ultimate,card,validateDeck,plan,bossAbility,finisherDue,poisonDamage:n=>Math.min(n,6),addPoison:(n,amount)=>Math.min(8,n+amount)});
});
