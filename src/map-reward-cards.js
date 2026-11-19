// Achievement cards: one per map villain, won on its third hit and kept in the five slots before the sound button.
// Ownership is read from the existing hit record (state.mapHits[id]===3), so nothing new is saved and a villain
// that was already driven off shows its card without replaying the reveal.
import {createRewardCards} from './reward-cards.js';
import {stages} from './state.js';

// Villain ids are the stage ids '0'-'4' (map.js encounterStage); the central operations room (5) has no villain.
// The star count rises with the facility order.
const TITLES=['기후 신호 관측 대원','기후 연결고리 탐정','해수면 실험 연구원','생활 속 기후 실천왕','미래 도시 설계 영웅'];
export const REWARD_CARDS=stages.map((stage,index)=>{
 const id=String(stage.id),file=`${index+1}-${id}.webp`;
 return {id,title:TITLES[index],stage:stage.name,art:`/assets/reward-cards/card-${file}`,thumb:`/assets/reward-cards/thumb-${file}`};
});
const HITS=3;
export const ownedRewardCards=hits=>REWARD_CARDS.map(({id})=>hits?.[id]===HITS);
// Card indexes won between two hit records: only the hit that takes a villain from under three to three.
export const newRewardCards=(before,after)=>REWARD_CARDS.flatMap(({id},index)=>before?.[id]!==HITS&&after?.[id]===HITS?[index]:[]);

// main.js hands over its effect call, so the cards follow the sound button, the effects switch and the effect size.
let cue=()=>{};
export function bindRewardSound(play){cue=play;}
// main.js also says whether the villain's exit line is still being spoken: the card waits for it (PATIENCE at most).
let speaking=()=>false;
export function bindRewardVoice(isSpeaking){speaking=isSpeaking;}
const PATIENCE=7000;

// Built on first use: the unit tests load this module without a document.
let instance;
function rewards(){
 return instance??=createRewardCards({
  setName:'기후 미래 작전실 성취 카드',
  cards:REWARD_CARDS,
  theme:{accent:'#ffd574',accent2:'#1e665b',glow:'#fffbed',ink:'#173f42'},
  particles:['leaf','drop','snow','spark'],
  colors:['#ffd574','#1e665b','#d6efe1','#ffcc8e','#eff9ef','#ffffff'],
  // Card back: the leaf mark of the app icon (assets/favicon.svg).
  emblem:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="18" fill="#174f47"/><path d="M18 43C15 19 36 13 49 15c2 18-7 36-25 30l-7 8" fill="#b9e69b" stroke="#fff8de" stroke-width="4" stroke-linecap="round"/><path d="m23 42 17-17" stroke="#174f47" stroke-width="3"/></svg>',
  sound:name=>cue('card-'+name),
  inertRoot:()=>document.querySelector('#app'),
 });
}

// A card on its way to a slot keeps that slot empty until it lands, even if the header is redrawn meanwhile.
const flying=new Set();
const settled=hits=>ownedRewardCards(hits).map((owned,index)=>owned&&!flying.has(index));
// True from the third hit until the card sits in its slot: the last villain leaves its jingle to the card (main.js).
export const rewardCardPending=()=>flying.size>0;
export const rewardSlotsHtml=hits=>rewards().slotsHtml(settled(hits));
// Cards whose villain has finished leaving and that have not been put away yet.
let due=0;
// The card's turn: the map holds its villains, and with them the all-villains finale, until the card is in its slot.
// An open card already makes #app inert; this also covers a card that waits behind a dialog (settings) opened in between.
export const rewardCardDue=()=>due>0;

// Call with the hit record before and after a save. The card opens once the villain's exit has played
// (760 ms, 520 ms with reduced motion) and its exit line has been spoken, and flies in from the villain's place.
// While the line is spoken the map keeps running (the bubble stays with the voice); the all-villains finale
// waits through rewardCardPending().
// hits() returns the record at that moment; open() says whether that map is still the screen in view.
export function awardRewardCards(before,after,hits,open){
 const won=newRewardCards(before,after);
 if(!won.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const index of won){
  let counted=false;
  const earned=Date.now();
  flying.add(index);
  const settle=()=>{if(counted)due--;flying.delete(index);rewards().syncSlots(settled(hits()));};
  const show=()=>{
   if(open()&&speaking()&&Date.now()-earned<PATIENCE){setTimeout(show,100);return;}
   if(!counted){counted=true;due++;}
   // Left the map, or the record was reset meanwhile: no reveal, the slots simply show what is saved.
   if(!open()||!ownedRewardCards(hits())[index]){settle();return;}
   // A dialog opened in the meantime sits above the card layer: the card waits until it is closed.
   if(document.querySelector('dialog[open]')){setTimeout(show,300);return;}
   const foe=document.querySelector(`.map-encounter-foe[data-encounter="${REWARD_CARDS[index].id}"]`),box=foe?.getClientRects().length?foe.getBoundingClientRect():null;
   rewards().reveal(index,box?{x:box.left,y:box.top-30}:undefined,ownedRewardCards(hits()).map((owned,i)=>owned&&(i===index||!flying.has(i)))).finally(settle);
  };
  setTimeout(show,reduced?520:760);
 }
}
