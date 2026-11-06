# 継世の戦闘：キャラクター立ち絵マスター素材

## 基本方針

- 本ZIPはChatGPTで直接生成した元PNGのバイト列をそのまま格納しています。iPhoneを経由してJPEGとして保存し直したファイルではありません。
- `masters/` に現時点の採用版6枚があります。全て1024×1536ピクセルです。
- `03_witch.png` だけは指修正後の最新版ですが、元データがRGBで**背景未透過**です。これはiPhoneによる変換ではなく、生成された時点で未透過でした。Codexで丁寧な背景除去・マット処理をお願いします。
- `alternatives/03_witch_before_hand_fix_transparent.png` は指修正前の透過版です。背景や切り抜き境界の参考にしてください。デザインを無断でこちらに差し替えないでください。
- 他の5枚はRGBAの透明ピクセルを含んでいます。背景除去を再実行して品質を落とさないでください。
- メイン立ち絵はマスター原本を保持し、顔アイコン・バストアップは派生ファイルとして加工してください。
- 透過処理後は濃色・淡色背景上で白縁、髪、杖、武器周りを確認してください。
- キャラクターの見た目を別人にしたり新規画像生成したりしないでください。

## 画像対応表

| ZIPファイル | キャラクター | 画像モード | 状態 | SHA256 (先頭12桁) |
|---|---|---|---|---|
| masters/01_black_swordsman.png | 黒剣士 | RGBA | 採用版 | 57cc182b1f38 |
| masters/02_heavy_knight.png | 重装騎士 | RGBA | 採用版 | d1ababb415c9 |
| masters/03_witch.png | 魔女 | RGB | 指修正後の最新版（背景未透過） | a8a9914ae5d6 |
| masters/04_big_man.png | 大男 | RGBA | 採用版 | eed30a948db1 |
| masters/05_scout.png | 斥候 | RGBA | 透過修正後の採用版 | 594a5d3e3356 |
| masters/06_sage.png | 賢者 | RGBA | 青・緑・金色の再生成採用版 | 5f714876dfb9 |

## UI改修メモ（画像とは別に実装要否を確認すること）

- ボス立ち絵は特にPC版で現状より大きくし、中心に存在感を出す。足先が下部UIに隠れることは許容する。
- 敵デッキの常時表示は縦長カードではなく**横長の小さな長方形5枚**へ変更し、カード名・種別アイコン・残りCD/使用済のみ表示する。詳細説明は選択時の拡大表示にのみ出す。
- 既存の戦闘ルール・AI・カード性能は変えない。

## 元ファイル名（ChatGPT生成時）

- `masters/01_black_swordsman.png` ← `a_highly_detailed_anime_style_full_body_character.png`
- `masters/02_heavy_knight.png` ← `a_highly_detailed_fantasy_character_illustration_o.png`
- `masters/03_witch.png` ← `a_highly_detailed_polished_anime_style_fantasy_il.png`
- `masters/04_big_man.png` ← `a_highly_detailed_stylized_fantasy_character_illu.png`
- `masters/05_scout.png` ← `a_high_detail_anime_fantasy_rpg_style_character_il.png`
- `masters/06_sage.png` ← `a_highly_detailed_fantasy_illustration_on_a_transp.png`
- `alternatives/03_witch_before_hand_fix_transparent.png` ← `a_highly_detailed_anime_style_fantasy_illustration.png`
