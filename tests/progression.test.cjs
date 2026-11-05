const vm=require('vm'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.join(__dirname,'..');
class Classes {constructor(){this.set=new Set()} add(...xs){xs.forEach(x=>this.set.add(x))}remove(...xs){xs.forEach(x=>this.set.delete(x))} toggle(x,on){if(on===undefined)on=!this.set.has(x);if(on)this.set.add(x);else this.set.delete(x);return on;} contains(x){return this.set.has(x)}}
class El{
 constructor(id=''){this.id=id;this.children=[];this.dataset={};this.className='';this.classList=new Classes;this.style={setProperty:()=>{}};this.hidden=false;this.textContent='';this.innerHTML='';this.disabled=false;this.parentElement={classList:new Classes};this.listeners={};this.scrollHeight=0;this.clientHeight=100;this.scrollTop=0;this.offsetWidth=100;}
 append(...xs){this.children.push(...xs);for(const x of xs)x.parentElement=this;}
 appendChild(x){this.append(x);return x;}
 replaceChildren(...xs){this.children=[...xs];for(const x of xs)x.parentElement=this;}
 addEventListener(key,cb){this.listeners[key]=cb}
 setAttribute(k,v){this[k]=v}
 getAttribute(k){return this[k]}
 querySelector(k){return new El(k)}
 querySelectorAll(k){return []}
 getBoundingClientRect(){return {left:0,width:50,top:20,bottom:30}}
}
let all=new Map;
const get=id=>{if(!all.has(id))all.set(id,new El(id));return all.get(id)};
const doc={getElementById:get,createElement:tag=>new El(tag),querySelector:sel=>get(sel),querySelectorAll:sel=>sel==='.enemy-mini-card'?get('enemyDeck').children:[],addEventListener:()=>{}};
const timerMap=new Map;let timerNext=0;
const sandbox={document:doc,window:{scrollTo(){},innerWidth:1366,innerHeight:768},console,Math,Set,Promise,
 setTimeout:(cb,ms)=>{const id=++timerNext;timerMap.set(id,{cb,ms});return id},clearTimeout:id=>{timerMap.delete(id)},
};
sandbox.window.GAME_ASSETS={characters:{guardian:'g',era1:'1',era2:'2',era3:'3'},cards:{},background:'bg'};
sandbox.GameAudio={setScene(){},stop(){},se(){}};
sandbox.GameMath=require(path.join(root,'src/game/combat-math.js'));
sandbox.GamePlanner=require(path.join(root,'src/game/boss-planner.js'));
vm.createContext(sandbox);
function run(file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});}
['src/game/card-data.js','src/app-state.js','src/game/draft.js','src/game/battle.js','src/ui/effects.js','src/ui/render.js'].forEach(run);
const e=expression=>vm.runInContext(expression,sandbox);
const openDraft=()=>{
 for(let i=0;i<14&&e('mode')==='draft';i++){
  const kind=e('draftKind'),arr=e('draftCards');
  if(kind==='starter'){e('applyStarter(STARTERS[era][0].cards)')}
  else if(kind==='upgrade'||kind==='special'||kind==='upgradeFork') {
   const has=e('draftCards.find(c=>!hasUpgraded(c))');
   if(has)e(`upgradeCard('${has.key}',${kind==='special'})`);else e('moveNext()')
  }else if(kind==='fork'||kind==='add'||kind==='trump'){
   const id=kind==='trump'?e("era===1?'laststand':era===2?'venombloom':'laststand'"):e('getOptions()[0]');
   if(id){if(e('draftCards.length')>=5)e(`draftCards.splice(0,1,newCard('${id}'));moveNext()`);else e(`addCard('${id}')`)}
   else e('moveNext()');
  }
 }
 assert.equal(e('mode'),'battle');e('hideTransitions()');
}
async function allEras(){
 e('resetGame()');assert.equal(e('era'),1);
 openDraft();await Promise.resolve();

 assert(!e('state.deck.some(c=>hasUpgraded(c))'));
 e('state.bossHp=1;state.bossGuard=0;state.bossBarrier=0;hit("player",100,"smoke",true);showResult(true)');
 assert.equal(e('state.end'),'win');assert.equal(e('previousHeroDeck.length'),5);
 e('inherited={...clone(state.deck[0]),inherited:true,key:"legacy"};goNext()');assert.equal(e('era'),2);
 openDraft();await Promise.resolve();

 assert.equal(e('state.bossBarrier'),7);
 assert(e('state.deck.some(c=>c.lv===1)'));
 e('state.bossHp=20;hit("player",5,"shield check");');assert.equal(e('state.bossHp'),20);assert.equal(e('state.bossBarrier'),2);
 e('expireBossBarrier()');assert.equal(e('state.bossBarrier'),0);
 e('state.bossHp=1;hit("player",100,"smoke",true);showResult(true)');
 assert.equal(e('state.end'),'win');
 assert.equal(e('previousHeroDeck.some(c=>c.lv===1)'),true);
 e('inherited={...clone(state.deck.find(c=>!c.inherited)),inherited:true,key:"legacy"};goNext()');assert.equal(e('era'),3);
 openDraft();await Promise.resolve();

 assert.equal(e('state.deck.some(c=>c.lv===2)'),true);
 assert.equal(e('state.enemyDeck.some(c=>c.lv===1)'),true);
 assert.equal(e('state.bossBarrier'),0);
 e('state.round=2;triggerThirdBossAbility()');assert.equal(e('state.bossAtk'),6);
 e('state.bossHp=1;hit("player",100,"smoke",true);showResult(true)');
 assert.equal(e('state.end'),'win');
 assert.equal(get('resultKicker').textContent,'PHASE 3 COMPLETE');

}
test('統合：第一紀→第二紀→第三紀、強化・固有バリア・継承・勝利',allEras);
