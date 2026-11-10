'use strict';
// Optional real-Chrome test using CDP and Node's built-in WebSocket.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.test-artifacts');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const child=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',
    [...(process.env.CHROME_NO_SANDBOX==='1'?['--no-sandbox','--disable-dev-shm-usage','--mute-audio']:[]),'--headless=new','--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4','--no-first-run','--disable-background-networking','--remote-debugging-port=0',
      '--user-data-dir='+fs.mkdtempSync(path.join(out,'chrome-profile-')),'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let ws;
  try{
    const endpoint=await new Promise((resolve,reject)=>{
      let text='';const timer=setTimeout(()=>reject(new Error('Chrome startup timeout')),15000);
      child.on('error',error=>{clearTimeout(timer);reject(error);});
      child.stderr.on('data',data=>{text+=data.toString();const m=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});
    });
    ws=new WebSocket(endpoint);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
    let sequence=0;const pending=new Map(),errors=[];
    ws.onmessage=event=>{
      const m=JSON.parse(event.data);
      if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}
      if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
    };
    function send(method,params={},sessionId){
      const id=++sequence;return new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout: '+method));},20000);
        pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,sessionId}));
      });
    }
    const target=await send('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true});
    const call=(method,params)=>send(method,params,sessionId);
    await call('Page.enable');await call('Runtime.enable');
    async function evaluate(expression){
      const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
      return r.result.value;
    }
    await call('Page.navigate',{url:process.env.BROWSER_TEST_URL||pathToFileURL(path.join(root,'index.html')).href});
    for(let i=0;i<100;i++){if(await evaluate('typeof trialDebug!=="undefined"'))break;await sleep(100);}
    await evaluate(`document.getElementById('speedButton').click();document.querySelector('.starter-option').click();for(let i=0;i<3;i++){document.querySelector('.card-pick').click();document.getElementById('confirmCard').click();}skipDraft();skipDraft();hideTransitions();`);
    await evaluate(`initBattle('boss_witch_poison')`);
    await sleep(100);const reports=[];
    for(const [width,height] of [[1280,720],[1366,768],[320,812],[375,812],[390,844],[430,932],[760,900],[761,900]]){
      await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<761});await sleep(200);
      const configChecks=await evaluate(`(()=>{
        const read=()=>[...document.querySelectorAll('.enemy-deck .game-card,.enemy-deck .card-open')].map(n=>({height:getComputedStyle(n).height,min:getComputedStyle(n).minHeight}));
        const defaults=read(),style=document.documentElement.style;
        const readStatus=()=>{const checks=[];
        for(const text of ['使用済','CD中（残2T）']){
          const card=document.querySelector('.enemy-deck .game-card'),status=card.querySelector('.card-status'),old=status.textContent;
          status.textContent=text;
          const r=status.getBoundingClientRect(),name=card.querySelector('.card-name').getBoundingClientRect(),cd=card.querySelector('.card-cd').getBoundingClientRect();
          const overlap=b=>r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;
          checks.push({text,inside:r.left>=0&&r.right<=innerWidth,overlap:overlap(name)||overlap(cd),fits:status.scrollWidth<=status.clientWidth});status.textContent=old;
        }
        return checks;};
        const statusChecks=readStatus();
        // Reapply the pre-refactor fixed declarations as a reference, without changing production CSS.
        const reference=document.createElement('style');reference.textContent='.enemy-deck .game-card,.enemy-deck .game-card .card-open{height:70px;min-height:70px}@media(max-width:760px){.enemy-deck .game-card,.enemy-deck .game-card .card-open{height:77px;min-height:77px}}';document.head.append(reference);
        const baselineStatusChecks=readStatus();reference.remove();
        const apply=value=>GamePresentationAdapter.apply(GamePresentationConfig.normalize(value),style);
        apply({desktop:{enemySkillHeightPx:74},mobile:{enemySkillHeightPx:81}});const custom=read();
        apply({desktop:{enemySkillHeightPx:78},mobile:{enemySkillHeightPx:85}});const maximum=read();
        apply({desktop:{enemySkillHeightPx:'bad'},mobile:{enemySkillHeightPx:0}});const invalid=read();
        apply();const restored=read();
        const propertyNames=['--ui-enemy-skill-height-desktop','--ui-enemy-skill-height-mobile'];
        propertyNames.forEach(p=>style.removeProperty(p));const cssFallback=read();apply();
        const fits=selector=>[...document.querySelectorAll(selector)].every(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.width>0;});
        const pairOverlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
        const fieldOverlap=[...document.querySelectorAll('.enemy-deck .game-card')].some(n=>{const rect=q=>n.querySelector(q).getBoundingClientRect();return pairOverlap(rect('.card-name'),rect('.card-cost'))||pairOverlap(rect('.card-name'),rect('.card-cd'));});
        return {defaults,custom,maximum,invalid,restored,cssFallback,statusChecks,baselineStatusChecks,fieldsInScreen:fits('.enemy-deck .card-name,.enemy-deck .card-cost,.enemy-deck .card-cd'),fieldOverlap};
      })()`);
      const expected=width<=760?77:70,customHeight=width<=760?81:74,maximumHeight=width<=760?85:78;
      for(const [key,value] of [['defaults',expected],['custom',customHeight],['maximum',maximumHeight],['invalid',expected],['restored',expected],['cssFallback',expected]]){
        if(configChecks[key].length!==10||configChecks[key].some(x=>x.height!==value+'px'||x.min!==value+'px'))throw Error('Height mismatch '+width+' '+key);
      }
      if(JSON.stringify(configChecks.statusChecks)!==JSON.stringify(configChecks.baselineStatusChecks)||!configChecks.fieldsInScreen||configChecks.fieldOverlap)throw Error('Field visibility '+width);
      const hoverTarget=await evaluate(`(()=>{const r=document.querySelector('.enemy-deck .card-open').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});await call('Input.dispatchMouseEvent',{type:'mouseMoved',...hoverTarget});await sleep(60);
      const playerTarget=await evaluate(`(()=>{const r=document.querySelector('.hand-row .card-open').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      const stateBeforeHover=await evaluate('JSON.stringify([app.selectedPlayer,app.battle.actors.player.used,app.battle.actors.player.mana])');
      await call('Input.dispatchMouseEvent',{type:'mouseMoved',...playerTarget});await sleep(60);
      const playerInspection=await evaluate(`(()=>{const tip=document.getElementById('skillTooltip'),r=tip.getBoundingClientRect();return {visible:!tip.hidden,inside:r.left>=0&&r.right<=innerWidth};})()`);
      if(width>760&&(!playerInspection.visible||!playerInspection.inside))throw Error('Player hover '+width);
      if(stateBeforeHover!==await evaluate('JSON.stringify([app.selectedPlayer,app.battle.actors.player.used,app.battle.actors.player.mana])'))throw Error('Hover mutated battle');
      await call('Input.dispatchMouseEvent',{type:'mouseMoved',...hoverTarget});await sleep(60);
      const inspection=await evaluate(`(()=>{const hover=innerWidth>760?!document.getElementById('skillTooltip').hidden:null;document.querySelector('.enemy-deck .card-open').click();const tap=!!document.querySelector('.enemy-deck .selected');const detail=document.querySelector('.enemy-deck .inline-card-details');const r=detail&&detail.getBoundingClientRect();const detailInside=!!r&&r.left>=0&&r.right<=innerWidth;closeCardDetail();return {hover,tap,detailInside};})()`);
      if(!inspection.tap||!inspection.detailInside||(width>760&&!inspection.hover))throw Error('Inspection failure '+width+JSON.stringify(inspection));
      const report=await evaluate(`(()=>{
        const nodes=[...document.querySelectorAll('.hand-row .game-card')];
        const outside=nodes.filter(n=>{const r=n.getBoundingClientRect();return r.left<0||r.right>innerWidth||r.width<=0;}).length;
        document.querySelector('.hand-row .card-open').click();const detail=!!document.querySelector('#hand .selected');closeCardDetail();
        const controlsVisible=['accelerateButton','endTurn'].every(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;});
        const image=document.getElementById('bossPortrait');
        return {enemyGeometry:[...document.querySelectorAll('.enemy-deck .game-card')].map(n=>{const r=n.getBoundingClientRect(),c=getComputedStyle(n);return {x:r.x,y:r.y,width:r.width,height:r.height,minHeight:c.minHeight};}),mode:app.mode,cards:nodes.length,outside,detail,controlsVisible,legacyVisible:document.querySelector('.legacy-slot').getBoundingClientRect().bottom<=innerHeight,loadedImage:image.naturalWidth>0&&!image.hidden,overflow:document.documentElement.scrollWidth>innerWidth};
      })()`);reports.push({width,height,...report,configChecks,inspection,playerInspection});
      const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      fs.writeFileSync(path.join(out,`battle-${width}x${height}.png`),Buffer.from(shot.data,'base64'));
    }
    const integration=await evaluate(`(async()=>{
      document.getElementById('endTurn').click();hideTransitions();resetGame();await Promise.resolve();
      const resetSafe=app.mode==='draft'&&app.battle===null;
      applyStarter('rush');for(let i=0;i<3;i++)acquireDraft(app.draftOptions[0]);skipDraft();skipDraft();while(app.busy){hideTransitions();await new Promise(r=>setTimeout(r,80));}
      const preset=app.retryPreset,deck=JSON.stringify(app.draftCards);
      document.getElementById('endTurn').click();if(!document.getElementById('endTurnOverlay').hidden)document.getElementById('confirmEndTurn').click();
      for(let i=0;i<100&&app.busy;i++){hideTransitions();await new Promise(r=>setTimeout(r,80));}
      const turnAdvanced=app.battle.round===2&&app.battle.active==='player';
      app.battle.actors.boss.hp=1;app.battle.actors.boss.barrier=0;app.battle.actors.player.weak=0;app.battle.actors.player.mana=5;
      const hpBeforeSelection=app.battle.actors.boss.hp;document.querySelector('#hand [data-card-id="slash"] .card-open').click();
      const selectionOnly=app.battle.actors.boss.hp===hpBeforeSelection&&app.selectedPlayer==='slash';
      document.querySelector('#hand .selected .card-use').click();for(let i=0;i<80&&document.getElementById('resultOverlay').hidden;i++)await new Promise(r=>setTimeout(r,80));
      const resultShown=!document.getElementById('resultOverlay').hidden;
      document.getElementById('retryButton').click();while(app.busy){hideTransitions();await new Promise(r=>setTimeout(r,80));}
      const replay=app.retryPreset===preset&&JSON.stringify(app.draftCards)===deck&&app.battle.actors.player.hp===20&&app.battle.actors.player.mana===2;
      setCharacterImage(document.getElementById('bossPortrait'),'04_giant_warrior','boss');
      document.getElementById('bossPortrait').onerror();const fallback=document.getElementById('bossPortrait').hidden;
      const allCharactersEnabled=Object.values(GAME_ASSETS.characterSets).every(c=>c.enabled&&c.images.boss&&c.images.face&&c.images.bust);
      const reserve=document.querySelector('.legacy-slot');reserve.focus();
      const focusTooltip=!document.getElementById('infoTooltip').hidden;
      reserve.click();const tapTooltip=!document.getElementById('infoTooltip').hidden;
      document.getElementById('soundButton').click();
      for(const kind of ['bgm','se']){const input=document.getElementById(kind+'Enabled');input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));}
      const volume=document.getElementById('bgmVolume');volume.value=30;volume.dispatchEvent(new Event('input',{bubbles:true}));
      const audioSettings=!GameAudio.getState().bgm&&!GameAudio.getState().se&&GameAudio.getState().bgmVolume===.3;
      resetGame();
      return {resetSafe,turnAdvanced,selectionOnly,resultShown,replay,fallback,allCharactersEnabled,focusTooltip,tapTooltip,audioSettings,newRun:app.mode==='draft'&&app.draftCards.length===0};
    })()`);
    const result={reports,integration,errors};fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
    if(errors.length||reports.some(r=>r.mode!=='battle'||r.cards!==5||r.outside||r.overflow||!r.detail||(r.width>760&&(!r.controlsVisible||!r.legacyVisible))||!r.loadedImage)||Object.values(integration).some(v=>v!==true))process.exitCode=1;
    await send('Browser.close');
  }finally{if(ws)ws.close();child.kill();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
