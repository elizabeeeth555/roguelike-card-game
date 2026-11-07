# 第一紀 UI・戦闘演出更新の再現

ブランチ：`ui/castle-six-characters`。作業前HEAD：`b296858c29b2e4bfac2fd2895cfaad7e8d6424d1`。
ゲームコア/AI/抽選は変更しない。ローカルコミットのみ、push/deployしない。

## 環境・コマンド

Linux x86_64 / Node.js v24.22.1 / Chromium 155.0.8059.79 / Python 3.12 + Playwright（環境既存）。
リポジトリルートから：

```bash
npm test
npm run check
python3 -m http.server 18080 --bind 127.0.0.1
# 別ターミナル（上のサーバー起動後）
python3 reports/combat-fx-bgm/browser-regression.py
python3 reports/combat-fx-bgm/browser.py
# 自作SEを再生成する場合のみ（Python標準ライブラリとffmpeg）
python3 scripts/generate-combat-sfx.py
```

- `browser-regression.py`：既存UI回帰を今回の320/360/390/430/768/1366pxへ適用。243確認。
- `browser.py`：交換/端選択/二重使用/残光と入力/設定保存/終了と再戦/敵味方38スキル状態一致/音声デコード/局所性能。145確認。
- ブラウザは音声ミュートで実行。実試聴ではない。
- 一部の画面状態/MP/HPは境界確認のためテストから設定する。通常のルールや抽選コードは変更しない。
- 画面遷移・音声停止で生じた `net::ERR_ABORTED` は記録し、HTTPエラー/その他の失敗と区別する。
- `performance.json` は標準FXを100回生成するDOM処理時間。GPU描画/総フレーム時間/AI判断時間/スマホ性能を示すものではない。
- `preservation-results.json`：作業前の未追跡3057ファイルとゲームコア6ファイルをSHA-256比較。元の詳細一覧はコミット対象外の作業用ファイル。

## 未完了

新規BGM4曲の権利確認と取得。配布元OpenGameArt/freepd/incompetechはプロキシCONNECT 403、HTTP本文を取得できなかった。GitHubミラーのメタ情報だけでは採用しない。現在の5枠は**実際に異なる5曲ではない**。標準曲のフォールバックは意図した暫定挙動。

iOS Safari/Android実機、実スピーカーでの聴感、ループ継ぎ目、曲調の一致、低性能GPUでのフレームレートは未検証。
