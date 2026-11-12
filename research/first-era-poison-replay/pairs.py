"""Paired sensitivity audit using standard-library CSV; never modifies raw results."""
import csv,json,pathlib,sys
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'reports/first-era-poison-replay')
index={};rows=[]
canonical=lambda value:json.dumps(value,sort_keys=True,separators=(',',':'))
for part in ['data','focused','confirmation','validation']:
    manifest=json.loads((root/part/'manifest.json').read_text())
    modes=manifest.get('plannerModes',manifest.get('planners',{}))
    for row in csv.DictReader((root/part/'battles.csv').open()):
        config=manifest['configs'][row['configId']]
        planner=modes.get(row.get('plannerId',''),{})
        key=(row['deckId'],canonical(config),row['seed'],canonical(planner))
        index.setdefault(key,row)
        rows.append((row,config,planner))
output={}
for label,key,alternate,baseline in [('endOrder','endOrder','barrier-first','poison-first'),('history','replayHistory',False,True),('noUltimate','ultimate',False,True),('releaseCost','releaseCost',2,3)]:
    pairs={}
    for row,cfg,planner in rows:
        if cfg.get(key)!=alternate: continue
        base={**cfg,key:baseline}
        before=index.get((row['deckId'],canonical(base),row['seed'],canonical(planner)))
        if before is not None: pairs[(row['deckId'],canonical(cfg),row['seed'],canonical(planner))]=(before,row)
    data=list(pairs.values())
    output[label]={'matchedUniquePairs':len(data),'baselineWins':sum(a['winner']=='player' for a,b in data),'alternateWins':sum(b['winner']=='player' for a,b in data),'outcomeChanges':sum((a['winner'],a['round'],a['remainingHP'],a['bossHP'])!=(b['winner'],b['round'],b['remainingHP'],b['bossHP']) for a,b in data)}
p=root/'sensitivity-pairs.json'
if p.exists():raise SystemExit('Refusing overwrite')
p.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(output,ensure_ascii=False,indent=2))
