# ブランチ・PR棚卸し — 2026-11-10

確認日：2026-11-10（日本時間）。対象：`elizabeeeth555/roguelike-card-game`。
現在の分類であり、削除・統合・マージの実行許可ではない。[運用規約](development-workflow.md)に従い、実行時に再確認する。

## 調査時の作業状態

- 開始ブランチ：`ui/throne-combat-first-pass`、HEAD `00230706ea6755d4e5c7b58c4751cff6351ef840`。
- 追跡済みファイルの未コミット差分・ステージ済み差分：なし。
- 未追跡：3,337ファイル（reports 3,288、research 48、tests 1）。内容を移動・上書き・ステージングしない。
- 取得後のリモートmain：`8b5539021e62a2bc56d0de8561c6e23b86bdf81c`。mainと作業開始ブランチのファイル内容は同一で、mainにはPR #4のマージコミットが1つ多い。
- 安全に切替可能と確認し、最新`origin/main`から`chore/repository-workflow`を作成した。HEADは同じ`8b55390`。この新規作業ブランチはローカルのみ、PRなし。誤ったmainへのpushを防ぐためupstreamは設定しない。
- Pages API：`build_type=legacy`、`source.branch=main`、`source.path=/`。公開設定は変更していない。
- 全リモートheadを取得して比較。通常設定のfetch refspecはmainのみで、既存の追跡参照に古い値が残る場合があった。設定自体は変更していない。

## 既存ブランチ一覧

「独自コミット」は取得済みリモートmainにないコミット数。「独自差分」は共通祖先からブランチ側への差分で、mainの新しい更新との差を独自成果と誤認しない。

| ブランチ | 目的・対応PR | リモート先端 | mainへの反映・独自成果 | 分類・注意 |
|---|---|---|---|---|
| `main` | 安定版・公開版。PR #3/#4取込済み | `8b55390` | 現行公開ソース | **維持**。直接pushを避け、マージの公開影響を確認 |
| `ui/castle-six-characters` | 当初は城内UI／6人素材。その後FX Labの継続作業。[PR #1](https://github.com/elizabeeeth555/roguelike-card-game/pull/1) | `c63a499` | PRはOPEN。初期の本編UI変更はmainに存在するが、FX Lab等の36独自コミット・39ファイルの差分は未反映 | **保護・維持／王座工房への将来統合予定（方法未決）**。未マージ成果があるため削除候補にしない。名称だけを理由にリネームしない |
| `ui/throne-combat-first-pass` | 正式タイトル、戦闘UI第1弾。[PR #4](https://github.com/elizabeeeth555/roguelike-card-game/pull/4) | `0023070` | MERGED。mainへの独自コミット0・独自差分0。mainはマージコミット1つ先 | **削除候補**。実行には別承認。切替中の他worktree・新規追加コミット・PR参照を再確認 |
| `docs/consolidate-game-design` | 設計資料整理と追記。[PR #3](https://github.com/elizabeeeth555/roguelike-card-game/pull/3) | `15d9976` | MERGED。mainへの独自コミット0・独自差分0。mainは3コミット先 | **削除候補**。ローカルが古いので、ローカル先端だけでPR全体を判断しない |
| `work` | 過去の戦闘UIレイアウト・カード操作改修。先端メッセージ`feat(ui): redesign battle screen layout and card interactions` | `a046e4c` | 対応PRは取得できたPR一覧にない。先端はmainの祖先で、独自コミット0・独自差分0。mainは12コミット先 | **削除候補（所有者確認後）**。用途不明のままではなく履歴から旧UI作業と判明。ただし現場の利用者・別PCの未push作業までは未確認 |

今回の調査で確認された既存リモートブランチは上記5本。新規`chore/repository-workflow`はpushしていない。

## ローカルとリモートの違い

| ブランチ | ローカル | リモート | 判定 |
|---|---|---|---|
| main | `3eeb486` | `8b55390` | ローカルは8コミット遅れ。独自コミットなし。既存ローカルmainをリセット・更新せず、最新origin/mainを基点に新規作業 |
| ui/castle-six-characters | `9c1ebb4` | `c63a499` | ローカルは35コミット遅れ。元のFX Lab追加だけで最新機能を判断しない |
| ui/throne-combat-first-pass | `0023070` | `0023070` | 一致 |
| docs/consolidate-game-design | `4a5afeb` | `15d9976` | ローカルは4コミット遅れ。追加承認事項・GitHub未収録参照の整理もリモート側に存在 |
| work | `a046e4c` | `a046e4c` | 一致 |

## PRとマージ状況

取得できた全3PRは次のとおり。既存PRへの更新・コメント・クローズ・マージは行っていない。

| PR | 状態 | 先端・マージ先 |
|---|---|---|
| [#1 FX Lab](https://github.com/elizabeeeth555/roguelike-card-game/pull/1) | OPEN、main未マージ | head `c63a4990244ff09c686c0e268b15910d8f9aa32e` |
| [#3 設計資料整理](https://github.com/elizabeeeth555/roguelike-card-game/pull/3) | MERGED | head `15d997659fc834ad404b9db5b5120a8ee7267288`、merge `06b4a3418593e23f6389627d7436a11a25158a88` |
| [#4 戦闘UI第1弾](https://github.com/elizabeeeth555/roguelike-card-game/pull/4) | MERGED | head `00230706ea6755d4e5c7b58c4751cff6351ef840`、merge `8b5539021e62a2bc56d0de8561c6e23b86bdf81c` |

PRの日時を記す場合は日本時間へ換算する。GitHub APIのUTC日付が11月9日であっても、両マージは日本時間11月10日の作業。

## mainにないFX Lab成果

リモート先端のテキストと差分を読み取り、checkout・統合・実行による改変はしていない。

- `dev/fx-lab.html`、`dev/fx-lab/`：独立したプレビュー、設定JSONの検証・タイムライン、映像／SEレイヤー、命中・ダメージ表示、実戦風レイアウト、拡大プレビュー。
- 基本映像＋追加最大3、基本SE＋追加最大3、ローカルファイル選択、JSON保存／読込、A/B比較等が資料に記載されている。ここでは最新機能の動作テストは再実行していない。
- `tests/fx-lab*.test.cjs`、`reports/fx-lab/`：関連テスト・検証・画像記録。
- 変更はdevだけではなく、`.gitignore`、README、`scripts/check.cjs`にもある。王座工房へ移す際にまとめて適用せず、目的ごとに確認する。
- PR #1側には`/private-assets/`と`*.fx-lab.local.json`の除外があるが、**現mainにはない**。今回mainの.gitignoreは変更しない。素材を配置する前に、次工程の承認範囲で安全対策を整える。
- 調査した追跡対象に`private-assets/`はない。ただしファイル名確認はライセンス・購入状況の全面監査ではない。

## 削除判断の留意点

1. main・PR #1のブランチは保護。`chore/repository-workflow`も今回の未コミット成果を持つので維持する。
2. PR #3/#4の完了ブランチとworkは候補にとどめる。今回削除しない。
3. 実行時に再fetchし、新しい独自コミット、別worktree、別PC、外部参照、未push成果の有無を確認する。
4. ローカル／リモートの削除は別操作。どちらを許可されたか明示する。強制削除で未反映警告を回避しない。
5. 未追跡ファイルはブランチ履歴とは別に存在する。ブランチがマージ済みでも研究ファイルを片付けてよいことにはならない。

## 次工程で先に整理する点（調査のみ）

| 工程 | 構造上の観察・手戻りリスク | 推奨する準備 |
|---|---|---|
| STEP 2 | 本編はclassic scriptの読み込み順、共有app、固定DOM IDに依存。UIと入力の境界はあるが、Reactへそのままコピーできない | 呼出し・状態・DOM・タイマーの依存を棚卸しし、外部動作不変の抽出単位と回帰条件を決める |
| STEP 2 | CSSはstyles→castle-ui→readability→battle-layoutの4層。編集値を別の層で上書きすると工房と本編がずれる | 最終寸法の所有者と用途別プレフィックス、表示設定の候補を先に確認。今回CSSは変更しない |
| STEP 2 | GameBattleはmutable executeとimmutable transition、snapshot/restoreを持ち、DOM非依存。研究には別形式・仮ルールがある | 共通コアと研究の境界・JSON形式を維持し、型付けや設定抽出で戦闘結果を変えない |
| STEP 3 | ルートはビルド不要の公開ゲーム。王座工房のReact/TS/Viteは未導入 | 独立ツールの配置・ビルド出力・ローカル素材保護・検査対象を別依頼で設計。root indexやPages設定を上書きしない |
| STEP 3 | PR #1には本編と独立したJSON・タイムラインとDOM／Canvas制御がある。プレビューは固定サンプルで本編と完全一致しない | JSON互換の保護対象と移植対象を分離。工房の共通基盤と編集機能を別PRにし、PR #1の保管／統合方針をレビュー |
| STEP 4以降 | FX・UI・Storyで座標、時間、素材参照の扱いが分かれると後から移植しにくい | 素材本体と設定、識別子と表示名、設定schemaと実行アダプタの境界を先に合意。Story等の未承認仕様は作らない |

## 確認の限界と実行範囲

別PCの未pushコミット・ローカル素材、担当者のwork利用状況、将来の統合時の競合は未確認。PR #1最新機能・公開版の再プレイ・大規模シミュレーションは今回の対象外。
実施したGit変更は専用ブランチのローカル作成とリモート追跡参照の取得のみ。既存ローカルブランチの先端、リモートブランチ、PR、公開設定は変更していない。

追試用の読み取り例：

```bash
git branch -avv
git ls-remote --heads origin
git rev-list --left-right --count origin/main...origin/work
git log --oneline origin/main..origin/ui/castle-six-characters
git diff --name-status origin/main...origin/ui/castle-six-characters
gh pr list --repo elizabeeeth555/roguelike-card-game --state all
gh api repos/elizabeeeth555/roguelike-card-game/pages
```

## STEP 1の軽量検証結果

- `npm test`：108件成功。`npm run check`：JavaScript構文検査成功。
- `git diff --check`：成功。追加・変更5文書の内部Markdownリンク36件に切れなし。
- 変更許可した既存3文書を除く3,767ファイルを作業前のSHA-256と比較し、変更・削除なし。未追跡の研究・テスト・報告も保護した。
- 新規ファイルは本規約とこの棚卸しの2文書のみ。ゲームコード・素材・設定・研究・既存レポートの変更なし。
- ブラウザ実機・大規模シミュレーション・PR #1の再テストは未実施（本作業の対象外）。
- commit、push、PR作成、merge、deploy、既存ブランチ削除・リネームは行わず、未コミット差分でレビュー待ち。
