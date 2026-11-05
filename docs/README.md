# 設計資料の入口

## 現行仕様（第一紀・新戦闘ルール検証版）

| 文書 | 用途 |
|---|---|
| [game-design.md](game-design.md) | 現行仕様と対象外機能の全体像 |
| [first-era-decisions.md](first-era-decisions.md) | 実装前にユーザー確認した9項目と最新の画像指示 |
| [first-era-architecture.md](first-era-architecture.md) | 実装構成、API、テスト、実測結果 |
| [roadmap.md](roadmap.md) | 完了事項と今後の確認項目 |
| [戦闘ルール](specs/first-era/02-combat-rules.md) | マナ・CD・バリア・毒・妨害・終了順 |
| [19カード表](specs/first-era/03-card-pool-A-D.md) | コスト、効果、CD、タグ |
| [進行とボス](specs/first-era/04-progress-and-boss-presets.md) | 初期ビルド、獲得、固定5組、AI、再戦 |
| [UI仕様](specs/first-era/05-battle-ui-spec.md) | PC／スマホ、予約UI、色と文字、操作 |
| [素材仕様](specs/first-era/06-assets-and-characters.md) | 採用12PNG、除外画像、フォールバック |
| [受け入れ項目](specs/first-era/07-acceptance-tests.md) | 自動・実機テストとバランス観察 |

優先順位は最新ユーザー指示 → 確認済み事項 → 現行仕様 → 履歴・未承認案。
機械可読な検証値は `tests/fixtures/first-era-cards.json` と `first-era-bosses.json`、
実行時の定義は `src/game/card-data.js`。初期ビルドは同ファイルの `STARTERS`。

## 将来仕様（現行導線には入れない）

- [E〜Hの16カード](future/deferred-card-pool-E-H.md)：未強化効果の保留記録。
- [35種の強化草案](future/future-upgrades-draft.md)：未承認。実装を確約しない。
- [継承・強化・能力・後続世代](future/inheritance-and-progression.md)：合意済みの方向と未決事項を区別。
- [キャラ制作プロンプト](art/character-art-prompts-reference.md)：再制作の参考。現存素材の完成保証ではない。

## 履歴

- [旧ゲーム設計](history/game-design-v0.9.5.md)
- [旧ロードマップ](history/roadmap-v0.9.5.md)
- [旧構成とAPI](history/architecture-v0.9.5.md)
- [受領時の実装範囲](history/first-era-input/01-decisions-and-scope.md)、[移行案](history/first-era-input/08-migration-checklist.md)、[当時の未確定事項](history/first-era-input/09-open-items.md)

これらは当時の承認状況・数値・ファイル配置を保存する資料。現行仕様へ逆適用しない。
入力パッケージの内容は必要な資料・素材・検証値へ移管済みで、入力フォルダは削除した。
