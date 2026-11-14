'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const out=path.resolve(__dirname,'../../../.test-artifacts/ui-images');fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){const chrome=spawn(process.env.CHROME_PATH||'/usr/bin/chromium',['--headless=new','--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--remote-debugging-port=0','--user-data-dir='+fs.mkdtempSync(path.join(out,'profile-')),'about:blank'],{stdio:['ignore','ignore','pipe']});let ws;
const {eventText}=await import('../src/first-era/core.ts');
try{const endpoint=await new Promise((resolve,reject)=>{let text='';chrome.on('error',reject);chrome.stderr.on('data',b=>{text+=b;const m=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m)resolve(m[1]);});setTimeout(()=>reject(Error('Chrome timeout')),15000).unref();});ws=new WebSocket(endpoint);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});let seq=0;const pending=new Map(),errors=[],httpErrors=[],consoleErrors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}if(m.method==='Network.responseReceived'&&m.params.response.status>=400)httpErrors.push({url:m.params.response.url,status:m.params.response.status});if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args.map(a=>a.value??a.description).join(' '));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>reject(Error('CDP timeout '+method)),20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,sessionId}));});}
const target=await send('Target.createTarget',{url:'about:blank'}),{sessionId}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true}),call=(m,p)=>send(m,p,sessionId);await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
async function wait(expression){for(let i=0;i<250;i++){if(await evaluate(expression))return;await sleep(30);}throw Error('Condition timed out: '+expression);}
let width=1366;
async function viewport(w,h){width=w;await call('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<761});await sleep(100);}
async function click(selector){const b=await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n||n.disabled)throw Error('Missing/disabled '+${JSON.stringify(selector)});n.scrollIntoView({block:'nearest'});const r=n.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(width<761){await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[b]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await call('Input.dispatchMouseEvent',{type:'mousePressed',...b,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',...b,button:'left',clickCount:1});}await sleep(40);}
async function textClick(text){if(text==='使用する')await wait(`!document.querySelector('dialog[data-animating="true"]')`);await evaluate(`(()=>{const n=[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===${JSON.stringify(text)});if(!n||n.disabled)throw Error('Missing button '+${JSON.stringify(text)});n.click();})()`);await sleep(40);}
async function reload(){await evaluate('window.__reloadMarker=true');await call('Page.reload');await wait(`window.__reloadMarker===undefined&&!!document.querySelector('.title-screen')`);}
async function ready(){await wait(`!!document.querySelector('.title-screen')`);}
async function settled(){await wait(`!document.querySelector('.fade-out,.fade-in')`);if(await evaluate(`!!document.querySelector('.first-era-battle')&&document.querySelector('.battle-controls button:last-child')?.disabled`)){await wait(`!!document.querySelector('.battle-cutin')||document.querySelector('.battle-controls button:last-child')?.disabled===false`);if(await evaluate(`!!document.querySelector('.battle-cutin')`))await textClick('演出スキップ');await wait(`document.querySelector('.battle-controls button:last-child')?.disabled===false`);}}
async function shot(name){const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));}
const url=process.env.FIRST_ERA_URL||'http://127.0.0.1:8071/';
const deck=['first_aid','barrier','battle_spirit','slash','first_era_corrosion'];
await viewport(1366,768);await call('Page.navigate',{url});await ready();await evaluate(`localStorage.setItem('keisei.first-era.progress.v1',JSON.stringify({format:'keisei-first-era',version:1,deck:${JSON.stringify(deck)},firstWin:null}))`);await reload();await click('.title-actions button:last-child');await settled();await textClick('スキル編成');await settled();
assert.equal(await evaluate(`document.querySelectorAll('.deck-catalog .registered-skill-art [data-ui-image]').length`),10);
await shot('deck-1366');await textClick('拠点へ戻る');await settled();await textClick('王に挑む');await settled();
for(const [w,h]of [[1366,768],[1280,720],[390,844],[320,812]]){
 await viewport(w,h);await sleep(100);
 assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth+1`));
 for(const [id,frame,icon]of [['first_aid',30,19],['barrier',31,24],['battle_spirit',32,18],['slash',33,20],['first_era_corrosion',34,16]]){
  assert.ok(await evaluate(`(()=>{const p=document.querySelector('.player-skills [data-skill-id="${id}"]');return !!p.querySelector('[data-ui-image="${frame}"]')&&!!p.querySelector('.skill-symbol [data-ui-image="${icon}"]')&&!!p.querySelector('.skill-cost [data-ui-image="28"]')&&!!p.querySelector('.skill-cd [data-ui-image="27"]');})()`));
 }
 for(const [id,frame]of [['slash',41],['heavy_slash',41],['battle_spirit',36],['feint',38]])assert.ok(await evaluate(`!!document.querySelector('.enemy-area [data-skill-id="${id}"] [data-ui-image="${frame}"]')`));
 assert.equal(await evaluate(`document.querySelectorAll('.health-frame-art[data-ui-image="9"]').length`),2);
 assert.ok(await evaluate(`!!document.querySelector('.stagger-frame-art[data-ui-image="1"]')&&!!document.querySelector('.ultimate-frame-art[data-ui-image="14"]')`));
 await shot('battle-'+w);await click('.player-skills [data-skill-id=slash] .skill-open');await wait(`!!document.querySelector('dialog[open]')`);
 assert.ok(await evaluate(`(()=>{const d=document.querySelector('dialog[open]'),r=d.getBoundingClientRect();return !!d.querySelector('[data-ui-image="10"]')&&!!d.querySelector('.detail-illustration [data-ui-image="20"]')&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;})()`));
 await shot('detail-'+w);await textClick('閉じる');
 // Image overlays must never intercept pointer input.
 assert.ok(await evaluate(`[...document.querySelectorAll('.ui-image')].every(n=>getComputedStyle(n).pointerEvents==='none')`));
}
const assets=require('../ui-image-assets.json');
for(const image of Object.values(assets)){const relative='public-game/first-era/ui/'+image.path.slice('assets/ui/'.length);const bytes=Buffer.from(await(await fetch(new URL(relative,url))).arrayBuffer());assert.deepEqual(bytes,fs.readFileSync(path.resolve(__dirname,'../../..',image.path)));}
assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);assert.deepEqual(consoleErrors,[]);
const report={passed:true,viewports:[1366,1280,390,320],tenDeckIcons:true,playerAndBossFrames:true,hpStaggerUltimate:true,detailFrame:true,pointerEventsSafe:true,servedOriginals:33,errors,httpErrors,consoleErrors};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{ws?.close();chrome.kill();}}main().catch(e=>{console.error(e);process.exitCode=1;});
