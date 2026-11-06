# 古城背景

`castle_corridor.png` は道中、`castle_throne_room.png` はボス戦のユーザー承認済み原本（ZIPと同一バイト）。同名のWebPを品質90で派生し、配信用に使用する。PNGは上書き加工しない。

WebPは回廊約252KiB・玉座約216KiB。表示先は `assets/asset-map.js` の `backgrounds` で管理。中央基準coverで歪み・繰り返しを防ぎ、暗転はCSSだけで適用。画像へのUI焼き込みや新規生成は行っていない。
