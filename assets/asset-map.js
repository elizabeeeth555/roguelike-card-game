// All artwork, BGM and SE paths are configured here. Swap the referenced files at any time.
window.GAME_ASSETS={
  characters:{guardian:'assets/characters/guardian.svg',era1:'assets/characters/era-1.svg',era2:'assets/characters/era-2.svg',era3:'assets/characters/era-3.svg'},
  background:'assets/backgrounds/castle_throne_room.webp',
  backgrounds:{draft:'assets/backgrounds/castle_corridor.webp',battle:'assets/backgrounds/castle_throne_room.webp'},
  cards:{},
  // Selected tracks: use OGG for seamless loops; fall back to MP3 on unsupported browsers.
  bgm:{event:'assets/sounds/bgm/whispers_in_the_fog.ogg',battle:'assets/sounds/bgm/determined_pursuit_loop.ogg'},
  bgmFallback:{event:'assets/sounds/bgm/whispers_in_the_fog.mp3',battle:'assets/sounds/bgm/determined_pursuit_loop.mp3'},
  // The boss theme was measured louder; slightly lower its playback volume.
  bgmGain:{event:1.0,battle:0.60},
  // Explicit per-boss slots. Missing verified source uses the existing approved theme.
  // Do not populate pending slots with music of uncertain provenance.
  bossBgm:{
    boss_knight_defense:{status:'pending-source',gain:0.60},
    boss_witch_poison:{status:'pending-source',gain:0.60},
    boss_giant_power:{status:'pending-source',gain:0.60},
    boss_scout_rush:{ogg:'assets/sounds/bgm/determined_pursuit_loop.ogg',mp3:'assets/sounds/bgm/determined_pursuit_loop.mp3',gain:0.60,status:'available'},
    boss_sage_tempo:{status:'pending-source',gain:0.60}
  },
  effects:{particle:'assets/effects/kenney-particle.png'},
  sounds:{
    fx_poison_tick:'assets/sounds/sfx/combat/poison_tick.mp3',
    fx_curse:'assets/sounds/sfx/combat/curse.mp3',
    fx_poison:'assets/sounds/sfx/combat/poison.mp3',
    fx_mana:'assets/sounds/sfx/combat/mana.mp3',
    fx_buff:'assets/sounds/sfx/combat/buff.mp3',
    fx_heal:'assets/sounds/sfx/combat/heal.mp3',
    fx_break:'assets/sounds/sfx/combat/break.mp3',
    fx_block:'assets/sounds/sfx/combat/block.mp3',
    fx_ward:'assets/sounds/sfx/combat/ward.mp3',
    fx_hit_heavy:'assets/sounds/sfx/combat/hit_heavy.mp3',
    fx_hit_medium:'assets/sounds/sfx/combat/hit_medium.mp3',
    fx_hit_light:'assets/sounds/sfx/combat/hit_light.mp3',
    ui_click:'assets/sounds/sfx/ui_click.mp3',ui_confirm:'assets/sounds/sfx/ui_confirm.mp3',
    ui_cancel:'assets/sounds/sfx/ui_cancel.mp3',ui_open:'assets/sounds/sfx/ui_open.mp3',
    ui_close:'assets/sounds/sfx/ui_close.mp3',ui_error:'assets/sounds/sfx/ui_error.mp3',
    card_pick:'assets/sounds/sfx/card_pick.mp3',card_gain:'assets/sounds/sfx/card_gain.mp3',
    card_replace:'assets/sounds/sfx/card_replace.mp3',card_discard:'assets/sounds/sfx/card_discard.mp3',
    upgrade:'assets/sounds/sfx/upgrade.mp3',engraving:'assets/sounds/sfx/engraving.mp3',
    legacy_pick:'assets/sounds/sfx/legacy_pick.mp3',stage_transition:'assets/sounds/sfx/stage_transition.mp3',
    battle_start:'assets/sounds/sfx/battle_start.mp3',player_turn:'assets/sounds/sfx/player_turn.mp3',
    enemy_turn:'assets/sounds/sfx/enemy_turn.mp3',card_cast:'assets/sounds/sfx/card_cast.mp3',
    attack:'assets/sounds/sfx/attack.mp3',pierce:'assets/sounds/sfx/pierce.mp3',
    flurry:'assets/sounds/sfx/flurry.mp3',hit:'assets/sounds/sfx/hit.mp3',
    heavy_hit:'assets/sounds/sfx/heavy_hit.mp3',block:'assets/sounds/sfx/block.mp3',
    guard_break:'assets/sounds/sfx/guard_break.mp3',boost:'assets/sounds/sfx/boost.mp3',
    poison:'assets/sounds/sfx/poison.mp3',poison_tick:'assets/sounds/sfx/poison_tick.mp3',
    heal:'assets/sounds/sfx/heal.mp3',counter:'assets/sounds/sfx/counter.mp3',
    magic:'assets/sounds/sfx/magic.mp3',seal:'assets/sounds/sfx/seal.mp3',
    one_shot:'assets/sounds/sfx/one_shot.mp3',mana:'assets/sounds/sfx/mana.mp3',
    win:'assets/sounds/sfx/win.mp3',lose:'assets/sounds/sfx/lose.mp3'
  }
};

// User supplied masters and derived transparent portraits; game IDs are preserved.
window.GAME_ASSETS.characterSets={
  "01_black_swordsman": {
    "name": "夜刃の剣士",
    "label": "黒剣士",
    "enabled": true,
    "images": {
      "boss": "assets/characters/castle/01_black_swordsman_boss.png",
      "face": "assets/characters/castle/01_black_swordsman_face.png",
      "bust": "assets/characters/castle/01_black_swordsman_bust.png"
    },
    "framing": {
      "scale": 1.78,
      "x": "0px",
      "y": "0px",
      "mobile-scale": 1.35,
      "mobile-x": "0px",
      "mobile-y": "0px"
    }
  },
  "02_heavy_knight": {
    "name": "蒼鋼の守護騎士",
    "label": "重装騎士",
    "enabled": true,
    "images": {
      "boss": "assets/characters/castle/02_heavy_knight_boss.png",
      "face": "assets/characters/castle/02_heavy_knight_face.png",
      "bust": "assets/characters/castle/02_heavy_knight_bust.png"
    },
    "framing": {
      "scale": 1.72,
      "x": "0px",
      "y": "0px",
      "mobile-scale": 1.35,
      "mobile-x": "0px",
      "mobile-y": "0px"
    }
  },
  "03_witch": {
    "name": "紫苑の魔女",
    "label": "魔女",
    "enabled": true,
    "images": {
      "boss": "assets/characters/castle/03_witch_boss.png",
      "face": "assets/characters/castle/03_witch_face.png",
      "bust": "assets/characters/castle/03_witch_bust.png"
    },
    "framing": {
      "scale": 1.72,
      "x": "0px",
      "y": "0px",
      "mobile-scale": 1.35,
      "mobile-x": "0px",
      "mobile-y": "0px"
    }
  },
  "04_giant_warrior": {
    "name": "鉄拳の巨漢",
    "label": "大男",
    "enabled": true,
    "images": {
      "boss": "assets/characters/castle/04_big_man_boss.png",
      "face": "assets/characters/castle/04_big_man_face.png",
      "bust": "assets/characters/castle/04_big_man_bust.png"
    },
    "framing": {
      "scale": 1.64,
      "x": "0px",
      "y": "0px",
      "mobile-scale": 1.35,
      "mobile-x": "0px",
      "mobile-y": "0px"
    }
  },
  "05_scout": {
    "name": "翡翠の双刃",
    "label": "斥候",
    "enabled": true,
    "images": {
      "boss": "assets/characters/castle/05_scout_boss.png",
      "face": "assets/characters/castle/05_scout_face.png",
      "bust": "assets/characters/castle/05_scout_bust.png"
    },
    "framing": {
      "scale": 1.8,
      "x": "0px",
      "y": "0px",
      "mobile-scale": 1.35,
      "mobile-x": "0px",
      "mobile-y": "0px"
    }
  },
  "06_sage": {
    "name": "暁の賢者",
    "label": "賢者",
    "enabled": true,
    "images": {
      "boss": "assets/characters/castle/06_sage_boss.png",
      "face": "assets/characters/castle/06_sage_face.png",
      "bust": "assets/characters/castle/06_sage_bust.png"
    },
    "framing": {
      "scale": 1.75,
      "x": "0px",
      "y": "0px",
      "mobile-scale": 1.35,
      "mobile-x": "0px",
      "mobile-y": "0px"
    }
  }
};
