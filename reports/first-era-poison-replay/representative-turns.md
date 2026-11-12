# 実戦ログのターン別抜粋

人工状態プローブとは別の、保存済み実戦ログからの抜粋。各行はその行動者の最後の操作直後。

## data / case-001302.json

[全行動ログ](data/logs/case-001302.json)。構成：戦意／猛進／疾走斬／牽制／手当。初手MP2、奥義MP1。

| R | 行動者 | 行動順 | 操作後HP（P/B） | ボス毒残存 |
|---|---|---|---|---|
| 1 | player | 戦意 → 牽制 → endTurn | 20/19 | 0 |
| 1 | boss | 戦意 → 牽制 → 斬撃 → endTurn | 16/19 | 0 |
| 2 | player | 猛進 → 奥義(猛進) → endTurn | 16/8 | 0 |
| 2 | boss | 斬撃 → 重斬 → endTurn | 10/8 | 0 |
| 3 | player | 手当 → 疾走斬 → 牽制 → endTurn | 12/8 | 0 |
| 3 | boss | 牽制 → 重斬 → endTurn | 8/8 | 0 |
| 4 | player | 戦意 → 猛進 | 8/0 | 0 |

## confirmation / case-c000049.json

[全行動ログ](confirmation/logs/case-c000049.json)。構成：結界／腐蝕／切り込み／堅守／斬撃。初手MP3、奥義MP1。

| R | 行動者 | 行動順 | 操作後HP（P/B） | ボス毒残存 |
|---|---|---|---|---|
| 1 | player | 堅守 → 奥義(堅守) → endTurn | 20/20 | 0 |
| 1 | boss | 戦意 → 牽制 → 斬撃 → endTurn | 19/20 | 0 |
| 2 | player | 切り込み → 腐蝕 → 斬撃 → endTurn | 19/17 | 2 |
| 2 | boss | 斬撃 → 重斬 → endTurn | 13/15 | 1 |
| 3 | player | 堅守 → 結界 → endTurn | 13/15 | 1 |
| 3 | boss | 牽制 → 重斬 → endTurn | 11/13 | 0 |
| 4 | player | 切り込み → 腐蝕 → 斬撃 → endTurn | 11/10 | 2 |
| 4 | boss | 戦意 → 重斬 → endTurn | 4/8 | 1 |
| 5 | player | 結界 → 堅守 → endTurn | 4/8 | 1 |
| 5 | boss | 斬撃 → 重斬 → endTurn | 1/6 | 0 |
| 6 | player | 腐蝕 → 切り込み | 1/0 | 2 |

## validation / case-v000385.json

[全行動ログ](validation/logs/case-v000385.json)。構成：結界／腐蝕／切り込み／堅守／毒刃（新版候補）。初手MP3、奥義MP1。

| R | 行動者 | 行動順 | 操作後HP（P/B） | ボス毒残存 |
|---|---|---|---|---|
| 1 | player | 堅守 → 奥義(堅守) → endTurn | 20/20 | 0 |
| 1 | boss | 戦意 → 牽制 → 斬撃 → endTurn | 19/20 | 0 |
| 2 | player | 腐蝕 → 毒刃（新版候補） → 切り込み → endTurn | 19/17 | 2 |
| 2 | boss | 斬撃 → 重斬 → endTurn | 13/15 | 1 |
| 3 | player | 堅守 → 結界 → endTurn | 13/15 | 1 |
| 3 | boss | 牽制 → 重斬 → endTurn | 11/13 | 0 |
| 4 | player | 腐蝕 → 毒刃（新版候補） → 切り込み → endTurn | 11/10 | 2 |
| 4 | boss | 戦意 → 重斬 → endTurn | 4/8 | 1 |
| 5 | player | 結界 → 堅守 → endTurn | 4/8 | 1 |
| 5 | boss | 斬撃 → 重斬 → endTurn | 1/6 | 0 |
| 6 | player | 腐蝕 → 切り込み | 1/0 | 2 |
