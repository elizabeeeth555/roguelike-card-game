'use strict';
// Optional real-Chrome test using CDP and Node's built-in WebSocket.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'.test-artifacts','game-web',process.env.REACT_GAME_BUILD==='1'?'preview':'dev');
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
    for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('[aria-label=プレイヤー]')"))break;await sleep(100);}
    const reports=[];
    for(const [width,height] of [[1366,768],[390,844],[320,812]]){
      await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<761});
      await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent==='再戦').click()");await sleep(100);
      const before=await evaluate("[...document.querySelectorAll('progress')].map(x=>x.value)");
      await evaluate("document.querySelector('[aria-label=プレイヤー] button').click()");await sleep(70);
      const selectedOnly=await evaluate("[...document.querySelectorAll('progress')].map(x=>x.value)");
      await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent==='使用する').click()");await sleep(100);
      const after=await evaluate("[...document.querySelectorAll('progress')].map(x=>x.value)");
      const mana=await evaluate("document.querySelector('[aria-label=プレイヤー]').textContent.includes('MP 1 / 3')");
      await evaluate("document.querySelector('[aria-label=プレイヤー] button').click()");await sleep(60);
      const repeatBlocked=await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent==='使用する').disabled");
      await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent==='ターン終了').click()");await sleep(250);
      const turnAdvanced=await evaluate("document.body.textContent.includes('ラウンド 2')");
      const overflow=await evaluate('document.documentElement.scrollWidth>innerWidth');
      reports.push({width,height,before,selectedOnly,after,mana,repeatBlocked,turnAdvanced,overflow});
      const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(out,`react-game-${width}.png`),Buffer.from(shot.data,'base64'));
      if(JSON.stringify(before)!==JSON.stringify(selectedOnly)||after[0]!==18||!mana||!repeatBlocked||!turnAdvanced||overflow)throw Error('React UI regression '+JSON.stringify(reports.at(-1)));
    }
    fs.writeFileSync(path.join(out,'react-game-browser.json'),JSON.stringify({reports,errors},null,2));
    console.log(JSON.stringify({reports,errors},null,2));if(errors.length)process.exitCode=1;
    await send('Browser.close');
  }finally{if(ws)ws.close();child.kill();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
