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
  async function build(){get('draftOptions').children[0].click();for(let i=0;i<3;i++){get('draftOptions').children[0].querySelector('.card-pick').click();get('confirmCard').click();}evaluate('hideTransitions()');await new Promise(setImmediate);}
  return {get,evaluate,settle,build,timers};
}
test('classic scriptの実読み込み順で起動、初期2枚→獲得3回→5枚→第一紀1戦',async()=>{
  const b=browser();assert.equal(b.evaluate('app.mode'),'draft');assert.equal(b.get('draftOptions').children.length,3);
  await b.build();assert.equal(b.evaluate('app.mode'),'battle');assert.equal(b.evaluate('app.draftStep'),3);assert.equal(b.get('hand').children.length,5);assert.equal(b.evaluate('app.battle.actors.player.mana'),2);assert.equal(b.evaluate('app.busy'),false);
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
test('大男・斥候は画像を参照せず代替表示、他画像の失敗も安全',async()=>{
  const b=browser();await b.build();
  for(const id of ['04_giant_warrior','05_scout']){
    b.evaluate(`setCharacterImage($('bossPortrait'),'${id}','boss')`);assert.equal(b.get('bossPortrait').hidden,true);assert.equal(b.get('bossPortrait').src,undefined);
    assert.equal(b.evaluate(`Object.keys(characterInfo('${id}').images).length`),0);
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
test('敵味方各1枚の選択と敵ターン禁止、予測はバリアとHPを分け不変',async()=>{
 const b=browser();await b.build();
 b.evaluate("app.battle.actors.boss.barrier=1;openCardDetail('slash','player');openCardDetail(app.battle.actors.boss.deck[0],'boss')");
 assert.equal(b.evaluate('app.selectedPlayer'),'slash');assert(b.evaluate('app.selectedBoss'));
 const before=b.evaluate('JSON.stringify(app.battle)');assert.equal(b.evaluate("cardDamagePreview('slash').damage"),1);assert.equal(b.evaluate("cardDamagePreview('slash').blocked"),1);assert.equal(b.evaluate('JSON.stringify(app.battle)'),before);
 const turn=b.evaluate('endTurn(true)');b.evaluate("openCardDetail('slash','player')");assert.equal(b.evaluate('app.selectedPlayer'),null);assert.equal(b.evaluate('app.selectedBoss'),null);
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
