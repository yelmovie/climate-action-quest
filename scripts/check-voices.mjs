import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {freshState} from '../src/state.js';
import {voiceLines} from '../src/voice-lines.js';
const require=createRequire(import.meta.url),{chromium}=require('../.tools/node_modules/playwright-core');
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:process.env.VIEWPORT?JSON.parse(process.env.VIEWPORT):{width:1280,height:800},serviceWorkers:'block',reducedMotion:'reduce'});
const base=process.env.BASE_URL||'http://127.0.0.1:5357',playback=process.argv.includes('--playback'),seen=[],errors=[];
const final=(JSON.parse(await readFile('.tmp/full-journey/result.json'))).state;
let fixture;
await page.route('**/',async route=>{const response=await route.fetch();let html=await response.text();if(fixture){html=html.replace('<head>',`<head><script>localStorage.clear();localStorage.setItem('climate-future:v1',${JSON.stringify(JSON.stringify(fixture))});</script>`);fixture=null;}await route.fulfill({response,body:html});});
await page.addInitScript(()=>{const Native=window.Audio;window.voicePlayers=[];window.Audio=function(...args){const a=new Native(...args);a.dataset.voiceId=args[0]?.split('/').pop()?.replace('.mp3','');window.voicePlayers.push(a);a.addEventListener('ended',()=>a.dataset.ended='true');return a;};});
page.on('pageerror',e=>errors.push(e.message));
async function load(route,s=final){fixture=structuredClone(s);await page.goto('about:blank');await page.goto(base+'/#'+route);await page.locator('.screen').waitFor();}
async function check(id){const b=page.locator(`[data-voice="${id}"]`);await b.waitFor({state:'visible'});assert.equal(await b.count(),1);if(!playback&&process.env.CHECK_CLICKS)await b.click();if(playback){if(await b.getAttribute('aria-pressed')==='true')await b.click();await b.click();await page.waitForFunction(id=>window.voicePlayers.some(a=>a.src.endsWith('/'+id+'.mp3')&&!a.paused),id);await page.waitForFunction(id=>window.voicePlayers.some(a=>a.dataset.ended==='true'&&a.dataset.voiceId===id),id,{timeout:60000});assert.equal(await b.getAttribute('aria-pressed'),'false');}seen.push(id);console.log('PASS',id,playback?'actual Chrome ended':'screen connection');}
try{
 await load('home',freshState());await check('welcome-1');await check('home-bubble-new');
 await page.locator('#mission-story').click();for(let i=1;i<=3;i++){await check('story-'+i);await page.locator('.story-next').click();}
 await load('home');await check('home-bubble-back');
 for(let i=0;i<=5;i++){const s=structuredClone(final);s.completed=s.completed.filter(n=>n<i*2);await load('map',s);await page.locator('.companion-talk').click();await check('map-'+i);}
 for(let i=0;i<5;i++){await load('facility/'+i);if(await page.locator('.guide-character').isVisible())await page.locator('.guide-character').click();await check('facility-'+i);}
 for(let i=0;i<10;i++){const s=structuredClone(final);s.records[i]={};await load('activity/'+i,s);await page.locator('.guide-avatar').click();await check(i===4?'hint-4a':'hint-'+i);if(i===4){await page.locator('.help-close').click();await page.locator('[data-predict="beach"]').click();await page.locator('.run').click();await page.locator('.guide-avatar').click();await check('hint-4b');}}
 for(const i of [3,5,6,7,8]){const s=structuredClone(final);s.records[i]={};await load('activity/'+i,s);if(i===3)await page.locator('[data-link="1"]').click();if(i===5)for(const n of [2,1,0])await page.locator(`[data-part="${n}"]`).click();if(i===6)await page.locator('[data-choice="2"]').click();if(i===7)await page.getByRole('button',{name:'B의 선택',exact:true}).click();if(i===8){await page.locator('[data-tool="refuge"]').click();for(let j=0;j<6;j++)await page.locator(`[data-district="${j}"]`).click();}await check('retry-'+i);}
 // Finish each final research unit through its actual controls using the earned journey's records.
 for(let i=0;i<5;i++){const n=i*2+1,s=structuredClone(final);s.completed=s.completed.filter(x=>x<n);s.records[n]={...s.records[n],done:false,workComplete:false};if(n===1){s.records[n].round=7;s.records[n].checked=true;}if(n===3){s.records[n].round=7;s.records[n].checked=true;}if(n===5){s.records[n].round=7;s.records[n].order=[0,1,2];s.records[n].checked=true;}if(n===7){s.records[n].round=4;s.records[n].practice=1;}if(n===9)s.records[n].phase=4;await load('activity/'+n,s);await page.locator(n===7?'.submit':n===9?'.run':'.check').click();await check('badge-'+i);}
 const s=structuredClone(final);s.finalized=false;await load('ending',s);await check('ending-1');await load('ending');await check('ending-2');
 assert.deepEqual([...new Set(seen)].sort(),Object.keys(voiceLines).sort());assert.deepEqual(errors,[]);
 await mkdir('.tmp/voice-check',{recursive:true});await writeFile('.tmp/voice-check/'+(playback?'playback':'connections')+'-'+page.viewportSize().width+'x'+page.viewportSize().height+'.json',JSON.stringify({seen,errors,playback,humanListening:false},null,2));
}finally{await browser.close();}
