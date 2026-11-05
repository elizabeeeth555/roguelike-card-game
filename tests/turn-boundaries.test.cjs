'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Battle=require('../src/game/battle-engine.js');
const create=deck=>Battle.createState({playerDeck:deck,bossPresetId:'boss_knight_defense'});
const end=s=>Battle.execute(s,{type:'endTurn'});
test('後攻のCDは自ターンのみで進み、封脈は相手の次の補充だけ妨害',()=>{
  const s=create(['mana_bind']);Battle.execute(s,{type:'card',id:'mana_bind'});
  assert.equal(s.actors.boss.manaPenalty,1);end(s);
  assert.equal(s.actors.boss.mana,2);assert.equal(s.actors.boss.manaCap,3);assert.equal(s.actors.boss.manaPenalty,0);
  s.actors.boss.deck=['charge'];Battle.execute(s,{type:'card',id:'charge'});assert.equal(s.actors.boss.readyOn.charge,3);
  end(s);assert.equal(s.actors.boss.ownTurn,1);end(s);assert.equal(s.actors.boss.ownTurn,2);
  assert.equal(s.actors.boss.mana,3);assert.equal(Battle.availability(s,'boss','charge').code,'cooldown');
  end(s);end(s);assert(Battle.availability(s,'boss','charge').allowed);
});
test('毒数1〜4の参照・加算境界、バリアで全軽減しても毒を消費',()=>{
  for(const count of [1,2,3,4]){
    const s=create(['venom_blade']);s.actors.boss.poison=count;s.actors.boss.barrier=20;
    const out=Battle.execute(s,{type:'card',id:'venom_blade'});
    assert.equal(s.actors.boss.hp,20);assert.equal(s.actors.boss.poison,count-1);
    assert.equal(out.events.find(e=>e.type==='damage').blocked,2+Math.min(4,count*2));
    const t=create(['corrosion']);t.actors.boss.poison=count;Battle.execute(t,{type:'card',id:'corrosion'});
    assert.equal(t.actors.boss.poison,Math.min(4,count+2));
  }
  const lethal=create(['venom_blade']);lethal.actors.boss.poison=2;lethal.actors.boss.hp=1;
  const out=Battle.execute(lethal,{type:'card',id:'venom_blade'});
  assert.equal(lethal.end,'player');assert.equal(lethal.actors.boss.poison,1);assert.equal(out.events.at(-1).type,'finish');
});
