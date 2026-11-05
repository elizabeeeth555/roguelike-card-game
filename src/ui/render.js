'use strict';
function createCardView(id,side){
  const spec=GameData.CARDS[id],view=document.createElement('div');
  view.className=`game-card ${GameData.category(spec)}`;view.dataset.cardId=id;
  const open=document.createElement('button');open.type='button';open.className='card-open';
  const cost=document.createElement('span');cost.className='card-cost';cost.textContent=spec.cost;
  const name=document.createElement('strong');name.className='card-name';name.textContent=spec.name;
  const tags=document.createElement('span');tags.className='card-tags';tags.textContent=spec.tags.map(tag=>GameData.TAG_LABELS[tag]).join('＋');
  const desc=document.createElement('span');desc.className='card-description';desc.textContent=cardDescription(id);
  const cd=document.createElement('span');cd.className='card-cd';cd.textContent=spec.cd?`CD${spec.cd}`:'CDなし';
  const status=document.createElement('span');status.className='card-status';status.textContent=cardStatusText(id,side);
  open.append(cost,name,tags,desc,cd,status);open.setAttribute('aria-label',`${spec.name}、コスト${spec.cost}、${tags.textContent}、${cd.textContent}。${status.textContent}。詳細を開く`);
  view.append(open);
  if(side==='player'){
    const use=document.createElement('button');use.type='button';use.className='card-use';use.textContent='使用する';
    use.disabled=app.busy||!GameBattle.availability(app.battle,'player',id).allowed;
    use.addEventListener('click',()=>useCard(id));view.append(use);
  }
  if(side==='draft'){
    const pick=document.createElement('button');pick.type='button';pick.className='card-pick';pick.textContent='この技を獲得';
    pick.addEventListener('click',()=>acquireDraft(id));view.append(pick);
  }
  return view;
}
function cardDescription(id){
  let text=GameData.CARDS[id].description;
  if(['barrier','fortress'].includes(id))text='バリア'+(id==='barrier'?3:5)+'を得る。次の相手ターン終了時に残りは消滅。';
  if(id==='battle_spirit')text+='。攻撃せず終了すると失効。';
  if(id==='setup')text+='。次の自ターンに攻撃せず終了すると失効。';
  if(id==='first_aid')text+='。最大HP20を超えない。';
  if(['corrosion','plague'].includes(id))text+='。毒は対象の自ターン終了時に現在値のHP直接ダメージを与え、1減る。';
  if(['feint','curse'].includes(id))text+='。攻撃弱体は次の攻撃まで保持、合算して消費。';
  return text;
}
function cardStatusText(id,side){
  if(!app.battle||!['player','boss'].includes(side))return '詳細を見る';
  const actor=app.battle.actors[side],ready=actor.readyOn[id]||0;
  if(actor.used.includes(id))return '使用済み';
  if(ready>actor.ownTurn)return `CDあと${ready-actor.ownTurn}自ターン`;
  const available=GameBattle.availability(app.battle,side,id);
  return available.allowed?'使用可能':available.reason;
}
function render(){
  if(app.mode!=='battle'||!app.battle)return;
  const state=app.battle;
  $('roundValue').textContent=String(state.round).padStart(2,'0');
  $('turnBanner').textContent=state.end?'戦闘終了':state.active==='player'?'YOUR TURN':'ENEMY TURN';
  for(const side of ['player','boss']){
    const actor=state.actors[side];
    $(side+'HpValue').textContent=`${actor.hp} / ${actor.maxHp}`;
    $(side+'HpBar').style.width=actor.hp/actor.maxHp*100+'%';
    $(side+'HpTrack').setAttribute('aria-valuenow',actor.hp);
    $(side+'ManaValue').textContent=`${actor.mana} / ${actor.manaCap}`;
    $(side+'Status').textContent=`バリア ${actor.barrier} ／ 毒 ${actor.poison} ／ 攻撃弱体 −${actor.weak}`;
    $(side+'Status').dataset.info='バリア：次の相手ターン終了で残量消滅。毒：自ターン終了時に現在値のHP直接ダメージ（バリア無視）、その後1減る。攻撃弱体：次の攻撃まで保持し、合算して一度で消費。0ダメージでも消費。';
    $(side+'Buffs').textContent=`次の攻撃 +${actor.attackBonus} ／ 次の自ターン +${actor.setupBonus} ／ 次ターンMP −${actor.manaPenalty}${actor.accelerationPending?' ／ 上限+1予約済み':''}`;
  }
  const player=state.actors.player;
  $('manaValue').textContent=`${player.mana} / ${player.manaCap}`;
  $('handCount').textContent=`通常 ${player.deck.length} / 5`;
  $('hand').replaceChildren(...player.deck.map(id=>{
    const view=createCardView(id,'player');view.querySelector('.card-open').addEventListener('click',()=>openCardDetail(id,'player'));return view;
  }));
  $('enemyDeck').replaceChildren(...state.actors.boss.deck.map(id=>{
    const button=document.createElement('button');button.type='button';
    button.className=`enemy-mini-card ${GameData.category(GameData.CARDS[id])}${app.enemyActiveKey===id?' active':''}${app.enemyUsedKeys.has(id)?' spent':''}`;
    button.textContent=`${GameData.CARDS[id].cost}　${GameData.CARDS[id].name}　${cardStatusText(id,'boss')}`;
    button.setAttribute('aria-label',button.textContent+'。詳細を開く');button.addEventListener('click',()=>openCardDetail(id,'boss'));return button;
  }));
  const accel=GameBattle.accelerationStatus(state,'player');
  $('accelerateButton').disabled=app.busy||!accel.allowed;
  $('accelerateReason').textContent=app.busy?'演出中':accel.allowed?'次の自ターンから上限＋1':accel.reason;
  $('endTurn').disabled=app.busy||!!state.end||state.active!=='player';
  if(!$('cardDetailOverlay').hidden)updateCardDetail();
}
