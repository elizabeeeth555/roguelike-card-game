'use strict';
// Local artifact preparation only. Never invokes Git, Pages APIs or deployment.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const ENGINE=['card-data.js','combat-math.js','card-effects.js','first-era-rules.js','battle-engine.js','boss-planner.js'];
const MEDIA=['hub.jpg','deck.png','battle.jpg','boss.png','audio/bgm-first-era-hub-forest.mp3','audio/sfx-first-era-campfire.mp3','audio/bgm-first-era-old-king.mp3'];
const INPUTS=['apps/game-web/first-era.html','apps/game-web/vite.config.ts','apps/game-web/tsconfig.json','apps/game-web/package.json','apps/game-web/package-lock.json','scripts/prepare-pages.cjs',...ENGINE.map(n=>'src/game/'+n),...MEDIA.map(n=>'assets/first-era/'+({'hub.jpg':'backgrounds/outpost-hub-source.jpg','deck.png':'backgrounds/deck-building-table-source.png','battle.jpg':'backgrounds/throne-battle-source.jpg','boss.png':'boss/ashen-king-transparent.png'}[n]??n))];
const UI_MEDIA=Object.fromEntries(Object.values(require('../apps/game-web/ui-image-assets.json')).map(image=>['first-era/ui/'+image.path.slice('assets/ui/'.length),image.path]));
INPUTS.push('apps/game-web/ui-image-assets.json',...Object.values(UI_MEDIA));
const FORMAT='throne-first-era-public-v1',DIR='public-game',MANIFEST='manifest.json';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function allowed(name){return Object.hasOwn(UI_MEDIA,name)||ENGINE.some(n=>name==='engine/'+n)||MEDIA.some(n=>name==='first-era/'+n)||/^assets\/[a-zA-Z0-9_-]+\.(js|css)$/.test(name);}
function tree(directory){if(!fs.existsSync(directory))return [];return fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>{if(e.isSymbolicLink())throw Error('Symbolic link refused: '+e.name);const n=path.join(directory,e.name);return e.isDirectory()?tree(n):[n];}).sort();}
function regular(file){if(fs.existsSync(file)&&!fs.lstatSync(file).isFile())throw Error('Non-regular file refused: '+file);}
function classicRoot(root){const file=path.join(root,'classic/index.html');regular(file);const text=fs.readFileSync(file,'utf8');if(!text.includes('<base href="../" data-classic-root>'))throw Error('Classic base marker missing');return text.replace('  <base href="../" data-classic-root>\n','');}
function inputHash(root){const names=[...INPUTS,...tree(path.join(root,'apps/game-web/src')).map(f=>path.relative(root,f).split(path.sep).join('/'))].sort();return hash(names.map(n=>{const f=path.join(root,n);regular(f);return n+' '+hash(fs.readFileSync(f));}).join('\n'));}
function previous(root){
 const dir=path.join(root,DIR);if(fs.existsSync(dir)&&(!fs.lstatSync(dir).isDirectory()||fs.lstatSync(dir).isSymbolicLink()))throw Error('Unsafe publication directory');
 const file=path.join(dir,MANIFEST);regular(file);
 if(!fs.existsSync(file)){if(tree(dir).length)throw Error('Unmanaged public-game directory: refusing overwrite');return null;}
 const m=JSON.parse(fs.readFileSync(file,'utf8'));
 if(m.format!==FORMAT||!m.files||!Object.keys(m.files).length||!/^[a-f0-9]{64}$/.test(m.entryHash))throw Error('Invalid publication manifest');
 for(const [name,digest]of Object.entries(m.files))if(!allowed(name)||!/^[a-f0-9]{64}$/.test(digest))throw Error('Invalid owned path/digest: '+name);
 const expected=new Set([...Object.keys(m.files),MANIFEST]);
 for(const f of tree(dir)){const name=path.relative(dir,f).split(path.sep).join('/');if(!expected.has(name))throw Error('Unmanaged file preserved; refusing publication: '+name);}
 for(const [name,digest]of Object.entries(m.files)){const f=path.join(dir,name);regular(f);if(!fs.existsSync(f)||hash(fs.readFileSync(f))!==digest)throw Error('Managed file changed/missing; refusing overwrite: '+name);}
 return m;
}
function validateEntry(root,m){const file=path.join(root,'index.html');regular(file);const text=fs.readFileSync(file,'utf8');const classic=classicRoot(root),legacy=classic.replace('  <link rel="icon" href="data:,">\n','');if(text!==classic&&text!==legacy&&(!m||hash(text)!==m.entryHash))throw Error('Unexpected root index.html; preserved without overwrite');}
function collect(root){
 const dist=path.join(root,'apps/game-web/dist'),html=path.join(dist,'first-era.html');regular(html);
 const source=fs.readFileSync(html,'utf8');
 if(!source.includes('<head>')||source.includes('.tsx')||source.includes('dev-preview')||!source.includes('type="module"')||!source.includes('<title>継世の王座 — 第一紀</title>')||/<base\b/i.test(source))throw Error('Invalid first-era compiled entry');
 const files=new Map();
 for(const f of tree(dist)){const name=path.relative(dist,f).split(path.sep).join('/');if(name==='first-era.html')continue;if(!allowed(name))throw Error('Non-production build file refused: '+name);files.set(name,fs.readFileSync(f));}
 for(const name of [...ENGINE.map(n=>'engine/'+n),...MEDIA.map(n=>'first-era/'+n),...Object.keys(UI_MEDIA)])if(!files.has(name))throw Error('Required production file missing: '+name);
 for(const [,url]of source.matchAll(/(?:src|href)="\.\/([^"]+)"/g))if(!files.has(url))throw Error('Entry reference missing: '+url);
 const entry=source.replace('<head>','<head><base href="./public-game/"><link rel="icon" href="data:,">');
 const manifest={format:FORMAT,entrySource:'apps/game-web/first-era.html',inputHash:inputHash(root),entryHash:hash(entry),files:Object.fromEntries([...files].sort(([a],[b])=>a.localeCompare(b,'en')).map(([n,b])=>[n,hash(b)]))};
 return {files,entry,manifest};
}
function atomic(file,bytes){fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.tmp-'+crypto.randomUUID();fs.writeFileSync(tmp,bytes,{flag:'wx'});try{fs.renameSync(tmp,file);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
function apply(root,plan){
 const old=previous(root);validateEntry(root,old);
 // Validate all destinations before any write. Only manifest-owned stale files may be removed.
 for(const name of plan.files.keys()){if(!allowed(name))throw Error('Unsafe destination: '+name);const f=path.join(root,DIR,name);regular(f);if(fs.existsSync(f)&&!old?.files[name])throw Error('Unmanaged destination: '+name);}
 for(const [name,bytes]of plan.files)atomic(path.join(root,DIR,name),bytes);
 atomic(path.join(root,'index.html'),plan.entry);
 for(const name of Object.keys(old?.files??{}))if(!plan.files.has(name))fs.unlinkSync(path.join(root,DIR,name));
 atomic(path.join(root,DIR,MANIFEST),JSON.stringify(plan.manifest,null,2)+'\n');
}
function check(root){const m=previous(root);if(!m)throw Error('No publication manifest');validateEntry(root,m);if(m.inputHash!==inputHash(root))throw Error('Build inputs changed: run npm run build:pages');return fs.readFileSync(path.join(root,'index.html'),'utf8')===classicRoot(root)?'classic':'react';}
function restore(root){const m=previous(root);if(!m)throw Error('No publication manifest');validateEntry(root,m);atomic(path.join(root,'index.html'),classicRoot(root));}
if(require.main===module){try{const root=path.resolve(__dirname,'..'),flag=process.argv[2];if(flag==='--check')console.log('Publication verified: '+check(root));else if(flag==='--classic'){restore(root);console.log('Local index restored to classic. No deployment performed.');}else if(flag)throw Error('Unknown option');else{const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['--prefix','apps/game-web','run','build','--','--mode','first-era-production'],{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);const plan=collect(root);apply(root,plan);console.log('Prepared React root + '+plan.files.size+' owned files. No deployment performed.');}}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={UI_MEDIA,ENGINE,MEDIA,INPUTS,collect,apply,check,restore,hash,classicRoot};
