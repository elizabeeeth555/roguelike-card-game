'use strict';
// Card specifications, pools, routes and formatting helpers.
// Classic scripts retain direct file:// playability; do not turn these into ES modules.
const RULES={firstHp:42,secondHp:52,firstBossHp:45,secondBossHp:59,cap:5};
const LIB={
 slash:{name:'斬撃',family:'attack',type:'攻撃',icon:'⚔',cost:1,desc:'攻撃力+強化×2のダメージ。',mark:'追撃：半分の威力でもう1回攻撃'},
 boost:{name:'闘志',family:'buff',type:'強化',icon:'✦',cost:1,desc:'この戦闘中、攻撃力+2（強化ごとに+1）。',mark:'強化時に軽減4も獲得'},
 guard:{name:'結界',family:'guard',type:'防御',icon:'⬡',cost:1,desc:'次の敵ターンのダメージを合計6軽減。',mark:'軽減が発生した時に敵へ3反射'},
 return:{name:'返礼',family:'counter',type:'反撃',icon:'↗',cost:2,desc:'攻撃力+直前の軽減量（最大12）×2。ダメージの半分が防御を無視。',mark:'軽減0でも使用可。反撃倍率+1・固定威力+2'},
 pierce:{name:'穿撃',family:'attack',type:'貫通',icon:'➶',cost:2,desc:'攻撃力+2の防御無視攻撃。',mark:'威力をさらに+5'},
 rally:{name:'奮起',family:'buff',type:'攻防',icon:'✺',cost:1,desc:'この戦闘中の攻撃力+1、HPを2回復。',mark:'さらに軽減4を獲得'},
 rush:{name:'速攻',family:'attack',type:'速攻',icon:'➤',cost:0,desc:'2ダメージ。マナを使わずに攻撃。',mark:'使用時のダメージ+5'},
 siphon:{name:'吸命',family:'attack',type:'回復',icon:'♥',cost:2,desc:'攻撃力分のダメージ、HPを3回復。',mark:'回復量を大きく上昇'},
 flurry:{name:'連牙',family:'attack',type:'多段攻撃',icon:'⚔',cost:2,desc:'攻撃力分のダメージを2回。',mark:'攻撃回数+1（合計3回）'},
 seal:{name:'封魔',family:'control',type:'妨害',icon:'◈',cost:1,desc:'この敵ターンの使用可能マナを2減らす。',mark:'さらに相手に2ダメージ'},
 poison:{name:'腐蝕',family:'dot',type:'継続攻撃',icon:'☣',cost:1,desc:'2ダメージ。敵ターン開始時3ダメージ×2回。',mark:'毒の持続+1ターン'},
 thorns:{name:'棘衣',family:'guard',type:'防御反撃',icon:'✥',cost:1,desc:'次の敵ターンに6軽減、軽減した攻撃に3反撃。',mark:'反撃のダメージ+3'},
 leech:{name:'血吸',family:'attack',type:'吸収',icon:'◉',cost:2,desc:'攻撃力分のダメージ、HPを3回復。',mark:'ダメージを追加+5'},
 burst:{name:'破砕',family:'attack',type:'大技',icon:'✹',cost:3,desc:'攻撃力×2のダメージ。',mark:'追加ダメージ+8'},
 fortify:{name:'堅陣',family:'buff',type:'攻防',icon:'✧',cost:1,desc:'この戦闘中の攻撃力+1、次の攻撃を4軽減。',mark:'攻撃力増加量+1'},
 hex:{name:'萎縮',family:'control',type:'弱体',icon:'☽',cost:2,desc:'次の敵ターンの攻撃ダメージ-2。',mark:'同時に軽減4も獲得'},
 laststand:{name:'逆境の一撃',family:'finisher',type:'切り札',icon:'✸',cost:2,oneShot:true,desc:'1戦闘1回。攻撃力＋失ったHPの40%のダメージ。',mark:'失ったHPを参照する割合が60%に上昇'},
 venombloom:{name:'劇毒開花',family:'finisher',type:'切り札',icon:'☠',cost:2,oneShot:true,desc:'1戦闘1回。毒状態の敵にのみ使用可。毒を消費して大ダメージ。',mark:'毒の参照倍率+1'}
};
const POOLS={1:['slash','boost','guard','return','pierce','rally','rush','siphon'],2:['flurry','seal','poison','thorns','leech','burst','fortify','hex']};
const STARTERS={1:[{name:'剣の才',cards:['slash','boost'],info:'攻撃を重ねて押し切る'},{name:'守りの才',cards:['guard','return'],info:'防いだ攻撃を火力へ変える'},{name:'バランス',cards:['slash','guard'],info:'攻守の両方を備える'}],2:[{name:'連鎖の才',cards:['flurry','seal'],info:'連続攻撃とマナ妨害'},{name:'呪いの才',cards:['poison','thorns'],info:'毒と反撃で相手を削る'},{name:'攻勢の才',cards:['flurry','poison'],info:'多段攻撃と継続ダメージ'}]};
const ROUTE=['add','trump','upgrade','fork','special','fork'];
const clone=c=>({...c});
const nameOf=c=>LIB[c.id].name+(c.lv?` +${c.lv}`:'')+(c.trait?' ✦':'');
function newCard(id,legacy=false){return {id,lv:0,trait:false,inherited:legacy,key:legacy?'legacy':`${id}-${Math.random().toString(36).slice(2,7)}`};}
function pickRandom(ids,n){const a=[...ids];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
function effectSummary(c){const lv=c.lv||0,t=!!c.trait;switch(c.id){
 case 'slash':return `攻撃力+${lv*2}ダメージ${t?'／追撃：その半分のダメージ':''}`;
 case 'boost':return `戦闘中の攻撃力+${2+lv}${t?'／次の敵ターン軽減4':''}`;
 case 'guard':return `次の敵ターンの合計ダメージを${6+lv*2}軽減${t?`／攻撃を防ぐたび${3+lv}反射`:''}`;
 case 'return':return `攻撃力+前の敵ターンに防いだダメージ（最大12）×${2+lv+(t?1:0)}${t?'+2':''}。ダメージの半分が防御を無視${t?'／軽減0でも使用可':''}`;
 case 'pierce':return `攻撃力+${2+lv*3+(t?5:0)}ダメージ／防御を無視`;
 case 'rally':return `攻撃力+${1+lv}、HPを${2+lv}回復${t?'／次の敵ターン軽減4':''}`;
 case 'rush':return `マナ0で${2+lv*2+(t?5:0)}ダメージ`;
 case 'siphon':return `攻撃力+${lv*2}ダメージ／HPを${3+lv+(t?3:0)}回復`;
 case 'flurry':return `攻撃力+${lv}ダメージ×${t?3:2}回`;
 case 'seal':return `敵の次ターンのマナ-${2+lv}${t?'／敵に2ダメージ':''}`;
 case 'poison':return `${2+lv}ダメージ／毒${3+lv}を付与（最大4層、${t?3:2}ターン）。毒は重複・更新`;
 case 'thorns':return `次の敵ターン${6+2*lv}軽減／防いだ攻撃に${3+lv+(t?3:0)}反射`;
 case 'leech':return `攻撃力+${lv*2+(t?5:0)}ダメージ／HPを${3+lv}回復`;
 case 'burst':return `攻撃力×2+${3*lv+(t?8:0)}ダメージ`;
 case 'fortify':return `攻撃力+${1+lv+(t?1:0)}／次の敵ターン${4+2*lv}軽減`;
 case 'hex':return `敵の次の攻撃ダメージ-${2+lv}${t?'／次の敵ターン軽減4':''}`;
 case 'laststand':return `【切り札・1戦闘1回】攻撃力＋失ったHPの${t?60:40}%＋${lv*3}ダメージ`;
 case 'venombloom':return `【切り札・1戦闘1回】毒状態の敵に使用可。攻撃力＋毒の層数×${t?13:9}＋残り毒ターン×3＋${lv*3}。毒を消費`;
 default:return LIB[c.id].desc;
}}
function upgradePreview(c,special=false){const next={...c,lv:c.lv+(special?0:1),trait:special?true:c.trait};return `現在：${effectSummary(c)}\n変更後：${effectSummary(next)}${special?'\n追加効果：'+LIB[c.id].mark:''}`;}
