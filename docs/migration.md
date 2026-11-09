# 文書移管・整合性台帳

整理日：2026-11-09。調査時main / HEAD `3eeb48628ae3c6043899204b92e94fa4a76d29da`。作業前の追跡ファイル差分なし。未追跡の研究・報告を保護。
元のdocs配下30文書を調査。全文は整理前Git履歴で参照可能。移管前のSHA-256は[audit/source-documents.json](audit/source-documents.json)に保存する。
新しいユーザー決定は今回の整理依頼を根拠とする。旧資料の「正式」は最新承認を上書きしない。

## 移管一覧

| 旧ファイル | 移管先 | 処置・理由 |
|---|---|---|
| `docs/README.md` | docs/README.md | 再構成：現行入口／構造へ集約 |
| `docs/architecture.md` | docs/architecture.md | 再構成：現行入口／構造へ集約 |
| `docs/art/character-art-prompts-reference.md` | docs/reference/character-art-prompts.md | 移管後削除：重複する仕様本文・完了済み依頼。固有の草案数値はbacklog、制作文はreferenceへ保存 |
| `docs/first-era-architecture.md` | docs/architecture.md、docs/history/first-era-baseline-2026-11-06.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/first-era-decisions.md` | docs/features/combat.md、docs/features/skills.md、docs/features/progression.md、docs/features/world-assets.md、docs/features/ui.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/future/deferred-card-pool-E-H.md` | docs/backlog.md | 移管後削除：重複する仕様本文・完了済み依頼。固有の草案数値はbacklog、制作文はreferenceへ保存 |
| `docs/future/future-upgrades-draft.md` | docs/backlog.md | 移管後削除：重複する仕様本文・完了済み依頼。固有の草案数値はbacklog、制作文はreferenceへ保存 |
| `docs/future/inheritance-and-progression.md` | docs/features/progression.md、docs/backlog.md | 移管後削除：重複する仕様本文・完了済み依頼。固有の草案数値はbacklog、制作文はreferenceへ保存 |
| `docs/game-design.md` | docs/README.md、docs/features/combat.md、docs/features/progression.md、docs/backlog.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/history/architecture-v0.9.5.md` | docs/history/architecture-v0.9.5.md | 保持：旧世代・受領時の固有条件を当時の記録として保持 |
| `docs/history/first-era-input/01-decisions-and-scope.md` | docs/history/first-era-input/01-decisions-and-scope.md | 保持：旧世代・受領時の固有条件を当時の記録として保持 |
| `docs/history/first-era-input/08-migration-checklist.md` | docs/history/first-era-input/08-migration-checklist.md | 保持：旧世代・受領時の固有条件を当時の記録として保持 |
| `docs/history/first-era-input/09-open-items.md` | docs/history/first-era-input/09-open-items.md | 保持：旧世代・受領時の固有条件を当時の記録として保持 |
| `docs/history/game-design-v0.9.5.md` | docs/history/game-design-v0.9.5.md | 保持：旧世代・受領時の固有条件を当時の記録として保持 |
| `docs/history/roadmap-v0.9.5.md` | docs/history/roadmap-v0.9.5.md | 保持：旧世代・受領時の固有条件を当時の記録として保持 |
| `docs/package-migration.md` | docs/architecture.md | 移管後削除：重複する仕様本文・完了済み依頼。固有の草案数値はbacklog、制作文はreferenceへ保存 |
| `docs/roadmap.md` | docs/status.md、docs/backlog.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/02-combat-rules.md` | docs/features/combat.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/03-card-pool-A-D.md` | docs/features/skills.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/04-progress-and-boss-presets.md` | docs/features/progression.md、docs/features/bosses.md、docs/features/ai.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/05-battle-ui-spec.md` | docs/features/ui.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/06-assets-and-characters.md` | docs/features/world-assets.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/07-acceptance-tests.md` | docs/features/ui.md、docs/history/first-era-acceptance-original.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/08-pc-battle-ui.md` | docs/features/ui.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/09-castle-ui-request.md` | docs/features/ui.md、docs/features/world-assets.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/10-png-compact-enemy-ui.md` | docs/features/world-assets.md、docs/features/ui.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/11-ai-exhaustion-draft.md` | docs/features/combat.md、docs/features/ai.md、docs/features/progression.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/12-skill-ui.md` | docs/features/ui.md | 本文統合・案内のみ保持：変更禁止の過去レポートに旧パスが記載されているため |
| `docs/specs/first-era/13-combat-presentation.md` | docs/features/ui.md、docs/features/world-assets.md | 移管後削除：重複する仕様本文・完了済み依頼。固有の草案数値はbacklog、制作文はreferenceへ保存 |
| `docs/specs/first-era/14-tempo-readability.md` | docs/features/ui.md | 移管後削除：重複する仕様本文・完了済み依頼。固有の草案数値はbacklog、制作文はreferenceへ保存 |

旧パスの案内ファイルは重要な参照元（変更対象外のreports等）を壊さないための例外。現行仕様本文は複製しない。
旧受入項目、初期実測、v0.9.5、入力時点の資料は履歴、制作プロンプトはreferenceとして保管。歴史資料の古い数値は現行仕様ではない。
archive内READMEの既存リンク切れ1件だけを相対パス修正した。archiveのコード・素材・仕様本文は変更しない。

## 解消した矛盾

| 旧記述 | 現在の扱い |
|---|---|
| 結界・堅守CD0 | CD1を正式採用・本編反映済 |
| 毒の開始時処理案 | 本編は終了時。H案は過去研究 |
| 4人12枚、巨漢・斥候除外 | 最新の6人PNG原本由来素材が本編の正本 |
| カード型・選択パネル全体を中央へ拡大 | スキル中心、パネル位置維持・詳細枠のみ補正 |
| 3回習得／強制交換 | デモ暫定5回・2リロール・スキップ |
| 敵パネル44px／短い宣言の旧表 | 2026-11-08の本編実装基準は122px・宣言通常2000/高速1000ms。**2026-11-10の最新承認で敵パネルは再度圧縮し、名前・MP・CD中心へ変更予定（未実装）** |
| 旧E返礼MP2・固定追加上限 | 新返礼と別案。旧効果は置換、新倍率は検証中 |
| 研究の初手MP3・6枚・旗B | 正式本編と区別。採用確定ではない |
| 研究画面の右旗・王中央 | 最新の左旗・王右移動は確定方針、未実装 |
| BGM5曲導入済みの期待 | 5枠基盤のみ。専用追加4曲は未収録 |

### 2026-11-10追補：最新UI承認と履歴の区別

11月8日の敵スキル欄122px・効果概要表示は、移管当時の**本編実装記録**であり、今後の最終仕様ではない。最新承認ではPC全画面・中央領域拡大・上下エリア圧縮・ボス縮小・敵スキル欄の再圧縮・敵味方のホバー詳細を優先する。具体的な受入条件は[UI資料](features/ui.md#2026-11-10承認戦闘ui改修確定本編未実装)に集約し、本台帳の旧資料一覧は書き換えない。

削除した旧`13-combat-presentation.md`・`14-tempo-readability.md`の当時の演出・可読性値は、現行の[UI資料](features/ui.md)、[演出時間コード](../src/app/presentation-timing.js)、[演出改修レポート](../reports/combat-fx-bgm/REPORT.md)、[テンポ改善レポート](../reports/combat-tempo-2026-11-08/REPORT.md)を参照する。過去実測と現在の挙動は混同しない。

## ユーザー判断・照合が必要

1. 初手MP3の正式採用、旗B・後続無料召喚、老王の数値・切替条件。
2. 返礼／転化のMP・CD・倍率・攻撃相互作用・対象消滅処理。
3. 継承時の強化情報コピー：旧資料に保持／混ぜないという矛盾がある。
4. 奥義の扱い：旧必殺技の非継承案を新奥義の決定としない。
5. 毒参照の習得候補制限：現コードは所持重複除外のみ。別の条件を導入するか。
6. 旗の予告UI3案の最終採用。召喚周期Bとは別軸。
7. 第二紀採用画像の実ファイル対応、縮小率、王座イベント各時間、Story Labの着手。
8. GitHub側Pages設定、FX Lab PR #1の最新リモート状態は今回未照会。

## 検証結果

最終の件数・保護検証は[audit/validation.json](audit/validation.json)へ記録する。Markdownの相対リンクを確認し、外部URLの到達性・音声・実機表示を検証したとは扱わない。
本編・研究・テスト・素材の変更を禁止し、作業前のSHA-256と比較する。大規模シミュレーションは再実行しない。
