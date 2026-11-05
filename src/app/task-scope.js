/* Host-owned asynchronous work. Inject timers for deterministic tests. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory();
  else root.GameTasks=factory();
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  function createScope({setTimer=setTimeout,clearTimer=clearTimeout}={}){
    let generation=0;
    const pending=new Map();
    function schedule(callback,delay,onCancel){
      const current=generation;
      const id=setTimer(()=>{
        pending.delete(id);
        if(current===generation)callback();
      },delay);
      pending.set(id,onCancel);
      return id;
    }
    function wait(delay){
      return new Promise(resolve=>schedule(()=>resolve(true),delay,()=>resolve(false)));
    }
    function cancel(){
      generation++;
      const tasks=[...pending];
      pending.clear();
      for(const [id,onCancel] of tasks){clearTimer(id);if(onCancel)onCancel();}
    }
    return Object.freeze({schedule,wait,cancel});
  }
  return Object.freeze({createScope});
});
