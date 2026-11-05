'use strict';
function renderDraft(){
  const starting=app.draftCards.length===0;
  $('draftTitle').textContent=starting?'英雄の戦い方を選ぶ':'新たな技をひとつ';
  $('draftDescription').textContent=starting?'2枚から始め、3回の選択で5枚のビルドを完成させる。':'未所持の3枚から1枚を獲得。強化・継承のない第一紀限定の試練。';
  $('draftStep').textContent=starting?'BUILD SELECT':`選択 ${app.draftStep+1} / 3`;
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
  $('draftDeckCount').textContent=`${app.draftCards.length} / 5`;
  const deck=$('draftDeck');deck.replaceChildren();
  for(const id of app.draftCards){
    const chip=document.createElement('button');chip.type='button';chip.className=`deck-chip ${GameData.category(GameData.CARDS[id])}`;
    chip.textContent=GameData.CARDS[id].name;chip.addEventListener('click',()=>openCardDetail(id,'owned'));deck.append(chip);
  }
}
