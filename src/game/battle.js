'use strict';
// Ver.0.9.4: extracted unchanged from Ver.0.9.3.
function initBattle(){version++;clearBattleVisuals();window.scrollTo(0,0);mode='battle';busy=false;enemyTurnActive=false;enemyActiveKey=null;enemyUsedKeys.clear();state={round:1,deck:[...draftCards.map(clone),...(era===2&&inherited?[clone(inherited)]:[])],enemyDeck:era===1?['slash','boost','guard','pierce'].map(id=>newCard(id)):previousHeroDeck.map(clone),playerHp:era===1?RULES.firstHp:RULES.secondHp,maxPlayerHp:era===1?RULES.firstHp:RULES.secondHp,bossHp:era===1?RULES.firstBossHp:RULES.secondBossHp,maxBossHp:era===1?RULES.firstBossHp:RULES.secondBossHp,playerAtk:5,bossAtk:5,mana:1,playerManaPenalty:0,bossManaPenalty:0,playerGuard:0,bossGuard:0,playerThorns:0,bossThorns:0,playerPoison:{turns:0,dmg:0,stacks:0},bossPoison:{turns:0,dmg:0,stacks:0},playerWeak:0,bossWeak:0,playerBlockedNow:0,playerBlockedPrev:0,bossBlockedNow:0,bossBlockedPrev:0,played:new Set(),playerOneShots:new Set(),bossOneShots:new Set(),bossPlan:[],end:null};
 $('draftStage').hidden=true;$('gameLayout').hidden=false;$('resultOverlay').hidden=true;GameAudio.setScene('battle');sound('battle_start');
 $('bossName').textContent=era===1?'灰の騎士':'先代の英雄';$('regionLabel').textContent=era===1?'忘却の聖堂':'継承の聖堂';$('combatLog').replaceChildren();
 displayEnemyDeck();
 commitBossPlan();addLog(`ROUND 1：使用可能マナ1。戦闘開始！`,'turn');announce('カードを使うか、ターン終了を選択');setHeader();applyVisualAssets();render();
}
// 戦闘の切り替え時はCSSアニメーションの状態も初期化する。前の一撃が次のボスに残るのを防ぐ。

function other(who){return who==='player'?'boss':'player';}

function hpGet(who){return who==='player'?'playerHp':'bossHp';}

function atkGet(who){return who==='player'?'playerAtk':'bossAtk';}

function heal(who,n,label){
 const hpKey=hpGet(who),maximum=state[who==='player'?'maxPlayerHp':'maxBossHp'];
 const result=GameMath.resolveHeal(state[hpKey],maximum,n);
 state[hpKey]=result.nextHp;
 if(result.healed>0)sound('heal');
 addLog(`${who==='player'?'あなた':'敵'}：${label}でHP+${result.healed}`,who==='player'?'hero':'enemy');
}
function hit(who,base,label,ignoreGuard=false,reflect=false,ignoreWeak=false,chargeReturn=true,guardPierce=0){
 if(state.end)return 0;
 const target=other(who),key=`${target}Guard`;
 const result=GameMath.resolveDamage({base,weak:state[`${who}Weak`],guard:state[key],ignoreGuard,ignoreWeak,guardPierce});
 const block=result.blocked,dmg=result.damage;
 state[key]=result.nextGuard;
 if(chargeReturn&&!reflect)state[`${target}BlockedNow`]+=block;
 state[hpGet(target)]=Math.max(0,state[hpGet(target)]-dmg);
 addLog(`${who==='player'?'あなた':'敵'}の${label}：${dmg}ダメージ${block?`（${block}軽減）`:''}`,who==='player'?'hero':'enemy');
 if(dmg>0){animateHit(dmg,target);sound(dmg>=22?'heavy_hit':'hit');}else if(block)sound('block');
 if(state[hpGet(target)]===0){finish(who==='player');return dmg;}
 if(block>0&&!reflect&&state[`${target}Thorns`]>0)hit(target,state[`${target}Thorns`],'反射',false,true,false,false);
 return dmg;
}

function playCard(who,c){if(state.end)return;const lib=LIB[c.id],lv=c.lv||0,t=!!c.trait,a=state[atkGet(who)],opp=other(who),prefix=who==='player'?'あなた':'敵';effectVisual(lib.family,who);if(lib.oneShot)sound('one_shot');else if(c.id==='return')sound('counter');else if(c.id==='seal')sound('seal');else if(c.id==='pierce')sound('pierce');else if(c.id==='flurry')sound('flurry');addLog(`${prefix}：${nameOf(c)}を使用${c.inherited?'【継承】':''}`,who==='player'?'hero':'enemy');
 switch(c.id){
 case 'slash':hit(who,a+lv*2,'斬撃');if(t&&!state.end)hit(who,Math.ceil((a+lv*2)/2),'追撃');break;
 case 'boost':state[atkGet(who)]+=2+lv;if(t)state[`${who}Guard`]+=4;addLog(`${prefix}の攻撃力+${2+lv}`);break;
 case 'guard':state[`${who}Guard`]+=6+2*lv;if(t)state[`${who}Thorns`]=3+lv;break;
 case 'return':hit(who,a+Math.min(12,state[`${who}BlockedPrev`])*(2+lv+(t?1:0))+(t?2:0),'返礼',false,false,false,false,.5);break;
 case 'pierce':hit(who,a+2+lv*3+(t?5:0),'穿撃',true);break;
 case 'rally':state[atkGet(who)]+=1+lv;heal(who,2+lv,'奮起');if(t)state[`${who}Guard`]+=4;break;
 case 'rush':hit(who,2+lv*2+(t?5:0),'速攻');break;
 case 'siphon':hit(who,a+lv*2,'吸命');if(!state.end)heal(who,3+lv+(t?3:0),'吸命');break;
 case 'flurry':for(let i=0;i<(t?3:2)&&!state.end;i++)hit(who,a+lv,`連牙 ${i+1}撃目`);break;
 case 'seal':state[`${opp}ManaPenalty`]+=2+lv; if(t)hit(who,2,'封魔の余波');break;
 case 'poison':hit(who,2+lv,'腐蝕');if(!state.end){const p=state[`${opp}Poison`];Object.assign(p,GameMath.applyPoison(p,3+lv,t?3:2));addLog(`${prefix}：毒${p.stacks}層（毎回${p.dmg}ダメージ）`);sound('poison');}break;
 case 'thorns':state[`${who}Guard`]+=6+2*lv;state[`${who}Thorns`]=3+lv+(t?3:0);break;
 case 'leech':hit(who,a+lv*2+(t?5:0),'血吸');if(!state.end)heal(who,3+lv,'血吸');break;
 case 'burst':hit(who,2*a+3*lv+(t?8:0),'破砕');break;
 case 'fortify':state[atkGet(who)]+=1+(t?1:0)+lv;state[`${who}Guard`]+=4+lv*2;break;
 case 'hex':state[`${opp}Weak`]=Math.max(state[`${opp}Weak`],2+lv);if(t)state[`${who}Guard`]+=4;break;
 case 'laststand':{const missing=Math.max(0,state[who==='player'?'maxPlayerHp':'maxBossHp']-state[hpGet(who)]);hit(who,a+Math.floor(missing*(t?.6:.4))+lv*3,'逆境の一撃');break;}
 case 'venombloom':{const poison=state[`${opp}Poison`];if(poison.turns<=0)break;const power=a+(poison.stacks||1)*(t?13:9)+poison.turns*3+lv*3;state[`${opp}Poison`]={turns:0,dmg:0,stacks:0};addLog(`${prefix}：敵の毒を消費して劇毒開花！`,who==='player'?'hero':'enemy');hit(who,power,'劇毒開花');break;}
 }
}

function canPlay(c,who){return GameMath.canPlayCard(c,who,state,LIB);}

function useCard(key){if(mode!=='battle'||!state||busy||state.end)return;const c=state.deck.find(x=>x.key===key);if(!c||state.played.has(key)||LIB[c.id].cost>state.mana||!canPlay(c,'player'))return;state.mana-=LIB[c.id].cost;state.played.add(key);if(LIB[c.id].oneShot)state.playerOneShots.add(key);playCard('player',c);render();}

function aiScore(c){let s={slash:14,boost:18,guard:9,return:18,pierce:13,rally:15,rush:17,siphon:13,flurry:17,seal:15,poison:18,thorns:10,leech:13,burst:16,fortify:15,hex:13}[c.id]||10;
 if(c.id==='boost'&&state.round>=5)s-=6;if(['guard','thorns'].includes(c.id)&&state.round%2===0)s+=5;if(c.id==='return'&&state.bossBlockedPrev===0&&!c.trait)s=-100;
 if(c.id==='seal'&&state.round>=5)s-=5;
 if(c.id==='laststand')s=16+Math.max(0,state.maxBossHp-state.bossHp)*.45;if(c.id==='venombloom')s=state.playerPoison.turns>0?28:0;
 return s+(c.lv||0)*.6+(c.trait?2:0);
}

function commitBossPlan(){
 state.bossPlan=GamePlanner.chooseCards(state.enemyDeck,state.round,aiScore,c=>LIB[c.id].cost,c=>canPlay(c,'boss'));
}

const sleep=t=>new Promise(r=>setTimeout(r,t));

async function endTurn(){
 if(mode!=='battle'||!state||state.end||busy)return;
 busy=true;enemyTurnActive=true;enemyUsedKeys.clear();enemyActiveKey=null;updateEnemyCardClasses();const myVersion=version;render();turnMessage('ENEMY TURN','enemy',fastFx?430:850);await sleep(fastFx?430:850);if(myVersion!==version||state.end)return;
 // 守りの有効期限と、返礼の前ターン軽減量は従来どおり。
 state.playerWeak=0;state.bossBlockedPrev=state.bossBlockedNow;state.bossBlockedNow=0;state.bossGuard=0;state.bossThorns=0;
 let mana=Math.max(0,state.round-state.bossManaPenalty);const actions=[];
 for(const key of state.bossPlan){const c=state.enemyDeck.find(x=>x.key===key);
  if(c&&LIB[c.id].cost<=mana&&canPlay(c,'boss')){actions.push(c);mana-=LIB[c.id].cost;}}
 addLog(`敵のターン：${actions.length}枚使用${state.bossManaPenalty?`（封魔 −${state.bossManaPenalty}マナ）`:''}`,'turn');
 if(state.bossPoison.turns>0){state.bossPoison.turns--;sound('poison_tick');hit('player',state.bossPoison.dmg,'毒',false,false,true);if(state.bossPoison.turns<=0)state.bossPoison={turns:0,dmg:0,stacks:0};render();}
 if(state.end){enemyTurnActive=false;busy=false;clearEnemyAction();render();return;}
 for(const c of actions){
  if(version!==myVersion||state.end)break;
  // 毎回カードを発光→テロップを表示→効果を発動→2秒間保持→消灯。
  enemyActiveKey=c.key;updateEnemyCardClasses();
  const toast=$('enemyActionToast');toast.textContent=`敵が「${nameOf(c)}」を使用！`;toast.hidden=false;
  announce(`敵が「${nameOf(c)}」を使用！`);
  await sleep(fastFx?110:250);if(version!==myVersion)return;
  if(!canPlay(c,'boss')){clearEnemyAction();continue;}
  if(LIB[c.id].oneShot)state.bossOneShots.add(c.key);
  playCard('boss',c);enemyUsedKeys.add(c.key);render();
  await sleep(fastFx?390:ENEMY_ACTION_DURATION-250);if(version!==myVersion)return;
  clearEnemyAction();
  if(state.end)break;
  await sleep(fastFx?70:140);if(version!==myVersion)return;
 }
 if(version!==myVersion)return;
 clearEnemyAction();enemyUsedKeys.clear();
 if(state.end){enemyTurnActive=false;busy=false;render();return;}
 state.bossWeak=0;state.playerBlockedPrev=state.playerBlockedNow;state.playerBlockedNow=0;state.playerGuard=0;state.playerThorns=0;
 state.round++;state.mana=Math.max(1,state.round-state.playerManaPenalty);state.playerManaPenalty=0;state.bossManaPenalty=0;state.played.clear();
 if(state.playerPoison.turns>0){state.playerPoison.turns--;sound('poison_tick');hit('boss',state.playerPoison.dmg,'毒',false,false,true);if(state.playerPoison.turns<=0)state.playerPoison={turns:0,dmg:0,stacks:0};if(state.end){busy=false;render();return;}}
 commitBossPlan();enemyTurnActive=false;addLog(`ROUND ${state.round}：マナ${state.mana}で開始`,'turn');announce('次の行動を選択してください');render();turnMessage('YOUR TURN','player',fastFx?390:780);await sleep(fastFx?390:780);if(myVersion!==version||state.end)return;busy=false;render();
}

function finish(won){if(!state||state.end)return;
 const myVersion=version;enemyTurnActive=false;enemyActiveKey=null;clearEnemyAction();state.end=won?'win':'lose';busy=true;
 render();
 // Show hit animation and HP reaching zero before displaying the result.
 setTimeout(()=>{if(myVersion!==version||!state)return;turnMessage(won?'VICTORY':'DEFEAT',won?'victory':'defeat',fastFx?650:1400);GameAudio.stop(350);},fastFx?220:580);
 setTimeout(()=>{if(myVersion!==version||!state)return;hideTransitions();busy=false;showResult(won);},fastFx?1100:2450);
}

function showResult(won){const panel=$('resultOverlay'),dlg=panel.querySelector('.end-dialog');dlg.classList.toggle('lose',!won);panel.hidden=false;$('resultKicker').textContent=won?'VICTORY / 時代の継承':'DEFEAT / 挑戦は続く';$('resultTitle').textContent=won?'勝利':'敗北';$('resultRound').textContent=`ROUND ${state.round}`;$('resultHp').textContent=`残りHP ${state.playerHp}`;$('resultNote').textContent='Phase 3試作：道中の強化・カード数・性能は仮ルール。';$('inheritChoices').hidden=true;$('nextGenerationButton').hidden=true;$('restartButton').hidden=false;
 if(won&&era===1){$('resultTitle').textContent='第一紀を突破';$('resultText').textContent='いま組んだデッキから、次の英雄に託す1枚を選ぼう。';$('inheritChoices').hidden=false;$('nextGenerationButton').hidden=false;$('nextGenerationButton').disabled=true;$('restartButton').hidden=true;const choices=$('inheritChoices');choices.replaceChildren();const snapshot=state.deck.filter(c=>!c.inherited).map(clone);previousHeroDeck=snapshot.map(clone);for(const c of snapshot){const b=document.createElement('button');b.className='inherit-option';b.type='button';b.textContent=`${LIB[c.id].icon} ${nameOf(c)}（コスト${LIB[c.id].cost}）`;b.addEventListener('click',()=>{inherited={...clone(c),inherited:true,key:'legacy'};for(const x of choices.children)x.classList.remove('chosen');b.classList.add('chosen');$('nextGenerationButton').disabled=false;sound('legacy_pick');$('resultText').textContent=`${nameOf(c)}を次の英雄へ。前の英雄は今回の通常デッキ全体を使用する。`;});choices.append(b);}$('nextGenerationButton').textContent='継承して第二紀の道中へ →';
 }else if(won){$('resultText').textContent='自分が育てた先代の英雄を乗り越えた！ 2世代のテストはここまで。';$('resultKicker').textContent='PHASE 3 COMPLETE';$('restartButton').textContent='第一紀からもう一度';}else{$('resultText').textContent='このデッキのまま再戦できる。道中から組み直す場合は右上の「最初から」。';$('restartButton').textContent='この戦闘を再戦';}
 addLog(won?'敵を倒した！':'英雄は倒れた……',won?'hero':'enemy');
}

function goNext(){if(era!==1||!inherited||!state||state.end!=='win')return;sound('stage_transition');era=2;startEra();}
