'use strict';
const fs=require('node:fs'),path=require('node:path'),B=require('./engine.cjs');
const root=path.resolve(process.argv[2]||'reports/first-era-poison-replay');
let text='# 実戦ログのターン別抜粋\n\n人工状態プローブとは別の、保存済み実戦ログからの抜粋。各行はその行動者の最後の操作直後。\n';
for(const part of ['data','confirmation','validation']){
 const dir=path.join(root,part,'logs');const files=fs.readdirSync(dir).map(name=>({name,log:JSON.parse(fs.readFileSync(path.join(dir,name)))}));
 const chosen=files.find(v=>v.log.result.winner==='player');if(!chosen)continue;const saved=chosen.log;
 text+=`\n## ${part} / ${chosen.name}\n\n[全行動ログ](${part}/logs/${chosen.name})。構成：${saved.initial.actors.player.deck.map(id=>B.spec(id).name).join('／')}。初手MP${saved.initial.c.openingMP}、奥義MP${saved.initial.c.ultCost}。\n\n| R | 行動者 | 行動順 | 操作後HP（P/B） | ボス毒残存 |\n|---|---|---|---|---|\n`;
 const turns=[];for(const frame of saved.log){const key=`${frame.round}-${frame.action.side}`;let row=turns.at(-1);if(!row||row.key!==key){row={key,round:frame.round,side:frame.action.side,actions:[]};turns.push(row);}row.actions.push(frame.action.type==='card'?B.spec(frame.action.id).name:frame.action.type==='ultimate'?'奥義('+B.spec(frame.events.find(e=>e.type==='ultimate').id).name+')':frame.action.type);row.frame=frame;}
 for(const row of turns)text+=`| ${row.round} | ${row.side} | ${row.actions.join(' → ')} | ${row.frame.player.hp}/${row.frame.boss.hp} | ${row.frame.boss.poison} |\n`;
}
const output=path.join(root,'representative-turns.md');if(fs.existsSync(output))throw Error('Refusing overwrite');fs.writeFileSync(output,text);
