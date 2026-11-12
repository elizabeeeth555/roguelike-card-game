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
- `src/components/`：SkillCard、HealthBar、ResourceDisplay、StatusEffects、BattleHUD、BattleField、SkillDetail、ConfirmDialogをpropsベースで分離。SkillCardは敵味方共通、選択・読取専用詳細の通知だけを行う。使用・保存・音声の副作用は持たず、工房向けプレビューも同じ表示部品を使用する。共有パッケージへの移動は未実施。
- `tests/battle-adapter.test.cjs`：Node 24の型除去機能でアダプターを読み、元コアと結果を比較する。初手値・不正操作・入力非破壊・AIターン・再初期化・CD/条件表示・終了確認・リビジョン照合を確認。

今回のコア配布はビルド／開発アダプターであり、ゲーム本体のコピーを手編集して維持する方式ではない。依存ファイル追加時は許可リストと型契約・パリティ試験を更新する。

## 依存バージョン

package.jsonは完全固定、package-lock.jsonを同梱。確認時：React/React DOM **19.3.1**、Vite **8.3.7**、TypeScript **7.0.2**、@types/react/@types/react-dom **19.3.0**、@types/node **26.6.6**。実行環境はNode **24.22.1**。本編ルートのpackage.json・依存には追加しない。

## 公開・非公開の境界

ViteのpublicDirは無効。devのファイル許可範囲は当アプリ内、コアは固定5件だけを明示配信する。研究・購入素材・旧本編素材・非公開設定をimport/glob/copyしない。環境変数の公開接頭辞は`GAME_WEB_PUBLIC_`であり、ここへ秘密を置かない。`.env`除外だけではビルド混入防止にならない。distは公開可能なコアとReact画面、および固定許可リストの既存公開画像3件のみ。画像は既存assetsから同一バイト列を出力し、新しい素材の作成・変更はしない。OS・保存・音声・Steam向けAPIは将来ホストアダプターへ置き、コアへ依存させない。

## STEP 3-B①の表示・操作

上部は敵HUDと5スキル、中央は立ち絵とターン表示、下部はプレイヤーHUD・通常5枠・操作。初期所持はコア既定の2スキルで、空き枠は表示のみ。旧「継承専用・未解放」枠は削除し、その空き列も残さない。世代固有の固定奥義は仕様として存在するが、新第一紀の配置・形状の方針はUI正本を参照し、デザイン統合は別工程として、今回は代替カード・ボタン・発動処理を追加しない。PCは1280×720／1366×768で1画面、760px以下は縦スクロール可能な構成。

敵・プレイヤーともホバー／フォーカスで読取専用詳細、クリック／タップでネイティブdialogを開く。敵には使用ボタンがない。プレイヤーは詳細内の「使用する」で確定。使用済／CD中は排他表示し、狭い通常パネルではCD表示を短縮、詳細で全文を確認できる。MP不足・条件未達と実使用可否はGameBattle.availabilityを正とする。オフターンのCDは同コアへの読取専用投影で照会し、投影結果で使用許可を与えない。

1〜5キーでスキル詳細、Spaceでターン終了、Escで詳細／確認取消。ボタンやdialog内では標準キー操作を優先する。

ブラウザテストは通常実行でPC1366px／スマホ390pxの加速予約表示・消滅とMP更新を検証する。専用環境変数による分岐は使用しない。通常8サイズで旧継承枠の不在、通常5枠とスキル列の全幅利用も確認し、ブラウザ内だけの初期状態fixtureで5スキル／各状態、勝利・敗北、合法手なしの終了を確認する。本番デバッグAPIやコアファイル変更は追加しない。


## STEP 3-B②：同一戦闘画面の共有表示基盤

現行React技術検証画面を既定表示として維持したまま、ホストと描画を分離した。classic公開版・ゲームコア・AI・スキル定義は変更しない。新第一紀の確定デザインの全面実装・王座工房エディタは今回の成果ではない。

```text
本編：main → BattleScreen → battle-session / battle-adapter → 既存コア・AI
                         ↓ battle-presentation（明示フィールドの投影）
                     BattleViewModel → BattleView → components / 共通CSS
開発：preview-main → preview-presets ────────────↑
```

- `BattleScreen.tsx`：セッション・revision・ゲーム入力・選択・終了確認・再戦・キーボードと本編データ変換を所有する。
- `BattleView.tsx`：全体配置、既存のHUD／スキル／戦場／詳細／確認UI／メッセージを描画する。必要な通知はコールバック。ホバー・フォーカス・ツールチップ等の一時表示は描画側が所有する。戦闘コア・AI・セーブ・工房編集処理を呼ばない。
- `battle-view-model.ts`：表示専用型。キャラクター名・素材参照、HP/MP、状態表示、スキル説明・コスト・CD・使用可否と理由、空き枠数、ターン・勝敗・操作状態・メッセージ。deck/readyOn/ownTurnやrevision等のコア内部状態を含めない。
- `battle-presentation.ts`：既存コアに接続したアダプターの判定結果を表示データへコピーする。本編の合法判定は引き続きGameBattle.availabilityを正とする。
- `preview-presets.ts`：通常／特殊状態の固定仮データ。使用可否やCDのルール計算を持たない。素材は既存の公開許可リスト3件だけ。

### 起動・開発用プレビュー

```bash
cd apps/game-web
npm ci
npm run dev
# 本編モード：http://127.0.0.1:5173/
# 開発専用：http://127.0.0.1:5173/dev-preview.html
```

STEP 3-B②で導入した2状態は、現在は工房パネルのボタンで「通常戦闘」（通常HP/MP・2スキルと空き3枠）と「特殊状態」（MP不足・CD中・使用済み・状態異常／強化）を切り替える。戦闘整合性を保証しない固定仮データであることを画面に明示。スキルは閲覧できるが使用ボタンはなく、再戦・加速・終了は無効。戦闘コア・AIのscriptを読み込まず進行もしない。

`dev-preview.html`は開発サーバーのみの別入口。標準buildの入力は従来のindex.htmlだけで、プレビューHTML・コード・テスト用ホストをdistへ含めない。build／previewで工房を提供する機能や、公開ページへの新導線は追加しない。

### 最小デザイン設定（暫定インターフェース）

本編ホストの`BattleScreen`、プレビュー等の`BattleView`はいずれも任意の`design` propsを受け取る。同じ`battle-design.ts`が検証し、当該BattleViewの要素にだけ既知のCSS変数を設定する。STEP 3-B②自体では永続化・JSON入出力・編集パネルは対象外だった。今回の工房MVPの追加内容は末尾を参照。

```ts
const design = {
  hudBackground: '#101820dd',
  skillBorderColor: '#a89977',
  skillGap: 9,
  bossScale: 0.8
};
// <BattleScreen adapter={adapter} design={design} />
// <BattleView model={model} design={design} ... />
```

| キー | 入力・許容範囲 | 未指定／不正値の扱い |
|---|---|---|
| hudBackground | #RGB/#RGBA/#RRGGBB/#RRGGBBAA | 現行CSSのHUD背景色 |
| skillBorderColor | 同上 | 現行CSSのスキル枠線色 |
| skillGap | 有限数値0〜12px | 既存レスポンシブ値：通常PC7px、狭幅PC／スマホ4px |
| bossScale | 有限数値0.5〜1.25 | 既存の立ち絵サイズ（倍率1） |

数値文字列・NaN・Infinity・範囲外・任意CSS・未知キーを適用しない。省略へ戻すとCSS既定値へ復帰し、入力オブジェクトを変更しない。間隔は5列を維持する小幅な調整に限定、倍率は既存フィールド内のcontain表示と中央下基準の拡縮で、HUDや操作列をリフローさせない。これは限定的な試験範囲であり、将来の編集項目上限・最終JSONスキーマではない。共通外観の入口をレイアウトCSSから分け、PC／スマホ別の配置設定は将来別工程で設計する。

HUD背景色は現行技術検証用。新第一紀の枠なしHUDに背景パネルを設ける承認ではない。敵の左3／右2・鎖、通常スキルのアーチ、独立奥義、結晶MP、右端ログ、新詳細カードは別工程でBattleViewの構成／components／CSSを更新する。実データ変換はホスト側に留め、ゲーム用と工房用の画面を複製しない。将来FX/Storyも同じ描画ソースを共有する方針だが、今回は再生機構を実装していない。基準画像の実ファイルは未確認で、想像による代用は行っていない。

### 検証方法

既存コマンドを維持：`npm run typecheck`、`npm test`、`npm run build`、`npm run test:browser`。ブラウザテストはローカルdevサーバー起動後、利用可能なChrome/Chromiumを`CHROME_PATH`で指定する。Linuxコンテナで必要な場合だけ`CHROME_NO_SANDBOX=1`を指定する。

Node試験は投影とコア判定の一致、プレビューのコア非依存、設定の検証、共有描画の依存方向を確認する。通常のブラウザ試験は従来8画面幅・4fixture・加速予約試験に加え、dev時は両プレビュー状態とコア非読込、閲覧による状態非変更、外観4設定・不正値／既定値復帰を検証する。既定CSSは変更前の4項目のCSS宣言を試験用に適用し、色・間隔・戦場寸法を比較する。テスト用`tests/view-browser-harness.tsx`はdev試験だけで利用し、本編エントリーからimportしない。

スクリーンショット・JSON結果はリポジトリの`.test-artifacts/react-battle-ui/dev/`（build検証は`preview/`）へ保存され、Git管理対象外。ブラウザエミュレーションは実機評価ではない。FX/SE/BGM・ログ・本編の進行保存・新第一紀の進行／奥義／ボスは未実装。工房の基本外観編集・保存は下記MVPに限定。将来の表示・演出・素材制作計画の正本は[UI仕様](../../docs/features/ui.md)等を参照する。

## 王座工房MVP 第1段階：基本外観編集と保存

開発用の`http://127.0.0.1:5173/dev-preview.html`が工房入口になった。起動コマンドは上記`npm run dev`のまま。本編モード`/`やclassic公開デモは変更しない。工房は現行React技術検証画面を編集対象としており、新第一紀の確定デザインや工房全体の完成版ではない。

パネルで既存4項目を入力すると、同じBattleViewへ即時反映する。色は既存の16進表記、数値は上記の許容範囲を使用する。空欄・項目ごとの「既定に戻す」・「すべて既定に戻す」はキーを削除し、画面幅に応じたCSS既定値へ戻す。無効な入力は表示してエラーを知らせ、直前の有効な外観を維持する。通常／特殊状態を切り替えても外観設定を保持する。スキル詳細は閲覧のみで、戦闘操作は実行しない。

有効な編集は自動保存する。「ローカル保存」で再試行、「保存済みを読込」で保存値を再読込できる。保存不能時も編集は継続でき、JSONで退避できる。保存先は端末・ブラウザ・オリジン（ポートを含む）ごとで、端末間同期ではない。無効な入力途中の文字列やプレビュー状態選択は保存せず、有効な外観設定だけを保存する。

### 暫定JSON形式と保存境界

本段階だけの最小形式であり、工房全体の最終スキーマではない。FX LabのJSONとは互換とみなさない。

```json
{
  "format": "throne-studio.battle-design",
  "version": 1,
  "settings": { "skillGap": 9, "bossScale": 0.8 }
}
```

`settings`は既存BattleDesignの4キーのみ。省略はCSS既定値を意味する。未知キー・不正値・破損JSON・未知形式・非対応バージョンを拒否し、失敗時は現在の有効な編集内容と保存済みデータを維持する。サイズ上限は32KiB。素材データ・パス・スクリプト・任意CSSを保存する形式ではない。

「JSONを書き出す」は`battle-design.studio.local.json`をダウンロードする。「JSONを読み込む」は端末内のファイルだけを読み、成功時にプレビューと自動保存へ反映する。ブラウザを再読込してからJSONを読み込む場合や別端末へ持ち運ぶ場合も同じ操作。ファイルは外部へアップロードしない。

localStorageキーは`throne-studio.battle-design.v1`で、本編の進行保存と分離。破損・非対応の保存値は起動時に自動削除・上書きせず警告する。利用者が有効な編集・初期化を行うと、その工房キーへ保存する。他キーは変更しない。保存が使えない場合は画面内に警告し、JSON書き出しを案内する。

責務：

- `studio/StudioScreen.tsx`：編集UI、入力途中値・エラー、プリセット、ファイル選択／ダウンロード。BattleViewを直接再利用し、描画へ編集イベントを持ち込まない。
- `studio/battle-design-editor.ts`：本作の外観編集状態と採用キー・形式ID・保存キーの接続。成功した編集だけ保存し、不正インポートでは現在値を保持する。
- `studio/settings-document.ts`：画面非依存の形式・バージョン検証、JSONシリアライズ、注入された保存ポートへの安全な読込／書込。別画面には別の形式ID・バージョン・値検証を接続できる。
- `battle-design.ts`：4設定の検証・許容範囲・CSS適用の管理元。描画と工房で同じ検証を利用する。HUD背景は技術検証用であり、新第一紀の枠なしHUDを変更しない。

PCは編集パネルとプレビューを横並びにし、1100px以下は縦に並べる。パネルはキーボード・タッチで操作でき、プレビューは既存の760/761px境界を維持する。無制限な絶対座標編集、ドラッグ、工房設定の本編自動適用はない。

既存の型チェック・ビルド・単体／ブラウザ試験に、編集の検証、既定値復帰、JSON往復・拒否、リロード復元、破損データ保持、保存失敗からの継続を追加。ブラウザ試験は実際のファイルダウンロードとローカルJSON読込も行う。`allowImportingTsExtensions`はNodeの直接TS試験で同じ保存処理を読むための型チェック設定であり、本編への新ビルド要件ではない。開発専用入口・工房コード・テストホストが標準distへ含まれないことも確認する。

将来の新第一紀UI・拠点・編成では、画面固有の表示／設定検証を差し替えつつ、この保存ポート・JSONエンベロープ処理を再利用する。将来の素材管理・レイアウト編集・FX/Story用の巨大な共通スキーマは先行実装していない。
