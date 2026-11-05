'use strict';
// Single source of mutable runtime state. No gameplay rules live here.
// Ver.0.9.4 — internal organization only; inherited from Ver.0.9.3.

const $=id=>document.getElementById(id);


let era=1, mode='draft',draftIndex=-1,draftKind='starter', draftCards=[], inherited=null,previousHeroDeck=null,playedDeck=[],state=null,busy=false,version=0,selectedDraftKey=null,pendingCardId=null,turnTransitionTimer=null;
let enemyTurnActive=false, enemyActiveKey=null, enemyUsedKeys=new Set(), logOpen=false,fastFx=false,transitionResolve=null;
const ENEMY_ACTION_DURATION=2000; // 通常演出の表示時間。ゲームルールとは切り離して調整する。
const GAME_ASSETS=window.GAME_ASSETS||{characters:{guardian:'assets/characters/guardian.svg',era1:'assets/characters/era-1.svg',era2:'assets/characters/era-2.svg',era3:'assets/characters/era-3.svg'},background:'assets/backgrounds/arena.svg',sounds:{}};
