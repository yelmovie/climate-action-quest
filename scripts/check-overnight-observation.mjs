import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {freshState} from '../src/state.js';
const {chromium}=createRequire(import.meta.url)('../.tools/node_modules/playwright-core');
const browser=await chromium.launch({channel:'chrome',headless:true});const out='output/overnight-20261108',checks=[];
try{const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true});const page=await context.newPage();
 let fixture;await page.route('**/',async route=>{const response=await route.fetch();let html=await response.text();if(fixture){html=html.replace('<head>',`<head><script>localStorage.setItem('climate-future:v1',${JSON.stringify(JSON.stringify(fixture))});</script>`);fixture=null;}await route.fulfill({response,body:html});});
 async function open(index){fixture=freshState();fixture.introSeen=true;for(let i=0;i<index;i++){fixture.completed.push(i);fixture.records[i]={done:true,workComplete:true};}await page.goto('about:blank');await page.goto('http://127.0.0.1:5368/#activity/'+index);await page.locator('.guide-avatar').waitFor();}
 await open(4);await page.locator('.playback-speed select').selectOption('0.5');await page.locator('[data-playback]').tap();await page.locator('[data-predict=school]').tap();assert.equal(await page.locator('[data-playback]').getAttribute('aria-pressed'),'false');await page.waitForTimeout(2000);let record=await page.evaluate(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[4]);assert.deepEqual(record.prediction,['school']);assert.notEqual(record.ran,true);checks.push('Learner prediction pauses the pending demonstration before it can run');
 await page.locator('.run').tap();await page.locator('.next').tap();record=await page.evaluate(()=>JSON.parse(localStorage.getItem('climate-future:v1')).records[4]);assert.deepEqual(record.trials[0].prediction,['school']);checks.push('Manual trial preserves the learner prediction');
 for(const [width,height] of [[1920,1080],[1280,800],[1024,768]]){await page.setViewportSize({width,height});await open(0);const image=page.locator('.observation-art');await image.evaluate(i=>i.decode());assert.ok((await image.getAttribute('src')).endsWith('scene-observe-v2.webp'));await page.screenshot({path:`${out}/observation-new-${width}.png`});}checks.push('New illustration loads at three classroom sizes');
 await writeFile(out+'/observation-check.json',JSON.stringify({checks},null,2));console.log(checks);await context.close();}finally{await browser.close();}
