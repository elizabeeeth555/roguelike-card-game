"""Approved PNG / enlarged portrait / compact enemy deck acceptance screenshots."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'reports/castle-ui-png';SHOTS=OUT/'screenshots';SHOTS.mkdir(parents=True,exist_ok=True)
checks=[];errors=[];missing=[]
def check(name,value,**details):
 checks.append(dict(name=name,passed=bool(value),**details));assert value,(name,details)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio'])
 page=browser.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
 page.goto(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:18081/')
 def setup():
  page.evaluate("resetGame();app.fastFx=true;app.draftCards=['slash','dash_slash','battle_spirit','barrier','corrosion'];initBattle('boss_witch_poison');hideTransitions()")
  page.wait_for_function('!app.busy')
 def shot(name):
  page.wait_for_timeout(150);page.screenshot(path=str(SHOTS/(name+'.png')),full_page=True)
 for width,height in [(1366,768),(1280,720),(390,844)]:
  page.set_viewport_size(dict(width=width,height=height));setup()
  for id in page.evaluate('Object.keys(GAME_ASSETS.characterSets)'):
   page.evaluate("id=>{setCharacterImage(document.getElementById('bossPortrait'),id,'boss');document.getElementById('bossName').textContent=characterInfo(id).name}",id)
   page.wait_for_function("!document.getElementById('bossPortrait').hidden&&document.getElementById('bossPortrait').naturalWidth===1024")
   dims=page.evaluate("""()=>{
    const image=document.getElementById('bossPortrait'),r=image.getBoundingClientRect(),enemy=document.querySelector('#enemyDeck .game-card').getBoundingClientRect();
    return {w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,portraitHeight:r.height,portraitWidth:r.width,portraitTop:r.top,enemyWidth:enemy.width,enemyHeight:enemy.height};}""")
   check(f'portrait-{width}-{id}',dims['w']==width and dims['h']==height and dims['portraitHeight']>(650 if width>760 else 480) and dims['enemyWidth']>dims['enemyHeight']*1.4,**dims)
   shot(f'{id}-{width}x{height}')
  setup()
  check(f'compact-content-{width}',page.evaluate("""()=>[...document.querySelectorAll('#enemyDeck .game-card')].every(card=>{
   const hidden=['.card-cost','.card-tags','.card-description','.card-cd','.condition-mark'].every(s=>getComputedStyle(card.querySelector(s)).display==='none');
   const icon=card.querySelector('.card-kind');return hidden&&icon&&getComputedStyle(icon).display!=='none';})"""))
  shot(f'enemy-normal-{width}x{height}')
  # Presentation fixture: base cooldown remains unchanged; only current state varies.
  page.evaluate("""()=>{const a=app.battle.actors.boss;a.readyOn.corrosion=a.ownTurn+1;a.readyOn.plague=a.ownTurn+2;render()}""")
  check(f'cd-visible-{width}',page.locator('#enemyDeck [data-card-id="plague"] .remaining-cd').inner_text()=='残2')
  shot(f'enemy-cooldown-{width}x{height}')
  page.evaluate("""()=>{const a=app.battle.actors.boss;app.battle.active='boss';a.used=['corrosion'];a.readyOn.corrosion=a.ownTurn+2;render()}""")
  check(f'used-visible-{width}',page.locator('#enemyDeck [data-card-id="corrosion"] .card-status').inner_text()=='使用済')
  check(f'used-priority-{width}',page.locator('#enemyDeck [data-card-id="corrosion"] .remaining-cd').is_hidden())
  check(f'enemy-lock-{width}',page.locator('#enemyDeck .card-open').first.is_disabled())
  shot(f'enemy-spent-{width}x{height}')
  setup()
  for side in ['boss','player']:
   for index in range(5):
    page.evaluate("([side,i])=>{closeCardDetail();openCardDetail(app.battle.actors[side].deck[i],side)}",[side,index])
    check(f'expanded-bounds-{width}-{side}-{index}',page.evaluate("""()=>[...document.querySelectorAll('.selected,.inline-card-details,.card-use:not([hidden])')].every(n=>{const r=n.getBoundingClientRect();return r.left>=7&&r.right<=innerWidth-7&&r.top>=7&&r.bottom<=innerHeight-7})"""))
    check(f'single-{width}-{side}-{index}',page.locator('.game-card.selected').count()==1)
  page.evaluate("openCardDetail('corrosion','boss')")
  check(f'enemy-full-description-{width}',page.locator('#enemyDeck .selected .inline-card-details').is_visible() and '基本CD1' in page.locator('#enemyDeck .selected .inline-card-details').inner_text())
  shot(f'enemy-expanded-{width}x{height}')
  page.evaluate('closeCardDetail()')
 check('no-js-errors',not errors,errors=errors);check('no-missing-resources',not missing,missing=missing)
 browser.close()
OUT.joinpath('acceptance.json').write_text(json.dumps({'checks':checks,'errors':errors,'missing':missing},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checks':len(checks),'passed':sum(x['passed'] for x in checks),'errors':errors},ensure_ascii=False))
