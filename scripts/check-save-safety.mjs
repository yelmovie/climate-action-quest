import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {freshState,SAVE_KEY} from '../src/state.js';
const require=createRequire(import.meta.url),{chromium}=require('../.tools/node_modules/playwright-core');
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base=process.env.BASE_URL||'http://127.0.0.1:5356',checks=[],errors=[];
await mkdir('.tmp/safety-check',{recursive:true});
const context=await browser.newContext(),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
async function seed(raw,route='home'){await page.goto(base);await page.evaluate(({raw,key,route})=>{localStorage.setItem(key,raw);history.replaceState(null,'','#'+route);},{raw,key:SAVE_KEY,route});await page.reload();await page.locator('h1').first().waitFor();}
async function teacher(){await page.locator('[data-settings]').click();await page.locator('.settings-dialog details').evaluateAll(items=>items.forEach(e=>e.open=true));await page.locator('#admin-unlock').click();await page.locator('#close-settings').click();}
await seed(JSON.stringify({...freshState(),introSeen:true}));const before=await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY);await teacher();await page.goto(base+'/#activity/0');await page.locator('.scan-hotspot').first().click();assert.equal(await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY),before);await teacher();await page.locator('.teacher-pad').waitFor({state:'detached'});assert.equal(await page.locator('.teacher-pad').count(),0);assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records,SAVE_KEY),{});checks.push('teacher exploration leaves student evidence unchanged; exit restores');
await seed('{broken');await page.locator('#save-protection').waitFor();await page.goto(base+'/#activity/0');assert.equal(await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY),'{broken');checks.push('corrupt original protected across navigation');
await seed(JSON.stringify({...freshState(),introSeen:true}));const other=await context.newPage();await other.goto(base);await other.evaluate(key=>localStorage.setItem(key,JSON.stringify({version:1,newer:'other-tab'})),SAVE_KEY);await page.goto(base+'/#activity/0');await page.locator('#save-protection').waitFor();assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).newer,SAVE_KEY),'other-tab');checks.push('other-tab revision protected');await other.close();
const s=freshState();s.introSeen=true;for(let i=0;i<10;i++){s.completed.push(i);s.records[i]={done:true,workComplete:true,example:false};}
for(const [width,height] of [[1280,800],[1920,1080],[1024,768],[915,412]]){
 await page.setViewportSize({width,height});await seed(JSON.stringify(s));
 for(const route of ['home','map',...Array.from({length:10},(_,i)=>'activity/'+i)]){
  if(route.startsWith('activity/')){const fixture=freshState();fixture.introSeen=true;for(let i=0;i<Number(route.split('/')[1]);i++){fixture.completed.push(i);fixture.records[i]={done:true,workComplete:true,example:false};}await seed(JSON.stringify(fixture),route);}else await page.goto(base+'/#'+route);await page.locator('h1,.map-action').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,`${width} ${route} horizontal overflow`);
 }
 await page.screenshot({path:`.tmp/safety-check/activity9-${width}.png`,fullPage:true});checks.push(`${width}×${height}: home, map and 10 activities, no horizontal overflow`);
}
assert.deepEqual(errors,[]);await writeFile('.tmp/safety-check/results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));await browser.close();
