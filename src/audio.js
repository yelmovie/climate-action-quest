import { createThemeEffects } from './theme-effects.js';
import {SOUND_KEY} from './state.js';
export function createAudio(storage){
 let settings={bgm:true,sfx:true,volume:25},ctx,musicGain,timer,step=0,quiet=false,voiceQuiet=false,storyMusic=false,unlocked=false,current,last=0;
 const active=new Set();
 const effects=createThemeEffects('climate',()=>({enabled:settings.sfx,muted:quiet,volume:settings.volume/100}));
 try{const s=JSON.parse(storage.getItem(SOUND_KEY));if(s){settings.bgm=s.bgm!==false;settings.sfx=s.sfx!==false;settings.volume=Number.isFinite(s.volume)?Math.max(0,Math.min(100,s.volume)):25;}}catch{}
 const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23];
 function tone(freq,duration,gain){if(!ctx||ctx.state!=='running'||!settings.bgm||quiet||(voiceQuiet&&!storyMusic)||document.hidden)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(gain,ctx.currentTime+.04);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g);g.connect(musicGain);active.add(o);o.onended=()=>{active.delete(o);o.disconnect();g.disconnect();};o.start();o.stop(ctx.currentTime+duration+.02);}
 function stopMusic(){for(const o of active){try{o.stop();}catch{}}active.clear();}
 function stopEffect(){effects.stop();}
 function unlock(){unlocked=true;effects.unlock();try{if(!ctx){ctx=new AudioContext();musicGain=ctx.createGain();musicGain.connect(ctx.destination);musicGain.gain.value=voiceQuiet ? 0.25 : 1;}if(ctx.state==='suspended')ctx.resume().catch(()=>{});if(!timer)timer=setInterval(()=>{if(document.querySelector('dialog[open]')&&!storyMusic)return;tone(notes[step++%notes.length],1.3,.035*settings.volume/100);},1400);}catch{}}
 function effect(name='success'){
  if(!unlocked||!settings.sfx||quiet||document.hidden)return;
  const now=performance.now();if(name==='tap'&&now-last<100)return;last=now;stopEffect();
  effects.play(name);
 }
 const visibility=()=>{if(document.hidden){stopMusic();stopEffect();}};document.addEventListener('visibilitychange',visibility);
 const retry=()=>{if(!unlocked||ctx?.state==='suspended')unlock();};document.addEventListener('pointerdown',retry);
 return {settings,unlock,effect,duckVoice(value){
  voiceQuiet=value;
  musicGain?.gain.setTargetAtTime(value ? 0.25 : 1,ctx.currentTime,.12);
  if(value&&!storyMusic)stopMusic();
 },storyMusic(value){
  storyMusic=value;
  if(!value)stopMusic();
 },quiet(value){quiet=value;if(value){stopMusic();stopEffect();}},save(){effects.sync();if(!settings.bgm)stopMusic();if(!settings.sfx)stopEffect();try{storage.setItem(SOUND_KEY,JSON.stringify(settings));}catch{}},toggle(){const on=!(settings.bgm||settings.sfx);settings.bgm=on;settings.sfx=on;this.save();if(on)effect('tap');},dispose(){effects.dispose();clearInterval(timer);stopMusic();stopEffect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerdown',retry);ctx?.close();}};
}
