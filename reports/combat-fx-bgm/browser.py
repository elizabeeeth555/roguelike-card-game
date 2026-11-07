"""Presentation integration checks. Run against python3 -m http.server 18080."""
import json,platform,time
from pathlib import Path
from playwright.sync_api import sync_playwright
D=Path(__file__).resolve().parent;S=D/'screenshots';S.mkdir(exist_ok=True);checks=[];errors=[];failed=[]
def check(name,ok,**data):
 checks.append(dict(name=name,passed=bool(ok),**data));assert ok,(name,data)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio']);page=b.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:failed.append(dict(url=r.url,failure=r.failure)));page.on('response',lambda r:failed.append(dict(url=r.url,failure='HTTP '+str(r.status))) if r.status>=400 else None)
 def init():
  page.evaluate("resetGame();app.fastFx=false;app.draftCards=['great_swing','setup','first_aid','barrier','corrosion'];initBattle('boss_knight_defense')")
  page.wait_for_function('!app.busy');page.evaluate('app.battle.actors.player.mana=5;render()')
 def shot(n):page.screenshot(path=str(S/(n+'.png')),full_page=True)
 for w,h in [(320,844),(360,800),(390,844),(430,932),(768,1024),(1366,768)]:
  page.set_viewport_size(dict(width=w,height=h));page.goto('http://127.0.0.1:18080/');page.wait_for_function('typeof trialDebug!=="undefined"')
  # Replacement: detail is informational; explicit confirm alone exchanges.
  page.evaluate("applyStarter(GameData.STARTERS[0].id);app.draftCards=['slash','setup','barrier','fortress','first_aid'];app.draftOptions=['great_swing','corrosion','battle_spirit'];renderDraft();openCardDetail('great_swing','draft')")
  check(f'choose-label-{w}',page.locator('#confirmCard').inner_text()=='このスキルを選択');page.locator('#confirmCard').click()
  check(f'replace-info-{w}',page.locator('#draftReplaceOptions .card-description').count()==5 and page.locator('#draftActions').is_hidden())
  before=page.evaluate('JSON.stringify([app.draftCards,app.draftStep,app.draftRerolls])');page.locator('#draftReplaceOptions .card-open').first.click()
  check(f'owned-detail-{w}',page.locator('#confirmCard').is_hidden() and page.locator('#cardDetailText').inner_text()!='');page.locator('#closeCardDetail').click()
  if w in [390,1366]:shot(f'replacement-{w}')
  page.locator('#draftReplaceCancel').click();check(f'cancel-preserves-{w}',before==page.evaluate('JSON.stringify([app.draftCards,app.draftStep,app.draftRerolls])') and page.locator('#draftActions').is_visible())
  page.evaluate("acquireDraft('great_swing')");page.locator('#draftReplaceOptions .replace-confirm').first.click();check(f'replaced-{w}',page.evaluate("app.draftCards.includes('great_swing')&&app.draftStep===1"))
  init()
  for side,root in [('player','#hand'),('boss','#enemyDeck')]:
   for i in [0,4]:
    panel=page.locator(root+' .game-card').nth(i);a=panel.bounding_box();panel.locator('.card-open').click();z=panel.bounding_box();detail=page.locator('.inline-card-details').bounding_box()
    check(f'anchored-{w}-{side}-{i}',abs(a['x']-z['x'])<1 and abs(a['y']-z['y'])<1 and abs(a['width']-z['width'])<1 and detail['x']>=7 and detail['x']+detail['width']<=w-7 and detail['y']>=7 and detail['y']+detail['height']<=h-7,a=a,z=z,detail=detail)
    if side=='player':
     u=page.locator('.card-use:visible').bounding_box();check(f'use-in-view-{w}-{i}',u['x']>=7 and u['x']+u['width']<=w-7 and u['y']>=7 and u['y']+u['height']<=h-7,use=u)
    if w==390:shot(f'{side}-edge-{i}')
    page.evaluate('closeCardDetail()')
  # Major impact releases controls while independent particle nodes remain.
  page.evaluate("openCardDetail('great_swing','player');useCard('great_swing');useCard('great_swing')")
  check(f'one-use-{w}',page.evaluate("app.battle.actors.boss.hp===14&&app.battle.actors.player.used.length===1"))
  page.wait_for_timeout(80)
  if w in [390,1366]:shot(f'impact-{w}')
  page.wait_for_function('!app.busy');check(f'trails-nonblocking-{w}',page.evaluate('combatFxNodes.size>0&&!app.busy'))
  page.evaluate("openCardDetail('barrier','player');useCard('barrier')");page.wait_for_function('!app.busy');check(f'next-action-{w}',page.evaluate('app.battle.actors.player.barrier===3'))
  page.evaluate("resetGame()");page.wait_for_timeout(1000);check(f'cleanup-{w}',page.evaluate('combatFxNodes.size===0&&document.querySelectorAll(".combat-fx").length===0'))
  check(f'overflow-{w}',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 # Setting persistence and reduced-motion behavior.
 page.locator('#settingsButton').click();page.locator('#fxModeButton').click();page.reload();page.wait_for_function('typeof trialDebug!=="undefined"');check('setting-persisted',page.evaluate("app.fxMode==='light'"));init();page.emulate_media(reduced_motion='reduce');page.evaluate("combatFx('slash','boss',6)");check('reduced-motion',page.locator('.combat-fx.fx-light').count()>0);page.emulate_media(reduced_motion='no-preference');page.evaluate("app.fxMode='standard';clearCombatFx()")
 # Compare each side/every skill reducer state with UI-mediated result.
 results=page.evaluate("""()=>{const results=[];for(const side of ['player','boss'])for(const id of Object.keys(GameData.CARDS)){cancelPresentation();app.mode='battle';app.battle=GameBattle.createState({playerDeck:[id],bossPresetId:'boss_knight_defense',firstSide:side});for(const key of ['player','boss']){const a=app.battle.actors[key];a.deck=[id];a.mana=5;a.manaCap=5;a.hp=12;a.poison=2;a.barrier=2;}const expected=JSON.parse(JSON.stringify(app.battle));GameBattle.execute(expected,{type:'card',side,id});const result=perform({type:'card',side,id});results.push({side,id,ok:result.ok,equal:JSON.stringify(expected)===JSON.stringify(app.battle)});}return results;}""")
 for r in results:check('reducer-'+r['side']+'-'+r['id'],r['ok'] and r['equal'])
 for winner in ['player','boss']:
  page.evaluate("""winner=>{cancelPresentation();app.mode='battle';app.battle=GameBattle.createState({playerDeck:['great_swing'],bossPresetId:'boss_knight_defense',firstSide:winner});app.battle.actors[winner].deck=['great_swing'];app.battle.actors[winner].mana=5;app.battle.actors[GameBattle.other(winner)].hp=1;perform({type:'card',side:winner,id:'great_swing'});}""",winner)
  check('ended-reason-'+winner,page.locator('#accelerateReason').inner_text()=='戦闘終了');page.wait_for_timeout(1000);check('end-clean-'+winner,page.evaluate('combatFxNodes.size===0'));page.evaluate('retryBattle()');page.wait_for_function('!app.busy');check('retry-'+winner,page.evaluate('!app.battle.end&&combatFxNodes.size===0'))
 # SFX media metadata; this is decoding verification, NOT listening.
 media=page.evaluate("""async()=>{const paths=[...new Set(Object.entries(GAME_ASSETS.sounds).filter(([k])=>k.startsWith('fx_')).map(([,v])=>v))];return Promise.all(paths.map(path=>new Promise(resolve=>{const a=new Audio();const timeout=setTimeout(()=>resolve({path,ok:false,error:'timeout'}),5000);a.onloadedmetadata=()=>{clearTimeout(timeout);resolve({path,ok:a.duration>0,duration:a.duration})};a.onerror=()=>{clearTimeout(timeout);resolve({path,ok:false})};a.src=path;a.preload='metadata';})));}""")
 check('sound-decode',all(m['ok'] for m in media),media=media)
 check('no-js-errors',not errors,errors=errors);check('no-unexpected-request-failures',not [f for f in failed if f['failure']!='net::ERR_ABORTED'],failed=failed)
 # Local performance sample, not a smartphone benchmark.
 perf=page.evaluate("""()=>{const times=[];cancelPresentation();app.mode='battle';app.battle=GameBattle.createState({playerDeck:['slash'],bossPresetId:'boss_knight_defense'});for(let i=0;i<100;i++){const start=performance.now();combatFx('slash','boss',6);times.push(performance.now()-start);}const sorted=times.slice().sort((a,b)=>a-b);const out={samples:times.length,meanMs:times.reduce((a,b)=>a+b)/times.length,p95Ms:sorted[94],maxMs:sorted.at(-1),nodes:combatFxNodes.size};resetGame();return out;}""")
 b.close()
(D/'integration-results.json').write_text(json.dumps({'checks':checks,'errors':errors,'failedRequests':failed,'media':media},ensure_ascii=False,indent=2));(D/'performance.json').write_text(json.dumps({'environment':platform.platform(),'browser':'Chromium headless, desktop Linux, no CPU throttle','fxEmission':perf,'limitations':'実機・聴感・GPUフレームレートは未計測'},ensure_ascii=False,indent=2));print('PASS',len(checks),perf)
