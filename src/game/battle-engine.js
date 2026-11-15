/* Shared combat reducer: explicit rulesets/state, no DOM/audio/timers. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./card-data.js'),require('./combat-math.js'),require('./card-effects.js'),require('./first-era-rules.js'));
  else root.GameBattle=factory(root.GameData,root.GameMath,root.GameCardEffects,root.GameFirstEraRules);
})(typeof globalThis==='object'?globalThis:this,function(Data,MathRules,Effects,FirstEra){
  'use strict';
  const other=side=>side==='player'?'boss':'player',clone=value=>JSON.parse(JSON.stringify(value));
  const isFirstEra=state=>state.ruleset==='first-era-v1';
  const poisonTickDamage=(state,n)=>isFirstEra(state)?FirstEra.poisonDamage(n):n;
  const getCard=(state,id)=>isFirstEra(state)?FirstEra.card(id):Data.CARDS[id];
  const REASONS={ended:'戦闘終了',turn:'相手のターン',missing:'未所持のカード',used:'使用済み',cooldown:'CD中',poison:'対象が毒状態の時のみ',mana:'マナ不足',cap:'上限到達',reference:'再演対象なし',ability:'固有能力で通常行動を置換',abilityRequired:'断誓一閃を先に発動',notDue:'発動ターンではない'};
  function validateDeck(deck){
    if(!Array.isArray(deck)||deck.length===0||deck.length>5||new Set(deck).size!==deck.length||deck.some(id=>!Object.prototype.hasOwnProperty.call(Data.CARDS,id)))throw new TypeError('Invalid deck');
    return [...deck];
  }
  function actor(deck,newEra=false){
    return {deck:newEra?[...deck]:validateDeck(deck),hp:20,maxHp:20,mana:3,manaCap:3,ownTurn:0,
      accelerationPending:false,accelerated:false,used:[],readyOn:{},attacks:[],
      barrier:0,poison:0,weak:0,manaPenalty:0,attackBonus:0,setupBonus:0};
  }
  function exhaustionDamage(round){return round<12?0:1+Math.floor((round-12)/2);}
  // Start-phase ordering: environment (and lethal check), then refill/queued effects.
  function applyStartEnvironment(state,side,events){
    const who=state.actors[side],amount=exhaustionDamage(state.round);
    if(amount){
      const actual=Math.min(who.hp,amount);who.hp=Math.max(0,who.hp-amount);
      events.push({type:'environmentDamage',kind:'exhaustion',source:'environment',target:side,amount:actual,rawAmount:amount,round:state.round});
      if(who.hp===0){state.endCause='exhaustion';finish(state,other(side),events,'exhaustion');return false;}
    }
    return true;
  }
  function startTurn(state,side,events){
    if(!applyStartEnvironment(state,side,events))return;
    const who=state.actors[side];who.ownTurn++;
    Object.assign(who,MathRules.refill(who.manaCap,who.accelerationPending,who.manaPenalty,!isFirstEra(state)&&side===state.firstSide&&who.ownTurn===1));
    who.accelerationPending=false;who.manaPenalty=0;who.accelerated=false;
    who.used=[];who.attacks=[];who.attackBonus=who.setupBonus;who.setupBonus=0;
    events.push({type:'turn',side,ownTurn:who.ownTurn,round:state.round});
    if(isFirstEra(state)){
      if(side==='player'){
        state.ultimate.lastSkillId=null;state.bossState.charging=FirstEra.finisherDue(state.actors.boss.ownTurn+1);
        if(state.bossState.charging)events.push({type:'bossWarning',side:'boss',id:FirstEra.bossAbility.id,bossTurn:state.actors.boss.ownTurn+1});
      }
    }
  }
  function createState({playerDeck=Data.STARTERS[0].card_ids,bossPresetId,firstSide='player',random=Math.random,ruleset='first-era-trial'}={}){
    if(ruleset!=='first-era-trial'&&ruleset!=='first-era-v1')throw new RangeError('Unknown ruleset');
    if(ruleset==='first-era-v1'){
      if(!FirstEra)throw new Error('Load first-era-rules.js before battle-engine.js for the new ruleset');
      if(firstSide!=='player'||(bossPresetId&&bossPresetId!=='ashen_king'))throw new RangeError('First era uses player first and the ashen king');
      const deck=FirstEra.validateDeck(playerDeck);
      const state={schemaVersion:4,ruleset,round:1,firstSide,active:firstSide,bossPresetId:'ashen_king',playerCharacterId:null,bossCharacterId:null,actors:{player:actor(deck,true),boss:actor(FirstEra.bossDeck,true)},end:null,bossState:{charging:false,flashUsedTurn:0},ultimate:{id:FirstEra.ultimate.id,available:true,lastSkillId:null}};
      Object.assign(state.actors.player,{hp:34,maxHp:34});Object.assign(state.actors.boss,{hp:40,maxHp:40});startTurn(state,'player',[]);return state;
    }
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
    const who=state.actors[side],spec=getCard(state,id);
    if(!spec||!who.deck.includes(id))return status('missing');
    if(forcedAbilityTurn(state,side))return status('ability');
    const readyOn=who.readyOn[id]||0,remaining=Math.max(0,readyOn-who.ownTurn);
    if(who.used.includes(id))return status('used',{remaining:Math.max(0,remaining-1),readyOn});
    if(remaining>0)return status('cooldown',{remaining,readyOn});
    if(!isFirstEra(state)&&spec.tags.includes('poison_reference')&&state.actors[other(side)].poison===0)return status('poison');
    if(who.mana<spec.cost)return status('mana');return status(null);
  }
  function accelerationStatus(state,side){
    if(state.end)return status('ended');if(state.active!==side)return status('turn');
    if(forcedAbilityTurn(state,side))return status('ability');
    const who=state.actors[side];
    if(who.manaCap>=5)return status('cap');if(who.accelerated)return status('used');if(who.mana<2)return status('mana');
    return status(null);
  }
  function ultimateStatus(state,side='player'){
    if(state.end)return status('ended');if(!isFirstEra(state)||side!=='player')return status('missing');if(state.active!==side)return status('turn');
    if(!state.ultimate.available)return status('used');if(!state.ultimate.lastSkillId)return status('reference');if(state.actors.player.mana<FirstEra.ultimate.cost)return status('mana');return status(null);
  }
  function forcedAbilityTurn(state,side){return isFirstEra(state)&&side==='boss'&&FirstEra.finisherDue(state.actors.boss.ownTurn);}
  function bossAbilityStatus(state,side='boss'){
    if(state.end)return status('ended');if(!isFirstEra(state)||side!=='boss')return status('missing');if(state.active!==side)return status('turn');
    if(!forcedAbilityTurn(state,side))return status('notDue');if(state.bossState.flashUsedTurn===state.actors.boss.ownTurn)return status('used');return status(null);
  }
  function legalActions(state){
    if(state.end)return [];const side=state.active;
    if(forcedAbilityTurn(state,side))return bossAbilityStatus(state,side).allowed?[{type:'ability',side,id:FirstEra.bossAbility.id}]:[{type:'endTurn',side}];
    return [...state.actors[side].deck.filter(id=>availability(state,side,id).allowed).map(id=>({type:'card',side,id})),
      ...(ultimateStatus(state,side).allowed?[{type:'ultimate',side}]:[]),
      ...(accelerationStatus(state,side).allowed?[{type:'accelerate',side}]:[]),{type:'endTurn',side}];
  }
  function finish(state,winner,events,cause='attack'){
    state.end=winner;if(isFirstEra(state)){state.bossState.charging=false;state.endCause=cause;events.push({type:'finish',winner,cause});}else events.push({type:'finish',winner});
  }
  function hit(state,side,base,id,replay,events,flash=false){
    const who=state.actors[side],targetSide=other(side),target=state.actors[targetSide];
    const raw=MathRules.damage(base,who.attackBonus,who.weak,0).damage;
    const adjusted=raw,result=MathRules.damage(adjusted,0,0,target.barrier),amount=Math.min(target.hp,result.damage);
    who.attackBonus=0;who.weak=0;if(!flash)who.attacks.push(id);
    target.barrier=result.barrier;target.hp-=amount;
    events.push({type:'damage',source:side,target:targetSide,id,replay,baseDamage:base,rawAmount:raw,adjustedAmount:adjusted,amount,blocked:result.blocked,kind:flash?'ability':'attack'});return amount;
  }
  function applySkill(state,side,id,replay,events){
    const who=state.actors[side],target=state.actors[other(side)],spec=getCard(state,id),modern=isFirstEra(state);
    const instructions=modern?FirstEra.plan(id,who,target):Effects.plan(id,who,target);let hpDamage=0;
    for(const effect of instructions){
      switch(effect.kind){
        case 'damage':{
          if(modern)hpDamage=hit(state,side,effect.amount,id,replay,events);
          else{
            const result=MathRules.damage(effect.amount,who.attackBonus,who.weak,target.barrier);
            who.attackBonus=0;who.weak=0;who.attacks.push(id);target.barrier=result.barrier;target.hp=Math.max(0,target.hp-result.damage);
            events.push({type:'damage',source:side,target:other(side),amount:result.damage,blocked:result.blocked,kind:'attack'});
          }
          if(target.hp===0){if(!modern&&spec.tags.includes('poison_reference'))target.poison=Math.max(0,target.poison-1);finish(state,side,events);return;}break;
        }
        case 'barrier':who.barrier+=effect.amount;if(modern)events.push({type:'barrier',side,amount:effect.amount});break;
        case 'heal':{const before=who.hp;who.hp=MathRules.heal(who.hp,who.maxHp,effect.amount);events.push({type:'heal',side,amount:who.hp-before});break;}
        case 'poison':case 'poisonOnHP':{
          if(effect.kind==='poisonOnHP'&&hpDamage===0)break;
          const before=target.poison;target.poison=modern?FirstEra.addPoison(before,effect.amount):MathRules.poison(before,effect.amount);
          if(modern)events.push({type:'poisonApplied',side,target:other(side),id,replay,amount:target.poison-before,remaining:target.poison});break;
        }
        case 'consumePoison':target.poison=Math.max(0,target.poison-effect.amount);break;
        case 'weak':target.weak+=effect.amount;if(modern)events.push({type:'weak',target:other(side),amount:effect.amount,remaining:target.weak});break;
        case 'manaPenalty':target.manaPenalty+=effect.amount;break;
        case 'attackBonus':who.attackBonus+=effect.amount;if(modern)events.push({type:'attackBonus',side,amount:effect.amount,remaining:who.attackBonus});break;
        case 'setupBonus':who.setupBonus+=effect.amount;if(modern)events.push({type:'setupBonus',side,amount:effect.amount,remaining:who.setupBonus});break;
      }
    }
  }
  function execute(state,action){
    const events=[],side=action.side||state.active;
    if(state.end)return {ok:false,reason:REASONS.ended,events};
    if(state.active!==side)return {ok:false,reason:REASONS.turn,events};
    const who=state.actors[side],target=state.actors[other(side)];
    if(action.type==='card'){
      const available=availability(state,side,action.id);if(!available.allowed)return {ok:false,reason:available.reason,events};
      const spec=getCard(state,action.id);
      who.mana-=spec.cost;who.used.push(action.id);who.readyOn[action.id]=who.ownTurn+spec.cd+1;
      events.push({type:'card',side,id:action.id});
      if(isFirstEra(state))state.ultimate.lastSkillId=side==='player'?action.id:state.ultimate.lastSkillId;
      applySkill(state,side,action.id,false,events);
    }else if(action.type==='ability'){
      const available=bossAbilityStatus(state,side);if(!available.allowed||action.id!==FirstEra.bossAbility.id)return {ok:false,reason:available.reason||REASONS.missing,events};
      state.bossState.charging=false;state.bossState.flashUsedTurn=who.ownTurn;
      events.push({type:'bossAbility',side,id:FirstEra.bossAbility.id,ownTurn:who.ownTurn,cost:0,baseDamage:FirstEra.bossAbility.damage});
      hit(state,side,FirstEra.bossAbility.damage,FirstEra.bossAbility.id,false,events,true);if(target.hp===0)finish(state,side,events,'ability');
    }else if(action.type==='ultimate'){
      const available=ultimateStatus(state,side);if(!available.allowed)return {ok:false,reason:available.reason,events};
      const id=state.ultimate.lastSkillId;who.mana-=FirstEra.ultimate.cost;state.ultimate.available=false;
      events.push({type:'ultimate',side,id,cost:FirstEra.ultimate.cost});applySkill(state,side,id,true,events);
    }else if(action.type==='accelerate'){
      const available=accelerationStatus(state,side);if(!available.allowed)return {ok:false,reason:available.reason,events};
      who.mana-=2;who.accelerated=true;who.accelerationPending=true;events.push({type:'accelerate',side,nextCap:who.manaCap+1});
    }else if(action.type==='endTurn'){
      if(bossAbilityStatus(state,side).allowed)return {ok:false,reason:REASONS.abilityRequired,events};
      who.attackBonus=0;if(isFirstEra(state)&&side==='player')state.ultimate.lastSkillId=null;
      if(who.poison>0){
        const amount=isFirstEra(state)?Math.min(who.hp,poisonTickDamage(state,who.poison)):who.poison;who.hp=Math.max(0,who.hp-amount);who.poison--;
        events.push({type:'damage',source:other(side),target:side,amount,blocked:0,kind:'poison'});
        if(who.hp===0){finish(state,other(side),events,'poison');return {ok:true,events};}
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
    if(value&&value.schemaVersion===4&&value.ruleset==='first-era-v1'){
      if(!FirstEra)throw new TypeError('First-era rules are unavailable');
      FirstEra.validateDeck(value.actors?.player?.deck);
      if(value.firstSide!=='player'||!['player','boss'].includes(value.active)||!Number.isInteger(value.round)||value.round<1||!['player','boss',null].includes(value.end)||value.bossPresetId!=='ashen_king'||JSON.stringify(value.actors.boss.deck)!==JSON.stringify(FirstEra.bossDeck))throw new TypeError('Invalid first-era snapshot');
      if(!value.bossState||typeof value.bossState.charging!=='boolean'||!Number.isInteger(value.bossState.flashUsedTurn)||value.bossState.flashUsedTurn<0||value.bossState.flashUsedTurn>value.actors.boss.ownTurn||('stance' in value.bossState)||('gauge' in value.bossState)||('broken' in value.bossState)||!value.ultimate||value.ultimate.id!==FirstEra.ultimate.id||typeof value.ultimate.available!=='boolean'||(value.ultimate.lastSkillId!==null&&!value.actors.player.deck.includes(value.ultimate.lastSkillId)))throw new TypeError('Invalid first-era metadata');
      if(Object.keys(value.actors).sort().join(',')!=='boss,player')throw new TypeError('Invalid first-era state');
      for(const a of Object.values(value.actors)){
        if(typeof a.accelerationPending!=='boolean'||typeof a.accelerated!=='boolean'||!Array.isArray(a.used)||!Array.isArray(a.attacks)||a.used.some(id=>!a.deck.includes(id))||a.attacks.some(id=>!a.deck.includes(id))||!a.readyOn||typeof a.readyOn!=='object'||Array.isArray(a.readyOn)||Object.entries(a.readyOn).some(([id,n])=>!a.deck.includes(id)||!Number.isInteger(n)||n<0))throw new TypeError('Invalid first-era action records');
      }
      for(const a of Object.values(value.actors))for(const k of ['hp','maxHp','mana','manaCap','ownTurn','poison','barrier','weak','attackBonus','setupBonus','manaPenalty'])if(!Number.isInteger(a[k])||a[k]<0)throw new TypeError('Invalid first-era actor');
      if(value.actors.player.maxHp!==34||value.actors.boss.maxHp!==40||Object.values(value.actors).some(a=>a.hp>a.maxHp||a.poison>8||a.manaCap<3||a.manaCap>5||a.mana>a.manaCap))throw new TypeError('Invalid first-era actor bounds');
      const b=value.bossState,turn=value.actors.boss.ownTurn;
      const charging=!value.end&&(value.active==='player'?FirstEra.finisherDue(turn+1):FirstEra.finisherDue(turn)&&b.flashUsedTurn!==turn);
      if((b.flashUsedTurn!==0&&!FirstEra.finisherDue(b.flashUsedTurn))||b.charging!==charging)throw new TypeError('Invalid first-era ability state');
      return clone(value);
    }
    if(!value||value.schemaVersion!==2||value.ruleset!=='first-era-trial')throw new TypeError('Unsupported battle snapshot');
    return clone(value);
  }
  return Object.freeze({exhaustionDamage,createState,getCard,poisonTickDamage,availability,accelerationStatus,ultimateStatus,bossAbilityStatus,legalActions,execute,transition,snapshot,restore,other});
});
