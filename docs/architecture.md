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
