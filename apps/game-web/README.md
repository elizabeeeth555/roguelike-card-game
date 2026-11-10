# 継世の王座 — React戦闘基盤（STEP 3-A）

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

Linux環境の例。Windowsでは`CHROME_PATH`を実行ファイルのパスに設定し、通常は`CHROME_NO_SANDBOX`を指定しない。結果・スクリーンショットはルート`.test-artifacts/game-web/dev/`または`preview/`（Git除外）。

## 操作

固定の既存初期セットと既存ボス一覧の先頭を使用。初手MP2/上限3、HP20などはコアの既定値をそのまま使う。双方のHP・MP・ターン・バリア・毒、スキル名・MP・基本CD・残CD・使用不可理由を表示する。

プレイヤースキルの「詳細を確認」→「使用する」で発動。「ターン終了」で既存AI-2にボス行動を委譲し、次のプレイヤーターンへ進む。「再戦」で同じ条件の新規状態に戻る。技術検証のため敵演出は即時で、ターン終了確認・習得・FX・SE・素材表示は移植していない。

## 構造と共有責務

- `vite.config.ts`：コア5ファイルの許可リスト。本編のソースを変換・修正せず、devでは限定URL、buildでは`dist/engine/`に同じバイト列を渡す。HTMLへclassic scriptを依存順で挿入する。
- `src/battle-adapter.ts`：既存公開APIの最小型境界とホストのターン進行。状態を直接変更せずtransitionを呼ぶ。型は既存コアのうち使用する公開項目だけを記述し、コア全体のTypeScript化は行わない。
- `src/main.tsx`：Reactの状態所有・選択・入力。プラットフォーム依存処理をゲームコアへ入れない。
- `src/components/HealthBar.tsx`、`SkillCard.tsx`：propsによる表示専用コンポーネント。SkillCardは選択コールバックだけを受け取り、戦闘実行・グローバル・保存・音声に依存しない。工房は将来プレビュー値を供給できる。共有パッケージへの移動はまだ行わない。
- `tests/battle-adapter.test.cjs`：Node 24の型除去機能でアダプターを読み、元コアと結果を比較する。初手値・不正操作・入力非破壊・AIターン・再初期化を確認。

今回のコア配布はビルド／開発アダプターであり、ゲーム本体のコピーを手編集して維持する方式ではない。依存ファイル追加時は許可リストと型契約・パリティ試験を更新する。

## 依存バージョン

package.jsonは完全固定、package-lock.jsonを同梱。確認時：React/React DOM **19.3.1**、Vite **8.3.7**、TypeScript **7.0.2**、@types/react/@types/react-dom **19.3.0**、@types/node **26.6.6**。実行環境はNode **24.22.1**。本編ルートのpackage.json・依存には追加しない。

## 公開・非公開の境界

ViteのpublicDirは無効。devのファイル許可範囲は当アプリ内、コアは固定5件だけを明示配信する。研究・購入素材・旧本編素材・非公開設定をimport/glob/copyしない。環境変数の公開接頭辞は`GAME_WEB_PUBLIC_`であり、ここへ秘密を置かない。`.env`除外だけではビルド混入防止にならない。distは公開可能なコアとReact画面のみ。OS・保存・音声・Steam向けAPIは将来ホストアダプターへ置き、コアへ依存させない。

## 残課題／STEP 3-B

共有UIのprops・テーマと設定モジュールの接続、型契約の拡充、自動検証・アクセシビリティ、Reactホストの入力／演出ライフサイクルを段階的に検討する。現在は同期AIであり複雑化時の応答性は未計測。現行全画面・FX/SE・習得・保存・王座工房の移植、Steam配布は未実装。公開デモ置換や本番デプロイは別承認とする。
