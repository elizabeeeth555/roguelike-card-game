'use strict';
// Presentation only. No timers here participate in the combat reducer or action lock.
const combatFxNodes=new Set();
function clearCombatFx(){
 for(const node of combatFxNodes){if(node.remove)node.remove();else node.hidden=true;}
 combatFxNodes.clear();
 $('sceneShell').classList.remove('camera-medium','camera-heavy');
 for(const id of ['bossPortrait','heroFace'])$(id).classList.remove('impact-small','impact-medium','impact-heavy','impact-light');
}
function setupCombatFx(){
 try{app.fxMode=localStorage.getItem('first-era-fx')==='light'?'light':'standard';}catch{}
 const button=$('fxModeButton'),label=$('fxModeLabel');
 const update=()=>{label.textContent=app.fxMode==='light'?'軽量':'標準';button.setAttribute('aria-pressed',String(app.fxMode==='light'));};
 button.addEventListener('click',()=>{app.fxMode=app.fxMode==='light'?'standard':'light';clearCombatFx();try{localStorage.setItem('first-era-fx',app.fxMode);}catch{}update();});update();
}
function combatFx(kind,side,amount=1){
 if(app.mode!=='battle')return;
 const light=app.fxMode==='light'||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const limit=light?10:24;
 while(combatFxNodes.size>=limit){const oldest=combatFxNodes.values().next().value;if(oldest.remove)oldest.remove();else oldest.hidden=true;combatFxNodes.delete(oldest);}
 const node=document.createElement('div');node.className=`combat-fx fx-${kind}${light?' fx-light':''}`;
 node.setAttribute('aria-hidden','true');node.dataset.side=side;
 const tier=amount>=5?3:amount>=3?2:1;node.dataset.tier=String(tier);
 const arena=$('arena'),r=arena.getBoundingClientRect(),anchor=$(side==='boss'?'enemyShadow':'playerHpTrack').getBoundingClientRect();
 const x=Math.max(35,Math.min(r.width-35,anchor.left+anchor.width/2-r.left));
 const y=Math.max(45,Math.min(r.height-45,side==='boss'?anchor.top+anchor.height*.36-r.top:anchor.top+anchor.height/2-r.top));
 node.style.setProperty('--fx-x',x+'px');node.style.setProperty('--fx-y',y+'px');node.style.setProperty('--fx-size',(kind==='finish'?300:kind==='poison-tick'?95:95+tier*35)+'px');
 node.style.setProperty('--fx-time',(kind==='finish'?800:kind==='poison-tick'?300:tier===3?760:480)+'ms');
 const count=light?2:6;
 for(let i=0;i<count;i++){const p=document.createElement('i');p.style.setProperty('--angle',(i*360/count+15)+'deg');p.style.setProperty('--delay',(i*12)+'ms');node.append(p);}
 $('combatFxLayer').append(node);combatFxNodes.add(node);
 battleTasks.schedule(()=>{if(node.remove)node.remove();else node.hidden=true;combatFxNodes.delete(node);},900);
}
function impactCharacter(side,amount){
 const node=$(side==='boss'?'bossPortrait':'heroFace'),tier=amount>=5?'heavy':amount>=3?'medium':'small';
 const light=app.fxMode==='light'||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 node.classList.remove('impact-small','impact-medium','impact-heavy','impact-light');void node.offsetWidth;
 if(!light&&tier!=='small'){
  const scene=$('sceneShell');scene.classList.remove('camera-medium','camera-heavy');void scene.offsetWidth;scene.classList.add('camera-'+tier);
  const token=String(Number(scene.dataset.cameraToken||0)+1);scene.dataset.cameraToken=token;
  battleTasks.schedule(()=>{if(scene.dataset.cameraToken===token)scene.classList.remove('camera-medium','camera-heavy');},420);
 }
 node.classList.add(light?'impact-light':'impact-'+tier);const token=String(Number(node.dataset.impactToken||0)+1);node.dataset.impactToken=token;
 battleTasks.schedule(()=>{if(node.dataset.impactToken===token)node.classList.remove('impact-small','impact-medium','impact-heavy','impact-light');},420);
}
function presentEffectResults(events,context){
 const hp={...context.hp};let card=null;
 for(const event of events){
  if(event.type==='card'){
   card=GameData.CARDS[event.id];const tags=card.tags;
   if(!tags.includes('attack')){
    const family=tags.includes('defense')?'ward':tags.includes('heal')?'heal':tags.includes('poison')?'poison':tags.includes('debuff')?'curse':'buff';
    const target=['poison','curse'].includes(family)?GameBattle.other(event.side):event.side;
    if(family!=='heal'){combatFx(family,target);sound('fx_'+family);}
   }
  }else if(event.type==='damage'){
   const actual=Math.min(hp[event.target],event.amount);hp[event.target]-=actual;
   if(event.blocked){combatFx('block',event.target,event.blocked);sound('fx_block');if(context.barriers[event.target]>0&&context.battle.actors[event.target].barrier===0){combatFx('break',event.target,event.blocked);sound('fx_break');}}
   if(actual>0){impactCharacter(event.target,actual);const family=event.kind==='poison'?'poison-tick':card&&card.tags.includes('poison_reference')?'venom':card&&card.tags.includes('debuff')?'curse':'slash';combatFx(family,event.target,actual);sound(event.kind==='poison'?'fx_poison_tick':family==='curse'?'fx_curse':'fx_hit_'+(actual>=5?'heavy':actual>=3?'medium':'light'));}
   if(card&&card.tags.includes('buff'))battleTasks.schedule(()=>{if(context.battle.end)return;combatFx('buff',GameBattle.other(event.target));sound('fx_buff');},100);
   if(card&&card.tags.includes('debuff'))battleTasks.schedule(()=>{if(!context.battle.end)combatFx('curse',event.target);},100);
  }else if(event.type==='heal'){hp[event.side]+=event.amount;if(event.amount>0){combatFx('heal',event.side,event.amount);sound('fx_heal');}}
  else if(event.type==='accelerate'){combatFx('mana',event.side,3);sound('fx_mana');}
  else if(event.type==='environmentDamage'){combatFx('curse',event.target,event.amount);sound('fx_curse');}
  else if(event.type==='finish')combatFx('finish',GameBattle.other(event.winner),6);
 }
 // Status presentation follows the impact; the reducer and HUD stay immediate.
 for(const side of ['player','boss'])if(context.poison[side]<context.battle.actors[side].poison)battleTasks.schedule(()=>{if(context.battle.end)return;combatFx('poison',side);sound('fx_poison');},100);
}
