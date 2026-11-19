import {voiceLines} from './voice-lines.js';
let audio, player, owner, serial=0, villain=false, villainTurn=0;
const idle=new Set();
export function configureNarration(value){audio=value;}
export function stopNarration(){
 serial++;if(player){player.pause();try{player.currentTime=0;}catch{}player.removeAttribute('src');player.load();player=null;}
 if(owner){delete owner.dataset.voicePlaying;owner.textContent='음성 다시 듣기';owner.setAttribute('aria-pressed','false');owner=null;}
 villain=false;audio?.duckVoice(false);
 const waiting=[...idle];idle.clear();waiting.forEach(fn=>fn());
}
export const isNarrating=()=>!!player;
// One-shot callback for the next time no voice is playing.
export function onNarrationIdle(fn){idle.add(fn);return()=>idle.delete(fn);}
// Lines spoken by the scene itself (concept captions, villain bubbles) without a replay button.
export function playVoice(id){
 stopNarration();
 if(!voiceLines[id]||document.hidden||!audio?.settings.sfx)return false;
 const request=++serial,current=new Audio('/'+voiceLines[id].target);player=current;audio.duckVoice(true);
 current.onended=current.onerror=()=>{if(request===serial)stopNarration();};
 current.play().catch(()=>{if(request===serial)stopNarration();});
 return true;
}
// Villain map bubbles are short reactions. They never cut another character's line: they wait for it to end
// (at most 2 s, and only while still() holds) or are skipped. A newer villain line replaces an older one.
export function playVillainVoice(id,still=()=>true){
 const turn=++villainTurn;
 if(!voiceLines[id])return false;
 const start=()=>{const started=playVoice(id);villain=started;return started;};
 if(!player||villain)return start();
 // The idle callback runs inside stopNarration(), whose caller may be starting its own line: decide after it.
 const cancel=onNarrationIdle(()=>{clearTimeout(timer);setTimeout(()=>{if(turn===villainTurn&&!player&&still())start();},0);});
 const timer=setTimeout(cancel,2000);
 return false;
}
// True while a villain line that has already started is playing: a guide voice waits for it instead of cutting it.
export const isVillainSpeaking=()=>villain&&!!player;
// A dialog opens: other voices stop at once, a villain line that already started gets two more seconds at most.
export function yieldNarration(){
 if(!isVillainSpeaking()){stopNarration();return;}
 const line=serial;setTimeout(()=>{if(serial===line)stopNarration();},2000);
}
const villainDone=()=>new Promise(done=>{const cancel=onNarrationIdle(()=>{clearTimeout(timer);done();}),timer=setTimeout(()=>{cancel();done();},2000);});
export function voiceControl(host,id,{autoplay=false}={}){
 if(!host||!voiceLines[id])return;
 const button=document.createElement('button');button.type='button';button.className='voice-replay';button.dataset.voice=id;button.textContent='음성 듣기';button.setAttribute('aria-label',voiceLines[id].text+' 음성 듣기');button.setAttribute('aria-pressed','false');
 const status=document.createElement('span');status.className='voice-status';status.setAttribute('role','status');
 host.append(button,status);
 button.onclick=async()=>{
  if(owner===button){stopNarration();return;}
  // A villain line that already started finishes first (at most 2 s).
  if(isVillainSpeaking()){if(button.dataset.voiceWaiting)return;button.dataset.voiceWaiting='true';await villainDone();delete button.dataset.voiceWaiting;}
  stopNarration();
  if(document.hidden||!button.isConnected)return;
  if(!audio?.settings.sfx){status.textContent='소리를 켜면 음성을 들을 수 있어요.';return;}
  status.textContent='AI 생성 음성';const request=++serial;const current=new Audio('/'+voiceLines[id].target);player=current;owner=button;current.preload='none';button.textContent='음성 멈추기';button.setAttribute('aria-pressed','true');audio.duckVoice(true);
  const fail=()=>{if(request!==serial)return;stopNarration();status.textContent='음성을 불러오지 못했어요. 화면의 글을 읽고 계속할 수 있어요.';};
  current.onended=()=>{if(request===serial)stopNarration();};current.onerror=fail;
  // The portrait speaks only while sound is audible; buffering and pauses rest it.
  const speaking=on=>{if(request!==serial||owner!==button)return;if(on&&!document.hidden&&audio.settings.sfx)button.dataset.voicePlaying='true';else delete button.dataset.voicePlaying;};
  current.onplaying=()=>speaking(true);current.onwaiting=current.onpause=()=>speaking(false);
  try{await current.play();if(request!==serial)return;if(document.hidden||!button.isConnected||!audio.settings.sfx){stopNarration();return;}button.dataset.voicePlaying='true';}catch{fail();}
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
