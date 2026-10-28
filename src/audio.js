import {SOUND_KEY} from './state.js';
const files={tap:'click_003',collect:'pluck_001',place:'drop_002',connect:'confirmation_002',success:'confirmation_004',hint:'open_001',experiment:'switch_004',retry:'pluck_002'};
export function createAudio(storage){
 let settings={bgm:true,sfx:true,volume:25},ctx,timer,step=0,quiet=false,unlocked=false,current,last=0;
 const players=new Map(),active=new Set();
 try{const s=JSON.parse(storage.getItem(SOUND_KEY));if(s){settings.bgm=s.bgm!==false;settings.sfx=s.sfx!==false;settings.volume=Number.isFinite(s.volume)?Math.max(0,Math.min(100,s.volume)):25;}}catch{}
 const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23];
 function tone(freq,duration,gain){if(!ctx||ctx.state!=='running'||!settings.bgm||quiet||document.hidden)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(gain,ctx.currentTime+.04);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g);g.connect(ctx.destination);active.add(o);o.onended=()=>{active.delete(o);o.disconnect();g.disconnect();};o.start();o.stop(ctx.currentTime+duration+.02);}
 function stopMusic(){for(const o of active){try{o.stop();}catch{}}active.clear();}
 function stopEffect(){if(current){current.pause();current.currentTime=0;current=null;}}
 function unlock(){unlocked=true;try{if(!ctx)ctx=new AudioContext();if(ctx.state==='suspended')ctx.resume().catch(()=>{});if(!timer)timer=setInterval(()=>{if(document.querySelector('dialog[open]'))return;tone(notes[step++%notes.length],1.3,.035*settings.volume/100);},1400);}catch{}}
 function effect(name='success'){
  if(!unlocked||!settings.sfx||quiet||document.hidden)return;
  const now=performance.now();if(name==='tap'&&now-last<100)return;last=now;stopEffect();
  const file=files[name]||files.success;let player=players.get(file);if(!player){player=new Audio(`/assets/audio/${file}.mp3`);player.preload='auto';players.set(file,player);}current=player;player.volume=.4;player.currentTime=0;player.play().catch(()=>{});
 }
 const visibility=()=>{if(document.hidden){stopMusic();stopEffect();}};document.addEventListener('visibilitychange',visibility);
 const retry=()=>{if(!unlocked||ctx?.state==='suspended')unlock();};document.addEventListener('pointerdown',retry);
 return {settings,unlock,effect,quiet(value){quiet=value;if(value)stopMusic();},save(){if(!settings.bgm)stopMusic();if(!settings.sfx)stopEffect();try{storage.setItem(SOUND_KEY,JSON.stringify(settings));}catch{}},toggle(){const on=!(settings.bgm||settings.sfx);settings.bgm=on;settings.sfx=on;this.save();if(on)effect('tap');},dispose(){clearInterval(timer);stopMusic();stopEffect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerdown',retry);ctx?.close();}};
}
