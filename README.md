# 継世の王座

**王を討て。そして、王となれ。**

『継世の王座』（けいせいのおうざ）はスキル自由構築型RPGへ開発方針を更新しました。新第一紀は通常10種類から5つを編成する方針です。現在の公開版は旧ランダム習得型のclassic JavaScriptデモで、新版への切替は未実施。React技術検証・独立研究と区別し、[最新の仕様と並行開発ロードマップ](docs/status.md)を参照してください。

公開版： https://elizabeeeth555.github.io/roguelike-card-game/

## 起動

ビルド・APIキー不要。index.htmlを直接開くか、リポジトリルートで：

```bash
python -m http.server 8000 --bind 127.0.0.1
```

http://localhost:8000/ をChrome / Edge等で開きます。

## 開発・資料

- [設計資料の入口](docs/README.md)：仕様の優先順位と状態区分。
- [現在の開発状況](docs/status.md)：本編・研究・未反映事項。
- [構造・テスト・公開](docs/architecture.md)：各モジュールと検査方法。
- [スキル管理表](docs/features/skills.md)：本編19種と研究2種。
- [作業規約](AGENTS.md)：未コミット作業・素材の保護。

```bash
npm test
npm run check
# Chrome環境がある場合
npm run test:browser
```

内部card/deckは互換性のため維持し、画面はスキル中心の用語を使います。研究ページ・生データは本編の正式採用を意味しません。
素材の出典は[世界観・素材](docs/features/world-assets.md)および各素材フォルダのREADMEを参照。購入素材をコミット・公開しないでください。
