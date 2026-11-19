import { createThemeEffects } from './theme-effects.js';
import {SOUND_KEY} from './state.js';
// Suno tracks (originals in references/suno). The main theme loops; the final theme plays once, then the main theme carries on quietly.
const tracks={main:'/assets/audio/bgm/main-theme.mp3',final:'/assets/audio/bgm/final-theme.mp3'};
// Map encounter cues from the shared CC0 library (assets/CREDITS.md). Wind carries the swing and the
// villain's exit, matching the climate unit; the hit lands 80 ms after the press (the swing's wind-up).
const sfx=name=>`/assets/audio/sfx/${name}.mp3`;
const swing={src:sfx('wind-whoosh-02'),gain:.55};
export const MAP_CUES={
 'map-hit-1':[swing,{src:sfx('hit-light-01'),at:.08,gain:.75,rate:1.08}],
 'map-hit-2':[swing,{src:sfx('hit-light-01'),at:.08,gain:.9,rate:.9}],
 'map-hit-3':[swing,{src:sfx('hit-heavy-03'),at:.08},{src:sfx('wind-whoosh-03'),at:.3,gain:.6,rate:.85}],
 // Last villain: the jingle ends (~2.75 s) before the map finale opens the final theme (2.92 s).
 'map-victory':[swing,{src:sfx('hit-heavy-03'),at:.08},{src:sfx('wind-whoosh-03'),at:.3,gain:.6,rate:.85},{src:sfx('victory-jingle-04'),at:.45,gain:.8,rate:1.05}],
 'map-contact':[{src:sfx('hurt-bump-01'),gain:.8}],
 'map-appear':[{src:sfx('villain-appear-03'),gain:.45}],
 // A map node opens: a quick airy swipe, then small bells 0.12 s later.
 'map-open':[{src:sfx('open-03'),gain:.9},{src:sfx('twinkle-03'),at:.12,gain:.7}],
};
// Map footsteps, alternated: 0.6 of the effect size (0.15 at the default 25).
export const STEP_CUES={
 'map-step-1':[{src:sfx('step-01'),gain:.6}],
 'map-step-2':[{src:sfx('step-02'),gain:.6}],
};
// Celebration jingles are left to finish: the map finale and its final theme wait for them (celebrating()).
const JINGLES=['map-victory','card-complete'];
// Achievement card cues (map-reward-cards.js), same CC0 library: fly in and out, reveal (the two rarest
// cards take the longer jingle), land in the slot, full set.
export const CARD_CUES={
 'card-whoosh':[{src:sfx('wind-whoosh-03'),gain:.6}],
 'card-reveal':[{src:sfx('reward-01'),gain:.8}],
 'card-epic':[{src:sfx('reward-03'),gain:.8}],
 'card-slot':[{src:sfx('pickup-01'),gain:.8}],
 'card-complete':[{src:sfx('victory-jingle-01'),gain:.8}],
};
export function createAudio(storage){
 let settings={bgm:true,sfx:true,voice:true,volume:25,sfxVolume:25},quiet=false,voiceQuiet=false,unlocked=false,last=0,scene='main',finale=false,finalDone=false,stepTurn=0,ringUntil=0;
 const players={};
 // Effects follow their own size; the music size applies to the background tracks only.
 const effects=createThemeEffects('climate',()=>({enabled:settings.sfx,muted:quiet,volume:settings.sfxVolume/100}),{samples:{...MAP_CUES,...CARD_CUES,...STEP_CUES}});
 try{const s=JSON.parse(storage.getItem(SOUND_KEY));if(s){settings.bgm=s.bgm!==false;settings.sfx=s.sfx!==false;settings.volume=Number.isFinite(s.volume)?Math.max(0,Math.min(100,s.volume)):25;
 // Saves from before the split kept one shared size; start the effect size from it.
 settings.sfxVolume=Number.isFinite(s.sfxVolume)?Math.max(0,Math.min(100,s.sfxVolume)):settings.volume;
 // Voices followed the effect switch until they got their own: older saves carry that value over.
 settings.voice=typeof s.voice==='boolean'?s.voice:settings.sfx;}}catch{}
 const want=()=>finale?'final':scene;
 function player(name){
  let a=players[name];
  if(!a){a=new Audio(tracks[name]);a.loop=name==='main';a.preload='auto';a.addEventListener('ended',()=>{if(name==='final'){finalDone=true;syncMusic();}});players[name]=a;}
  return a;
 }
 function syncMusic(){
  // After the 30-second final theme the ending, certificate and map finale are not left silent:
  // the main theme carries on at 0.45 of its size until the screen or dialog is left.
  const rest=want()==='final'&&finalDone,name=rest?'main':want();
  for(const key in players)if(key!==name)players[key].pause();
  if(!unlocked||!settings.bgm||document.hidden){players[name]?.pause();return;}
  const a=player(name);
  // Ducked under character voices and concept films instead of stopping.
  a.volume=Math.max(0,Math.min(1,settings.volume/100))*(quiet||voiceQuiet?.25:1)*(rest?.45:1);
  if(a.paused)a.play().catch(()=>{});
 }
 function setTrack(nextScene,nextFinale){
  const before=want();scene=nextScene;finale=nextFinale;
  if(want()==='final'&&before!=='final'){finalDone=false;if(players.final)players.final.currentTime=0;}
  syncMusic();
 }
 function stopEffect(){effects.stop();ringUntil=0;}
 // The first gesture also fetches the small map and card cue files (~160 KB) so the first villain greeting is ready.
 function unlock(){unlocked=true;effects.unlock();effects.prepare();syncMusic();}
 // false: sound is not possible yet (no gesture, or the audio context is still waking) and the caller may try again.
 // Interface tones replace one another; fight and reward cues and footsteps are never cut by them (theme-effects.js).
 function effect(name='success'){
  if(!unlocked)return false;
  if(!settings.sfx||quiet||document.hidden)return;
  const now=performance.now();if(name==='tap'&&now-last<100)return;last=now;
  const length=effects.play(name);
  if(typeof length==='number'&&JINGLES.includes(name))ringUntil=now+length*1000;
  return length;
 }
 // One footstep, alternating the two files with a slightly different speed each time; half size under a voice.
 function step(){
  if(!unlocked||!settings.sfx||quiet||document.hidden)return false;
  return effects.step('map-step-'+(stepTurn++%2+1),{gain:voiceQuiet?.5:1,rate:1+(Math.random()*2-1)*.06});
 }
 const visibility=()=>{syncMusic();if(document.hidden)stopEffect();};document.addEventListener('visibilitychange',visibility);
 // A blocked first play() is retried on the next tap.
 const retry=()=>{if(unlocked)syncMusic();};document.addEventListener('pointerdown',retry);
 return {settings,unlock,effect,step,stopSteps:()=>effects.stopStep(),prepareEffects:kinds=>effects.prepare(kinds),
  celebrating:()=>performance.now()<ringUntil,
  music(name){setTrack(name==='final'?'final':'main',finale);},
  // The finale opens after the last card's jingle has finished (map-encounters.js celebrating), so nothing is cut here.
  mapFinale(open){setTrack(scene,!!open);},
  duckVoice(value){voiceQuiet=value;syncMusic();},
  // A concept film mutes new effects; the completion tone that is already ringing is left to finish.
  quiet(value){quiet=value;syncMusic();},
  save(){effects.sync();syncMusic();if(!settings.sfx)stopEffect();try{storage.setItem(SOUND_KEY,JSON.stringify(settings));}catch{}},
  // The header button covers music, effects and voices together.
  anyOn:()=>settings.bgm||settings.sfx||settings.voice,
  // true once a gesture has happened: before it, a voice is not tried at all (the browser would refuse it).
  ready:()=>unlocked,
  toggle(){const on=!(settings.bgm||settings.sfx||settings.voice);settings.bgm=on;settings.sfx=on;settings.voice=on;this.save();if(on)effect('tap');},
  dispose(){effects.dispose();for(const key in players)players[key].pause();stopEffect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerdown',retry);}};
}
