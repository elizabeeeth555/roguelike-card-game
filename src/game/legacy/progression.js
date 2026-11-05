/* Build and inheritance rules shared by browser and Node.js. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./card-data.js'));
  else root.GameProgression=factory(root.GameData);
})(typeof globalThis==='object'?globalThis:this,function(Data){
  'use strict';
  const {RULES,POOLS,clone,pickRandom,hasUpgraded,upgradeGrade}=Data;

  function acquire(deck,card){
    if(deck.length>=RULES.cap)return false;
    deck.push(clone(card));
    return true;
  }
  function replace(deck,key,card){
    const index=deck.findIndex(c=>c.key===key&&!c.inherited);
    if(index<0)return false;
    deck[index]=clone(card);
    return true;
  }

  function options(era,deck,inherited,random=Math.random){
    return pickRandom(POOLS[era].filter(id=>!deck.some(c=>c.id===id)&&id!==inherited?.id),3,random);
  }
  function upgrade(deck,key,era,special=false){
    const card=deck.find(c=>c.key===key);
    if(!card||card.inherited||!upgradeGrade(era)||hasUpgraded(card))return false;
    card.lv=upgradeGrade(era);
    card.trait=special;
    card.upgraded=true;
    return true;
  }
  function normalDeck(deck){return deck.filter(c=>!c.inherited).map(clone);}
  function inheritCard(deck,key){
    const card=deck.find(c=>c.key===key&&!c.inherited);
    if(!card)return null;
    return {...clone(card),inherited:true,key:'legacy'};
  }
  return Object.freeze({acquire,replace,options,upgrade,normalDeck,inheritCard});
});
