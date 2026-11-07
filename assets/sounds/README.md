# BGM and sound effects

## BGM
- `bgm/whispers_in_the_fog.ogg` (Ruhinre) — event / route
- `bgm/determined_pursuit_loop.ogg` (Emma_MA) — boss battle
- Matching `.mp3` files are included for cross-browser playback.
- Music files were provided by the user; confirm the licenses at their distribution pages before publishing.

## SFX
The `sfx/` directory holds 36 short temporary original effect sounds used by the game. Change any mapped entry in `assets/asset-map.js` to replace an individual sound.

## Current presentation update (2026-11-07)

- Determined Pursuit / Emma_MA / CC0: https://opengameart.org/content/determined-pursuit-epic-orchestra-loop (source/license supplied by the user; source page blocked in this environment).
- Explicitly assigned to `boss_scout_rush`. Four other boss slots remain `pending-source` and use the existing battle track. They are **not four new tracks**.
- No newly acquired external music is included. OpenGameArt/freepd/incompetech source verification was blocked; mirror metadata alone was not accepted as sufficient verification.
- Twelve new original procedural combat SFX: [generation/licensing](sfx/combat/README.md). Existing sounds and route music are retained.
