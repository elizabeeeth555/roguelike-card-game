/* Only the two known presentation properties cross the DOM boundary. */
(function(root,factory){
  'use strict';
  if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./presentation-config.js'));
  else root.GamePresentationAdapter=factory(root.GamePresentationConfig);
})(typeof globalThis==='object'?globalThis:this,function(config){
  'use strict';
  function apply(value,style){
    if(!config||!config.isNormalized(value)||!style||typeof style.setProperty!=='function')return false;
    style.setProperty('--ui-enemy-skill-height-desktop',value.desktop.enemySkillHeightPx+'px');
    style.setProperty('--ui-enemy-skill-height-mobile',value.mobile.enemySkillHeightPx+'px');
    return true;
  }
  return Object.freeze({apply});
});
