# 第一紀・基本戦闘バランス簡易検証

2026-11-13（日本時間）。基点main：`4a1b96b7fea8fd9e51c43d7c49126fa1e81b327d`。研究のみ。正式仕様ではない。

## 結論

- **問題なし（確認範囲）**：初手/3R以内の決着、即時生存不能、明白な無限・過剰火力コンボは今回の12ケースでは観測せず。毒は単体テストで上限8・tick上限6・ダメージ後減算を確認。全ケースの合法性をログ再生で検証。
- **要調整（候補）**：12ケース中2勝、残りは英雄敗北。勝利も残HP4／1と余裕が少ない。毒＋攻撃3編成もこのAIでは勝利できず、難易度は再確認が必要。これを直ちに数値変更の決定や、人間の生存不能の証明とはしない。
- **未確認**：人間の実プレイ、全編成・全手順、他シード、最適な奥義/加速、AIが見逃す勝ち筋、高蓄積毒の実戦成立。大量試行・AI最適化・未実装機能の新規実装は行わない。

## 暫定条件と範囲

英雄HP34／王HP40（最大HPも同値）、双方初手MP3/上限3、プレイヤー先攻。以降は上限まで補充、加速MP2で次自ターンから上限+1・最大5。老王のMP優遇はなし（通常の合法な加速は両者に許可）。

毒は付与加算・上限8、対象ターン終了時にmin(N,6)ダメージ→N−1、バリア・構え倍率・崩しの対象外。腐蝕+2、毒突きはHP通過時のみ+1・MP1/CD1。再演はMP1・戦闘1回、同自ターンの最後の通常スキルを現在状態で再演し、元MP/CD追加なし・元条件再チェックなし・次ターン持越しなし。

不退75%軽減・崩し4・断誓1.5倍・一閃5、ボス通常5スキル、CD・弱体・バリア期限・消耗12R以降は既存研究のまま。ダメージは強化/弱体→軽減前の崩し→構え倍率切捨て→バリア→HP。毒→バリア期限の順序を維持。いずれも今回正式採用ではない。

seed1のみ、各1回の12ケース。既存研究のlegacy有限探索（幅10/予算450/候補4/応答予算160）を双方に使用し、毒評価も変更せず。固定2向けの毒評価が新方式を過小評価する可能性がある。新しいAIや探索拡大は導入しない。先に選んだ編成・初手の簡易観測であり勝率推定ではない。

## Codex実行結果

HPは終戦時の英雄/王。奥義欄は再演対象@R（全てMP1）。加速は英雄の使用回数。毒最大は付与直後の王の最大残数、毒累計は実HPダメージ。

| case／分類 | 5スキル | 勝者 | 決着R | 残HP 英雄/王 | 毒最大/累計 | 奥義 | 加速 |
|---|---|---|---|---|---|---|---|
| [attack-basic](results/logs/attack-basic.json)／攻撃特化 | 斬撃／重斬／大振り／猛進／追撃 | 老王 | 6 | 0/5 | 0/0 | 猛進@1 | 0 |
| [attack-chain](results/logs/attack-chain.json)／攻撃特化 | 斬撃／疾走斬／追撃／切り込み／猛進 | 英雄 | 6 | 4/0 | 0/0 | 猛進@1 | 0 |
| [attack-buff](results/logs/attack-buff.json)／攻撃特化 | 斬撃／重斬／猛進／戦意／布石 | 老王 | 6 | 0/5 | 0/0 | 猛進@1 | 0 |
| [mixed-break](results/logs/mixed-break.json)／攻守併用 | 結界／戦意／牽制／切り込み／重斬 | 英雄 | 8 | 1/0 | 0/0 | 重斬@2 | 0 |
| [mixed-heal](results/logs/mixed-heal.json)／攻守併用 | 斬撃／重斬／結界／堅守／手当 | 老王 | 7 | 0/12 | 0/0 | 重斬@1 | 0 |
| [mixed-tempo](results/logs/mixed-tempo.json)／攻守併用 | 斬撃／重斬／結界／牽制／布石 | 老王 | 10 | 0/1 | 0/0 | 重斬@1 | 0 |
| [poison-attack](results/logs/poison-attack.json)／毒＋攻撃 | 腐蝕／毒突き／重斬／牽制／斬撃 | 老王 | 7 | 0/6 | 2/6 | 重斬@1 | 0 |
| [poison-guard](results/logs/poison-guard.json)／毒＋攻撃 | 腐蝕／結界／堅守／切り込み／斬撃 | 老王 | 9 | 0/17 | 2/11 | 堅守@1 | 0 |
| [poison-buff](results/logs/poison-buff.json)／毒＋攻撃 | 腐蝕／毒突き／重斬／結界／戦意 | 老王 | 8 | 0/6 | 0/0 | 重斬@1 | 0 |
| [opening-replay](results/logs/opening-replay.json)／奥義速攻比較 | 斬撃／重斬／大振り／猛進／追撃 | 老王 | 6 | 0/5 | 0/0 | 重斬@1 | 0 |
| [opening-heavy](results/logs/opening-heavy.json)／奥義速攻比較 | 斬撃／重斬／大振り／猛進／追撃 | 老王 | 6 | 0/6 | 0/0 | 猛進@2 | 0 |
| [opening-accelerate](results/logs/opening-accelerate.json)／奥義速攻比較 | 斬撃／重斬／大振り／猛進／追撃 | 老王 | 5 | 0/8 | 0/0 | 猛進@2 | 1 |

### 早期決着の点検

同一編成・同一seedのattack-basicと固定初手3ケースを対応比較。opening-replayは重斬→再演→終了、opening-heavyは大振り→終了、opening-accelerateは加速→斬撃→終了。その後は同じAIで継続。固定初手は選択可能な操作でありルール差ではない。

- opening-replay：R6、英雄敗北。通常AIのR6との差0。奥義速攻等による極端な早期勝利は確認できない。
- opening-heavy：R6、英雄敗北。通常AIのR6との差0。奥義速攻等による極端な早期勝利は確認できない。
- opening-accelerate：R5、英雄敗北。通常AIのR6との差-1。短縮は王による撃破が早まったもので、英雄の早期勝利ではない。

今回は英雄勝利の最短R6、全決着R5〜10。全試行を「奥義あり」で行っており、奥義なしとの因果比較は未実施。12戦の最大毒残数は2で、上限8やtick6に届く蓄積コンボは実戦未確認。毒を持つpoison-buffも実際の付与0であり、毒型が成立した証拠とは扱わない。

## 再現・保護

既存first-era-poison-stackingのengine/planner/simulatorを研究内へコピーして再利用。planner/simulatorは元ファイルと同一。engineはHP/初手MP/研究識別子/毒付与上限、poison-rulesは今回式のみを切替。戦闘処理の全面改修・本編への組込みはなし。指定外のスキル数値を試験に持ち込まないため、新版毒刃・解放・新機能は使用しない。

リポジトリルートから（Node.js標準ライブラリのみ）：

```bash
node --test research/first-era-baseline-check/baseline.test.cjs
node research/first-era-baseline-check/run.cjs /tmp/baseline-check-new
node research/first-era-baseline-check/report.cjs /tmp/baseline-check-new /tmp/baseline-REPORT.md
node research/first-era-baseline-check/verify.cjs
```

run/reportは既存保存先を上書きしない。conditions.jsonに全構成・初手・seed・条件、battles.jsonlに指標、logsに行動順・イベント・HP/MP/CD/状態を保存。verifyは保存12件だけの再計算・全ログ再生、元main全追跡ファイルの不変性・ハッシュを確認しaudit.jsonを更新する。再計算は検証であり統計試行の追加ではない。別保存先はverifyの第1引数へ指定する。

本編・旧公開版・React・工房・仕様正本・前回研究には変更なし。既存未コミット成果・FX Lab PR #1は保護。実機・ブラウザ・人間による評価は未実施。テスト結果はresults/verification.json、最終ソース/データのSHAはresults/audit.jsonを参照。
