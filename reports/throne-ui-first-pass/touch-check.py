"""Touch input and fullscreen modal checks; optional URL and output directory arguments."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import sys,json
url=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:18080/'
out=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).resolve().parent
out.mkdir(parents=True,exist_ok=True);checks=[]
def check(n,ok):
 checks.append({'name':n,'passed':bool(ok)});assert ok,n
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--mute-audio'])
 for w,h in [(390,844),(375,812),(320,740)]:
  context=b.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True)
  page=context.new_page();page.goto(url)
  page.evaluate("app.draftCards=['slash','heavy_slash','barrier','setup','corrosion'];initBattle('boss_knight_defense');hideTransitions()")
  page.wait_for_timeout(250);page.evaluate('hideTransitions()');page.wait_for_function('!app.busy')
  for pos in [0,4]:
   before=page.evaluate('JSON.stringify(app.battle)');page.locator('#hand .card-open').nth(pos).tap()
   check(f'タップ選択のみ {w}/{pos}',before==page.evaluate('JSON.stringify(app.battle)'))
   check(f'ホバー依存なし {w}/{pos}',page.locator('#hand .inline-card-details').is_visible() and not page.locator('#skillTooltip').is_visible())
   use=page.locator('#hand .game-card.selected .card-use').bounding_box();acc=page.locator('#accelerateButton').bounding_box()
   check(f'使用と加速の重なりなし {w}/{pos}',use['y']+use['height']<=acc['y'])
   page.locator('#hand .skill-detail-close').tap()
  page.locator('#hand .card-open').first.tap();page.locator('#hand .card-use').first.tap();page.wait_for_function('!app.busy')
  check(f'タップ確定で1回発動 {w}',page.evaluate('app.battle.actors.player.used.filter(x=>x==="slash").length===1'))
  page.locator('#settingsButton').tap();page.locator('#speedButton').tap();check(f'高速設定 {w}',page.locator('#speedLabel').inner_text()=='高速');page.locator('#fxModeButton').tap();check(f'軽量設定 {w}',page.locator('#fxModeLabel').inner_text()=='軽量');context.close()
 page=b.new_page(viewport={'width':1366,'height':768});page.goto(url);page.evaluate("app.draftCards=['slash','barrier'];initBattle('boss_knight_defense');hideTransitions()")
 page.wait_for_timeout(250);page.evaluate('hideTransitions()');page.wait_for_function('!app.busy');page.locator('#fullscreenButton').click();page.wait_for_function('!!document.fullscreenElement')
 page.locator('#endTurn').click();check('全画面終了確認モーダル',page.locator('#endTurnOverlay').is_visible());page.locator('#cancelEndTurn').click()
 page.evaluate('app.battle.actors.boss.hp=1;render()');page.locator('#hand .card-open').first.click();page.locator('#hand .card-use').first.click();page.wait_for_selector('#resultOverlay:not([hidden])',timeout=10000);check('全画面勝利モーダル',page.locator('#resultTitle').is_visible());page.locator('#retryButton').click();page.evaluate('hideTransitions()');page.wait_for_timeout(250);page.evaluate('hideTransitions()');page.wait_for_function('!app.busy');check('全画面再戦継続',page.evaluate('!!document.fullscreenElement&&app.battle.actors.player.hp===20'))
 # Permission rejection must leave the game interactive without an unhandled promise.
 page.evaluate("document.exitFullscreen()")
 page.wait_for_function('!document.fullscreenElement');page.evaluate("()=>{document.documentElement.requestFullscreen=()=>Promise.reject(new Error('test denial'));}")
 page.locator('#fullscreenButton').click();page.wait_for_timeout(100);check('全画面拒否から安全復帰','切り替えられません' in page.locator('#fullscreenButton').get_attribute('title'))
 (out/'touch-results.json').write_text(json.dumps({'checks':checks,'environment':'Chromium touch emulation, not physical hardware'},ensure_ascii=False,indent=2)+'\n');print('passed',len(checks));b.close()
