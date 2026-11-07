'use strict';
function renderDraft(){
  setSceneArtwork('draft');
  const starting=app.draftCards.length===0;
  $('draftTitle').textContent=starting?'英雄の戦い方を選ぶ':'新たなスキルをひとつ';
  $('draftDescription').textContent=starting?'2つのスキルから始め、5回の習得イベントでビルドを整える。':'未習得の3スキルから習得・入れ替え。不要ならスキップできます。';
  $('draftStep').textContent=starting?'BUILD SELECT':`選択 ${app.draftStep+1} / ${GameProgression.DRAFT_EVENTS}`;
  const options=$('draftOptions');options.replaceChildren();
  if(starting){
    for(const starter of GameData.STARTERS){
      const button=document.createElement('button');button.className='starter-option';button.type='button';
      const title=document.createElement('strong');title.textContent=starter.label;
      const cards=document.createElement('span');cards.textContent=starter.card_ids.map(id=>GameData.CARDS[id].name).join(' ＋ ');
      button.append(title,cards);button.addEventListener('click',()=>applyStarter(starter.id));options.append(button);
    }
  }else{
    for(const id of app.draftOptions){const card=createCardView(id,'draft');card.querySelector('.card-open').addEventListener('click',()=>openCardDetail(id,'draft'));options.append(card);}
  }
  options.hidden=!!app.draftPending;
  $('draftActions').hidden=starting||!!app.draftPending;
  $('draftRerolls').textContent=`残り${app.draftRerolls}回`;
  $('draftReroll').disabled=app.draftRerolls===0;
  $('draftReplacement').hidden=!app.draftPending;
  const replacements=$('draftReplaceOptions');replacements.replaceChildren();
  if(app.draftPending){
    $('draftReplaceTitle').textContent=`「${GameData.CARDS[app.draftPending].name}」と入れ替えるスキルを選択`;
    for(const id of app.draftCards){
      const panel=createCardView(id,'replacement');panel.querySelector('.card-open').addEventListener('click',()=>openCardDetail(id,'owned'));
      const button=document.createElement('button');button.type='button';button.className='replace-confirm';button.textContent='このスキルと交換';button.addEventListener('click',()=>replaceDraft(id));panel.append(button);replacements.append(panel);
    }
  }
  $('draftDeckCount').textContent=`${app.draftCards.length} / 5`;
  const deck=$('draftDeck');deck.replaceChildren();
  for(const id of app.draftCards){
    const chip=document.createElement('button');chip.type='button';chip.className=`deck-chip ${GameData.category(GameData.CARDS[id])}`;
    chip.textContent=GameData.CARDS[id].name;chip.addEventListener('click',()=>openCardDetail(id,'owned'));deck.append(chip);
  }
}
