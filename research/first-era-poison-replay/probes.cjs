'use strict';
const fs=require('node:fs'),B=require('./engine.cjs');
const deck=['battle_spirit','slash','corrosion','r_venom_blade','r_poison_release'];
const findings=[];
function probe(name,actions,{poison=5,stance='rupture',...config}={}){
 const s=B.create(deck,config);s.actors.player.mana=5;s.actors.boss.hp=s.actors.boss.maxHp=100;s.actors.boss.poison=poison;s.old.stance=stance;
 const steps=[];for(const id of actions){const action=id==='ultimate'?{type:'ultimate',side:'player'}:{type:'card',side:'player',id};const before=B.clone(s.actors.boss);const out=B.execute(s,action);if(!out.ok)throw Error('Probe illegal action');steps.push({action,before,events:out.events,after:B.clone(s.actors.boss),mana:s.actors.player.mana});}
 findings.push({name,artificialState:true,config:s.c,steps});
}
probe('double-buff-current-state',['battle_spirit','ultimate','slash']);
probe('attack-buff-is-not-copied',['battle_spirit','slash','ultimate']);
probe('release-then-replay-zero',['r_poison_release','ultimate'],{poison:6});
probe('blade-floor-consume-current-state',['r_venom_blade','ultimate'],{bladeConsume:1,bladeCost:1});
probe('blade-ceil-consume-current-state',['r_venom_blade','ultimate'],{bladeRounding:'ceil',bladeConsume:1,bladeCost:1});
probe('corrosion-replay-duration',['corrosion','ultimate'],{poison:0});
probe('release-empty-replay-can-pay-two',['r_poison_release','ultimate'],{poison:6,ultCost:2});
if(require.main===module){const out=process.argv[2];if(out){if(fs.existsSync(out))throw Error('Refusing overwrite');fs.writeFileSync(out,JSON.stringify(findings,null,2));}else console.log(JSON.stringify(findings,null,2));}
module.exports={findings};
