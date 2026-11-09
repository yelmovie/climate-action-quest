import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {freshState} from '../src/state.js';
import {CONCEPT_DURATION} from '../src/concept-data.js';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright-core'));}catch{({chromium}=require('../.tools/node_modules/playwright-core'));}
const base=process.env.BASE_URL||'http://localhost:4275',checks=[];
const ranged=await fetch(base+'/assets/concepts/water.mp4',{headers:{Range:'bytes=0-1'}});assert.equal(ranged.status,206);assert.equal((await ranged.arrayBuffer()).byteLength,2);assert.equal(ranged.headers.get('content-type'),'video/mp4');checks.push('server MP4 byte ranges + MIME');
const invalid=await fetch(base+'/assets/concepts/water.mp4',{headers:{Range:'bytes=999999999-'}});assert.equal(invalid.status,416);
const browser=await chromium.launch({executablePath:process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox'],env:{...process.env,TEMP:process.cwd()+'/.tmp',TMP:process.cwd()+'/.tmp'}});
const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=freshState();state.introSeen=true;for(let i=0;i<10;i++){state.completed.push(i);state.records[i]={done:true,workComplete:true};}state.records[8].plan=['shade','pond','shade','pond','trees','trees'];
await page.addInitScript(state=>{if(location.protocol.startsWith('http'))localStorage.setItem('climate-future:v1',JSON.stringify(state));window.soundEvents=[];const native=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this.tagName==='AUDIO')window.soundEvents.push({src:this.src,volume:this.volume});return native.call(this);};},state);
try{
 await page.goto(base+'/#facility/2');await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:30000});
 await context.setOffline(true);await page.reload();await page.locator('[data-clip="4"]').click();await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);assert.equal(Math.round(await page.locator('video').evaluate(v=>v.duration)),CONCEPT_DURATION);await page.locator('.dialog-close').click();await page.locator('video').waitFor({state:'detached'});checks.push('offline reload + WebM concept');
 const cacheRange=await page.evaluate(async()=>{const r=await fetch('/assets/concepts/water.mp4',{headers:{Range:'bytes=0-1'}});return {status:r.status,size:(await r.arrayBuffer()).byteLength};});assert.deepEqual(cacheRange,{status:206,size:2});checks.push('offline cached MP4 byte ranges');
 await page.evaluate(()=>{const native=HTMLMediaElement.prototype.canPlayType;HTMLMediaElement.prototype.canPlayType=function(t){return t.includes('webm')?'':native.call(this,t);};});await page.locator('[data-clip="4"]').click();await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);assert.ok((await page.locator('video').getAttribute('src')).endsWith('.mp4'));await page.locator('video').evaluate(v=>v.currentTime=6.2);await page.waitForFunction(()=>document.querySelector('video').currentTime>=6);await page.locator('.dialog-close').click();await page.locator('video').waitFor({state:'detached'});checks.push('offline H.264 fallback + seeking');
 // Effects became procedural Web Audio in 866a6d0 (no <audio> files); mute/volume/priority are covered by tests/theme-effects.test.mjs.
 await page.goto(base+'/#activity/8');await page.locator('.guide-avatar').click();await page.locator('.help-close').waitFor();await page.locator('.help-close').click();checks.push('hint opens and closes offline');
 assert.deepEqual(errors,[]);await writeFile('.tmp/experience-check/delivery.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));
}finally{await browser.close();}
