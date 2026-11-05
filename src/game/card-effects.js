/* Card effect registry shared by browser and Node.js. Add new effect handlers here. */
(function(root,factory){
 'use strict';
 if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./combat-math.js'));
 else root.GameCardEffects=factory(root.GameMath);
})(typeof globalThis==='object'?globalThis:this,function(GameMath){
 'use strict';
 function apply({state,who,c,hit,heal,addLog,sound}){
  const lv=c.lv||0,t=!!c.trait,a=state[who==='player'?'playerAtk':'bossAtk'];
  const opp=who==='player'?'boss':'player',prefix=who==='player'?'あなた':'敵';
  const atkGet=side=>side==='player'?'playerAtk':'bossAtk';
  const hpGet=side=>side==='player'?'playerHp':'bossHp';
  const effects={
      'slash':()=>{
        hit(who,a+lv*2,'斬撃');
        if(t&&!state.end)hit(who,Math.ceil((a+lv*2)/2),'追撃');
      },
      'boost':()=>{
        state[atkGet(who)]+=2+lv;
        if(t)state[`${who}Guard`]+=4;
        addLog(`${prefix}の攻撃力+${2+lv}`);
      },
      'guard':()=>{
        state[`${who}Guard`]+=6+2*lv;
        if(t)state[`${who}Thorns`]=3+lv;
      },
      'return':()=>{hit(who,a+Math.min(12,state[`${who}BlockedPrev`])*(2+lv+(t?1:0))+(t?2:0),'返礼',false,false,false,false,.5);},
      'pierce':()=>{hit(who,a+2+lv*3+(t?5:0),'穿撃',true);},
      'rally':()=>{
        state[atkGet(who)]+=1+lv;
        heal(who,2+lv,'奮起');
        if(t)state[`${who}Guard`]+=4;
      },
      'rush':()=>{hit(who,2+lv*2+(t?5:0),'速攻');},
      'siphon':()=>{
        hit(who,a+lv*2,'吸命');
        if(!state.end)heal(who,3+lv+(t?3:0),'吸命');
      },
      'flurry':()=>{for(let i=0;i<(t?3:2)&&!state.end;i++)hit(who,a+lv,`連牙 ${i+1}撃目`);},
      'seal':()=>{state[`${opp}ManaPenalty`]+=2+lv; if(t)hit(who,2,'封魔の余波');},
      'poison':()=>{
        hit(who,2+lv,'腐蝕');
        if(state.end)return;
        const poison=state[`${opp}Poison`];
        Object.assign(poison,GameMath.applyPoison(poison,3+lv,t?3:2));
        addLog(`${prefix}：毒${poison.stacks}層（毎回${poison.dmg}ダメージ）`);
        sound('poison');
      },
      'thorns':()=>{
        state[`${who}Guard`]+=6+2*lv;
        state[`${who}Thorns`]=3+lv+(t?3:0);
      },
      'leech':()=>{
        hit(who,a+lv*2+(t?5:0),'血吸');
        if(!state.end)heal(who,3+lv,'血吸');
      },
      'burst':()=>{hit(who,2*a+3*lv+(t?8:0),'破砕');},
      'fortify':()=>{
        state[atkGet(who)]+=1+(t?1:0)+lv;
        state[`${who}Guard`]+=4+lv*2;
      },
      'hex':()=>{
        state[`${opp}Weak`]=Math.max(state[`${opp}Weak`],2+lv);
        if(t)state[`${who}Guard`]+=4;
      },
      'laststand':()=>{
        const maximum=state[who==='player'?'maxPlayerHp':'maxBossHp'];
        const missing=Math.max(0,maximum-state[hpGet(who)]);
        hit(who,a+Math.floor(missing*(t?.6:.4))+lv*3,'逆境の一撃');
      },
      'venombloom':()=>{
        const poison=state[`${opp}Poison`];
        if(poison.turns<=0)return;
        const power=a+(poison.stacks||1)*(t?13:9)+poison.turns*3+lv*3;
        state[`${opp}Poison`]={turns:0,dmg:0,stacks:0};
        addLog(`${prefix}：敵の毒を消費して劇毒開花！`,who==='player'?'hero':'enemy');
        hit(who,power,'劇毒開花');
      },
      'spark':()=>{hit(who,5+lv*2+(t?3:0),'星火');},
      'sunder':()=>{
        const guard=state[`${opp}Guard`]+(opp==='boss'?state.bossBarrier:0);
        const removed=Math.min(guard,6+lv*3+(t?4:0));
        const fromBarrier=opp==='boss'?Math.min(state.bossBarrier,removed):0;
        if(fromBarrier)state.bossBarrier-=fromBarrier;
        state[`${opp}Guard`]=Math.max(0,state[`${opp}Guard`]-(removed-fromBarrier));
        addLog(`${prefix}：敵の軽減を${removed}破壊`);
        hit(who,3+lv,'破戒');
      },
      'ember':()=>{
        const poison=state[`${opp}Poison`];
        Object.assign(poison,GameMath.applyPoison(poison,2+lv,2));
        addLog(`${prefix}：毒${poison.stacks}層（毎回${poison.dmg}ダメージ）`);
        sound('poison');
        if(t)hit(who,2,'残火の余波');
      },
      'pulse':()=>{
        // Enemy mana refunds are accounted for when its actions are selected.
        if(who==='player')state.mana+=2+lv+(t?1:0);
        addLog(`${prefix}のマナ回復 +${2+lv+(t?1:0)}`);
        sound('mana');
      },
      'repose':()=>{
        heal(who,6+lv*3,'癒しの詠唱');
        if(t)state[`${who}Guard`]+=3;
      },
      'duel':()=>{hit(who,a+5+lv*3,'一騎討ち',false,false,false,true,t?.5:0);},
      'storm':()=>{for(let i=0;i<(t?3:2)&&!state.end;i++)hit(who,4+lv*2,`雷閃 ${i+1}撃目`);},
      'dusk':()=>{
        state[`${opp}ManaPenalty`]+=1+Math.floor(lv/2)+(t?1:0);
        state[`${opp}Weak`]=Math.max(state[`${opp}Weak`],3+lv);
      },
  };
  const effect=effects[c.id];
  if(effect)effect();
 }
 return Object.freeze({apply});
});
