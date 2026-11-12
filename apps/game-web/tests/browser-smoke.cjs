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
    const previewChecks=[],designChecks=[],studioChecks=[];
    if(process.env.REACT_GAME_BUILD!=='1'){
      // A separate entry: no classic core scripts, host, session or planner needed.
      const previewURL=new URL('dev-preview.html',process.env.REACT_GAME_URL||'http://127.0.0.1:5173/').href;
      for(const width of [1366,1280,761,760,430,390,375,320]){
        await call('Emulation.setDeviceMetricsOverride',{width,height:width>760?768:844,deviceScaleFactor:1,mobile:width<=760});
        await call('Page.navigate',{url:previewURL});
        for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('.preview-tools')"))break;await sleep(50);}
        const noCore=await evaluate("typeof GameBattle==='undefined'&&typeof GamePlanner==='undefined'&&!performance.getEntriesByType('resource').some(r=>r.name.includes('/engine/'))");
        if(!noCore)throw Error('Preview loaded battle core');
        for(const preset of ['通常戦闘','特殊状態']){
          await clickText(preset);await evaluate('scrollTo(0,0)');
          const before=await snapshot();
          const layout=await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth,slots:document.querySelectorAll('.player-skills>.skill,.player-skills>.empty-skill-slot').length,disabled:[...document.querySelectorAll('.battle-controls button,.battle-header button')].every(b=>b.disabled),images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),labels:[...document.querySelectorAll('.player-area .skill-state')].map(e=>e.textContent)})`);
          if(layout.overflow||layout.slots!==5||!layout.disabled||!layout.images)throw Error('Preview layout '+width+JSON.stringify(layout));
          if(preset==='特殊状態'&&!['MP不足','CD中 1T','使用済'].every(t=>layout.labels.includes(t)))throw Error('Special preset states');
          await tap('.player-area .skill-open',width<=760);
          if(!await evaluate("!!document.querySelector('dialog[open]')&&![...document.querySelectorAll('dialog button')].some(b=>b.textContent==='使用する')"))throw Error('Preview execution control');
          await clickText('閉じる');
          if(before!==await snapshot())throw Error('Preview changed battle');
          await evaluate('scrollTo(0,0)');
          if([1366,390,320].includes(width)){const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(out,`preview-${preset==='通常戦闘'?'normal':'special'}-${width}.png`),Buffer.from(shot.data,'base64'));}
          previewChecks.push({width,preset,noCore,...layout});
        }
        await evaluate("(()=>{const e=document.getElementById('studio-skillGap');e.scrollIntoView({block:'center'});e.focus();e.select();})()");
        await call('Input.insertText',{text:'8'});await sleep(80);
        const editorResponsive=await evaluate("({gap:getComputedStyle(document.querySelector('.studio-preview .player-skills')).gap,inside:[...document.querySelectorAll('.studio-panel input')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}),overflow:document.documentElement.scrollWidth>innerWidth})");
        if(editorResponsive.gap!=='8px'||!editorResponsive.inside||editorResponsive.overflow)throw Error('Responsive editor '+width+JSON.stringify(editorResponsive));
        await evaluate("document.querySelector('button[aria-label=スキル間隔を既定に戻す]').click()");await sleep(60);
        if(!await evaluate("getComputedStyle(document.querySelector('.studio-preview .player-skills')).gap===(innerWidth>1000?'7px':'4px')"))throw Error('Responsive default reset '+width);
        studioChecks.push({width,responsiveEdit:true,...editorResponsive});
      }
      // Studio editing, persistence and actual file export/import on the shared view.
      const downloadDir=fs.mkdtempSync(path.join(out,'studio-download-'));
      await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir,eventsEnabled:true});
      const setInput=async(key,text)=>{
        await evaluate(`(()=>{const e=document.getElementById('studio-'+${JSON.stringify(key)});e.scrollIntoView({block:'center'});e.focus();e.select();})()`);
        await call('Input.insertText',{text});await sleep(80);
      };
      const designStyle=()=>evaluate("({hud:getComputedStyle(document.querySelector('.studio-preview .battle-hud')).backgroundColor,border:getComputedStyle(document.querySelector('.studio-preview .skill')).borderColor,gap:getComputedStyle(document.querySelector('.studio-preview .player-skills')).gap,scale:getComputedStyle(document.querySelector('.studio-preview .boss-portrait')).transform})");
      const upload=async(file)=>{
        const {root:doc}=await call('DOM.getDocument');const {nodeId}=await call('DOM.querySelector',{nodeId:doc.nodeId,selector:'input[type=file]'});
        await call('DOM.setFileInputFiles',{nodeId,files:[file]});await sleep(150);
      };
      for(const width of [1366,390]){
        await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<=760});
        await call('Page.navigate',{url:previewURL});await sleep(250);
        await clickText('すべて既定に戻す');
        await evaluate("localStorage.setItem('game-progress','preserved')");
        const defaults=await designStyle();
        for(const [key,value] of Object.entries({hudBackground:'#123456',skillBorderColor:'#abcdef',skillGap:'9',bossScale:'0.8'}))await setInput(key,value);
        const edited=await designStyle();
        if(edited.hud!=='rgb(18, 52, 86)'||edited.border!=='rgb(171, 205, 239)'||edited.gap!=='9px'||!edited.scale.startsWith('matrix(0.8,'))throw Error('Editor settings '+JSON.stringify(edited));
        await clickText('特殊状態');if(JSON.stringify(await designStyle())!==JSON.stringify(edited))throw Error('Preset lost design');
        await call('Page.reload');await sleep(300);
        if(JSON.stringify(await designStyle())!==JSON.stringify(edited))throw Error('Autosave reload');
        await setInput('skillGap','99');
        if(!await evaluate("document.getElementById('studio-skillGap').getAttribute('aria-invalid')==='true'")||JSON.stringify(await designStyle())!==JSON.stringify(edited))throw Error('Invalid edit applied');
        await clickText('ローカル保存');
        await clickText('JSONを書き出す');
        for(let i=0;i<50&&!fs.readdirSync(downloadDir).some(f=>f.endsWith('.json'));i++)await sleep(100);
        const exported=fs.readdirSync(downloadDir).filter(f=>f.endsWith('.json')).map(f=>path.join(downloadDir,f)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];
        if(!exported)throw Error('JSON download missing');
        const document=JSON.parse(fs.readFileSync(exported,'utf8'));
        if(document.format!=='throne-studio.battle-design'||document.version!==1||document.settings.skillGap!==9)throw Error('Export envelope');
        await clickText('すべて既定に戻す');if(JSON.stringify(await designStyle())!==JSON.stringify(defaults))throw Error('Editor reset');
        await upload(exported);if(JSON.stringify(await designStyle())!==JSON.stringify(edited))throw Error('JSON import roundtrip');
        await call('Page.reload');await sleep(300);if(JSON.stringify(await designStyle())!==JSON.stringify(edited))throw Error('Imported settings not autosaved');
        for(const [index,text] of ['{',JSON.stringify({...document,format:'fx-lab'}),JSON.stringify({...document,version:2}),JSON.stringify({...document,settings:{skillGap:99}}),JSON.stringify({...document,settings:{css:'display:none'}})].entries()){
          const file=path.join(downloadDir,`bad-${width}-${index}.json`);fs.writeFileSync(file,text);await upload(file);
          if(!await evaluate("!!document.querySelector('[role=alert]')")||JSON.stringify(await designStyle())!==JSON.stringify(edited))throw Error('Invalid import discarded edits');
        }
        await evaluate("document.querySelector('button[aria-label=HUD背景色を既定に戻す]').click()");await sleep(80);
        const individual=await designStyle();if(individual.hud!==defaults.hud||individual.gap!=='9px')throw Error('Per-field reset');
        // Clear a numeric field, respecting the current responsive CSS default.
        await setInput('skillGap','');if((await designStyle()).gap!==defaults.gap)throw Error('Responsive CSS default');
        await clickText('特殊状態');await evaluate("document.activeElement?.blur();document.querySelector('.studio-panel').scrollTop=0;scrollTo(0,0)");
        const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(out,`studio-edit-${width}.png`),Buffer.from(shot.data,'base64'));
        if(await evaluate("localStorage.getItem('game-progress')")!=='preserved')throw Error('Game save overwritten');
        studioChecks.push({width,edited,reload:true,jsonRoundtrip:true,invalidImportPreserves:true,individualReset:true,gameSavePreserved:true});
      }
      await evaluate("localStorage.setItem('throne-studio.battle-design.v1','{')");await call('Page.reload');await sleep(250);
      if(!await evaluate("!!document.querySelector('[role=alert]')&&localStorage.getItem('throne-studio.battle-design.v1')==='{'"))throw Error('Corrupt startup document overwritten');
      await setInput('skillGap','6');if((await designStyle()).gap!=='6px')throw Error('Corrupt storage prevents editing');
      studioChecks.push({corruptStartupPreserved:true,editingWorks:true});
      // Storage failures must not block the editor or shared renderer.
      const blocked=await call('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError')}})"});
      await call('Page.navigate',{url:previewURL});await sleep(250);await setInput('skillGap','8');
      if((await designStyle()).gap!=='8px'||!await evaluate("document.querySelector('[role=alert]').textContent.includes('ローカル保存')"))throw Error('Blocked storage prevents editing');
      studioChecks.push({storageUnavailable:true,editingWorks:true});
      await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:blocked.identifier});
      // Mount the very same view in a test-only host; no production debug hook.
      await evaluate("import('/tests/view-browser-harness.tsx')");
      for(const width of [1366,761,760,390,320]){
        await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<=760});
        const render=async expression=>{await evaluate(`import('/tests/view-browser-harness.tsx').then(m=>m.render(${expression}))`);await sleep(80);};
        const measure=()=>evaluate(`(()=>{const hud=document.querySelector('.battle-hud'),skill=document.querySelector('.skill'),row=document.querySelector('.player-skills'),boss=document.querySelector('.boss-portrait'),r=document.querySelector('.battle-field').getBoundingClientRect();return {hud:getComputedStyle(hud).backgroundColor,border:getComputedStyle(skill).borderColor,gap:getComputedStyle(row).gap,scale:getComputedStyle(boss).transform,width:r.width,height:r.height,overflow:document.documentElement.scrollWidth>innerWidth};})()`);
        await render("'normal'");const defaults=await measure();
        // Compare the four pre-refactor declarations on the same DOM (no Git/runtime dependency).
        await evaluate(`(()=>{const e=document.createElement('style');e.id='baseline-css';e.textContent=${JSON.stringify('.battle-hud{background:#0b1525d9}.skill{border-color:#8897ab}.skills{gap:7px}.boss-portrait{transform:none}@media(max-width:1000px){.skills{gap:4px}}')};document.head.append(e)})()`);
        const baseline=await measure();await evaluate("document.getElementById('baseline-css').remove()");
        for(const key of ['hud','border','gap','width','height','overflow'])if(defaults[key]!==baseline[key])throw Error('Default style parity '+width+' '+key);
        await render("'normal',{hudBackground:'#123456',skillBorderColor:'#abcdef',skillGap:9,bossScale:0.75},'変更した仮データ'");
        const changed=await measure();
        if(changed.hud!=='rgb(18, 52, 86)'||changed.border!=='rgb(171, 205, 239)'||changed.gap!=='9px'||!changed.scale.startsWith('matrix(0.75,')||changed.overflow)throw Error('Design settings '+JSON.stringify(changed));
        if(!await evaluate("document.querySelector('.player-area h2').textContent==='変更した仮データ'"))throw Error('View data did not update');
        await render("'normal',{hudBackground:'url(https://invalid.example)',skillGap:-5,bossScale:0,skillBorderColor:'red;display:none'}");
        const invalid=await measure();if(JSON.stringify(invalid)!==JSON.stringify(defaults))throw Error('Invalid settings did not fallback');
        await render("'normal'");const reset=await measure();if(JSON.stringify(reset)!==JSON.stringify(defaults))throw Error('Default reset');
        for(const [skillGap,bossScale] of [[0,0.5],[12,1.25]]){
          await render(`'normal',{skillGap:${skillGap},bossScale:${bossScale}}`);
          if((await measure()).overflow)throw Error('Design bounds overflow '+width);
        }
        designChecks.push({host:'preview',width,defaults,baseline,changed,invalid,reset});
      }
    }
    if(process.env.REACT_GAME_BUILD!=='1'){
      await call('Page.navigate',{url:process.env.REACT_GAME_URL||'http://127.0.0.1:5173/'});
      for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('.player-area')"))break;await sleep(50);}
      await evaluate("import('/tests/view-browser-harness.tsx')");
      for(const width of [1366,390]){
        await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<=760});
        const render=async setting=>{await evaluate(`import('/tests/view-browser-harness.tsx').then(m=>m.renderGame(${setting}))`);await sleep(80);};
        const measure=()=>evaluate("({hud:getComputedStyle(document.querySelector('.battle-hud')).backgroundColor,border:getComputedStyle(document.querySelector('.skill')).borderColor,gap:getComputedStyle(document.querySelector('.player-skills')).gap,scale:getComputedStyle(document.querySelector('.boss-portrait')).transform})");
        await render('undefined');const defaults=await measure();
        await render("{hudBackground:'#123456',skillBorderColor:'#abcdef',skillGap:9,bossScale:0.75}");const changed=await measure();
        if(changed.hud!=='rgb(18, 52, 86)'||changed.border!=='rgb(171, 205, 239)'||changed.gap!=='9px'||!changed.scale.startsWith('matrix(0.75,'))throw Error('Game host settings');
        await render('undefined');const reset=await measure();
        if(JSON.stringify(reset)!==JSON.stringify(defaults))throw Error('Game host default reset');
        designChecks.push({host:'game',width,defaults,changed,reset});
      }
    }
    fs.writeFileSync(path.join(out,'react-battle-browser.json'),JSON.stringify({reports,accelerationChecks,fixtures,previewChecks,designChecks,studioChecks,errors},null,2));console.log(JSON.stringify({reports,accelerationChecks,fixtures,previewChecks,designChecks,studioChecks,errors},null,2));
    if(errors.length)process.exitCode=1;
    await send('Browser.close');
  }finally{if(ws)ws.close();child.kill();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
