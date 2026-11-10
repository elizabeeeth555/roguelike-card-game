/* Presentation data only: no DOM, game state or arbitrary CSS keys. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory();
  else root.GamePresentationConfig=factory();
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const DEFAULTS=Object.freeze({desktop:Object.freeze({enemySkillHeightPx:70}),mobile:Object.freeze({enemySkillHeightPx:77})});
  // Never shrink the existing text area; a small expansion preserves fixed field anchors.
  const LIMITS=Object.freeze({desktop:Object.freeze({min:70,max:78}),mobile:Object.freeze({min:77,max:85})});
  const normalized=new WeakSet();
  function ownData(object,key){
    if(!object||typeof object!=='object'||Array.isArray(object))return undefined;
    const descriptor=Object.getOwnPropertyDescriptor(object,key);
    return descriptor&&Object.hasOwn(descriptor,'value')?descriptor.value:undefined;
  }
  function normalize(input){
    const result={};
    for(const profile of ['desktop','mobile']){
      const value=ownData(ownData(input,profile),'enemySkillHeightPx'),limit=LIMITS[profile];
      const height=typeof value==='number'&&Number.isFinite(value)&&value>=limit.min&&value<=limit.max?value:DEFAULTS[profile].enemySkillHeightPx;
      result[profile]=Object.freeze({enemySkillHeightPx:height});
    }
    Object.freeze(result);normalized.add(result);return result;
  }
  function isNormalized(value){return normalized.has(value);}
  return Object.freeze({DEFAULTS,LIMITS,normalize,isNormalized});
});
