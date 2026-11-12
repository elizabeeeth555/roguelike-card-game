'use strict';
const decks={
 previous_attack:['barrier','battle_spirit','feint','finisher_slash','heavy_slash'],
 pure_attack:['slash','dash_slash','follow_up','heavy_slash','charge'],
 pure_corrosion:['corrosion','dash_slash','follow_up','heavy_slash','charge'],
 previous_poison:['barrier','corrosion','finisher_slash','fortress','slash'],
 corrosion_replay:['barrier','corrosion','first_aid','fortress','heavy_slash'],
 thrust_defense:['barrier','corrosion','fortress','r_poison_thrust','slash'],
 blade_defense:['barrier','corrosion','finisher_slash','fortress','r_venom_blade'],
 poison_stack:['barrier','corrosion','first_aid','fortress','plague'],
 hybrid:['battle_spirit','corrosion','feint','heavy_slash','slash'],
 thrust_hybrid:['corrosion','feint','heavy_slash','r_poison_thrust','slash'],
 release:['barrier','corrosion','fortress','plague','r_poison_release'],
 minimum_poison:['corrosion','dash_slash','feint','finisher_slash','slash']
};
const planners={legacy:{},matched:{poisonModel:'matched'},deep:{poisonModel:'matched',width:18,budget:1800,candidates:8,replyBudget:600}};
// Reuse the previous study's blade MP1/CD1 floor/no-consumption tested condition.
const config={openingMP:2,ultCost:1,bladeCost:1,bladeCD:1,bladeRounding:'floor',bladeConsume:0,bladeNeedsPoison:true};
module.exports={decks,planners,config,seeds:Array.from({length:24},(_,i)=>i+1)};
