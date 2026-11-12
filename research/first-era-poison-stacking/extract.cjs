'use strict';
const fs=require('node:fs'),path=require('node:path'),{simulate}=require('./simulator.cjs'),{theoretical}=require('./patterns.cjs');
function main(){const root=process.argv[2]||'reports/first-era-poison-stacking',dest=path.join(root,'pattern-logs');if(fs.existsSync(dest))throw Error('Refusing overwrite');fs.mkdirSync(dest);
 const rows=fs.readFileSync(path.join(root,'battles.jsonl'),'utf8').trim().split('\n').map(JSON.parse);for(const r of rows.filter(r=>r.stage==='opening'))fs.writeFileSync(path.join(dest,r.variant+'-'+r.mode+'.json'),JSON.stringify({caseId:r.caseId,...simulate(r.deck,{...r.options,trace:true})})+'\n');
 fs.writeFileSync(path.join(root,'theoretical.json'),JSON.stringify(theoretical(),null,2)+'\n');
 fs.writeFileSync(path.join(root,'representative-turns.md'),renderTurns(root));
}
function renderTurns(root){
 let text='# 代表・固定初手ログの行動別表示\n\nHP/MP/毒は各行動後。毒ダメージと一閃はeventsから記載。全JSONにCD・バリア・状態・構え・合法な行動列を保存。下記は実戦reducerの再生であり、人間の試遊ではない。\n';
 for(const dir of ['logs','opening-logs','pattern-logs'])for(const name of fs.readdirSync(path.join(root,dir)).sort()){
 const s=JSON.parse(fs.readFileSync(path.join(root,dir,name)));text+=`\n## ${dir}/${name}\n\n[完全ログ](${dir}/${name})：case ${s.caseId}、${s.result.winner}、R${s.result.round}、毒実ダメージ${s.result.poisonDamage}。\n\n| R | 行動 | 英雄HP/MP | 王HP/MP | 王の毒残数 | 構え/ゲージ | 毒ダメージ・一閃 |\n|---|---|---|---|---|---|---|\n`;
 for(const f of s.log){const notes=f.events.filter(e=>e.kind==='poison'||['flashTriggered','flashPrevented','poisonApplied'].includes(e.type)).map(e=>e.kind==='poison'?`毒${e.amount}`:e.type==='poisonApplied'?`付与${e.amount}`:e.type==='flashTriggered'?'一閃発動':'一閃阻止').join(' / ');text+=`| ${f.round} | ${f.action.side}:${f.action.id||f.action.type} | ${f.player.hp}/${f.player.mana} | ${f.boss.hp}/${f.boss.mana} | ${f.boss.poison} | ${f.old.stance}/${f.old.gauge} | ${notes} |\n`;}
 }
 return text;
}
if(require.main===module)main();module.exports={renderTurns};
