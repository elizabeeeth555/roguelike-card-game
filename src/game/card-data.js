/* First-era trial catalog. Frozen base values; no upgrades or legacy effects. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.GameData=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const CARDS={
  "slash": {
    "id": "slash",
    "name": "斬撃",
    "group": "A",
    "cost": 1,
    "cd": 0,
    "tags": [
      "attack"
    ],
    "description": "敵に2ダメージ"
  },
  "heavy_slash": {
    "id": "heavy_slash",
    "name": "重斬",
    "group": "A",
    "cost": 2,
    "cd": 0,
    "tags": [
      "attack"
    ],
    "description": "敵に4ダメージ"
  },
  "great_swing": {
    "id": "great_swing",
    "name": "大振り",
    "group": "A",
    "cost": 3,
    "cd": 0,
    "tags": [
      "attack"
    ],
    "description": "敵に6ダメージ"
  },
  "barrier": {
    "id": "barrier",
    "name": "結界",
    "group": "A",
    "cost": 1,
    "cd": 1,
    "tags": [
      "defense"
    ],
    "description": "バリア3。次の相手ターン終了時に残量消滅"
  },
  "fortress": {
    "id": "fortress",
    "name": "堅守",
    "group": "A",
    "cost": 2,
    "cd": 1,
    "tags": [
      "defense"
    ],
    "description": "バリア5。次の相手ターン終了時に残量消滅"
  },
  "first_aid": {
    "id": "first_aid",
    "name": "手当",
    "group": "A",
    "cost": 1,
    "cd": 1,
    "tags": [
      "heal"
    ],
    "description": "HP2回復"
  },
  "dash_slash": {
    "id": "dash_slash",
    "name": "疾走斬",
    "group": "B",
    "cost": 1,
    "cd": 1,
    "tags": [
      "attack"
    ],
    "description": "1ダメージ。最初の攻撃カードなら合計3ダメージ"
  },
  "follow_up": {
    "id": "follow_up",
    "name": "追撃",
    "group": "B",
    "cost": 1,
    "cd": 1,
    "tags": [
      "attack"
    ],
    "description": "1ダメージ。別の攻撃カードを先に使っていれば合計3ダメージ"
  },
  "finisher_slash": {
    "id": "finisher_slash",
    "name": "切り込み",
    "group": "B",
    "cost": 1,
    "cd": 1,
    "tags": [
      "attack"
    ],
    "description": "2ダメージ。対象HPが最大HPの半分以下なら合計4ダメージ"
  },
  "charge": {
    "id": "charge",
    "name": "猛進",
    "group": "B",
    "cost": 2,
    "cd": 1,
    "tags": [
      "attack"
    ],
    "description": "5ダメージ"
  },
  "battle_spirit": {
    "id": "battle_spirit",
    "name": "戦意",
    "group": "C",
    "cost": 1,
    "cd": 2,
    "tags": [
      "buff"
    ],
    "description": "この自ターンの次の攻撃カードのダメージ+3"
  },
  "feint": {
    "id": "feint",
    "name": "牽制",
    "group": "C",
    "cost": 1,
    "cd": 1,
    "tags": [
      "attack",
      "debuff"
    ],
    "description": "1ダメージ。対象の次の攻撃ダメージ−2"
  },
  "mana_bind": {
    "id": "mana_bind",
    "name": "封脈",
    "group": "C",
    "cost": 2,
    "cd": 1,
    "tags": [
      "attack",
      "debuff"
    ],
    "description": "1ダメージ。対象の次の自ターンの使用可能マナ−1（最低2）"
  },
  "setup": {
    "id": "setup",
    "name": "布石",
    "group": "C",
    "cost": 2,
    "cd": 1,
    "tags": [
      "attack",
      "buff"
    ],
    "description": "3ダメージ。次の自ターンの初回攻撃ダメージ+2"
  },
  "corrosion": {
    "id": "corrosion",
    "name": "腐蝕",
    "group": "D",
    "cost": 1,
    "cd": 1,
    "tags": [
      "poison"
    ],
    "description": "毒2を付与（上限4）"
  },
  "plague": {
    "id": "plague",
    "name": "疫病",
    "group": "D",
    "cost": 2,
    "cd": 1,
    "tags": [
      "poison"
    ],
    "description": "毒3を付与（上限4）"
  },
  "venom_blade": {
    "id": "venom_blade",
    "name": "毒刃",
    "group": "D",
    "cost": 2,
    "cd": 1,
    "tags": [
      "attack",
      "poison_reference"
    ],
    "description": "敵が毒状態のときのみ使用可。2+min(4,毒数×2)ダメージ。その後毒−1"
  },
  "heart_corrosion": {
    "id": "heart_corrosion",
    "name": "蝕心",
    "group": "D",
    "cost": 1,
    "cd": 1,
    "tags": [
      "attack",
      "poison_reference"
    ],
    "description": "敵が毒状態のときのみ使用可。毒数と同量のダメージ。その後毒−1"
  },
  "curse": {
    "id": "curse",
    "name": "呪詛",
    "group": "D",
    "cost": 1,
    "cd": 1,
    "tags": [
      "attack",
      "debuff"
    ],
    "description": "1ダメージ。対象が毒状態なら次の攻撃ダメージ−2"
  }
};
 const BOSSES=[
  {
    "id": "boss_knight_defense",
    "character_id": "02_heavy_knight",
    "card_ids": [
      "slash",
      "heavy_slash",
      "barrier",
      "fortress",
      "feint"
    ]
  },
  {
    "id": "boss_witch_poison",
    "character_id": "03_witch",
    "card_ids": [
      "corrosion",
      "plague",
      "venom_blade",
      "heart_corrosion",
      "curse"
    ]
  },
  {
    "id": "boss_giant_power",
    "character_id": "04_giant_warrior",
    "card_ids": [
      "heavy_slash",
      "great_swing",
      "charge",
      "barrier",
      "first_aid"
    ]
  },
  {
    "id": "boss_scout_rush",
    "character_id": "05_scout",
    "card_ids": [
      "dash_slash",
      "follow_up",
      "finisher_slash",
      "barrier",
      "first_aid"
    ]
  },
  {
    "id": "boss_sage_tempo",
    "character_id": "06_sage",
    "card_ids": [
      "battle_spirit",
      "mana_bind",
      "setup",
      "curse",
      "slash"
    ]
  }
];
 const STARTERS=[
  {
    "id": "rush",
    "label": "速攻",
    "card_ids": [
      "slash",
      "dash_slash"
    ]
  },
  {
    "id": "midrange",
    "label": "中速",
    "card_ids": [
      "heavy_slash",
      "feint"
    ]
  },
  {
    "id": "poison",
    "label": "毒",
    "card_ids": [
      "corrosion",
      "slash"
    ]
  }
];
 const TAG_LABELS={attack:'攻撃',defense:'防御',heal:'回復',buff:'補助',poison:'毒付与',debuff:'妨害',poison_reference:'毒参照'};
 function category(card){return card.tags.includes('attack')?'attack':card.tags[0];}
 function sample(ids,count,random=Math.random){
  const pool=[...ids];for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return pool.slice(0,count);
 }
 function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
 return freeze({CARDS,BOSSES,STARTERS,TAG_LABELS,category,sample,RULES:{hp:20,initialCap:3,maxCap:5,accelerationCost:2,poisonCap:4,deckCap:5,firstSide:'player'}});
});
