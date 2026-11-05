// All artwork, BGM and SE paths are configured here. Swap the referenced files at any time.
window.GAME_ASSETS={
  characters:{guardian:'assets/characters/guardian.svg',era1:'assets/characters/era-1.svg',era2:'assets/characters/era-2.svg',era3:'assets/characters/era-3.svg'},
  background:'assets/backgrounds/arena.svg',
  cards:{},
  // Selected tracks: use OGG for seamless loops; fall back to MP3 on unsupported browsers.
  bgm:{event:'assets/sounds/bgm/whispers_in_the_fog.ogg',battle:'assets/sounds/bgm/determined_pursuit_loop.ogg'},
  bgmFallback:{event:'assets/sounds/bgm/whispers_in_the_fog.mp3',battle:'assets/sounds/bgm/determined_pursuit_loop.mp3'},
  // The boss theme was measured louder; slightly lower its playback volume.
  bgmGain:{event:1.0,battle:0.60},
  sounds:{
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
