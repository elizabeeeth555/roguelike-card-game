'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = join(__dirname, '..');

test('Reactトップとclassicから参照するJS・CSSファイルが存在する', () => {
  for(const file of ['index.html','classic/index.html']){
    const html=readFileSync(join(root,file),'utf8'),base=html.match(/<base[^>]+href="([^"]+)"/)?.[1]??'./';
    const referenced=[...html.matchAll(/<(?:script|link)\s+[^>]*(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(p=>!p.startsWith('data:'));
    if(file.startsWith('classic')||!html.includes('type="module"')){assert.ok(referenced.includes('src/main.js'));assert.ok(referenced.includes('src/styles.css'));}
    else {assert.ok(html.includes('type="module"'));assert.ok(!html.includes('.tsx'));}
    for(const uri of referenced)assert.ok(existsSync(join(root,file,'..',base,uri)),`${file}: ${uri} がありません`);
  }
});

test('BGM・SE・英雄素材の参照が有効', () => {
  const sandbox={window:{}};
  vm.runInNewContext(readFileSync(join(root,'assets/asset-map.js'),'utf8'),sandbox);
  const map=sandbox.window.GAME_ASSETS;
  const paths=[...Object.values(map.characters),map.background,...Object.values(map.bgm),...Object.values(map.bgmFallback),...Object.values(map.sounds)];
  assert.ok(Object.keys(map.sounds).length>=30);
  for(const path of paths) assert.ok(existsSync(join(root,path)),`${path} がありません`);
});

test('提供された6キャラの立ち絵・顔・バストアップ参照とハッシュが一致',()=>{
  const sandbox={window:{}};vm.runInNewContext(readFileSync(join(root,'assets/asset-map.js'),'utf8'),sandbox);
  const characters=sandbox.window.GAME_ASSETS.characterSets;
  for(const character of Object.values(characters)){
    assert.equal(character.enabled,true);
    for(const pose of ['boss','face','bust'])assert(existsSync(join(root,character.images[pose])));
  }
  const manifest=JSON.parse(readFileSync(join(root,'assets/characters/manifest.json'),'utf8'));
  assert.equal(manifest.characters.length,6);
  for(const character of manifest.characters){
    const master=readFileSync(join(root,character.master));
    assert.equal(createHash('sha256').update(master).digest('hex'),character.master_sha256);
    assert.equal(master.readUInt32BE(16),1024);assert.equal(master.readUInt32BE(20),1536);
    if(character.id!=='03_witch'){
      assert.equal(character.originalAlphaPreserved,true);
      assert.deepEqual(readFileSync(join(root,character.images.boss.path)),master,'透過済み5枚は原本と完全一致');
    }else assert.equal(master[25],2,'魔女原本はRGBのまま保存');
  }
  for(const character of manifest.characters)for(const [pose,info] of Object.entries(character.images)){
    assert.equal(characters[character.id].images[pose],info.path);
    const bytes=readFileSync(join(root,info.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),info.sha256);
    assert.equal(bytes.readUInt32BE(16),info.width);assert.equal(bytes.readUInt32BE(20),info.height);
  }
});
