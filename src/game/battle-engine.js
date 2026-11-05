/* First-era rules: explicit state, symmetric sides, no DOM/audio/timers. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./card-data.js'),require('./combat-math.js'),require('./card-effects.js'));
  else root.GameBattle=factory(root.GameData,root.GameMath,root.GameCardEffects);
})(typeof globalThis==='object'?globalThis:this,function(Data,MathRules,Effects){
  'use strict';
  const other=side=>side==='player'?'boss':'player',clone=value=>JSON.parse(JSON.stringify(value));
  const REASONS={ended:'戦闘終了',turn:'相手のターン',missing:'未所持のカード',used:'使用済み',cooldown:'CD中',poison:'対象が毒状態の時のみ',mana:'マナ不足',cap:'上限到達'};
  function validateDeck(deck){
    if(!Array.isArray(deck)||deck.length===0||deck.length>5||new Set(deck).size!==deck.length||deck.some(id=>!Object.prototype.hasOwnProperty.call(Data.CARDS,id)))throw new TypeError('Invalid deck');
    return [...deck];
  }
  function actor(deck){
    return {deck:validateDeck(deck),hp:20,maxHp:20,mana:3,manaCap:3,ownTurn:0,
      accelerationPending:false,accelerated:false,used:[],readyOn:{},attacks:[],
      barrier:0,poison:0,weak:0,manaPenalty:0,attackBonus:0,setupBonus:0};
  }
  function startTurn(state,side,events){
    const who=state.actors[side];who.ownTurn++;
    Object.assign(who,MathRules.refill(who.manaCap,who.accelerationPending,who.manaPenalty,side===state.firstSide&&who.ownTurn===1));
    who.accelerationPending=false;who.manaPenalty=0;who.accelerated=false;
    who.used=[];who.attacks=[];who.attackBonus=who.setupBonus;who.setupBonus=0;
    events.push({type:'turn',side,ownTurn:who.ownTurn,round:state.round});
  }
  function createState({playerDeck=Data.STARTERS[0].card_ids,bossPresetId,firstSide='player',random=Math.random}={}){
    if(!['player','boss'].includes(firstSide))throw new RangeError('Invalid first side');
    const preset=bossPresetId?Data.BOSSES.find(p=>p.id===bossPresetId):Data.BOSSES[Math.floor(random()*Data.BOSSES.length)];
    if(!preset)throw new RangeError('Unknown boss preset');
    const state={schemaVersion:2,ruleset:'first-era-trial',round:1,firstSide,active:firstSide,
      bossPresetId:preset.id,playerCharacterId:'01_black_swordsman',bossCharacterId:preset.character_id,
      actors:{player:actor(playerDeck),boss:actor(preset.card_ids)},end:null};
    startTurn(state,firstSide,[]);return state;
  }
  function status(reason,extra={}){return {allowed:!reason,code:reason||null,reason:REASONS[reason]||'',...extra};}
  function availability(state,side,id){
    if(state.end)return status('ended');if(state.active!==side)return status('turn');
    const who=state.actors[side],spec=Data.CARDS[id];
    if(!Object.prototype.hasOwnProperty.call(Data.CARDS,id)||!who.deck.includes(id))return status('missing');
    const readyOn=who.readyOn[id]||0,remaining=Math.max(0,readyOn-who.ownTurn);
    if(who.used.includes(id))return status('used',{remaining:Math.max(0,remaining-1),readyOn});
    if(remaining>0)return status('cooldown',{remaining,readyOn});
    if(spec.tags.includes('poison_reference')&&state.actors[other(side)].poison===0)return status('poison');
    if(who.mana<spec.cost)return status('mana');return status(null);
  }
  function accelerationStatus(state,side){
    if(state.end)return status('ended');if(state.active!==side)return status('turn');
    const who=state.actors[side];
    if(who.manaCap>=5)return status('cap');if(who.accelerated)return status('used');if(who.mana<2)return status('mana');
    return status(null);
  }
  function legalActions(state){
    if(state.end)return [];const side=state.active;
    return [...state.actors[side].deck.filter(id=>availability(state,side,id).allowed).map(id=>({type:'card',side,id})),
      ...(accelerationStatus(state,side).allowed?[{type:'accelerate',side}]:[]),{type:'endTurn',side}];
  }
  function finish(state,winner,events){state.end=winner;events.push({type:'finish',winner});}
  function execute(state,action){
    const events=[],side=action.side||state.active;
    if(state.end)return {ok:false,reason:REASONS.ended,events};
    if(state.active!==side)return {ok:false,reason:REASONS.turn,events};
    const who=state.actors[side],target=state.actors[other(side)];
    if(action.type==='card'){
      const available=availability(state,side,action.id);if(!available.allowed)return {ok:false,reason:available.reason,events};
      const spec=Data.CARDS[action.id],instructions=Effects.plan(action.id,who,target);
      who.mana-=spec.cost;who.used.push(action.id);who.readyOn[action.id]=who.ownTurn+spec.cd+1;
      events.push({type:'card',side,id:action.id});
      for(const effect of instructions){
        switch(effect.kind){
          case 'damage':{
            const result=MathRules.damage(effect.amount,who.attackBonus,who.weak,target.barrier);
            who.attackBonus=0;who.weak=0;who.attacks.push(action.id);
            target.barrier=result.barrier;target.hp=Math.max(0,target.hp-result.damage);
            events.push({type:'damage',source:side,target:other(side),amount:result.damage,blocked:result.blocked,kind:'attack'});
            if(target.hp===0){
              // Complete poison-consumption bookkeeping without subsequent effects/animations.
              if(spec.tags.includes('poison_reference'))target.poison=Math.max(0,target.poison-1);
              finish(state,side,events);return {ok:true,events};
            }break;
          }
          case 'barrier':who.barrier+=effect.amount;break;
          case 'heal':{
            const before=who.hp;who.hp=MathRules.heal(who.hp,who.maxHp,effect.amount);
            events.push({type:'heal',side,amount:who.hp-before});break;
          }
          case 'poison':target.poison=MathRules.poison(target.poison,effect.amount);break;
          case 'consumePoison':target.poison=Math.max(0,target.poison-effect.amount);break;
          case 'weak':target.weak+=effect.amount;break;
          case 'manaPenalty':target.manaPenalty+=effect.amount;break;
          case 'attackBonus':who.attackBonus+=effect.amount;break;
          case 'setupBonus':who.setupBonus+=effect.amount;break;
        }
      }
    }else if(action.type==='accelerate'){
      const available=accelerationStatus(state,side);if(!available.allowed)return {ok:false,reason:available.reason,events};
      who.mana-=2;who.accelerated=true;who.accelerationPending=true;events.push({type:'accelerate',side,nextCap:who.manaCap+1});
    }else if(action.type==='endTurn'){
      who.attackBonus=0;
      if(who.poison>0){
        const amount=who.poison;who.hp=Math.max(0,who.hp-amount);who.poison--;
        events.push({type:'damage',source:other(side),target:side,amount,blocked:0,kind:'poison'});
        if(who.hp===0){finish(state,other(side),events);return {ok:true,events};}
      }
      if(target.barrier>0){target.barrier=0;events.push({type:'barrierExpired',side:other(side)});}
      state.active=other(side);if(state.active===state.firstSide)state.round++;
      startTurn(state,state.active,events);
    }else return {ok:false,reason:'不明な操作',events};
    return {ok:true,events};
  }
  function transition(state,action){const next=clone(state);return {state:next,...execute(next,action)};}
  function snapshot(state){return clone(state);}
  function restore(value){
    if(!value||value.schemaVersion!==2||value.ruleset!=='first-era-trial')throw new TypeError('Unsupported battle snapshot');
    return clone(value);
  }
  return Object.freeze({createState,availability,accelerationStatus,legalActions,execute,transition,snapshot,restore,other});
});
