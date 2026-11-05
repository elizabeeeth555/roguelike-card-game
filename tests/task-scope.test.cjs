'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createScope}=require('../src/app/task-scope.js');

test('演出タスク：中断時に待機を解放し、解除済みコールバックも実行しない',async()=>{
  let next=0;const timers=new Map();const cleared=[];
  const scope=createScope({setTimer:cb=>{timers.set(++next,cb);return next;},clearTimer:id=>cleared.push(id)});
  let calls=0;
  scope.schedule(()=>calls++,100);
  const wait=scope.wait(100);
  const oldCallbacks=[...timers.values()];
  scope.cancel();
  assert.equal(await wait,false);
  assert.deepEqual(cleared,[1,2]);
  for(const cb of oldCallbacks)cb();
  assert.equal(calls,0);
  const fresh=scope.wait(10);timers.get(next)();
  assert.equal(await fresh,true);
  scope.schedule(()=>calls++,20);timers.get(next)();
  assert.equal(calls,1);
});
