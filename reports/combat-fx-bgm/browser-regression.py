import json
from pathlib import Path
from playwright.sync_api import sync_playwright
D=Path(__file__).resolve().parent;S=D/'screenshots';S.mkdir(exist_ok=True);checks=[];errors=[]
def check(name,passed,**data):
 checks.append(dict(name=name,passed=bool(passed),**data));assert passed,(name,data)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio']);page=b.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 def shot(name):page.screenshot(path=str(S/(name+'.png')),full_page=True)
 def setup(fast=True):
  page.evaluate("""fast=>{resetGame();app.fastFx=fast;app.draftCards=['slash','setup','battle_spirit','first_aid','corrosion'];window.__timeline=[];
  if(window.__observer)window.__observer.disconnect();window.__observer=new MutationObserver(()=>__timeline.push({text:document.getElementById('transitionText').textContent,hidden:document.getElementById('battleTransition').hidden,time:performance.now()}));__observer.observe(document.getElementById('battleTransition'),{attributes:true,subtree:true,childList:true});initBattle('boss_knight_defense');}""",fast)
  page.wait_for_function("document.getElementById('transitionText').textContent==='BATTLE START'")
  check('start-busy',page.evaluate("app.busy&&document.getElementById('endTurn').disabled"))
  page.wait_for_function('!app.busy');page.evaluate('app.battle.actors.player.mana=5;render()')
 for w,h in [(320,844),(360,800),(390,844),(430,932),(768,1024),(1366,768)]:
  page.set_viewport_size(dict(width=w,height=h));page.goto('http://127.0.0.1:18080/');page.wait_for_function('typeof trialDebug!=="undefined"')
  page.locator('.starter-option').first.click();page.locator('.card-pick').first.click()
  check(f'modal-clean-{w}',page.locator('#draftDetailActions').count()==0 and page.locator('#cardDetailMeta').is_hidden() and page.locator('#cardDetailStatus').is_hidden() and 'スキル' in page.locator('#confirmCard').inner_text())
  if w==390:shot('acquisition-detail-390')
  page.locator('#closeCardDetail').click();page.locator('#draftReroll').click();page.locator('#draftSkip').click()
  check(f'acquisition-{w}',page.evaluate('app.draftStep===1&&app.draftRerolls===1'))
  setup(w!=1366)
  t=page.evaluate('__timeline');shown=[x for x in t if not x['hidden']];start=next(x for x in shown if x['text']=='BATTLE START');your=next(x for x in shown if x['text']=='YOUR TURN');hidden=next(x for x in t if x['hidden'] and x['time']>=start['time'])
  check(f'transition-order-{w}',your['time']>hidden['time'] and your['time']-hidden['time']>=35,timeline=t)
  check(f'no-legacy-terms-{w}',page.evaluate("!document.body.innerText.includes('カード')&&!document.body.innerText.includes('デッキ')"))
  check(f'nav-order-{w}',page.evaluate("document.getElementById('soundButton').getBoundingClientRect().x<document.getElementById('settingsButton').getBoundingClientRect().x"))
  check(f'no-overflow-{w}',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  dims=page.evaluate("""()=>[...document.querySelectorAll('#hand .game-card,#enemyDeck .game-card')].map(c=>{const r=x=>c.querySelector(x).getBoundingClientRect(),n=r('.card-name'),m=r('.card-cost'),d=r('.card-description'),cd=r('.card-cd');return {side:c.dataset.side,mp:c.querySelector('.card-cost').innerText,cd:c.querySelector('.card-cd').innerText,overlap:n.right>m.left+.5&&n.bottom>m.top&&m.bottom>n.top,effectOverlap:d.bottom>cd.top+.5,cdRight:Math.abs(cd.right-c.getBoundingClientRect().right)<12}})""")
  check(f'panel-bounds-{w}',all('♦' in x['mp'] and '⌛' in x['cd'] and not x['overlap'] and not x['effectOverlap'] and x['cdRight'] for x in dims),panels=dims)
  if w in [390,1366]:shot(f'normal-{w}')
  # Enemy panels stay anchored; only their independent effect popup moves.
  for i in [0,4]:
   before=page.locator('#enemyDeck .game-card').nth(i).bounding_box();page.locator('#enemyDeck .card-open').nth(i).click();after=page.locator('#enemyDeck .game-card').nth(i).bounding_box();detail=page.locator('.inline-card-details').bounding_box()
   check(f'enemy-anchor-{w}-{i}',abs(before['x']-after['x'])<1 and abs(before['y']-after['y'])<1 and detail['x']>=7 and detail['x']+detail['width']<=w-7,before=before,after=after,detail=detail)
   check(f'only-effect-{w}-{i}',page.locator('.inline-card-details p').count()==1 and page.locator('.inline-card-reason,.enemy-detail-meta').count()==0)
   if w==390 and i==4:shot('enemy-right-390')
   page.evaluate('closeCardDetail()')
  page.evaluate("openCardDetail('setup','player')")
  check(f'player-detail-{w}',page.locator('.inline-card-details p').count()==1 and page.locator('.card-use:visible').count()==1 and page.locator('.inline-card-details').inner_text()==page.evaluate("cardDescription('setup')"))
  if w==390:shot('player-detail-390')
  page.evaluate('closeCardDetail()')
  # Display CD transitions for both owners, using actual reducer only.
  for side in ['player','boss']:
   for id,cd in [('slash',0),('setup',1),('battle_spirit',2)]:
    page.evaluate("""([side,id])=>{app.battle=GameBattle.createState({playerDeck:[id],bossPresetId:'boss_knight_defense',firstSide:side});app.battle.actors[side].deck=[id];app.battle.actors[side].mana=5;GameBattle.execute(app.battle,{type:'card',side,id});render()}""",[side,id])
    container='#hand' if side=='player' else '#enemyDeck';txt=page.locator(container+' .card-status').first.inner_text();check(f'spent-{w}-{side}-{id}',txt=='使用済')
    if w==390 and side=='player' and id=='setup':shot('used-390')
    page.evaluate("GameBattle.execute(app.battle,{type:'endTurn'});render()")
    txt=page.locator(container+' .card-status').first.inner_text();check(f'cooldown-{w}-{side}-{id}',txt==(f'CD中（残{cd}T）' if cd else ''))
    if w==390 and side=='player' and id=='setup':shot('cooldown-390')
    page.evaluate("GameBattle.execute(app.battle,{type:'endTurn'});render()")
    for turn in range(cd):
     check(f'cd-own-{w}-{side}-{id}-{turn}',page.locator(container+' .card-status').first.inner_text()==f'CD中（残{cd-turn}T）')
     page.evaluate("GameBattle.execute(app.battle,{type:'endTurn'});GameBattle.execute(app.battle,{type:'endTurn'});render()")
    check(f'cd-ready-{w}-{side}-{id}',page.locator(container+' .card-status').first.inner_text()=='')
  setup()
  page.evaluate("app.battle.actors.player.poison=2;app.battle.actors.boss.poison=2;render();animateHit(3,'boss');animateHeal(2,'player')")
  check(f'hit-heal-{w}',page.locator('#bossHit').inner_text()=='−3' and page.locator('#playerHit').inner_text()=='＋2' and page.evaluate("getComputedStyle(document.getElementById('bossHit')).color!==getComputedStyle(document.getElementById('playerHit')).color"))
  check(f'poison-{w}',page.locator('.poison-status').count()==2)
  if w>760:check(f'hud-top-{w}',page.evaluate("Math.abs(document.querySelector('.player-status').getBoundingClientRect().top-document.querySelector('.hand-panel').getBoundingClientRect().top)<1"))
  if w==1366:shot('pc-hud')
  if w==390:shot('damage-heal-390')
 check('errors',not errors,errors=errors);b.close()
(D/'browser-results.json').write_text(json.dumps({'checks':checks,'errors':errors},ensure_ascii=False,indent=2));print('PASS',len(checks))
