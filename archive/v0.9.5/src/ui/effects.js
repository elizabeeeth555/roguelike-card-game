'use strict';
// Ver.0.9.4: extracted unchanged from Ver.0.9.3.
function clearBattleVisuals(){
 const arena=document.querySelector('.arena');if(arena)arena.classList.remove('player-hurt','boss-hurt');
 const enemy=$('enemyShadow');if(enemy)enemy.classList.remove('shake','attacking');
 const hand=document.querySelector('.hand-panel');if(hand)hand.classList.remove('player-cast');
 const hud=document.querySelector('.player-status');if(hud)hud.classList.remove('player-hit');
 for(const id of ['bossHit','playerHit']){const el=$(id);if(el){el.classList.remove('active');el.textContent='';}}
 const fx=$('attackFx');if(fx)fx.className='attack-fx';
 const toast=$('enemyActionToast');if(toast){toast.textContent='';toast.hidden=true;}
 enemyActiveKey=null;enemyUsedKeys.clear();updateEnemyCardClasses();
}

function applyCardArt(element,id){const src=GAME_ASSETS.cards?.[id];if(src){element.classList.add('has-art');element.style.backgroundImage=`url("${String(src).replaceAll('\"','%22')}")`;element.textContent='';}}

function applyVisualAssets(){const character=(era===1?'guardian':era===2?'era1':'era2');const boss=GAME_ASSETS.characters?.[character]||`assets/characters/${character}.svg`;const player=GAME_ASSETS.characters?.['era'+era]||`assets/characters/era-${era}.svg`;const bossEl=$('bossPortrait'),playerEl=$('playerPortrait');bossEl.style.display='';bossEl.src=boss;bossEl.parentElement.classList.add('has-sprite');playerEl.style.display='';playerEl.src=player;const bg=GAME_ASSETS.background;$('gameLayout').querySelector('.arena').style.setProperty('--battle-art',bg?`url("${String(bg).replaceAll('"','%22')}")`:'none');}

function effectVisual(kind,who){const e=$('attackFx'),arena=document.querySelector('.arena');e.className='attack-fx';void e.offsetWidth;e.classList.add(['attack','counter'].includes(kind)?'slash':['guard'].includes(kind)?'guard':'magic');if(who==='boss'){$('enemyShadow').classList.remove('attacking');void $('enemyShadow').offsetWidth;$('enemyShadow').classList.add('attacking');}else{$('hand').closest('.hand-panel').classList.remove('player-cast');void $('hand').closest('.hand-panel').offsetWidth;$('hand').closest('.hand-panel').classList.add('player-cast');}sound(kind==='guard'?'block':kind==='buff'?'boost':kind==='dot'?'poison':'attack');}

function addLog(msg,type='info'){const list=$('combatLog'),d=document.createElement('div');d.className='log-item '+type;d.textContent=msg;const near=list.scrollHeight-list.clientHeight-list.scrollTop<45;list.appendChild(d);$('logPeek').textContent=msg;if(near)list.scrollTop=list.scrollHeight;}

function announce(msg){$('arenaMessage').textContent=msg;$('handTip').textContent=msg;}

function sound(key){GameAudio.se(key);}

function animateHit(dmg,target){if(target==='boss'){$('bossHit').textContent='−'+dmg;const b=$('bossHit');b.classList.remove('active');void b.offsetWidth;b.classList.add('active');const e=$('enemyShadow');e.classList.remove('shake');void e.offsetWidth;e.classList.add('shake');}else{$('playerHit').textContent='−'+dmg;const p=$('playerHit');p.classList.remove('active');void p.offsetWidth;p.classList.add('active');const hud=$('gameLayout').querySelector('.player-status');hud.classList.remove('player-hit');void hud.offsetWidth;hud.classList.add('player-hit');const arena=$('gameLayout').querySelector('.arena');arena.classList.remove('player-hurt');void arena.offsetWidth;arena.classList.add('player-hurt');}}

function hideTransitions(){
 if(turnTransitionTimer){clearTimeout(turnTransitionTimer);turnTransitionTimer=null;}
 const overlay=$('battleTransition');overlay.hidden=true;overlay.classList.remove('skippable');
 const resolve=transitionResolve;transitionResolve=null;if(resolve)resolve();
}

function turnMessage(label,kind,ms){
 hideTransitions();const overlay=$('battleTransition'),text=$('transitionText');text.textContent=label;overlay.className='battle-transition '+kind;overlay.hidden=false;
 sound(kind==='enemy'?'enemy_turn':kind==='player'?'player_turn':kind==='victory'?'win':kind==='defeat'?'lose':'ui_open');
 const skippable=kind==='enemy'||kind==='player';overlay.classList.toggle('skippable',skippable);
 overlay.style.setProperty('--banner-time',ms+'ms');
 if(!skippable){turnTransitionTimer=setTimeout(hideTransitions,ms);return Promise.resolve();}
 return new Promise(resolve=>{transitionResolve=resolve;turnTransitionTimer=setTimeout(hideTransitions,ms);});
}

function clearEnemyAction(){enemyActiveKey=null;const toast=$('enemyActionToast');if(toast){toast.hidden=true;toast.textContent='';}updateEnemyCardClasses();}
