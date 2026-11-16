# 第一紀PC UI・最終レビュー画像（2026-11-16）

対象ブランチ：`fix/first-era-pc-ui-polish`。修正前HEAD：`cac344c3fb47bcc78fdb5de4edc3b3881917d639`。本資料と画像は今回の修正後のソースを既存Pagesビルド手順で生成し、ローカルHTTP配信して取得したレビュー成果物。GitHub Pagesへのデプロイ・main統合は行っていない。

仕様は[UI正本](../../docs/features/ui.md#pc-battle-ui-polish-2026-11-15)、スキル固有の素材対応は[スキル正本](../../docs/features/skills.md#個別ui素材強化の管理元)、原本・配信ハッシュは[素材台帳](../../docs/assets/ui-image-inventory.md)を参照。

| PC解像度 | 通常戦闘 | 奥義ホバー詳細 | 老王チャージ予告 | 敵スキル3状態 |
|---|---|---|---|---|
| 1920×1080 | [画像](screenshots/battle-1920.png) | [画像](screenshots/ultimate-hover-1920.png) | [画像](screenshots/charge-1920.png) | [画像](screenshots/enemy-states-1920.png) |
| 1366×768 | [画像](screenshots/battle-1366.png) | [画像](screenshots/ultimate-hover-1366.png) | [画像](screenshots/charge-1366.png) | [画像](screenshots/enemy-states-1366.png) |
| 1280×720 | [画像](screenshots/battle-1280.png) | [画像](screenshots/ultimate-hover-1280.png) | [画像](screenshots/charge-1280.png) | [画像](screenshots/enemy-states-1280.png) |

通常画面では英雄の暗色シルエットと、大振りの採用済みアイコンを確認できる。敵スキルの3状態画像は**表示検証用の初期状態fixture**：老王MPを1、重斬のCD待ちを設定し、斬撃等＝使用可能、重斬＝CD中、大振り＝MP不足を同時表示する。本編の既定値・AI・戦闘ルールを変更した結果ではなく、研究結果・バランス評価・AIの確定行動予告でもない。

画像はChromium headless／deviceScaleFactor=1のブラウザ自動操作で取得。OSのネイティブ全画面・iOS等の実機・人間のプレイ／画質／聴感評価は未確認。長文詳細は内容を省略せずスクロールとクリック拡大で閲覧できる。

## 検証と再現

```bash
npm test
npm run check
npm --prefix apps/game-web test
npm --prefix apps/game-web run build
npm run build:pages
npm run check:pages
python3 scripts/convert-ui-images.py --check
# リポジトリルートをローカルHTTP配信した状態で実行（例：python3 -m http.server 8081）
FIRST_ERA_URL=http://127.0.0.1:8081/ node apps/game-web/tests/ui-layout-browser.cjs
FIRST_ERA_URL=http://127.0.0.1:8081/ node apps/game-web/tests/finisher-browser.cjs
```

ルート130件・React45件、型チェック・ビルド・静的チェック・Pages配置整合、PNG42枚の原本ハッシュ、配信用WebP34枚の寸法・alpha・ハッシュを確認。PC3解像度と320/390pxの操作・モーダル、仮肖像・25番アイコン・配置・HP・MP/CD・詳細の回帰を確認する。工房／React技術検証は既存`apps/game-web/tests/browser-smoke.cjs`、classicは既存`npm run test:browser`で別途検証する。

ブラウザの詳細ログ・JSON・Chromeプロファイル・中間ビルドは同梱しない。公開配置には従来どおり必要な実行用ビルドだけを含める。
