# 『継世の王座』P0戦闘VFX・SE生成プロンプト集 v0.1

作成日：2026-11-12／状態：**制作前の提案資料（未生成・未採用）**

参照元：[asset-master.md](asset-master.md)。対象はP0のみ。**VFX 45件、SE 39件、計84件**。素材IDは台帳用でゲーム実行時IDではない。

## 1. 生成前に守るルール

- 現行スキル効果・バランス・ボス能力は変更しない。新第一紀への採用未確定のスキルもある。
- 生成サービスの出力は透過保証なし。黒背景での加算合成は黒煙・毒霧・結界に不向き。**透明化・半透明エッジ・背景除去を実機で検証**してから量産する。
- **一度に全84件を生成しない。** 最初は試験パックのみ。各プロンプトはサービスに合わせて微調整し、生成モデル・seed・設定・出力とライセンス証跡を非公開保存する。
- プロンプトの秒数・画角・色は**制作仮値**。ゲームの正式な演出時間・仕様ではない。
- 生成した素材をそのまま公開リポジトリへ登録しない。ライセンスと配布条件を確認する。

## 2. 推奨方式の判定基準

| 方式 | 適した対象 | 判断理由 |
|---|---|---|
| コード描画（CSS/SVG/Canvas） | 幾何学的な線・円・点灯・マナ・単純な閃光 | 解像度依存が小さく、色・タイミング・軽量設定を変更しやすい |
| AI静止画＋コード | 魔法紋、複雑なひび、粒子テクスチャ、特殊な破片 | 静止素材を分割・移動・回転させて再利用できる |
| AI動画／連番 | 煙、火花、流体、複雑な破砕、自然な斬撃の軌跡 | 不規則な時間変化を得やすい。ただし透過とフレーム安定性が課題 |
| AI音声 | SE全件の候補 | 複数試行から聴感で選び、音量・ピーク・余韻を後加工する |

## 3. 共通プロンプトと禁止要素

**VFX共通追記（各個別英文の後ろに付ける）：**

```text
Standalone 2D game VFX element for a dark fantasy tactical RPG. Centered in frame with generous safe margins, fixed camera, no environment, no characters, no weapons, no UI, no text, no logos. Realistic restrained metal, dust and magical light, muted palette, strong readable silhouette. Single action with clean beginning and ending; no camera cuts or zooms. Transparent alpha background if the tool truly supports it; otherwise a flat uniform chroma background for controlled keying, with no cast shadows or background gradients. Keep the effect fully inside the frame.
```

**VFX共通ネガティブ（対応サービスのnegative欄へ。なければ末尾に追加）：**

```text
people, faces, hands, sword model, full armor, scenery, floor, landscape, cinematic camera movement, captions, letters, watermark, logos, extra explosions, oversaturated neon, ornate HUD, border, flicker, random objects, drifting composition, clipped particles, black background when transparency is required
```

**SE共通追記：**

```text
Clean isolated sound effect for a grounded dark fantasy RPG. Dry foreground sound with a short controlled tail, no music, no speech, no crowd, no ambience bed, no reverb-heavy cinematic mix, no clipping. One clearly identifiable event, easy to layer with other sound effects.
```

**SE共通ネガティブ：** `music, melody, vocals, dialogue, narration, background ambience, long echo, distortion, clipping, unrelated sounds`

**仮の書き出し基準：** VFXは短尺ワンショット中心（目安0.3〜1.5秒）、煙・結界維持は2〜4秒のループ候補。SEはWAV原本を保存、必要に応じてWeb配信用形式へ変換。最終サイズ・fps・音量は統合試験で決める。

## 4. 最初の無料枠・試験パック

| 順番 | ID | 試験目的 | 合格確認 |
|---|---|---|---|
| 1 | VFX-001 | 斬撃の軌跡・切り抜き | 方向と形が安定、縁に背景残りなし |
| 2 | VFX-011 | 火花のアルファ | 微細粒子が黒背景／明背景の双方で見える |
| 3 | VFX-032 | 毒霧の半透明 | 紫の半透明が破綻せず、ループの継ぎ目が目立たない |
| 4 | VFX-022 | 結界展開 | 展開が中心固定で自然、破壊素材と重ねられる |
| 5 | VFX-027 | 結界破砕 | 破片のエッジと消失が自然 |
| 6 | SE-014 | 重い金属衝突 | 音の頭が明瞭で、他SEと重ねられる |

**試験の合格ゲート：** 原本保存→背景処理→軽量化→PC/スマホで重畳→VFXとSE同期→標準/軽量モードの目視・聴感確認。無料枠で未検証の条件は未検証と記録し、契約可否の判断材料にする。

## 5. P0 VFX 個別プロンプト（45件）

### VFX-001｜小横斬り

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a single compact horizontal steel sword slash trail, left to right, narrow crescent, fast clean attack. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-002｜大横斬り

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a broad horizontal greatsword slash trail, left to right, weighty bright leading edge and fading tail. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-003｜縦斬り

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a vertical downward sword slash trail, top to bottom, sharp arc and restrained steel glint. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-004｜斜め斬り左右

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create two separate directional variations of diagonal sword slash trails, rising left-to-right and falling right-to-left; export each independently. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-005｜連撃軌跡

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create three staggered thin sword slash trails in quick succession, distinct readable arcs, no weapon visible. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-006｜刺突線

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a focused straight piercing thrust streak rushing forward into a pinpoint, subtle depth and compressed air. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-007｜突進残像

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a short forward rushing silhouette-free speed streak, compressed air and trailing motion blur. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-008｜重打撃弧

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a thick heavy blunt impact arc with dense air displacement and tiny grit. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-009｜武器振り抜き風圧

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a thin curved pressure wave from a forceful weapon swing, almost colorless air distortion. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-010｜毒刃付着光

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 斬撃・武器系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create small muted violet toxic glints crawling along an invisible blade edge, isolated particles only. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-011｜小火花

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a few sharp tiny orange-white sparks from a light metal strike, burst and die quickly. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-012｜大火花

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a dense but short spray of hot steel sparks with varied trajectories and fast decay. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-013｜金属衝突

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a concentrated white-hot metal impact flash with tiny flying steel flecks. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-014｜鈍器衝撃

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a compact dull impact puff with dust and a blunt radial pressure ring. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-015｜小衝撃波

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a tight circular shockwave expanding rapidly and fading, no background distortion required. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-016｜大衝撃波

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a larger circular shockwave with dusty outer edge and strong initial impulse. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-017｜地面亀裂

- **優先方式：** AI静止画＋コード（動画は代替）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a short jagged crack spreading across a small patch of stone floor, isolated overlay. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-018｜岩片飛散

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a burst of small irregular stone fragments scattering outwards then falling. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-019｜鎧破片

- **優先方式：** AI静止画＋コード（動画は代替）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create several dull steel armor chips scattering from a central impact, no complete armor or character. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-020｜ガード衝突

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a crisp shield-block collision burst, bright contact point and short radial sparks. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-021｜フィニッシュ閃光

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 命中・衝撃系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a brief dramatic concentrated finishing flash with a narrow starburst, not full-screen whiteout. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-022｜薄い結界展開

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a thin translucent steel-blue circular protective ward materializing outward from its center. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-023｜厚い結界展開

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a thick layered steel-blue defensive ward assembling in two concentric rings. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-024｜結界維持ループ

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a nearly static translucent blue protective ward with very subtle slow internal motion, seamless loop. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

- **追加確認：** 先頭と末尾の密度・形が近いこと。クロスフェードでつなぐ場合も見た目の不連続を検証。

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-025｜結界吸収

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a translucent blue ward rippling inward at one localized impact point, elastic recovery. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-026｜結界ひび割れ

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create fine cracks spreading across a translucent blue ward surface without fully shattering. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-027｜結界破砕

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a blue translucent protective ward breaking into small luminous shards and vanishing. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-028｜回復粒子

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a few soft muted green healing motes rising gently and fading. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-029｜回復光柱

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a restrained narrow vertical green-gold healing glow with slow upward motes. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-030｜防御強化の光

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 防御・回復系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a brief muted steel-blue protective shimmer outlining an invisible target. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-031｜毒霧噴出

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a short eruption of dense dark-violet poisonous vapor from a central point. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-032｜毒霧漂い

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a soft semi-transparent dark purple poison cloud drifting slowly, seamless loop, stable density. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 先頭と末尾の密度・形が近いこと。クロスフェードでつなぐ場合も見た目の不連続を検証。

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-033｜毒滴

- **優先方式：** AI静止画＋コード（動画は代替）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a few viscous violet poison droplets falling and splashing subtly. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-034｜毒付着

- **優先方式：** AI静止画＋コード（動画は代替）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create small toxic purple residue particles clinging to an invisible surface and pulsing once. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-035｜毒侵食

- **優先方式：** AI静止画＋コード（動画は代替）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create dark violet corrosive tendrils spreading briefly over a small isolated patch. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-036｜毒爆散

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a quick dark-purple toxic vapor burst expanding and dissolving. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-037｜紫の弱体紋

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a single restrained violet debuff sigil appearing and fading, simple non-text geometric design. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-038｜灰紫の弱体粒子

- **優先方式：** AI静止画＋コード（動画は代替）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create sparse gray-violet weakening dust falling and fading. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

### VFX-039｜毒消費の吸引

- **優先方式：** AI動画／連番（コード代替可）
- **演出目的：** 毒・弱体系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create dark purple toxic wisps converging rapidly into one small point and disappearing. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **追加確認：** 半透明素材は単純な黒抜きで欠損しやすい。アルファ境界を黒・白・ゲーム背景の3種類で比較。

### VFX-040｜金色強化粒子

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 強化・マナ系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a handful of muted antique-gold buff sparks rising and disappearing. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-041｜構えオーラ

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 強化・マナ系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a compact subtle antique-gold stance aura pulsing once around an invisible target. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-042｜準備の収束光

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 強化・マナ系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create several thin dim gold lines converging into a small center point. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-043｜マナ結晶点灯

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 強化・マナ系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a tiny blue crystal-shaped light flickering on once, no text or HUD frame. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-044｜マナ流入

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 強化・マナ系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create short streams of cool blue motes converging toward a central mana point. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

### VFX-045｜マナ消費の散光

- **優先方式：** コード描画（外部生成不要を第一候補）
- **演出目的：** 強化・マナ系の共通部品。スキル固有の性能・発動条件は定義しない。
- **個別英語プロンプト：**

```text
Create a small blue mana flare scattering into tiny fading fragments. Motion starts immediately, holds the subject near frame center, then dissipates cleanly. Keep the shape readable when composited at small game-screen size.
```

- **コード制作指示：** 上記英文を見た目の参考として扱い、SVG/Canvas/CSSで線・粒子・透明度・拡縮・フェードをパラメータ化。画像生成の前にコード試作を比較。

## 6. P0 SE 個別プロンプト（39件）

### SE-001｜軽い振り

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one fast light sword whoosh through air, thin and crisp. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-002｜重い振り

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one slow powerful heavy sword whoosh, weighty air displacement. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-003｜鋭い斬撃

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one sharp steel cutting swish with a crisp attack transient. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-004｜鈍い斬撃

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one rough low-pitched cutting sweep with heavy cloth and air friction. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-005｜刺突

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one rapid narrow piercing thrust swish, tight and focused. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-006｜突進

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a brief fast forward rush with compressed air and footwork hint, no footsteps dominating. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-007｜連撃

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate three short distinct blade whooshes in a quick rhythm, each clearly separated. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-008｜打撃小

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one light blunt strike, dry compact thud. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-009｜打撃大

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one heavy blunt strike, deep thud with short tail. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-010｜武器構え

- **用途：** 武器・攻撃系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a short metallic weapon readying scrape and subtle leather movement. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-011｜肉体ヒット軽

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one light fantasy combat body impact, dry thump, non-graphic. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-012｜肉体ヒット重

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one powerful body impact, deep punchy thud, non-graphic. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-013｜金属ヒット軽

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one light sword-on-armor metallic tick with tiny ring. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-014｜金属ヒット重

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate one heavy sword-on-plate-armor clang with dense low impact and short metallic ring. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-015｜火花散り

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate brief sizzling metallic sparks scattering after impact. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-016｜鎧きしみ

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a short stressed plate armor creak and friction sound. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-017｜破砕小

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate small brittle fragments breaking and scattering. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-018｜破砕大

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate heavy hard material shattering into chunks with a short tail. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-019｜衝撃波

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a short compressed-air shockwave thump with low-frequency bloom. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-020｜地面衝突

- **用途：** 命中・金属系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a massive object striking stone floor, deep thud with short grit debris. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-021｜結界展開

- **用途：** 防御・回復系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a restrained magical shield forming, cool glassy swell and soft lock-in chime. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-022｜結界持続

- **用途：** 防御・回復系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate subtle steady magical barrier hum, loopable, no melody. Provide a stable seamless 2–4 second loop with no abrupt changes. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-023｜結界吸収

- **用途：** 防御・回復系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a shield absorbing one hit, resonant elastic magical pulse. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-024｜結界破壊

- **用途：** 防御・回復系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a magical shield cracking and shattering into glasslike energy fragments. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-025｜回復小

- **用途：** 防御・回復系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a short gentle restorative shimmer, soft organic chime. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-026｜回復大

- **用途：** 防御・回復系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a fuller restorative swell with layered soft crystalline chimes. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-027｜防御強化

- **用途：** 防御・回復系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a short solid protective magical pulse, cool resonant tone. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-028｜毒付与

- **用途：** 毒・弱体系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a quick dark toxic application hiss and low wet fizz. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-029｜毒滴

- **用途：** 毒・弱体系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a single viscous poisonous droplet plop. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-030｜毒煙

- **用途：** 毒・弱体系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a short airy poisonous vapor hiss with dark low undertone. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-031｜毒侵食

- **用途：** 毒・弱体系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate subtle corrosive bubbling and crackling, short non-graphic texture. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-032｜毒解放

- **用途：** 毒・弱体系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a quick suction of toxic energy followed by a compact dark burst. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-033｜呪い付与

- **用途：** 毒・弱体系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a low unsettling curse whisper-like texture, no intelligible voice. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-034｜弱体発動

- **用途：** 毒・弱体系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a brief muted magical weakening pulse with falling pitch. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-035｜強化発動

- **用途：** 強化・マナ系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a compact confident antique-gold magical buff flourish, no music. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-036｜準備チャージ

- **用途：** 強化・マナ系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a short restrained magical charge rising toward a ready point. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-037｜マナ増加

- **用途：** 強化・マナ系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a tiny cool crystalline mana gain chime, clean and readable. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-038｜マナ消費

- **用途：** 強化・マナ系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a short low blue-energy release click with a soft dissipating tail. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

### SE-039｜CD回復

- **用途：** 強化・マナ系の独立SE。VFXの発動点・命中点へ後から同期する。
- **個別英語プロンプト：**

```text
Generate a very brief subtle cooldown-ready tick, non-intrusive. Keep the main attack transient distinct and the overall sound compact, approximately 0.2–1.5 seconds when practical. No voice or musical notes.
```
- **候補生成：** 音色が異なる2〜3案を比較（軽い／標準／重いの作り分けが必要な場合は別途）。

## 7. 生成・加工・採否の実行手順

1. **チャッピー**：P0から試験6点を指定し、各生成サービスの仕様に合わせて共通追記と個別プロンプトを整える。
2. **ユーザー**：無料枠の範囲で生成、原本と生成条件・商用利用条件のスクリーンショット等を非公開保存。試験用データを共有。
3. **Codex（別途承認後）**：素材のトリミング、透過処理、WebP/連番変換、音声ピーク調整、再生同期、性能計測。既存公開版・PR #1・研究成果は保護。
4. **ユーザー＋チャッピー**：PC・スマホの視認性、重さ、音量、ダークファンタジーとの調和を評価。
5. **ユーザー**：無料検証の結果と契約前の最新料金・生成枠・権利条件から有料契約を判断。
6. **量産時**：P0の不足分を先に制作。P1・P2は予算に応じて追加。素材ごとに採用・保留・不採用を台帳へ記録。

## 8. 管理台帳への記録テンプレート

```text
素材ID：
候補名：
生成方式：コード / 静止画 / 動画 / 音声
サービス・モデル・プラン：
個別プロンプト＋共通追記の全文：
生成設定・seed：
生成日：
原本の非公開保存先：
加工版の保存先：
権利条件と確認URL・日付：
試験結果（背景・ループ・軽量・同期・聴感）：
状態：未制作 / 候補保存 / 加工済 / 検証済 / 採用 / 不採用
採否判断者・日付：
```

## 9. 参考サイト（契約前に最新条件を再確認）

- [Runway](https://runwayml.com/)
- [Adobe Firefly](https://firefly.adobe.com/)
- [ElevenLabs Sound Effects](https://elevenlabs.io/sound-effects)
- [スキル正本](https://github.com/elizabeeeth555/roguelike-card-game/blob/main/docs/features/skills.md)
- [UI・演出正本](https://github.com/elizabeeeth555/roguelike-card-game/blob/main/docs/features/ui.md)

**注意：** 料金・クレジット・商用利用・透過出力の可否は本書では保証しない。生成物の権利条件は生成時のプランとサービス規約で確認する。GitHubや実装への変更は行っていない。