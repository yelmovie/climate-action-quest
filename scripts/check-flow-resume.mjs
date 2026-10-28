import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {freshState} from '../src/state.js';
import {relationCases,effectChains,dailyCases,compareCaseIndices} from '../src/activity-data.js';

const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright-core'));}catch{({chromium}=require('../.tools/node_modules/playwright-core'));}
const out='.tmp/experience-check';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox'],env:{...process.env,TEMP:process.cwd()+'/.tmp',TMP:process.cwd()+'/.tmp'}});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.BASE_URL||'http://localhost:4175';
let fixture=null;
await page.route(base+'/',async route=>{
 const response=await route.fetch();let html=await response.text();
 if(fixture){const s=fixture;fixture=null;html=html.replace('<head>',`<head><script>localStorage.setItem('climate-future:v1',${JSON.stringify(JSON.stringify(s))});</script>`);}
 await route.fulfill({response,body:html});
});
async function load(index,record={},extra={}){
 console.log('Checking resume/full flow '+index);
 const s=freshState();s.adminUnlocked=true;s.introSeen=true;
 for(let i=0;i<index;i++){s.records[i]={done:true,workComplete:true,example:false};s.completed.push(i);}
 s.records[index]=record;Object.assign(s.records,extra);
 await page.goto('about:blank');fixture=s;await page.goto(base+'/#activity/'+index);
 await page.locator('.guide-avatar').waitFor();await page.evaluate(()=>document.fonts.ready);
}
const record=async index=>page.evaluate(index=>JSON.parse(localStorage.getItem('climate-future:v1')).records[index],index);
async function completed(index){
 // Completion must already be durable; media loading is covered separately.
 await page.locator('.concept-dialog').waitFor();
 const saved=await record(index);assert.equal(saved.done,true);assert.equal(saved.workComplete,true);assert.equal(saved.example,false);
 assert.equal(await page.evaluate(index=>JSON.parse(localStorage.getItem('climate-future:v1')).completed.includes(index),index),true);
 await page.locator('.concept-dialog .dialog-close').click();await page.locator('.continue-activity').waitFor();
 return saved;
}

try{
 await load(0,{open:0,compared:['summer'],collected:[],reveal:100});
 assert.deepEqual((await record(0)).collected,['summer'],'old compared evidence is collected automatically');
 assert.equal(await page.locator('.next-site').isEnabled(),true);
 await page.locator('.next-site').click();
 assert.equal(await page.locator('.compare-slider').evaluate(el=>el===document.activeElement),true);
 await page.keyboard.press('End');
 assert.deepEqual((await record(0)).collected,['summer','rain']);
 assert.equal(await page.locator('.next-site').evaluate(el=>el===document.activeElement),true,'keyboard comparison hands focus to the next site');
 checks.push('legacy compared evidence restores automatically and keyboard focus follows observation');

 await load(5,{round:0,chains:[],order:[0,1,2],checked:false});
 assert.equal((await record(5)).checked,true,'old complete order is recognized without another check');
 assert.equal(await page.locator('.check').isEnabled(),true);await page.locator('.check').click();
 assert.equal((await record(5)).round,1);assert.equal((await record(5)).chains.length,1);
 checks.push('legacy completed order resumes at the next round');

 const good=['shade','pond','shade','pond','trees','trees'];
 await load(9,{phase:1,sourcePlan:good,baseline:good,plan:good,before:{heat:{}},after:{}},{8:{done:true,workComplete:true,example:false,plan:good}});
 assert.equal(await page.locator('.run').textContent(),'많은 비 시험 시작');
 await page.locator('.run').click();assert.equal((await record(9)).phase,1);
 assert.deepEqual(Object.keys((await record(9)).before).sort(),['heat','rain']);
 await page.locator('.run').click();assert.equal((await record(9)).phase,2);
 checks.push('legacy rain trial starts with the correct label and keeps both initial results');

 await load(3);
 for(let round=0;round<relationCases.length;round++){
  assert.equal((await record(3)).round??0,round);await page.locator('[data-link="0"]').click();
  assert.equal((await record(3)).checked,true);await page.locator('.check').click();
  assert.equal((await record(3)).links.length,round+1);
 }
 const links=await completed(3);
 assert.deepEqual(links.links,relationCases.map(({site,middle,end})=>({site,middle,end})));
 checks.push('all eight relationship rounds save the selected semantic links and complete');

 await load(5);
 for(let round=0;round<effectChains.length;round++){
  assert.equal((await record(5)).round??0,round);
  for(const part of [0,1,2])await page.locator(`[data-part="${part}"]`).click();
  assert.equal((await record(5)).checked,true);await page.locator('.check').click();
  assert.equal((await record(5)).chains.length,round+1);
 }
 const chains=await completed(5);
 assert.deepEqual(chains.chains,effectChains.map(({source,kind,parts})=>({source,kind,parts})));
 checks.push('all eight impact chains complete and retain their source, kind and order');

 const choices=dailyCases.map((_,round)=>round%2);
 await load(6);
 for(let round=0;round<dailyCases.length;round++){
  assert.equal((await record(6)).round??0,round);await page.locator(`[data-choice="${choices[round]}"]`).click();
  assert.equal(await page.locator('.next').isEnabled(),true);await page.locator('.next').click();
  assert.deepEqual((await record(6)).choices,choices.slice(0,round+1));
 }
 const daily=await completed(6);assert.deepEqual(daily.choices,choices);
 checks.push('all ten daily scenes preserve safe choice identities despite shuffled display');

 await load(7,{}, {6:daily});
 for(let round=0;round<compareCaseIndices.length;round++){
  assert.equal((await record(7)).round??0,round);
  const chosen=choices[compareCaseIndices[round]]===0?'A의 선택':'B의 선택';
  await page.getByRole('button',{name:chosen,exact:true}).click();assert.equal((await record(7)).checked,true);
  await page.locator('.check').click();assert.equal((await record(7)).comparisons.length,round+1);
 }
 const practice=page.locator('[data-practice="2"]'),practiceText=await practice.textContent();
 await practice.click();await page.locator('.submit').click();
 const comparisons=await completed(7);
 assert.deepEqual(comparisons.comparisons,compareCaseIndices.map(caseIndex=>({caseIndex,baseline:choices[caseIndex],alternative:1-choices[caseIndex],better:0})));
 assert.equal(comparisons.practice,2);assert.equal(comparisons.practiceText,practiceText);
 checks.push('all four comparisons reuse actual daily records and finish with a saved practice');

 assert.deepEqual(errors,[]);
 await writeFile(out+'/flow-resume.json',JSON.stringify({checks,errors},null,2));
 console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));
}catch(error){
 await page.screenshot({path:out+'/flow-resume-failure.png'});
 console.log('State on failure',await page.evaluate(()=>localStorage.getItem('climate-future:v1')));
 throw error;
}finally{await browser.close();}
