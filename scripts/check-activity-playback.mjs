import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {freshState} from '../src/state.js';
const require=createRequire(import.meta.url),{chromium}=require('../.tools/node_modules/playwright-core');
const out='.tmp/activity-playback';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.BASE_URL||'http://127.0.0.1:5368';let fixture;
await page.route('**/',async route=>{const response=await route.fetch();let html=await response.text();if(fixture){html=html.replace('<head>',`<head><script>localStorage.setItem('climate-future:v1',${JSON.stringify(JSON.stringify(fixture))});</script>`);fixture=null;}await route.fulfill({response,body:html});});
async function load(index,record={}){fixture=freshState();fixture.introSeen=true;for(let i=0;i<index;i++){fixture.records[i]={done:true,workComplete:true};fixture.completed.push(i);}if(index===9)fixture.records[8].plan=['shade','pond','shade','pond','trees','trees'];fixture.records[index]=record;await page.goto('about:blank');await page.goto(base+'/#activity/'+index);await page.locator('.guide-avatar').waitFor();}
const record=i=>page.evaluate(i=>JSON.parse(localStorage.getItem('climate-future:v1')).records[i],i);
try{
 for(const index of [1,2,3,5,6,7,8]){await load(index);assert.equal(await page.locator('[data-playback]').count(),0);}
 checks.push('answer selection and city design have no automatic answer control');
 await load(0);await page.locator('[data-playback]').click();await page.waitForFunction(()=>Number(document.querySelector('.compare-slider').value)>5);
 await page.locator('[data-playback]').click();const paused=(await record(0)).reveal;await page.waitForTimeout(250);assert.equal((await record(0)).reveal,paused);
 await page.locator('.playback-speed select').selectOption('2');await page.locator('[data-playback]').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[0].open===1);assert.equal(await page.locator('[data-playback]').evaluate(e=>e===document.activeElement),true);
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[0].collected?.length===8,{},{timeout:25000});
 assert.equal((await record(0)).done,undefined);assert.equal(await page.locator('.submit').isEnabled(),true);await page.reload();assert.equal((await record(0)).collected.length,8);
 checks.push('observation plays every comparison, pause holds, 2x persists across DOM redraw, final submission stays manual, refresh preserves evidence');
 await load(4);assert.equal(await page.locator('.run').isDisabled(),true);await page.locator('.playback-speed select').selectOption('2');await page.locator('[data-playback]').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[4].ran===true);assert.equal((await record(4)).prediction,undefined);
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[4].round===1);await page.locator('[data-playback]').click();assert.deepEqual((await record(4)).trials[0].prediction,[]);
 await page.locator('[data-predict="school"]').click();await page.locator('[data-playback]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[4].round===2);assert.deepEqual((await record(4)).trials[1].prediction,['school']);
 await page.waitForFunction(()=>{const r=JSON.parse(localStorage.getItem('climate-future:v1')).records[4];return r.round===5&&r.ran;},{},{timeout:15000});
 assert.equal((await record(4)).done,undefined);assert.equal(await page.locator('[data-playback]').count(),0);assert.equal(await page.locator('.next').isEnabled(),true);
 checks.push('water autoplay observes all six conditions without inventing predictions, preserves learner predictions, and leaves final submission manual');
 await load(9);await page.locator('.playback-speed select').selectOption('2');await page.locator('[data-playback]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[9].phase===2,{},{timeout:10000});
 const review=await record(9);assert.deepEqual(Object.keys(review.before).sort(),['heat','rain']);assert.equal(review.verified,undefined);assert.equal(await page.locator('[data-playback]').count(),0);
 await page.locator('.retest').click();await page.locator('.playback-speed select').selectOption('2');await page.locator('[data-playback]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[9].phase===4,{},{timeout:8000});
 assert.deepEqual(Object.keys((await record(9)).after).sort(),['heat','rain']);assert.equal((await record(9)).verified,undefined);assert.equal(await page.locator('.run').isEnabled(),true);
 checks.push('city tests autoplay heat and rain, stop for design review and final approval, and preserve both hazard results');
 await load(0);await page.locator('[data-playback]').click();await page.getByRole('button',{name:'홈',exact:true}).click();const left=await record(0);await page.waitForTimeout(300);assert.deepEqual(await record(0),left);
 checks.push('leaving an activity disposes playback without a late save');
 assert.deepEqual(errors,[]);await writeFile(out+'/result.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});throw error;}finally{await browser.close();}
