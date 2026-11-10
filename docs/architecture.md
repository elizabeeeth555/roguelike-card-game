# 現行実装構造

## 入口と依存方向

ビルド不要のclassic JavaScript。`index.html`が本編を起動し、CommonJSでも純粋コアを読み込める。フレームワーク移行・API・DB・認証は未導入。
`UI/アプリ → 戦闘エンジン → 効果・数値・データ` の方向。`src/game/`からDOM、Audio、タイマー、共有appを参照しない。

| ディレクトリ・ファイル | 責務 |
|---|---|
| [index.html](../index.html) | script/CSS読み込み・画面入口 |
| [src/game/card-data.js](../src/game/card-data.js) | 現行19種・初期3セット・固定5ボス |
| [card-effects.js](../src/game/card-effects.js) | 状態とスキルから効果を構築 |
| [combat-math.js](../src/game/combat-math.js) | HP・バリア・毒・回復等の計算 |
| [battle-engine.js](../src/game/battle-engine.js) | 合法手・更新・ターン開始終了・勝敗・JSON境界 |
| [boss-planner.js](../src/game/boss-planner.js) | AI-2の列挙・候補選別・先読み |
| [progression.js](../src/game/progression.js) | 習得候補・追加・交換、イベント定数 |
| [src/app-state.js](../src/app-state.js) | ブラウザ側状態 |
| [src/app/](../src/app/) | 戦闘／習得制御、タスク世代、演出時間 |
| [src/ui/](../src/ui/) | DOM更新、操作、詳細、結果、FX、ログ |
| [src/styles.css](../src/styles.css)、[castle-ui.css](../src/castle-ui.css)、[readability.css](../src/readability.css)、[battle-layout.css](../src/battle-layout.css) | 基本配置→城内UI→可読性→戦闘寸法の最終レイヤー |
| [assets/](../assets/) | 素材マップとAudioエンジン、同梱素材 |
| [tests/](../tests/)、[scripts/](../scripts/) | 自動・ブラウザ・静的検査、計測 |
| research/two-boss/（`research/two-boss`、GitHub未収録） | 独立した世代ボス比較。公開本編に読み込ませない |
| [reports/](../reports/) | 条件・生データ・代表ログ・結果。過去結果を上書きしない |
| [src/game/legacy/](../src/game/legacy/)、[archive/v0.9.5/](../archive/v0.9.5/) | 旧三世代ルールと旧画面の隔離。現行導線に戻さない |

## 共通API・状態

```javascript
const Battle = require('./src/game/battle-engine.js');
const state = Battle.createState({playerDeck: ['slash','barrier'], bossPresetId:'boss_knight_defense'});
const result = Battle.transition(state, {type:'card',side:'player',id:'slash'});
// result: {state, ok, reason?, events}; 入力stateは不変
```

`execute`は可変更新、`transition`はコピーを更新。`availability`/`accelerationStatus`がUI・AI共通の使用可否を返す。
状態はschemaVersion 2 / ruleset first-era-trial。行動者・先攻・ラウンド・勝敗、各actorのdeck、hp/maxHP、mana/manaCap、ownTurn、used、readyOn、加速予約、barrier、poison、weak、manaPenalty、攻撃強化・布石を保持する。
`snapshot`/`restore`は参照共有を避け、異なる旧形式を無条件に復元しない。`readyOn`は所有者の自ターン番号。
イベントは実際に成立した操作を表し、コントローラーが視覚・音声を追従させる。リセット・再戦・勝敗でタスクを解除し古い継続処理を世代判定で無効化する。

## 研究との分離

2ボス研究は独立エンジン・planner・ページ・設定で仮数値を扱う。新2スキルはさらにdefense-skills配下に分離。
本編19種の定義は変更しない。研究の6枚・初手MP3を本編上限へ逆流させない。
旧研究two-boss-research-v2と新スキルtwo-boss-defense-skills-v1の保存形式を混同しない。JSONに書けることは新版セーブ機能の実装を意味しない。
FX Labは別PR。現在mainの入口・コードへマージされているとは扱わない。

## 起動・検査

```bash
python -m http.server 8000 --bind 127.0.0.1
# http://localhost:8000/
npm test
npm run check
npm run test:browser
npm run simulate -- 10
```

ゲームはfile://でも起動可能。Nodeは検査用。ブラウザスモークにはChromeが必要で`CHROME_PATH`指定可、成果は`.test-artifacts/`へ。シミュレーションは3初期セット×5ボス×シード、双方AI、40R観測打切り。人間の勝率ではない。
今回の文書整理では軽量なnpm test/checkのみ実行し、大規模シミュレーションや再描画・実機音声検証は行わない。
`package.json`の0.9.5は旧管理値で、現行に旧ルールが復活した意味ではない。

## GitHub Pages

静的なリポジトリルートを公開する運用。公開URL： https://elizabeeeth555.github.io/roguelike-card-game/ 。originはelizabeeeth555/roguelike-card-game。
現在のmainにPages workflowはない。GitHub側の公開元ブランチ・ディレクトリ設定は今回リモート照会していないため**未確認**。ローカルmainを根拠に設定確認済みとは書かない。
公開作業ではGitHub側設定、対象コミット、リモート差分を別途確認し、明示指示なしにpush/deployしない。

2026-11-10公開設定確認：GitHub Pagesはlegacy方式、mainブランチのルート（/）から自動公開。今回もこの設定を維持する。

## UI設定の最小適用経路（STEP 2-B②）

`presentation-config.js` → `presentation-adapter.js` → documentElementの既知CSS変数 → `battle-layout.css`。index.htmlでclassic scriptとして読み、main.jsが既定設定を初期適用する。本編のビルド、fetch、React依存は追加しない。

- [設定](../src/ui/presentation-config.js)：`GamePresentationConfig.normalize({desktop:{enemySkillHeightPx},mobile:{enemySkillHeightPx}})`。入力を変更せず、既知の自己データプロパティだけを読み、新しい凍結済み設定を返す。不正値・欠落値はプロファイル別の既定値へ戻す。
- [アダプター](../src/ui/presentation-adapter.js)：`GamePresentationAdapter.apply(normalized, style)`。同設定モジュールが正規化したオブジェクトのみを受け取り、`--ui-enemy-skill-height-desktop`／`--ui-enemy-skill-height-mobile`の2項目だけを反映する。テストではstyleを注入する。JSONを使う将来の入口でも、先にnormalizeを通す必要がある。
- CommonJSでも公開し、Nodeで同じ検証処理を試験できる。モジュール未読込時は起動側が適用を省略し、CSSの70px／77pxフォールバックが残る。
- 設定スキーマ全体・JSON読込UI・王座工房は未実装。操作可否・戦闘状態・素材・演出時間はこの経路に含めない。

## React移行とSteam将来対応の設計方針（2026-11-10承認）

**方針確定／STEP 3-Aの独立技術検証のみローカル実装済み、本編全体のReact移行・王座工房・本番切替は未実装**。上記のclassic JavaScript構造とGitHub Pages公開設定は現状説明であり、今後の到達形ではない。UIの本格制作開始に合わせて本編UIをReact＋TypeScript＋Viteへ段階移行し、王座工房も同じ技術を用いる。戦闘・スキル・AI・習得のロジックと検証成果は再利用し、ゲームルールを移行作業の都合で変更しない。

依存方向の目標：

- **ゲームコア**：戦闘状態・合法判定・イベント・進行を担う。DOM、React、ブラウザの保存先、Steamworks等へ依存させない。現行`src/game/`のCommonJS／classic script互換は、必要最小限のモジュールアダプターを通してReactから利用し、独断で全面書き換えない。
- **本編アプリ制御**：入力→ゲームコアの操作→結果イベント→表示・FX・SEへの通知を担う。旧`src/app/`／`src/ui/`のDOM直接更新、非同期タスク・キャンセル、演出のタイミングを段階的に置換し、二重のDOM所有や二重実行を避ける。
- **共有React UI**：SkillCard、HP／MP／CD表示、パネル、モーダル等の描画をpropsと正規化済み設定から組み立て、本編は実データ、王座工房は編集用データを与える。共通UIはゲーム内の副作用や編集操作を直接所有しない。共有可能性を優先するが、実装前から大規模な汎用パッケージへ再編しない。
- **王座工房**：汎用プロパティ編集・選択・プレビュー・保存と、『継世の王座』固有の設定スキーマ・素材ID・変換アダプターを分離する。Leva／React Moveable／タイムライン等の採用は検証段階で判断する。工房の編集データと本編の公開用設定を混同せず、任意HTML／JS／CSS実行や非公開素材のバンドルを許さない。
- **ホスト／配布アダプター**：ローカル保存、セーブの版管理・移行、音声、フルスクリーン、ウィンドウサイズ、入力デバイス、オフライン動作を独立させる。Web／PWA／PC配布版の共通化を目標にし、Steamworks実績・クラウドセーブ等は必要になったとき限定アダプターとして追加する。ゲームパッド・キーボード操作は移植を見据えて設計し、現時点で対応済みとはしない。

**Steamでの正式発売は保留／未決定**。Steam向けパッケージ方式（Electron／Tauri等）、必要なストア機能と具体的なSDKは未決定。家庭用ゲーム機への移植は対象外。Web・スマホ表示の品質を落とさず、プラットフォーム依存コードをゲームコアへ混入させないことで将来の選択肢を残す。

移行は旧版を保持した並行導線で段階的に検証する。STEP 3-AのVite／TypeScript技術検証基盤とコア接続はローカル実装・検証済み。以降は3-Bで戦闘・習得UI、3-CでFX／SEと入力、3-Dで旧版同等性と本番切替を確認する。現行Pagesは`main`ルートから静的公開されるため、React版のビルド成果物や配信経路を勝手に公開ルートへ上書きしない。公開方式変更・PRマージ・deployは個別承認が必要。以後、STEP 4で王座工房基盤とUI編集、STEP 5でFX編集、STEP 6でStory編集を進める。

本方針の実装状況・ロードマップは[status](status.md#本編react移行将来のsteam対応方針2026-11-10承認)を参照。

## STEP 3-A：独立React本編の技術検証

`apps/game-web/`にReact＋TypeScript＋Viteの実験アプリを分離する（ローカル実装／未公開）。ルートindex.html、既存classic UI、戦闘コア・AIは維持する。本編全体の移植ではない。

`React入力・状態 → battle-adapter.ts → 既存GameBattle / GamePlanner`。SkillCard・HealthBarはpropsベースの表示専用部品であり、工房との共有パッケージ化は未実施。保存・音声・OS入力などはホスト側の責務とし、コアへ持ち込まない。

Viteアダプターが公開コア5ファイルだけを依存順のclassic scriptとして配信／同梱する。コピー先はアプリ内dist/engineで、元ソースは変更しない。publicDir無効、devのファイル許可範囲も分離。React版distはGit除外・Pagesルートへの出力なし。起動・固定依存・検証手順は[アプリREADME](../apps/game-web/README.md)。
