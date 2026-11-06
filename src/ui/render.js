'use strict';
// Presentation-only status; GameBattle remains the authority for legal actions.
function cardDisplayState(id,side){
 if(!app.battle||!['player','boss'].includes(side))return {used:false,remaining:0,manaShort:false,conditionMissing:false,readyOn:0};
 const s=app.battle,a=s.actors[side],spec=GameData.CARDS[id],spent=a.used.includes(id),readyOn=a.readyOn[id]||0;
 return {used:s.active===side&&spent,remaining:Math.max(0,readyOn-a.ownTurn-(spent?1:0)),readyOn,
  manaShort:a.mana<spec.cost,conditionMissing:spec.tags.includes('poison_reference')&&s.actors[GameBattle.other(side)].poison===0};
}
function cardStatusText(id,side){
 if(!app.battle||!['player','boss'].includes(side))return '詳細を見る';
 const d=cardDisplayState(id,side),parts=[];
 if(d.used)parts.push('使用済');if(d.remaining)parts.push(`残${d.remaining}`);
 if(d.manaShort)parts.push('MP不足');if(d.conditionMissing)parts.push('条件未達：対象の毒が必要');
 if(app.battle.end)parts.push('戦闘終了');else if(app.battle.active!==side)parts.push('相手のターン');
 return parts.join(' ／ ')||'使用可能';
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
function cardDamagePreview(id,side='player'){
 if(!app.battle||!GameData.CARDS[id].tags.includes('attack'))return null;
 const s=app.battle,a=s.actors[side],b=s.actors[GameBattle.other(side)];
 const effect=GameCardEffects.plan(id,a,b).find(e=>e.kind==='damage');
 const value=GameMath.damage(effect.amount,a.attackBonus,a.weak,b.barrier);
 return {...value,damage:Math.min(b.hp,value.damage),allowed:GameBattle.availability(s,side,id).allowed};
}
function cardDetailStatus(id,side){
 let text=cardStatusText(id,side);
 if(app.battle&&['player','boss'].includes(side)){
  const d=cardDisplayState(id,side),a=app.battle.actors[side];
  if(d.readyOn>a.ownTurn)text+=` ／ 自ターン${d.readyOn}から再使用可能。残CDは今後使用不可の自ターン数（使用ターンを除く）`;
  const p=cardDamagePreview(id,side);if(p)text+=` ／ HP −${p.damage}、バリア −${p.blocked}${p.allowed?'':'（現在は使用不可）'}`;
 }return text;
}
function createCardView(id,side){
 const spec=GameData.CARDS[id],view=document.createElement('div'),d=cardDisplayState(id,side);
 const selected=side==='player'?app.selectedPlayer===id:side==='boss'?app.selectedBoss===id:false;
 view.className=`game-card ${GameData.category(spec)}${side==='boss'?' enemy-mini-card':''}${selected?' selected':''}${d.used?' spent':''}${d.remaining?' cooling':''}`;
 if((side==='boss'&&app.enemyActiveKey===id)||(side==='player'&&app.playerActiveKey===id))view.classList.add('active');
 view.dataset.cardId=id;view.dataset.side=side;
 const open=document.createElement('button');open.type='button';open.className='card-open';
 open.disabled=['player','boss'].includes(side)&&!canInspectBattle();open.setAttribute('aria-expanded',String(selected));
 const cost=document.createElement('span');cost.className='card-cost'+(d.manaShort?' mana-short':'');cost.textContent=spec.cost;
 const name=document.createElement('strong');name.className='card-name';name.textContent=spec.name;
 const tags=document.createElement('span');tags.className='card-tags';tags.textContent=spec.tags.map(t=>GameData.TAG_LABELS[t]).join('＋');
 const desc=document.createElement('span');desc.className='card-description';desc.textContent=spec.description;
 const cd=document.createElement('span');cd.className='card-cd';const baseCost=document.createElement('span');baseCost.textContent=`${spec.cost}MP / `;const baseCD=document.createElement('span');baseCD.textContent=`基本CD${spec.cd}`;cd.append(baseCost,baseCD);
 const status=document.createElement('span');status.className='card-status';status.textContent=d.used?'使用済':'';
 const badge=document.createElement('span');badge.className='remaining-cd';badge.hidden=!d.remaining;badge.textContent=`残${d.remaining}`;
 const condition=document.createElement('span');condition.className='condition-mark';condition.textContent='⚠';condition.hidden=!d.conditionMissing;condition.setAttribute('aria-label','条件未達：対象の毒が必要');
 open.append(cost,name,tags,desc,cd,status,badge,condition);
 open.setAttribute('aria-label',`${spec.name}、${spec.cost}MP、基本CD${spec.cd}。${cardStatusText(id,side)}。詳細を開く`);view.append(open);
 if(selected){
  const detail=document.createElement('div');detail.className='inline-card-details';
  const full=document.createElement('p');full.textContent=cardDescription(id);
  const why=document.createElement('p');why.className='inline-card-reason';why.textContent=cardDetailStatus(id,side);detail.append(full,why);view.append(detail);
 }
 if(side==='player'){
  const use=document.createElement('button');use.type='button';use.className='card-use';use.textContent=app.playerAnimating?'演出中':'使用する';use.hidden=!selected;
  use.disabled=!canChangeBattle()||!GameBattle.availability(app.battle,'player',id).allowed;
  use.addEventListener('click',()=>useCard(id));view.append(use);
 }
 if(side==='draft'){
  const pick=document.createElement('button');pick.type='button';pick.className='card-pick';pick.textContent='選んで効果を確認';
  pick.addEventListener('click',()=>openCardDetail(id,'draft'));view.append(pick);
 }return view;
}
function renderStatusIcons(side){
 const a=app.battle.actors[side];
 const make=(icon,value,label,description)=>{
  const b=document.createElement('button');b.type='button';b.className='status-icon info-trigger';b.dataset.info=`${label} ${value}：${description}`;b.setAttribute('aria-label',b.dataset.info);
  const art=document.createElement('span');art.className='status-symbol';art.textContent=icon;
  const n=document.createElement('b');n.textContent=value;b.append(art,n);return b;
 };
 $(side+'Status').replaceChildren(...[
  ['⬡',a.barrier,'バリア','次の相手ターン終了時に残量消滅'],['☣',a.poison,'毒','本人ターン終了時にHP直接ダメージ、その後1減少'],['↓',a.weak,'攻撃弱体','次の攻撃まで保持し合算して消費']
 ].filter(x=>x[1]>0).map(x=>make(...x)));
 $(side+'Buffs').replaceChildren(...[
  ['↑',a.attackBonus,'次の攻撃強化','この自ターンの最初の攻撃に加算'],['✦',a.setupBonus,'布石','次の自ターン最初の攻撃に加算'],['◇',a.manaPenalty,'マナ妨害','次の自ターンの使用可能マナを減少（最低2）'],['＋',a.accelerationPending?1:0,'加速予約','次の自ターン開始時に上限+1、最大5']
 ].filter(x=>x[1]>0).map(x=>make(...x)));
}
function render(){
 if(app.mode!=='battle'||!app.battle)return;const s=app.battle;clearInfoTooltip();$('gameLayout').classList.toggle('fast-effects',app.fastFx);
 $('roundValue').textContent=String(s.round).padStart(2,'0');$('turnBanner').textContent=s.end?'戦闘終了':s.active==='player'?'YOUR TURN':'ENEMY TURN';
 for(const side of ['player','boss']){
  const a=s.actors[side];$(side+'HpValue').textContent=`${a.hp} / ${a.maxHp}`;$(side+'HpBar').style.width=a.hp/a.maxHp*100+'%';
  $(side+'HpTrack').setAttribute('aria-valuenow',a.hp);$(side+'HpTrack').classList.toggle('critical',a.hp<=a.maxHp*.25);
  $(side+'ManaValue').textContent=`${a.mana} / ${a.manaCap}`;renderStatusIcons(side);
 }
 $('manaValue').textContent=`${s.actors.player.mana} / ${s.actors.player.manaCap}`;$('handCount').textContent=`通常 ${s.actors.player.deck.length} / 5`;
 for(const [side,container]of [['player','hand'],['boss','enemyDeck']])$(container).replaceChildren(...s.actors[side].deck.map(id=>{
  const view=createCardView(id,side);view.querySelector('.card-open').addEventListener('click',()=>openCardDetail(id,side));return view;
 }));
 const accel=GameBattle.accelerationStatus(s,'player');$('accelerateButton').disabled=!canChangeBattle()||!accel.allowed;
 $('accelerateReason').textContent=app.busy?'演出中':accel.allowed?'次の自ターンから上限＋1':accel.reason;$('endTurn').disabled=!canChangeBattle();
 const p=app.selectedPlayer&&cardDamagePreview(app.selectedPlayer);$('damagePreview').hidden=!p;$('damagePreviewBar').hidden=!p||!p.allowed;
 if(p){$('damagePreview').textContent=p.allowed?`予測 HP −${p.damage} ／ バリア −${p.blocked}`:'現在は使用不可：'+cardStatusText(app.selectedPlayer,'player');
  const boss=s.actors.boss;$('damagePreviewBar').style.left=(boss.hp-p.damage)/boss.maxHp*100+'%';$('damagePreviewBar').style.width=p.damage/boss.maxHp*100+'%';}
 if(!$('cardDetailOverlay').hidden)updateCardDetail();positionCardDetails();
}
