'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const B=require('../src/game/battle-engine.js'),R=require('../src/game/first-era-rules.js'),Data=require('../src/game/card-data.js'),AI=require('../src/game/boss-planner.js');
const base=['slash','heavy_slash','barrier','first_era_corrosion','first_era_venom_blade'];
const create=deck=>B.createState({ruleset:R.RULESET,playerDeck:deck||base});
const card=(s,id,side=s.active)=>B.execute(s,{type:'card',side,id});
const end=s=>B.execute(s,{type:'endTurn',side:s.active});
const echo=s=>B.execute(s,{type:'ultimate',side:'player'});
const deckWith=id=>[id,...R.pool.filter(x=>x!==id).slice(0,4)];
test('opt-in profile is distinct; exactly five of ten; old catalog and defaults stay separate',()=>{
 const s=create(),old=B.createState({playerDeck:['slash'],bossPresetId:Data.BOSSES[0].id});
 assert.equal(R.pool.length,10);assert.equal(s.schemaVersion,3);assert.equal(s.ruleset,'first-era-v1');assert.equal(s.actors.player.hp,34);assert.equal(s.actors.boss.hp,40);
 for(const a of Object.values(s.actors)){assert.equal(a.mana,3);assert.equal(a.manaCap,3);}assert.deepEqual(s.actors.boss.deck,R.bossDeck);assert.equal(old.schemaVersion,2);assert.equal(old.actors.player.hp,20);assert.equal(old.actors.player.mana,2);
 for(const deck of [[],base.slice(0,4),[...base,'first_aid'],['slash','slash','barrier','heavy_slash','first_aid'],['slash','heavy_slash','barrier','first_aid','great_swing'],['slash','heavy_slash','barrier','corrosion','venom_blade']])assert.throws(()=>create(deck));
 assert.throws(()=>B.createState({ruleset:'unknown'}));assert.throws(()=>B.createState({ruleset:R.RULESET,playerDeck:base,firstSide:'boss'}));
 assert.equal(Data.CARDS.venom_blade.description.includes('その後毒−1'),true);assert.equal(B.getCard(s,'first_era_venom_blade').cost,2);assert.equal(Object.keys(Data.CARDS).length,19);assert.equal(B.availability(s,'player','venom_blade').allowed,false);
});
const specs={slash:[1,0],heavy_slash:[2,0],barrier:[1,1],first_aid:[1,1],battle_spirit:[1,2],setup:[2,1],first_era_corrosion:[1,1],first_era_poison_thrust:[1,1],first_era_venom_blade:[2,1],feint:[1,1]};
for(const [id,[cost,cd]]of Object.entries(specs))test('adopted skill: '+id,()=>{
 const s=create(deckWith(id));s.bossState.broken=true;s.actors.player.hp=30;s.actors.boss.poison=3;
 assert.equal(B.availability(s,'player',id).allowed,true);const out=card(s,id),spec=B.getCard(s,id);assert.equal(out.ok,true);assert.equal(spec.cost,cost);assert.equal(spec.cd,cd);assert.equal(s.actors.player.mana,3-cost);assert.equal(s.actors.player.readyOn[id],s.actors.player.ownTurn+cd+1);assert.equal(B.availability(s,'player',id).code,'used');
 const hit=out.events.find(e=>e.type==='damage');
 if(['slash','heavy_slash','setup','first_era_poison_thrust','first_era_venom_blade','feint'].includes(id))assert.equal(hit.amount,{slash:2,heavy_slash:4,setup:3,first_era_poison_thrust:1,first_era_venom_blade:2,feint:1}[id]);
 if(id==='first_aid')assert.equal(s.actors.player.hp,32);if(id==='barrier')assert.equal(s.actors.player.barrier,3);if(id==='battle_spirit')assert.equal(s.actors.player.attackBonus,3);if(id==='setup')assert.equal(s.actors.player.setupBonus,2);if(id==='feint')assert.equal(s.actors.boss.weak,2);if(id==='first_era_corrosion')assert.equal(s.actors.boss.poison,5);if(id==='first_era_poison_thrust')assert.equal(s.actors.boss.poison,4);if(id==='first_era_venom_blade')assert.equal(s.actors.boss.poison,3);
});
test('poison caps at 8; each target turn ends with min(N,6), then decay, bypassing guard/barrier',()=>{
 const s=create();s.actors.boss.poison=7;const out=card(s,'first_era_corrosion');assert.equal(s.actors.boss.poison,8);assert.equal(out.events.find(e=>e.type==='poisonApplied').amount,1);
 s.active='boss';s.actors.boss.barrier=10;const e=end(s);assert.equal(s.actors.boss.hp,34);assert.equal(s.actors.boss.poison,7);assert.equal(s.actors.boss.barrier,10);assert.equal(s.bossState.gauge,0);assert.equal(e.events.filter(e=>e.kind==='poison').length,1);
 for(const [n,amount]of [[0,0],[1,1],[2,2],[6,6],[8,6]]){const t=create();t.active='boss';t.actors.boss.poison=n;end(t);assert.equal(t.actors.boss.hp,40-amount);assert.equal(t.actors.boss.poison,Math.max(0,n-1));}
});
test('poison kill stops before barrier expiration/next turn; legacy capped4 descending poison unchanged',()=>{
 const s=create();s.active='boss';s.actors.boss.hp=1;s.actors.boss.poison=8;s.actors.player.barrier=3;const out=end(s);assert.equal(s.end,'player');assert.equal(s.endCause,'poison');assert.equal(s.actors.player.barrier,3);assert.equal(out.events.some(e=>e.type==='turn'),false);
 const old=B.createState({playerDeck:['corrosion'],bossPresetId:Data.BOSSES[0].id});old.actors.boss.poison=3;card(old,'corrosion');assert.equal(old.actors.boss.poison,4);end(old);const hp=old.actors.boss.hp;end(old);assert.equal(old.actors.boss.hp,hp-4);assert.equal(old.actors.boss.poison,3);
});
test('thrust HP gate: guard rounding zero, barrier absorbed, success, lethal no extra poison',()=>{
 for(const [guard,barrier,poison]of [[true,0,0],[false,1,0],[false,0,1]]){const s=create(deckWith('first_era_poison_thrust'));s.bossState.broken=!guard;s.actors.boss.barrier=barrier;card(s,'first_era_poison_thrust');assert.equal(s.actors.boss.poison,poison);}
 const s=create(deckWith('first_era_poison_thrust'));s.bossState.broken=true;s.actors.boss.hp=1;card(s,'first_era_poison_thrust');assert.equal(s.end,'player');assert.equal(s.actors.boss.poison,0);
});
test('blade accepts zero poison, floors half, never consumes; one hit applies modifiers and break once',()=>{
 const zero=create();assert.equal(B.availability(zero,'player','first_era_venom_blade').allowed,true);
 const s=create();s.actors.boss.poison=7;s.actors.boss.barrier=1;s.actors.player.attackBonus=3;s.actors.player.weak=2;
 const out=card(s,'first_era_venom_blade'),hit=out.events.filter(e=>e.type==='damage');assert.equal(hit.length,1);assert.equal(hit[0].baseDamage,4);assert.equal(hit[0].rawAmount,5);assert.equal(hit[0].adjustedAmount,1);assert.equal(hit[0].blocked,1);assert.equal(hit[0].amount,0);assert.equal(out.events.filter(e=>e.type==='breakDamage').length,1);assert.equal(s.bossState.broken,true);assert.equal(s.actors.boss.poison,7);assert.equal(s.actors.player.attackBonus,0);assert.equal(s.actors.player.weak,0);assert.deepEqual(s.actors.player.attacks,['first_era_venom_blade']);
});
test('breaking attack stays reduced; next attack is unreduced and cancels flash',()=>{
 const s=create();const first=card(s,'heavy_slash');assert.equal(first.events.find(e=>e.type==='damage').amount,1);assert.equal(s.bossState.broken,true);const next=card(s,'slash');assert.equal(next.events.find(e=>e.type==='damage').amount,2);const out=end(s);assert.equal(s.bossState.stance,'rupture');assert.ok(out.events.some(e=>e.type==='flashPrevented'));assert.equal(s.actors.player.hp,34);
});
test('stance alternates on boss starts; reset clears gauge; rupture floors 1.5 once',()=>{
 const s=create();end(s);assert.equal(s.actors.player.hp,29);assert.equal(s.bossState.stance,'rupture');end(s);const out=card(s,'slash');assert.equal(out.events.find(e=>e.type==='damage').amount,3);end(s);assert.deepEqual(s.bossState,{stance:'steadfast',gauge:0,broken:false});end(s);card(s,'slash');assert.equal(s.bossState.gauge,2);end(s);assert.equal(s.actors.player.hp,24);
});
test('flash follows refill/turn and stance before normal skills; weak and barrier apply, no MP/history/CD cost',()=>{
 const s=create(['feint','barrier','slash','heavy_slash','first_aid']);card(s,'feint');card(s,'barrier');const out=end(s),types=out.events.map(e=>e.type),hit=out.events.find(e=>e.kind==='flash');assert.equal(hit.rawAmount,3);assert.equal(hit.blocked,3);assert.equal(hit.amount,0);assert.equal(s.actors.boss.mana,3);assert.deepEqual(s.actors.boss.attacks,[]);assert.deepEqual(s.actors.boss.used,[]);assert.ok(types.indexOf('turn')<types.indexOf('stanceChanged'));assert.ok(types.indexOf('flashTriggered')<types.indexOf('damage'));assert.equal(s.actors.boss.weak,0);
});
test('exhaustion kills before stance/refill/flash; flash kill stops normal actions',()=>{
 const s=create();s.round=12;s.actors.boss.hp=1;const out=end(s);assert.equal(s.end,'player');assert.equal(s.endCause,'exhaustion');assert.equal(out.events.some(e=>e.type==='flashTriggered'),false);
 const t=create();t.actors.player.hp=5;end(t);assert.equal(t.end,'boss');assert.equal(t.endCause,'flash');assert.deepEqual(B.legalActions(t),[]);assert.equal(card(t,'slash','boss').ok,false);
});
test('replay safety, MP1, used/CD bypass, one use; recalculates after break, not prior damage',()=>{
 const s=create();assert.equal(B.ultimateStatus(s).code,'reference');const before=B.snapshot(s);assert.equal(echo(s).ok,false);assert.deepEqual(s,before);card(s,'heavy_slash');const ready=s.actors.player.readyOn.heavy_slash;assert.equal(s.actors.boss.hp,39);assert.equal(B.ultimateStatus(s).allowed,true);const out=echo(s);assert.equal(s.actors.boss.hp,35);assert.equal(s.actors.player.mana,0);assert.equal(s.actors.player.readyOn.heavy_slash,ready);assert.deepEqual(s.actors.player.used,['heavy_slash']);assert.equal(out.events.find(e=>e.replay).amount,4);assert.equal(echo(s).ok,false);
 const t=create();card(t,'heavy_slash');t.actors.player.mana=0;assert.equal(B.ultimateStatus(t).code,'mana');t.end='boss';assert.equal(B.ultimateStatus(t).code,'ended');assert.equal(echo(t).ok,false);
});
test('replay uses current poison and consumes buff only on the first hit; poison replay adds/caps',()=>{
 const s=create();s.actors.boss.poison=2;card(s,'first_era_venom_blade');s.actors.boss.poison=8;s.bossState.broken=true;const out=echo(s);assert.equal(out.events.find(e=>e.type==='damage').baseDamage,5);assert.equal(s.actors.boss.poison,8);
 const t=create();t.actors.player.attackBonus=3;card(t,'slash');const replay=echo(t);assert.equal(replay.events.find(e=>e.type==='damage').rawAmount,2);
 const u=create();u.actors.boss.poison=7;card(u,'first_era_corrosion');echo(u);assert.equal(u.actors.boss.poison,8);
 const v=create();card(v,'slash');card(v,'barrier');echo(v);assert.equal(v.ultimate.lastSkillId,'barrier');assert.equal(v.actors.player.barrier,6);
});
test('acceleration between source and echo preserves reference; source expires on player end',()=>{
 const s=create();s.actors.player.manaCap=s.actors.player.mana=4;card(s,'slash');B.execute(s,{type:'accelerate',side:'player'});assert.equal(B.ultimateStatus(s).allowed,true);echo(s);assert.equal(s.actors.player.accelerationPending,true);end(s);assert.equal(s.ultimate.lastSkillId,null);end(s);assert.equal(s.actors.player.mana,5);
 const t=create();card(t,'slash');end(t);assert.equal(B.ultimateStatus(t).code,'turn');end(t);assert.equal(B.ultimateStatus(t).code,'reference');
});
test('CD and additive weak/buff/status stacks keep their existing timing and one-hit consumption',()=>{
 const s=create(['feint','battle_spirit','barrier','slash','heavy_slash']);card(s,'feint');echo(s);assert.equal(s.actors.boss.weak,4);end(s);assert.equal(s.actors.boss.weak,0);end(s);assert.equal(B.availability(s,'player','feint').code,'cooldown');end(s);end(s);assert.equal(B.availability(s,'player','feint').allowed,true);
 const t=create(['battle_spirit','slash','heavy_slash','barrier','first_aid']);card(t,'battle_spirit');echo(t);assert.equal(t.actors.player.attackBonus,6);card(t,'slash');assert.equal(t.actors.player.attackBonus,0);
});
test('snapshot/restore and immutable transition preserve new metadata, old schema remains valid',()=>{
 const s=create();card(s,'heavy_slash');const snap=B.snapshot(s),restored=B.restore(snap);assert.deepEqual(restored,s);restored.ultimate.available=false;assert.equal(s.ultimate.available,true);const tr=B.transition(s,{type:'ultimate',side:'player'});assert.equal(tr.ok,true);assert.deepEqual(s,snap);
 for(const mutate of [x=>x.schemaVersion=2,x=>x.actors.player.deck[0]='great_swing',x=>x.actors.boss.poison=9,x=>x.ultimate.lastSkillId='unknown',x=>x.bossState.gauge=5,x=>x.actors.player.readyOn=null,x=>x.actors.player.used=['unknown'],x=>x.actors.player.accelerationPending='yes']){const bad=B.snapshot(s);mutate(bad);assert.throws(()=>B.restore(bad));}
 const old=B.createState({bossPresetId:Data.BOSSES[0].id});assert.deepEqual(B.restore(B.snapshot(old)),old);
});
test('classic scripts work without loading new profile; optional script enables explicit new profile',()=>{
 const context=vm.createContext({});for(const name of ['card-data.js','combat-math.js','card-effects.js','battle-engine.js'])vm.runInContext(fs.readFileSync('src/game/'+name,'utf8'),context);
 assert.equal(context.GameBattle.createState({bossPresetId:'boss_knight_defense'}).actors.player.mana,2);
 const modern=vm.createContext({});for(const name of ['card-data.js','combat-math.js','card-effects.js','first-era-rules.js','battle-engine.js'])vm.runInContext(fs.readFileSync('src/game/'+name,'utf8'),modern);assert.equal(modern.GameBattle.createState({ruleset:R.RULESET,playerDeck:base}).actors.player.hp,34);
});
test('existing AI distinguishes ultimate/acceleration candidate identities and emits legal new-profile actions',()=>{
 const s=create();card(s,'slash');const plan=AI.plan(s,{lookahead:false}),copy=B.snapshot(s);for(const a of plan.actions){assert.equal(B.execute(copy,a).ok,true);}assert.ok(Number.isFinite(plan.nodes));assert.equal(s.ultimate.available,true);
});
test('logic-only representative battle reaches a legal terminal state without UI/research engine',()=>{
 const s=create();let count=0;while(!s.end&&count<250){const plan=AI.plan(B.snapshot(s),{lookahead:s.active==='boss'});for(const a of plan.actions){if(s.end)break;assert.equal(B.execute(s,a).ok,true);count++;}if(!s.end){assert.equal(end(s).ok,true);count++;}}
 assert.ok(s.end==='player'||s.end==='boss');assert.ok(count<250);assert.deepEqual(B.legalActions(s),[]);assert.equal(echo(s).ok,false);
});
