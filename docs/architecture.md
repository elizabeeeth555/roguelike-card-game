# アーキテクチャ資料

現行は第一紀・新戦闘ルール検証版。現在のAPI・状態スキーマ・依存関係は
[first-era-architecture.md](first-era-architecture.md)を参照。

- `src/game/`：明示的な状態を受け取る共通ルール。DOM・音声・タイマーに依存しない。
- `src/app/`：ブラウザの進行制御と中断可能な演出待機。
- `src/ui/`：描画・詳細・確認・ログ・ポップアップ・イベント演出。
- `assets/`：画像・音声と参照設定。採用画像の寸法・ハッシュは`assets/characters/manifest.json`。
- `src/game/legacy/`：旧Ver.0.9.5のルールを隔離。通常のHTMLは読み込まない。
- `archive/v0.9.5/`：旧画面ソースの参考保存。独立起動する旧モードではない。

[Ver.0.9.5の構造整理時の資料](history/architecture-v0.9.5.md)は履歴として保持する。
`execute`・`transition`の引数や旧Set型状態を、現在のschemaVersion 2へそのまま使わない。
