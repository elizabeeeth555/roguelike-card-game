'use strict';
// Optional real-Chrome test using CDP and Node's built-in WebSocket.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.test-artifacts');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const child=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',
    [...(process.env.CHROME_NO_SANDBOX==='1'?['--no-sandbox','--disable-dev-shm-usage','--mute-audio']:[]),'--headless=new','--no-first-run','--disable-background-networking','--remote-debugging-port=0',
      '--user-data-dir='+path.join(out,'chrome-profile'),'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
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
    await evaluate(`document.getElementById('speedButton').click();document.querySelector('.starter-option').click();for(let i=0;i<3;i++){document.querySelector('.card-pick').click();document.getElementById('confirmCard').click();}hideTransitions();`);
    await evaluate(`initBattle('boss_witch_poison');hideTransitions();`);
    await sleep(100);const reports=[];
    for(const [width,height] of [[1366,768],[1280,720],[360,800],[390,844],[430,932]]){
      await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<761});await sleep(200);
      const report=await evaluate(`(()=>{
        const nodes=[...document.querySelectorAll('.hand-row .game-card')];
        const outside=nodes.filter(n=>{const r=n.getBoundingClientRect();return r.left<0||r.right>innerWidth||r.width<=0;}).length;
        document.querySelector('.hand-row .card-open').click();const detail=!!document.querySelector('#hand .selected');closeCardDetail();
        const controlsVisible=['accelerateButton','endTurn'].every(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;});
        const image=document.getElementById('bossPortrait');
        return {mode:app.mode,cards:nodes.length,outside,detail,controlsVisible,legacyVisible:document.querySelector('.legacy-slot').getBoundingClientRect().bottom<=innerHeight,loadedImage:image.naturalWidth>0&&!image.hidden,overflow:document.documentElement.scrollWidth>innerWidth};
      })()`);reports.push({width,height,...report});
      const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      fs.writeFileSync(path.join(out,`battle-${width}x${height}.png`),Buffer.from(shot.data,'base64'));
    }
    const integration=await evaluate(`(async()=>{
      document.getElementById('endTurn').click();hideTransitions();resetGame();await Promise.resolve();
      const resetSafe=app.mode==='draft'&&app.battle===null;
      applyStarter('rush');for(let i=0;i<3;i++)acquireDraft(app.draftOptions[0]);hideTransitions();await Promise.resolve();
      const preset=app.retryPreset,deck=JSON.stringify(app.draftCards);
      app.battle.actors.boss.hp=1;app.battle.actors.player.mana=5;openCardDetail('slash','player');useCard('slash');await new Promise(r=>setTimeout(r,950));
      const resultShown=!document.getElementById('resultOverlay').hidden;
      document.getElementById('retryButton').click();hideTransitions();await Promise.resolve();
      const replay=app.retryPreset===preset&&JSON.stringify(app.draftCards)===deck&&app.battle.actors.player.hp===20&&app.battle.actors.player.mana===2;
      setCharacterImage(document.getElementById('bossPortrait'),'04_giant_warrior','boss');
      const fallback=document.getElementById('bossPortrait').hidden&&!document.getElementById('bossPortrait').hasAttribute('src');
      const noExcludedPaths=['04_giant_warrior','05_scout'].every(id=>!characterInfo(id).enabled&&Object.keys(characterInfo(id).images).length===0);
      const reserve=document.querySelector('.legacy-slot');reserve.focus();
      const focusTooltip=!document.getElementById('infoTooltip').hidden;
      reserve.click();const tapTooltip=!document.getElementById('infoTooltip').hidden;
      document.getElementById('soundButton').click();
      for(const kind of ['bgm','se']){const input=document.getElementById(kind+'Enabled');input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));}
      const volume=document.getElementById('bgmVolume');volume.value=30;volume.dispatchEvent(new Event('input',{bubbles:true}));
      const audioSettings=!GameAudio.getState().bgm&&!GameAudio.getState().se&&GameAudio.getState().bgmVolume===.3;
      document.getElementById('resetButton').click();
      return {resetSafe,resultShown,replay,fallback,noExcludedPaths,focusTooltip,tapTooltip,audioSettings,newRun:app.mode==='draft'&&app.draftCards.length===0};
    })()`);
    const result={reports,integration,errors};fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
    if(errors.length||reports.some(r=>r.mode!=='battle'||r.cards!==5||r.outside||r.overflow||!r.detail||(r.width>760&&(!r.controlsVisible||!r.legacyVisible))||!r.loadedImage)||Object.values(integration).some(v=>v!==true))process.exitCode=1;
    await send('Browser.close');
  }finally{if(ws)ws.close();child.kill();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
