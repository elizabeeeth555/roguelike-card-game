# 第一紀・毒蓄積方式の独立研究

仮の毒4方式を比較する。確定仕様・本編・工房・旧17,903戦は変更しない。結果は[レポート](../../reports/first-era-poison-stacking/REPORT.md)。第一紀10種を決定するものではない。

## 再現

Node.js標準ライブラリのみ。リポジトリルートで実行する。既存保存先の上書きは拒否するので、再現時は未使用の出力先を引数に指定する。

```bash
node --test research/first-era-poison-stacking/*.test.cjs
node research/first-era-poison-stacking/run.cjs /tmp/stacking-reproduction
node research/first-era-poison-stacking/openings.cjs /tmp/stacking-reproduction
node research/first-era-poison-stacking/extract.cjs /tmp/stacking-reproduction
node research/first-era-poison-stacking/report.cjs /tmp/stacking-reproduction
node research/first-era-poison-stacking/audit.cjs /tmp/stacking-reproduction /tmp/stacking-audit-new.json
```

reportはverification/auditへのリンクを作るが、それらの成功を判定しない。再現先でテスト結果を保存し、auditを実行した後に参照する。監査は保存先へ書き込まず、指定した新規JSONへ出力する。aiMs以外の全シミュレーション結果、保存集計、代表ログを再計算し、旧研究の保存CSVと照合可能なA/legacy条件も比較する。ソースと保護対象が監査中に変われば失敗する。元データは基点mainのGit blobと照合する。Git履歴があるcheckoutで実行する。

## 責務と変更点

- engine/planner/simulator/replayは前回研究のコピーを新領域へ配置した。差分は毒式、表示用の研究識別子、選択可能なプレイヤー毒評価項、計測・初手固定に限定。旧ファイルを直接改変しない。
- poison-rules：A固定2/B固定3/C上限4/D上限6。n>0のとき減算前nで計算、その後n−1。付与加算・持続上限なし。バリア無視。単体テストあり。
- conditions：代表12編成、seed1〜24、MP2/3・奥義MP1、前回比較済みの毒刃設定、3探索条件を固定する。
- run：少数の初動確認→対応する全代表の主比較→限定感度試験→合法な固定初手。出力stageを混ぜずに集計。
- openings：毒系4編成の初手全合法行動列を列挙し、その後matched/deepで継続。全戦闘の全探索や最適性証明ではない。
- extract/report：実戦ログ・理論値・読みやすい行動表と比較表。
- audit：再シミュレーション、全行・全ログ・集計・旧保存値・保護SHAを確認。

本番Data/Effects/Math/Core、前回研究のaggregate・CSV読取ヘルパーを読み取り専用で再利用する。別の未追跡研究へ依存しない。実際のボスAIは全条件で前回legacyの既定値。プレイヤー探索の仮想応答評価が変わることと、ボスの実行方策の変更を区別する。

## 条件・指標

BattleDesignやReact画面へ接続しない。すべて研究専用。毒突き、毒刃、解放、奥義、構えの前回仮定はレポートとmanifestを参照する。新しいスキルID・数値の正式採用は行わない。

`battles.jsonl`は1試行1行、`manifest.json`は構成・AI・seed・条件・段階、`summary.json`は段階別集計。opening-searchは568件の局面限定試行を分離。logs/opening-logs/pattern-logsは各行動後の両HP/MP/CD/毒/バリア/構え/奥義状態、eventsと合法な入力を保存。`node research/first-era-poison-stacking/replay.cjs <ログJSON>`で読める。

追加指標：poisonApplicationsは実際に成功した通常・奥義の付与イベント数（付与ターン量poisonAppliedとは別）、failedThrustsは通常毒突きが付与しなかった回数、poisonTicksは実HPダメージと減算後残数・発生R、unusedPoisonは終戦時の王の残数。残存数は実現不能になった将来ダメージの理論値とは同義でない。maxPoisonは付与後最大残数。実HPダメージは残HPで打切り。halfTurnsは実際の最終手番から数える行動フェーズ数。勝敗Rと区別し集計の勝率に使わない。旧565件の診断差異は書き換えない。

legacyの毒評価を保持した比較と、matched（最大6tickの各式の合計÷2を既存毒係数へ接続）、deep（評価変更＋探索拡大）を分ける。Aでmatched毒項はlegacyと等価。毒主軸の便宜分類は実毒継続ダメージが与HPダメージの50%以上。スキル採用だけで分類しない。勝率は同点方策seedの記述統計で、独立した遭遇・人間の勝率・数学的最適性ではない。

## 保護と追跡

監査のsourceSHA256が最終研究ファイル、protectedSHA256が元研究・全保存データ・戦闘コア、inputSHA256が今回の保存データを識別する。provenanceは監査JSONのSHAと基点を記録する。監査自身を含むcommit SHAの循環は作らず、Gitで確認する。旧halfTurns565件は過去監査に残る。今回のA一致は実行コードとの一致と既存保存値との一致（既知診断差を別記）を分ける。

実機の面白さ・ブラウザ描画・本番切替は今回対象外。採用候補はレビューと人間の試遊を経て別途決定する。

## 代表ログの分類とレビュー修正

代表抽出と毒主軸の定義は`representatives.cjs`で共有する。総与HPダメージが正で、毒継続ダメージが50%以上の勝利をpoison-winとする（6/20は該当しない、10/20は該当）。hybrid-winは毒主軸以外で毒と直接攻撃が寄与する勝利。先頭の該当main行を採用し、他stageを混ぜない。レポートの毒勝利の編成・数値・再演対象は実際の参照ログと行から生成する。

レビューHEAD `ce27009`の誤抽出をcase 002953（blade_defense/deep/B）へ修正。試行JSONL・manifest・summary・理論値、戦闘実行コード・探索条件は変更しない。元のログはGit履歴で確認できる。監査はこの不変性と全代表のcase/category対応、文書の再生成一致を検証する。監査入力ハッシュは循環を避けるためaudit/provenance自身を除外し、verificationを含む。provenanceは監査JSONのSHAを記録する。
