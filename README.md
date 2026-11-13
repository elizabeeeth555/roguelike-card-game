# 継世の王座

**王を討て。そして、王となれ。**

『継世の王座』（けいせいのおうざ）はスキル自由構築型RPGです。React第一紀では通常10種類から5種類を編成し、灰鎖の老王へ挑戦できます。

このブランチは公開トップをReact第一紀へ切り替えるための**公開配置を準備した状態**です。PR・mainへのマージ・公開操作は未実施で、現在のGitHub Pagesへの反映を意味しません。Pagesの`main`／ルート公開設定は維持します。

| 入口 | このブランチの配置 | 公開反映後のURL |
|---|---|---|
| 新React第一紀 | [index.html](index.html) → [public-game/](public-game/) | https://elizabeeeth555.github.io/roguelike-card-game/ |
| 保存したclassic版 | [classic/index.html](classic/index.html) | https://elizabeeeth555.github.io/roguelike-card-game/classic/ |

## ローカルで遊ぶ

チェックアウト済みの生成物を使う場合はビルド不要です。リポジトリルートで：

```bash
python -m http.server 8000 --bind 127.0.0.1
```

- React第一紀： http://localhost:8000/
- classic： http://localhost:8000/classic/

React版はHTTP配信で確認してください。生TSXや技術検証用の入口を公開トップには使いません。新旧は同じオリジンでも保存キーを分離し、データ形式・戦闘ルールを変更していません。

## 開発・公開配置の再生成

Node.js 24以上と、アプリの依存パッケージが必要です。

```bash
npm --prefix apps/game-web ci
npm run build:pages
npm run check:pages
npm test
npm --prefix apps/game-web test
npm run check
```

`build:pages`は型チェックと第一紀専用Viteビルドを実行し、トップHTMLと`public-game/`の管理対象だけを更新します。GitHubへのpush・マージ・デプロイは実行しません。ソース更新後は再生成し、生成物もレビュー対象に含めます。手編集・未管理ファイル・シンボリックリンクのある公開出力は上書きせず停止します。

旧版をトップへ戻すローカル操作：

```bash
npm run pages:classic
npm run check:pages
# Reactトップへ戻す
npm run build:pages
```

これらはローカルの配置変更だけです。公開先を戻すには、別途承認を得た変更レビュー・mainへのマージが必要です。詳細な管理範囲・安全確認・戻し方は[技術構成](docs/architecture.md#pages-production)を参照してください。

既存のReact技術検証・王座工房の開発起動は[アプリREADME](apps/game-web/README.md)を参照。これらを公開トップには配置しません。

## 開発・資料

- [設計資料の入口](docs/README.md)：仕様の優先順位と状態区分。
- [現在の開発状況](docs/status.md)：本編・研究・未反映事項。
- [構造・テスト・公開](docs/architecture.md)：各モジュールと検査方法。
- [スキル管理表](docs/features/skills.md)：スキル個別仕様の正本。
- [作業規約](AGENTS.md)：未コミット作業・素材の保護。

ブラウザ試験では`CHROME_PATH`等を指定できます。classic試験はHTTP配信中に`BROWSER_TEST_URL=http://localhost:8000/classic/ npm run test:browser`、React第一紀は`FIRST_ERA_URL=http://localhost:8000/ npm --prefix apps/game-web run test:first-era:browser`。PC・スマホ幅のブラウザエミュレーションと人間の実機評価は別です。

内部IDは互換性のため維持し、画面はスキル中心の用語を使います。研究ページ・生データは正式仕様ではありません。素材出典は[世界観・素材](docs/features/world-assets.md)と各素材台帳を参照。購入・非公開素材をGitやビルド出力に含めないでください。
