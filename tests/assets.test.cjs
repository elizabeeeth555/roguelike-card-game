'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = join(__dirname, '..');

test('index.htmlから参照するJS・CSSファイルがすべて存在する', () => {
  const html=readFileSync(join(root,'index.html'),'utf8');
  const referenced=[...html.matchAll(/<(?:script|link)\s+[^>]*(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(referenced.some(x=>x==='src/main.js'));
  assert.ok(referenced.some(x=>x==='src/styles.css'));
  for(const uri of referenced) assert.ok(existsSync(join(root,uri)),`${uri} がありません`);
});

test('BGM・SE・英雄素材の参照が有効', () => {
  const sandbox={window:{}};
  vm.runInNewContext(readFileSync(join(root,'assets/asset-map.js'),'utf8'),sandbox);
  const map=sandbox.window.GAME_ASSETS;
  const paths=[...Object.values(map.characters),map.background,...Object.values(map.bgm),...Object.values(map.bgmFallback),...Object.values(map.sounds)];
  assert.ok(Object.keys(map.sounds).length>=30);
  for(const path of paths) assert.ok(existsSync(join(root,path)),`${path} がありません`);
});

test('使用する4キャラの3ポーズは存在、大男・斥候の画像は設定から除外',()=>{
  const sandbox={window:{}};vm.runInNewContext(readFileSync(join(root,'assets/asset-map.js'),'utf8'),sandbox);
  const characters=sandbox.window.GAME_ASSETS.characterSets;
  for(const [id,character] of Object.entries(characters)){
    if(['04_giant_warrior','05_scout'].includes(id)){assert.equal(character.enabled,false);assert.equal(Object.keys(character.images).length,0);}
    else for(const pose of ['boss','face','back'])assert(existsSync(join(root,character.images[pose])));
  }
  const manifest=JSON.parse(readFileSync(join(root,'assets/characters/manifest.json'),'utf8'));
  assert.equal(manifest.characters.length,4);
  for(const character of manifest.characters)for(const [pose,info] of Object.entries(character.images)){
    assert.equal(characters[character.id].images[pose],info.path);
    const bytes=readFileSync(join(root,info.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),info.sha256);
    assert.equal(bytes.readUInt32BE(16),info.width);assert.equal(bytes.readUInt32BE(20),info.height);
  }
});
