import { createThemeEffects } from './theme-effects.js';
import {SOUND_KEY} from './state.js';
// Suno tracks (originals in references/suno). The main theme loops; the final theme plays once and then rests.
const tracks={main:'/assets/audio/bgm/main-theme.mp3',final:'/assets/audio/bgm/final-theme.mp3'};
export function createAudio(storage){
 let settings={bgm:true,sfx:true,volume:25},quiet=false,voiceQuiet=false,unlocked=false,last=0,scene='main',finale=false,finalDone=false;
 const players={};
 const effects=createThemeEffects('climate',()=>({enabled:settings.sfx,muted:quiet,volume:settings.volume/100}));
 try{const s=JSON.parse(storage.getItem(SOUND_KEY));if(s){settings.bgm=s.bgm!==false;settings.sfx=s.sfx!==false;settings.volume=Number.isFinite(s.volume)?Math.max(0,Math.min(100,s.volume)):25;}}catch{}
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
 function unlock(){unlocked=true;effects.unlock();syncMusic();}
 function effect(name='success'){
  if(!unlocked||!settings.sfx||quiet||document.hidden)return;
  const now=performance.now();if(name==='tap'&&now-last<100)return;last=now;stopEffect();
  effects.play(name);
 }
 const visibility=()=>{syncMusic();if(document.hidden)stopEffect();};document.addEventListener('visibilitychange',visibility);
 // A blocked first play() is retried on the next tap.
 const retry=()=>{if(unlocked)syncMusic();};document.addEventListener('pointerdown',retry);
 return {settings,unlock,effect,
  music(name){setTrack(name==='final'?'final':'main',finale);},
  mapFinale(open){setTrack(scene,!!open);},
  duckVoice(value){voiceQuiet=value;syncMusic();},
  quiet(value){quiet=value;if(value)stopEffect();syncMusic();},
  save(){effects.sync();syncMusic();if(!settings.sfx)stopEffect();try{storage.setItem(SOUND_KEY,JSON.stringify(settings));}catch{}},
  toggle(){const on=!(settings.bgm||settings.sfx);settings.bgm=on;settings.sfx=on;this.save();if(on)effect('tap');},
  dispose(){effects.dispose();for(const key in players)players[key].pause();stopEffect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerdown',retry);}};
}
