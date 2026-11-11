# 継世の王座 — React戦闘UI（STEP 3-A／STEP 3-B①）

独立した技術検証アプリ。本編公開デモの置換ではない。現行の`index.html`、戦闘コア、素材、公開設定は変更しない。

## 起動と検証

Node.js **24以上**、npmを利用する。リポジトリ直下から：

```bash
npm --prefix apps/game-web ci
npm --prefix apps/game-web run dev
```

アクセス先：`http://127.0.0.1:5173/`。Viteが別ポートを選んだ場合は出力に従う。ローカル配信を既定とし、外部へのアップロードは不要。

```bash
npm --prefix apps/game-web run typecheck
npm --prefix apps/game-web test
npm --prefix apps/game-web run build
npm --prefix apps/game-web run preview
```

previewは通常`http://127.0.0.1:4173/`。出力は**apps/game-web/dist/**のみ（Git除外）。Pagesの公開ルートへ出力・コピーしない。本編の起動にビルドを要求しない。このReactアプリ自体はHTTPサーバーが必要で、file://起動を対象にしない。

Chromium操作検証（先にdevまたはpreviewを起動）：

```bash
CHROME_PATH=/usr/bin/chromium CHROME_NO_SANDBOX=1 npm --prefix apps/game-web run test:browser
REACT_GAME_URL=http://127.0.0.1:4173/ REACT_GAME_BUILD=1 CHROME_PATH=/usr/bin/chromium CHROME_NO_SANDBOX=1 npm --prefix apps/game-web run test:browser
```

Linux環境の例。Windowsでは`CHROME_PATH`を実行ファイルのパスに設定し、通常は`CHROME_NO_SANDBOX`を指定しない。結果・スクリーンショットはルート`.test-artifacts/react-battle-ui/dev/`または`preview/`（Git除外）。

## 操作

固定の既存初期セットと既存ボス一覧の先頭を使用。初手MP2/上限3、HP20などはコアの既定値をそのまま使う。双方のHP・MP・ターン・バリア・毒、スキル名・MP・基本CD・残CD・使用不可理由を表示する。

プレイヤースキルの「詳細を確認」→「使用する」で発動。「ターン終了」で既存AI-2にボス行動を委譲し、次のプレイヤーターンへ進む。「再戦」で同じ条件の新規状態に戻る。STEP 3-B①では戦闘画面・ターン終了確認・公開済み背景／立ち絵／顔画像を移植。敵行動は同期即時処理で、FX・SE・BGM・習得画面は未移植。合法なスキルまたは加速が残る場合だけターン終了確認を表示する。

## 構造と共有責務

- `vite.config.ts`：コア5ファイルの許可リスト。本編のソースを変換・修正せず、devでは限定URL、buildでは`dist/engine/`に同じバイト列を渡す。HTMLへclassic scriptを依存順で挿入する。
- `src/battle-adapter.ts`：既存公開APIの最小型境界とホストのターン進行。状態を直接変更せずtransitionを呼ぶ。型は既存コアのうち使用する公開項目だけを記述し、コア全体のTypeScript化は行わない。
- `src/main.tsx`：読み込みと起動。`src/BattleScreen.tsx`が選択・確認ダイアログ・入力を所有し、`battle-session.ts`が状態とリビジョンを管理する。同じリビジョンの重複操作や再戦前の古い操作を拒否する。プラットフォーム依存処理をゲームコアへ入れない。
- `src/components/`：SkillCard、HealthBar、ResourceDisplay、StatusEffects、BattleHUD、BattleField、SkillDetail、ConfirmDialogをpropsベースで分離。SkillCardは敵味方共通、選択・読取専用詳細の通知だけを行う。使用・保存・音声の副作用は持たず、工房は将来プレビュー値を供給できる。共有パッケージへの移動は未実施。
- `tests/battle-adapter.test.cjs`：Node 24の型除去機能でアダプターを読み、元コアと結果を比較する。初手値・不正操作・入力非破壊・AIターン・再初期化・CD/条件表示・終了確認・リビジョン照合を確認。

今回のコア配布はビルド／開発アダプターであり、ゲーム本体のコピーを手編集して維持する方式ではない。依存ファイル追加時は許可リストと型契約・パリティ試験を更新する。

## 依存バージョン

package.jsonは完全固定、package-lock.jsonを同梱。確認時：React/React DOM **19.3.1**、Vite **8.3.7**、TypeScript **7.0.2**、@types/react/@types/react-dom **19.3.0**、@types/node **26.6.6**。実行環境はNode **24.22.1**。本編ルートのpackage.json・依存には追加しない。

## 公開・非公開の境界

ViteのpublicDirは無効。devのファイル許可範囲は当アプリ内、コアは固定5件だけを明示配信する。研究・購入素材・旧本編素材・非公開設定をimport/glob/copyしない。環境変数の公開接頭辞は`GAME_WEB_PUBLIC_`であり、ここへ秘密を置かない。`.env`除外だけではビルド混入防止にならない。distは公開可能なコアとReact画面、および固定許可リストの既存公開画像3件のみ。画像は既存assetsから同一バイト列を出力し、新しい素材の作成・変更はしない。OS・保存・音声・Steam向けAPIは将来ホストアダプターへ置き、コアへ依存させない。

## STEP 3-B①の表示・操作

上部は敵HUDと5スキル、中央は立ち絵とターン表示、下部はプレイヤーHUD・通常5枠・操作。初期所持はコア既定の2スキルで、空き枠は表示のみ。旧「継承専用・未解放」枠は削除し、その空き列も残さない。世代固有の固定奥義は仕様として存在するが、配置・形状の検証は別工程とし、今回は代替カード・ボタン・発動処理を追加しない。PCは1280×720／1366×768で1画面、760px以下は縦スクロール可能な構成。

敵・プレイヤーともホバー／フォーカスで読取専用詳細、クリック／タップでネイティブdialogを開く。敵には使用ボタンがない。プレイヤーは詳細内の「使用する」で確定。使用済／CD中は排他表示し、狭い通常パネルではCD表示を短縮、詳細で全文を確認できる。MP不足・条件未達と実使用可否はGameBattle.availabilityを正とする。オフターンのCDは同コアへの読取専用投影で照会し、投影結果で使用許可を与えない。

1〜5キーでスキル詳細、Spaceでターン終了、Escで詳細／確認取消。ボタンやdialog内では標準キー操作を優先する。

ブラウザテストは通常実行でPC1366px／スマホ390pxの加速予約表示・消滅とMP更新を検証する。専用環境変数による分岐は使用しない。通常8サイズで旧継承枠の不在、通常5枠とスキル列の全幅利用も確認し、ブラウザ内だけの初期状態fixtureで5スキル／各状態、勝利・敗北、合法手なしの終了を確認する。本番デバッグAPIやコアファイル変更は追加しない。

## 残課題／STEP 3-B②

共有UIのprops・テーマと設定モジュールの接続、型契約の拡充、自動検証・アクセシビリティ、Reactホストの入力／演出ライフサイクルを段階的に検討する。現在は同期AIであり複雑化時の応答性は未計測。固定の守護騎士戦で、ボス選択や習得UIは未移植。現行全画面・FX/SE/BGM・ログ・保存・王座工房の移植、Steam配布は未実装。公開デモ置換や本番デプロイは別承認とする。
