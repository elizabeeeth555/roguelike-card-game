# FX Lab 実装・検証資料

操作説明は [dev/README.md](../../dev/README.md)。本体入口は `dev/fx-lab.html`。

## 本体起動

リポジトリルートから：

```bash
python -m http.server 8000 --bind 127.0.0.1
```

http://localhost:8000/dev/fx-lab.html

## 回帰試験

```bash
npm test
npm run check
python reports/fx-lab/browser.py http://localhost:8000/dev/fx-lab.html
```

ブラウザ試験だけはPythonのPlaywright/Pillow、Chromium `/usr/bin/chromium`、ffmpegが必要です（今回のLinux環境には既存）。
**FX Labそのものにはこれらの追加依存は不要**で、Python標準のHTTPサーバーとChrome/Edgeだけで利用できます。
Windowsで自動試験を実行する場合は、試験コードのChromium実行パスを環境に合わせてください。

試験コードは一時フォルダーに単純な透過PNG/APNG/WebP/シート/WAV/OGGを自作し、既存公開MP3と合わせて読み込みます。
有料素材は一切使いません。生成画像・音声・JSONのダウンロードは一時フォルダーに留め、コミットしません。
スクリーンショットは既存公開キャラクター/背景とテスト用図形だけです。

- `browser-results.json`：60項目の結果とHTTPリクエストのメソッド/宛先。
- `tests.log` / `check.log` / `browser.log`：実行結果。
- `preservation.json`：元の追跡/未追跡ファイル3425件をハッシュ確認。想定外の変更なし。
- `screenshots/`：PC、アニメ画像、シート、プレイヤー命中、JSON再選択、ネイティブ制約。

Linux Chromium headlessのテストは音声出力をミュートします。デコード・予約・再生開始・停止・Gain操作を確認しますが、実試聴/音質評価ではありません。
Windows実機・Edge実機、購入素材による確認、長時間/大容量素材のGPU・メモリ計測は未実施です。
