'use strict';
// Optional real-Chrome test using CDP and Node's built-in WebSocket.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'.test-artifacts','react-battle-ui',process.env.REACT_GAME_BUILD==='1'?'preview':'dev');
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


    await call('Page.navigate',{url:process.env.REACT_GAME_URL||'http://127.0.0.1:5173/'});
    for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('.player-area')"))break;await sleep(100);}
    const reports=[];
    const snapshot=()=>evaluate("JSON.stringify({hp:[...document.querySelectorAll('progress')].map(n=>n.value),mp:[...document.querySelectorAll('.resource')].map(n=>n.textContent),round:document.querySelector('.turn-label').textContent})");
    const clickText=async(text,scope='document')=>{await evaluate(`[...${scope}.querySelectorAll('button')].find(b=>b.textContent===${JSON.stringify(text)}).click()`);await sleep(60);};
    async function tap(selector,mobile){
      const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      if(mobile){await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
      else {await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});}
      await sleep(70);
    }
    for(const [width,height] of [[1366,768],[1280,720],[761,900],[320,812],[375,812],[390,844],[430,932],[760,900]]){
      const mobile=width<=760;
      await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
      if(mobile)await call('Emulation.setTouchEmulationEnabled',{enabled:true});await sleep(80);
      await clickText('再戦');await evaluate('scrollTo(0,0)');
      const initial=await snapshot();
      if(width===1366){
        await evaluate('document.activeElement?.blur()');
        for(const [key,code,vk] of [['1','Digit1',49],['Escape','Escape',27],[' ','Space',32],['Escape','Escape',27]]){
          await call('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:vk});await call('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk});await sleep(60);
          if(key==='1'&&!await evaluate("!!document.querySelector('dialog[open]')"))throw Error('Keyboard selection');
          if(code==='Space'&&!await evaluate("!!document.querySelector('dialog[aria-label=ターン終了の確認][open]')"))throw Error('Keyboard end confirmation');
          if(key==='Escape'&&await evaluate("!!document.querySelector('dialog[open]')"))throw Error('Escape cancel');
        }
        if(initial!==await snapshot())throw Error('Keyboard inspection changed battle');
      }
      // Focus is read-only on both sides, including unavailable enemy skills.
      await evaluate("document.querySelector('.enemy-area .skill-open').focus()");await sleep(60);
      const focus=await evaluate("!!document.querySelector('[role=tooltip]')");
      if(!focus||initial!==await snapshot())throw Error('Focus changed state '+width);
      if(!mobile){
        const point=await evaluate("(()=>{const r=document.querySelector('.player-area .skill-open').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
        await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});await call('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await sleep(60);
        if(!await evaluate("!!document.querySelector('[role=tooltip]')")||initial!==await snapshot())throw Error('Hover '+width+' '+JSON.stringify(await evaluate("({hover:matchMedia('(hover:hover)').matches,dialog:!!document.querySelector('dialog[open]'),tip:!!document.querySelector('[role=tooltip]'),rect:document.querySelector('.player-area .skill-open').getBoundingClientRect().toJSON(),scrollY,at:document.elementFromPoint(320,600)?.outerHTML.slice(0,200)})")));
      }
      await tap('.enemy-area .skill:last-child .skill-open',mobile);
      const enemyReadOnly=await evaluate("!!document.querySelector('dialog[open]')&&![...document.querySelectorAll('dialog button')].some(b=>b.textContent==='使用する')");
      if(!enemyReadOnly||initial!==await snapshot())throw Error('Enemy inspection '+width);
      await clickText('閉じる');
      await tap('.player-area .skill-open',mobile);
      const modal=await evaluate("(()=>{const r=document.querySelector('dialog[open]').getBoundingClientRect();return {inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,description:document.querySelector('dialog').textContent.includes('敵に2ダメージ')};})()");
      if(!modal.inside||!modal.description||initial!==await snapshot())throw Error('Selection modified state '+width);
      if(width===390){const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(out,'skill-detail-390.png'),Buffer.from(shot.data,'base64'));}
      await clickText('閉じる');if(initial!==await snapshot())throw Error('Cancel '+width);
      await clickText('ターン終了');
      if(!await evaluate("!!document.querySelector('dialog[open][aria-label=ターン終了の確認]')"))throw Error('Missing confirmation '+width);
      await clickText('戻る');if(initial!==await snapshot())throw Error('End cancel '+width);
      await tap('.player-area .skill-open',mobile);await clickText('使用する');
      const used=await evaluate("document.querySelector('.player-area .skill-state').textContent==='使用済'");
      const after=JSON.parse(await snapshot());if(!used||after.hp[0]!==18||!after.mp[1].includes('1 / 3'))throw Error('Card action '+width+JSON.stringify(after));
      await tap('.player-area .skill-open',mobile);
      if(!await evaluate("[...document.querySelectorAll('dialog button')].find(b=>b.textContent==='使用する').disabled"))throw Error('Repeat allowed '+width);
      await clickText('閉じる');await clickText('ターン終了');await clickText('終了する');
      if(!await evaluate("document.querySelector('.turn-label').textContent.includes('ROUND 2')"))throw Error('AI turn '+width);
      await clickText('再戦');if(initial!==await snapshot())throw Error('Replay '+width);
      const layout=await evaluate(`(()=>{document.activeElement?.blur();scrollTo(0,0);const row=document.querySelector('.player-skills').getBoundingClientRect(),set=document.querySelector('.player-skill-set').getBoundingClientRect();const slots=document.querySelectorAll('.player-skills>.skill,.player-skills>.empty-skill-slot').length;const cards=[...document.querySelectorAll('.skill-open')],fields=[...document.querySelectorAll('.skill-name,.skill-cost,.skill-cd')];return {normalSlots:slots,legacyAbsent:!document.querySelector('.legacy-slot')&&!document.body.textContent.includes('継承専用'),rowUsesFullWidth:Math.abs(row.width-set.width)<1,overflow:document.documentElement.scrollWidth>innerWidth,cardsInside:cards.every(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}),images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),desktopFits:innerWidth<=760||document.documentElement.scrollHeight<=innerHeight,fieldsInside:fields.every(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth})};})()`);
      const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(out,`react-battle-${width}.png`),Buffer.from(shot.data,'base64'));
      if(layout.normalSlots!==5||!layout.legacyAbsent||!layout.rowUsesFullWidth||layout.overflow||!layout.cardsInside||!layout.images||!layout.desktopFits||!layout.fieldsInside)throw Error('Layout '+width+JSON.stringify(layout));
      reports.push({width,height,focus,enemyReadOnly,modal,used,...layout});
    }
    const accelerationChecks=[];
    for(const width of [1366,390]){
      await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<=760});
      await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent==='再戦').click()");await sleep(60);
      const read=()=>evaluate("({pending:document.querySelector('.player-area .status-effects').textContent.includes('加速予約'),mp:document.querySelector('.player-area .resource').textContent})");
      const before=await read();
      await evaluate("document.querySelector('.battle-controls button').click()");await sleep(60);
      const pending=await read();
      await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent==='ターン終了').click()");await sleep(100);
      const next=await read();
      if(before.pending||!pending.pending||!pending.mp.includes('0 / 3')||next.pending||!next.mp.includes('4 / 4'))throw Error('Acceleration view '+JSON.stringify({width,before,pending,next}));
      accelerationChecks.push({width,before,pending,next});
    }

    // Browser-only initial-state fixtures. No production debug hook or core-file change.
    const fixtures=[];
    for(const kind of ['states','victory','defeat','no-actions']){
      const fixture=await call('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{let api;Object.defineProperty(window,'GameBattle',{configurable:true,get:()=>api,set:original=>{api={...original,createState(options){const state=original.createState(${kind==='states'?"{...options,playerDeck:['slash','great_swing','barrier','battle_spirit','heart_corrosion']}":'options'});${kind==='states'?"Object.assign(state.actors.player,{barrier:4,poison:1,weak:2,attackBonus:1,setupBonus:2,manaPenalty:1});state.actors.player.readyOn.barrier=2;state.actors.player.readyOn.battle_spirit=3;":kind==='victory'?'state.actors.boss.hp=1;':kind==='defeat'?'state.actors.player.hp=1;':'state.actors.player.mana=0;'}return state;}};}});})();`});
      await call('Page.navigate',{url:process.env.REACT_GAME_URL||'http://127.0.0.1:5173/'});
      for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('.player-area')"))break;await sleep(50);}
      await call('Emulation.setDeviceMetricsOverride',{width:320,height:812,deviceScaleFactor:1,mobile:true});await sleep(80);
      let passed=false;
      if(kind==='states'){
        passed=await evaluate(`(()=>{const labels=[...document.querySelectorAll('.player-area .skill-state')].map(n=>n.textContent);const effects=document.querySelector('.player-area .status-effects').textContent;return labels.includes('CD中 1T')&&labels.includes('CD中 2T')&&labels.includes('MP不足')&&labels.includes('条件未達')&&['バリア 4','毒 1','弱体 2','攻撃強化 1','次ターン強化 2','MP妨害 1'].every(t=>effects.includes(t))&&document.querySelectorAll('.player-area .skill-open').length===5&&document.documentElement.scrollWidth===innerWidth;})()`);
        const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(out,'five-skill-states-320.png'),Buffer.from(shot.data,'base64'));
        const statusBefore=await snapshot();
        for(const id of ['great_swing','barrier','battle_spirit','heart_corrosion']){
          await tap(`.player-area [data-skill-id="${id}"] .skill-open`,true);
          passed=passed&&await evaluate("[...document.querySelectorAll('dialog button')].find(b=>b.textContent==='使用する').disabled");
          await clickText('閉じる');
        }
        passed=passed&&statusBefore===await snapshot();
      }else if(kind==='victory'){
        await tap('.player-area .skill-open',true);await clickText('使用する');
        passed=await evaluate("document.querySelector('.turn-label').textContent.includes('勝利')&&[...document.querySelectorAll('nav button')].every(b=>b.disabled)");
        await clickText('再戦');passed=passed&&await evaluate("!document.querySelector('.turn-label').textContent.includes('勝利')");
      }else{
        await clickText('ターン終了');
        if(kind==='defeat')await clickText('終了する');
        passed=await evaluate(kind==='defeat'?"document.querySelector('.turn-label').textContent.includes('敗北')":"!document.querySelector('dialog[open]')&&document.querySelector('.turn-label').textContent.includes('ROUND 2')");
      }
      fixtures.push({kind,passed});await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:fixture.identifier});
      if(!passed)throw Error('Fixture '+kind);
    }
    fs.writeFileSync(path.join(out,'react-battle-browser.json'),JSON.stringify({reports,accelerationChecks,fixtures,errors},null,2));console.log(JSON.stringify({reports,accelerationChecks,fixtures,errors},null,2));
    if(errors.length)process.exitCode=1;
    await send('Browser.close');
  }finally{if(ws)ws.close();child.kill();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
