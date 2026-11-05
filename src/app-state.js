'use strict';
// Browser-owned session. Rule modules only read explicit battle values.
const battleTasks=GameTasks.createScope();
const app={mode:'draft',draftCards:[],draftStep:0,draftOptions:[],battle:null,busy:false,version:0,
  retryPreset:null,fastFx:false,logOpen:false,selectedCard:null,selectedSide:'player',
  enemyActiveKey:null,enemyUsedKeys:new Set(),transitionTimer:null,transitionResolve:null};
const GAME_ASSETS=window.GAME_ASSETS;
