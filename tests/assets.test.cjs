'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
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
