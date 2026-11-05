'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const Battle=require('../src/game/legacy/battle-engine.js');
const Data=require('../src/game/legacy/card-data.js');
const Progression=require('../src/game/legacy/progression.js');
const Planner=require('../src/game/legacy/boss-planner.js');
const baseline=require('./fixtures/card-behavior-v0.9.5.json');

function card(id,extra={}){return {...Data.newCard(id,false,()=>0.5),...extra};}
function state(era=2,deck=[]){
  return Battle.createState({era,draftCards:deck,previousHeroDeck:[]});
}
function execute(s,command,...args){return Battle.execute(s,2,command,...args);}

test('全26カード：強化・刻印・双方の使用・致死時を変更前624ケースと比較',()=>{
  for(const sample of baseline){
    const s=state();
    Object.assign(s,{
      playerHp:sample.lethal?1:31,bossHp:sample.lethal?1:37,
      playerGuard:4,bossGuard:6,bossBarrier:7,playerThorns:3,bossThorns:2,
      playerWeak:1,bossWeak:2,playerBlockedPrev:8,bossBlockedPrev:9,
      playerPoison:{turns:2,dmg:6,stacks:2},bossPoison:{turns:2,dmg:6,stacks:2}
    });
    execute(s,'playCard',sample.side,{...sample,key:'test',inherited:false});
    const json=JSON.stringify(s,(key,value)=>['deck','enemyDeck','bossPlan'].includes(key)
      ?undefined:value instanceof Set?[...value]:value);
    assert.equal(createHash('sha256').update(json).digest('hex'),sample.hash,JSON.stringify(sample));
  }
});

test('カード使用：マナ消費、同一ターンの再使用禁止、次ターンの回復',()=>{
  const c=card('slash');const s=state(2,[c]);
  assert.equal(execute(s,'useCard',c.key).result,true);
  assert.equal(s.mana,0);assert.equal(s.bossHp,54);
  assert.equal(execute(s,'useCard',c.key).result,false);
  execute(s,'beginPlayer');
  assert.equal(s.round,2);assert.equal(s.mana,2);assert.equal(s.bossBarrier,7);
  assert.equal(execute(s,'useCard',c.key).result,true);
  assert.equal(s.bossHp,54);assert.equal(s.bossBarrier,2);
});

test('毒コンボ：準備前は使用不可、消費・切り札再使用禁止・再戦リセット',()=>{
  const poison=card('poison'),trump=card('venombloom');
  const s=state(2,[poison,trump]);s.mana=10;
  assert.equal(execute(s,'useCard',trump.key).result,false);
  assert.equal(s.mana,10);
  execute(s,'useCard',poison.key);
  assert.equal(s.bossPoison.stacks,1);
  execute(s,'useCard',trump.key);
  assert.deepEqual(s.bossPoison,{turns:0,dmg:0,stacks:0});
  assert.equal(s.bossHp,37);assert.equal(s.mana,7);
  execute(s,'beginPlayer');
  execute(s,'playCard','player',poison);
  assert.equal(execute(s,'useCard',trump.key).result,false);
  assert.equal(state(2,[trump]).playerOneShots.size,0);
});

test('ボス能力：バリア非蓄積と期限、第三紀の初回不発と累積',()=>{
  const s=state();
  execute(s,'grantBossAbility');execute(s,'grantBossAbility');
  assert.equal(s.bossBarrier,7);
  execute(s,'hit','player',5,'test');assert.equal(s.bossBarrier,2);
  execute(s,'expireBossBarrier');assert.equal(s.bossBarrier,0);
  const third=state(3);
  Battle.execute(third,3,'triggerThirdBossAbility');assert.equal(third.bossAtk,5);
  third.round=2;
  Battle.execute(third,3,'triggerThirdBossAbility');
  third.round=3;Battle.execute(third,3,'triggerThirdBossAbility');
  assert.equal(third.bossAtk,7);
});

test('ターン更新：妨害下限、軽減・弱体の期限、毒の自然消滅',()=>{
  const s=state();
  Object.assign(s,{playerManaPenalty:9,bossManaPenalty:9,playerGuard:8,bossGuard:9,
    playerThorns:3,bossThorns:3,playerWeak:4,bossWeak:4,playerBlockedNow:6,bossBlockedNow:7,
    playerPoison:{turns:1,dmg:3,stacks:1},bossPoison:{turns:1,dmg:4,stacks:1}});
  s.enemyDeck=[card('slash')];s.bossPlan=[s.enemyDeck[0].key];
  assert.deepEqual(execute(s,'prepareEnemy').result,[]);
  assert.equal(s.bossHp,55);assert.equal(s.bossGuard,0);assert.equal(s.bossThorns,0);
  assert.equal(s.playerWeak,0);assert.equal(s.bossBlockedPrev,7);
  execute(s,'beginPlayer');
  assert.equal(s.mana,1);assert.equal(s.playerHp,49);
  assert.equal(s.playerBlockedPrev,6);assert.equal(s.playerGuard,0);
  assert.equal(s.bossWeak,0);assert.equal(s.playerThorns,0);
  assert.equal(s.playerManaPenalty,0);assert.equal(s.bossManaPenalty,0);
  assert.deepEqual(s.playerPoison,{turns:0,dmg:0,stacks:0});
  assert.deepEqual(s.bossPoison,{turns:0,dmg:0,stacks:0});
});

test('致死・反射：結果イベントは1回、勝敗後のコマンドは状態を変更しない',()=>{
  const s=state();s.bossHp=1;
  const out=execute(s,'hit','player',10,'test');
  assert.equal(s.end,'win');
  assert.deepEqual(out.events.filter(e=>e.type==='finish'),[{type:'finish',won:true}]);
  const ended=Battle.snapshot(s);
  assert.deepEqual(execute(s,'beginPlayer').events,[]);
  assert.deepEqual(Battle.snapshot(s),ended);
  const reflect=state();reflect.playerHp=1;reflect.bossGuard=9;reflect.bossThorns=3;
  execute(reflect,'hit','player',5,'test');assert.equal(reflect.end,'lose');
});

test('状態境界：JSON往復で使用回数保持、不変更新と別戦闘の参照分離',()=>{
  const c=card('laststand');const s=state(2,[c]);s.mana=4;
  execute(s,'useCard',c.key);
  const encoded=JSON.parse(JSON.stringify(Battle.snapshot(s)));
  const restored=Battle.restore(encoded);
  assert(restored.played instanceof Set);assert(restored.playerOneShots.has(c.key));
  assert.deepEqual(execute(restored,'useCard',c.key).result,false);
  const before=Battle.snapshot(s);
  const next=Battle.transition(s,2,'beginPlayer');
  assert.deepEqual(Battle.snapshot(s),before);assert.equal(next.state.round,2);
  next.state.deck[0].lv=2;next.state.playerPoison.turns=3;
  assert.equal(s.deck[0].lv,0);assert.equal(s.playerPoison.turns,0);
  c.lv=1;assert.equal(s.deck[0].lv,0);
  assert.throws(()=>Battle.createState({era:4}),RangeError);
  assert.throws(()=>execute(s,'unknown'),RangeError);
});

test('強化：第一紀拒否、通常／刻印の重複拒否、継承除外、第三紀グレード',()=>{
  const c=card('slash');const deck=[c];
  assert.equal(Progression.upgrade(deck,c.key,1),false);
  assert.equal(Progression.upgrade(deck,c.key,2),true);
  assert.equal(c.lv,1);assert.equal(Progression.upgrade(deck,c.key,2,true),false);
  const marked=card('guard');deck.push(marked);
  assert.equal(Progression.upgrade(deck,marked.key,3,true),true);
  assert.equal(marked.lv,2);assert.equal(marked.trait,true);
  assert.equal(Progression.upgrade(deck,marked.key,3),false);
  const legacy=Progression.inheritCard(deck,c.key);
  assert.equal(Progression.upgrade([legacy],legacy.key,3),false);
  assert.equal(Progression.upgrade(deck,'missing',2),false);
});

test('継承：通常デッキと刻印を保持、継承枠・参照共有・再継承を除外',()=>{
  const c=card('poison',{lv:1,trait:true,upgraded:true});
  const legacy=card('slash',{key:'legacy',inherited:true});
  const deck=[c,legacy];const normal=Progression.normalDeck(deck);
  assert.deepEqual(normal,[c]);assert.notEqual(normal[0],c);
  assert.equal(Progression.inheritCard(deck,'legacy'),null);
  const inherited=Progression.inheritCard(deck,c.key);
  assert.equal(inherited.lv,1);assert.equal(inherited.trait,true);
  const next=Battle.createState({era:3,draftCards:[card('spark')],inherited,previousHeroDeck:normal});
  assert.equal(next.deck.length,2);assert.deepEqual(next.enemyDeck,normal);
  next.enemyDeck[0].lv=2;assert.equal(normal[0].lv,1);assert.equal(c.lv,1);
  assert.deepEqual(Progression.options(1,[],legacy,()=>0).includes('slash'),false);
});

test('獲得上限と入れ替え：5枚を超えず、継承カードを置換しない',()=>{
  const deck=['slash','guard','boost','rally'].map(id=>card(id));
  const gained=card('rush');assert.equal(Progression.acquire(deck,gained),true);
  assert.equal(Progression.acquire(deck,card('pierce')),false);assert.equal(deck.length,5);
  assert.equal(Progression.replace(deck,gained.key,card('pierce')),true);
  assert.equal(deck.length,5);assert.equal(deck[4].id,'pierce');
  assert.equal(Progression.replace(deck,'missing',card('rush')),false);
  const legacy=card('slash',{inherited:true,key:'legacy'});
  assert.equal(Progression.replace([legacy],'legacy',card('rush')),false);
});

test('AIの既存評価と計画タイミングを維持し、初期化の乱数を注入できる',()=>{
  const s=state();s.round=2;
  assert.equal(Planner.scoreCard(card('guard'),s),14);
  assert.equal(Planner.scoreCard(card('return'),s),-100);
  s.bossHp-=20;assert.equal(Planner.scoreCard(card('laststand'),s),25);
  s.enemyDeck=[card('return')];s.bossBlockedNow=5;
  execute(s,'commitBossPlan');assert.deepEqual(s.bossPlan,[]);
  assert.deepEqual(execute(s,'prepareEnemy').result,[]);
  assert.equal(s.bossBlockedPrev,5);
  execute(s,'commitBossPlan');assert.deepEqual(s.bossPlan,[s.enemyDeck[0].key]);
  const first=Battle.createState({era:1,random:()=>0.5});
  const repeat=Battle.createState({era:1,random:()=>0.5});
  assert.deepEqual(first.enemyDeck,repeat.enemyDeck);
});
