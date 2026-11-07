"""Original procedural combat sounds; no external samples. Python stdlib + ffmpeg."""
import math, random, struct, subprocess, tempfile, wave
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/sounds/sfx/combat';OUT.mkdir(exist_ok=True)
# Oscillator fundamentals, noise mix, duration: layered impact/transient and soft tail.
SOUNDS={'hit_light':(160,.60,.19),'hit_medium':(105,.65,.28),'hit_heavy':(65,.7,.43),
 'ward':(620,.08,.42),'block':(840,.42,.20),'break':(1100,.72,.32),
 'heal':(540,.04,.52),'buff':(420,.05,.43),'mana':(330,.08,.48),'poison':(210,.48,.38),'curse':(110,.32,.38),'poison_tick':(175,.58,.22)}
for j,(name,(freq,noise,duration)) in enumerate(SOUNDS.items()):
 rng=random.Random(20261107+j);rate=44100;values=[];smooth=0
 for n in range(int(rate*duration)):
  t=n/rate;p=t/duration;smooth=.75*smooth+.25*rng.uniform(-1,1)
  phase=2*math.pi*freq*(t+(.30 if name.startswith('hit') else -.08)*t*t/duration)
  tone=math.sin(phase)+.28*math.sin(phase*1.5)+.12*math.sin(phase*2)
  env=min(1,t/.006)*math.exp(-p*(6 if name.startswith('hit') else 3))*(1-p)
  value=(tone*(1-noise)+smooth*noise*3)*env*.48
  values.append(struct.pack('<h',round(max(-.95,min(.95,value))*32767)))
 with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
  with wave.open(tmp.name,'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(b''.join(values))
  subprocess.run(['ffmpeg','-v','error','-y','-i',tmp.name,'-codec:a','libmp3lame','-b:a','96k',str(OUT/(name+'.mp3'))],check=True)
