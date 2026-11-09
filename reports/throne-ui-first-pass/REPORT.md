# 『継世の王座』第1弾UI改修

2026-11-10（日本時間）。基点：最新main `06b4a3418593e23f6389627d7436a11a25158a88`。このファイルは実装・ローカル検証の記録。公開SHA・マージとPagesの最終状態はPRと完了報告で示す。

## 実装

- 正式タイトル「継世の王座」（けいせいのおうざ）をHTMLタブ、開始ヘッダー、戦闘左上、現行READMEへ反映。開始画面へ「王を討て。そして、王となれ。」を追加。歴史資料・既存研究レポート・内部ID・URLを維持。
- ルートdocumentElementのFullscreen APIで全画面開始／終了。fullscreenchangeに追従するので、設定・ログ・モーダルも同じ全画面内で動く。非対応は説明付き無効ボタン、拒否時はゲームを止めない。
- 敵5スキルは名前・MP・基本CD・使用済／CD中のみ。概要を非表示にしてPC高さ122→70px、スマホ96→77px。
- PC下部全体は195px（低解像度188px）→148px、スマホは216pxへ。プレイヤーHP・MP・状態・通常5枠・未解放継承枠・加速・終了を維持。
- 既存6キャラの個別framingを維持。PCは既存倍率に黒剣士.83／騎士.85／魔女.82／巨漢.88／斥候.86／賢者.84を補正。スマホは既存個別配置と倍率に.88を補正。仮の表示調整値で、画像ファイルは変更していない。
- PCのホバー／キーボードフォーカスは読取専用。効果全文、MP/CD、条件・使用不可理由を表示。選択・発動・戦闘状態変更なし、使用ボタンなし。
- クリック／タップでのみ選択し、「使用する」で確定。選択詳細に条件・理由・閉じる操作を追加。左右端は詳細と使用ボタンだけ補正し、本体位置は維持。スマホの使用ボタンはスキル上側へ置き、加速との重なりを回避。
- 演出中は情報確認を許可。既存canChangeBattle／availabilityは変更せず、不正な使用・加速・ターン終了を防止。
- CSSをstyles→castle-ui→readability→battle-layoutの順に整理。readabilityの重複した旧PC寸法を削除し、battle-layoutを戦闘寸法の所有レイヤーとする。

## 中央領域の実測比較

同一ボス・同一セットで、敵スキル一覧の下端からプレイヤースキル上端までを測定した。画像そのものの高さや、ウィンドウ全面積ではない。

| 画面 | 改修前px | 改修後px | 増加px |
|---|---:|---:|---:|
| 1280×720 | 216.2 | 336.2 | 120 |
| 1366×768 | 257.2 | 384.2 | 127 |
| 1920×1080 | 569.2 | 696.2 | 127 |
| 390×844 | 302.4 | 344.4 | 42 |

[前の実測](before-metrics.json)／[後の実測・チェック](browser-results.json)。比較元はmainのHTMLとsrcを/tmpへ展開した読み取り専用ページで、素材は変更せず共有。

## 検証

- `npm test`：108件成功（既存106件＋情報確認／全画面非対応の回帰2件）。敵ターンも情報確認可という新仕様に旧テストを合わせた。
- `npm run check`：成功。
- `npm run test:browser`：ローカルHTTP経由で成功。Linuxでは次の環境変数を指定。
- 既存ブラウザテストの結果待ち950msは、現在の勝敗演出より短かったため、最大6.4秒の状態待ちへ修正。ゲームの演出時間は変えない。
- 追加Playwright：PC1280×720・1366×768・1920×1080、390×844・375×812・320×740。横スクロールなし、PC縦スクロールなし。端詳細・二段階操作・ホバー不変・条件/CD/MP不足・設定・ログ・全画面・API非対応・6人の画像・勝利・再戦を確認。JS例外・HTTP読込エラーなし。
- タッチエミュレーションと全画面モーダル／拒否時の検証は[touch-results.json](touch-results.json)。
- [保護検証](protection.json)：研究・素材・src/game・既存未追跡成果など3,459ファイルはハッシュ不変。FX Lab PR #1のstate・head・更新時刻も変更前後で一致。

```bash
python -m http.server 18080 --bind 127.0.0.1
npm test
npm run check
BROWSER_TEST_URL=http://127.0.0.1:18080/ CHROME_PATH=/usr/bin/chromium CHROME_NO_SANDBOX=1 npm run test:browser
python3 reports/throne-ui-first-pass/browser-check.py
python3 reports/throne-ui-first-pass/touch-check.py
# URLと出力先を指定すれば、公開版の確認でも既存報告を上書きしない
python3 reports/throne-ui-first-pass/browser-check.py https://elizabeeeth555.github.io/roguelike-card-game/ /tmp/throne-public
```

この管理環境ではfile://が`ERR_BLOCKED_BY_ADMINISTRATOR`になる。HTTP経由のブラウザ検証を用い、ファイル直接起動を検証済みとはしない。
ブラウザはLinux Chromium headless／Playwright。スマホはビューポートとタッチのエミュレーション。Windows・Edge・Safari・実機Escキー、実機スマホ、聴感は未確認。ブラウザ起点の全画面終了はdocument.exitFullscreenでfullscreenchangeへの追従を確認した。

## スクリーンショット

- [PC改修前](screenshots/before-1366.png) → [PC改修後](screenshots/battle-1366x768.png)
- [スマホ改修前](screenshots/before-390.png) → [スマホ改修後](screenshots/battle-390x844.png)
- [PCホバー](screenshots/hover-1366.png)／[スマホ選択・使用](screenshots/selected-390.png)
- [CDと使用済み](screenshots/cooldown-1366.png)／[全画面](screenshots/fullscreen-1366.png)
- [開始・タイトル](screenshots/start-1366.png)／[勝利](screenshots/victory-1366.png)

他サイズと6人の個別画像確認もscreenshots配下へ保存。

## 変更しない仕様・次の確認

HP・MP・19スキル・CD・AI-2・消耗・毒・進行・抽選・テンポ・FX/SE/BGM・演出JSONは不変。老王・戦王・旗・複数対象・新ギミック・FX Lab改修・Story Lab・王座イベントは未実装のまま。
見た目の最適値・実機での触り心地は公開後のユーザー評価を要する。敵の行動演出全面改修やプレイヤー命中位置移設は第2弾へ引き継ぐ。

## 公開手順

ユーザーが今回の範囲に限ってcommit/push/PR/mainマージ/Pages公開を一括承認。
Pages設定は既存のlegacy方式、mainのルート（/）。設定変更・強制pushを行わず、専用ブランチのPRだけをマージする。FX Lab PR #1はマージしない。
