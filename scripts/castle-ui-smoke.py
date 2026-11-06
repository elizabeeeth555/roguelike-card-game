"""Castle presentation acceptance and review screenshots. Run with a local server URL."""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'reports/castle-ui'
SHOTS=OUT/'screenshots'
SHOTS.mkdir(parents=True,exist_ok=True)
checks=[]; errors=[]; failed_requests=[]
def check(name, passed, **details):
    checks.append(dict(name=name,passed=bool(passed),**details))
    assert passed,(name,details)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio'])
    page=browser.new_page()
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:failed_requests.append(r.url) if r.status>=400 else None)
    page.goto(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:18080/')
    page.wait_for_function("typeof trialDebug!=='undefined'")
    def setup(boss='boss_witch_poison'):
        page.evaluate("""boss=>{resetGame();app.fastFx=true;app.draftCards=['slash','dash_slash','battle_spirit','barrier','corrosion'];initBattle(boss);hideTransitions()}""",boss)
        page.wait_for_function("!app.busy&&document.getElementById('bossPortrait').naturalWidth>0&&!document.getElementById('bossPortrait').hidden")
    def shot(name):
        page.wait_for_timeout(150)
        page.screenshot(path=str(SHOTS/(name+'.png')),full_page=True)
    for width,height in [(1366,768),(1280,720),(360,800),(390,844),(430,932)]:
        page.set_viewport_size(dict(width=width,height=height));page.evaluate('resetGame()')
        page.wait_for_timeout(100)
        check(f'corridor-{width}', 'castle_corridor.webp' in page.evaluate("getComputedStyle(document.getElementById('sceneShell')).backgroundImage"))
        shot(f'draft-{width}x{height}')
        page.locator('.starter-option').first.click()
        shot(f'draft-choices-{width}x{height}')
        # Complete the real draft through its confirmation dialog.
        for _ in range(3):
            page.locator('.card-pick').first.click();page.locator('#confirmCard').click()
        page.evaluate('hideTransitions()');page.wait_for_function('!app.busy')
        check(f'draft-flow-{width}',page.evaluate("app.draftCards.length===5&&app.mode==='battle'"))
        setup()
        dims=page.evaluate("""()=>{
          const rect=s=>document.querySelector(s).getBoundingClientRect(),fits=s=>{const r=rect(s);return r.left>=0&&r.right<=innerWidth+.5&&r.top>=0&&r.bottom<=innerHeight+.5};
          const h=rect('#hand'),l=rect('.legacy-slot'),c=rect('#hand .game-card'),hud=rect('.player-status');
          return {width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
          own:document.querySelectorAll('#hand .game-card').length,enemy:document.querySelectorAll('#enemyDeck .game-card').length,
          controls:fits('#endTurn')&&fits('#accelerateButton'),legacy:fits('.legacy-slot'),hud:fits('.player-status'),
          bottomAligned:Math.abs(h.bottom-hud.bottom)<1,legacyRatio:l.width/c.width,legacyHeight:Math.abs(l.height-c.height)<1,
          logMiddle:rect('#logToggle').top>innerHeight*.3&&rect('#logToggle').top<innerHeight*.6,
          background:getComputedStyle(document.getElementById('sceneShell')).backgroundImage,
          loaded:document.getElementById('bossPortrait').naturalWidth>0};}""")
        check(f'layout-{width}x{height}',dims['width']==width and dims['height']==height and dims['controls'] and dims['legacy'] and dims['hud'] and dims['own']==5 and dims['enemy']==5 and dims['legacyHeight'] and .7<=dims['legacyRatio']<=.82 and dims['logMiddle'] and dims['loaded'] and (width<761 or dims['bottomAligned']),**dims)
        check(f'throne-{width}', 'castle_throne_room.webp' in dims['background'])
        shot(f'battle-{width}x{height}')
        # Every card, both sides, must fit with its explanation and use button.
        for side,container in [('player','hand'),('boss','enemyDeck')]:
            for i in range(5):
                page.evaluate("([side,i])=>{closeCardDetail();openCardDetail(app.battle.actors[side].deck[i],side)}",[side,i])
                bounds=page.evaluate("""()=>[...document.querySelectorAll('.selected,.inline-card-details,.card-use:not([hidden])')].every(n=>{const r=n.getBoundingClientRect();return r.left>=7&&r.right<=innerWidth-7&&r.top>=7&&r.bottom<=innerHeight-7})""")
                check(f'detail-{width}-{side}-{i}',bounds)
                check(f'single-selection-{width}-{side}-{i}',page.locator('.game-card.selected').count()==1)
        page.evaluate("openCardDetail('slash','player')")
        shot(f'card-expanded-{width}x{height}')
        page.evaluate('closeCardDetail()')
        page.locator('#settingsButton').click()
        check(f'settings-open-{width}',page.locator('#settingsPanel').is_visible())
        page.locator('#soundButton').click()
        check(f'exclusive-menus-{width}',page.locator('#settingsPanel').is_hidden() and page.locator('#audioPanel').is_visible())
        page.locator('#audioClose').click()
    page.set_viewport_size(dict(width=1366,height=768));setup()
    # All provided boss images load without changing the game IDs.
    for id in page.evaluate('Object.keys(GAME_ASSETS.characterSets)'):
        page.evaluate("id=>{setCharacterImage(document.getElementById('bossPortrait'),id,'boss');document.getElementById('bossName').textContent=characterInfo(id).name}",id)
        page.wait_for_function("document.getElementById('bossPortrait').src.endsWith(GAME_ASSETS.characterSets['"+id+"'].images.boss)&&!document.getElementById('bossPortrait').hidden")
        check('portrait-'+id,page.evaluate("document.getElementById('bossPortrait').naturalWidth>0"))
        shot('portrait-'+id)
    setup();page.locator('#logToggle').click()
    page.evaluate("app.battle.actors.player.mana=0;render();document.getElementById('endTurn').click();hideTransitions()")
    page.wait_for_function("app.enemyActiveKey!==null")
    check('log-does-not-pause',page.evaluate("app.battle.active==='boss'&&app.logOpen"))
    check('enemy-inspection-locked',page.locator('#enemyDeck .card-open').first.is_disabled())
    shot('enemy-used-cd-and-log')
    page.wait_for_function("app.battle.active==='player'&&!app.busy",timeout=20000)
    check('enemy-turn-completes',True)
    shot('log-drawer')
    page.locator('#logClose').click()
    # Visible presentation fixtures cover combined HP/barrier feedback and status icons.
    page.evaluate("""()=>{Object.assign(app.battle.actors.boss,{barrier:3,poison:2,weak:1,attackBonus:2,setupBonus:1,manaPenalty:1,accelerationPending:true});render();animateHit(2,'boss',3)}""")
    shot('hp-barrier-and-status')
    check('simultaneous-hit',page.locator('#bossHit').inner_text()=='⬡ −3 ／ ♥ −2')
    page.evaluate("resetGame();app.fastFx=true;applyStarter('rush');for(let i=0;i<3;i++)acquireDraft(app.draftOptions[0]);hideTransitions()")
    page.wait_for_function('!app.busy')
    page.locator('#settingsButton').click()
    page.once('dialog',lambda d:d.dismiss());page.locator('#resetButton').click()
    check('reset-cancel',page.evaluate("app.mode==='battle'"))
    page.once('dialog',lambda d:d.accept());page.locator('#resetButton').click()
    check('reset-confirm',page.evaluate("app.mode==='draft'&&!app.battle"))
    check('no-js-errors',not errors,errors=errors)
    check('no-missing-resources',not failed_requests,requests=failed_requests)
    browser.close()
OUT.joinpath('acceptance.json').write_text(json.dumps({'checks':checks,'errors':errors,'failedRequests':failed_requests},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checks':len(checks),'passed':sum(c['passed'] for c in checks),'errors':errors},ensure_ascii=False))
