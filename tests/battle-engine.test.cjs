'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Battle=require('../src/game/battle-engine.js'),Data=require('../src/game/card-data.js');
const Planner=require('../src/game/boss-planner.js'),Progression=require('../src/game/progression.js');
const source=require('./fixtures/first-era-cards.json');
function state(deck=['slash'],extra={}){return Battle.createState({playerDeck:deck,bossPresetId:Data.BOSSES[0].id,...extra});}
function play(s,id,side=s.active){return Battle.execute(s,{type:'card',side,id});}
function end(s){return Battle.execute(s,{type:'endTurn',side:s.active});}
function roundTrip(s){end(s);end(s);}

test('19枚のコスト・タグ・説明がパッケージと一致し、CDは正式D案を反映、5ボスで全種を網羅',()=>{
  assert.equal(Object.keys(Data.CARDS).length,19);assert.deepEqual(Data.BOSSES,require('./fixtures/first-era-bosses.json').presets);
  for(const card of source.cards){const current=Data.CARDS[card.id];assert.equal(current.cost,card.cost);assert.equal(current.cd,['barrier','fortress'].includes(card.id)?1:card.cooldown_own_turns);assert.deepEqual(current.tags,card.tags);assert.equal(current.description,card.effect_text);}
  for(const boss of Data.BOSSES){assert.equal(boss.card_ids.length,5);assert.equal(new Set(boss.card_ids).size,5);assert(boss.card_ids.every(id=>Data.CARDS[id]));}
  assert.equal(new Set(Data.BOSSES.flatMap(b=>b.card_ids)).size,19);
});
test('HP20、先攻者2/3・後攻3/3、後攻ボスの自ターン基準と逆先攻も共通',()=>{
  const s=state();assert.equal(s.actors.player.hp,20);assert.equal(s.actors.boss.hp,20);
  assert.equal(s.actors.player.mana,2);assert.equal(s.actors.boss.mana,3);
  end(s);assert.equal(s.actors.boss.ownTurn,1);assert.equal(s.actors.boss.mana,3);
  end(s);assert.equal(s.actors.player.mana,3);assert.equal(s.round,2);
  const reverse=state(['slash'],{firstSide:'boss'});assert.equal(reverse.active,'boss');assert.equal(reverse.actors.boss.mana,2);
  end(reverse);assert.equal(reverse.actors.player.mana,3);
});
test('加速：その場で上限は増えず、次自ターンの補充前に反映・最大5・1回制限',()=>{
  const s=state(),a=s.actors.player;
  assert(Battle.execute(s,{type:'accelerate'}).ok);assert.equal(a.mana,0);assert.equal(a.manaCap,3);
  a.mana=5;assert.equal(Battle.accelerationStatus(s,'player').code,'used');a.mana=0;
  roundTrip(s);assert.equal(a.manaCap,4);assert.equal(a.mana,4);
  Battle.execute(s,{type:'accelerate'});assert.equal(a.mana,2);roundTrip(s);
  assert.equal(a.manaCap,5);assert.equal(a.mana,5);assert.equal(Battle.accelerationStatus(s,'player').code,'cap');
  a.mana=1;roundTrip(s);assert.equal(a.mana,5);
});
test('マナ妨害：重複、最低2、加速後の上限から減算し一度で消費',()=>{
  const s=state(),a=s.actors.player;Battle.execute(s,{type:'accelerate'});a.manaPenalty=1;
  roundTrip(s);assert.equal(a.manaCap,4);assert.equal(a.mana,3);assert.equal(a.manaPenalty,0);
  a.manaPenalty=10;roundTrip(s);assert.equal(a.mana,2);assert.equal(a.manaCap,4);
  roundTrip(s);assert.equal(a.mana,4);
});
for(const [id,damage] of Object.entries({slash:2,heavy_slash:4,great_swing:6,dash_slash:3,follow_up:1,finisher_slash:2,charge:5,feint:1,mana_bind:1,setup:3,curse:1})){
  test(`${id}：固定ダメージとマナ消費`,()=>{const s=state([id]);s.actors.player.mana=5;assert(play(s,id).ok);assert.equal(s.actors.boss.hp,20-damage);assert.equal(s.actors.player.mana,5-Data.CARDS[id].cost);});
}
test('結界3・堅守5：合算・吸収・相手ターン終了時に消滅（無攻撃でも）',()=>{
  const s=state(['barrier','fortress']);s.actors.player.mana=5;
  play(s,'barrier');play(s,'fortress');assert.equal(s.actors.player.barrier,8);
  end(s);play(s,'heavy_slash');assert.equal(s.actors.player.hp,20);assert.equal(s.actors.player.barrier,4);
  end(s);assert.equal(s.actors.player.barrier,0);
  const t=state(['barrier']);play(t,'barrier');roundTrip(t);assert.equal(t.actors.player.barrier,0);
  const u=state(['charge']);u.actors.boss.barrier=3;play(u,'charge');assert.equal(u.actors.boss.hp,18);assert.equal(u.actors.boss.barrier,0);
});
test('手当：2回復、最大HP20、満タン使用もCDを設定',()=>{
  const s=state(['first_aid']);s.actors.player.hp=19;play(s,'first_aid');assert.equal(s.actors.player.hp,20);
  const t=state(['first_aid']);play(t,'first_aid');assert.equal(t.actors.player.hp,20);assert(t.actors.player.used.includes('first_aid'));
});
for(const id of ['slash','first_aid','battle_spirit']){
  test(`${id}：CD${Data.CARDS[id].cd}は自ターンのみで進み、同ターン再使用不可`,()=>{
    const s=state([id]);play(s,id);const cd=Data.CARDS[id].cd;
    assert.equal(Battle.availability(s,'player',id).code,'used');end(s);
    assert.equal(s.actors.player.ownTurn,1);end(s);
    for(let i=0;i<cd;i++){assert.equal(Battle.availability(s,'player',id).code,'cooldown');roundTrip(s);}
    assert(Battle.availability(s,'player',id).allowed);
  });
}
test('攻撃順：疾走斬→追撃、補助は攻撃に数えず、0ダメージも攻撃に数える',()=>{
  const s=state(['dash_slash','follow_up']);play(s,'dash_slash');play(s,'follow_up');assert.equal(s.actors.boss.hp,14);
  const t=state(['feint','dash_slash','follow_up']);t.actors.player.mana=5;t.actors.player.weak=10;
  play(t,'feint');play(t,'dash_slash');play(t,'follow_up');assert.equal(t.actors.boss.hp,16);assert.equal(t.actors.player.attacks.length,3);
  const u=state(['corrosion','dash_slash']);play(u,'corrosion');play(u,'dash_slash');assert.equal(u.actors.boss.hp,17);
});
test('切り込み：使用前の敵HP11なら2、HP10なら4',()=>{
  for(const [hp,damage] of [[11,2],[10,4]]){const s=state(['finisher_slash']);s.actors.boss.hp=hp;play(s,'finisher_slash');assert.equal(s.actors.boss.hp,hp-damage);}
});
test('毒付与は即時ダメージなし・上限4、本人終了時3→2→1、バリアを無視',()=>{
  const s=state(['corrosion','plague']);s.actors.player.mana=5;play(s,'corrosion');assert.equal(s.actors.boss.hp,20);play(s,'plague');assert.equal(s.actors.boss.poison,4);
  const t=state();t.actors.player.poison=3;t.actors.player.barrier=10;
  end(t);assert.equal(t.actors.player.hp,17);assert.equal(t.actors.player.poison,2);assert.equal(t.actors.player.barrier,10);
  end(t);end(t);assert.equal(t.actors.player.hp,15);end(t);end(t);assert.equal(t.actors.player.hp,14);assert.equal(t.actors.player.poison,0);
});
for(const [id,damage] of [['venom_blade',6],['heart_corrosion',2]]){
  test(`${id}：毒条件、使用前参照、毒消費、バリアで防御`,()=>{
    const s=state([id]);const before=Battle.snapshot(s);assert(!play(s,id).ok);assert.deepEqual(s,before);
    s.actors.boss.poison=2;s.actors.boss.barrier=1;play(s,id);
    assert.equal(s.actors.boss.hp,21-damage);assert.equal(s.actors.boss.poison,1);
  });
}
test('同ターン腐蝕→毒刃が合法、毒0の呪詛は弱体を付けず、毒ありなら付与',()=>{
  const s=state(['corrosion','venom_blade']);s.actors.player.mana=3;play(s,'corrosion');assert(play(s,'venom_blade').ok);assert.equal(s.actors.boss.hp,14);
  const t=state(['curse']);play(t,'curse');assert.equal(t.actors.boss.weak,0);
  const u=state(['curse']);u.actors.boss.poison=1;play(u,'curse');assert.equal(u.actors.boss.weak,2);
});
test('弱体重複・攻撃まで持越し・0ダメージでも一括消費、戦意＋布石＋弱体の計算順',()=>{
  const s=state(['feint','curse']);s.actors.boss.poison=1;play(s,'feint');play(s,'curse');assert.equal(s.actors.boss.weak,4);
  end(s);end(s);end(s);assert.equal(s.actors.boss.weak,4);play(s,'slash','boss');assert.equal(s.actors.boss.weak,0);assert.equal(s.actors.player.hp,20);
  const t=state(['battle_spirit','slash']);t.actors.player.attackBonus=2;t.actors.player.weak=4;t.actors.boss.barrier=1;
  play(t,'battle_spirit');play(t,'slash');assert.equal(t.actors.boss.hp,18);assert.equal(t.actors.player.attackBonus,0);
});
test('布石は次自ターンのみ＋2、戦意は当ターンのみ、未使用で終了すると失効',()=>{
  const s=state(['setup','slash']);s.actors.player.mana=5;play(s,'setup');assert.equal(s.actors.player.setupBonus,2);play(s,'slash');assert.equal(s.actors.boss.hp,15);
  roundTrip(s);assert.equal(s.actors.player.attackBonus,2);roundTrip(s);assert.equal(s.actors.player.attackBonus,0);
  const t=state(['battle_spirit']);play(t,'battle_spirit');assert.equal(t.actors.player.attackBonus,3);roundTrip(t);assert.equal(t.actors.player.attackBonus,0);
});
test('直接攻撃・終了毒で即決着、後続効果・ターン・二重入力を停止',()=>{
  const s=state(['feint']);s.actors.boss.hp=1;const out=play(s,'feint');assert.equal(s.end,'player');assert.equal(s.actors.boss.weak,0);assert.equal(out.events.at(-1).type,'finish');
  const before=Battle.snapshot(s);assert(!end(s).ok);assert.deepEqual(s,before);
  const t=state();t.actors.player.poison=3;t.actors.player.hp=3;t.actors.boss.barrier=5;end(t);assert.equal(t.end,'boss');assert.equal(t.active,'player');assert.equal(t.actors.boss.barrier,5);
});
test('不変更新・JSON往復はCD/予約/状態を保持、旧スナップショット拒否',()=>{
  const s=state(['battle_spirit']);const next=Battle.transition(s,{type:'card',id:'battle_spirit'});assert.equal(s.actors.player.attackBonus,0);assert.equal(next.state.actors.player.attackBonus,3);
  assert.deepEqual(Battle.restore(JSON.parse(JSON.stringify(next.state))),next.state);assert.throws(()=>Battle.restore({schemaVersion:1}),TypeError);
});
test('3回獲得で5枚、全19種のみ、候補内・所持・直接追加・継承IDの重複を拒否',()=>{
  const deck=Progression.starter('rush');for(let i=0;i<3;i++){const options=Progression.options(deck,()=>.5);assert.equal(new Set(options).size,3);assert(!options.some(id=>deck.includes(id)));assert(Progression.acquire(deck,options[0]));}
  assert.equal(deck.length,5);assert(!Progression.acquire(deck,'slash'));assert(!Progression.acquire([], 'unknown'));assert(!Progression.acquire([], 'slash','slash'));
});
test('ボスAI：合法な順序付きコンボで撃破、再現可能で入力を変更しない',()=>{
  const s=state();end(s);Object.assign(s.actors.boss,{deck:['dash_slash','follow_up','barrier','first_aid','slash'],mana:3});s.actors.player.hp=6;
  const before=Battle.snapshot(s),plan=Planner.plan(s);assert.deepEqual(s,before);assert.deepEqual(Planner.plan(s),plan);
  const copy=Battle.restore(s);for(const action of plan.actions)assert(Battle.execute(copy,action).ok);assert.equal(copy.end,'boss');
});
test('ボスAI：毒付与→毒刃と戦意→攻撃、加速する状態としない状態',()=>{
  for(const deck of [['corrosion','venom_blade'],['battle_spirit','charge']]){
    const s=state();end(s);s.actors.boss.deck=deck;s.actors.player.hp=6;s.actors.boss.mana=3;
    const plan=Planner.plan(s),copy=Battle.restore(s);for(const a of plan.actions)Battle.execute(copy,a);assert.equal(copy.end,'boss');
  }
  const s=state();end(s);s.actors.boss.deck=['great_swing'];s.actors.player.deck=['first_aid'];
  s.actors.boss.readyOn.great_swing=2;
  assert(Planner.plan(s).actions.some(a=>a.type==='accelerate'));
  delete s.actors.boss.readyOn.great_swing;
  s.actors.player.hp=6;assert(!Planner.plan(s).actions.some(a=>a.type==='accelerate'));
});
test('ボスAI：目前の敗北をバリアで回避、全5プリセットで合法な対戦を継続',()=>{
  const s=state(['great_swing']);end(s);s.actors.boss.deck=['barrier','fortress','first_aid','slash','heavy_slash'];s.actors.boss.hp=4;
  const plan=Planner.plan(s),copy=Battle.restore(s);for(const a of plan.actions)Battle.execute(copy,a);end(copy);
  play(copy,'great_swing');assert.notEqual(copy.end,'player');
  for(const preset of Data.BOSSES){const t=state(['corrosion','venom_blade','slash','barrier','first_aid'],{bossPresetId:preset.id});
    for(let i=0;i<16&&!t.end;i++){const p=Planner.plan(t,{lookahead:false});for(const a of p.actions)assert(Battle.execute(t,a).ok);if(!t.end)end(t);}
    for(const actor of Object.values(t.actors)){assert(actor.hp>=0&&actor.hp<=20);assert(actor.mana>=0&&actor.mana<=actor.manaCap);assert(actor.poison>=0&&actor.poison<=4);}
  }
});
