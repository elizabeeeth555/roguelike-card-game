'use strict';
const assert=require('node:assert/strict'),B=require('./engine.cjs');
const poisonMainDefinition='実際の毒継続ダメージが与HPダメージの50%以上';
const isPoisonMain=r=>r.damage>0&&r.poisonDamage>=r.damage*.5;
function labelsFor(r){
 const labels=[];
 if(r.winner==='player'&&isPoisonMain(r))labels.push('poison-win');
 if(r.winner==='boss'&&r.poisonApplied>0)labels.push('poison-loss');
 if(r.winner==='player'&&r.ultimateTarget==='corrosion')labels.push('corrosion-replay-win');
 if(r.winner==='player'&&!isPoisonMain(r)&&r.poisonDamage>0&&r.damage-r.poisonDamage>=6)labels.push('hybrid-win');
 if(r.deckId==='pure_attack'&&r.winner==='player'&&r.poisonDamage===0)labels.push('pure-attack');
 return labels;
}
function selectRepresentatives(rows){const selected=new Map();for(const r of rows.filter(r=>r.stage==='main'))for(const label of labelsFor(r)){const file=label+'-'+r.mode+'.json';if(!selected.has(file))selected.set(file,{...r,label});}return selected;}
function poisonWinDescription(saved,row){
 assert.ok(labelsFor(row).includes('poison-win'));
 assert.equal(saved.caseId,row.caseId);
 for(const key of ['winner','round','remainingHP','poisonDamage','damage','ultimateTarget'])assert.deepEqual(saved.result[key],row[key]);
 assert.deepEqual(saved.initial.actors.player.deck,row.deck);
 const names=row.deck.map(id=>B.spec(id).name).join('／');
 return `- 毒主軸の勝利：[Bの毒勝利](logs/poison-win-B.json)。case ${row.caseId}、${row.deckId}（${names}）、探索${row.plannerId}。毒${row.poisonDamage}ダメージ／総与HPダメージ${row.damage}、R${row.round}・残HP${row.remainingHP}。再演対象は${B.spec(row.ultimateTarget)?.name||'未使用'}。毒を大量に重ねる勝利ではなく固定3の継続型。`;
}
module.exports={poisonMainDefinition,isPoisonMain,labelsFor,selectRepresentatives,poisonWinDescription};
