import {voiceLines} from './voice-lines.js';
let audio, player, owner, serial=0;
export function configureNarration(value){audio=value;}
export function stopNarration(){
 serial++;if(player){player.pause();try{player.currentTime=0;}catch{}player.removeAttribute('src');player.load();player=null;}
 if(owner){owner.textContent='음성 다시 듣기';owner.setAttribute('aria-pressed','false');owner=null;}
 audio?.duckVoice(false);
}
export function voiceControl(host,id,{autoplay=false}={}){
 if(!host||!voiceLines[id])return;
 const button=document.createElement('button');button.type='button';button.className='voice-replay';button.dataset.voice=id;button.textContent='음성 듣기';button.setAttribute('aria-label',voiceLines[id].text+' 음성 듣기');button.setAttribute('aria-pressed','false');
 const status=document.createElement('span');status.className='voice-status';status.setAttribute('role','status');
 host.append(button,status);
 button.onclick=async()=>{
  if(owner===button){stopNarration();return;}stopNarration();
  if(document.hidden||!button.isConnected)return;
  if(!audio?.settings.sfx){status.textContent='소리를 켜면 음성을 들을 수 있어요.';return;}
  status.textContent='AI 생성 음성';const request=++serial;const current=new Audio('/'+voiceLines[id].target);player=current;owner=button;current.preload='none';button.textContent='음성 멈추기';button.setAttribute('aria-pressed','true');audio.duckVoice(true);
  const fail=()=>{if(request!==serial)return;stopNarration();status.textContent='음성을 불러오지 못했어요. 화면의 글을 읽고 계속할 수 있어요.';};
  current.onended=()=>{if(request===serial)stopNarration();};current.onerror=fail;
  try{await current.play();if(request===serial&&(document.hidden||!button.isConnected||!audio.settings.sfx))stopNarration();}catch{fail();}
 };
 if(autoplay)button.click();return button;
}
// Navigation, closing dialogs, mute, new actions and hidden pages never leave a stale voice playing.
if(typeof document!=='undefined'){
document.addEventListener('click',e=>{if(owner&&e.target!==owner&&!owner.contains(e.target))stopNarration();},true);
document.addEventListener('close',stopNarration,true);
document.addEventListener('play',e=>{if(e.target.tagName==='VIDEO'&&!e.target.muted)stopNarration();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')stopNarration();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopNarration();});
for(const event of ['pagehide','popstate','hashchange'])window.addEventListener(event,stopNarration);
new MutationObserver(()=>{if(owner&&!owner.isConnected)stopNarration();}).observe(document.documentElement,{childList:true,subtree:true});
}
