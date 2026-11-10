import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require('../.tools/node_modules/playwright-core');
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),base=process.env.BASE_URL||'http://127.0.0.1:5357',checks=[];
await page.addInitScript(()=>{const Native=window.Audio;window.voicePlayers=[];window.Audio=function(...args){const a=new Native(...args);window.voicePlayers.push(a);return a;};window.oscillatorStarts=0;const old=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const o=old.call(this),start=o.start.bind(o);o.start=(...args)=>{window.oscillatorStarts++;return start(...args);};return o;};});
const playing=()=>page.evaluate(()=>window.voicePlayers.filter(a=>!a.paused).length);
const start=async()=>{await page.locator('[data-voice="welcome-1"]').click();await page.waitForFunction(()=>window.voicePlayers.some(a=>!a.paused&&a.currentTime>.05));};
try{
 await page.goto(base+'/#home');await start();assert.equal(await playing(),1);const n=await page.evaluate(()=>oscillatorStarts);await page.waitForTimeout(1700);assert.equal(await page.evaluate(()=>oscillatorStarts),n);checks.push('BGM oscillator scheduling stays ducked during actual voice playback');
 await page.locator('[data-voice="welcome-1"]').click();assert.equal(await playing(),0);await page.waitForTimeout(1700);assert.ok(await page.evaluate(()=>oscillatorStarts)>n);checks.push('stop restores background music');
 await start();await page.locator('[data-voice="home-bubble-new"]').click();assert.ok(await playing()<=1);checks.push('switch to second voice leaves only one media player active');
 await page.locator('[data-sound]').click();assert.equal(await playing(),0);await page.locator('[data-voice="welcome-1"]').click();assert.equal(await playing(),0);assert.match(await page.locator('.npc-welcome-voice').innerText(),/소리를 켜면/);await page.locator('[data-sound]').click();checks.push('global mute stops and blocks voices');
 await start();await page.locator('#mission-story').click();await page.locator('.story-dialog').waitFor();assert.ok(await playing()<=1);await page.keyboard.press('Escape');assert.equal(await playing(),0);checks.push('story replacement and Escape clean up media');
 await start();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await playing(),0);await page.evaluate(()=>delete document.hidden);checks.push('simulated visibilitychange stops native playback');
 await start();await page.evaluate(()=>{location.hash='map';});await page.locator('.map-screen').waitFor();assert.equal(await playing(),0);checks.push('hash route change stops native playback');
 await page.goto(base+'/#home');await page.route('**/assets/audio/voices/welcome-1.mp3',r=>r.abort());await page.locator('[data-voice="welcome-1"]').click();await page.getByText('음성을 불러오지 못했어요. 화면의 글을 읽고 계속할 수 있어요.',{exact:true}).waitFor();assert.equal(await playing(),0);checks.push('network failure leaves text and learning controls available');
 await mkdir('.tmp/voice-check',{recursive:true});await writeFile('.tmp/voice-check/controls.json',JSON.stringify({checks,humanListening:false},null,2));console.log(checks);
}finally{await browser.close();}
