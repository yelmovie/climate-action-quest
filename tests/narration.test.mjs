import test from 'node:test';
import assert from 'node:assert/strict';
const listeners={};
class Element {constructor(){this.style={};this.dataset={};this.isConnected=true;this.attrs={};}setAttribute(k,v){this.attrs[k]=v;}contains(e){return e===this;}append(...items){this.children=items;}}
globalThis.document={hidden:false,documentElement:{},createElement:()=>new Element(),addEventListener:(event,fn)=>{(listeners[event]??=[]).push(fn);}};
globalThis.window={addEventListener:(event,fn)=>{(listeners[event]??=[]).push(fn);}};
globalThis.MutationObserver=class{constructor(fn){listeners.mutation=[fn];}observe(){}};
let players=[],pending;
globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;players.push(this);}play(){this.paused=false;return pending||Promise.resolve();}pause(){this.paused=true;}removeAttribute(){this.src='';}load(){}};
const {configureNarration,voiceControl,stopNarration}=await import('../src/narration.js');
const duck=[],audio={settings:{sfx:true},duckVoice:v=>duck.push(v)};configureNarration(audio);
const host=()=>new Element();const emit=(event,e={})=>listeners[event]?.forEach(fn=>fn(e));
test('single voice, stop/replay, ended and stale rejected play never stop newer voice',async()=>{
 const a=voiceControl(host(),'story-1'),b=voiceControl(host(),'story-2');await a.onclick();assert.equal(duck.at(-1),true);const first=players.at(-1);await b.onclick();assert.equal(first.paused,true);assert.equal(players.filter(p=>!p.paused).length,1);players.at(-1).onended();assert.equal(duck.at(-1),false);assert.equal(b.attrs['aria-pressed'],'false');await b.onclick();assert.equal(b.attrs['aria-pressed'],'true');await b.onclick();assert.equal(players.at(-1).paused,true);
 let reject;pending=new Promise((_,r)=>reject=r);const old=a.onclick();pending=null;await b.onclick();reject(Error('stale'));await old;assert.equal(b.attrs['aria-pressed'],'true');stopNarration();
});
test('mute, hidden page, route, dialog close, detached control and errors release music',async()=>{
 const h=host(),a=voiceControl(h,'hint-0');audio.settings.sfx=false;const count=players.length;await a.onclick();assert.equal(players.length,count);audio.settings.sfx=true;
 for(const event of ['pagehide','popstate','hashchange','close']){await a.onclick();emit(event);assert.equal(a.attrs['aria-pressed'],'false');assert.equal(duck.at(-1),false);}
 await a.onclick();document.hidden=true;emit('visibilitychange');assert.equal(a.attrs['aria-pressed'],'false');document.hidden=false;
 await a.onclick();a.isConnected=false;emit('mutation');assert.equal(a.attrs['aria-pressed'],'false');a.isConnected=true;
 await a.onclick();players.at(-1).onerror();assert.match(h.children[1].textContent,/불러오지/);assert.equal(duck.at(-1),false);
});
