# 正式PNG・ボス拡大・敵カード小型化 報告

ブランチ `ui/castle-six-characters` の実装。ユーザーによるスクリーンショット確認・承認後、コミット・プッシュ・GitHub Pages公開を実施する対象。以下は承認時の実装と検証の記録。

## 作業保全

開始時にブランチと未コミット差分を確認。変更前のソース・素材・テスト・スクリプト・前回レポートを `/tmp/castle-ui-before-png-update.tar.gz` に保存。差し替えた旧JPEG6枚もこのアーカイブから復元可能と確認。
既存の変更をreset/stash等で破棄していない。今回の対象UI・素材を更新した以外の未コミット作業は保持。

## 素材の差し替え

| 提供ファイル | 保存原本 | 戦闘用画像の扱い |
|---|---|---|
| 1-01_black_swordsman.png | masters/01_black_swordsman.png | 原本と完全一致 |
| 3-02_heavy_knight.png | masters/02_heavy_knight.png | 原本と完全一致 |
| 4-03_witch.png | masters/03_witch.png | 最新RGB原本から背景除去 |
| 5-04_big_man.png | masters/04_big_man.png | 原本と完全一致 |
| 2-05_scout.png | masters/05_scout.png | 原本と完全一致 |
| 6-06_sage.png | masters/06_sage.png | 原本と完全一致 |

保存先は `assets/characters/` 以下。6枚とも1024×1536、提供READMEのSHA-256先頭12桁と一致。原本は完全一致で保存。

- 5枚のRGBAはアルファを含め、戦闘用PNGも原本とバイト単位で同一。背景除去・再エンコード・トリミングをしていない。
- 魔女は指修正済みの最新RGBを使用。参考版のアルファは初期マスクの参考だけに使い、GrabCutで最新版の境界を再推定。手の変更部分は最新版から別途推定した。全出力RGB画素が最新版と同一であることを検査済み。参考版の人物や色への差し替えなし。
- 顔256×256、バストアップ最大768×940を正式原本から再作成（各6枚）。以前のJPEG由来の派生PNGは差し替え済み。旧JPEG原本はアクティブ素材ディレクトリから外し、退避アーカイブに保持。
- 参考透過版は `assets/characters/references/` に保存し、ゲーム表示には参照しない。
- 新規画像生成・顔/衣装/ポーズの描き直しは実施していない。
- [明暗背景の透過確認](alpha-dark-light.png)では大きな背景残りや白背景由来の白縁は見られない。細い髪・魔法光・装飾の明線は原画に含まれる。5枚の元からある半透明画素は変更せず保持。魔女の細い毛先・杖のアンチエイリアスは自動推定なので、極端な拡大時の境界は引き続きレビュー対象。

## ボス立ち絵

- PCの描画画像高は約754～915px（従来約335～400px）。足元を収めず、顔と上半身を大きく中央表示。
- 敵カード帯の直下から表示し、顔が敵カードの背後へ潜らない配置。下半身は手札に隠れ、画面下端からのはみ出しは立ち絵コンテナでクリップ。
- スマホ390×844は描画画像高約512pxへ拡大。
- キャラ個別設定は `assets/asset-map.js` の各 `characterSets[id].framing`：`scale`, `x`, `y`, `mobile-scale`, `mobile-x`, `mobile-y`。倍率は数値、位置は `0px` 等のCSS長さ。

## 敵カード

- PC44px/スマホ43pxの横長5枚へ変更。
- 通常時は種別アイコン・名前・残CDのみ。使用済状態では残CDに代えて「使用済」を表示。
- コスト・効果本文・基本CD・条件マークは通常時非表示。拡大詳細に効果全文、コスト、基本CD、タグ、残CD・使用条件を表示。
- 同時拡大1枚、画面内補正、敵ターン中の操作禁止を維持。使用演出・順次実行・AIの処理は変更していない。

## テスト

- `npm test`：71件成功、失敗0。5枚のPNG原本/戦闘用完全一致、6原本のハッシュ・1024×1536寸法も検査。
- `npm run check`：成功。
- `BROWSER_TEST_URL=http://127.0.0.1:18081/ CHROME_PATH=/usr/bin/chromium CHROME_NO_SANDBOX=1 npm run test:browser`：成功。PC2・スマホ3サイズの基本導線・操作・再戦・音量・フォールバック。
- `python scripts/png-ui-smoke.py http://127.0.0.1:18081/`：98項目成功、JS例外0、HTTPリソースエラー0。
- PC1366×768・1280×720、スマホ390×844で6人全員（18画面）を確認。敵カードの通常/CD/使用済/拡大も3サイズすべて保存。
- 5枚の通常表示内容、使用済優先表示、全10枚の拡大枠と詳細の画面内収まり、同時拡大1枚、敵ターン操作ロックを確認。
- 検証サイズすべてでページ幅/高さがviewportと一致し、縦横スクロールなし。
- 変更前の未コミット作業と比較し、戦闘コア・カード定義・AI・進行・アプリ戦闘制御・シミュレーション計17ファイルの完全一致を確認（`protected-files.json`）。戦闘ルール・カード性能・敵AI・バランス検証コードの変更なし。
- `git diff --check`成功。実機タッチ、音声の聴感、他ブラウザは未確認。ブラウザ検証はローカルHTTP。

## 変更ファイル

今回の主な追加変更（前回からの未コミット差分全体とは区別）：

- `assets/characters/masters/`：正式PNG6枚と提供README。旧JPEGは退避済み。
- `assets/characters/castle/`：立ち絵・顔・バストアップ18枚の差し替えとREADME更新。
- `assets/characters/references/`：魔女の参考透過版。
- `assets/characters/manifest.json`：正式原本のハッシュ・寸法・派生先。
- `assets/asset-map.js`：6人の個別倍率/位置設定。
- `src/castle-ui.css`：敵カード小型化、ボス拡大・下端クリップ、拡大詳細。
- `src/ui/render.js`：種別アイコンと敵の詳細メタ情報。
- `src/ui/effects.js`：キャラ個別フレーミングの反映。
- `scripts/prepare-castle-assets.py`：正式PNG専用加工。OpenCVは魔女のみ使用。
- `scripts/png-ui-smoke.py`：今回の画面検証。
- `tests/assets.test.cjs`：正式原本/透過保持の検証。
- `README.md`, `docs/README.md`, `docs/specs/first-era/10-png-compact-enemy-ui.md`：最新差分の説明。
- `reports/castle-ui-png/`：今回の報告、監査JSON、テストログ、画面。

## スクリーンショット

- [PC6人一覧](six-bosses-pc.jpg)
- [素材/顔一覧](character-sheet.png) ／ [濃色・淡色背景](alpha-dark-light.png)
- [敵カード通常](screenshots/enemy-normal-1366x768.png) ／ [CD中](screenshots/enemy-cooldown-1366x768.png) ／ [使用済](screenshots/enemy-spent-1366x768.png) ／ [拡大詳細](screenshots/enemy-expanded-1366x768.png)

| キャラクター | 1366×768 | 1280×720 | 390×844 |
|---|---|---|---|
| 黒剣士 | [1366x768](screenshots/01_black_swordsman-1366x768.png) | [1280x720](screenshots/01_black_swordsman-1280x720.png) | [390x844](screenshots/01_black_swordsman-390x844.png) |
| 重装騎士 | [1366x768](screenshots/02_heavy_knight-1366x768.png) | [1280x720](screenshots/02_heavy_knight-1280x720.png) | [390x844](screenshots/02_heavy_knight-390x844.png) |
| 魔女 | [1366x768](screenshots/03_witch-1366x768.png) | [1280x720](screenshots/03_witch-1280x720.png) | [390x844](screenshots/03_witch-390x844.png) |
| 大男 | [1366x768](screenshots/04_giant_warrior-1366x768.png) | [1280x720](screenshots/04_giant_warrior-1280x720.png) | [390x844](screenshots/04_giant_warrior-390x844.png) |
| 斥候 | [1366x768](screenshots/05_scout-1366x768.png) | [1280x720](screenshots/05_scout-1280x720.png) | [390x844](screenshots/05_scout-390x844.png) |
| 賢者 | [1366x768](screenshots/06_sage-1366x768.png) | [1280x720](screenshots/06_sage-1280x720.png) | [390x844](screenshots/06_sage-390x844.png) |

スクリーンショット確認後、ユーザーからコミット・プッシュ・既存main運用でのGitHub Pages公開を承認済み。
