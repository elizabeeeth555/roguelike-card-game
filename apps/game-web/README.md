# 継世の王座 — Reactアプリと王座工房

更新：2026-11-15。**現在の実装入口と開発方法**だけを記載する。STEP 3-A/3-Bの当時の検証報告・「未公開」「未実装」などは[旧READMEの履歴](../../docs/history/react-app-readme-before-2026-11-15-cleanup.md)に保存した。現在の公開配置は[ルートREADME](../../README.md)と[技術構成](../../docs/architecture.md#pages-production)、仕様状態・優先度は[status](../../docs/status.md)を正本とする。

## 画面と公開入口の違い

| 入口 | 用途 |
|---|---|
| 開発サーバー `/` | 独立React技術検証。新第一紀の実ゲーム導線とは別 |
| 開発サーバー `/first-era.html` | 第一紀プレイ可能版（拠点・自由編成・老王戦・勝敗・再戦） |
| 開発サーバー `/dev-preview.html` | 王座工房MVP第1段階。共通BattleViewを使う編集・試写 |
| リポジトリルート `index.html` | `npm run build:pages`生成の第一紀公開配置ソース。PR #28でmain反映 |
| リポジトリルート `classic/` | 旧ランダム習得型（新第一紀の旧仕様ではない） |

GitHub Pagesの実配信／実機動作はmain反映と区別する。Vite開発・通常buildは公開ルートへ直接書き込まず、公開配置の生成にはリポジトリルートの専用スクリプトを使う。

## 起動と検証

Node.js 24以上。リポジトリルートで実行する。

```bash
npm --prefix apps/game-web ci
npm --prefix apps/game-web run dev
# http://127.0.0.1:5173/             React技術検証
# http://127.0.0.1:5173/first-era.html 第一紀
# http://127.0.0.1:5173/dev-preview.html 王座工房
```

```bash
npm --prefix apps/game-web run typecheck
npm --prefix apps/game-web test
npm --prefix apps/game-web run build
npm --prefix apps/game-web run test:browser
npm --prefix apps/game-web run test:first-era:browser
# 公開用生成物を更新する場合のみ：
npm run build:pages
npm run check:pages
npm test
```

ブラウザ試験はHTTP起動後に必要に応じ`CHROME_PATH`と`FIRST_ERA_URL`等を指定する。ChromiumのPC・スマホビューポート検証は、iOS等の人間による実機操作や聴感の証明ではない。テスト成果は原則Git管理外の`.test-artifacts/`へ保持する。

## 共有構造・責務

- `battle-adapter.ts` と第一紀ホストが共通の戦闘コア・AI-2へ接続し、表示側で合法判定・ダメージ式を再実装しない。
- `BattleView`・スキル詳細・HP/MP/CD等は共通表示部品。本編は実戦データ、工房は読取専用の試写データを供給する。工房用の戦闘模倣UIを別実装しない。
- `first-era/FirstEraApp.tsx` は第一紀の画面進行・編成・入力/演出ロック・再戦、`first-era/presentation.ts` は表示モデルへの変換、`first-era/save.ts` は進行保存と初回勝利の固定記録を所有する。変更は[UI](../../docs/features/ui.md)・[進行](../../docs/features/progression.md)を参照。
- `first-era/audio.ts`・`use-first-era-audio.ts` は第一紀専用の音声管理を所有し、共通描画・工房・コアへ音声再生の副作用を混ぜない。設定・終了時動作は[UI正本](../../docs/features/ui.md#first-era-audio)に従う。

## 王座工房MVP第1段階（PR #20でmain反映）

`/dev-preview.html`は基本外観編集・即時プレビュー・既定値復帰・ブラウザ内自動保存・JSON入出力を提供する。現在のプリセットは独立技術検証用であり、新第一紀のすべての画面を編集できる完成版ではない。

`StudioScreen.tsx`が編集UI、`studio/battle-design-editor.ts`が設定接続、`studio/settings-document.ts`が形式とバージョンの検証・安全な入出力、`battle-design.ts`が外観設定の検証を担う。既存JSON形式`throne-studio.battle-design`（version 1）、localStorageキー`throne-studio.battle-design.v1`は変更しない。原文仕様と検証例は[旧README履歴](../../docs/history/react-app-readme-before-2026-11-15-cleanup.md#王座工房mvp-第1段階基本外観編集と保存)に保存済み。ゲーム進行の保存キーとは独立する。工房から本編への設定自動適用、汎用レイアウトドラッグ、FX/SE/Story編集は未実装。

## 次の優先実装

ボスHPバー右下へ固有能力アイコンを常時表示し、**PCホバー／スマホタップ**で効果を閲覧する共通表示UIを追加する。仕様は[UI正本](../../docs/features/ui.md#boss-ability-detail)のみで管理し、個別能力内容は[ボス](../../docs/features/bosses.md)を参照。現状この固有能力詳細UIは未実装であり、素材11番も未接続。ゲームロジック・AI・保存形式を変更せずに別工程で実装する。

## 保護するもの

`/classic/`、未マージのFX Lab PR #1、各研究・未コミット成果、非公開・購入素材は保護する。Viteの公開アセットは明示許可リストだけを配信し、`private-assets/`等の未許可ファイルを自動import・コピーしない。デプロイ・PR作成・マージは[運用規約](../../docs/development-workflow.md)に従い別途承認を要する。
