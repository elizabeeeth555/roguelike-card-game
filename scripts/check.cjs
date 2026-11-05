'use strict';
const {readdirSync}=require('node:fs');
const {join,resolve}=require('node:path');
const {spawnSync}=require('node:child_process');

function files(directory){
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const path=join(directory,entry.name);
    return entry.isDirectory()?files(path):/\.(?:js|cjs)$/.test(path)?[path]:[];
  });
}
const root=resolve(__dirname,'..');
for(const file of ['src','assets','scripts','tests'].flatMap(dir=>files(join(root,dir)))){
  const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
  if(result.error){console.error(result.error);process.exit(1);}
  if(result.status!==0)process.exit(result.status||1);
}
console.log('All JavaScript syntax checks passed.');
