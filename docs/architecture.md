# アーキテクチャと拡張時の使い方

2026-11-05：Ver.0.9.5のゲームルールを維持した構造整理。

## 依存の方向

```text
index.html / main.js
        ↓
src/app/                 ブラウザの進行制御・入力ガード・演出待機
        ↓                         ↓
src/game/                src/ui/ → assets/audio-engine.js
ゲーム状態・計算・ルール       DOM・ログ・画像・音声
```

`src/game/`はDOM、Audio、タイマー、アプリの共有変数を参照しない。
同じコードをclassic scriptとしてブラウザで、CommonJSとしてNode.jsで利用する。
`index.html`の直接起動とGitHub Pages公開に、ビルドやサーバーは不要。

## ファイルの責務

| ファイル | 責務 |
|---|---|
| `src/game/card-data.js` | カード仕様・世代設定・プール・ルート・説明。Node側では`require`可能 |
| `src/game/card-effects.js` | カードIDごとの効果ハンドラー。状態と計算用関数だけを受け取る |
| `src/game/combat-math.js` | ダメージ・回復・毒などの純粋計算 |
| `src/game/boss-planner.js` | AIの評価関数と予算内のカード選択 |
| `src/game/battle-engine.js` | 戦闘状態生成、カード使用、ターン更新、ボス能力、状態の複製・JSON境界 |
| `src/game/progression.js` | 獲得上限、入れ替え、強化、継承候補・複製 |
| `src/app/battle-controller.js` | ブラウザでの戦闘進行、入力制限、勝敗・継承遷移 |
| `src/app/draft-controller.js` | 道中の進行と選択操作 |
| `src/app/task-scope.js` | 解除可能な演出タスク。テストではタイマーを注入 |
| `src/app-state.js` | 既存画面用の共有状態。ゲームルール側からは参照しない |
| `src/ui/dom.js` | DOM取得ヘルパー |
| `src/ui/battle-events.js` | 共通コアのイベントを既存の演出・ログ・SEへ変換 |
| `src/ui/draft-render.js` | 道中・入れ替え画面 |
| `src/ui/result.js` | 勝敗画面・継承選択の表示 |
| `src/ui/render.js`, `effects.js`, `controls.js` | 戦闘表示・演出・補助操作 |
| `assets/asset-map.js`, `audio-engine.js` | 素材参照と音声再生 |

旧`src/game/battle.js`と`draft.js`のブラウザ制御は`src/app/`へ移動した。
カード効果の実体は`card-effects.js`、効果説明は`card-data.js`にある。

## 戦闘API

```javascript
const Battle = require('./src/game/battle-engine.js');
const Data = require('./src/game/card-data.js');

const state = Battle.createState({
  era: 1,
  draftCards: [Data.newCard('slash')]
});

// 元の状態を変更せず、新しい状態と表示用イベントを返す。
const next = Battle.transition(state, 1, 'useCard', state.deck[0].key);
console.log(next.state.bossHp, next.events);

// Setを配列に変換し、JSONで受け渡せる独立した状態を得る。
const json = JSON.stringify(Battle.snapshot(next.state));
const restored = Battle.restore(JSON.parse(json));
```

- `execute(state, era, command, ...args)`は渡された戦闘状態を変更し、`{result, events}`を返す。現行ブラウザのアダプターはこちらを利用。
- `transition`は独立した状態を作ってから同じ処理を実行する。Reactの状態管理やシミュレーションで利用できる。
- 主要コマンドは`useCard`、`commitBossPlan`、`expireBossBarrier`、`triggerThirdBossAbility`、`prepareEnemy`、`enemyCard`、`beginPlayer`。
- 現行の順序は、初期化後にバリア付与・計画確定、プレイヤー操作、バリア消去・第三紀能力、敵行動準備、各敵カード発動、次のプレイヤーターン開始。
- `hit`、`heal`、`playCard`は内部処理・検証向け。`playCard`単体はマナや使用回数を検証しない。
- イベントは`log`、`sound`、`cast`、`hit`、`finish`。DOMや音声を持たない実行環境では表示イベントを無視できる。
- 世代はセッション所有者が保持し、引数で渡す。JSONスナップショットは戦闘状態のみで、道中・世代を含む永続セーブ形式ではない。
- `newCard`、`pickRandom`、`createState`には乱数関数を渡せる。省略時は従来どおり`Math.random`を使う。

## React・サーバーへ移行するとき

Reactでは`transition`の返した状態を保持し、`src/ui/`をコンポーネントに置き換える。
既存の共有変数をコンポーネントから直接読み取る方式へ拡張しない。
効果音や演出はイベントを受け取るフロント側のアダプターとして扱う。

Node.jsでは共通コアをそのまま読み込める。サーバーがセッションと戦闘状態を所有し、
受信した操作を検証してコマンドへ変換する。内部コマンドをそのまま公開APIにしない。
認証、操作可能フェーズ、世代、敵行動の順序、通信形式・保存形式のバージョン管理は、
実際にサーバー化する際のアプリケーション層の責務。
今回、React依存、API、DB、通信・保存機能は追加していない。

## 演出と中断

コアの状態更新は同期的に完了し、演出の待機はブラウザ制御側だけで行う。
`task-scope`はリセット・再戦・世代開始時に予約を解除し、待機Promiseも解放する。
既存の`version`照合も維持し、解放された古い処理が新しい画面を操作しないようにする。
ターン表示のスキップとタイマーは`effects.js`の`hideTransitions`で管理する。

## 検証と維持する挙動

`npm test`で共通コア、操作統合、読み込み順、演出の中断を検証する。
`npm run check`は`src/`、`assets/`、`scripts/`、`tests/`の全JS/CJSを検査する。

`tests/fixtures/card-behavior-v0.9.5.json`は変更前に記録した624ケースの状態ハッシュ。
26カード×3レベル×刻印有無×使用者2種×通常／致死盤面を比較する。
デッキのランダムキーと行動予定を除いた戦闘状態を対象とする。
別途、具体的な期待値を持つ毒コンボ・継承・ターン更新等のテストも実施する。
意図的なカード調整では差異を確認し、期待値を無条件に上書きしない。

AIの計画タイミング、カード性能、強化・継承、HP、レイアウト、BGM/SEは維持した。
既知のAIの連携不足やカード説明の差異は、この構造整理ではバランス修正しない。
実ブラウザの描画・音声・スマホ操作は別途手動確認が必要。
