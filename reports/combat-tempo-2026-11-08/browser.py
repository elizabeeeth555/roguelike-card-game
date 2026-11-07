import json,sys,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
D=Path(__file__).resolve().parent;S=D/'screenshots';S.mkdir(exist_ok=True);URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8000/';checks=[];errors=[];http=[];timings=[]
def check(name,ok,**detail):checks.append(dict(name=name,passed=bool(ok),**detail));assert ok,(name,detail)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--mute-audio','--disable-dev-shm-usage']);page=b.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:http.append(dict(url=r.url,status=r.status)) if r.status>=400 else None)
 if URL.startswith('https:'):
  def relay(route):
   with urllib.request.urlopen(urllib.request.Request(route.request.url,headers={'Cache-Control':'no-cache'}),timeout=60) as r:route.fulfill(status=r.status,body=r.read(),content_type=r.headers.get('Content-Type','application/octet-stream'))
  page.route('https://elizabeeeth555.github.io/**',relay)
 def shot(n):page.screenshot(path=str(S/(n+'.png')),full_page=True)
 def init(fast=False):
  page.evaluate("""fast=>{resetGame();app.fastFx=fast;app.draftCards=['slash','heavy_slash','barrier','first_aid','corrosion'];window.trace=[];window.plans=[];
  if(!window.instrumented){window.instrumented=true;const banner=turnMessage;turnMessage=function(label,kind,ms){trace.push({type:'banner-start',kind,time:performance.now(),ms});return banner(label,kind,ms).then(()=>trace.push({type:'banner-end',kind,time:performance.now()}));};const performOriginal=perform;perform=function(action){trace.push({type:'action',...action,actionType:action.type,time:performance.now()});return performOriginal(action);};const result=renderResult;renderResult=function(w){trace.push({type:'result',winner:w,time:performance.now()});return result(w);};}
  initBattle('boss_knight_defense');}""",fast)
  page.wait_for_function('!app.busy',timeout=15000)
 for w,h in [(1366,768),(375,812),(320,844)]:
  page.set_viewport_size(dict(width=w,height=h));page.goto(URL);page.wait_for_function('typeof trialDebug!=="undefined"')
  page.locator('.starter-option').first.click();page.locator('.card-pick').first.click();check('draft-readable-'+str(w),page.locator('#cardDetailText').is_visible());page.locator('#closeCardDetail').click();page.locator('#draftReroll').click();page.locator('#draftSkip').click();check('draft-controls-'+str(w),page.evaluate('app.draftRerolls===1&&app.draftStep===1'))
  init();trace=page.evaluate('trace');starts=[x for x in trace if x['type']=='banner-start'];ends=[x for x in trace if x['type']=='banner-end'];dur=[ends[i]['time']-s['time'] for i,s in enumerate(starts)];check('opening-durations-'+str(w),len(dur)==2 and all(1900<t<2300 for t in dur),durations=dur);timings.append(dict(width=w,opening=dur));check('opening-order-'+str(w),starts[1]['time']-ends[0]['time']>=160)
  check('no-horizontal-overflow-'+str(w),page.evaluate('document.documentElement.scrollWidth<=innerWidth'));check('log-font-'+str(w),page.evaluate('parseFloat(getComputedStyle(document.querySelector(".log-item")).fontSize)>=15'))
  check('skill-name-size-'+str(w),page.evaluate('parseFloat(getComputedStyle(document.querySelector("#hand .card-name")).fontSize)>='+str(16 if w>760 else 12)))
  for root in ['#hand','#enemyDeck']:
   for i in [0,4]:
    card=page.locator(root+' .game-card').nth(i);a=card.bounding_box();card.locator('.card-open').click();detail=page.locator('.inline-card-details').bounding_box();z=card.bounding_box();check('anchor-'+root+'-'+str(i)+'-'+str(w),abs(a['x']-z['x'])<1 and detail['x']>=7 and detail['x']+detail['width']<=w-7)
    if root=='#hand':
     u=page.locator('.card-use:visible').bounding_box();check('use-visible-'+str(i)+'-'+str(w),u['y']+u['height']<=h-7)
    page.evaluate('closeCardDetail()')
  shot('battle-'+str(w));page.locator('#logToggle').click();shot('log-'+str(w));page.locator('#logClose').click()
  page.evaluate("app.battle.actors.player.mana=5;openCardDetail('slash','player')");t0=time.monotonic();page.locator('.card-use:visible').click();page.wait_for_function('!app.busy');check('player-input-budget-'+str(w),time.monotonic()-t0<.9);check('one-use-'+str(w),page.evaluate("app.battle.actors.player.used.filter(id=>id==='slash').length===1"))
 # Actual enemy sequence with enough legal actions; normal and fast.
 for fast in [False,True]:
  init(fast)
  page.evaluate("app.battle.actors.boss.manaCap=5;app.battle.actors.boss.hp=16;const copy=JSON.parse(JSON.stringify(app.battle));GameBattle.execute(copy,{type:'endTurn',side:'player'});window.expectedActions=GamePlanner.plan(copy).actions.map(a=>[a.type,a.id||null]);trace=[];endTurn(true)")
  page.wait_for_function('!app.busy',timeout=20000);trace=page.evaluate('trace');declEnd=next(x for x in trace if x['type']=='banner-end' and x['kind']=='enemy');actions=[x for x in trace if x.get('side')=='boss' and x.get('actionType') in ['card','accelerate']];check('enemy-actions-'+str(fast),len(actions)>=2);check('ai-order-unchanged-'+str(fast),[[a['actionType'],a.get('id')] for a in actions]==page.evaluate('expectedActions'))
  lead=actions[0]['time']-declEnd['time'];gaps=[actions[i+1]['time']-a['time'] for i,a in enumerate(actions[:-1])];check('enemy-lead-'+str(fast),(300 if fast else 650)<=lead<=(650 if fast else 1100),lead=lead);check('enemy-gaps-'+str(fast),all((500 if fast else 850)<=v<=(850 if fast else 1200) for v in gaps),gaps=gaps);timings.append(dict(fast=fast,enemyLead=lead,enemyGaps=gaps))
 # Win/loss: reducer-triggered final hit -> full banner -> result, never overlapping.
 for winner,fast in [('player',False),('boss',False),('player',True)]:
  page.evaluate("""([winner,fast])=>{cancelPresentation();document.getElementById('resultOverlay').hidden=true;app.fastFx=fast;app.mode='battle';app.battle=GameBattle.createState({playerDeck:['great_swing'],bossPresetId:'boss_knight_defense',firstSide:winner});app.battle.actors[winner].deck=['great_swing'];app.battle.actors[winner].mana=5;app.battle.actors[GameBattle.other(winner)].hp=1;trace=[];perform({type:'card',side:winner,id:'great_swing'});}""",[winner,fast])
  page.wait_for_function('!document.getElementById("battleTransition").hidden');page.wait_for_timeout(350);shot('declaration-'+winner+'-'+str(fast));check('result-hidden-during-banner-'+winner+str(fast),page.locator('#resultOverlay').is_hidden());page.wait_for_function('!document.getElementById("resultOverlay").hidden',timeout=10000);trace=page.evaluate('trace');start=next(x for x in trace if x['type']=='banner-start');end=next(x for x in trace if x['type']=='banner-end');result=next(x for x in trace if x['type']=='result');check('result-after-banner-'+winner+str(fast),result['time']>=end['time'] and not page.locator('#battleTransition').is_visible());check('finish-duration-'+winner+str(fast),abs(end['time']-start['time']-(1000 if fast else 2000))<150);check('result-fade-'+winner+str(fast),page.evaluate('parseFloat(getComputedStyle(document.querySelector(".end-dialog")).animationDuration)')==(.24 if fast else .4));timings.append(dict(winner=winner,fast=fast,finishPause=start['time']-trace[0]['time'],declaration=end['time']-start['time']));page.wait_for_timeout(450);shot('result-'+winner+'-'+str(fast))
 page.emulate_media(reduced_motion='reduce');page.evaluate('void turnMessage("YOUR TURN","player",2000)');page.wait_for_timeout(500);check('reduced-motion-readable',page.evaluate('parseFloat(getComputedStyle(document.getElementById("battleTransition")).opacity)>.95'));page.wait_for_timeout(1250);check('declaration-fades-out',page.evaluate('parseFloat(getComputedStyle(document.getElementById("battleTransition")).opacity)<.9'));page.evaluate('hideTransitions()');page.emulate_media(reduced_motion='no-preference')
 init(True);page.evaluate('endTurn(true);resetGame()');page.wait_for_timeout(1700);check('reset-no-residue',page.evaluate('app.mode==="draft"&&document.getElementById("battleTransition").hidden&&document.getElementById("resultOverlay").hidden'));check('no-js-errors',not errors,errors=errors);check('no-http-errors',not http,errors=http);b.close()
(D/'browser-results.json').write_text(json.dumps(dict(checks=checks,timings=timings,errors=errors,httpErrors=http,url=URL),ensure_ascii=False,indent=2));print('PASS',len(checks));print(json.dumps(timings,indent=2))
