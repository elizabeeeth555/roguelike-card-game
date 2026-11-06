# 古城UI・6キャラ素材組み込み 作業報告

実装・テスト・スクリーンショット作成まで完了。コミット・プッシュ・デプロイは未実施。レビュー待ち。

## 作業状態と変更範囲

- ベース：`a046e4cf7fad3bd6081ba874f43018fb3fc10564`。開始時のwork/mainリモート先端と一致。開始時の未コミット変更なし。
- 作業ブランチ：`ui/castle-six-characters`。変更は未コミットで保持。
- 最新の提供仕様は `docs/specs/first-era/09-castle-ui-request.md` に保存。以前の敵味方同時拡大・大男/斥候の旧画像除外を置換。
- 戦闘ルール・カード性能・AI・バランスコードは変更していない。`src/app/`・`src/app-state.js`も変更なし。
- 追跡中の保護対象20ファイルがベースコミットとバイト単位で同一（`protected-files.json`）。追跡されていない既存バランス成果物も今回の編集対象にしていない。

## 6キャラ対応表

添付画像を内容で目視確認。原本を破壊的にリネームせず、分かりやすい名前で保存。全原本853×1280の白背景JPEGで、アルファ透過なし。

| 元ファイル名 | 判定 | 保存した原本ファイル名 |
|---|---|---|
| 2-写真2.jpg | 黒剣士 | 01_black_swordsman.jpg |
| 3-写真3.jpg | 重装騎士 | 02_heavy_knight.jpg |
| 4-写真4.jpg | 魔女 | 03_witch.jpg |
| 5-写真5.jpg | 大男 | 04_big_man.jpg |
| 6-写真6.jpg | 斥候 | 05_scout.jpg |
| 7-写真7.jpg | 賢者 | 06_sage.jpg |

## 加工素材

- `assets/characters/masters/`：6枚の原本JPEG。元画像のバイト列を保持。
- `assets/characters/castle/`：各人の全身透過PNG `_boss`、256×256顔PNG `_face`、最大640×768の上半身PNG `_bust`。合計18枚。
- 全身は透明余白だけを除去。色・顔・衣装・装備・ポーズを再生成/描き直ししていない。白マット除去、境界アンチエイリアス、髪/杖の囲まれた白領域も調整。
- バストアップは素材として準備し、不要な画面へ追加表示していない。黒剣士も全身マスターを保持し、現行プレイヤー側は顔アイコンを使用。
- `04_giant_warrior` のゲームIDを保持し、素材名は指定通り `04_big_man`。
- `assets/backgrounds/castle_corridor.png` / `castle_throne_room.png`：提供原本そのまま（ZIP内と一致）。同名WebPを配信に使用。回廊約252KiB・玉座約216KiB。
- 寸法・SHA-256・元名・派生先は `assets/characters/manifest.json`。透過画素数・背景同一性は `asset-audit.json`。加工再現は `scripts/prepare-castle-assets.py`。
- 一覧画像：`character-sheet.png`。新規画像生成は実施していない。

## UI実装

- 継ぎ目のない回廊/玉座背景。枠付き大パネルを撤去し、上下の局所暗転で文字を保護。
- 左上TURN（内部roundの数え方は維持）、水平中央のボス名・HPバー・HP数値、下に可変MP菱形と発生中の状態アイコン。
- ボスは中央に大きく表示。PCでは下半身が手札の背後に重なる配置を採用。全身画像自体は保存。
- 左下HUDは外枠なし、幅230px、PCでは手札の下端と一致。通常5枚→幅約75%の継承枠→右下2段操作。
- 右上は歯車とスピーカーだけ。設定/音量は同時に開かず、最初からには確認。Esc/外側クリックでも閉じる。
- ログは右端の中央タブから右ドロワー。開いたまま敵AIのターンと演出が完了することを確認。
- 敵カードは常時5枚。敵味方合計で拡大1枚、約1.5倍、手札は上・敵は下へ展開し画面内へ補正。予測HP/バリアを維持。
- 使用演出は元位置付近の浮上/種別色発光。中央移動なし。敵の1枚ずつの実行待機は既存処理を維持。
- 基本CD（下部）/残CD（右上）/使用済（暗転＋文字）/MP不足（赤コスト）/条件未達（警告＋破線）を区別。
- スマホは敵→立ち絵→自分HUD→手札/継承→操作の順に再配置。狭い手札の本文は要約し、タップで全文を読める。

## 検証結果

- `npm test`：71件成功、失敗0。
- `npm run check`：全JS/CJS構文チェック成功。
- `BROWSER_TEST_URL=http://127.0.0.1:18080/ CHROME_PATH=/usr/bin/chromium CHROME_NO_SANDBOX=1 npm run test:browser`：成功。5サイズ、初期導線・勝敗・再戦・中断・音量・フォールバック。
- `python scripts/castle-ui-smoke.py http://127.0.0.1:18080/`：144項目成功。道中から戦闘、PC/スマホ配置、全カードの画面内拡大、同時1枚、全6立ち絵、排他的メニュー、リセット確認、ログ中の敵ターン完了、HP/バリア同時表示。
- 1366×768、1280×720、360×800、390×844、430×932：スクロール幅・高さともviewportと一致。操作・継承枠が画面内。PCのHUD/手札下端一致。
- JavaScript例外0、HTTPリソースエラー0。`git diff --check`成功。
- 環境のChromiumはfile://アクセスを管理ポリシーで拒否するため、今回の実ブラウザ検証はローカルHTTPで実施。classic script構成は維持。file://の実ブラウザ動作はこの環境では未検証。

## 保留・妥協点

- 白背景JPEGからの切り抜きのため、細い髪・杖の周囲に薄い明縁が一部残る。暗背景一覧と各ボス画面をレビューしてほしい。大きな白背景残りは除去済みだが、完全な手作業マスクと同等とはしていない。
- PCではボスの足元を手札が覆う。上半身の見栄えとカード可読性を優先。マスター/加工全身には欠けを追加していない。
- スマホの通常カード本文は短縮表示。タップ拡大/詳細で全文を確認できる。
- スマホ実機タッチ、音声の聴感、他ブラウザでの表示は未確認。ヘッドレスChromiumの音量設定操作は確認。
- コミット・プッシュ・デプロイはユーザーのスクリーンショット確認後。

## スクリーンショット

`screenshots/` にPC2サイズ・スマホ3サイズの戦闘全体/カード拡大/道中/道中3択と、6人のボス素材表示を保存。

- [PC 1366×768](screenshots/battle-1366x768.png) / [PC 1280×720](screenshots/battle-1280x720.png)
- [カード拡大](screenshots/card-expanded-1366x768.png)
- [敵カード使用済/CDとログ中の進行](screenshots/enemy-used-cd-and-log.png)
- [ログドロワー](screenshots/log-drawer.png)
- [HP/バリア・状態](screenshots/hp-barrier-and-status.png)
- [道中3択](screenshots/draft-choices-1366x768.png)
- [スマホ360](screenshots/battle-360x800.png) / [390](screenshots/battle-390x844.png) / [430](screenshots/battle-430x932.png)
- [6人の透過立ち絵と顔の一覧](character-sheet.png)

## 変更ファイル一覧

完全な一覧は [CHANGED_FILES.md](CHANGED_FILES.md)。主な変更：

- `index.html`、`src/castle-ui.css`：DOM、背景・HUD・カード・スマホ配置。
- `src/ui/controls.js`、`render.js`、`effects.js`、`draft-render.js`、`src/main.js`：1枚拡大・画面内補正、MP菱形、背景切替、設定/音量、リセット確認。
- `assets/asset-map.js`、`assets/characters/manifest.json`、素材各ディレクトリ：原本保存と新素材の参照。
- `scripts/prepare-castle-assets.py`、`castle-ui-smoke.py`、`browser-smoke.cjs`：素材加工、表示検証、新仕様に合わせた既存スモークの更新。
- `tests/assets.test.cjs`、`tests/progression.test.cjs`：旧画像除外/同時2枚拡大の期待値を今回の明示仕様に更新。ゲームルールのテストは保持。
- READMEとUI関連資料：最新仕様への導線・旧仕様の置換注記。
- `reports/castle-ui/`：本報告、スクリーンショット、検証JSONとログ。
