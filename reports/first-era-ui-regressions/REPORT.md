# 第一紀React UIの要件監査・復元

基点：`be4007d24164bdf54f2cc79088c401053410c3f8`（PR #35反映後）。専用worktree・`fix/first-era-ui-regressions`で実施。

本書と[requirements.json](requirements.json)は**監査スナップショット**。仕様を再定義する正本ではなく、最新要件は[UI正本](../../docs/features/ui.md)、数値・効果は[戦闘](../../docs/features/combat.md)・[スキル](../../docs/features/skills.md)を参照する。

## 調査方法・根拠

- ui.mdの非空本文条項をすべて収録し、各行の固定SHAリンク・適用範囲・変更前分類・対応・実装根拠・検証方法を付した。複合条件は原文リンク先の全文を読む。将来/履歴/未確定の細部は現在の復元義務と区別する。
- 旧classicの`src/ui/render.js`の`cardDisplayState`/`renderStatusIcons`、`src/app/battle-controller.js`の終了確認、`src/ui/controls.js`等を読取比較。旧高度・旧配置・旧演出時間を持ち込まない。
- Git履歴：`0023070`の旧UI（状態・確認・全画面）、`221cfe5`のReact移植（状態ラベル中心）、`d668bdf`の第一紀ホスト、`ebe8e67`の画像接続（MPは通常結晶のみ）、現在の共通表示を比較。加速仮結晶は現行ui.mdでも確定だが未実装だった。過去合意の全チャットや未登録のデザイン原画像は確認できないため推測で補完しない。
- 現行スキル10種には毒必須の通常スキルはない。条件未達の表示は共有部品・旧Reactの既存条件付きスキル/工房仮データで検証し、新第一紀へ条件を新設しない。固定奥義の再演元なしは実際の本編状態で検証する。

## 修正一覧

|対象|変更前|対応|
|---|---|---|
|終了確認|奥義も未使用行動へ加算|コアの合法手から通常スキル/加速だけを確認対象にする。奥義の合法性・効果は不変|
|カード状態|画像スキンで差が弱く、MP/条件の専用表示状態が不足|used/CD/MP不足/条件/手番・演出ロック/readyを表示データから区別。選択・focusは輪郭で区別し、文字は暗転しない|
|MP|通常結晶のみ|加速ホバー/フォーカスの仮結晶・予約の維持・自ターンの実結晶への更新。上限到達時はコアの不可判定に従いプレビューしない|
|状態効果|長い名称の常設列・詳細なし|7種の数値とアイコン、閲覧専用共通popover。毒の現在ダメージはコアから取得。未登録のMP妨害/加速絵柄は仮記号と明記|
|通常表示|空の状態文、同一理由の重複、長い再演元|空文を表示しない、理由を重複除去、再演元の名前は既存の詳細へ保持|
|全画面|Reactに導線なし|第一紀ホストの操作でdocumentElementを切替、外部終了に追従、非対応/拒否時も継続。共通表示にはAPI処理を混入しない|
|ダメージ数値|赤色だが符号なし・英雄数値が左下|負符号と中央下の軽量表示を復元。ログ/計算/専用FXは変更しない|
|敵枠の小さな揺れ|記載はあるが装飾は静止|画像レイヤーだけ微小に動かし、入力枠は不動。厳密な幅・速度は暫定、動き軽減を尊重|

## 条項別監査台帳

`実装済み`はコード・既存テストとの照合であり、最終意匠・実機操作が承認された意味ではない。`未確認`は推測で成功扱いにしない。`対象外`は将来/廃止/旧classicの記録である。

|ID|正本の章・原文|変更前|今回|実装根拠|
|---|---|---|---|---|
|U007|固定奥義の使用済み表示（2026-11-15承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L7)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U009|固定奥義の使用済み表示（2026-11-15承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L9)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U010|固定奥義の使用済み表示（2026-11-15承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L10)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U011|固定奥義の使用済み表示（2026-11-15承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L11)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U012|固定奥義の使用済み表示（2026-11-15承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L12)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U016|PC優先方針（2026-11-13承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L16)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U018|PC優先方針（2026-11-13承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L18)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U024|ボス固有能力の確認UI（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L24)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U025|ボス固有能力の確認UI（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L25)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U026|ボス固有能力の確認UI（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L26)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U027|ボス固有能力の確認UI（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L27)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U028|ボス固有能力の確認UI（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L28)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U029|ボス固有能力の確認UI（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L29)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U030|ボス固有能力の確認UI（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L30)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U036|第一紀老王《断誓一閃》の予告・チャージ演出（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L36)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U037|第一紀老王《断誓一閃》の予告・チャージ演出（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L37)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U038|第一紀老王《断誓一閃》の予告・チャージ演出（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L38)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U039|第一紀老王《断誓一閃》の予告・チャージ演出（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L39)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U040|第一紀老王《断誓一閃》の予告・チャージ演出（2026-11-15確定／専用依存ブランチ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L40)|実装済み|維持|`apps/game-web/src/components/BossAbility.tsx`|
|U046|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L46)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U048|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L48)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U049|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L49)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U050|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L50)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U051|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L51)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U052|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L52)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U053|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L53)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U054|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L54)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U055|素材適用後の表示・配置修正（2026-11-14最新承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L55)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U061|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L61)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U065|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L65)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U066|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L66)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U067|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L67)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U068|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L68)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U069|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L69)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U070|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L70)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U071|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L71)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U072|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L72)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U073|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L73)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U074|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L74)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U075|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L75)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U076|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L76)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U077|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L77)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U079|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L79)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U080|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L80)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U081|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L81)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U082|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L82)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U083|登録UI画像の適用（2026-11-14承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L83)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U087|新第一紀の画面適用範囲（2026-11-12承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L87)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U089|新第一紀の画面適用範囲（2026-11-12承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L89)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U096|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L96)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U098|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L98)|未確認|未確認|`apps/game-web/src/BattleView.tsx`|
|U102|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L102)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U103|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L103)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U104|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L104)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U105|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L105)|劣化|修正|`apps/game-web/src/components/skill-display.ts`|
|U111|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L111)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U112|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L112)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U113|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L113)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U114|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L114)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U115|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L115)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U116|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L116)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U117|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L117)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U118|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L118)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U119|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L119)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U121|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L121)|欠落|修正|`apps/game-web/src/first-era/first-era.css`|
|U122|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L122)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U126|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L126)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U127|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L127)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U128|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L128)|劣化|修正|`apps/game-web/src/components/skill-display.ts`|
|U132|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L132)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U133|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L133)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U134|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L134)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U135|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L135)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U136|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L136)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U137|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L137)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U141|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L141)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U142|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L142)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U143|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L143)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U144|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L144)|劣化|修正|`apps/game-web/src/components/StatusEffects.tsx`|
|U145|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L145)|欠落|修正|`apps/game-web/src/components/ResourceDisplay.tsx`|
|U146|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L146)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U150|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L150)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U152|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L152)|劣化|修正（軽量数値表示）／専用FXは未確認|`apps/game-web/src/first-era/event-presentation.ts`|
|U153|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L153)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U154|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L154)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U156|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L156)|未確認|未確認|`apps/game-web/src/BattleView.tsx`|
|U158|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L158)|未確認|未確認|`apps/game-web/src/BattleView.tsx`|
|U159|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L159)|未確認|未確認|`apps/game-web/src/BattleView.tsx`|
|U160|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L160)|未確認|未確認|`apps/game-web/src/BattleView.tsx`|
|U162|新第一紀・PC戦闘UIデザイン（2026-11-12承認／mainへ実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L162)|未確認|未確認|`apps/game-web/src/BattleView.tsx`|
|U166|第一紀・戦闘演出改善 第1弾（2026-11-13） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L166)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U168|第一紀・戦闘演出改善 第1弾（2026-11-13） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L168)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U169|第一紀・戦闘演出改善 第1弾（2026-11-13） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L169)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U170|第一紀・戦闘演出改善 第1弾（2026-11-13） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L170)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U171|第一紀・戦闘演出改善 第1弾（2026-11-13） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L171)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U172|第一紀・戦闘演出改善 第1弾（2026-11-13） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L172)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U173|第一紀・戦闘演出改善 第1弾（2026-11-13） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L173)|実装済み|維持|`apps/game-web/src/BattleView.tsx`|
|U179|旧公開版UI・過去の第1〜3弾計画（履歴参照） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L179)|対象外|対象外|`apps/game-web/src/BattleView.tsx`|
|U183|王座イベントの順序（確定／未実装） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L183)|対象外|対象外|`apps/game-web/src/BattleView.tsx`|
|U187|戦王の将来表示（方向確定／未実装） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L187)|対象外|対象外|`apps/game-web/src/BattleView.tsx`|
|U191|React UIと王座工房での共通表示（2026-11-10承認・第一段階実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L191)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U193|React UIと王座工房での共通表示（2026-11-10承認・第一段階実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L193)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U195|React UIと王座工房での共通表示（2026-11-10承認・第一段階実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L195)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U199|王座工房の必須原則と並行開発 [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L199)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U201|王座工房の必須原則と並行開発 [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L201)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U202|王座工房の必須原則と並行開発 [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L202)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U204|王座工房の必須原則と並行開発 [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L204)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U206|王座工房の必須原則と並行開発 [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L206)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U208|王座工房の必須原則と並行開発 [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L208)|実装済み|現行部維持／将来部分は対象外|`apps/game-web/src/studio/StudioScreen.tsx`|
|U214|変動効果の共通表示規則（2026-11-13承認／React第一紀に実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L214)|実装済み|維持|`apps/game-web/src/first-era/presentation.ts`|
|U215|変動効果の共通表示規則（2026-11-13承認／React第一紀に実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L215)|実装済み|維持|`apps/game-web/src/first-era/presentation.ts`|
|U216|変動効果の共通表示規則（2026-11-13承認／React第一紀に実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L216)|実装済み|維持|`apps/game-web/src/first-era/presentation.ts`|
|U217|変動効果の共通表示規則（2026-11-13承認／React第一紀に実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L217)|実装済み|維持|`apps/game-web/src/first-era/presentation.ts`|
|U218|変動効果の共通表示規則（2026-11-13承認／React第一紀に実装済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L218)|実装済み|維持|`apps/game-web/src/first-era/presentation.ts`|
|U222|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L222)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U224|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L224)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U225|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L225)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U226|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L226)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U227|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L227)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U228|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L228)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U229|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L229)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U230|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L230)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U232|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L232)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U234|第一紀プレイ可能版の画面・演出（2026-11-13追加承認） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L234)|実装済み|維持|`apps/game-web/src/first-era/FirstEraApp.tsx`|
|U240|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L240)|実装済み|維持|`apps/game-web/src/first-era/audio.ts`|
|U241|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L241)|実装済み|維持|`apps/game-web/src/first-era/audio.ts`|
|U242|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L242)|実装済み|維持|`apps/game-web/src/first-era/audio.ts`|
|U243|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L243)|実装済み|維持|`apps/game-web/src/first-era/audio.ts`|
|U244|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L244)|実装済み|維持|`apps/game-web/src/first-era/audio.ts`|
|U245|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L245)|実装済み|維持|`apps/game-web/src/first-era/audio.ts`|
|U247|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L247)|未確認|未確認|`apps/game-web/src/BattleView.tsx`|
|U251|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L251)|実装済み|維持|`apps/game-web/src/first-era/audio.ts`|
|U253|第一紀専用の音声（2026-11-13承認／PR #27でmain反映済み） [原文](https://github.com/elizabeeeth555/roguelike-card-game/blob/be4007d24164bdf54f2cc79088c401053410c3f8/docs/features/ui.md#L253)|実装済み|維持|`apps/game-web/src/first-era/audio.ts`|
|A01|今回依頼2＋履歴のスキルパネル・詳細 最新依頼・履歴|劣化|修正|`apps/game-web/src/first-era/turn-confirmation.ts`|
|A02|今回依頼5＋履歴のrenderStatusIcons 最新依頼・履歴|欠落|修正|`apps/game-web/src/components/StatusEffects.tsx`|
|A03|履歴の第1弾PC全画面（継続承認、今回依頼7） 最新依頼・履歴|欠落|修正|`apps/game-web/src/components/FullscreenButton.tsx`|
|A04|今回依頼6＋現行簡潔表示 最新依頼・履歴|劣化|修正|`apps/game-web/src/components/SkillDetail.tsx`|
|A05|歴史の習得・交換・旧継承・旧ゲージ・旧時間 最新依頼・履歴|対象外|対象外|`docs/history/ui-before-2026-11-15-cleanup.md`|

## 画面横断・回帰対象

タイトル/拠点/編成/保存/勝敗/再戦、HP二段表示・色・予測、MP/CD・状態、詳細のホバー/中央拡大/外側/Esc/焦点復帰、敵5枚と左右配置・鎖、通常5枚と中央奥義、宣言/速度/単独スキップ/一括スキップ、ログ・入力ロック・generation中断、音声/結果無音、画像原本・公開allowlist、工房の編集/保存/JSONを既存テストで回帰確認する。セーブキー/形式、戦闘コア・AI・スキル定義は変更しない。

## 検証と未確認

ルート130件・React44件、型チェック/ビルド/静的チェック/公開配置整合を確認。追加のUIブラウザテストは1366/1280/320/390/430/760/761pxで、通常/加速の確認、奥義のみで確認なし、仮結晶/予約/確定/上限、状態7種の閲覧と不変性、使用不可詳細と横スクロールなしを確認した。既存の導線・演出・工房・classicのHTTP回帰も維持する。ブラウザfixtureはCDPの新規プロファイル内だけで初期状態を設定し、製品のデバッグフック・新しいルール・保存形式を追加しない。工房は同じ部品を使い、既存のJSON/編集ホストを変更しない。

未確認・別工程：実機/iOS/聴感、正式参考画像との美術評価、専用FX/SE・中央下被弾FXの本格移設、ゲームパッド/Steam、第二紀・戦旗・複数対象、王座イベント/Story、工房の配置編集。保留の絵柄・色・寸法を今回独断で正式決定しない。旧崩し・旧継承枠・旧習得導線・classicのFX設定パネルは復元しない。

ネイティブ全画面はheadless ChromiumでrequestFullscreenの要求が未完了となり、実際のOS全画面への移行は未確認。切替ボタン・fullscreenchangeによる外部終了同期・非対応・拒否はブラウザ内のAPI境界モックで確認し、native成功と混同しない。状態と加速の画面は`.test-artifacts/ui-regressions/`へ保存（Git管理対象外）。

再確認コマンド（ルートでHTTP配信したビルドを使用）：

```bash
npm --prefix apps/game-web run build
npm --prefix apps/game-web test
npm run build:pages
npm test
npm run check
npm run check:pages
# 別ターミナルで python3 -m http.server 8000 --bind 127.0.0.1
FIRST_ERA_URL=http://127.0.0.1:8000/ npm --prefix apps/game-web run test:ui-regressions
FIRST_ERA_URL=http://127.0.0.1:8000/ npm --prefix apps/game-web run test:first-era:browser
git diff --check
```

通常スキルの条件未達は第一紀へ新しい条件を設けず、コア由来の旧React状態と工房固定表示データで確認する。専用ブラウザfixtureの特殊状態は実戦の合法な到達状態を保証せず、情報閲覧・表示検証のためだけに使用する。

小画面で状態7種を並べた際、末尾アイコンの下端がスキル枠上端と重なることを実測したため、状態行を1行の横スクロールとし、HP周囲の余白を圧縮して操作枠と分離した。全効果は削除せずTab/タップ・横スクロールで閲覧できる。PCの基本配置は変更しない。
