import { createThemeEffects } from './theme-effects.js';
import {SOUND_KEY} from './state.js';
// Suno tracks (originals in references/suno). The main theme loops; the final theme plays once and then rests.
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
};
export function createAudio(storage){
 let settings={bgm:true,sfx:true,volume:25,sfxVolume:25},quiet=false,voiceQuiet=false,unlocked=false,last=0,scene='main',finale=false,finalDone=false;
 const players={};
 // Effects follow their own size; the music size applies to the background tracks only.
 const effects=createThemeEffects('climate',()=>({enabled:settings.sfx,muted:quiet,volume:settings.sfxVolume/100}),{samples:MAP_CUES});
 try{const s=JSON.parse(storage.getItem(SOUND_KEY));if(s){settings.bgm=s.bgm!==false;settings.sfx=s.sfx!==false;settings.volume=Number.isFinite(s.volume)?Math.max(0,Math.min(100,s.volume)):25;
 // Saves from before the split kept one shared size; start the effect size from it.
 settings.sfxVolume=Number.isFinite(s.sfxVolume)?Math.max(0,Math.min(100,s.sfxVolume)):settings.volume;}}catch{}
 const want=()=>finale?'final':scene;
 function player(name){
  let a=players[name];
  if(!a){a=new Audio(tracks[name]);a.loop=name==='main';a.preload='auto';a.addEventListener('ended',()=>{if(name==='final')finalDone=true;});players[name]=a;}
  return a;
 }
 function syncMusic(){
  const name=want();
  for(const key in players)if(key!==name)players[key].pause();
  if(!unlocked||!settings.bgm||document.hidden||name==='final'&&finalDone){players[name]?.pause();return;}
  const a=player(name);
  // Ducked under character voices and concept films instead of stopping.
  a.volume=Math.max(0,Math.min(1,settings.volume/100))*(quiet||voiceQuiet?.25:1);
  if(a.paused)a.play().catch(()=>{});
 }
 function setTrack(nextScene,nextFinale){
  const before=want();scene=nextScene;finale=nextFinale;
  if(want()==='final'&&before!=='final'){finalDone=false;if(players.final)players.final.currentTime=0;}
  syncMusic();
 }
 function stopEffect(){effects.stop();}
 // The first gesture also fetches the small map cue files (~70 KB) so the first villain greeting is ready.
 function unlock(){unlocked=true;effects.unlock();effects.prepare();syncMusic();}
 function effect(name='success'){
  if(!unlocked||!settings.sfx||quiet||document.hidden)return;
  const now=performance.now();if(name==='tap'&&now-last<100)return;last=now;stopEffect();
  effects.play(name);
 }
 const visibility=()=>{syncMusic();if(document.hidden)stopEffect();};document.addEventListener('visibilitychange',visibility);
 // A blocked first play() is retried on the next tap.
 const retry=()=>{if(unlocked)syncMusic();};document.addEventListener('pointerdown',retry);
 return {settings,unlock,effect,prepareEffects:kinds=>effects.prepare(kinds),
  music(name){setTrack(name==='final'?'final':'main',finale);},
  mapFinale(open){setTrack(scene,!!open);},
  duckVoice(value){voiceQuiet=value;syncMusic();},
  quiet(value){quiet=value;if(value)stopEffect();syncMusic();},
  save(){effects.sync();syncMusic();if(!settings.sfx)stopEffect();try{storage.setItem(SOUND_KEY,JSON.stringify(settings));}catch{}},
  toggle(){const on=!(settings.bgm||settings.sfx);settings.bgm=on;settings.sfx=on;this.save();if(on)effect('tap');},
  dispose(){effects.dispose();for(const key in players)players[key].pause();stopEffect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerdown',retry);}};
}
