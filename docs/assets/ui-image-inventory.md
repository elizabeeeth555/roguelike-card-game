# 継世の王座 — 画像素材整理マスター

作成日：2026-11-14

対象：アップロードされた42枚のPNG。元画像を無加工でコピーし、用途別に整理。受け渡し専用ブランチ `chore/ui-assets-transfer` に登録。本編・工房へのUI接続は未実施。

## 管理ルール

- 利用区分は今回の会話で確認した分類。採用候補は色違いの使用先未確定。
- 実装状態は全件未確認。採用・保留と実装済みは別。
- 「透過画素あり」はアルファ値0の画素が存在する意味で、中央領域や輪郭の品質を保証しない。
- 元ファイル名・SHA256で原本との対応を追跡。
- `skill-frame-variant` と `ornate-horizontal-frame-variant` は元画像のまとまりをそのまま保存したもの。分割済み部品とは限らない。
- 旧案・保留素材は削除しない。

## 確定分類（2026-11-14受け渡し依頼）

| 仮ID | 分類 |
|---|---|
| 29 | 汎用ボタン |
| 30〜35 | プレイヤースキル枠 |
| 36〜41 | ボススキル枠 |

分類の正本は本表と [CSV](ui-image-inventory.csv) の「分類」列。保存先のディレクトリ名や旧仮ファイル名は分類を意味しない。原本追跡のため、提供ZIPのPNGファイル名・保存先・バイト列を保持する。29番の `skill-frame-variant`、36〜41番の `battle/ornate-horizontal-frame-variant` も改名・移動・加工しない。利用区分の「採用候補」は維持し、色の使用先や切り出し仕様を今回確定しない。

## 受け渡し・検証記録

- 取得元：ChatGPT `/継世の王座/UI素材受け渡し/` のZIP・Markdown・CSV各1点。
- 登録物：ZIPから展開したPNG42枚と、単独提供のMarkdown・CSVを更新した管理資料2点。ZIP本体は重複登録しない。ZIP内の旧管理資料は参照元として保持し、登録版は本資料とCSVに一本化する。
- PNG42枚すべてをデコードし、一覧画像で目視確認。サイズ・SHA256は提供CSVと一致。切り出し・透過修正・圧縮・再生成なし。
- Git基点：取得・fetch確認済み `origin/main`、`e15c376`（PR #29反映後）。新規クローンの作業開始時に未コミット・未追跡差分なし。既存ファイルは本資料・CSV・PNGの登録先と重複なし。
- 関連PR：OPENのFX Lab PR #1と `ui/castle-six-characters` の独自成果は維持し、取込・変更しない。他の既存ブランチも変更しない。別PCの未push成果は未確認。
- 公開方式：既存文書ではPagesのmainルート方式。今回Pages APIの再確認は認証不足で未実施。公開設定・main・UIコードは変更しない。
- 次工程：本編への取り込みとmain反映を確認した後、受け渡しブランチを削除候補とする。削除には別途承認が必要。今回PR作成・マージ・ブランチ削除は行わない。

## スキル・奥義・ボス固有能力

| 仮ID | 用途 | 区分 |
|---|---|---|
| 11 | boss-unique-ability | 採用 |
| 12 | feint | 採用 |
| 13 | first-era-venom-blade | 採用 |
| 14 | first-era-ultimate | 採用 |
| 15 | first-era-poison-thrust | 採用 |
| 16 | first-era-corrosion | 採用 |
| 17 | unused-bandage-plus | 保留 |
| 18 | battle-spirit | 採用 |
| 19 | first-aid | 採用 |
| 20 | slash | 採用 |
| 21 | unused-large-blade | 保留 |
| 22 | unused-multi-slash | 保留 |
| 23 | unused-shield-ring | 保留 |
| 24 | barrier | 採用 |
| 25 | unused-slash | 保留 |
| 26 | heavy-slash | 採用 |
| 42 | setup | 採用 |

## 全42枚の素材一覧

| 仮ID | 保存先 | 区分 | サイズ |
|---|---|---|---|
| 01 | `assets/ui/battle/stagger-gauge-frame-no-ticks.png` | 採用 | 2172x724 |
| 02 | `assets/ui/icons/status/barrier-status.png` | 採用 | 1254x1254 |
| 03 | `assets/ui/icons/status/defense-up.png` | 採用 | 1254x1254 |
| 04 | `assets/ui/battle/stagger-gauge-frame-with-ticks.png` | 旧案 | 2172x724 |
| 05 | `assets/ui/icons/status/defense-down.png` | 採用 | 1254x1254 |
| 06 | `assets/ui/icons/status/poison.png` | 採用 | 1254x1254 |
| 07 | `assets/ui/icons/status/attack-up.png` | 採用 | 1254x1254 |
| 08 | `assets/ui/icons/status/weaken.png` | 採用 | 1199x1312 |
| 09 | `assets/ui/battle/hp-bar-frame.png` | 採用 | 2172x724 |
| 10 | `assets/ui/cards/skill-detail-frame.png` | 採用 | 1086x1448 |
| 11 | `assets/ui/icons/boss/boss-unique-ability.png` | 採用 | 1254x1254 |
| 12 | `assets/ui/icons/skills/feint.png` | 採用 | 1254x1254 |
| 13 | `assets/ui/icons/skills/first-era-venom-blade.png` | 採用 | 1254x1254 |
| 14 | `assets/ui/icons/ultimate/first-era-ultimate.png` | 採用 | 2064x762 |
| 15 | `assets/ui/icons/skills/first-era-poison-thrust.png` | 採用 | 1254x1254 |
| 16 | `assets/ui/icons/skills/first-era-corrosion.png` | 採用 | 1254x1254 |
| 17 | `assets/ui/library/candidates/unused-bandage-plus.png` | 保留 | 1254x1254 |
| 18 | `assets/ui/icons/skills/battle-spirit.png` | 採用 | 1254x1254 |
| 19 | `assets/ui/icons/skills/first-aid.png` | 採用 | 1254x1254 |
| 20 | `assets/ui/icons/skills/slash.png` | 採用 | 2048x2048 |
| 21 | `assets/ui/library/candidates/unused-large-blade.png` | 保留 | 1254x1254 |
| 22 | `assets/ui/library/candidates/unused-multi-slash.png` | 保留 | 2048x2048 |
| 23 | `assets/ui/library/candidates/unused-shield-ring.png` | 保留 | 2048x2048 |
| 24 | `assets/ui/icons/skills/barrier.png` | 採用 | 2048x2048 |
| 25 | `assets/ui/library/candidates/unused-slash.png` | 保留 | 2048x2048 |
| 26 | `assets/ui/icons/skills/heavy-slash.png` | 採用 | 1254x1254 |
| 27 | `assets/ui/icons/common/cooldown-hourglass.png` | 採用 | 1964x2048 |
| 28 | `assets/ui/icons/common/mana-crystal.png` | 採用 | 1923x2048 |
| 29 | `assets/ui/skill-frames/skill-frame-variant-29.png` | 採用候補 | 1774x887 |
| 30 | `assets/ui/skill-frames/skill-frame-variant-30.png` | 採用候補 | 2048x1024 |
| 31 | `assets/ui/skill-frames/skill-frame-variant-31.png` | 採用候補 | 2048x1024 |
| 32 | `assets/ui/skill-frames/skill-frame-variant-32.png` | 採用候補 | 2048x1024 |
| 33 | `assets/ui/skill-frames/skill-frame-variant-33.png` | 採用候補 | 2048x1024 |
| 34 | `assets/ui/skill-frames/skill-frame-variant-34.png` | 採用候補 | 2048x1024 |
| 35 | `assets/ui/skill-frames/skill-frame-variant-35.png` | 採用候補 | 2048x1024 |
| 36 | `assets/ui/battle/ornate-horizontal-frame-variant-36.png` | 採用候補 | 1937x812 |
| 37 | `assets/ui/battle/ornate-horizontal-frame-variant-37.png` | 採用候補 | 1937x812 |
| 38 | `assets/ui/battle/ornate-horizontal-frame-variant-38.png` | 採用候補 | 1937x812 |
| 39 | `assets/ui/battle/ornate-horizontal-frame-variant-39.png` | 採用候補 | 1937x812 |
| 40 | `assets/ui/battle/ornate-horizontal-frame-variant-40.png` | 採用候補 | 1935x812 |
| 41 | `assets/ui/battle/ornate-horizontal-frame-variant-41.png` | 採用候補 | 1937x812 |
| 42 | `assets/ui/icons/skills/setup.png` | 採用 | 1254x1254 |

## 注意

- スキルIDの正式仕様は `docs/features/skills.md` を正本とする。
- `first-era-ultimate` は仮称《戦技の残響》に対応する画像用途で、名称確定を意味しない。
- ボス固有能力は個別能力名の割当未確認。
- 今回の承認は専用ブランチへの素材・管理資料登録まで。本編/工房への実装、PR作成、マージ、公開は含まない。
- 色違いの枠について採用する色や切り出し方法は今後判断。
