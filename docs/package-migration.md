# 実装パッケージの正式配置記録

2026-11-06。実装完了後の整理。ゲームルール・カード性能は変更しない。

| 受領内容 | 正式な配置・確認 |
|---|---|
| A〜D19カード | `src/game/card-data.js`、効果は`card-effects.js`。表は[カード仕様](specs/first-era/03-card-pool-A-D.md)。検証値は`tests/fixtures/first-era-cards.json` |
| 固定5ボス | `src/game/card-data.js`の`BOSSES`と`tests/fixtures/first-era-bosses.json`が受領値と一致 |
| 初期2枚の3候補 | 実装前に採用を確認。`STARTERS`のカードID・表示名は受領案と一致 |
| 戦闘・UI・進行・素材・受け入れ項目 | `docs/specs/first-era/`へ移管。補充順・確認済み事項・再戦・画像除外を最新決定へ整合 |
| E〜H16カード | [保留カード表](future/deferred-card-pool-E-H.md)に全文保存（未実装） |
| 35種の強化案 | [強化草案](future/future-upgrades-draft.md)に全文保存（未承認） |
| 継承・強化・能力・後続世代 | [将来設計](future/inheritance-and-progression.md)に合意と未決事項を整理 |
| キャラ制作プロンプト | `docs/art/character-art-prompts-reference.md`。将来の再制作の参考 |
| 当初の実装範囲・移行案・未確定一覧 | `docs/history/first-era-input/`に受領時の履歴として保存 |
| 旧ルート設計書・ロードマップ・構成資料 | `docs/history/`へ保存。ルート文書は現行仕様と将来案の案内に更新 |
| 使用する4キャラ12PNG | `assets/characters/`に配置済み。受領時のSHA-256・寸法と一致 |
| 画像マニフェスト | `assets/characters/manifest.json`。採用12点と不使用2キャラを記録 |
| 大男・斥候の6PNG | ユーザー指示で不採用。画像設定は無効、5ボスのデッキは維持 |
| プレビューJPG・統一設定シート | 実行時にも将来仕様の保存にも不要。正式素材へは追加しない |
| 最初の依頼文・梱包README・全体ハッシュ一覧 | 役目を終えた受領・梱包用資料。必要内容を移管後、入力フォルダごと削除 |

## 整理の確認

- 現行19カードの名前・コスト・CD・タグ・説明、5ボス、初期3ビルドを受領JSONと照合。
- 採用画像12点は元のSHA-256と一致。未使用2キャラに画像パスを設定していない。
- E〜Hと強化草案は受領本文を変更せず保存し、現行コードへ混入させていない。
- 旧三世代のルールは `src/game/legacy/`、旧画面は `archive/v0.9.5/` に保持。
- 入力フォルダに依存する起動・テスト・文書リンクを残さない。
- 実機タッチ・音声の聴感や、防御型AIの停滞などの既知課題は[構成・検証資料](first-era-architecture.md)と[ロードマップ](roadmap.md)に継続記録。
