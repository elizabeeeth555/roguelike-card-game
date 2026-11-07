# 第一紀検証版の構成と検証

## 分離と入口

`src/game/`はDOM・Audio・タイマーを参照しない。classic scriptとCommonJSの両方で使う。
現行HTMLは新ルールのモジュールだけを読み込む。

| 場所 | 責務 |
|---|---|
| `card-data.js` | A〜D19種、5ボスプリセット、3初期ビルド、種別と色分類 |
| `card-effects.js` | 盤面から効果命令を作る。数値は仕様書どおり |
| `combat-math.js` | ダメージ、バリア吸収、回復、毒上限、マナ補充 |
| `battle-engine.js` | 行動者、双方の状態、合法手判定、スキル・加速・ターン更新 |
| `boss-planner.js` | 合法な順序列を探索し、相手の応答と次の自ターンを評価 |
| `progression.js` | 初期2枚・重複除外・5イベント/入れ替え/2リロール/スキップ |
| `src/app/` | ブラウザの進行、演出待機と中断、再戦 |
| `src/ui/` | DOM、詳細・確認ダイアログ、ポップアップ、ログ、イベント演出 |
| `assets/asset-map.js` | 背景・音源・6キャラIDと加工画像。新素材では大男・斥候も有効 |

旧ルールの6モジュールは`src/game/legacy/`に隔離。旧スキル・強化・継承と624ケースの回帰テストを保持している。
旧画面のソースは`archive/v0.9.5/`に参考保存した。これは独立して起動する旧デモではない。
新たな公開モードは追加していない。入力パッケージの必要内容は正式配置済みで、整理時に入力フォルダを削除した。資料一覧は [README.md](README.md) を参照。

## 状態とAPI

```javascript
const Battle = require('../src/game/battle-engine.js');
const state = Battle.createState({
  playerDeck: ['slash', 'dash_slash', 'barrier', 'first_aid', 'corrosion'],
  bossPresetId: 'boss_witch_poison'
});
const out = Battle.transition(state, {type:'card', side:'player', id:'slash'});
// stateは不変。out = {state, ok, reason?, events}
```

`execute(state, action)`は渡された状態を変更。`transition`は独立したコピーへ同じ処理を実行。
`availability`と`accelerationStatus`が使用不可理由を返す。UIとAIで共用する。
スキルIDと同一ターン使用履歴を別に管理し、`readyOn`は使用者の自ターン通算番号を保持する。
現在の行動者・先攻側を明示し、先攻ボスの初回補正にも対応できる。

状態はschemaVersion 2 / ruleset first-era-trialのJSON。`snapshot`/`restore`は参照を共有せず、旧形式の復元を拒否する。
永続セーブ・API・DB・認証は追加していない。
将来のReactは同じ不変更新を利用し、サーバーはセッションを所有して外部操作を検証する。

イベントは実際に成立した操作だけから返す。コントローラーがその後に敵スキル発光やSEを適用する。
再戦・最初からの際は演出タスクとターン表示を解除し、versionでも古い継続処理を排除する。

## AI

行動順・CD・マナ・毒条件を、戦闘コアのコピーで実行して評価する。
目の前の勝利は全行動列から選択。通常は上位候補に対する相手の最善応答と、次の自ターンの展開を短く探索する。
上位候補がすべて即敗北の場合は、それ以外の候補も安全な手が見つかるまで調べる。
評価にはHP、毒の見込み、バリア、弱体、妨害、加速後のマナ、布石を使う。
タイブレークは固定。未来の報酬や乱数は参照しない。全期間の完全最適ではない。

## 実行

```powershell
npm test
npm run check
npm run test:browser
npm run simulate -- 10
```

通常テストと構文検査はNode.jsのみ。Chrome検証はインストール済みChromeを使う（`CHROME_PATH`で指定可能）。
ブラウザ用の追加npm依存は不要。制限環境ではChrome描画プロセスの実行許可が必要になる場合がある。
検証出力は`.test-artifacts/`に保存し、Gitの対象から除外する。

シミュレーションは初期3ビルド×5ボス×10シード＝150戦。報酬選択は固定シードの乱択、双方の戦闘操作は同じAI。
人間の勝率ではなく、条件を固定した参考観察。試験側だけ40ラウンドで打ち切り、未決着を別集計する（ゲーム内に制限なし）。
決着ラウンドの平均・中央値、相性別結果、加速履歴・最終上限、選択・使用回数をJSONへ出力する。
数値調整は自動で行わない。

## 2026-11-06の検証結果

- `npm test`：65件成功。新ルール・操作統合・素材・中断と、隔離した旧ルールの回帰を含む。
- `npm run check`：成功。
- Chromeのfile://起動：1366×768、360×800、390×844、430×932で手札5枚・操作帯・継承予約枠の表示を確認。横はみ出しなし。
- 実ブラウザ操作：スキル詳細、再戦、最初から、中断、予約アイコンのフォーカス／クリック説明、音量設定の状態変更、画像代替を確認。実行時例外なし。
- 固定シード150対戦：プレイヤー側78勝、1〜2R決着0、3〜5R決着91、6R以上59（未決着1を含む）。決着した149戦の平均5.47R、中央値5R。
- 中速ビルド×重装騎士・seed 2は40R終了時も未決着。双方上限3で加速せず、継続する防御型AIの停滞として観察を続ける。

AI同士・小さい固定シード標本であり、人間の勝率や正式なバランス評価ではない。
実機タッチ・音声の聴感は未確認。数値変更は行っていない。


## PC UI改修（2026-11-06）

現行UIは[承認されたPC UI仕様](specs/first-era/08-pc-battle-ui.md)を優先する。
中央ボス・公開敵5枚・コンパクトな顔HUD・手札右の操作列・ログドロワーを使用。
`app.selectedPlayer`と`selectedBoss`は各1枚、`playerAnimating`は選択可と効果実行不可を分けるUI状態。
本番GameBattle/PlannerのAPI・ルールは変更しない。予測は既存Effects/Mathの純粋計算から作り、戦闘を更新しない。
CDはreadyOnとownTurnから表示する。残CDは今後の使用不可自ターン数（使用ターンを除く）、使用済は所有者のターン中だけ。
ターン終了確認はlegalActionsにスキルまたは加速がある場合のみ。MPが余っていても何も実行できなければ確認しない。
Nodeの既存テスト・UI回帰は71件。実ブラウザ追加確認は`python3 scripts/ui-pc-smoke.py URL`（Python PlaywrightとChromiumが必要）。
詳細は[検証記録](../reports/pc-ui-rework/REPORT.md)。過去節のPC斜め配置・背面立ち絵の検証結果は旧UIの履歴。

最新の古城UI表示仕様は [09-castle-ui-request.md](specs/first-era/09-castle-ui-request.md)。敵味方通算1枚拡大、回廊／玉座背景、6人の提供素材へ更新。`src/castle-ui.css`が旧スタイルを上書きする。

## 最新反映（2026-11-07）

正式採用・本体反映：結界/堅守CD1、AI-2（上位8＋加速/布石各最大2候補）、12Rから各自ターン開始の消耗ダメージ。毒は終了時を維持。
デモ暫定：獲得イベント5回、上限5枚で入れ替え、周回合計2リロール、無制限スキップ。全スキップなら初期2枚で戦闘可能。新周回は回数初期化。
AI-L/AI-D/AI-4、幅24、探索延長、強化/特性/継承6枚目は未実装。詳細は `docs/specs/first-era/11-ai-exhaustion-draft.md`（リポジトリルート基準）。過去研究は当時の条件として保持する。

## スキル構築型RPGのUI（2026-11-07）

現行の方向性はスキル構築型ローグライクRPG。最新UI仕様は `docs/specs/first-era/12-skill-ui.md`（ルート基準）。スキルのMP/基本CDを独立表示、使用済/CD中は排他、詳細は効果全文のみ。習得詳細のリロール/スキップは通常画面へ集約。BATTLE STARTとターン演出、毒・数値演出、HUDを改善。内部card/deckは互換性のため維持する。戦闘・習得ルールは前回の採用仕様から変更しない。
