import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {freshState} from '../src/state.js';
import {concepts,CONCEPT_DURATION} from '../src/concept-data.js';
import {evidenceSites,humanSites,experimentLevels} from '../src/activity-data.js';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright-core'));}catch{({chromium}=require('../.tools/node_modules/playwright-core'));}
const out='.tmp/experience-check';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox'],env:{...process.env,TEMP:process.cwd()+'/.tmp',TMP:process.cwd()+'/.tmp'}});
const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true}),page=await context.newPage(),cdp=await context.newCDPSession(page),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.BASE_URL||'http://localhost:4175';await page.goto(base);
let fixture=null;
await page.route(base+'/',async route=>{const response=await route.fetch();let html=await response.text();if(fixture){const s=fixture;fixture=null;html=html.replace('<head>',`<head><script>localStorage.setItem('climate-future:v1',${JSON.stringify(JSON.stringify(s))});</script>`);}await route.fulfill({response,body:html});});
async function load(index,record={},extra={},preview=false){
 console.log('Checking activity '+index);
 const s=freshState();s.adminUnlocked=true;s.introSeen=true;
 if(!preview)for(let i=0;i<index;i++){s.records[i]={done:true,workComplete:true};s.completed.push(i);}
 s.records[index]=record;Object.assign(s.records,extra);
 await page.goto('about:blank');fixture=s;await page.goto(base+'/#activity/'+index);
 // Saved admin flags are ignored on load (5e780e5), so teacher preview is opened through settings like a teacher would.
 if(preview){await page.locator('[data-settings]').click();await page.locator('.settings-dialog details').evaluateAll(items=>items.forEach(e=>e.open=true));await page.locator('#admin-unlock').click();await page.locator('#close-settings').click();await page.evaluate(i=>{location.hash='#activity/'+i;},index);}
 await page.locator('.guide-avatar').waitFor();await page.evaluate(()=>document.fonts.ready);
}
const record=async i=>page.evaluate(i=>JSON.parse(localStorage.getItem('climate-future:v1')).records[i],i);
async function drag(source,target,touch=false,cancel=false){
 const a=await page.locator(source).boundingBox(),b=await page.locator(target).boundingBox();assert.ok(a&&b,source+' → '+target);const start={x:a.x+a.width/2,y:a.y+a.height/2},end={x:b.x+b.width/2,y:b.y+b.height/2};
 if(touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/12,y:start.y+(end.y-start.y)*i/12,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});}
 else{await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:12});await page.mouse.up();}
 assert.equal(await page.locator('.drag-ghost').count(),0,'drag ghost cleaned up');
}
async function video(index,preview=false){
 await page.locator('.concept-dialog video').waitFor();await page.waitForFunction(()=>document.querySelector('.concept-dialog video')?.readyState>=2);
 const metadata=await (await page.waitForFunction(()=>{const v=document.querySelector('.concept-dialog video');return v?.readyState>=2&&Number.isFinite(v.duration)&&v.videoWidth>0?{duration:v.duration,w:v.videoWidth,h:v.videoHeight}:false;})).jsonValue();assert.deepEqual({...metadata,duration:Math.round(metadata.duration)},{duration:CONCEPT_DURATION,w:1280,h:720});
 if(!preview)assert.ok((await record(index)).done,'completion saved before media');
 await page.locator('.concept-dialog video').evaluate(v=>{v.currentTime=d/3+.2;},CONCEPT_DURATION);await page.waitForFunction(cue=>document.querySelector('.concept-caption').textContent===cue,concepts[index].cues[1]);
 if(index===0){await page.locator('.concept-pause').click();assert.ok(await page.locator('video').evaluate(v=>v.paused));await page.screenshot({path:out+'/concept-observe.png'});await page.locator('.concept-pause').click();await page.locator('video').evaluate(v=>{v.currentTime=d-.15;},CONCEPT_DURATION);await page.locator('.concept-play').waitFor();assert.equal(await page.locator('.concept-end').isVisible(),true);}
 if(index===8){await page.screenshot({path:out+'/concept-design.png'});}
 await page.locator('.dialog-close').click();await page.locator('video').waitFor({state:'detached'});await page.locator('.continue-activity').waitFor();checks.push('activity '+index+': completion + '+CONCEPT_DURATION+'s video + caption + cleanup + continue');
}
try{
 if(!process.argv.includes('--media-only')){
 await load(0);
 for(let i=0;i<8;i++){
  assert.equal((await record(0)).open??0,i);await page.locator('.compare-slider').focus();await page.keyboard.press('End');
  assert.equal((await record(0)).collected.length,i+1,'comparison saves once without a collect click');
  if(i===0){await page.locator('.compare-slider').focus();await page.keyboard.press('Home');await page.locator('.compare-slider').focus();await page.keyboard.press('End');assert.equal((await record(0)).collected.length,1);await page.reload();assert.equal((await record(0)).collected.length,1);}
  if(i<7)await page.locator('.next-site').click();
 }
 assert.equal(await page.locator('.collect').count(),0);await page.locator('.submit').click();await video(0);
 await page.reload();assert.equal((await record(0)).collected.length,8);assert.equal(await page.locator('.concept-dialog').count(),0);checks.push('automatic observation capture, duplicate input, next site and refresh');
 await load(1);await page.locator('[data-answer="1"]').click();assert.equal(!!(await record(1)).checked,false);assert.equal((await record(1)).round,0);
 for(let i=0;i<8;i++){
  const target=`[data-answer="${evidenceSites[i].climate?0:1}"]`;
  if(i===0)await drag('.evidence-card',target,true);else if(i===1){await page.locator(target).focus();await page.keyboard.press('Enter');}else await page.locator(target).click();
  assert.equal((await record(1)).checked,true);assert.equal((await record(1)).round,i,'answer feedback stays until deliberate next');
  if(i===1)assert.equal(await page.locator('.check').evaluate(e=>e===document.activeElement),true,'keyboard focus follows the completed answer');
  await page.locator('.check').click();
 }
 await video(1);assert.equal((await record(1)).answers.length,8);await page.locator('.continue-activity').click();assert.equal(new URL(page.url()).hash,'#facility/1');checks.push('instant judgment, wrong answer, keyboard/touch and direct next chapter');
 await load(2);
 for(let i=0;i<10;i++){
  assert.equal((await record(2)).open??0,i);
  if(i===0){await page.locator('[data-resource="1"]').click();assert.equal((await record(2)).collected.length,0);await drag('.evidence-card','[data-resource="0"]');}
  else await page.locator(`[data-resource="${humanSites[i].answer}"]`).click();
  assert.equal((await record(2)).collected.length,i+1);if(i<9)await page.locator('.next-site').click();
 }
 await page.locator('.submit').click();await video(2);checks.push('resource investigation follows remaining sites with immediate feedback');
 await load(3,{round:7,links:[]});await page.locator('[data-link="1"]').click();assert.equal(!!(await record(3)).checked,false);await drag('[data-link="0"]','.chain-slot:nth-of-type(2)');assert.equal((await record(3)).checked,true);await page.locator('.check').click();await video(3);
 await load(4);assert.equal(await page.locator('.water-level').count(),0);
 for(let i=0;i<6;i++){
  assert.equal(await page.locator('.run').isDisabled(),true);await page.locator(`[data-predict="${i===0?'school':'beach'}"]`).click();await page.locator('.run').click();
  assert.equal((await record(4)).ran,true);assert.equal((await record(4)).level,experimentLevels[i]);assert.equal(await page.locator('[data-reflect]').count(),0);
  if(i===0){await page.screenshot({path:out+'/water-result.png'});await page.reload();assert.equal((await record(4)).ran,true);}
  await page.locator('.next').click();
 }
 await video(4);assert.deepEqual((await record(4)).trials.map(t=>t.level),experimentLevels);assert.deepEqual((await record(4)).trials[0].prediction,['school']);checks.push('six preset experiments preserve predictions and result reading across refresh');
 await load(5,{round:7,chains:[],order:[]});await page.locator('[data-part="2"]').click();assert.deepEqual((await record(5)).order,[2]);await page.locator('[data-remove="0"]').click();assert.deepEqual((await record(5)).order,[]);await drag('[data-part="1"]','[data-remove="0"]',true,true);assert.deepEqual((await record(5)).order,[]);await drag('[data-part="1"]','[data-remove="0"]',true);await drag('[data-part="0"]','[data-remove="1"]',true);await drag('[data-part="2"]','[data-remove="2"]',true);assert.equal(!!(await record(5)).checked,false);await drag('[data-remove="1"]','[data-remove="0"]',true);assert.deepEqual((await record(5)).order,[0,1,2]);assert.equal((await record(5)).checked,true);await page.locator('.check').click();await video(5);checks.push('touch cancellation, wrong order and instant completion after reorder');
 await load(6,{round:9,choices:Array(9).fill(0)});await page.locator('[data-choice="2"]').click();assert.equal(await page.locator('.next').isDisabled(),true);await page.locator('[data-choice="1"]').click();assert.equal((await record(6)).round,9,'safe alternatives remain explorable');await page.locator('[data-choice="0"]').click();await page.locator('.next').click();await video(6);assert.equal((await record(6)).choices[9],0);checks.push('unsafe choices blocked and shuffled choices retain semantic records');
 await load(7,{round:3,comparisons:[]},{6:{done:true,workComplete:true,choices:Array(10).fill(1)}});assert.equal(await page.locator('.compare-lens').count(),0);assert.deepEqual(await page.locator('.comparison-card').nth(1).locator('.metric strong').allTextContents(),['낮음','높음','낮음']);await page.getByRole('button',{name:'A의 선택',exact:true}).click();assert.equal(!!(await record(7)).checked,false);await page.getByRole('button',{name:'B의 선택',exact:true}).click();assert.equal((await record(7)).checked,true);await page.locator('.check').click();await page.locator('[data-practice="1"]').click();await page.locator('.submit').click();await video(7);checks.push('comparison displays actual metrics before selection and checks immediately');
 const good=['shade','pond','shade','pond','trees','trees'];await load(8);await page.locator('[data-tool="pond"]').click();await page.locator('[data-district="0"]').click();assert.equal((await record(8)).plan[0],'pond');const version=(await record(8)).version;await page.locator('[data-district="0"]').click();assert.equal((await record(8)).version,version,'same facility does not invalidate the design');await page.locator('[data-tool="erase"]').click();await page.locator('[data-district="0"]').click();
 for(let i=0;i<6;i++)await drag(`[data-tool="${good[i]}"]`,`[data-district="${i}"]`,i===0);
 assert.deepEqual((await record(8)).plan,good);await page.locator('[data-tool="refuge"]').click();await page.locator('[data-district="0"]').click();assert.equal((await record(8)).plan[0],'refuge');await page.locator('[data-district="1"]').click();assert.equal((await record(8)).plan[1],'pond','over-budget replacement leaves the original facility');await page.locator('[data-tool="shade"]').click();await page.locator('[data-district="0"]').click();
 await page.locator('[data-tool="erase"]').click();await page.locator('[data-district="4"]').click();await page.locator('[data-district="5"]').click();assert.deepEqual((await record(8)).plan.slice(4),[null,null]);assert.equal(await page.locator('.submit').isDisabled(),true);await drag('[data-tool="trees"]','[data-district="4"]',true);assert.equal((await record(8)).tool,'trees');await page.locator('[data-district="5"]').click();assert.deepEqual((await record(8)).plan,good);await page.screenshot({path:out+'/city-placed.png'});await page.locator('.submit').click();await video(8);checks.push('continuous placement/erase, drag exits erase, duplicate placement and budget');
 await load(9,{}, {8:{done:true,workComplete:true,plan:Array(6).fill('shade')}});for(let i=0;i<3;i++)await page.locator('.run').click();assert.equal((await record(9)).phase,2);assert.deepEqual(Object.keys((await record(9)).before).sort(),['heat','rain']);
 await page.locator('.retest').click();assert.ok((await record(9)).after.heat);await page.locator('.run').click();assert.ok((await record(9)).after.rain);await page.locator('.run').click();assert.equal((await record(9)).phase,2,'unsuitable plan returns to editing');assert.equal(!!(await record(9)).verified,false);
 for(let i=0;i<6;i++)await drag(`[data-tool="${good[i]}"]`,`[data-district="${i}"]`);
 await page.locator('.retest').click();assert.ok((await record(9)).after.heat);await page.reload();assert.equal((await record(9)).phase,3);for(let i=0;i<2;i++)await page.locator('.run').click();await video(9);assert.equal((await record(9)).verified,true);assert.deepEqual(Object.keys((await record(9)).after).sort(),['heat','rain']);checks.push('combined test actions preserve both hazards, failed design retry and saved retest');
 await page.locator('.continue-activity').click();assert.equal(new URL(page.url()).hash,'#ending');assert.equal(await page.locator('.report-record.connected').count(),5);assert.equal(await page.locator('#finalize').isEnabled(),true);await page.locator('#finalize').click();await page.waitForTimeout(220);await page.screenshot({path:out+'/certificate.png'});assert.equal(await page.locator('.certificate-dialog').count(),1);await page.locator('.dialog-close').click();checks.push('earned records connect without five extra clicks and issue certificate');
 await load(1,{round:7,answers:[]},{},true);await page.locator('[data-answer="1"]').click();await page.locator('.check').click();await video(1,true);assert.notEqual((await record(1))?.done,true,'teacher preview is never saved');assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('climate-future:v1')).completed),[]);await page.locator('.continue-activity').click();assert.equal(new URL(page.url()).hash,'#facility/0');await page.goto(base+'/#ending');await page.waitForURL('**/#map');checks.push('preview completion returns to facility and never earns a certificate');
 }
 // Failure and reduced-motion paths are tested in isolated contexts.
 await load(0,{done:true,workComplete:true,collected:evidenceSites.map(s=>s.id)});await page.route('**/assets/concepts/*.{webm,mp4}',r=>r.abort());await page.locator('.guide-avatar').click();await page.locator('.concept-revisit').click();await page.locator('.concept-fallback').waitFor();await page.screenshot({path:out+'/concept-fallback.png'});assert.equal(await page.locator('.concept-next').isEnabled(),true);await page.locator('.dialog-close').click();await page.unroute('**/assets/concepts/*.{webm,mp4}');checks.push('media failure poster + all captions + continue');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.concept-revisit').click();await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);assert.equal(await page.locator('video').evaluate(v=>v.paused),true);await page.locator('.concept-play').click();await page.waitForFunction(()=>!document.querySelector('video').paused);await page.locator('.dialog-close').click();checks.push('reduced motion waits for deliberate playback');
 assert.deepEqual(errors,[]);await writeFile(out+'/interactions.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));
}catch(e){console.error('Interaction failure:',e);await page.screenshot({path:out+'/interaction-failure.png',timeout:5000}).catch(err=>console.warn(err.message));console.log('State on failure',await page.evaluate(()=>localStorage.getItem('climate-future:v1')).catch(()=>null));throw e;}finally{await browser.close();}
