import test from 'node:test';
import assert from 'node:assert/strict';
const listeners={};
class Element {constructor(){this.style={};this.dataset={};this.isConnected=true;this.attrs={};}setAttribute(k,v){this.attrs[k]=v;}contains(e){return e===this;}append(...items){this.children=items;}}
globalThis.document={hidden:false,documentElement:{},createElement:()=>new Element(),addEventListener:(event,fn)=>{(listeners[event]??=[]).push(fn);}};
globalThis.window={addEventListener:(event,fn)=>{(listeners[event]??=[]).push(fn);}};
globalThis.MutationObserver=class{constructor(fn){listeners.mutation=[fn];}observe(){}};
let players=[],pending;
globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;players.push(this);}play(){this.paused=false;return pending||Promise.resolve();}pause(){this.paused=true;}removeAttribute(){this.src='';}load(){}};
const {configureNarration,voiceControl,stopNarration,playVillainVoice,isVillainSpeaking,yieldNarration}=await import('../src/narration.js');
const duck=[],audio={settings:{sfx:true},duckVoice:v=>duck.push(v)};configureNarration(audio);
const host=()=>new Element();const emit=(event,e={})=>listeners[event]?.forEach(fn=>fn(e));
test('single voice, stop/replay, ended and stale rejected play never stop newer voice',async()=>{
 const a=voiceControl(host(),'story-1'),b=voiceControl(host(),'story-2');await a.onclick();assert.equal(duck.at(-1),true);const first=players.at(-1);await b.onclick();assert.equal(first.paused,true);assert.equal(players.filter(p=>!p.paused).length,1);players.at(-1).onended();assert.equal(duck.at(-1),false);assert.equal(b.attrs['aria-pressed'],'false');await b.onclick();assert.equal(b.attrs['aria-pressed'],'true');await b.onclick();assert.equal(players.at(-1).paused,true);
 let reject;pending=new Promise((_,r)=>reject=r);const old=a.onclick();pending=null;await b.onclick();reject(Error('stale'));await old;assert.equal(b.attrs['aria-pressed'],'true');stopNarration();
});
test('speaking mark follows audible playback and rests while the voice buffers or pauses',async()=>{
 const a=voiceControl(host(),'story-1');await a.onclick();const first=players.at(-1);assert.equal(a.dataset.voicePlaying,'true');
 first.onwaiting();assert.equal(a.dataset.voicePlaying,undefined);assert.equal(a.attrs['aria-pressed'],'true');
 first.onplaying();assert.equal(a.dataset.voicePlaying,'true');
 first.onpause();assert.equal(a.dataset.voicePlaying,undefined);
 const b=voiceControl(host(),'story-2');await b.onclick();first.onplaying();assert.equal(a.dataset.voicePlaying,undefined);assert.equal(b.dataset.voicePlaying,'true');stopNarration();
});
test('mute, hidden page, route, dialog close, detached control and errors release music',async()=>{
 const h=host(),a=voiceControl(h,'hint-0');audio.settings.sfx=false;const count=players.length;await a.onclick();assert.equal(players.length,count);audio.settings.sfx=true;
 for(const event of ['pagehide','popstate','hashchange','close']){await a.onclick();emit(event);assert.equal(a.attrs['aria-pressed'],'false');assert.equal(duck.at(-1),false);}
 await a.onclick();document.hidden=true;emit('visibilitychange');assert.equal(a.attrs['aria-pressed'],'false');document.hidden=false;
 await a.onclick();a.isConnected=false;emit('mutation');assert.equal(a.attrs['aria-pressed'],'false');a.isConnected=true;
 await a.onclick();players.at(-1).onerror();assert.match(h.children[1].textContent,/불러오지/);assert.equal(duck.at(-1),false);
});
const turn=()=>new Promise(r=>setTimeout(r,2));
test('a villain line never cuts another character: it waits for the line to end or is skipped, and a newer villain line replaces an older one',async()=>{
 const a=voiceControl(host(),'story-1');await a.onclick();const guide=players.at(-1),count=players.length;
 assert.equal(playVillainVoice('villain-1-1'),false);
 assert.deepEqual([guide.paused,players.length,isVillainSpeaking()],[false,count,false]);
 guide.onended();await turn();
 assert.match(players.at(-1).src,/el-villain-1-1\.mp3$/);assert.deepEqual([players.at(-1).paused,isVillainSpeaking()],[false,true]);
 const first=players.at(-1);assert.equal(playVillainVoice('villain-1-2'),true);
 assert.deepEqual([first.paused,players.filter(p=>!p.paused).length,isVillainSpeaking()],[true,1,true]);
 players.at(-1).onended();assert.equal(isVillainSpeaking(),false);
 // The map got blocked meanwhile (a dialog, a card): the waiting line is dropped.
 await a.onclick();const again=players.length;playVillainVoice('villain-1-1',()=>false);players.at(-1).onended();await turn();assert.equal(players.length,again);
 // A guide line that takes over at once keeps its turn.
 const b=voiceControl(host(),'story-2');await a.onclick();playVillainVoice('villain-1-1');await b.onclick();await turn();
 assert.match(players.at(-1).src,/story-2/);assert.deepEqual([players.filter(p=>!p.paused).length,isVillainSpeaking()],[1,false]);stopNarration();
 assert.equal(playVillainVoice('no-such-line'),false);
});
test('a guide voice waits for a villain line that already started, two seconds at most',async t=>{
 playVillainVoice('villain-1-3');const villain=players.at(-1),count=players.length;
 const a=voiceControl(host(),'story-1'),clicked=a.onclick();await turn();
 assert.deepEqual([villain.paused,players.length,a.dataset.voiceWaiting],[false,count,'true']);
 a.onclick();villain.onended();await clicked;
 assert.deepEqual([players.length,players.at(-1).paused,a.attrs['aria-pressed'],a.dataset.voiceWaiting],[count+1,false,'true',undefined]);
 stopNarration();
 t.mock.timers.enable({apis:['setTimeout']});
 playVillainVoice('villain-1-3');const long=players.at(-1),late=a.onclick();
 t.mock.timers.tick(1999);await Promise.resolve();assert.equal(long.paused,false);
 t.mock.timers.tick(1);await late;
 assert.deepEqual([long.paused,players.at(-1).paused,a.attrs['aria-pressed']],[true,false,'true']);
 // A dialog that opens stops a guide voice at once and gives a villain line two seconds.
 stopNarration();await a.onclick();yieldNarration();assert.equal(players.at(-1).paused,true);
 playVillainVoice('villain-1-3');const under=players.at(-1);yieldNarration();assert.equal(under.paused,false);
 t.mock.timers.tick(1999);assert.equal(under.paused,false);t.mock.timers.tick(1);assert.deepEqual([under.paused,isVillainSpeaking()],[true,false]);
 // A newer line is not cut by an older dialog's timer.
 playVillainVoice('villain-1-3');yieldNarration();t.mock.timers.tick(1000);playVillainVoice('villain-1-1');const newer=players.at(-1);t.mock.timers.tick(1000);assert.equal(newer.paused,false);
 t.mock.timers.reset();stopNarration();
});
