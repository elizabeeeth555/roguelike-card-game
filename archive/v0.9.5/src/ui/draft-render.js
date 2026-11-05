'use strict';
// Draft presentation. Rules are provided by GameProgression.
function addDraftChoice(title,subtitle,tag,onClick,cls=''){
 const b=document.createElement('button');b.type='button';b.className='draft-choice '+cls;
 for(const [tagName,className,value] of [['span','draft-label',tag],['strong','',title],['span','draft-desc',subtitle],['span','draft-cta','選択する →']]){
  const el=document.createElement(tagName);if(className)el.className=className;el.textContent=value;b.appendChild(el);
 }
 b.addEventListener('click',onClick);$('draftOptions').appendChild(b);
}
// Card rules, choice previews, and the deck detail panel share the same number formulas.

function renderDraftCardDetails(){const area=$('draftCardDetails');if(!area)return;const all=[...draftCards,...(era>=2&&inherited?[inherited]:[])];
 const c=all.find(x=>x.key===selectedDraftKey)||all[0];area.replaceChildren();if(!c){area.textContent='カードを選ぶと詳細が表示されます。';return;}
 selectedDraftKey=c.key;const title=document.createElement('strong');title.textContent=`${LIB[c.id].icon} ${nameOf(c)}${c.inherited?' ［継承］':''} ／ COST ${LIB[c.id].cost}`;
 const desc=document.createElement('span');desc.textContent=`現在の効果：${effectSummary(c)}`;
 const trait=document.createElement('span');trait.className='draft-special-info';trait.textContent=c.trait?`✦ 刻印済：${LIB[c.id].mark}`:'刻印：なし';
 const note=document.createElement('small');note.textContent=c.inherited?'継承枠：今回の通常強化イベントでは強化できません。':hasUpgraded(c)?'強化済み：このカードは通常強化できません。':'強化候補では変更前後の性能を比較できます。';area.append(title,desc,trait,note);
 for(const btn of $('draftDeck').children){btn.classList.toggle('selected',btn.dataset.key===c.key);btn.setAttribute('aria-pressed',String(btn.dataset.key===c.key));}
}

function renderDraft(){window.scrollTo(0,0);setHeader();$('draftStage').hidden=false;$('gameLayout').hidden=true;const titles={starter:['英雄の素質','この時代の戦い方を選ぶ。2枚から始まり、道中でビルドを育てる。'],add:['新しい技を獲得','3枚の候補から1枚を取得する。'],upgrade:['技の研鑽',era===3?'まだ強化していないカード1枚を「強化・改」にする。':'まだ強化していないカード1枚を強化する。'],fork:['分かれ道',era===1?'新しいカードを選んでデッキを構築する。':'新しいカードを取るか、未強化カードを磨くか。'],upgradeFork:['技を磨く',era===3?'通常カード1枚を強化・改にする。継承カードは対象外。':'通常カード1枚を強化する。継承カードは対象外。'],special:['特殊強化・刻印','未強化カード1枚を強化し、刻印を付ける。通常強化とは併用不可。'],trump:['一度きりの切り札','通常のデッキ枠に入る、1戦闘1回のカード。獲得するか通常カードを選ぶ。']};
 const [title,detail]=titles[draftKind];$('draftTitle').textContent=title;$('draftDescription').textContent=detail;
 $('draftEra').textContent=`${eraConfig(era).label} / ${eraConfig(era).english}`;$('draftStep').textContent=draftIndex<0?'START':`${draftIndex+1} / ${routeForEra(era).length} EVENT`;
 const deck=$('draftDeck');deck.replaceChildren();const all=[...draftCards,...(era>=2&&inherited?[inherited]:[])];$('draftDeckCount').textContent=`通常 ${draftCards.length}枚${era>=2&&inherited?' ＋ 継承1枚':''}　/ 仮上限5枚`;
 for(const c of all){const s=document.createElement('button');s.type='button';s.dataset.key=c.key;s.className='draft-deck-chip'+(c.inherited?' legacy-chip':'');s.textContent=nameOf(c)+(c.inherited?'［継承］':'');s.title='カードの詳しい効果を表示';s.addEventListener('click',()=>{selectedDraftKey=c.key;renderDraftCardDetails();});deck.appendChild(s);}
 const options=$('draftOptions');options.replaceChildren();
 if(draftKind==='starter'){
  for(const st of STARTERS[era])addDraftChoice(st.name,st.cards.map(id=>LIB[id].name).join(' ／ ')+'\n'+st.info,'START',()=>applyStarter(st.cards));
 }else if(draftKind==='add'){
  for(const id of getOptions())addDraftChoice(LIB[id].name,effectSummary(newCard(id)),`コスト ${LIB[id].cost}`,()=>addCard(id));
 }else if(draftKind==='trump'){
  const specialId=eraConfig(era).trump;
  addDraftChoice('✸ '+LIB[specialId].name,effectSummary(newCard(specialId)),'新要素 / 切り札',()=>addCard(specialId),'trump-choice');
  const fallback=getOptions()[0];
  if(fallback)addDraftChoice('通常カードを獲得：'+LIB[fallback].name,effectSummary(newCard(fallback)),'通常カード',()=>addCard(fallback));
 }else if(draftKind==='fork'){
  for(const id of getOptions().slice(0,2))addDraftChoice(LIB[id].name,effectSummary(newCard(id)),`獲得 / COST ${LIB[id].cost}`,()=>addCard(id));
  if(era>1&&draftCards.some(c=>!hasUpgraded(c)))addDraftChoice('既存カードを強化',era===3?'未強化カード1枚を「強化・改」にする。':'未強化カード1枚を強化する。','強化',beginUpgradeFork,'upgrade-branch');
 }else{
  const special=draftKind==='special';const canUpgrade=draftCards.filter(c=>!hasUpgraded(c));
  for(const c of canUpgrade){addDraftChoice(nameOf(c),upgradePreview(c,special,era),special?(era===3?'改＋刻印':'強化＋刻印'):(era===3?'強化・改':'1回限りの強化'),()=>upgradeCard(c.key,special));}
  if(!canUpgrade.length){const id=getOptions()[0];if(id)addDraftChoice('強化できるカードなし：新しいカードを獲得',LIB[id].name+'｜'+effectSummary(newCard(id)),'代替報酬',()=>addCard(id));else addDraftChoice('先へ進む','すべて強化済み、またはカード候補がありません。','次へ',moveNext);}
 }
 $('draftHint').textContent='※ 第一紀は強化不可／第二紀は強化／第三紀は強化・改。強化・刻印は1枚につき合計1回。継承カードは通常強化対象外。';renderDraftCardDetails();
}

function showSwapDialog(id){
 const c=newCard(id);$('swapTitle').textContent=`デッキ上限（${RULES.cap}枚）`; $('swapDescription').textContent=`獲得候補：${LIB[id].name}｜${effectSummary(c)}。入れ替え先を選ぶか、このカードを破棄して進んでね。`;
 const list=$('swapOptions');list.replaceChildren();
 for(const previous of draftCards){const b=document.createElement('button');b.type='button';b.className='swap-option';b.textContent=`${nameOf(previous)} を外す
${effectSummary(previous)}`;b.addEventListener('click',()=>{replacePending(previous.key,c);});list.append(b);}
 $('swapOverlay').hidden=false;sound('ui_open');
}
