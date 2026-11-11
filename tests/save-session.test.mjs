import test from 'node:test';
import assert from 'node:assert/strict';
import {SAVE_KEY,freshState,createSaveSession} from '../src/state.js';
const memory=(raw=null)=>{const values=new Map(raw===null?[]:[[SAVE_KEY,raw]]);return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};};
test('malformed and future saves stay intact',()=>{for(const raw of ['{broken','{"version":2}','[]','null']){const s=memory(raw),session=createSaveSession(s);assert.equal(session.save(freshState()).ok,false);assert.equal(s.getItem(SAVE_KEY),raw);}});
test('another tab cannot silently overwrite a newer save',()=>{const s=memory(),a=createSaveSession(s),b=createSaveSession(s);assert.equal(a.save(freshState()).ok,true);assert.equal(b.save(freshState()).reason,'conflict');});
test('demo state does not reach durable storage',()=>{const s=memory(),session=createSaveSession(s),state=freshState();state.adminUnlocked=true;assert.equal(session.save(state).reason,'preview');assert.equal(s.getItem(SAVE_KEY),null);});
test('reset keeps the exact previous save and fails safely on backup failure',()=>{const raw=JSON.stringify({...freshState(),introSeen:true}),s=memory(raw),session=createSaveSession(s);assert.equal(session.reset().ok,true);assert.equal(s.getItem(SAVE_KEY+':before-reset'),raw);assert.equal(JSON.parse(s.getItem(SAVE_KEY)).introSeen,false);const bad=memory(raw);bad.setItem=()=>{throw Error('full');};assert.equal(createSaveSession(bad).reset().ok,false);assert.equal(bad.getItem(SAVE_KEY),raw);});

test('a separate mission uses the same conflict and backup protection without touching inquiry records',()=>{
 const storage=memory(JSON.stringify(freshState()));
 const key='science-play-16-v1';
 const createState=()=>({version:1,level:0,plans:[]});
 const options={key,createState,normalize:raw=>({...createState(),...raw})};
 const first=createSaveSession(storage,options);
 const second=createSaveSession(storage,options);
 const mainRecord=storage.getItem(SAVE_KEY);
 const mission={...createState(),level:1,plans:[['park']]};
 assert.equal(first.save(mission).ok,true);
 assert.equal(storage.getItem(key),JSON.stringify(mission));
 assert.equal(second.save(createState()).reason,'conflict');
 assert.equal(first.reset().ok,true);
 assert.equal(storage.getItem(key+':before-reset'),JSON.stringify(mission));
 assert.equal(storage.getItem(SAVE_KEY),mainRecord);
 storage.setItem(key,'{broken');
 assert.equal(createSaveSession(storage,options).save(createState()).ok,false);
 assert.equal(storage.getItem(key),'{broken');
});
