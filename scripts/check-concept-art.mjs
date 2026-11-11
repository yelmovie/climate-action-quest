// Authoring QA: verify delivered illustrations, contextual selection and demand loading.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,readdir,stat,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {freshState,SAVE_KEY} from '../src/state.js';
import {conceptArt} from '../src/concept-art.js';

const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright-core'));}catch{({chromium}=require('../.tools/node_modules/playwright-core'));}
const out='.tmp/concept-art-check';await mkdir(out,{recursive:true});
const base=process.env.BASE_URL||'http://localhost:4175',checks=[],errors=[],failedAssets=[],requests=[];
const manifest=JSON.parse(await readFile('docs/concept-art-manifest.json','utf8'));
assert.equal(Object.keys(conceptArt).length,28,'all planned illustrations are registered');
// The manifest also keeps retired versions (scene-observe v1 → v2, 2026-11-08); each registered file must be listed.
assert.ok(manifest.assets.length>=28,'all planned illustrations were optimized');
for(const [id,art] of Object.entries(conceptArt)){
 const file=resolve('.'+art.src),entry=manifest.assets.find(a=>'/'+a.src===art.src);
 assert.ok(entry,'optimization manifest contains '+id);
 assert.ok(entry.src.startsWith('assets/concept-art/'+id),'manifest entry belongs to '+id);
 assert.equal((await stat(file)).size,entry.bytes,'delivered file matches its manifest: '+id);
 assert.ok(entry.width>0&&entry.height>0&&art.alt.trim(),'dimensions and text alternative: '+id);
 if(art.kind==='object')assert.equal(entry.hasAlpha,true,'object retains transparency: '+id);
}
assert.deepEqual((await readdir('assets/concept-art')).filter(f=>f.endsWith('.png')),[],'large source PNGs remain outside deployed assets');
checks.push('28 optimized assets match the manifest; objects retain alpha and source PNGs are not shipped');

const browser=await chromium.launch({executablePath:process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox'],env:{...process.env,TEMP:process.cwd()+'/.tmp',TMP:process.cwd()+'/.tmp'}});
const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'}),page=await context.newPage();
page.setDefaultTimeout(15000);
page.on('pageerror',e=>errors.push(e.message));
page.on('request',request=>{const url=new URL(request.url());if(url.pathname.startsWith('/assets/concept-art/'))requests.push(url.pathname);});
page.on('response',response=>{if(response.url().includes('/assets/concept-art/')&&response.status()>=400)failedAssets.push({url:response.url(),status:response.status()});});
page.on('requestfailed',request=>{if(request.url().includes('/assets/concept-art/')&&request.failure()?.errorText!=='net::ERR_ABORTED')failedAssets.push({url:request.url(),error:request.failure()?.errorText});});
const fiveTypes=['trees','shade','pond','refuge','ground','shade'];
async function fixture(index,record={},previous={}){
 const state=freshState();state.adminUnlocked=true;state.introSeen=true;
 for(let i=0;i<10;i++){state.records[i]={done:true,workComplete:true};state.completed.push(i);}
 state.records[8].plan=[...fiveTypes];Object.assign(state.records,previous);
 state.records[index]={...record,done:false,workComplete:false};state.completed=state.completed.filter(i=>i!==index);
 await page.evaluate(({state,index,key})=>{localStorage.setItem(key,JSON.stringify(state));history.replaceState(null,'','#activity/'+index);},{state,index,key:SAVE_KEY});
 await page.reload();await page.locator('.activity-page').waitFor();
}
async function rendered(id,scope=page){
 const image=scope.locator(`img.concept-art[src="${conceptArt[id].src}"]`).first();
 await image.waitFor({state:'visible'});await image.scrollIntoViewIfNeeded();
 await page.waitForFunction(el=>el.complete&&el.naturalWidth>0,await image.elementHandle());
 const info=await image.evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,loading:el.loading,draggable:el.draggable};});
 assert.ok(info.width>0&&info.height>0&&info.naturalWidth>0&&info.naturalHeight>0,'visible decoded art: '+id);
 assert.equal(info.draggable,false,'native image dragging must not interfere with activity dragging: '+id);
 return info;
}

try{
 await page.goto(base+'/#home');await page.locator('#start').waitFor();await page.evaluate(()=>document.fonts.ready);
 assert.deepEqual(requests,[],'home does not request the activity illustration library');
 await page.goto(base+'/#facility/0');await page.locator('[data-activity="0"]').waitFor();await rendered('scene-observe');
 assert.deepEqual([...new Set(requests)],[conceptArt['scene-observe'].src],'facility loads only its own illustration');
 checks.push('home requests no new activity art; first facility requests only its own concept image');

 for(const index of [0,1]){await fixture(index);await rendered('scene-observe');}
 checks.push('observation and evidence judgment display the weather observation context');

 for(const index of [0,1]){await fixture(index,index===0?{open:2}:{round:2});await rendered('scene-snow-day');}
 checks.push('the short snowy-day records use the newly generated local weather illustration');

 for(let index=0;index<10;index++){
  await fixture(index);
  const concept=page.locator('.learning-key');
  assert.ok(await concept.isVisible(),'visible scientific concept on activity '+index);
  assert.ok((await concept.locator('strong').textContent()).trim(),'emphasized concept on activity '+index);
  await page.locator('.guide-avatar').click();
  const help=page.locator('.activity-help');
  for(const heading of ['기억할 개념','내 말로 설명해 봐요','다음 탐구와 연결해요'])assert.ok(await help.getByRole('heading',{name:heading,exact:true}).isVisible(),heading+' '+index);
  if(index===4){await rendered('scene-coast-landscape',help);assert.match(await help.textContent(),/밀물·파도·둑/);}
  await page.locator('.help-close').click();
 }
 checks.push('all ten activities expose the concept, explanation prompt and next-learning bridge; coastal model limits are readable');

 await fixture(5,{round:6,order:[],chains:[]});await rendered('scene-rain-safety');
 await page.screenshot({path:out+'/rain-safety-learning.png'});
 checks.push('heavy rain impact uses the newly generated safe-route scene');

 const daily=['scene-home','scene-commute','scene-classroom','scene-meal','scene-heat','scene-reuse','scene-repair','scene-cooling','scene-bottle','scene-power'];
 for(let round=0;round<daily.length;round++){await fixture(6,{round,choices:[]});await rendered(daily[round],page.locator('.daily-scene'));assert.equal(await page.locator('.daily-scene img.concept-art').count(),1,'one scene for daily situation '+round);}
 checks.push('all 10 daily situations display the matching scene instead of the shared bedroom');

 const human=['scene-classroom','scene-commute','scene-cooling','scene-workshop','scene-forest','scene-meal','scene-commute','scene-repair','park','scene-power'];
 for(let open=0;open<human.length;open++){await fixture(2,{open,collected:[]});await rendered(human[open],page.locator('.evidence-card'));}
 checks.push('all 10 human activity observations display their relevant context');

 await fixture(5,{round:5,order:[],chains:[]});await rendered('scene-drought');
 assert.equal(await page.locator(`img.concept-art[src="${conceptArt['scene-forest'].src}"]`).count(),0,'drought is not illustrated as tree clearing');
 checks.push('drought impact uses the drought scene rather than the deforestation scene');

 await fixture(4);
 for(const id of ['beach','road','wetland','homes','park','school'])await rendered(id,page.locator(`[data-predict="${id}"]`));
 assert.equal(await page.locator('.flood-grid img.concept-art').count(),6);
 await page.screenshot({path:out+'/coastal-places.png'});
 checks.push('all six coastal prediction places have visible decoded illustrations');

 await fixture(8,{plan:[...fiveTypes]});
 for(const id of ['trees','shade','pond','refuge','ground'])await rendered(id,page.locator(`[data-tool="${id}"]`));
 for(let district=0;district<fiveTypes.length;district++)await rendered(fiveTypes[district],page.locator(`[data-district="${district}"]`));
 await page.locator('[data-tool="pond"]').click();await page.locator('[data-district="0"]').click();await rendered('pond',page.locator('[data-district="0"]'));
 await page.locator('[data-tool="shade"]').click();await page.locator('[data-district="0"]').click();await rendered('shade',page.locator('[data-district="0"]'));
 assert.equal(await page.locator(`[data-district="0"] img[src="${conceptArt.pond.src}"]`).count(),0,'replaced facility leaves no stale artwork');
 await page.locator('[data-tool="erase"]').click();await page.locator('[data-district="0"]').click();assert.equal(await page.locator('[data-district="0"] img.concept-art').count(),0,'erasing clears the placed illustration');
 checks.push('five facility tools and placed facilities use real art; replacements and erasing update the image');

 await fixture(9,{});
 for(let district=0;district<fiveTypes.length;district++)await rendered(fiveTypes[district],page.locator('.test-city .district-tile').nth(district));
 await page.screenshot({path:out+'/city-test-art.png'});
 checks.push('stress test reuses the actual facility illustration in every district');

 // This deliberate library-wide decode happens last, after demand-loading assertions.
 const decoded=await page.evaluate(async entries=>Promise.all(entries.map(async ([id,art])=>{const image=new Image();image.src=art.src;await image.decode();return {id,width:image.naturalWidth,height:image.naturalHeight};})),Object.entries(conceptArt));
 assert.equal(decoded.length,28);assert.ok(decoded.every(image=>image.width>0&&image.height>0));
 assert.deepEqual(failedAssets,[]);assert.deepEqual(errors,[]);
 checks.push('all 28 shipped images decode successfully with no missing art requests or page errors');
 await writeFile(out+'/art.json',JSON.stringify({checks,decoded,errors,failedAssets},null,2)+'\n');
 console.log(JSON.stringify({passed:checks.length,checks,errors,failedAssets},null,2));
}catch(error){console.error('Concept art validation failed:',error);await page.screenshot({path:out+'/failure.png',timeout:5000}).catch(()=>{});throw error;}finally{await browser.close();}
