/* First-era build flow. Upgrade/inheritance rules remain isolated in legacy/. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./card-data.js'));
  else root.GameProgression=factory(root.GameData);
})(typeof globalThis==='object'?globalThis:this,function(Data){
  'use strict';
  function starter(id){const option=Data.STARTERS.find(s=>s.id===id);if(!option)throw new RangeError('Unknown starter');return [...option.card_ids];}
  function options(deck,random=Math.random,inheritedId=null){return Data.sample(Object.keys(Data.CARDS).filter(id=>!deck.includes(id)&&id!==inheritedId),3,random);}
  function acquire(deck,id,inheritedId=null){
    if(!Object.prototype.hasOwnProperty.call(Data.CARDS,id)||deck.includes(id)||id===inheritedId||deck.length>=5)return false;
    deck.push(id);return true;
  }
  return Object.freeze({starter,options,acquire});
});
