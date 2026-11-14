'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..');
const csv=fs.readFileSync(path.join(root,'docs/assets/ui-image-inventory.csv'),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>line.split(','));
const rows=csv.slice(1).map(values=>Object.fromEntries(csv[0].map((key,i)=>[key,values[i]])));
test('all 42 original PNGs match inventory SHA256 and PNG dimensions',()=>{
 assert.equal(rows.length,42);assert.equal(new Set(rows.map(r=>r['仮ID'])).size,42);
 for(const row of rows){const bytes=fs.readFileSync(path.join(root,row['新ファイル']));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.SHA256,row['仮ID']);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16)+'x'+bytes.readUInt32BE(20),row['サイズ']);}
});
test('player/boss visual frame mapping matches approved 29–41 roles without changing rules',async()=>{
 const {skillFrame,SKILL_ICONS}=await import('../src/ui-image-assets.ts');const {category}=await import('../src/first-era/presentation.ts');
 for(const [kind,hero,boss] of [['heal',30,37],['defense',31,40],['buff',32,36],['attack',33,41],['poison',34,39],['debuff',35,38]]){assert.equal(skillFrame('player',kind),hero);assert.equal(skillFrame('boss',kind),boss);assert.equal(rows.find(r=>Number(r['仮ID'])===hero)['利用区分'],'採用');assert.equal(rows.find(r=>Number(r['仮ID'])===boss)['利用区分'],'採用');}
 for(const tags of [['poison'],['attack','poison'],['attack','poison_reference']])assert.equal(category(tags),'poison');assert.equal(category(['attack','buff']),'buff');assert.equal(category(['attack','debuff']),'debuff');assert.equal(category(['buff','poison']),'none');
 assert.equal(skillFrame('player','none'),undefined);assert.equal(SKILL_ICONS.heavy_slash,26);assert.equal(SKILL_ICONS.first_era_venom_blade,13);assert.equal(SKILL_ICONS.heavy_swing,undefined);
});
test('only registered applied images enter the build allowlist; reserved originals remain untouched',async()=>{
 const {UI_IMAGES,uiImageUrl}=await import('../src/ui-image-assets.ts');const publication=require('../../../scripts/prepare-pages.cjs');
 assert.equal(Object.keys(UI_IMAGES).length,33);
 for(const number of [3,4,5,11,17,21,22,23,25]){assert.equal(UI_IMAGES[number],undefined);assert.equal(uiImageUrl(number),undefined);}
 for(const [number,image]of Object.entries(UI_IMAGES)){const row=rows.find(r=>Number(r['仮ID'])===Number(number));assert.equal(image.path,row['新ファイル']);assert.equal(publication.UI_MEDIA[uiImageUrl(Number(number)).slice(2)],image.path);const[x,y,w,h]=image.viewBox;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=image.width&&y+h<=image.height);}
});
