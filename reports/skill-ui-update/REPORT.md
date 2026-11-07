# スキル構築型ローグライクRPG UI 改修

## 変更内容

前回の承認済み本体改修（D案/AI-2/消耗/5イベント/2リロール/スキップ/入れ替え）を維持し、今回は表示と演出を変更。ゲーム内はスキル・スキル習得・スキルセット・継承スキルへ統一。内部card/deck/IDは変更しない。src/gameの全JSは今回のUI作業開始時とハッシュ一致。背景/立ち絵/音声素材を変更せず、新画像は生成していない。

| 対象 | 修正後 |
|---|---|
| 通常パネル | 左上名前、右上♦MP、中央効果概要、右下⌛基本CD（0も表示）。分類を整理し狭幅は折返し/省略 |
| 状態 | 使用した自ターンだけ使用済、それ以外で残CDがあればCD中（残nT）。単一中央表示で排他、色分け |
| 戦闘詳細 | 効果全文だけ。使用ボタンの合法判定は維持し、敵にボタンなし。計算/HPバー予測は残す |
| 敵の選択 | 本体は移動/拡大せず、詳細だけ左右8px内に補正。左右端を全サイズで検査 |
| 数値 | 赤−n、緑＋n、ハートなし。敵は上、プレイヤーは下。バリア消費は⬡で分離。既存ノード再利用で重ねない |
| 開始 | BATTLE START金系→完全消去→短い間→青YOUR TURN。再戦も同様、リセットで残留しない |
| 時間 | 通常YOUR/ENEMYは2500→2000ms。高速450→350ms。STARTは1100/450ms、間は150/60ms |
| 常時ターン | 小さな青/赤の枠で強調 |
| 右上 | 音量→設定。設定内容/保存処理は維持 |
| HUD | 顔PC50px/スマホ44px。PCはスキル領域と上端一致、下方向へ拡張可能。スマホ縦配置は維持 |
| 毒/MP | 毒は紫の文字アイコン/枠、数値は明色。MPは♦系で統一 |
| 習得詳細 | 名前/効果全文/閉じる/習得または入れ替え。リロール/スキップは通常画面に集約 |

既存のCD計算、毒、加速、消耗、スキル値、AI、ボス構成、最大5、5イベント、2リロールは変更しない。今回は習得詳細内のリロール/スキップUIをユーザー指示で撤去したため、詳細を閉じて通常画面で操作する。

## 確認

- npm test：82件成功。npm run check：成功。
- 専用Chromium/Playwright：243項目成功。320×844、375×812、390×844、430×932、768×1024、1366×768。
- CD0/1/2を両所有者で実reducer経由で検査。使用済/CD中は同時表示なし。相手ターンで不正にCDを進めない。
- MP/名前/効果/CDの重なりなし、横スクロールなし。敵左右端の選択前後の位置差1px未満、詳細枠が左右余白内。
- 効果全文だけの詳細、無効な使用操作の阻止、通常画面のリロール/スキップ、演出の順序と間、音量/設定順、毒、数値、PC HUD上端を確認。
- 既存castle-ui-smoke：144項目成功。過去の出力を上書きしないよう出力先を.test-artifacts/castle-uiへ変更。
- 既存npm run test:browserもHTTPで成功。JSエラーなし。実機スマホ/音声聴感は未検証。file://はこの環境のChrome管理ポリシーにより未検証（前回確認済み制約）。
- 前回の研究一致79局面/64対戦は前回テストに含めて保持。今回も79局面一致テストを実行した。研究原本3012ファイルもハッシュ一致。

専用ブラウザ検査：ローカルHTTPサーバーを18080で起動し `python reports/skill-ui-update/browser.py`。

## スクリーンショット

- [通常](screenshots/normal-390.png)
- [使用済](screenshots/used-390.png) / [CD中](screenshots/cooldown-390.png)
- [戦闘詳細](screenshots/player-detail-390.png) / [右端の敵](screenshots/enemy-right-390.png)
- [習得詳細](screenshots/acquisition-detail-390.png)
- [PC HUD](screenshots/pc-hud.png) / [ダメージと回復](screenshots/damage-heal-390.png)
- 修正前は前回の `reports/demo-ai-draft-update/screenshots/` を参照。

## コミット範囲と制約

前回承認済み改修＋今回UI＋関連テスト/現行文書を明示ステージ。前回検証からは報告・代表画像・独立再現可能な64対戦参照データ/比較コードだけ含める。研究4フォルダ、大量生ログ、作業用ハッシュ一覧/ログ等は含めずローカルに保持する。

MP統一も対応し、機能項目の見送りなし。実機での文字サイズ/タッチ・音声は次の確認事項。スキルが5枚横並びの狭幅では名前は折返し、概要は省略し詳細で全文を読む。新規特性・イラスト・6枠目は追加していない。

ローカルコミットのみ実施する。プッシュ/デプロイは行わない。

## 変更ファイル一覧（前回分含む）

- `AGENTS.md`
- `README.md`
- `docs/README.md`
- `docs/first-era-architecture.md`
- `docs/first-era-decisions.md`
- `docs/game-design.md`
- `docs/roadmap.md`
- `docs/specs/first-era/02-combat-rules.md`
- `docs/specs/first-era/03-card-pool-A-D.md`
- `docs/specs/first-era/04-progress-and-boss-presets.md`
- `docs/specs/first-era/05-battle-ui-spec.md`
- `docs/specs/first-era/07-acceptance-tests.md`
- `docs/specs/first-era/08-pc-battle-ui.md`
- `docs/specs/first-era/09-castle-ui-request.md`
- `index.html`
- `scripts/browser-smoke.cjs`
- `scripts/castle-ui-smoke.py`
- `src/app-state.js`
- `src/app/battle-controller.js`
- `src/app/draft-controller.js`
- `src/castle-ui.css`
- `src/game/battle-engine.js`
- `src/game/boss-planner.js`
- `src/game/card-data.js`
- `src/game/progression.js`
- `src/main.js`
- `src/ui/battle-events.js`
- `src/ui/controls.js`
- `src/ui/draft-render.js`
- `src/ui/effects.js`
- `src/ui/render.js`
- `src/ui/result.js`
- `tests/battle-engine.test.cjs`
- `tests/progression.test.cjs`
- `tests/adopted-rules.test.cjs`
- `tests/fixtures/ai2-adopted-cases.json`
- `docs/specs/first-era/11-ai-exhaustion-draft.md`
- `docs/specs/first-era/12-skill-ui.md`
- `reports/demo-ai-draft-update/REPORT.md`
- `reports/demo-ai-draft-update/integration.json`
- `reports/demo-ai-draft-update/reference-battles.json`
- `reports/demo-ai-draft-update/verify-integration.cjs`
- `reports/demo-ai-draft-update/baseline-planner.txt`
- `reports/demo-ai-draft-update/screenshots/before-draft-1366.png`
- `reports/demo-ai-draft-update/screenshots/after-draft-1366.png`
- `reports/demo-ai-draft-update/screenshots/after-draft-390.png`
- `reports/demo-ai-draft-update/screenshots/card-details-390.png`
- `reports/demo-ai-draft-update/screenshots/replacement-390.png`
- `reports/demo-ai-draft-update/screenshots/battle-1366.png`
- `reports/demo-ai-draft-update/screenshots/exhaustion-log-390.png`
- `reports/skill-ui-update/REPORT.md`
- `reports/skill-ui-update/browser.py`
- `reports/skill-ui-update/browser-results.json`
- `reports/skill-ui-update/rules-preservation.json`
- `reports/skill-ui-update/changed-files.json`
- `reports/skill-ui-update/screenshots/normal-390.png`
- `reports/skill-ui-update/screenshots/used-390.png`
- `reports/skill-ui-update/screenshots/cooldown-390.png`
- `reports/skill-ui-update/screenshots/player-detail-390.png`
- `reports/skill-ui-update/screenshots/enemy-right-390.png`
- `reports/skill-ui-update/screenshots/acquisition-detail-390.png`
- `reports/skill-ui-update/screenshots/pc-hud.png`
- `reports/skill-ui-update/screenshots/damage-heal-390.png`
