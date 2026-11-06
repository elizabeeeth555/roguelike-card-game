"""Real Chromium UI acceptance checks. Requires installed Python Playwright and Chromium.
Run against an existing local server: python3 scripts/ui-pc-smoke.py [URL].
No production rule, catalog, planner, or balance-study file is changed.
"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/pc-ui-rework'
SHOTS = OUT / 'screenshots'
SHOTS.mkdir(parents=True, exist_ok=True)
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:18080/'
reports = []
errors = []

def check(name, condition, **details):
    reports.append(dict(name=name, passed=bool(condition), **details))
    assert condition, (name, details)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                args=['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'])
    page = browser.new_page(viewport={'width':1366,'height':768})
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(URL, wait_until='domcontentloaded')
    page.wait_for_function("typeof trialDebug !== 'undefined'")

    def setup(boss='boss_witch_poison', fast=False):
        page.evaluate("""([boss,fast])=>{resetGame();app.fastFx=fast;document.getElementById('speedLabel').textContent=fast?'高速':'通常';
          app.draftCards=['slash','dash_slash','battle_spirit','barrier','corrosion'];
          initBattle(boss);hideTransitions();}""", [boss,fast])
        page.wait_for_function('app.mode === "battle" && !app.busy')
        page.wait_for_function("document.getElementById('bossPortrait').naturalWidth>0")

    def shot(name):
        page.wait_for_timeout(220)
        page.screenshot(path=str(SHOTS / name), full_page=True)

    # Public deck and essential PC controls fit without page scrolling.
    for width,height in [(1366,768),(1280,720),(360,800),(390,844),(430,932)]:
        page.set_viewport_size({'width':width,'height':height})
        setup()
        dims = page.evaluate("""()=>{
          const inView=e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth};
          return {scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
            controls:['accelerateButton','endTurn'].every(id=>inView(document.getElementById(id))),
            enemy:document.querySelectorAll('#enemyDeck .game-card').length,
            cards:document.querySelectorAll('#hand .game-card').length,
            heroHidden:getComputedStyle(document.getElementById('heroFigure')).display==='none',
            basics:[...document.querySelectorAll('#enemyDeck .card-cd,#hand .card-cd')].every(n=>n.textContent.includes('基本CD'))};}""")
        check(f'layout-{width}x{height}',dims['scrollWidth']<=width and dims['enemy']==5 and dims['cards']==5 and dims['heroHidden'] and dims['basics'] and (width<761 or (dims['scrollHeight']<=height and dims['controls'])),**dims)
        shot(f'pc-{width}x{height}.png' if width>760 else f'mobile-{width}x{height}.png')
        if width>760:
            # Exercise all 25 simultaneous selections, including the viewport edges.
            overlap_count=page.evaluate("""()=>{
              let bad=0;const own=app.battle.actors.player.deck,enemy=app.battle.actors.boss.deck;
              for(const a of own)for(const b of enemy){closeCardDetail();openCardDetail(a,'player');openCardDetail(b,'boss');
                const ps=[...document.querySelectorAll('.inline-card-details')].map(n=>n.getBoundingClientRect());
                const [x,y]=ps;const huds=[...document.querySelectorAll('.player-status,.boss-hud')].map(n=>n.getBoundingClientRect());if(ps.some(r=>huds.some(h=>r.left<h.right&&r.right>h.left&&r.top<h.bottom&&r.bottom>h.top))||ps.length!==2||ps.some(r=>r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1)||
                  (x.left<y.right&&x.right>y.left&&x.top<y.bottom&&x.bottom>y.top))bad++;
              }return bad;
            }""")
            check(f'dual-selection-25-{width}',overlap_count==0,bad=overlap_count)
    page.set_viewport_size({'width':1366,'height':768})
    setup()
    page.evaluate("openCardDetail('slash','player');openCardDetail('venom_blade','boss')")
    shot('pc-dual-card-details.png')
    before=page.evaluate('JSON.stringify(app.battle)')
    page.evaluate("cardDamagePreview('slash');render()")
    check('preview-immutable',before==page.evaluate('JSON.stringify(app.battle)'))
    page.locator('#roundValue').click()
    check('outside-deselect',page.evaluate('!app.selectedPlayer&&!app.selectedBoss'))

    # One effect commits, then inspection is allowed while further mutations are locked.
    page.locator('#hand [data-card-id="slash"] .card-open').click()
    page.locator('#hand [data-card-id="slash"] .card-use').click()
    page.locator('#hand [data-card-id="dash_slash"] .card-open').click()
    page.evaluate("document.activeElement.blur();useCard('dash_slash');accelerate();endTurn()")
    page.keyboard.press('Space')
    check('animation-selection-and-lock',page.evaluate("app.selectedPlayer==='dash_slash'&&app.playerAnimating&&app.battle.actors.player.used.length===1&&!app.battle.actors.player.accelerationPending&&app.battle.active==='player'"))
    check('animation-use-disabled',page.locator('#hand .selected .card-use').is_disabled())
    shot('pc-player-animation-next-selection.png')
    page.wait_for_function('!app.busy')
    page.evaluate("app.fastFx=true;document.activeElement.blur()")
    page.keyboard.press('Space')
    check('keyboard-end-confirm',page.locator('#endTurnOverlay').is_visible() and page.evaluate("app.battle.active==='player'"))
    page.locator('#cancelEndTurn').click()
    page.locator('#endTurn').click()
    check('mouse-end-confirm',page.locator('#endTurnOverlay').is_visible())
    page.evaluate("()=>{window.qaActions=[];window.qaPerform=perform;perform=function(a){const r=qaPerform(a);if(a.side==='boss')qaActions.push({a,time:performance.now()});return r};}")
    page.locator('#confirmEndTurn').click()
    check('enemy-selection-disabled',page.evaluate("app.battle.active==='boss'&&[...document.querySelectorAll('.card-open')].every(n=>n.disabled)&&!app.selectedPlayer&&!app.selectedBoss"))
    expected=page.evaluate('GamePlanner.plan(app.battle).actions')
    page.wait_for_function('app.battle.round>=2&&!app.busy', timeout=20000)
    actual=page.evaluate("qaActions.filter(x=>x.a.type!=='endTurn')")
    check('enemy-sequential-plan', [x['a'] for x in actual]==expected and all(actual[i]['time']-actual[i-1]['time']>=600 for i in range(1,len(actual))), actions=actual)
    page.evaluate('()=>{perform=qaPerform;}')

    # Both used and cooldown displayed; outside owner's turn only cooldown persists.
    setup(fast=True)
    page.evaluate("""()=>{app.battle=GameBattle.createState({playerDeck:app.draftCards,bossPresetId:'boss_witch_poison',firstSide:'boss'});
      perform({type:'card',side:'boss',id:'corrosion'});}""")
    check('enemy-used-and-cd',page.locator('#enemyDeck [data-card-id="corrosion"] .card-status').inner_text()=='使用済' and page.locator('#enemyDeck [data-card-id="corrosion"] .remaining-cd').inner_text()=='残1')
    shot('pc-enemy-used-and-cd.png')
    page.evaluate("clearEnemyAction();perform({type:'endTurn',side:'boss'})")
    check('enemy-used-cleared-on-player-turn',not page.locator('#enemyDeck [data-card-id="corrosion"] .card-status').inner_text() and page.locator('#enemyDeck [data-card-id="corrosion"] .remaining-cd').is_visible())
    shot('pc-enemy-cooldown.png')

    # Drawer does not block play or take the scroll position from historical reading.
    page.evaluate("for(let i=0;i<100;i++)addLog('確認用の記録 '+i)")
    page.locator('#logToggle').click()
    page.locator('#combatLog').evaluate('(n)=>{n.scrollTop=100;n.dispatchEvent(new Event("scroll"))}')
    old=page.locator('#combatLog').evaluate('(n)=>n.scrollTop')
    page.evaluate("addLog('リアルタイムに追加された記録')")
    check('log-keeps-history-position',abs(page.locator('#combatLog').evaluate('(n)=>n.scrollTop')-old)<2)
    page.evaluate("app.battle.actors.player.mana=3")
    mana=page.evaluate('app.battle.actors.player.mana')
    page.locator('#accelerateButton').click()
    check('log-open-does-not-pause',page.evaluate('app.battle.actors.player.mana')==mana-2)
    shot('pc-log-drawer.png')
    log_count=page.locator('#combatLog .log-item').count()
    page.locator('#endTurn').click()
    if page.locator('#endTurnOverlay').is_visible():page.locator('#confirmEndTurn').click()
    page.wait_for_function("app.battle.active==='player'&&!app.busy",timeout=20000)
    check('drawer-live-enemy-turn',page.locator('#combatLog .log-item').count()>log_count and page.evaluate('app.logOpen'))
    page.locator('#logClose').click()

    # Actual shield/HP loss is shown at the same time, including blocked-only hits.
    setup(fast=True)
    page.evaluate("app.battle.actors.boss.barrier=1;openCardDetail('slash','player')")
    check('preview-split',page.locator('#damagePreview').inner_text()=='予測 HP −1 ／ バリア −1')
    page.locator('#hand .selected .card-use').click()
    check('damage-split',page.locator('#bossHit').inner_text()=='⬡ −1 ／ ♥ −1')
    shot('pc-damage-and-barrier.png')
    page.wait_for_function('!app.busy')
    setup(fast=True)
    page.evaluate("app.battle.actors.boss.hp=1;openCardDetail('slash','player')")
    page.locator('#hand .selected .card-use').click()
    page.wait_for_selector('#resultOverlay',state='visible')
    check('result-on-battlefield',page.locator('#arena').is_visible() and page.locator('#resultKicker').inner_text()=='VICTORY')
    shot('pc-victory.png')
    deck=page.evaluate('JSON.stringify(app.draftCards)')
    preset=page.evaluate('app.retryPreset')
    page.locator('#retryButton').click()
    page.evaluate('hideTransitions()')
    page.wait_for_function('!app.busy')
    check('retry-same-conditions',page.evaluate('JSON.stringify(app.draftCards)')==deck and page.evaluate('app.retryPreset')==preset and page.evaluate('app.battle.actors.player.hp')==20)
    page.evaluate("app.battle.end='boss';finishBattle('boss')")
    page.wait_for_selector('#resultOverlay',state='visible')
    shot('pc-defeat.png')
    check('defeat-result',page.locator('#resultKicker').inner_text()=='DEFEAT')
    page.locator('#restartButton').click()
    page.locator('.starter-option').first.click()
    opts=page.evaluate('JSON.stringify(app.draftOptions)')
    count=page.evaluate('app.draftCards.length')
    page.locator('.card-pick').first.click()
    check('draft-requires-confirm',page.evaluate('app.draftCards.length')==count and page.locator('#cardDetailOverlay').is_visible() and page.evaluate('JSON.stringify(app.draftOptions)')==opts)
    page.locator('#closeCardDetail').click()
    shot('pc-draft-three-options.png')
    page.locator('.card-pick').first.click()
    page.locator('#confirmCard').click()
    check('draft-confirms-once',page.evaluate('app.draftCards.length')==count+1)
    setup(fast=True)
    page.evaluate("""()=>{for(const side of ['player','boss'])Object.assign(app.battle.actors[side],{hp:4,barrier:3,poison:2,weak:2,attackBonus:3,setupBonus:2,manaPenalty:1,accelerationPending:true});render();}""")
    icons=page.evaluate("""()=>{
      const hud=document.querySelector('.boss-hud'),deck=document.querySelector('.enemy-deck-panel');
      const rs=[...hud.querySelectorAll('.status-icon')].map(n=>n.getBoundingClientRect());
      return {boss:rs.length,player:document.querySelectorAll('.player-status .status-icon').length,
        contained:rs.every(r=>r.bottom<=hud.getBoundingClientRect().bottom+1&&r.right<=innerWidth),
        beforeDeck:rs.every(r=>r.bottom<deck.getBoundingClientRect().top),critical:document.querySelectorAll('.hp-track.critical').length};
    }""")
    check('active-status-icons',icons['boss']==7 and icons['player']==7 and icons['contained'] and icons['beforeDeck'] and icons['critical']==2,**icons)
    shot('pc-active-status-and-low-hp.png')
    for card,category in [('slash','attack'),('barrier','defense'),('corrosion','poison'),('first_aid','heal'),('battle_spirit','buff')]:
        setup(fast=True)
        page.evaluate("""([id])=>{app.battle.actors.player.deck=['slash','barrier','corrosion','first_aid','battle_spirit'];app.battle.actors.player.mana=5;app.battle.actors.player.hp=15;render();openCardDetail(id,'player');}""",[card])
        page.locator('#hand .selected .card-use').click()
        check('cast-category-'+category,page.evaluate("document.getElementById('attackFx').classList.contains("+json.dumps(category)+")") and page.locator('#hand [data-card-id="'+card+'"] .card-open').count()==1)
        if category=='defense':shot('pc-player-defense-effect.png')
        page.wait_for_function('!app.busy')
    setup(fast=False)
    page.evaluate("openCardDetail('slash','player')")
    page.locator('#hand .selected .card-use').click()
    page.locator('#resetButton').click()
    page.wait_for_timeout(1900)
    check('reset-cancels-player-animation',page.evaluate("app.mode==='draft'&&!app.battle&&document.getElementById('resultOverlay').hidden"))
    check('no-js-errors',not errors, errors=errors)
    browser.close()
OUT.joinpath('ui-acceptance.json').write_text(json.dumps({'checks':reports,'errors':errors},ensure_ascii=False,indent=2))
print(json.dumps({'checks':len(reports),'passed':sum(x['passed'] for x in reports),'errors':errors},ensure_ascii=False))
