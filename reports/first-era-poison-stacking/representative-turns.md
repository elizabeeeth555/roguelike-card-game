# 代表・固定初手ログの行動別表示

HP/MP/毒は各行動後。毒ダメージと一閃はeventsから記載。全JSONにCD・バリア・状態・構え・合法な行動列を保存。下記は実戦reducerの再生であり、人間の試遊ではない。

## logs/hybrid-win-A.json

[完全ログ](logs/hybrid-win-A.json)：case 000248、player、R4、毒実ダメージ2。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:charge | 20/0 | 19/3 | 0 | steadfast/4 |  |
| 1 | player:endTurn | 20/0 | 19/3 | 0 | rupture/4 | 一閃阻止 |
| 1 | boss:battle_spirit | 20/0 | 19/2 | 0 | rupture/4 |  |
| 1 | boss:slash | 15/0 | 19/1 | 0 | rupture/4 |  |
| 1 | boss:feint | 14/0 | 19/0 | 0 | rupture/4 |  |
| 1 | boss:endTurn | 14/3 | 19/0 | 0 | rupture/4 |  |
| 2 | player:dash_slash | 14/2 | 18/0 | 0 | rupture/4 |  |
| 2 | player:follow_up | 14/1 | 14/0 | 0 | rupture/4 |  |
| 2 | player:ultimate | 14/0 | 10/0 | 0 | rupture/4 |  |
| 2 | player:endTurn | 14/0 | 10/3 | 0 | steadfast/0 |  |
| 2 | boss:slash | 12/0 | 10/2 | 0 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 10/0 | 0 | steadfast/0 |  |
| 2 | boss:endTurn | 8/3 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 8/2 | 10/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:heavy_slash | 8/0 | 9/0 | 2 | steadfast/4 |  |
| 3 | player:endTurn | 8/0 | 9/3 | 2 | rupture/4 | 一閃阻止 |
| 3 | boss:heavy_slash | 4/0 | 9/1 | 2 | rupture/4 |  |
| 3 | boss:slash | 2/0 | 9/0 | 2 | rupture/4 |  |
| 3 | boss:endTurn | 2/3 | 7/0 | 1 | rupture/4 | 毒2 |
| 4 | player:dash_slash | 2/2 | 3/0 | 1 | rupture/4 |  |
| 4 | player:heavy_slash | 2/0 | 0/0 | 1 | rupture/4 |  |

## logs/hybrid-win-B.json

[完全ログ](logs/hybrid-win-B.json)：case 000272、player、R4、毒実ダメージ3。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:charge | 20/0 | 19/3 | 0 | steadfast/4 |  |
| 1 | player:endTurn | 20/0 | 19/3 | 0 | rupture/4 | 一閃阻止 |
| 1 | boss:battle_spirit | 20/0 | 19/2 | 0 | rupture/4 |  |
| 1 | boss:slash | 15/0 | 19/1 | 0 | rupture/4 |  |
| 1 | boss:feint | 14/0 | 19/0 | 0 | rupture/4 |  |
| 1 | boss:endTurn | 14/3 | 19/0 | 0 | rupture/4 |  |
| 2 | player:dash_slash | 14/2 | 18/0 | 0 | rupture/4 |  |
| 2 | player:follow_up | 14/1 | 14/0 | 0 | rupture/4 |  |
| 2 | player:ultimate | 14/0 | 10/0 | 0 | rupture/4 |  |
| 2 | player:endTurn | 14/0 | 10/3 | 0 | steadfast/0 |  |
| 2 | boss:slash | 12/0 | 10/2 | 0 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 10/0 | 0 | steadfast/0 |  |
| 2 | boss:endTurn | 8/3 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 8/2 | 10/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:heavy_slash | 8/0 | 9/0 | 2 | steadfast/4 |  |
| 3 | player:endTurn | 8/0 | 9/3 | 2 | rupture/4 | 一閃阻止 |
| 3 | boss:heavy_slash | 4/0 | 9/1 | 2 | rupture/4 |  |
| 3 | boss:slash | 2/0 | 9/0 | 2 | rupture/4 |  |
| 3 | boss:endTurn | 2/3 | 6/0 | 1 | rupture/4 | 毒3 |
| 4 | player:heavy_slash | 2/1 | 0/0 | 1 | rupture/4 |  |

## logs/hybrid-win-C.json

[完全ログ](logs/hybrid-win-C.json)：case 000296、player、R4、毒実ダメージ2。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:charge | 20/0 | 19/3 | 0 | steadfast/4 |  |
| 1 | player:endTurn | 20/0 | 19/3 | 0 | rupture/4 | 一閃阻止 |
| 1 | boss:battle_spirit | 20/0 | 19/2 | 0 | rupture/4 |  |
| 1 | boss:slash | 15/0 | 19/1 | 0 | rupture/4 |  |
| 1 | boss:feint | 14/0 | 19/0 | 0 | rupture/4 |  |
| 1 | boss:endTurn | 14/3 | 19/0 | 0 | rupture/4 |  |
| 2 | player:dash_slash | 14/2 | 18/0 | 0 | rupture/4 |  |
| 2 | player:follow_up | 14/1 | 14/0 | 0 | rupture/4 |  |
| 2 | player:ultimate | 14/0 | 10/0 | 0 | rupture/4 |  |
| 2 | player:endTurn | 14/0 | 10/3 | 0 | steadfast/0 |  |
| 2 | boss:slash | 12/0 | 10/2 | 0 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 10/0 | 0 | steadfast/0 |  |
| 2 | boss:endTurn | 8/3 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 8/2 | 10/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:heavy_slash | 8/0 | 9/0 | 2 | steadfast/4 |  |
| 3 | player:endTurn | 8/0 | 9/3 | 2 | rupture/4 | 一閃阻止 |
| 3 | boss:heavy_slash | 4/0 | 9/1 | 2 | rupture/4 |  |
| 3 | boss:slash | 2/0 | 9/0 | 2 | rupture/4 |  |
| 3 | boss:endTurn | 2/3 | 7/0 | 1 | rupture/4 | 毒2 |
| 4 | player:dash_slash | 2/2 | 3/0 | 1 | rupture/4 |  |
| 4 | player:heavy_slash | 2/0 | 0/0 | 1 | rupture/4 |  |

## logs/hybrid-win-D.json

[完全ログ](logs/hybrid-win-D.json)：case 000320、player、R4、毒実ダメージ2。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:charge | 20/0 | 19/3 | 0 | steadfast/4 |  |
| 1 | player:endTurn | 20/0 | 19/3 | 0 | rupture/4 | 一閃阻止 |
| 1 | boss:battle_spirit | 20/0 | 19/2 | 0 | rupture/4 |  |
| 1 | boss:slash | 15/0 | 19/1 | 0 | rupture/4 |  |
| 1 | boss:feint | 14/0 | 19/0 | 0 | rupture/4 |  |
| 1 | boss:endTurn | 14/3 | 19/0 | 0 | rupture/4 |  |
| 2 | player:dash_slash | 14/2 | 18/0 | 0 | rupture/4 |  |
| 2 | player:follow_up | 14/1 | 14/0 | 0 | rupture/4 |  |
| 2 | player:ultimate | 14/0 | 10/0 | 0 | rupture/4 |  |
| 2 | player:endTurn | 14/0 | 10/3 | 0 | steadfast/0 |  |
| 2 | boss:slash | 12/0 | 10/2 | 0 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 10/0 | 0 | steadfast/0 |  |
| 2 | boss:endTurn | 8/3 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 8/2 | 10/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:heavy_slash | 8/0 | 9/0 | 2 | steadfast/4 |  |
| 3 | player:endTurn | 8/0 | 9/3 | 2 | rupture/4 | 一閃阻止 |
| 3 | boss:heavy_slash | 4/0 | 9/1 | 2 | rupture/4 |  |
| 3 | boss:slash | 2/0 | 9/0 | 2 | rupture/4 |  |
| 3 | boss:endTurn | 2/3 | 7/0 | 1 | rupture/4 | 毒2 |
| 4 | player:dash_slash | 2/2 | 3/0 | 1 | rupture/4 |  |
| 4 | player:heavy_slash | 2/0 | 0/0 | 1 | rupture/4 |  |

## logs/poison-loss-A.json

[完全ログ](logs/poison-loss-A.json)：case 000337、boss、R4、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:barrier | 20/1 | 20/3 | 0 | steadfast/0 |  |
| 1 | player:corrosion | 20/0 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:feint | 14/0 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:slash | 12/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 12/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:slash | 12/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:finisher_slash | 12/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 12/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 12/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:slash | 10/0 | 12/2 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 6/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:barrier | 6/0 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:endTurn | 6/0 | 10/3 | 0 | rupture/0 | 一閃発動 |
| 3 | boss:feint | 6/0 | 10/2 | 0 | rupture/0 |  |
| 3 | boss:heavy_slash | 4/0 | 10/0 | 0 | rupture/0 |  |
| 3 | boss:endTurn | 4/3 | 10/0 | 0 | rupture/0 |  |
| 4 | player:finisher_slash | 4/2 | 7/0 | 0 | rupture/0 |  |
| 4 | player:corrosion | 4/1 | 7/0 | 2 | rupture/0 | 付与2 |
| 4 | player:slash | 4/0 | 4/0 | 2 | rupture/0 |  |
| 4 | player:endTurn | 4/0 | 4/3 | 2 | steadfast/0 |  |
| 4 | boss:great_swing | 0/0 | 4/0 | 2 | steadfast/0 |  |

## logs/poison-loss-B.json

[完全ログ](logs/poison-loss-B.json)：case 000361、boss、R4、毒実ダメージ6。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:barrier | 20/1 | 20/3 | 0 | steadfast/0 |  |
| 1 | player:corrosion | 20/0 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:feint | 14/0 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:slash | 12/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 12/3 | 17/0 | 1 | rupture/0 | 毒3 |
| 2 | player:slash | 12/2 | 17/0 | 1 | rupture/0 |  |
| 2 | player:finisher_slash | 12/1 | 14/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 12/0 | 11/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 12/0 | 11/3 | 1 | steadfast/0 |  |
| 2 | boss:slash | 10/0 | 11/2 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 6/0 | 11/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 8/0 | 0 | steadfast/0 | 毒3 |
| 3 | player:fortress | 6/1 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:barrier | 6/0 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:endTurn | 6/0 | 8/3 | 0 | rupture/0 | 一閃発動 |
| 3 | boss:feint | 6/0 | 8/2 | 0 | rupture/0 |  |
| 3 | boss:heavy_slash | 4/0 | 8/0 | 0 | rupture/0 |  |
| 3 | boss:endTurn | 4/3 | 8/0 | 0 | rupture/0 |  |
| 4 | player:finisher_slash | 4/2 | 5/0 | 0 | rupture/0 |  |
| 4 | player:corrosion | 4/1 | 5/0 | 2 | rupture/0 | 付与2 |
| 4 | player:slash | 4/0 | 2/0 | 2 | rupture/0 |  |
| 4 | player:endTurn | 4/0 | 2/3 | 2 | steadfast/0 |  |
| 4 | boss:great_swing | 0/0 | 2/0 | 2 | steadfast/0 |  |

## logs/poison-loss-C.json

[完全ログ](logs/poison-loss-C.json)：case 000385、boss、R4、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:barrier | 20/1 | 20/3 | 0 | steadfast/0 |  |
| 1 | player:corrosion | 20/0 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:feint | 14/0 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:slash | 12/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 12/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:slash | 12/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:finisher_slash | 12/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 12/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 12/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:slash | 10/0 | 12/2 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 6/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:barrier | 6/0 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:endTurn | 6/0 | 10/3 | 0 | rupture/0 | 一閃発動 |
| 3 | boss:feint | 6/0 | 10/2 | 0 | rupture/0 |  |
| 3 | boss:heavy_slash | 4/0 | 10/0 | 0 | rupture/0 |  |
| 3 | boss:endTurn | 4/3 | 10/0 | 0 | rupture/0 |  |
| 4 | player:finisher_slash | 4/2 | 7/0 | 0 | rupture/0 |  |
| 4 | player:corrosion | 4/1 | 7/0 | 2 | rupture/0 | 付与2 |
| 4 | player:slash | 4/0 | 4/0 | 2 | rupture/0 |  |
| 4 | player:endTurn | 4/0 | 4/3 | 2 | steadfast/0 |  |
| 4 | boss:great_swing | 0/0 | 4/0 | 2 | steadfast/0 |  |

## logs/poison-loss-D.json

[完全ログ](logs/poison-loss-D.json)：case 000409、boss、R4、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:barrier | 20/1 | 20/3 | 0 | steadfast/0 |  |
| 1 | player:corrosion | 20/0 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:feint | 14/0 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:slash | 12/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 12/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:slash | 12/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:finisher_slash | 12/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 12/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 12/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:slash | 10/0 | 12/2 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 6/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:barrier | 6/0 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:endTurn | 6/0 | 10/3 | 0 | rupture/0 | 一閃発動 |
| 3 | boss:feint | 6/0 | 10/2 | 0 | rupture/0 |  |
| 3 | boss:heavy_slash | 4/0 | 10/0 | 0 | rupture/0 |  |
| 3 | boss:endTurn | 4/3 | 10/0 | 0 | rupture/0 |  |
| 4 | player:finisher_slash | 4/2 | 7/0 | 0 | rupture/0 |  |
| 4 | player:corrosion | 4/1 | 7/0 | 2 | rupture/0 | 付与2 |
| 4 | player:slash | 4/0 | 4/0 | 2 | rupture/0 |  |
| 4 | player:endTurn | 4/0 | 4/3 | 2 | steadfast/0 |  |
| 4 | boss:great_swing | 0/0 | 4/0 | 2 | steadfast/0 |  |

## logs/poison-win-B.json

[完全ログ](logs/poison-win-B.json)：case 002953、player、R4、毒実ダメージ11。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:barrier | 20/0 | 20/3 | 2 | steadfast/0 |  |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:heavy_slash | 11/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 11/3 | 17/0 | 1 | rupture/0 | 毒3 |
| 2 | player:finisher_slash | 11/2 | 14/0 | 1 | rupture/0 |  |
| 2 | player:fortress | 11/0 | 14/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 11/0 | 14/3 | 1 | steadfast/0 |  |
| 2 | boss:slash | 11/0 | 14/2 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 10/0 | 14/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 10/3 | 11/0 | 0 | steadfast/0 | 毒3 |
| 3 | player:corrosion | 10/2 | 11/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:barrier | 10/1 | 11/0 | 2 | steadfast/0 |  |
| 3 | player:ultimate | 10/0 | 11/0 | 2 | steadfast/0 |  |
| 3 | player:endTurn | 10/0 | 11/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:great_swing | 5/0 | 11/0 | 2 | rupture/0 |  |
| 3 | boss:endTurn | 5/3 | 8/0 | 1 | rupture/0 | 毒3 |
| 4 | player:fortress | 5/1 | 8/0 | 1 | rupture/0 |  |
| 4 | player:finisher_slash | 5/0 | 2/0 | 1 | rupture/0 |  |
| 4 | player:endTurn | 5/0 | 2/3 | 1 | steadfast/0 |  |
| 4 | boss:endTurn | 5/0 | 0/3 | 0 | steadfast/0 | 毒2 |

## logs/pure-attack-A.json

[完全ログ](logs/pure-attack-A.json)：case 000145、player、R4、毒実ダメージ0。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:heavy_slash | 20/0 | 19/3 | 0 | steadfast/4 |  |
| 1 | player:endTurn | 20/0 | 19/3 | 0 | rupture/4 | 一閃阻止 |
| 1 | boss:battle_spirit | 20/0 | 19/2 | 0 | rupture/4 |  |
| 1 | boss:feint | 16/0 | 19/1 | 0 | rupture/4 |  |
| 1 | boss:slash | 14/0 | 19/0 | 0 | rupture/4 |  |
| 1 | boss:endTurn | 14/3 | 19/0 | 0 | rupture/4 |  |
| 2 | player:charge | 14/1 | 15/0 | 0 | rupture/4 |  |
| 2 | player:ultimate | 14/0 | 8/0 | 0 | rupture/4 |  |
| 2 | player:endTurn | 14/0 | 8/3 | 0 | steadfast/0 |  |
| 2 | boss:slash | 12/0 | 8/2 | 0 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 8/0 | 0 | steadfast/0 |  |
| 2 | boss:endTurn | 8/3 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:heavy_slash | 8/1 | 7/0 | 0 | steadfast/4 |  |
| 3 | player:follow_up | 8/0 | 4/0 | 0 | steadfast/4 |  |
| 3 | player:endTurn | 8/0 | 4/3 | 0 | rupture/4 | 一閃阻止 |
| 3 | boss:great_swing | 2/0 | 4/0 | 0 | rupture/4 |  |
| 3 | boss:endTurn | 2/3 | 4/0 | 0 | rupture/4 |  |
| 4 | player:dash_slash | 2/2 | 0/0 | 0 | rupture/4 |  |

## logs/pure-attack-B.json

[完全ログ](logs/pure-attack-B.json)：case 000169、player、R4、毒実ダメージ0。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:heavy_slash | 20/0 | 19/3 | 0 | steadfast/4 |  |
| 1 | player:endTurn | 20/0 | 19/3 | 0 | rupture/4 | 一閃阻止 |
| 1 | boss:battle_spirit | 20/0 | 19/2 | 0 | rupture/4 |  |
| 1 | boss:feint | 16/0 | 19/1 | 0 | rupture/4 |  |
| 1 | boss:slash | 14/0 | 19/0 | 0 | rupture/4 |  |
| 1 | boss:endTurn | 14/3 | 19/0 | 0 | rupture/4 |  |
| 2 | player:charge | 14/1 | 15/0 | 0 | rupture/4 |  |
| 2 | player:ultimate | 14/0 | 8/0 | 0 | rupture/4 |  |
| 2 | player:endTurn | 14/0 | 8/3 | 0 | steadfast/0 |  |
| 2 | boss:slash | 12/0 | 8/2 | 0 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 8/0 | 0 | steadfast/0 |  |
| 2 | boss:endTurn | 8/3 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:heavy_slash | 8/1 | 7/0 | 0 | steadfast/4 |  |
| 3 | player:follow_up | 8/0 | 4/0 | 0 | steadfast/4 |  |
| 3 | player:endTurn | 8/0 | 4/3 | 0 | rupture/4 | 一閃阻止 |
| 3 | boss:great_swing | 2/0 | 4/0 | 0 | rupture/4 |  |
| 3 | boss:endTurn | 2/3 | 4/0 | 0 | rupture/4 |  |
| 4 | player:dash_slash | 2/2 | 0/0 | 0 | rupture/4 |  |

## logs/pure-attack-C.json

[完全ログ](logs/pure-attack-C.json)：case 000193、player、R4、毒実ダメージ0。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:heavy_slash | 20/0 | 19/3 | 0 | steadfast/4 |  |
| 1 | player:endTurn | 20/0 | 19/3 | 0 | rupture/4 | 一閃阻止 |
| 1 | boss:battle_spirit | 20/0 | 19/2 | 0 | rupture/4 |  |
| 1 | boss:feint | 16/0 | 19/1 | 0 | rupture/4 |  |
| 1 | boss:slash | 14/0 | 19/0 | 0 | rupture/4 |  |
| 1 | boss:endTurn | 14/3 | 19/0 | 0 | rupture/4 |  |
| 2 | player:charge | 14/1 | 15/0 | 0 | rupture/4 |  |
| 2 | player:ultimate | 14/0 | 8/0 | 0 | rupture/4 |  |
| 2 | player:endTurn | 14/0 | 8/3 | 0 | steadfast/0 |  |
| 2 | boss:slash | 12/0 | 8/2 | 0 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 8/0 | 0 | steadfast/0 |  |
| 2 | boss:endTurn | 8/3 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:heavy_slash | 8/1 | 7/0 | 0 | steadfast/4 |  |
| 3 | player:follow_up | 8/0 | 4/0 | 0 | steadfast/4 |  |
| 3 | player:endTurn | 8/0 | 4/3 | 0 | rupture/4 | 一閃阻止 |
| 3 | boss:great_swing | 2/0 | 4/0 | 0 | rupture/4 |  |
| 3 | boss:endTurn | 2/3 | 4/0 | 0 | rupture/4 |  |
| 4 | player:dash_slash | 2/2 | 0/0 | 0 | rupture/4 |  |

## logs/pure-attack-D.json

[完全ログ](logs/pure-attack-D.json)：case 000217、player、R4、毒実ダメージ0。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:heavy_slash | 20/0 | 19/3 | 0 | steadfast/4 |  |
| 1 | player:endTurn | 20/0 | 19/3 | 0 | rupture/4 | 一閃阻止 |
| 1 | boss:battle_spirit | 20/0 | 19/2 | 0 | rupture/4 |  |
| 1 | boss:feint | 16/0 | 19/1 | 0 | rupture/4 |  |
| 1 | boss:slash | 14/0 | 19/0 | 0 | rupture/4 |  |
| 1 | boss:endTurn | 14/3 | 19/0 | 0 | rupture/4 |  |
| 2 | player:charge | 14/1 | 15/0 | 0 | rupture/4 |  |
| 2 | player:ultimate | 14/0 | 8/0 | 0 | rupture/4 |  |
| 2 | player:endTurn | 14/0 | 8/3 | 0 | steadfast/0 |  |
| 2 | boss:slash | 12/0 | 8/2 | 0 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 8/0 | 0 | steadfast/0 |  |
| 2 | boss:endTurn | 8/3 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:heavy_slash | 8/1 | 7/0 | 0 | steadfast/4 |  |
| 3 | player:follow_up | 8/0 | 4/0 | 0 | steadfast/4 |  |
| 3 | player:endTurn | 8/0 | 4/3 | 0 | rupture/4 | 一閃阻止 |
| 3 | boss:great_swing | 2/0 | 4/0 | 0 | rupture/4 |  |
| 3 | boss:endTurn | 2/3 | 4/0 | 0 | rupture/4 |  |
| 4 | player:dash_slash | 2/2 | 0/0 | 0 | rupture/4 |  |

## opening-logs/B.json

[完全ログ](opening-logs/B.json)：case o00233、player、R4、毒実ダメージ11。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:barrier | 20/1 | 20/3 | 0 | steadfast/0 |  |
| 1 | player:corrosion | 20/0 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:heavy_slash | 11/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 11/3 | 17/0 | 1 | rupture/0 | 毒3 |
| 2 | player:finisher_slash | 11/2 | 14/0 | 1 | rupture/0 |  |
| 2 | player:fortress | 11/0 | 14/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 11/0 | 14/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 11/0 | 14/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 10/0 | 14/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 10/3 | 11/0 | 0 | steadfast/0 | 毒3 |
| 3 | player:corrosion | 10/2 | 11/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:barrier | 10/1 | 11/0 | 2 | steadfast/0 |  |
| 3 | player:ultimate | 10/0 | 11/0 | 2 | steadfast/0 |  |
| 3 | player:endTurn | 10/0 | 11/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 9/0 | 11/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 5/0 | 11/0 | 2 | rupture/0 |  |
| 3 | boss:endTurn | 5/3 | 8/0 | 1 | rupture/0 | 毒3 |
| 4 | player:finisher_slash | 5/2 | 2/0 | 1 | rupture/0 |  |
| 4 | player:fortress | 5/0 | 2/0 | 1 | rupture/0 |  |
| 4 | player:endTurn | 5/0 | 2/3 | 1 | steadfast/0 |  |
| 4 | boss:endTurn | 5/0 | 0/3 | 0 | steadfast/0 | 毒2 |

## pattern-logs/corrosion-A.json

[完全ログ](pattern-logs/corrosion-A.json)：case 003577、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 15/1 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 15/1 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:slash | 10/1 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:feint | 9/1 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:finisher_slash | 9/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:slash | 9/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 9/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 9/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 5/0 | 12/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 3/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 3/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 3/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 3/0 | 10/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 3/0 | 10/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:heavy_slash | 0/0 | 10/1 | 2 | rupture/0 |  |

## pattern-logs/corrosion-B.json

[完全ログ](pattern-logs/corrosion-B.json)：case 003578、boss、R3、毒実ダメージ6。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 15/1 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 15/1 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:slash | 10/1 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:feint | 9/1 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 9/3 | 17/0 | 1 | rupture/0 | 毒3 |
| 2 | player:finisher_slash | 9/2 | 17/0 | 1 | rupture/0 |  |
| 2 | player:slash | 9/1 | 14/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 9/0 | 11/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 9/0 | 11/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 5/0 | 11/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 3/0 | 11/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 3/3 | 8/0 | 0 | steadfast/0 | 毒3 |
| 3 | player:fortress | 3/1 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 3/0 | 8/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 3/0 | 8/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:heavy_slash | 0/0 | 8/1 | 2 | rupture/0 |  |

## pattern-logs/corrosion-C.json

[完全ログ](pattern-logs/corrosion-C.json)：case 003579、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 15/1 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 15/1 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:slash | 10/1 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:feint | 9/1 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:finisher_slash | 9/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:slash | 9/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 9/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 9/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 5/0 | 12/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 3/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 3/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 3/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 3/0 | 10/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 3/0 | 10/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:heavy_slash | 0/0 | 10/1 | 2 | rupture/0 |  |

## pattern-logs/corrosion-D.json

[完全ログ](pattern-logs/corrosion-D.json)：case 003580、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 15/1 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 15/1 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:slash | 10/1 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:feint | 9/1 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:finisher_slash | 9/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:slash | 9/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 9/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 9/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 5/0 | 12/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 3/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 3/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 3/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 3/0 | 10/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 3/0 | 10/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:heavy_slash | 0/0 | 10/1 | 2 | rupture/0 |  |

## pattern-logs/corrosion_blade-A.json

[完全ログ](pattern-logs/corrosion_blade-A.json)：case 003589、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:r_venom_blade | 20/0 | 20/3 | 2 | steadfast/2 |  |
| 1 | player:endTurn | 15/0 | 20/3 | 2 | rupture/2 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 2 | rupture/2 |  |
| 1 | boss:slash | 10/0 | 20/1 | 2 | rupture/2 |  |
| 1 | boss:feint | 9/0 | 20/0 | 2 | rupture/2 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/2 | 毒2 |
| 2 | player:barrier | 9/2 | 18/0 | 1 | rupture/2 |  |
| 2 | player:finisher_slash | 9/1 | 18/0 | 1 | rupture/2 |  |
| 2 | player:ultimate | 9/0 | 15/0 | 1 | rupture/2 |  |
| 2 | player:endTurn | 9/0 | 15/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 15/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 15/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 13/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 13/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 13/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 13/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 13/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 13/0 | 2 | rupture/0 |  |

## pattern-logs/corrosion_blade-B.json

[完全ログ](pattern-logs/corrosion_blade-B.json)：case 003590、boss、R3、毒実ダメージ6。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:r_venom_blade | 20/0 | 20/3 | 2 | steadfast/2 |  |
| 1 | player:endTurn | 15/0 | 20/3 | 2 | rupture/2 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 2 | rupture/2 |  |
| 1 | boss:slash | 10/0 | 20/1 | 2 | rupture/2 |  |
| 1 | boss:feint | 9/0 | 20/0 | 2 | rupture/2 |  |
| 1 | boss:endTurn | 9/3 | 17/0 | 1 | rupture/2 | 毒3 |
| 2 | player:barrier | 9/2 | 17/0 | 1 | rupture/2 |  |
| 2 | player:finisher_slash | 9/1 | 17/0 | 1 | rupture/2 |  |
| 2 | player:ultimate | 9/0 | 14/0 | 1 | rupture/2 |  |
| 2 | player:endTurn | 9/0 | 14/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 14/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 14/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 11/0 | 0 | steadfast/0 | 毒3 |
| 3 | player:fortress | 6/1 | 11/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 11/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 11/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 11/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 11/0 | 2 | rupture/0 |  |

## pattern-logs/corrosion_blade-C.json

[完全ログ](pattern-logs/corrosion_blade-C.json)：case 003591、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:r_venom_blade | 20/0 | 20/3 | 2 | steadfast/2 |  |
| 1 | player:endTurn | 15/0 | 20/3 | 2 | rupture/2 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 2 | rupture/2 |  |
| 1 | boss:slash | 10/0 | 20/1 | 2 | rupture/2 |  |
| 1 | boss:feint | 9/0 | 20/0 | 2 | rupture/2 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/2 | 毒2 |
| 2 | player:barrier | 9/2 | 18/0 | 1 | rupture/2 |  |
| 2 | player:finisher_slash | 9/1 | 18/0 | 1 | rupture/2 |  |
| 2 | player:ultimate | 9/0 | 15/0 | 1 | rupture/2 |  |
| 2 | player:endTurn | 9/0 | 15/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 15/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 15/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 13/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 13/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 13/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 13/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 13/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 13/0 | 2 | rupture/0 |  |

## pattern-logs/corrosion_blade-D.json

[完全ログ](pattern-logs/corrosion_blade-D.json)：case 003592、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:r_venom_blade | 20/0 | 20/3 | 2 | steadfast/2 |  |
| 1 | player:endTurn | 15/0 | 20/3 | 2 | rupture/2 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 2 | rupture/2 |  |
| 1 | boss:slash | 10/0 | 20/1 | 2 | rupture/2 |  |
| 1 | boss:feint | 9/0 | 20/0 | 2 | rupture/2 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/2 | 毒2 |
| 2 | player:barrier | 9/2 | 18/0 | 1 | rupture/2 |  |
| 2 | player:finisher_slash | 9/1 | 18/0 | 1 | rupture/2 |  |
| 2 | player:ultimate | 9/0 | 15/0 | 1 | rupture/2 |  |
| 2 | player:endTurn | 9/0 | 15/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 15/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 15/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 13/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 13/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 13/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 13/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 13/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 13/0 | 2 | rupture/0 |  |

## pattern-logs/corrosion_guard-A.json

[完全ログ](pattern-logs/corrosion_guard-A.json)：case 003593、boss、R4、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:barrier | 20/0 | 20/3 | 2 | steadfast/0 |  |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:slash | 13/0 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:feint | 12/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 12/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:finisher_slash | 12/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:slash | 12/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 12/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 12/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 12/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:barrier | 6/0 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:endTurn | 6/0 | 10/3 | 0 | rupture/0 | 一閃発動 |
| 3 | boss:feint | 6/0 | 10/2 | 0 | rupture/0 |  |
| 3 | boss:heavy_slash | 4/0 | 10/0 | 0 | rupture/0 |  |
| 3 | boss:endTurn | 4/3 | 10/0 | 0 | rupture/0 |  |
| 4 | player:corrosion | 4/2 | 10/0 | 2 | rupture/0 | 付与2 |
| 4 | player:slash | 4/1 | 10/0 | 2 | rupture/0 |  |
| 4 | player:finisher_slash | 4/0 | 4/0 | 2 | rupture/0 |  |
| 4 | player:endTurn | 4/0 | 4/3 | 2 | steadfast/0 |  |
| 4 | boss:great_swing | 0/0 | 4/0 | 2 | steadfast/0 |  |

## pattern-logs/corrosion_guard-B.json

[完全ログ](pattern-logs/corrosion_guard-B.json)：case 003594、boss、R4、毒実ダメージ6。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:barrier | 20/0 | 20/3 | 2 | steadfast/0 |  |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:slash | 13/0 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:feint | 12/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 12/3 | 17/0 | 1 | rupture/0 | 毒3 |
| 2 | player:finisher_slash | 12/2 | 17/0 | 1 | rupture/0 |  |
| 2 | player:slash | 12/1 | 14/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 12/0 | 11/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 12/0 | 11/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 11/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 11/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 8/0 | 0 | steadfast/0 | 毒3 |
| 3 | player:fortress | 6/1 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:barrier | 6/0 | 8/0 | 0 | steadfast/0 |  |
| 3 | player:endTurn | 6/0 | 8/3 | 0 | rupture/0 | 一閃発動 |
| 3 | boss:feint | 6/0 | 8/2 | 0 | rupture/0 |  |
| 3 | boss:heavy_slash | 4/0 | 8/0 | 0 | rupture/0 |  |
| 3 | boss:endTurn | 4/3 | 8/0 | 0 | rupture/0 |  |
| 4 | player:corrosion | 4/2 | 8/0 | 2 | rupture/0 | 付与2 |
| 4 | player:slash | 4/1 | 8/0 | 2 | rupture/0 |  |
| 4 | player:finisher_slash | 4/0 | 2/0 | 2 | rupture/0 |  |
| 4 | player:endTurn | 4/0 | 2/3 | 2 | steadfast/0 |  |
| 4 | boss:great_swing | 0/0 | 2/0 | 2 | steadfast/0 |  |

## pattern-logs/corrosion_guard-C.json

[完全ログ](pattern-logs/corrosion_guard-C.json)：case 003595、boss、R4、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:barrier | 20/0 | 20/3 | 2 | steadfast/0 |  |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:slash | 13/0 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:feint | 12/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 12/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:finisher_slash | 12/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:slash | 12/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 12/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 12/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 12/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:barrier | 6/0 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:endTurn | 6/0 | 10/3 | 0 | rupture/0 | 一閃発動 |
| 3 | boss:feint | 6/0 | 10/2 | 0 | rupture/0 |  |
| 3 | boss:heavy_slash | 4/0 | 10/0 | 0 | rupture/0 |  |
| 3 | boss:endTurn | 4/3 | 10/0 | 0 | rupture/0 |  |
| 4 | player:corrosion | 4/2 | 10/0 | 2 | rupture/0 | 付与2 |
| 4 | player:slash | 4/1 | 10/0 | 2 | rupture/0 |  |
| 4 | player:finisher_slash | 4/0 | 4/0 | 2 | rupture/0 |  |
| 4 | player:endTurn | 4/0 | 4/3 | 2 | steadfast/0 |  |
| 4 | boss:great_swing | 0/0 | 4/0 | 2 | steadfast/0 |  |

## pattern-logs/corrosion_guard-D.json

[完全ログ](pattern-logs/corrosion_guard-D.json)：case 003596、boss、R4、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:barrier | 20/0 | 20/3 | 2 | steadfast/0 |  |
| 1 | player:endTurn | 18/0 | 20/3 | 2 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 18/0 | 20/2 | 2 | rupture/0 |  |
| 1 | boss:slash | 13/0 | 20/1 | 2 | rupture/0 |  |
| 1 | boss:feint | 12/0 | 20/0 | 2 | rupture/0 |  |
| 1 | boss:endTurn | 12/3 | 18/0 | 1 | rupture/0 | 毒2 |
| 2 | player:finisher_slash | 12/2 | 18/0 | 1 | rupture/0 |  |
| 2 | player:slash | 12/1 | 15/0 | 1 | rupture/0 |  |
| 2 | player:ultimate | 12/0 | 12/0 | 1 | rupture/0 |  |
| 2 | player:endTurn | 12/0 | 12/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 12/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 12/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 10/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:barrier | 6/0 | 10/0 | 0 | steadfast/0 |  |
| 3 | player:endTurn | 6/0 | 10/3 | 0 | rupture/0 | 一閃発動 |
| 3 | boss:feint | 6/0 | 10/2 | 0 | rupture/0 |  |
| 3 | boss:heavy_slash | 4/0 | 10/0 | 0 | rupture/0 |  |
| 3 | boss:endTurn | 4/3 | 10/0 | 0 | rupture/0 |  |
| 4 | player:corrosion | 4/2 | 10/0 | 2 | rupture/0 | 付与2 |
| 4 | player:slash | 4/1 | 10/0 | 2 | rupture/0 |  |
| 4 | player:finisher_slash | 4/0 | 4/0 | 2 | rupture/0 |  |
| 4 | player:endTurn | 4/0 | 4/3 | 2 | steadfast/0 |  |
| 4 | boss:great_swing | 0/0 | 4/0 | 2 | steadfast/0 |  |

## pattern-logs/corrosion_replay-A.json

[完全ログ](pattern-logs/corrosion_replay-A.json)：case 003581、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:ultimate | 20/0 | 20/3 | 4 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 15/0 | 20/3 | 4 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 4 | rupture/0 |  |
| 1 | boss:slash | 10/0 | 20/1 | 4 | rupture/0 |  |
| 1 | boss:feint | 9/0 | 20/0 | 4 | rupture/0 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 3 | rupture/0 | 毒2 |
| 2 | player:barrier | 9/2 | 18/0 | 3 | rupture/0 |  |
| 2 | player:finisher_slash | 9/1 | 18/0 | 3 | rupture/0 |  |
| 2 | player:slash | 9/0 | 15/0 | 3 | rupture/0 |  |
| 2 | player:endTurn | 9/0 | 15/3 | 3 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 15/1 | 3 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 15/0 | 3 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 13/0 | 2 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 13/0 | 2 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 13/0 | 4 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 13/3 | 4 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 13/2 | 4 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 13/0 | 4 | rupture/0 |  |

## pattern-logs/corrosion_replay-B.json

[完全ログ](pattern-logs/corrosion_replay-B.json)：case 003582、boss、R3、毒実ダメージ6。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:ultimate | 20/0 | 20/3 | 4 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 15/0 | 20/3 | 4 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 4 | rupture/0 |  |
| 1 | boss:slash | 10/0 | 20/1 | 4 | rupture/0 |  |
| 1 | boss:feint | 9/0 | 20/0 | 4 | rupture/0 |  |
| 1 | boss:endTurn | 9/3 | 17/0 | 3 | rupture/0 | 毒3 |
| 2 | player:barrier | 9/2 | 17/0 | 3 | rupture/0 |  |
| 2 | player:finisher_slash | 9/1 | 17/0 | 3 | rupture/0 |  |
| 2 | player:slash | 9/0 | 14/0 | 3 | rupture/0 |  |
| 2 | player:endTurn | 9/0 | 14/3 | 3 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 14/1 | 3 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 14/0 | 3 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 11/0 | 2 | steadfast/0 | 毒3 |
| 3 | player:fortress | 6/1 | 11/0 | 2 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 11/0 | 4 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 11/3 | 4 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 11/2 | 4 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 11/0 | 4 | rupture/0 |  |

## pattern-logs/corrosion_replay-C.json

[完全ログ](pattern-logs/corrosion_replay-C.json)：case 003583、boss、R3、毒実ダメージ7。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:ultimate | 20/0 | 20/3 | 4 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 15/0 | 20/3 | 4 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 4 | rupture/0 |  |
| 1 | boss:slash | 10/0 | 20/1 | 4 | rupture/0 |  |
| 1 | boss:feint | 9/0 | 20/0 | 4 | rupture/0 |  |
| 1 | boss:endTurn | 9/3 | 16/0 | 3 | rupture/0 | 毒4 |
| 2 | player:barrier | 9/2 | 16/0 | 3 | rupture/0 |  |
| 2 | player:finisher_slash | 9/1 | 16/0 | 3 | rupture/0 |  |
| 2 | player:slash | 9/0 | 13/0 | 3 | rupture/0 |  |
| 2 | player:endTurn | 9/0 | 13/3 | 3 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 13/1 | 3 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 13/0 | 3 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 10/0 | 2 | steadfast/0 | 毒3 |
| 3 | player:fortress | 6/1 | 10/0 | 2 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 10/0 | 4 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 10/3 | 4 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 10/2 | 4 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 10/0 | 4 | rupture/0 |  |

## pattern-logs/corrosion_replay-D.json

[完全ログ](pattern-logs/corrosion_replay-D.json)：case 003584、boss、R3、毒実ダメージ7。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:ultimate | 20/0 | 20/3 | 4 | steadfast/0 | 付与2 |
| 1 | player:endTurn | 15/0 | 20/3 | 4 | rupture/0 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 4 | rupture/0 |  |
| 1 | boss:slash | 10/0 | 20/1 | 4 | rupture/0 |  |
| 1 | boss:feint | 9/0 | 20/0 | 4 | rupture/0 |  |
| 1 | boss:endTurn | 9/3 | 16/0 | 3 | rupture/0 | 毒4 |
| 2 | player:barrier | 9/2 | 16/0 | 3 | rupture/0 |  |
| 2 | player:finisher_slash | 9/1 | 16/0 | 3 | rupture/0 |  |
| 2 | player:slash | 9/0 | 13/0 | 3 | rupture/0 |  |
| 2 | player:endTurn | 9/0 | 13/3 | 3 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 13/1 | 3 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 13/0 | 3 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 10/0 | 2 | steadfast/0 | 毒3 |
| 3 | player:fortress | 6/1 | 10/0 | 2 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 10/0 | 4 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 10/3 | 4 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 10/2 | 4 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 10/0 | 4 | rupture/0 |  |

## pattern-logs/corrosion_thrust-A.json

[完全ログ](pattern-logs/corrosion_thrust-A.json)：case 003585、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:r_poison_thrust | 20/0 | 20/3 | 2 | steadfast/1 |  |
| 1 | player:endTurn | 15/0 | 20/3 | 2 | rupture/1 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 2 | rupture/1 |  |
| 1 | boss:slash | 10/0 | 20/1 | 2 | rupture/1 |  |
| 1 | boss:feint | 9/0 | 20/0 | 2 | rupture/1 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/1 | 毒2 |
| 2 | player:barrier | 9/2 | 18/0 | 1 | rupture/1 |  |
| 2 | player:slash | 9/1 | 18/0 | 1 | rupture/1 |  |
| 2 | player:ultimate | 9/0 | 15/0 | 1 | rupture/1 |  |
| 2 | player:endTurn | 9/0 | 15/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 15/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 15/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 13/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 13/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 13/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 13/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 13/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 13/0 | 2 | rupture/0 |  |

## pattern-logs/corrosion_thrust-B.json

[完全ログ](pattern-logs/corrosion_thrust-B.json)：case 003586、boss、R3、毒実ダメージ6。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:r_poison_thrust | 20/0 | 20/3 | 2 | steadfast/1 |  |
| 1 | player:endTurn | 15/0 | 20/3 | 2 | rupture/1 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 2 | rupture/1 |  |
| 1 | boss:slash | 10/0 | 20/1 | 2 | rupture/1 |  |
| 1 | boss:feint | 9/0 | 20/0 | 2 | rupture/1 |  |
| 1 | boss:endTurn | 9/3 | 17/0 | 1 | rupture/1 | 毒3 |
| 2 | player:barrier | 9/2 | 17/0 | 1 | rupture/1 |  |
| 2 | player:slash | 9/1 | 17/0 | 1 | rupture/1 |  |
| 2 | player:ultimate | 9/0 | 14/0 | 1 | rupture/1 |  |
| 2 | player:endTurn | 9/0 | 14/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 14/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 14/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 11/0 | 0 | steadfast/0 | 毒3 |
| 3 | player:fortress | 6/1 | 11/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 11/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 11/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 11/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 11/0 | 2 | rupture/0 |  |

## pattern-logs/corrosion_thrust-C.json

[完全ログ](pattern-logs/corrosion_thrust-C.json)：case 003587、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:r_poison_thrust | 20/0 | 20/3 | 2 | steadfast/1 |  |
| 1 | player:endTurn | 15/0 | 20/3 | 2 | rupture/1 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 2 | rupture/1 |  |
| 1 | boss:slash | 10/0 | 20/1 | 2 | rupture/1 |  |
| 1 | boss:feint | 9/0 | 20/0 | 2 | rupture/1 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/1 | 毒2 |
| 2 | player:barrier | 9/2 | 18/0 | 1 | rupture/1 |  |
| 2 | player:slash | 9/1 | 18/0 | 1 | rupture/1 |  |
| 2 | player:ultimate | 9/0 | 15/0 | 1 | rupture/1 |  |
| 2 | player:endTurn | 9/0 | 15/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 15/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 15/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 13/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 13/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 13/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 13/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 13/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 13/0 | 2 | rupture/0 |  |

## pattern-logs/corrosion_thrust-D.json

[完全ログ](pattern-logs/corrosion_thrust-D.json)：case 003588、boss、R3、毒実ダメージ4。

| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |
|---|---|---|---|---|---|---|
| 1 | player:corrosion | 20/1 | 20/3 | 2 | steadfast/0 | 付与2 |
| 1 | player:r_poison_thrust | 20/0 | 20/3 | 2 | steadfast/1 |  |
| 1 | player:endTurn | 15/0 | 20/3 | 2 | rupture/1 | 一閃発動 |
| 1 | boss:battle_spirit | 15/0 | 20/2 | 2 | rupture/1 |  |
| 1 | boss:slash | 10/0 | 20/1 | 2 | rupture/1 |  |
| 1 | boss:feint | 9/0 | 20/0 | 2 | rupture/1 |  |
| 1 | boss:endTurn | 9/3 | 18/0 | 1 | rupture/1 | 毒2 |
| 2 | player:barrier | 9/2 | 18/0 | 1 | rupture/1 |  |
| 2 | player:slash | 9/1 | 18/0 | 1 | rupture/1 |  |
| 2 | player:ultimate | 9/0 | 15/0 | 1 | rupture/1 |  |
| 2 | player:endTurn | 9/0 | 15/3 | 1 | steadfast/0 |  |
| 2 | boss:heavy_slash | 8/0 | 15/1 | 1 | steadfast/0 |  |
| 2 | boss:slash | 6/0 | 15/0 | 1 | steadfast/0 |  |
| 2 | boss:endTurn | 6/3 | 13/0 | 0 | steadfast/0 | 毒2 |
| 3 | player:fortress | 6/1 | 13/0 | 0 | steadfast/0 |  |
| 3 | player:corrosion | 6/0 | 13/0 | 2 | steadfast/0 | 付与2 |
| 3 | player:endTurn | 6/0 | 13/3 | 2 | rupture/0 | 一閃発動 |
| 3 | boss:slash | 4/0 | 13/2 | 2 | rupture/0 |  |
| 3 | boss:heavy_slash | 0/0 | 13/0 | 2 | rupture/0 |  |
