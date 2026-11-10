'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const config=require('../src/ui/presentation-config.js');
const adapter=require('../src/ui/presentation-adapter.js');
test('presentation defaults and missing configuration are immutable',()=>{
  for(const input of [undefined,null,{},[],42,'70']){
    const result=config.normalize(input);
    assert.deepEqual(result,config.DEFAULTS);assert.ok(config.isNormalized(result));
    assert.ok(Object.isFrozen(result)&&Object.isFrozen(result.desktop));
  }
});
test('profiles independent; input untouched; unknown keys never survive',()=>{
  const input={desktop:{enemySkillHeightPx:74,selector:'body'},html:'<script>'};
  const before=JSON.stringify(input),result=config.normalize(input);
  assert.deepEqual(result,{desktop:{enemySkillHeightPx:74},mobile:{enemySkillHeightPx:77}});
  assert.equal(JSON.stringify(input),before);
  assert.deepEqual(config.normalize({mobile:{enemySkillHeightPx:81}}),{desktop:{enemySkillHeightPx:70},mobile:{enemySkillHeightPx:81}});
});
test('invalid, inherited, accessor and out of range values fall back',()=>{
  for(const profile of ['desktop','mobile']){
    for(const value of ['74',null,true,{},[],NaN,Infinity,-Infinity,-1,0,config.LIMITS[profile].min-.1,config.LIMITS[profile].max+.1]){
      assert.equal(config.normalize({[profile]:{enemySkillHeightPx:value}})[profile].enemySkillHeightPx,config.DEFAULTS[profile].enemySkillHeightPx);
    }
    for(const value of [config.LIMITS[profile].min,config.LIMITS[profile].max])assert.equal(config.normalize({[profile]:{enemySkillHeightPx:value}})[profile].enemySkillHeightPx,value);
  }
  assert.deepEqual(config.normalize(Object.create({desktop:{enemySkillHeightPx:74}})),config.DEFAULTS);
  assert.deepEqual(config.normalize({get desktop(){throw Error('must not execute');}}),config.DEFAULTS);
});
test('adapter only accepts normalized objects, writes two keys and resets',()=>{
  const values=new Map(),style={setProperty:(key,value)=>values.set(key,value)};
  assert.equal(adapter.apply({desktop:{enemySkillHeightPx:74}},style),false);
  assert.equal(values.size,0);assert.equal(adapter.apply(undefined,style),false);
  assert.equal(adapter.apply(config.normalize(),null),false);
  assert.equal(adapter.apply(config.normalize({desktop:{enemySkillHeightPx:74},mobile:{enemySkillHeightPx:81},css:'bad'}),style),true);
  assert.deepEqual([...values],[['--ui-enemy-skill-height-desktop','74px'],['--ui-enemy-skill-height-mobile','81px']]);
  adapter.apply(config.normalize(),style);
  assert.deepEqual([...values],[['--ui-enemy-skill-height-desktop','70px'],['--ui-enemy-skill-height-mobile','77px']]);
});
test('classic scripts expose modules without CommonJS',()=>{
  const vm=require('node:vm'),fs=require('node:fs'),context=vm.createContext({});
  for(const file of ['presentation-config','presentation-adapter'])vm.runInContext(fs.readFileSync('src/ui/'+file+'.js','utf8'),context);
  assert.equal(vm.runInContext('GamePresentationConfig.normalize().mobile.enemySkillHeightPx',context),77);
  assert.equal(vm.runInContext('typeof GamePresentationAdapter.apply',context),'function');
});
