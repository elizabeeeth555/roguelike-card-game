/* First-era build flow. Upgrade/inheritance rules remain isolated in legacy/. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./card-data.js'));
  else root.GameProgression=factory(root.GameData);
})(typeof globalThis==='object'?globalThis:this,function(Data){
  'use strict';
  function starter(id){const option=Data.STARTERS.find(s=>s.id===id);if(!option)throw new RangeError('Unknown starter');return [...option.card_ids];}
  function options(deck,random=Math.random,inheritedId=null,previous=[]){
    const pool=Object.keys(Data.CARDS).filter(id=>!deck.includes(id)&&id!==inheritedId);
    const fresh=Data.sample(pool.filter(id=>!previous.includes(id)),3,random);
    return [...fresh,...Data.sample(pool.filter(id=>previous.includes(id)),3-fresh.length,random)];
  }
  function replace(deck,outId,inId){
    const index=deck.indexOf(outId);
    if(deck.length!==5||index<0||!Data.CARDS[inId]||deck.includes(inId))return false;
    deck[index]=inId;return true;
  }
  function acquire(deck,id,inheritedId=null){
    if(!Object.prototype.hasOwnProperty.call(Data.CARDS,id)||deck.includes(id)||id===inheritedId||deck.length>=5)return false;
    deck.push(id);return true;
  }
  return Object.freeze({starter,options,acquire,replace,DRAFT_EVENTS:5,REROLLS:2});
});
