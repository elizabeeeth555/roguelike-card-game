"""Local FX Lab acceptance. Synthetic/public fixtures only; no purchased media.
Run: python reports/fx-lab/browser.py [http://127.0.0.1:8000/dev/fx-lab.html]
Requires existing Playwright, Chromium, Pillow and ffmpeg for tests only.
"""
import json,sys,tempfile,subprocess,wave,math,struct,time
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image,ImageDraw
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent;SHOTS=OUT/'screenshots';SHOTS.mkdir(exist_ok=True);F=Path(tempfile.mkdtemp(prefix='fx-lab-fixtures-'));URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:18080/dev/fx-lab.html';checks=[];errors=[];bad_responses=[];requests=[]
def check(name,ok,**details):
 checks.append(dict(name=name,passed=bool(ok),**details));assert ok,(name,details)
def wait(page,expression,arg=None,timeout=30000):
 end=time.monotonic()+timeout/1000
 while time.monotonic()<end:
  if page.evaluate(expression,arg):return
  page.wait_for_timeout(25)
 raise AssertionError(('wait timeout',expression,page.locator('#status').inner_text()))
frames=[]
for i,color in enumerate(['#df9e77','#abd9e9','#b08cce','#a5d490']):
 im=Image.new('RGBA',(96,96));ImageDraw.Draw(im).ellipse((8+i*6,8+i*6,88-i*4,88-i*4),fill=color);frames.append(im);im.save(F/f'frame{i+1:02}.png')
frames[0].save(F/'sample.apng',save_all=True,append_images=frames[1:],duration=[100,200,150,250],loop=0,disposal=0)
frames[0].save(F/'sample.webp',save_all=True,append_images=frames[1:],duration=[100,200,150,250],loop=0,lossless=True)
sheet=Image.new('RGBA',(192,192))
for i,im in enumerate(frames):sheet.paste(im,((i%2)*96,(i//2)*96))
sheet.save(F/'sheet.png');(F/'broken.png').write_text('not an image');(F/'bad.wav').write_text('not audio')
with wave.open(str(F/'test.wav'),'wb') as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(22050);f.writeframes(b''.join(struct.pack('<h',int(5000*math.sin(2*math.pi*220*i/22050))) for i in range(6615)))
subprocess.run(['ffmpeg','-v','error','-y','-i',str(F/'test.wav'),str(F/'test.ogg')],check=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio']);page=browser.new_page(viewport={'width':1366,'height':900})
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad_responses.append(dict(url=r.url,status=r.status)) if r.status>=400 else None);page.on('request',lambda r:requests.append(dict(url=r.url,method=r.method)))
 page.add_init_script("""window.__audio=[];const Native=window.AudioContext;window.AudioContext=class extends Native{createGain(){const g=super.createGain();(window.__gains??=[]).push(g);return g;}createBufferSource(){const s=super.createBufferSource(),start=s.start.bind(s),stop=s.stop.bind(s);s.start=(t)=>{__audio.push({type:'start',time:t,now:this.currentTime});return start(t)};s.stop=()=>{__audio.push({type:'stop',now:this.currentTime});return stop()};return s;}}""")
 page.goto(URL);wait(page,'typeof FxLab!=="undefined"');wait(page,"document.getElementById('bossPortrait').naturalWidth>0&&document.getElementById('heroFace').naturalWidth>0")
 def shot(name):page.screenshot(path=str(SHOTS/(name+'.png')),full_page=True)
 def setval(id,value):page.locator('#'+id).fill(str(value));page.locator('#'+id).dispatch_event('input' if page.locator('#'+id).get_attribute('type')=='range' else 'change')
 def ready():wait(page,'!document.getElementById("play").disabled')
 def visual(file,mode='image'):
  page.locator('#visualMode').select_option(mode);page.locator('#visualFiles').set_input_files(str(file));wait(page,'name=>document.getElementById("visualInfo").textContent.includes(name)',arg=Path(file).name);ready()
 def play():page.locator('#play').click();wait(page,'FxLab.getPlayback().lastSchedule!==null&&FxLab.getPlayback().playing')
 def stopped():wait(page,'!FxLab.getPlayback().playing')
 check('no-game-bootstrap',page.evaluate('typeof GameBattle==="undefined"&&typeof GamePlanner==="undefined"'))
 check('initial-images',page.locator('#bossSelect option').count()==5)
 for w,h in [(1366,768),(1366,900),(1920,1080)]:
  page.set_viewport_size(dict(width=w,height=h));page.wait_for_timeout(100);check('width-'+str(w)+'-'+str(h),page.evaluate('document.documentElement.scrollWidth<=innerWidth'));check('transport-visible-'+str(w)+'-'+str(h),page.evaluate('document.getElementById("play").getBoundingClientRect().bottom<=innerHeight&&document.getElementById("importConfig").getBoundingClientRect().bottom<=innerHeight'))
 page.set_viewport_size({'width':1366,'height':900});page.wait_for_timeout(100);shot('overview')
 for boss in page.locator('#bossSelect option').evaluate_all('(nodes)=>nodes.map(n=>n.value)'):
  page.locator('#bossSelect').select_option(boss);wait(page,'document.getElementById("bossPortrait").complete&&document.getElementById("bossPortrait").naturalWidth>0');check('boss-'+boss,True)
 page.locator('#bossSelect').select_option('02_heavy_knight')
 play();page.wait_for_timeout(100);check('production-fx',page.locator('.combat-fx.fx-slash').count()==1);shot('reference-slash');page.locator('#stop').click();check('stop-cleans',page.locator('.combat-fx').count()==0 and not page.evaluate('FxLab.getPlayback().playing'))
 setval('speed',.5);setval('volume',.3);setval('audioDelayMs',-200);play();page.wait_for_timeout(70);t=page.evaluate('FxLab.getPlayback().lastSchedule');check('negative-delay',t['visualOffset']==200 and t['audioOffset']==0);page.wait_for_timeout(170);check('reference-half-speed',page.locator('.combat-fx').count()==1 and page.evaluate('Math.abs(document.querySelector(".combat-fx").getAnimations({subtree:true})[0].playbackRate-.5)<.01'));page.locator('#stop').click()
 setval('audioDelayMs',200);play();page.wait_for_timeout(50);check('positive-delay',page.evaluate('FxLab.getPlayback().lastSchedule.audioOffset===200'));page.locator('#stop').click();check('scheduled-audio-stopped',page.evaluate('__audio.some(e=>e.type==="stop")'))
 setval('audioDelayMs',0);page.locator('#patternB').click();check('b-selected',page.locator('#patternB').get_attribute('aria-pressed')=='true');check('independent-settings',page.evaluate('FxLab.getConfig().patterns.A.playback.speed===.5&&FxLab.getConfig().patterns.B.playback.speed===1'))
 page.locator('#soundMode').select_option('none')
 visual(F/'frame01.png');play();page.wait_for_timeout(80);check('png-rendered',page.evaluate('document.getElementById("fxCanvas").dataset.frame==="0"'));shot('png-preview');page.locator('#stop').click()
 for ext in ['apng','webp']:
  visual(F/('sample.'+ext));check('decoded-'+ext,'4 フレーム' in page.locator('#visualInfo').inner_text());setval('speed',.5);play();page.wait_for_timeout(60);t=page.evaluate('FxLab.getPlayback().lastSchedule');check('native-timing-'+ext,abs(t['duration']-1400)<5,timing=t);page.wait_for_timeout(240);check('frame-advance-'+ext,int(page.locator('#fxCanvas').get_attribute('data-frame'))>=1);shot('animated-'+ext);page.locator('#stop').click()
 page.locator('#visualMode').select_option('sequence');page.locator('#visualFiles').set_input_files([str(F/f'frame{i:02}.png') for i in [4,2,3,1]]);wait(page,'document.getElementById("visualInfo").textContent.includes("4 フレーム")');ready();setval('fps',8);setval('speed',1);play();page.wait_for_timeout(170);check('sequence-timing',page.evaluate('Math.abs(FxLab.getPlayback().lastSchedule.duration-500)<1'));check('sequence-natural-sort',page.evaluate('FxLab.getConfig().patterns.B.visual.files[0].name==="frame01.png"'));check('sequence-advance',int(page.locator('#fxCanvas').get_attribute('data-frame'))>=1);page.locator('#stop').click()
 visual(F/'sheet.png','sheet');setval('columns',2);setval('rows',2);setval('frameCount',4);setval('fps',4);play();page.wait_for_timeout(350);check('sheet-timing',page.evaluate('Math.abs(FxLab.getPlayback().lastSchedule.duration-1000)<1'));check('sheet-advance',int(page.locator('#fxCanvas').get_attribute('data-frame'))>=1);shot('sprite-sheet');page.locator('#stop').click()
 for id,value in [('size',350),('x',-60),('y',25),('opacity',.6),('rotation',30)]:setval(id,value)
 page.locator('#flipX').check();page.locator('#target').select_option('player');play();page.wait_for_timeout(180);check('transform-settings',page.evaluate('FxLab.getConfig().patterns.B.playback.target==="player"&&FxLab.getConfig().patterns.B.playback.flipX&&FxLab.getConfig().patterns.B.playback.size===350'));shot('player-target');page.locator('#stop').click()
 # All supported SE types decode in Web Audio; headless output is muted, not auditioned.
 for path in [F/'test.wav',ROOT/'assets/sounds/sfx/combat/hit_heavy.mp3',F/'test.ogg']:
  page.locator('#soundMode').select_option('local');page.locator('#soundFile').set_input_files(str(path));wait(page,'name=>document.getElementById("soundInfo").textContent.includes(name)&&document.getElementById("soundInfo").textContent.includes("秒")',arg=path.name);ready();page.locator('#soundOnly').click();page.wait_for_timeout(80);check('audio-'+path.suffix,page.evaluate('FxLab.getPlayback().playing&&FxLab.getPlayback().lastSchedule.soundOnly'));setval('volume',.25);page.wait_for_timeout(40);check('live-volume-'+path.suffix,page.evaluate('FxLab.getPlayback().playing&&Math.abs(__gains.at(-1).gain.value-.25)<.02'));stopped()
 # Repeat once-count behavior and explicit stop prevent runaway scheduling.
 page.locator('#soundMode').select_option('none');page.locator('#repeat').click();page.wait_for_timeout(80);first=page.evaluate('FxLab.getPlayback().lastSchedule.startedAt');wait(page,'first=>FxLab.getPlayback().lastSchedule.startedAt>first',arg=first);check('repeat-progress',True);page.locator('#stop').click();last=page.evaluate('FxLab.getPlayback().lastSchedule.startedAt');page.wait_for_timeout(1600);check('repeat-stop-no-residue',page.evaluate('last=>!FxLab.getPlayback().playing&&FxLab.getPlayback().lastSchedule.startedAt===last',last))
 page.locator('#loop').check();play();page.wait_for_timeout(80);first=page.evaluate('FxLab.getPlayback().lastSchedule.startedAt');wait(page,'first=>FxLab.getPlayback().lastSchedule.startedAt>first',arg=first);check('loop-progress',True);page.locator('#stop').click();page.locator('#repeat').click();wait(page,'!FxLab.getPlayback().playing',timeout=10000);check('three-repeats-override-loop',page.evaluate('FxLab.getPlayback().lastSchedule.iteration===3'));page.locator('#loop').uncheck()
 # Export both patterns; metadata only, no asset bytes or object URLs.
 setval('configName','ローカル比較テスト')
 with page.expect_download() as download:page.locator('#exportConfig').click()
 saved=F/'config.json';download.value.save_as(saved);config=json.loads(saved.read_text());check('json-metadata-only','blob:' not in saved.read_text() and 'data:' not in saved.read_text() and config['patterns']['B']['visual']['files'][0]['name']=='sheet.png');check('json-ab-settings',config['patterns']['A']['playback']['speed']==.5 and config['patterns']['B']['playback']['size']==350)
 page.locator('#configFile').set_input_files(str(saved));wait(page,'document.getElementById("status").textContent.includes("設定を読み込みました")');page.locator('#play').click();wait(page,'document.getElementById("status").textContent.includes("再選択")');check('missing-media-guidance',not page.evaluate('FxLab.getPlayback().playing'));shot('import-reselect')
 before=page.evaluate('JSON.stringify(FxLab.getConfig())');(F/'invalid.json').write_text('{invalid');page.locator('#configFile').set_input_files(str(F/'invalid.json'));wait(page,'document.getElementById("status").classList.contains("error")');check('bad-json-safe',page.evaluate('JSON.stringify(FxLab.getConfig())')==before)
 visual(F/'sheet.png','sheet');page.locator('#visualFiles').set_input_files(str(F/'broken.png'));wait(page,'document.getElementById("status").textContent.includes("読込失敗")');check('bad-image-safe',page.evaluate('FxLab.getConfig().patterns.B.visual.files[0].name==="sheet.png"'))
 page.locator('#soundMode').select_option('local');page.locator('#soundFile').set_input_files(str(F/'bad.wav'));wait(page,'document.getElementById("status").textContent.includes("SEの読込失敗")');check('bad-audio-safe',True)
 # A/B sequence does not change shared scene; copy conditions keeps different media.
 page.locator('[data-preset="ward"]').click();page.locator('#patternA').click();page.locator('[data-preset="heavy"]').click();setval('speed',1);page.locator('#matchSettings').click();check('same-conditions',page.evaluate('FxLab.getConfig().patterns.A.playback.speed===FxLab.getConfig().patterns.B.playback.speed&&FxLab.getConfig().patterns.A.visual.id!==FxLab.getConfig().patterns.B.visual.id'))
 image=page.locator('#bossPortrait').get_attribute('src');page.locator('#compare').click();wait(page,'document.getElementById("previewBadge").textContent.includes("再生中 A")');wait(page,'document.getElementById("previewBadge").textContent.includes("再生中 B")');check('ab-playback',page.locator('#bossPortrait').get_attribute('src')==image);stopped();shot('comparison-ready')
 # Force unsupported ImageDecoder to validate honest fallback controls.
 fallback=browser.new_page(viewport={'width':1366,'height':900});fallback.add_init_script('Object.defineProperty(window,"ImageDecoder",{value:undefined})');fallback.on('pageerror',lambda e:errors.append(str(e)));fallback.goto(URL);wait(fallback,'typeof FxLab!=="undefined"');fallback.locator('#visualMode').select_option('image');fallback.locator('#visualFiles').set_input_files(str(F/'sample.apng'));wait(fallback,'document.getElementById("visualInfo").textContent.includes("ネイティブ")');check('native-fallback-honest',fallback.locator('#speed').is_disabled() and fallback.locator('#loop').is_disabled() and '速度は1×固定' in fallback.locator('#capability').inner_text());fallback.locator('#play').click();wait(fallback,'!document.getElementById("nativeFx").hidden');src=fallback.locator('#nativeFx').get_attribute('src');fallback.locator('#play').click();wait(fallback,'old=>document.getElementById("nativeFx").getAttribute("src")!==old&&!document.getElementById("nativeFx").hidden',arg=src);check('native-restart',True);fallback.locator('#stop').click();check('native-stop',fallback.locator('#nativeFx').is_hidden());fallback.screenshot(path=str(SHOTS/'native-fallback.png'),full_page=True)
 # A hosted copy must not allow local media selection. Route mock prevents any real external request.
 hosted=browser.new_page();
 def local_route(route):
  path=ROOT/urlparse(route.request.url).path.lstrip('/');mime='text/javascript' if path.suffix=='.js' else 'text/css' if path.suffix=='.css' else 'text/html' if path.suffix=='.html' else 'image/png'
  route.fulfill(status=200,body=path.read_bytes(),content_type=mime) if path.is_file() else route.fulfill(status=404,body='not found')
 hosted.route('**/*',local_route);hosted.goto('http://fx-lab.invalid/dev/fx-lab.html');check('hosted-disabled',hosted.locator('#localOnly').is_visible() and hosted.locator('#workspace').is_hidden())
 check('no-external-requests',all(urlparse(r['url']).hostname in ['127.0.0.1','localhost',None] for r in requests),requests=requests);check('no-upload-methods',all(r['method']=='GET' for r in requests));check('no-js-errors',not errors,errors=errors);check('no-http-errors',not bad_responses,errors=bad_responses);browser.close()
(OUT/'browser-results.json').write_text(json.dumps({'checks':checks,'errors':errors,'httpErrors':bad_responses,'browser':'Chromium headless on Linux','fixtures':'Synthetic PNG/APNG/WebP/WAV/OGG and public repository MP3. No purchased material.','fixtureDirectory':str(F)},ensure_ascii=False,indent=2));print('PASS',len(checks))
