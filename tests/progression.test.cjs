'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function browser(){
  const elements=new Map(),timers=new Map();let nextTimer=0;let doc;
  class El{
    constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.style={setProperty(){}};this.hidden=false;this.disabled=false;this.textContent='';this.className='';this.listeners={};this.attributes={};this.isConnected=true;this.scrollHeight=100;this.offsetWidth=100;this.offsetHeight=100;this.parentElement=this;
      this.classList={add:(...names)=>{this.className=[...new Set([...this.className.split(' '),...names])].join(' ');},remove:(...names)=>{this.className=this.className.split(' ').filter(n=>!names.includes(n)).join(' ');},contains:name=>this.className.split(' ').includes(name),toggle:(name,on)=>{if(on===undefined)on=!this.classList.contains(name);on?this.classList.add(name):this.classList.remove(name);return on;}};
    }
    append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
    replaceChildren(...nodes){this.children=[];this.append(...nodes);}
    addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
    click(){if(!this.disabled)for(const fn of this.listeners.click||[])fn({target:this});}
    focus(){doc.activeElement=this;}
    setAttribute(name,value){this.attributes[name]=String(value);}
    removeAttribute(name){delete this.attributes[name];if(name==='src')delete this.src;}
    getBoundingClientRect(){return {left:0,right:100,top:0,bottom:100,width:100,height:100};}
    matches(selector){return selector.startsWith('.')?this.classList.contains(selector.slice(1)):this.tagName===selector.split(':')[0];}
    querySelectorAll(selector){return this.children.flatMap(c=>[...(c.matches(selector)?[c]:[]),...c.querySelectorAll(selector)]);}
    querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
    closest(){return this;}
  }
  const get=id=>{if(!elements.has(id))elements.set(id,new El());return elements.get(id);};
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  for(const match of html.matchAll(/<[^>]+id="([^"]+)"[^>]*>/g)){const el=get(match[1]);el.hidden=/\shidden(?:[\s>])/.test(match[0]);const cls=match[0].match(/class="([^"]+)"/);if(cls)el.className=cls[1];}
  doc={getElementById:get,createElement:tag=>new El(tag),addEventListener(){},activeElement:null};
  for(const id of ['bossPortrait','heroPortrait','heroFace']){const parent=new El(),fallback=new El();fallback.className='portrait-fallback';parent.append(get(id),fallback);}
  class Audio{constructor(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}canPlayType(){return 'probably';}}
  const scope={document:doc,Audio,console,Math,Set,Promise,innerWidth:390,innerHeight:844,addEventListener(){},
    setTimeout:(fn,ms)=>{timers.set(++nextTimer,{fn,ms});return nextTimer;},clearTimeout:id=>timers.delete(id),setInterval:()=>0,clearInterval(){}};
  scope.window=scope;vm.createContext(scope);
  for(const [,file] of html.matchAll(/<script src="([^"]+)"><\/script>/g))vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),scope,{filename:file});
  const evaluate=code=>vm.runInContext(code,scope);
  async function settle(promise){let done=false;promise.then(()=>done=true);for(let i=0;i<100&&!done;i++){await new Promise(setImmediate);const item=[...timers.entries()].sort((a,b)=>a[1].ms-b[1].ms)[0];if(item){timers.delete(item[0]);item[1].fn();}}assert(done,'all waits must settle');await promise;}
  async function build(){get('draftOptions').children[0].click();for(let i=0;i<3;i++){get('draftOptions').children[0].querySelector('.card-pick').click();get('confirmCard').click();}get('draftSkip').click();get('draftSkip').click();for(let n=0;n<8;n++){evaluate('hideTransitions()');await new Promise(setImmediate);const item=[...timers.entries()].sort((a,b)=>a[1].ms-b[1].ms)[0];if(item){timers.delete(item[0]);item[1].fn();}await new Promise(setImmediate);if(!evaluate('app.busy'))break;}}
  return {get,evaluate,settle,build,timers};
}
test('classic scriptの実読み込み順で起動、初期2枚→獲得3回＋スキップ2回→5枚→第一紀1戦',async()=>{
  const b=browser();assert.equal(b.evaluate('app.mode'),'draft');assert.equal(b.get('draftOptions').children.length,3);
  await b.build();assert.equal(b.evaluate('app.mode'),'battle');assert.equal(b.evaluate('app.draftStep'),5);assert.equal(b.get('hand').children.length,5);assert.equal(b.evaluate('app.battle.actors.player.mana'),2);assert.equal(b.evaluate('app.busy'),false);
  b.get('hand').children[0].querySelector('.card-open').click();assert.equal(b.evaluate('app.selectedPlayer'),b.evaluate('app.battle.actors.player.deck[0]'));assert.equal(b.get('cardDetailOverlay').hidden,true);
  b.get('hand').children[0].querySelector('.card-use').click();assert.equal(b.evaluate('app.selectedPlayer'),null);assert.equal(b.evaluate('app.battle.actors.player.used.length'),1);
});
test('実ターン進行、CD表示、加速、演出の重複入力防止',async()=>{
  const b=browser();await b.build();b.get('accelerateButton').click();assert.equal(b.evaluate('app.battle.actors.player.mana'),0);
  const turn=b.evaluate('endTurn()');b.get('accelerateButton').click();assert.equal(b.evaluate('app.battle.actors.player.accelerationPending'),true);
  await b.settle(turn);assert.equal(b.evaluate('app.battle.round'),2);assert.equal(b.evaluate('app.battle.actors.player.manaCap'),4);assert.equal(b.evaluate('app.busy'),false);
});
test('演出中のリセットと勝敗待機中のリセットは古い処理を残さない',async()=>{
  const b=browser();await b.build();const turn=b.evaluate('endTurn()');b.evaluate('resetGame()');await turn;
  assert.equal(b.evaluate('app.mode'),'draft');assert.equal(b.evaluate('app.battle'),null);
  await b.build();b.evaluate('app.battle.actors.boss.hp=1;openCardDetail("slash","player");useCard("slash");resetGame()');
  for(const timer of [...b.timers.values()])timer.fn();await Promise.resolve();assert.equal(b.get('resultOverlay').hidden,true);assert.equal(b.evaluate('app.mode'),'draft');
});
test('勝利・敗北とも同条件再戦と最初からを提供し、全戦闘状態を初期化',async()=>{
  for(const winner of ['player','boss']){
    const b=browser();await b.build();const preset=b.evaluate('app.retryPreset'),deck=b.evaluate('JSON.stringify(app.draftCards)');
    b.evaluate(`app.battle.end='${winner}';renderResult('${winner}')`);assert.equal(b.get('resultOverlay').hidden,false);
    b.get('retryButton').click();b.evaluate('hideTransitions()');await Promise.resolve();
    assert.equal(b.evaluate('app.retryPreset'),preset);assert.equal(b.evaluate('JSON.stringify(app.draftCards)'),deck);
    assert.equal(b.evaluate('app.battle.actors.player.hp'),20);assert.equal(b.evaluate('app.battle.actors.player.mana'),2);assert.equal(b.evaluate('Object.keys(app.battle.actors.player.readyOn).length'),0);
    b.get('restartButton').click();assert.equal(b.evaluate('app.mode'),'draft');assert.equal(b.evaluate('app.draftCards.length'),0);
  }
});
test('大男・斥候の新素材を参照し、画像読み込み失敗時は安全に代替表示',async()=>{
  const b=browser();await b.build();
  for(const id of ['04_giant_warrior','05_scout']){
    b.evaluate(`setCharacterImage($('bossPortrait'),'${id}','boss')`);assert.equal(b.get('bossPortrait').hidden,true);assert.match(b.get('bossPortrait').src,/assets\/characters\/castle\//);
    assert.equal(b.evaluate(`Object.keys(characterInfo('${id}').images).length`),3);
  }
  b.evaluate(`setCharacterImage($('bossPortrait'),'03_witch','boss');$('bossPortrait').onerror()`);assert.equal(b.get('bossPortrait').hidden,true);assert.equal(b.evaluate('app.mode'),'battle');
});

test('CD0/1/2を基本CD・使用済・残りCDに分離し、所有者の自ターンで更新',async()=>{
 const b=browser();await b.build();
 for(const side of ['player','boss'])for(const [id,cd]of [['slash',0],['dash_slash',1],['battle_spirit',2]]){
  b.evaluate(`app.battle=GameBattle.createState({playerDeck:['${id}'],bossPresetId:'boss_knight_defense',firstSide:'${side}'});app.battle.actors.${side}.deck=['${id}'];app.battle.actors.${side}.mana=5;GameBattle.execute(app.battle,{type:'card',side:'${side}',id:'${id}'})`);
  assert.equal(b.evaluate(`cardDisplayState('${id}','${side}').used`),true);
  assert.equal(b.evaluate(`cardDisplayState('${id}','${side}').remaining`),cd);
  b.evaluate(`GameBattle.execute(app.battle,{type:'endTurn'})`);
  assert.equal(b.evaluate(`cardDisplayState('${id}','${side}').used`),false);
  assert.equal(b.evaluate(`cardDisplayState('${id}','${side}').remaining`),cd);
  b.evaluate(`GameBattle.execute(app.battle,{type:'endTurn'})`);
  assert.equal(b.evaluate(`cardDisplayState('${id}','${side}').remaining`),cd);
  for(let i=0;i<cd;i++){assert.equal(b.evaluate(`cardDisplayState('${id}','${side}').remaining`),cd-i);b.evaluate(`GameBattle.execute(app.battle,{type:'endTurn'});GameBattle.execute(app.battle,{type:'endTurn'})`);}
  assert.equal(b.evaluate(`cardDisplayState('${id}','${side}').remaining`),0);
  assert(b.evaluate(`GameBattle.availability(app.battle,'${side}','${id}').allowed`));
 }
});
test('自カード演出中に次を選べるが使用・加速・ターン終了は重複しない',async()=>{
 const b=browser();await b.build();
 b.evaluate("app.battle.actors.player.mana=5;openCardDetail('slash','player')");
 const animation=b.evaluate("useCard('slash')");
 const next=b.evaluate("app.battle.actors.player.deck.find(id=>id!=='slash')");
 b.evaluate(`openCardDetail('${next}','player');useCard('${next}');accelerate();endTurn()`);
 assert.equal(b.evaluate('app.selectedPlayer'),next);assert.equal(b.evaluate('app.battle.actors.player.used.length'),1);
 assert.equal(b.evaluate('app.battle.actors.player.accelerationPending'),false);assert.equal(b.evaluate('app.battle.active'),'player');
 await b.settle(animation);assert.equal(b.evaluate('app.busy'),false);
});
test('敵味方を通じて選択1枚、敵ターンも情報確認可・使用不可、予測は不変',async()=>{
 const b=browser();await b.build();
 b.evaluate("app.battle.actors.boss.barrier=1;openCardDetail('slash','player');openCardDetail(app.battle.actors.boss.deck[0],'boss')");
 assert.equal(b.evaluate('app.selectedPlayer'),null);assert(b.evaluate('app.selectedBoss'));
 b.evaluate("openCardDetail('slash','player')");assert.equal(b.evaluate('app.selectedPlayer'),'slash');assert.equal(b.evaluate('app.selectedBoss'),null);
 const before=b.evaluate('JSON.stringify(app.battle)');assert.equal(b.evaluate("cardDamagePreview('slash').damage"),1);assert.equal(b.evaluate("cardDamagePreview('slash').blocked"),1);assert.equal(b.evaluate('JSON.stringify(app.battle)'),before);
 const turn=b.evaluate('endTurn(true)');b.evaluate("openCardDetail('slash','player')");assert.equal(b.evaluate('app.selectedPlayer'),'slash');assert.equal(b.evaluate('app.selectedBoss'),null);assert.equal(b.evaluate('canChangeBattle()'),false);
 b.evaluate('resetGame()');await turn;
});
test('終了確認は合法な未使用操作がある時だけ、確認中の重複実行を防ぐ',async()=>{
 const b=browser();await b.build();await b.evaluate('endTurn()');assert.equal(b.get('endTurnOverlay').hidden,false);assert.equal(b.evaluate('app.battle.active'),'player');
 b.evaluate('accelerate()');assert.equal(b.evaluate('app.battle.actors.player.accelerationPending'),false);
 b.get('cancelEndTurn').click();assert.equal(b.get('endTurnOverlay').hidden,true);
 b.evaluate('app.battle.actors.player.mana=0');const turn=b.evaluate('endTurn()');assert.equal(b.get('endTurnOverlay').hidden,true);assert.equal(b.evaluate('app.battle.active'),'boss');
 b.evaluate('resetGame()');await turn;
});
test('ログ履歴を読んでいる間は追加イベントでスクロール位置を奪わない',()=>{
 const b=browser(),log=b.get('combatLog');log.scrollHeight=1000;log.clientHeight=200;log.scrollTop=100;
 b.evaluate("addLog('新しい記録')");assert.equal(log.scrollTop,100);
 log.scrollTop=800;b.evaluate("addLog('末尾追従')");assert.equal(log.scrollTop,1000);
});

test('全攻撃カードの予測は条件・バフ・弱体・バリアを反映し戦闘を変更しない',async()=>{
 const b=browser();await b.build();
 const ids=b.evaluate("Object.keys(GameData.CARDS).filter(id=>GameData.CARDS[id].tags.includes('attack'))");
 for(const id of ids)for(const poison of [0,2]){
  b.evaluate(`app.battle=GameBattle.createState({playerDeck:['${id}'],bossPresetId:'boss_knight_defense'});Object.assign(app.battle.actors.player,{mana:5,attackBonus:3,weak:2,attacks:['slash']});Object.assign(app.battle.actors.boss,{barrier:3,poison:${poison},hp:10})`);
  const before=b.evaluate('JSON.stringify(app.battle)'),p=b.evaluate(`cardDamagePreview('${id}')`);
  assert.equal(b.evaluate('JSON.stringify(app.battle)'),before);
  const out=b.evaluate(`GameBattle.transition(app.battle,{type:'card',side:'player',id:'${id}'})`);
  assert.equal(p.allowed,out.ok);
  if(out.ok){assert.equal(p.damage,10-out.state.actors.boss.hp);assert.equal(p.blocked,3-out.state.actors.boss.barrier);}
 }
});

test('5イベント：3枚追加後は入れ替え、キャンセルは進行/デッキを保持',()=>{
 const b=browser();b.get('draftOptions').children[0].click();
 for(let i=0;i<3;i++)b.evaluate('acquireDraft(app.draftOptions[0])');
 assert.equal(b.evaluate('app.draftStep'),3);assert.equal(b.evaluate('app.draftCards.length'),5);
 const before=b.evaluate('JSON.stringify(app.draftCards)');b.evaluate('acquireDraft(app.draftOptions[0])');
 assert.equal(b.evaluate('app.draftStep'),3);assert(b.evaluate('app.draftPending'));assert.equal(b.evaluate('JSON.stringify(app.draftCards)'),before);
 b.get('draftReplaceCancel').click();assert.equal(b.evaluate('app.draftPending'),null);assert.equal(b.evaluate('app.draftStep'),3);
 b.evaluate('acquireDraft(app.draftOptions[0]);replaceDraft(app.draftCards[0])');assert.equal(b.evaluate('app.draftStep'),4);assert.equal(b.evaluate('new Set(app.draftCards).size'),5);assert.notEqual(b.evaluate('JSON.stringify(app.draftCards)'),before);
});
test('リロール2回を持越し・選択解除、スキップはデッキ/残数不変、2枚で戦闘可能',async()=>{
 const b=browser();b.get('draftOptions').children[0].click();const deck=b.evaluate('JSON.stringify(app.draftCards)'),old=b.evaluate('JSON.stringify(app.draftOptions)');
 b.evaluate("openCardDetail(app.draftOptions[0],'draft');rerollDraft()");assert.equal(b.evaluate('app.selectedCard'),null);assert.equal(b.get('cardDetailOverlay').hidden,true);assert.equal(b.evaluate('app.draftRerolls'),1);assert.equal(b.evaluate('app.draftStep'),0);assert.notEqual(b.evaluate('JSON.stringify(app.draftOptions)'),old);
 b.get('draftSkip').click();assert.equal(b.evaluate('app.draftRerolls'),1);assert.equal(b.evaluate('JSON.stringify(app.draftCards)'),deck);
 b.get('draftReroll').click();assert.equal(b.evaluate('app.draftRerolls'),0);assert(b.get('draftReroll').disabled);const options=b.evaluate('JSON.stringify(app.draftOptions)');b.evaluate('rerollDraft()');assert.equal(b.evaluate('JSON.stringify(app.draftOptions)'),options);
 for(let i=0;i<4;i++)b.get('draftSkip').click();b.evaluate('hideTransitions()');await new Promise(setImmediate);
 assert.equal(b.evaluate('app.mode'),'battle');assert.equal(b.get('hand').children.length,2);assert.equal(b.evaluate('app.draftStep'),5);
 b.evaluate('resetGame()');assert.equal(b.evaluate('app.draftRerolls'),2);assert.equal(b.evaluate('app.draftStep'),0);
});
test('詳細を閉じてスキップでき、入れ替え待ちからのリロールもデッキを変えない',()=>{
 const b=browser();b.get('draftOptions').children[0].click();b.evaluate("openCardDetail(app.draftOptions[0],'draft')");b.get('closeCardDetail').click();b.get('draftSkip').click();assert.equal(b.evaluate('app.draftStep'),1);assert.equal(b.evaluate('app.draftCards.length'),2);
 for(let i=0;i<3;i++)b.evaluate('acquireDraft(app.draftOptions[0])');const before=b.evaluate('JSON.stringify(app.draftCards)');b.evaluate('acquireDraft(app.draftOptions[0]);rerollDraft()');assert.equal(b.evaluate('app.draftPending'),null);assert.equal(b.evaluate('JSON.stringify(app.draftCards)'),before);assert.equal(b.evaluate('app.draftStep'),4);
});

test('スキル表示：MP/CD独立、使用済とCD中は排他、詳細は効果だけ',async()=>{
 const b=browser();await b.build();
 for(const side of ['player','boss'])for(const [id,cd] of [['slash',0],['setup',1],['battle_spirit',2]]){
  b.evaluate(`app.battle=GameBattle.createState({playerDeck:['${id}'],bossPresetId:'boss_knight_defense',firstSide:'${side}'});app.battle.actors.${side}.deck=['${id}'];app.battle.actors.${side}.mana=5;GameBattle.execute(app.battle,{type:'card',side:'${side}',id:'${id}'});render()`);
  const root=side==='player'?'hand':'enemyDeck';let view=b.get(root).children[0];assert.equal(view.querySelector('.card-status').textContent,'使用済');assert.equal(view.querySelector('.remaining-cd'),null);assert.match(view.querySelector('.card-cost').textContent,/♦/);assert.equal(view.querySelector('.card-cd').textContent,`⌛ ${cd}`);
  b.evaluate("GameBattle.execute(app.battle,{type:'endTurn'});render()");view=b.get(root).children[0];assert.equal(view.querySelector('.card-status').textContent,cd?`CD中（残${cd}T）`:'');
 }
 b.evaluate("app.battle=GameBattle.createState({playerDeck:['setup'],bossPresetId:'boss_knight_defense'});app.battle.actors.player.mana=0;app.busy=false;openCardDetail('setup','player')");const v=b.get('hand').children[0];assert.equal(v.querySelector('.inline-card-reason'),null);assert.equal(v.querySelector('.inline-card-details').children.length,3);assert.equal(v.querySelector('.inline-card-details').children[0].textContent,b.evaluate("cardDescription('setup')"));assert.equal(v.querySelector('.card-use').disabled,true);
});
test('習得詳細は効果と習得のみ、数値演出はハートなしでダメージ/回復を分離',()=>{
 const b=browser();b.get('draftOptions').children[0].click();b.evaluate("openCardDetail(app.draftOptions[0],'draft')");assert.equal(b.get('cardDetailMeta').hidden,true);assert.equal(b.get('cardDetailStatus').hidden,true);assert.match(b.get('confirmCard').textContent,/スキル/);
 b.evaluate("animateHit(3,'boss');animateHeal(2,'player')");assert.equal(b.get('bossHit').textContent,'−3');assert.equal(b.get('playerHit').textContent,'＋2');assert(b.get('playerHit').classList.contains('healing'));b.evaluate("animateHit(1,'player')");assert(!b.get('playerHit').classList.contains('healing'));
});
test('開始演出はSTART→空白→YOUR、通常2000ms、空白中リセットで残留しない',async()=>{
 const b=browser(),opening=b.evaluate("app.draftCards=['slash','barrier'];initBattle('boss_knight_defense')");assert.equal(b.get('transitionText').textContent,'BATTLE START');assert([...b.timers.values()].some(t=>t.ms===2000));assert(b.evaluate('app.busy'));
 b.evaluate('hideTransitions()');await new Promise(setImmediate);assert(b.get('battleTransition').hidden);const gap=[...b.timers].find(([,t])=>t.ms===180);assert(gap);b.timers.delete(gap[0]);gap[1].fn();await new Promise(setImmediate);assert.equal(b.get('transitionText').textContent,'YOUR TURN');assert([...b.timers.values()].some(t=>t.ms===2000));b.evaluate('hideTransitions()');await opening;assert.equal(b.evaluate('app.busy'),false);
 const next=b.evaluate("initBattle('boss_knight_defense')");b.evaluate('hideTransitions()');await new Promise(setImmediate);b.evaluate('resetGame()');await next;assert.equal(b.evaluate('app.mode'),'draft');assert(b.get('battleTransition').hidden);
});
test('交換候補は詳細と確定を分離、キャンセル時に手札・残数・進行を保持',()=>{
 const b=browser();b.evaluate("applyStarter(GameData.STARTERS[0].id);app.draftCards=['slash','barrier','first_aid','setup','battle_spirit'];app.draftOptions=['heavy_slash','great_swing','curse'];acquireDraft('heavy_slash')");
 assert(b.get('draftActions').hidden);const panel=b.get('draftReplaceOptions').children[0];assert(panel.querySelector('.card-cost'));assert(panel.querySelector('.card-cd'));assert(panel.querySelector('.card-description'));
 const before=b.evaluate('JSON.stringify([app.draftCards,app.draftStep,app.draftRerolls])');panel.querySelector('.card-open').click();assert.equal(b.get('confirmCard').hidden,true);assert.equal(b.evaluate('app.draftPending'),'heavy_slash');
 b.evaluate('closeCardDetail();cancelDraftReplacement()');assert.equal(b.evaluate('JSON.stringify([app.draftCards,app.draftStep,app.draftRerolls])'),before);assert.equal(b.get('draftActions').hidden,false);
 b.evaluate("acquireDraft('heavy_slash')");b.get('draftReplaceOptions').children[0].querySelector('.replace-confirm').click();assert.equal(b.evaluate("app.draftCards.includes('heavy_slash')"),true);assert.equal(b.evaluate('app.draftStep'),1);
});
test('終了状態の加速理由は演出中より優先、FX上限とリセット破棄',async()=>{
 const b=browser();await b.build();b.evaluate("for(let i=0;i<40;i++)combatFx('slash','boss',6)");assert.equal(b.evaluate('combatFxNodes.size'),24);
 b.evaluate("app.fxMode='light';for(let i=0;i<20;i++)combatFx('ward','player')");assert.equal(b.evaluate('combatFxNodes.size'),10);
 b.evaluate("app.battle.end={winner:'player'};app.busy=true;render()");assert.equal(b.get('accelerateReason').textContent,'戦闘終了');
 b.evaluate('resetGame()');assert.equal(b.evaluate('combatFxNodes.size'),0);
});
test('スキル主要演出だけ待機し、速度別・大ダメージ別に予算を限定',()=>{
 const b=browser();assert.equal(b.evaluate("skillImpactDelay([{type:'damage',amount:4}])"),420);assert.equal(b.evaluate("skillImpactDelay([{type:'damage',amount:5}])"),700);
 b.evaluate('app.fastFx=true');assert.equal(b.evaluate("skillImpactDelay([{type:'damage',amount:4}])"),280);assert.equal(b.evaluate("skillImpactDelay([{type:'damage',amount:5}])"),420);
});
test('宣言中と敵初動待機中は行動せず、初動後も敵行動の間隔を確保',async()=>{
 const b=browser();await b.build();b.evaluate("app.battle.actors.boss.deck=['slash','heavy_slash'];app.battle.actors.boss.mana=5");
 const next=b.evaluate('endTurn(true)');assert.equal(b.get('transitionText').textContent,'ENEMY TURN');assert.equal(b.evaluate('app.battle.actors.boss.used.length'),0);
 b.evaluate('hideTransitions()');await new Promise(setImmediate);const lead=[...b.timers].find(([,t])=>t.ms===700);assert(lead);assert.equal(b.evaluate('app.battle.actors.boss.used.length'),0);
 b.timers.delete(lead[0]);lead[1].fn();await new Promise(setImmediate);assert([...b.timers.values()].some(t=>t.ms===900));b.evaluate('resetGame()');await next;assert(b.get('battleTransition').hidden);
});
test('勝敗宣言を全て見せてから結果を表示し、途中リセットで結果を残さない',async()=>{
 for(const winner of ['player','boss']){
 const b=browser();await b.build();b.evaluate(`app.battle.end='${winner}'`);const end=b.evaluate(`finishBattle('${winner}')`);assert(b.get('resultOverlay').hidden);
 const pause=[...b.timers].find(([,t])=>t.ms===700);assert(pause);b.timers.delete(pause[0]);pause[1].fn();await new Promise(setImmediate);assert.equal(b.get('transitionText').textContent,winner==='player'?'VICTORY':'DEFEAT');assert(b.get('resultOverlay').hidden);assert([...b.timers.values()].some(t=>t.ms===2000));b.evaluate('hideTransitions()');await end;assert.equal(b.get('resultOverlay').hidden,false);
 const reset=b.evaluate(`finishBattle('${winner}')`);b.evaluate('resetGame()');await reset;assert(b.get('resultOverlay').hidden);
 }
});
test('情報確認と発動可否を分離し、演出・MP不足・CD中でも詳細を確認できる',async()=>{
 const b=browser();await b.build();
 b.evaluate("app.battle.actors.player.mana=0;app.battle.actors.player.readyOn.slash=app.battle.actors.player.ownTurn+2;app.busy=true;app.battle.active='boss';openCardDetail('slash','player')");
 assert.equal(b.evaluate('app.selectedPlayer'),'slash');assert.equal(b.evaluate('canInspectBattle()'),true);assert.equal(b.evaluate('canChangeBattle()'),false);
 const before=b.evaluate('JSON.stringify(app.battle)');b.get('hand').children[0].querySelector('.card-use').click();assert.equal(b.evaluate('JSON.stringify(app.battle)'),before);
 assert(b.get('hand').children[0].querySelector('.inline-card-details').children[1].textContent.includes('CD中'));
});
test('正式タイトル・読取専用ホバー・全画面導線を本編に登録する',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert(html.includes('<title>継世の王座'));assert(html.includes('王を討て。そして、王となれ。'));assert(html.includes('id="fullscreenButton"'));assert(html.includes('id="skillTooltip"'));
 const b=browser();assert.equal(b.get('fullscreenButton').disabled,true); // APIなしでも起動可能
});
