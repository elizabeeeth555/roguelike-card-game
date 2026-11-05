/* Shared battle rules. No DOM, audio, timers, or application globals. */
(function(root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./card-data.js'), require('./combat-math.js'), require('./boss-planner.js'), require('./card-effects.js'));
  } else root.GameBattle = factory(root.GameData, root.GameMath, root.GamePlanner, root.GameCardEffects);
})(typeof globalThis === 'object' ? globalThis : this, function(Data, GameMath, GamePlanner, GameCardEffects) {
  'use strict';
  const { LIB, clone, nameOf, newCard, eraConfig } = Data;
  const SET_FIELDS = ['played', 'playerOneShots', 'bossOneShots'];

  function createState({era, draftCards=[], inherited=null, previousHeroDeck=null, random=Math.random}) {
    const config=eraConfig(era);
    const hp=config.playerHp,bossHp=config.bossHp;
    if (era > 1 && !Array.isArray(previousHeroDeck)) throw new TypeError('Previous hero deck is required');
    return {
      round:1,
      deck:[...draftCards.map(clone),...(era>=2&&inherited?[clone(inherited)]:[])],
      enemyDeck:config.enemyDeck
        ?config.enemyDeck.map(id=>newCard(id,false,random)):previousHeroDeck.map(clone),
      playerHp:hp,maxPlayerHp:hp,bossHp,maxBossHp:bossHp,
      playerAtk:5,bossAtk:5,mana:1,
      playerManaPenalty:0,bossManaPenalty:0,
      playerGuard:0,bossGuard:0,bossBarrier:0,
      playerThorns:0,bossThorns:0,
      playerPoison:{turns:0,dmg:0,stacks:0},bossPoison:{turns:0,dmg:0,stacks:0},
      playerWeak:0,bossWeak:0,
      playerBlockedNow:0,playerBlockedPrev:0,bossBlockedNow:0,bossBlockedPrev:0,
      played:new Set(),playerOneShots:new Set(),bossOneShots:new Set(),bossPlan:[],end:null
    };
  }

  // JSON boundary: snapshots have no references to live cards, statuses or Sets.
  function snapshot(state) {
    return JSON.parse(JSON.stringify(state, (key, value) => value instanceof Set ? [...value] : value));
  }
  function restore(value) {
    const state=JSON.parse(JSON.stringify(value));
    for (const key of SET_FIELDS) state[key]=new Set(state[key]);
    return state;
  }
  function canPlay(state, card, side) {
    return GameMath.canPlayCard(card,side,state,LIB);
  }

  // Mutates only the supplied battle. Presentation is returned as ordered events.
  function execute(state, era, command, ...args) {
    const config=eraConfig(era);
    const events=[];
    const addLog=(message,kind='info')=>events.push({type:'log',message,kind});
    const sound=key=>events.push({type:'sound',key});
    const effectVisual=(family,who)=>events.push({type:'cast',family,who});
    const animateHit=(damage,target)=>events.push({type:'hit',damage,target});
    function finish(won) {
      if(state.end)return;
      state.end=won?'win':'lose';
      events.push({type:'finish',won});
    }
    const bossStartMana=GameMath.bossTurnMana;
    const canPlay=(card,side)=>GameMath.canPlayCard(card,side,state,LIB);

    function other(who){return who==='player'?'boss':'player';}
    function hpGet(who){return who==='player'?'playerHp':'bossHp';}

    function heal(who,amount,label){
      const key=hpGet(who),maximum=state[who==='player'?'maxPlayerHp':'maxBossHp'];
      const result=GameMath.resolveHeal(state[key],maximum,amount);
      state[key]=result.nextHp;
      if(result.healed>0)sound('heal');
      addLog(`${who==='player'?'あなた':'敵'}：${label}でHP+${result.healed}`,who==='player'?'hero':'enemy');
    }
    function hit(who,base,label,ignoreGuard=false,reflect=false,ignoreWeak=false,chargeReturn=true,guardPierce=0){
      if(state.end)return 0;
      const target=other(who),key=`${target}Guard`;
      const barrier=target==='boss'?state.bossBarrier:0;
      const result=GameMath.resolveDamage({base,weak:state[`${who}Weak`],guard:state[key]+barrier,ignoreGuard,ignoreWeak,guardPierce});
      const block=result.blocked,damage=result.damage;
      if(target==='boss'){
        const usedBarrier=Math.min(barrier,block);
        state.bossBarrier-=usedBarrier;
        state.bossGuard=Math.max(0,state.bossGuard-(block-usedBarrier));
      }else state[key]=result.nextGuard;
      if(chargeReturn&&!reflect)state[`${target}BlockedNow`]+=block;
      state[hpGet(target)]=Math.max(0,state[hpGet(target)]-damage);
      addLog(`${who==='player'?'あなた':'敵'}の${label}：${damage}ダメージ${block?`（${block}軽減）`:''}`,who==='player'?'hero':'enemy');
      if(damage>0){animateHit(damage,target);sound(damage>=22?'heavy_hit':'hit');}
      else if(block)sound('block');
      if(state[hpGet(target)]===0){finish(who==='player');return damage;}
      if(block>0&&!reflect&&state[`${target}Thorns`]>0){
        hit(target,state[`${target}Thorns`],'反射',false,true,false,false);
      }
      return damage;
    }
    function playCard(who,card){
      if(state.end)return;
      const spec=LIB[card.id],prefix=who==='player'?'あなた':'敵';
      effectVisual(spec.family,who);
      const sounds={return:'counter',seal:'seal',pierce:'pierce',flurry:'flurry'};
      if(spec.oneShot)sound('one_shot');
      else if(sounds[card.id])sound(sounds[card.id]);
      addLog(`${prefix}：${nameOf(card)}を使用${card.inherited?'【継承】':''}`,who==='player'?'hero':'enemy');
      GameCardEffects.apply({state,who,c:card,hit,heal,addLog,sound});
    }
    function grantBossAbility(){
      if(config.barrier){
        state.bossBarrier=config.barrier;
        addLog(`敵固有能力「不屈の意志」：このターンのみバリア${config.barrier}`,'enemy');
        sound('block');
      }
    }
    function expireBossBarrier(){
      if(state.bossBarrier>0){addLog('敵の固有バリアが消滅','info');state.bossBarrier=0;}
    }
    function triggerThirdBossAbility(){
      if(config.rageFromRound&&state.round>=config.rageFromRound){
        state.bossAtk+=1;
        addLog(`敵固有能力「闘争本能」：敵攻撃力+1（現在${state.bossAtk}）`,'enemy');
        sound('boost');
      }
    }
    function aiScore(card){
      return GamePlanner.scoreCard(card,state);
    }
    function commitBossPlan(){
      state.bossPlan=GamePlanner.chooseCards(state.enemyDeck,bossStartMana(state.round),aiScore,
        card=>LIB[card.id].cost,card=>canPlay(card,'boss'),
        card=>card.id==='pulse'?2+(card.lv||0)+(card.trait?1:0):0);
    }
    function useCard(key) {
      if(state.end)return false;
      const card=state.deck.find(c=>c.key===key);
      if(!card||state.played.has(key)||LIB[card.id].cost>state.mana||!canPlay(card,'player'))return false;
      state.mana-=LIB[card.id].cost;
      state.played.add(key);
      if(LIB[card.id].oneShot)state.playerOneShots.add(key);
      playCard('player',card);
      return true;
    }
    function tickPoison(side) {
      const poison=state[`${side}Poison`];
      if(poison.turns<=0)return;
      poison.turns--;
      sound('poison_tick');
      hit(other(side),poison.dmg,'毒',false,false,true);
      if(poison.turns<=0)state[`${side}Poison`]={turns:0,dmg:0,stacks:0};
    }
    function prepareEnemy() {
      state.playerWeak=0;
      state.bossBlockedPrev=state.bossBlockedNow;
      state.bossBlockedNow=0;
      state.bossGuard=0;
      state.bossThorns=0;
      let mana=Math.max(0,bossStartMana(state.round)-state.bossManaPenalty);
      const actions=[];
      for(const key of state.bossPlan){
        const card=state.enemyDeck.find(c=>c.key===key);
        if(card&&LIB[card.id].cost<=mana&&canPlay(card,'boss')){
          actions.push(card);
          mana-=LIB[card.id].cost;
          if(card.id==='pulse')mana+=2+(card.lv||0)+(card.trait?1:0);
        }
      }
      addLog(`敵のターン：使用可能マナ${bossStartMana(state.round)}、${actions.length}枚使用${state.bossManaPenalty?`（封魔 −${state.bossManaPenalty}マナ）`:''}`,'turn');
      tickPoison('boss');
      return actions;
    }
    function beginPlayer() {
      state.bossWeak=0;
      state.playerBlockedPrev=state.playerBlockedNow;
      state.playerBlockedNow=0;
      state.playerGuard=0;
      state.playerThorns=0;
      state.round++;
      state.mana=Math.max(1,state.round-state.playerManaPenalty);
      state.playerManaPenalty=0;
      state.bossManaPenalty=0;
      state.played.clear();
      tickPoison('player');
      if(state.end)return;
      grantBossAbility();
      commitBossPlan();
    }
    function enemyCard(card) {
      if(state.end||!canPlay(card,'boss'))return false;
      if(LIB[card.id].oneShot)state.bossOneShots.add(card.key);
      playCard('boss',card);
      return true;
    }
    const commands={heal,hit,playCard,useCard,enemyCard,grantBossAbility,expireBossBarrier,
      triggerThirdBossAbility,commitBossPlan,prepareEnemy,beginPlayer,aiScore};
    if(!Object.prototype.hasOwnProperty.call(commands,command))throw new RangeError('Unknown battle command: '+command);
    const result=state.end?undefined:commands[command](...args);
    return {result,events};
  }

  // Immutable entry point for React stores, simulations and server-owned sessions.
  function transition(state,era,command,...args) {
    const next=restore(snapshot(state));
    return {state:next,...execute(next,era,command,...args)};
  }
  return Object.freeze({createState,canPlay,execute,transition,snapshot,restore});
});
