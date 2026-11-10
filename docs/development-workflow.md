# 開発・GitHub運用規約

対象：『継世の王座』／リポジトリ `elizabeeeth555/roguelike-card-game`。
制定日：2026-11-10（日本時間）。**ユーザー指定の運用規則として確定**。本書が運用・命名の正本であり、自動強制ツールの導入を意味しない。
仕様の優先順位・仕様状態と実装状態の定義は[設計資料入口](README.md)を参照する。過去のブランチ名やコミットをこの規約に合わせて書き換えない。

## 1. ブランチ運用

- `main`を安定版・公開版として維持する。mainへの直接pushは原則禁止。例外はその依頼でユーザーが明示承認した場合だけ。
- 作業開始時にstatus、現在のブランチ／HEAD、未コミット・未追跡ファイル、ローカル／リモートの差、関連PR、公開方式を確認する。
- 原則として**取得・確認した最新リモートmain**から専用ブランチを作る。ローカルmainが最新とは限らない。`origin/main`等の追跡参照もfetch前は古い可能性がある。
- 1ブランチ・1PRにつき1つの明確な目的。機能実装、ロジック調整、UI改修、研究の境界を意識し、ゲームロジック変更とUI改修は原則別PRにする。
- ブランチ作成や切替が既存差分と衝突する場合は停止して報告する。未追跡ファイルを上書きする切替、勝手なstash、削除、`reset --hard`、強制pushで解消しない。
- マージ済みブランチはmainへの反映と独自成果の有無を確認して**削除候補**にする。候補という分類は削除の承認ではない。
- 未マージ成果、研究作業、用途不明ブランチを勝手に削除しない。用途不明なら履歴・対応PR・mainとの差を調べる。
- 作業開始・レビュー・作業終了／中断の節目で棚卸しを更新する。長期中断時は目的、最新SHA、PR、未反映成果、次の判断を残す。長期間放置せず、削除と継続を区別する。
- 既存PRのクローズ／マージ、ブランチ削除／リネームは個別の明示承認を必要とする。

確認時の例（切替は依頼で許可され、安全を確認した場合だけ）：

```bash
git status --short --untracked-files=all
git branch -avv
git fetch origin
# fetch対象がmain限定の環境もあるため、必要な参照を取得できたか確認する
git log -1 origin/main
git switch --no-track -c chore/repository-workflow origin/main
```

fetchはリモートの内容を取得する操作であり、リモートへのpushや既存作業のマージではない。新規作業ブランチをorigin/mainの追跡ブランチにせず、初回pushが承認された時点で同名の作業ブランチをpush先・追跡先として明示する。

## 2. ブランチ命名

形式：`種類/対象-作業内容`。英小文字・数字・ハイフンを基本とし、短く具体的にする。スラッシュは種類と名前を区切る。

| 種類 | 用途 | 例 |
|---|---|---|
| `feat/` | 新機能 | `feat/studio-foundation` |
| `fix/` | 不具合修正 | `fix/ui-skill-tooltip` |
| `refactor/` | 外部動作を変えない内部整理 | `refactor/ui-config-foundation` |
| `docs/` | ドキュメント | `docs/combat-status-rules` |
| `test/` | テスト | `test/studio-json-compatibility` |
| `chore/` | 開発環境・運用 | `chore/repository-workflow` |
| `research/` | 独立検証 | `research/defense-skill-balance` |

王座工房の例：`feat/studio-ui-editor`、`feat/studio-fx-editor`、`feat/studio-story-editor`。
`work`、`test2`など目的を表さない**新規**名は禁止。既存`ui/`ブランチや`work`は棚卸し対象として保持し、本作業で一括リネームしない。

## 3. PR・コミット

両方ともConventional Commits形式：`種類(対象): 変更内容`。対象を短い英語で示し、変更内容は日本語でもよい。

```text
feat(studio): 共通編集画面を追加
fix(ui): スキル詳細表示の不具合を修正
refactor(ui): レイアウト設定を分離
docs(combat): 状態異常仕様を整理
chore(repo): 開発運用規則を統一
```

PR本文には以下を最低限記載する。

1. 目的。
2. 変更内容。
3. 変更しない範囲。
4. テスト・検証結果（実行コマンド・条件・成功／失敗）。
5. 未確認事項・残課題。
6. 関連する仕様書。

試験未実施を成功としない。AI試験・ブラウザエミュレーション・実機・聴感を区別する。PRの目的が変わったら、タイトルと本文を最終差分に合わせて更新する。

## 4. ソース命名

| 対象 | 規則・例 |
|---|---|
| 一般のJS/TSファイル | kebab-case：`skill-tooltip.js`、`layout-config.ts` |
| Reactコンポーネント | シンボル名はPascalCase。コンポーネント実装ファイルは一般ファイル規則の例外として`SkillPanel.tsx`等のPascalCase |
| 変数・関数 | camelCase：`selectedSkill`、`showSkillDetail` |
| 型・クラス | PascalCase：`SkillConfig`、`PreviewSession` |
| 定数 | UPPER_SNAKE_CASE：`MAX_SKILL_COUNT`。変更されない設定定数に適用し、すべてのconst変数を大文字にしない |
| CSSクラス | kebab-case：`skill-tooltip` |
| CSSカスタムプロパティ | 用途別プレフィックス付きkebab-case：`--ui-panel-gap`、`--fx-impact-scale`、`--story-fade-duration` |
| スキル・ボス等の内部ID | 既存snake_case等を維持：`heavy_slash`、`boss_knight_defense` |
| JSON設定ファイル | kebab-case：`slash-heavy.json` |

既存のファイル・関数・定数・CSS・IDを今回一括リネームしない。既存ID、設定JSON、セーブ形式、テストとの互換性を優先する。新規・変更対象への適用範囲をPRで説明する。
この規則はReact導入や本編移行の実施許可ではない。

## 5. 素材命名

新規素材は用途の識別できるプレフィックスを付ける。

| 用途 | 例 |
|---|---|
| UI | `ui-frame-gold.webp`、`ui-button-primary.svg` |
| アイコン | `icon-status-poison.svg`、`icon-skill-venom-blade.svg` |
| 映像 | `fx-slash-heavy.webp` |
| 物語 | `story-throne-intro.webp` |
| SE | `sfx-ui-confirm.wav` |
| BGM | `bgm-boss-ashen-king.mp3` |

表示名と内部素材ID・ファイル名を分離し、素材マップ／設定で対応させる。上記は命名例であり、実在・購入・採用済み素材ではない。
既存素材は今回リネームしない。外部素材は出典・ライセンス・加工／再配布可否を確認する。購入素材・非公開素材・秘密情報は公開しない。
`private-assets/`などの除外設定が実際に有効か確認し、除外されていると推測しない。設定JSONに素材本体や秘密情報を埋め込まない。

## 6. Git操作と承認

通常の手順：

1. ChatGPTと仕様・依頼内容を確認する。
2. ユーザーの承認を得る。
3. Codexが専用ブランチで実装・テストする。
4. Codexが変更内容・検証結果を報告する。
5. ChatGPTとユーザーがレビューする。
6. 承認された範囲のcommit・push・PR作成・マージを行う。
7. 公開が許可された場合は公開結果を確認する。

Codexは**依頼ごとに許可されたGit操作だけ**を実行する。commit、push、PR作成、merge、deploy、既存ブランチ削除は、それぞれユーザーの明示承認が必要。PRクローズ、既存ブランチのリネームも独断で行わない。
ユーザーが一括承認した場合は、その依頼の範囲内で承認済み工程を進める。過去の一括承認を次の依頼へ持ち越さない。承認を得ても失敗したテスト・重大不具合・想定外の差分を無視しない。

commit前にdiffとstatusを確認し、対象パスを明示してステージングする。未コミット研究や購入素材を含める包括的な`git add .`を避ける。
push前にリモートURL・ブランチ・対象コミット・差分を確認する。マージ前に最新base・PRの最終HEAD・検証結果・対象ファイルを再確認する。強制pushは禁止。

### Pagesへの影響

[公開方式](architecture.md)はGitHub側でも確認する。2026-11-10確認時点ではGitHub Pagesのlegacy方式、**mainブランチのルート（/）から自動公開**。
したがってmainへのマージは公開への影響を伴う操作であり、単なるローカル整理ではない。マージだけ許可されていて公開の意図が不明なら、先にその影響を確認する。
公開時は対象SHAのジョブ成功、公開URLの新HTML/JS/CSS、必要な画像・音源、キャッシュを確認する。ジョブ成功と公開版の操作検証は別に報告する。失敗や未確認を公開完了と扱わない。

## 7. 仕様・研究・成果物の保護

- 最新ユーザー承認を最優先し、仕様状態と実装状態は[入口の定義](README.md)で管理する。
- 本編と研究環境を混同せず、研究結果を自動的に正式仕様へ昇格させない。
- 未コミット・未追跡の研究成果、検証データ、他の作業差分を保護する。
- 既存FX Labの[PR #1](https://github.com/elizabeeeth555/roguelike-card-game/pull/1)を保護する。王座工房の参考／移植元であり、統合を自動実行しない。
- 購入・非公開素材・秘密情報を公開しない。GitHub Pagesでの配信対象も確認する。
- ゲームロジックとUIを原則別PRにし、独立研究には研究用の設定と成果物保存先を用意する。
- 文書整理で旧資料を削除する場合は固有情報の移管を確認する。歴史的レポートを最新状態へ書き換えない。

## 8. 棚卸しと次工程

[2026-11-10の棚卸し](repository-inventory-2026-11-10.md)は確認時点のスナップショット。[現在の状態](status.md)は現状を管理する。定期整理では現在のリモート・PRを再取得し、過去の分類だけで削除しない。

次はSTEP 2の構造調査・必要最小限のリファクタリング、STEP 3の王座工房React + TypeScript + Vite基盤、STEP 4以降のUI／FX／Story編集へ進む予定。各工程は別依頼で範囲と承認を確認する。本STEPでコード変更・導入・統合を先行しない。
