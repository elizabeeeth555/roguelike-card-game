# 再現手順

リポジトリルートで起動：

```bash
python -m http.server 18088 --bind 127.0.0.1
npm test
npm run check
python reports/combat-tempo-2026-11-08/browser.py http://127.0.0.1:18088/
```

ブラウザ試験は環境既存のPython Playwrightと `/usr/bin/chromium` を使用する。
通常/高速、3サイズ、勝利/敗北、敵AIの行動順、宣言・敵待機の実時間を確認する。
検証用にデッキ/HP等を設定する局面を含む。戦闘ルール・AIコードは変更しない。

公開版確認は同スクリプトのURLを公開URLへ変更する。環境内のChromiumのプロキシCA信頼制約のため、HTTPS時はTLS検証を有効にしたurllibで公開レスポンスを中継する。TLS検証は無効にしない。
公開版の検証結果・スクリーンショットはリポジトリを変更せず `/tmp/tempo-pages-verification/` に出力する。

実スマホ/iOS Safari/Edge実機、音質の聴感、長時間のGPU負荷は未検証。
