# 継世の戦闘 — Phase 3 Ver.0.9.4

**Ver.0.9.3からのリファクタリング版**。ゲームルール、カード効果、画面レイアウト、演出速度、BGM/SE、2世代構成は**原則変更していません**。新カードやバランス調整は含みません。

## すぐ遊ぶ

ZIPを解凍して、`index.html` をChromeまたはEdgeで開いてください。`src/` と `assets/` は **`index.html` と同じ階層** に置いてください。

初回起動時は道中で英雄の素質を選択します。ボスに勝利すると継承カードを選択し、第二紀へ進めます。スマホでの音声再生にはユーザー操作が必要な場合があります。

GitHub Pagesへは **`index.html`、`src/`、`assets/`** をリポジトリ直下に配置してください。`package.json` や `tests/` を一緒に置いても問題ありません。

## Ver.0.9.4で整理したこと

- `index.html` からCSSとゲーム内JavaScriptを分離。HTMLは画面構造のみ。
- `src/styles.css` に旧CSSをそのまま抽出。
- カード定義・道中・戦闘進行・敵AIの行動計画・画面表示・演出・操作イベントのファイルを分割。
- 計算部分は `src/game/combat-math.js` と `src/game/boss-planner.js` に **DOMに依存しない関数**として切り出しました。
- Node.js標準のテストランナーで、回復・軽減・毒・切り札制限・敵AI・カード説明・素材パスを検査できます。
- **ビルドツールなし**で動作。`file://` でも開けるよう、読み込み順を明示した通常の `<script>` を使用しています。

### ディレクトリ構成

```text
roguelike-card-game/
├── index.html             # HTML（画面構造）
├── src/
│   ├── styles.css         # 全体レイアウト・レスポンシブ・演出CSS
│   ├── app-state.js       # 共有される試作ゲーム状態
│   ├── main.js            # 初期化とユーザー操作の結線
│   ├── game/
│   │   ├── card-data.js   # カード情報・効果説明・道中データ
│   │   ├── combat-math.js # ダメージ・回復・毒・使用条件の純粋関数
│   │   ├── boss-planner.js# ボスの使用カード計画の純粋関数
│   │   ├── battle.js      # 戦闘進行・カード発動・世代交代
│   │   └── draft.js       # 道中の獲得・強化・デッキ入れ替え
│   └── ui/
│       ├── render.js      # ステータス・手札などの描画
│       ├── effects.js     # 戦闘演出・ログ・メッセージ
│       └── controls.js    # ログ開閉・ツールチップ・音声設定
├── assets/
│   ├── asset-map.js       # 画像・音声の参照先。差し替えはここ
│   ├── audio-engine.js    # BGM/SEプレイヤー
│   ├── characters/        # 仮SVG立ち絵
│   ├── backgrounds/       # 仮背景
│   ├── cards/             # 将来のカードイラスト
│   └── sounds/            # BGM・36種類の仮SE
├── tests/                 # Node.js自動テスト
├── package.json           # テスト用。ゲーム起動には不要
└── .gitignore
```

## VS Codeでの作業

すでにGitHubからクローンした `roguelike-card-game` フォルダをVS Codeで開き、このZIPの中身をそのルートへ上書き・追加します。`index.html` の旧版は新ファイルで置換し、`src/` を**丸ごと**追加してください。画像・音楽を元の状態から変えたくなければ、既存 `assets/` の差分も確認してください。

ゲーム確認は `index.html` を開くだけ。VS CodeのLive Serverなどを使っても構いませんが、必須ではありません。

### 自動テスト（Node.jsがインストールされている場合）

VS Codeのターミナルでプロジェクトのルートに移動して実行します。

```powershell
npm test
npm run check
```

- `npm test`：計算・カード効果・素材参照などのテスト
- `npm run check`：JavaScriptの構文チェック
- `npm install` は不要です。外部ライブラリ依存はありません。

### GitHubへ反映

まずブラウザで正常に動くことを確かめ、VS Code「ソース管理」から変更内容を確認してコミット・プッシュしてください。例：

```powershell
git add .
git commit -m "refactor: split game modules and add tests v0.9.4"
git push
```

GitHub Pagesは既存設定を維持し、同じURLから最新版を配信できます。**すでにユーザー側でGitHubにプッシュした変更がある場合は、上書きする前に差分を確認してください。**

## 手動チェック項目

- 第一紀の素質を選び、道中でカードを取得・強化できる
- デッキ上限時の獲得で「既存カードとの入れ替え／新カード破棄」ができる
- 戦闘でカード、SE、ターン切り替え、敵の手札発光、ログ開閉が動く
- 勝利後にVICTORYが表示され、継承カードを選んで第二紀へ進める
- 第二紀のボスが前代デッキを使い、継承カードが別枠で表示される
- PC・スマホ画面で表示が崩れず、道中／戦闘BGMが切り替わる

## 既知の制約・今後の作業

- **本格的なReact/TypeScript移行ではありません。** ゲーム全体を段階的に分離する最初のリファクタリングです。
- `src/game/battle.js` や `src/game/draft.js` には、まだ描画やSEの呼び出しが残っています。今後、状態更新と画面操作の境界を整理する余地があります。
- 共有状態を `src/app-state.js` で管理し、従来どおり通常の `<script>` を順番に読み込みます。バンドラを導入する場合は、ESモジュール化と依存関係の明示が次のステップです。
- 自動テストは重要な計算を中心にした初期セットです。全ゲーム進行の網羅的なテストではありません。
- 1枚1回の強化制限、カード変異、パッシブ、枷、必殺技、ボス固有能力、周回インフレは**未実装**。Ver.0.9.3の試作ルールを維持しています。
- 音源のライセンス・原作者は `assets/sounds/README.md` も参照してください。

## BGM

- 道中：**Whispers in the Fog** — Ruhinre
- ボス：**Determined Pursuit** — Emma_MA

ユーザーが配布元から取得した音源を収録し、圧縮版を使用。配布条件は公開時に各原著作物の配布ページでもご確認ください。参照先は `assets/asset-map.js` で変更できます。
