# AI・消耗・デモ構築の本体改修

## 実装

正式採用の結界/堅守CD1、AI-2、12Rからの消耗をゲーム本体へ統合。暫定デモの獲得イベント5回、周回2リロール、無制限スキップ、5枚到達後の入れ替えを追加した。通常デッキは上限5枚のまま。全スキップなら初期2枚で戦闘可能。

既存の城背景・立ち絵・戦闘レイアウトを保持。新カード、特性、強化、正式継承/6枚目、AI-D/L/4、幅24、探索延長は導入しない。毒は従来の本人終了時。他17枚のCD/コスト/効果は変更しない。

### AI-2

`src/game/boss-planner.js` のplanで従来の静的上位8行動列を維持し、全候補から加速/布石を含む異なる終了状態を各2件まで追加。追加候補群の終了状態判定だけを正規化し、通常候補全体の重複除去はしない。未知フィールド/攻撃履歴を保持し、現行が集合として読むusedだけ順序を正規化。将来used順序を読む特性を導入する場合は再監査が必要。

評価関数・現在/応手/次自ターンの係数は従来通り。即時勝利と全候補即敗北時の安全手探索を維持。通常最大12候補だが安全手探索では超える場合がある。強制予算/探索キャッシュは追加しない。加速/布石の頻度を強制する報酬は設けない。

### 消耗の順序

共通エンジンのstartTurn冒頭で `applyStartEnvironment` →致死なら即finish/return→自ターン更新→予約加速/補充/妨害→予約バフ等→行動。R<12は0、以降 `1+floor((R-12)/2)`。前のターン終了毒・バリア期限は従来通り先に処理する。

`environmentDamage` / `kind:exhaustion` / `source:environment` として通常攻撃/毒から区別。バリアを消費せずHPへ直接適用。UIはHP、消耗ログ、ダメージ数値、勝敗を更新。結果に消耗での決着を表示。TURN数字のtitleに12R開始/現在量の簡単な案内。AIも同じreducerを使う。

### 構築操作

- 獲得・入れ替え・スキップのいずれかでイベントを1消費。合計5で戦闘へ。初期ビルド選択は変更しない。
- 5枚到達後は入れ替え先をインラインで選択。キャンセルではデッキ/イベント/候補を保持。
- リロールは合計2回、イベント数を消費せず残数持越し。直前候補を優先除外し、プール不足時は重複なしで補完。選択/入れ替え待ちを解除。
- スキップは未選択/詳細表示/入れ替え待ちでも可能。確認なし・無制限、デッキ/リロール残不変。詳細ダイアログにもリロール/スキップを設置。
- 新周回で全構築状態を初期化。同条件再戦は現在デッキとボスを維持。

## 検証

- `npm test`：79件成功（79保存局面の一致も1テスト内で検査）。`npm run check` 成功。
- 新規回帰：防御CD/他17枚CD、消耗なし/開始/増加境界/両側/致死/毒維持/先読み、候補抽選の少数プール、入れ替え・取消・リロール持越し/上限・選択解除・全スキップ2枚・新周回リセット。
- 保存研究の79局面でAI-2の行動列一致、入力不変/合法手/即時勝利を検査。
- 研究の5枚D＋AI-2＋消耗の64対戦（4ビルド/5ボス/3seed＝60＋既知4ケース）と勝者・決着Rが一致。研究原本を動かして再パッチするのでなく保存結果をオラクルに使用。研究の継承6枚は本体へ持ち込まない。
- 専用Playwright：76項目成功。PC1366×768/1280×720、スマホ縦360×800/390×844/430×932。実クリックで5イベント・入れ替え/取消・詳細からリロール/スキップ・2枚戦闘・消耗HP/ログ/勝利と敗北の結果・再開始を確認。横スクロールなし、主要ボタン44px以上。pageerrorなし。
- 既存 `npm run test:browser` もローカルHTTPで成功（Chrome指定）。5サイズの戦闘配置/拡大、リセット/再戦/音量/素材代替を確認。
- 変更前HEADを/tmpの別ディレクトリで配信して比較スクリーンショットを取得。既存ワークツリーの差分は破棄していない。

## 性能

同じ現在エンジンに旧AIとAI-2を接続し、実際の5枚ボス5プリセット×MP3/5×6状態＝60局面ずつ。R3/11/13、ウォームアップあり、状態キャッシュなし、Node計測。過去研究と状態分布が違うため直接倍率比較はしない。

| AI | N | 平均ms | 中央値ms | p95 ms | 最大ms |
|---|---|---|---|---|---|
| AI-0 | 60 | 20.91 | 20.02 | 34.99 | 36.67 |
| AI-2 | 60 | 22.65 | 22.48 | 33.16 | 38.41 |

p95の小さな逆転は速度改善の証明ではない。スマホ実機は未計測。追加の加速/布石候補は判断の完全最適性を保証せず、研究で残った過剰加速/防御の課題を自動解消するものではない。今後は実機での応答性と5イベント化後のビルド/難易度をテストプレイする。

## 制約・実行

このクラウドのChrome管理ポリシーではfile://が `ERR_BLOCKED_BY_ADMINISTRATOR` となるため、直接ファイル起動の実確認は未完了。HTTPで検証成功。classic script構成は維持。ブラウザのレスポンシブ確認であり実スマホ/実タッチ/音の聴感は未検証。公開URLでの確認はデプロイ後に行う。

```
npm test
npm run check
CHROME_PATH=/usr/bin/chromium CHROME_NO_SANDBOX=1 BROWSER_TEST_URL=http://127.0.0.1:18080/ npm run test:browser
node reports/demo-ai-draft-update/verify-integration.cjs
python reports/demo-ai-draft-update/browser.py
```

専用browser.pyは変更前の配信を18081（HEADを別の/tmpディレクトリへgit archiveで展開）、変更後を18080で配信して実行する。旧AIはbaseline-planner.txtに固定（比較用だけで本体からは読み込まない）。結果JSON/ログ/スクリーンショットは本フォルダ。既存研究の原本はハッシュで一致確認（preservation.json）。コミット/プッシュ/デプロイはしていない。

## 変更ファイル

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
- `src/ui/render.js`
- `src/ui/result.js`
- `tests/battle-engine.test.cjs`
- `tests/progression.test.cjs`
- `tests/adopted-rules.test.cjs`
- `tests/fixtures/ai2-adopted-cases.json`
- `docs/specs/first-era/11-ai-exhaustion-draft.md`
- `reports/demo-ai-draft-update/（検証・比較・スクリーンショット）`

## スクリーンショット

- [変更前PC](screenshots/before-draft-1366.png) / [変更後PC](screenshots/after-draft-1366.png)
- [スマホ3択](screenshots/after-draft-390.png) / [詳細とリロール・スキップ](screenshots/card-details-390.png)
- [入れ替え](screenshots/replacement-390.png) / [戦闘](screenshots/battle-1366.png)
- [消耗ログ](screenshots/exhaustion-log-390.png)

過去研究の再実行は各READMEに記載された基準HEADの隔離環境で行う。旧研究のソース置換を改修後の本体へ重ねて適用しない。今回は保存済み結果と照合した。
