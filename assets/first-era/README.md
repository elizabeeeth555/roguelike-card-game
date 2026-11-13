# 第一紀・採用素材原本（2026-11-13）

本ディレクトリは第一紀の画面制作で利用する画像原本4点と、追加採用した透過PNG・音声3点の管理元。旧公開版の既存素材を置換しない。画像の正式採用とUI組込み・公開を区別する。

| ファイル | 用途 | 状態 | 元画像 |
|---|---|---|---|
| `boss/ashen-king-standing-source.jpg` | 《灰鎖の老王》戦闘立ち絵 | 当面採用／背景除去は後工程 | `5170CD53-3249-4D13-B313-33E355DA2A88.jpeg` |
| `backgrounds/throne-battle-source.jpg` | 王座の間・戦闘背景 | 暫定採用 | `20D982DC-6D08-4B25-BC7F-D63B6727D23E(2).jpeg` |
| `backgrounds/outpost-hub-source.jpg` | 第一紀拠点・タイトル画面の背景 | 採用 | `A9C6F173-24A6-456C-A2F5-BE938A00AA45.jpeg` |
| `backgrounds/deck-building-table-source.png` | スキル編成画面の真俯瞰机背景 | 採用 | `雨に濡れた中世のデッキ構築机.png` |

各画像は拡縮・トリミング・再エンコードなしの原本コピー（格納名のみ変更）。JPEG 3点とRGB PNG 1点で、すべて**非透過**。王の髪・鎖・マントの背景除去やWebP派生、レイアウト適用は別作業とし、原本を上書きしない。

## 原本SHA-256
- `boss/ashen-king-standing-source.jpg`: `52699b6226c4436ca05522b527d90e804225b2899219d25005bd01a53148cec1`
- `backgrounds/throne-battle-source.jpg`: `8c5d8681719b28a0effc28fbc9a7ecdf5341462fd4233cc448950b6b57ade359`
- `backgrounds/outpost-hub-source.jpg`: `06785afa899ed8e040a95b186820eef3fbd07efc18744de82da3c396a34e6cd0`
- `backgrounds/deck-building-table-source.png`: `54660f03d26d6dbd72c4862639b4942bd97fc4b91fabe2b165d90ee628d6426f`

上記4点の原本は保持する。以下の追補は新しい採用素材であり、旧classic・工房の素材を置換しない。

## 透過老王と音源の採用（2026-11-13）

提供ZIP：`first-era-assets-audio-ready.zip`。README・CODEX_TASK・SHA256SUMSを照合して取得。透過PNGは1024×1536のRGBA（実測アルファ範囲0〜254）、無加工で採用。原JPGは保持し、髪・鎖周辺の赤／黄の縁残りを補修・再生成しない。

| 登録ファイル | 用途 | 制作者・出典 | 権利・加工 |
|---|---|---|---|
| [ashen-king-transparent.png](boss/ashen-king-transparent.png) | 第一紀老王立ち絵 | ユーザー提供 | ユーザー承認。画像無加工 |
| [bgm-first-era-hub-forest.mp3](audio/bgm-first-era-hub-forest.mp3) | Forest Ambience | TinyWorlds / [公式ページ](https://opengameart.org/content/forest-ambience) | CC0。提供MP3と同一バイト |
| [sfx-first-era-campfire.mp3](audio/sfx-first-era-campfire.mp3) | Fireplace Sound loop | PagDev / [公式ページ](https://opengameart.org/content/fireplace-sound-loop) | CC0。提供WAVからMP3へ変換 |
| [bgm-first-era-old-king.mp3](audio/bgm-first-era-old-king.mp3) | Laments of the War | Cethiel / [公式ページ](https://opengameart.org/content/laments-of-the-war) | CC0。提供MP3と同一バイト |

ユーザー提供台帳では各公式ページのCC0表記を確認済み。[CC0原文](https://creativecommons.org/publicdomain/zero/1.0/)。この作業では音源を再取得せず、公式配布バイトとの外部照合は実施していない。ボス曲の配布名は`Lament of the War - MP3 Preview.mp3`。名称中のPreviewを未許諾の意味と解釈しない。

焚き火原本`source-audio/fire.wav`（10,324,410 bytes）は提供ZIPに保持し、Gitへ重複登録しない。原本SHA256：`85ca0cc60d0c037fff8b185e31ad1fcdbda6ce45eee17c3ee1318d1b8f59e330`。
変換：`ffmpeg -i fire.wav -codec:a libmp3lame -b:a 128k sfx-first-era-campfire.mp3`（FFmpeg 7.1.5-0+deb13u1、トリミング・音量加工なし）。MP3化による長さの差はエンコーダーパディングを含む。実機聴感による音量バランス・ループ継ぎ目は未確認。

| 登録ファイル | bytes | 秒（ffprobe） | SHA256 |
|---|---:|---:|---|
| `boss/ashen-king-transparent.png` | 2,724,627 | — | `549c0e2af377cbcb9babb6bdd911a0c460b63c1c113ae9358a82cf6e6f57c0e9` |
| `audio/bgm-first-era-hub-forest.mp3` | 716,670 | 44.760000 | `9850aa1d0d5d66bd9c5daf8bb77c6d852e01f2f4de22f283bd5621e8bed13b75` |
| `audio/bgm-first-era-old-king.mp3` | 9,123,048 | 228.048980 | `cef8e50f55d72eb54613c8c31f83a3aa034acdcf33cc3af44fd43ed134ad4db0` |
| `audio/sfx-first-era-campfire.mp3` | 469,500 | 29.309388 | `20b34a31949e9b2155c5cf98a4e7b1d45d7db7461ff67ca82110fc44331e57f4` |

配信はViteの明示許可リストのみ。PNGは`first-era/boss.png`、音声は`first-era/audio/`以下の登録名で配信する。classicの素材マップ・BGM参照は変更しない。再生方針の正本は[UI仕様](../../docs/features/ui.md#first-era-audio)、実装のID→URLは[audio.ts](../../apps/game-web/src/first-era/audio.ts)。
