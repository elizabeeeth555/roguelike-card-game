"""Run: python3 reports/throne-ui-first-pass/browser-check.py [URL]. No rules are modified."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).resolve().parent
ROOT.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'screenshots';OUT.mkdir(exist_ok=True)
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:18080/'
checks=[];errors=[];http_errors=[]
def check(name,ok,**details):
 checks.append(dict(name=name,passed=bool(ok),**details))
 if not ok:raise AssertionError(checks[-1])
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--mute-audio'])
 page=browser.new_page(viewport={'width':1366,'height':768})
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:http_errors.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
 def setup(boss='boss_knight_defense'):
  page.evaluate("""boss=>{resetGame();app.draftCards=['slash','heavy_slash','barrier','setup','corrosion'];initBattle(boss);hideTransitions();}""",boss)
  page.wait_for_timeout(250);page.evaluate('hideTransitions()');page.wait_for_function('!app.busy')
  page.wait_for_function('document.getElementById("bossPortrait").naturalWidth>0')
 def shot(n):page.screenshot(path=str(OUT/n))
 page.goto(URL,wait_until='networkidle')
 check('正式タイトル', '継世の王座' in page.title() and page.get_by_text('王を討て。そして、王となれ。').is_visible())
 shot('start-1366.png')
 # Real draft interactions, including replacement and cancel.
 page.locator('.starter-option').first.click()
 page.locator('#draftReroll').click();page.locator('#draftSkip').click()
 for i in range(3):
  page.locator('.card-pick').first.click();page.locator('#confirmCard').click()
 page.locator('.card-pick').first.click();page.locator('#confirmCard').click()
 check('交換中リロール・スキップ非表示',not page.locator('#draftActions').is_visible())
 page.locator('#draftReplaceCancel').click();page.locator('#draftSkip').click()
 page.wait_for_function('app.mode==="battle"');page.evaluate('hideTransitions()');page.wait_for_timeout(300);page.evaluate('hideTransitions()');page.wait_for_function('!app.busy')
 metrics=[]
 for w,h in [(1280,720),(1366,768),(1920,1080),(390,844),(375,812),(320,740)]:
  page.set_viewport_size({'width':w,'height':h});setup();page.wait_for_timeout(150)
  m=page.evaluate("""()=>{const r=id=>document.getElementById(id).getBoundingClientRect();return {w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,field:r('hand').top-r('enemyDeck').bottom,enemyHeight:r('enemyDeck').height,handHeight:r('hand').height,controls:['accelerateButton','endTurn'].every(id=>r(id).bottom<=innerHeight),enemy:document.querySelectorAll('#enemyDeck .game-card').length}}""")
  metrics.append(m);check(f'画面内 {w}x{h}',m['scrollW']<=w and (w<761 or m['scrollH']<=h) and m['controls'] and m['enemy']==5,metrics=m)
  check(f'敵概要非表示 {w}',page.locator('#enemyDeck .card-description').first.evaluate('(e)=>getComputedStyle(e).display')=='none')
  shot(f'battle-{w}x{h}.png')
  page.locator('#settingsButton').click();check(f'設定 {w}',page.locator('#settingsPanel').is_visible());page.locator('#settingsClose').click()
  page.locator('#logToggle').click();check(f'ログ {w}',page.locator('#logPanel').evaluate('(e)=>e.classList.contains("expanded")'));page.locator('#logClose').click()
  for container in ['#hand','#enemyDeck']:
   for pos in [0,4]:
    card=page.locator(container+' .card-open').nth(pos);before=card.bounding_box();card.click();detail=page.locator(container+' .inline-card-details')
    box=detail.bounding_box();after=card.bounding_box()
    check(f'端詳細 {w} {container} {pos}',box['x']>=7 and box['x']+box['width']<=w-7 and box['y']>=7 and box['y']+box['height']<=h-7 and abs(before['x']-after['x'])<1)
    page.locator(container+' .skill-detail-close').click()
  # A selected skill never executes until confirmation.
  before=page.evaluate('JSON.stringify(app.battle)');page.locator('#hand .card-open').first.click()
  check(f'選択だけで不変 {w}',before==page.evaluate('JSON.stringify(app.battle)'))
  if w==1366:shot('selected-1366.png')
  if w==390:shot('selected-390.png')
  page.locator('#hand .card-use').first.click();page.wait_for_function('!app.busy')
  check(f'確定で1回のみ使用 {w}',page.evaluate('app.battle.actors.player.used.filter(x=>x==="slash").length')==1)
  if w==390:shot('used-390.png')
 page.set_viewport_size({'width':1366,'height':768});setup()
 for side in ['hand','enemyDeck']:
  for i in [0,4]:
   target=page.locator(f'#{side} .card-open').nth(i);before=page.evaluate('JSON.stringify(app.battle)');target.hover()
   check(f'ホバー {side} {i}',page.locator('#skillTooltip').is_visible() and page.locator('#skillTooltip').inner_text().find('使用条件')>=0 and not page.locator('.game-card.selected').count() and page.locator('#skillTooltip button').count()==0)
   check(f'ホバー不変 {side} {i}',before==page.evaluate('JSON.stringify(app.battle)'))
   if side=='hand' and i==4:shot('hover-1366.png')
 page.locator('#hand .card-open').first.focus();check('キーボード詳細',page.locator('#skillTooltip').is_visible());page.keyboard.press('Escape')
 page.evaluate("app.battle.actors.player.mana=0;app.battle.actors.player.used=['slash'];app.battle.actors.player.readyOn.setup=app.battle.actors.player.ownTurn+2;render()")
 page.locator('#hand .card-open').first.hover();check('使用済MP不足も閲覧', '使用済' in page.locator('#skillTooltip').inner_text() and 'MP不足' in page.locator('#skillTooltip').inner_text())
 page.locator('#hand .card-open').nth(3).hover();check('CD中も閲覧','CD中' in page.locator('#skillTooltip').inner_text());shot('cooldown-1366.png')
 page.evaluate("app.busy=true;app.battle.active='boss';render()")
 page.locator('#hand .card-open').first.hover();check('敵演出中閲覧・発動不可',page.locator('#skillTooltip').is_visible() and not page.evaluate('canChangeBattle()'))
 page.locator('#hand .card-open').first.click();check('敵演出中使用ボタン無効',page.locator('#hand .card-use').first.is_disabled())
 setup();page.locator('#fullscreenButton').click();page.wait_for_function('!!document.fullscreenElement')
 check('全画面開始',page.locator('#fullscreenButton').get_attribute('aria-pressed')=='true')
 page.locator('#settingsButton').click();check('全画面設定',page.locator('#settingsPanel').is_visible());page.locator('#settingsClose').click()
 page.locator('#logToggle').click();check('全画面ログ',page.locator('#logPanel').evaluate('(e)=>e.classList.contains("expanded")'));shot('fullscreen-1366.png');page.locator('#logClose').click()
 page.locator('#hand .card-open').first.click();check('全画面詳細',page.locator('#hand .inline-card-details').is_visible());page.locator('#hand .skill-detail-close').click()
 page.locator('#fullscreenButton').click();page.wait_for_function('!document.fullscreenElement');check('全画面終了',page.locator('#fullscreenButton').get_attribute('aria-pressed')=='false')
 page.locator('#fullscreenButton').click();page.wait_for_function('!!document.fullscreenElement');page.evaluate('document.exitFullscreen()');page.wait_for_function('!document.fullscreenElement');page.wait_for_function("document.getElementById('fullscreenButton').getAttribute('aria-pressed')==='false'");check('ブラウザ起点終了への追従',page.locator('#fullscreenButton').get_attribute('aria-pressed')=='false')
 # Exercise each of six provided portraits without changing assets.
 for cid in page.evaluate('Object.keys(GAME_ASSETS.characterSets)'):
  setup();page.evaluate("id=>setCharacterImage(document.getElementById('bossPortrait'),id,'boss')",cid);page.wait_for_function('!document.getElementById("bossPortrait").hidden');shot(f'portrait-{cid}.png')
 # Results / retry, actual action and normal finish presentation.
 setup();page.evaluate('app.battle.actors.boss.hp=1;app.battle.actors.player.mana=5;render()');page.locator('#hand .card-open').first.click();page.locator('#hand .card-use').first.click();page.wait_for_selector('#resultOverlay:not([hidden])',timeout=10000);shot('victory-1366.png')
 page.locator('#retryButton').click();page.evaluate('hideTransitions()');page.wait_for_timeout(250);page.evaluate('hideTransitions()');page.wait_for_function('!app.busy');check('再戦初期化',page.evaluate('app.battle.actors.player.hp===20&&app.battle.actors.player.mana===2'))
 # Safe API absence in a fresh document.
 fallback=browser.new_page();fallback.add_init_script("Object.defineProperty(document,'fullscreenEnabled',{value:false});")
 fallback.goto(URL);check('全画面非対応フォールバック',fallback.locator('#fullscreenButton').is_disabled());fallback.close()
 check('JS例外なし',not errors,errors=errors)
 check('HTTP読込エラーなし',not http_errors,errors=http_errors)
 (ROOT/'browser-results.json').write_text(json.dumps({'url':URL,'checks':checks,'metrics':metrics,'errors':errors,'http_errors':http_errors,'environment':'Linux Chromium headless / Playwright; no physical mobile or listening test'},ensure_ascii=False,indent=2))
 print('passed',len(checks));browser.close()
