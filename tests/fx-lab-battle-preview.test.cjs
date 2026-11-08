'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const Core=require('../dev/fx-lab/core.js');

test('対象は旧JSONでbossに補完、新JSONで敵／プレイヤーをA/B別に保持',()=>{
 const old=Core.normalize({schema:'keisei.fx-lab',version:1,patterns:{A:{},B:{}}});
 assert.equal(old.patterns.A.playback.target,'boss');
 assert.equal(old.patterns.B.playback.target,'boss');
 const m=Core.defaults();m.patterns.A.playback.target='player';m.patterns.B.playback.target='boss';
 const stored=Core.normalize(m);assert.equal(stored.patterns.A.playback.target,'player');
 assert.equal(stored.patterns.B.playback.target,'boss');
 assert.deepEqual(Core.normalize(JSON.parse(JSON.stringify(stored))),stored);
 m.patterns.B.playback.target='arbitrary';assert.throws(()=>Core.normalize(m));
});
test('FX Labは本編と同じ戦闘背景・実画像を利用し、モックHUD・スキル欄を表示',()=>{
 const page=fs.readFileSync('dev/fx-lab.html','utf8');
 const css=fs.readFileSync('dev/fx-lab/battle-preview.css','utf8');
 for(const id of ['sceneShell','arena','bossHudMock','playerHudMock','enemyShadow','bossPortrait','heroFace','playerHpTrack','fxCanvas','layerStage','previewBadge'])assert(page.includes('id="'+id+'"'),id);
 for(const selector of ['.mock-boss-hud','.mock-player-hud','.mock-enemy-deck','.mock-hand','.mock-turn','.battle-preview.expanded'])assert(css.includes(selector),selector);
 assert(css.includes('castle_throne_room.webp'));
 assert(page.includes('戦闘UIは試写用の固定サンプル'));
});
test('プレビュー画面から再生・停止・対象変更・終了を操作できる',()=>{
 const page=fs.readFileSync('dev/fx-lab.html','utf8'),js=fs.readFileSync('dev/fx-lab/lab.js','utf8');
 for(const id of ['previewExpand','previewOverlayControls','previewPlay','previewStop','previewTarget','previewExit','target','targetInfo'])assert(page.includes('id="'+id+'"'),id);
 for(const event of ["$('previewPlay').addEventListener","$('previewStop').addEventListener","$('previewTarget').addEventListener","$('previewExit').addEventListener","toggleExpanded(false)","event.key==='Escape'"])assert(js.includes(event),event);
 assert(js.includes("$('sceneShell').dataset.target=p.target"));
 assert(js.includes("model.patterns[active]=Core.profile(current())"));
});
test('本編への影響を与えず、購入素材を参照しない',()=>{
 const page=fs.readFileSync('dev/fx-lab.html','utf8');
 const css=fs.readFileSync('dev/fx-lab/battle-preview.css','utf8');
 assert(!fs.readFileSync('index.html','utf8').includes('battle-preview.css'));
 assert(!page.includes('private-assets/'));
 assert(!css.includes('private-assets/'));
});
