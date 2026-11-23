import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {evidenceSites,humanSites,relationCases,relationReasons,effectChains,dailyCases,compareCaseIndices,experimentLevels} from '../src/activity-data.js';
import {voiceLines} from '../src/voice-lines.js';

const require=createRequire(import.meta.url);
const {chromium}=require('../.tools/node_modules/playwright-core');
const base=(process.env.BASE_URL||'http://127.0.0.1:5357').replace(/\/$/,'');
const out='.tmp/full-journey';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),headless:true,args:['--mute-audio']});
const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true,acceptDownloads:true});
const page=await context.newPage(),errors=[],checks=[],boundaries=[];
page.on('pageerror',error=>errors.push(error.message));
const saved=(p=page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('climate-future:v1')));
let units=0;
async function capture(p,name){
 await p.screenshot({path:out+'/'+name+'.png'});
 await writeFile(out+'/'+name+'.json',JSON.stringify({url:p.url(),text:await p.locator('body').innerText(),state:await saved(p)},null,2));
}
async function inViewport(p,selector){
 const measured=await p.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect(),f=document.querySelector('.activity-footer')?.getBoundingClientRect();return {shown:getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden',x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,footer:f?.top,scroll:e.scrollHeight,client:e.clientHeight,vw:innerWidth,vh:innerHeight};});
 assert.ok(measured.shown&&measured.w>0&&measured.h>0,selector+' must be shown');
 assert.ok(measured.x>=-1&&measured.y>=-1&&measured.right<=measured.vw+1&&measured.bottom<=measured.vh+1,JSON.stringify(measured));
 if(measured.footer)assert.ok(measured.bottom<=measured.footer+1,selector+' must stay above the footer');
 return measured;
}
async function done(index){
 await page.locator('.concept-dialog').waitFor();
 const s=await saved();
 assert.deepEqual(s.completed,Array.from({length:index+1},(_,i)=>i));
 assert.equal(s.records[index].example,false);assert.equal(s.records[index].workComplete,true);assert.equal(s.adminUnlocked,false);
 await page.locator('.concept-dialog .dialog-close').tap();
 await page.locator('.continue-activity').tap();
 if(index%2===1&&index<9){
  await page.locator('.map-action').waitFor({timeout:30000});
  await page.locator('.map-action').tap();
  await page.locator(`[data-activity="${index+1}"]`).tap({timeout:90000});
 }
 checks.push(`activity ${index+1}: actual cumulative completion, ${units} units`);
 console.log(checks.at(-1));
}
async function voiceRegression(id){
 const button=page.locator(`[data-voice="${id}"]`);
 await button.waitFor();
 assert.equal(await button.getAttribute('aria-label'),voiceLines[id].text+' 음성 듣기');
 await page.waitForFunction(key=>document.querySelector(`[data-voice="${key}"]`)?.getAttribute('aria-pressed')==='true',id);
 const response=await page.request.get(base+'/'+voiceLines[id].target);
 assert.equal(response.status(),200);
 const local=await readFile(new URL('../'+voiceLines[id].target,import.meta.url));
 assert.equal(createHash('sha256').update(await response.body()).digest('hex'),createHash('sha256').update(local).digest('hex'));
 assert.match(voiceLines[id].target,/-v2\.mp3$/);
 checks.push(id+': current v2 file, matching visible line and actual playing state; human listening not performed');
}
async function touchDrag(p,from,to){
 const a=await from.boundingBox(),b=await to.boundingBox(),cdp=await p.context().newCDPSession(p);
 const x=a.x+a.width/2,y=a.y+a.height/2,X=b.x+b.width/2,Y=b.y+b.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(X-x)*i/8,y:y+(Y-y)*i/8,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await cdp.detach();await p.waitForTimeout(450);
}
async function setPlan(p,plan){
 await p.locator('[data-tool="erase"]').tap();
 for(let i=0;i<6;i++)await p.locator(`[data-district="${i}"]`).tap();
 for(let i=0;i<6;i++){
  await p.locator(`[data-tool="${plan[i]}"]`).press('Enter');
  await p.locator(`[data-district="${i}"]`).press('Enter');
 }
}
async function boundaryCopies(checkpoint){
 // These focused forks copy a checkpoint earned above through real UI actions. They never unlock stages
 // or supply synthetic completion records, and do not replace the empty-storage main journey.
 const cases=[
  {sum:16,heat:7,rain:9,plan:['pond','trees','trees','trees','trees','trees'],pass:true},
  {sum:17,heat:7,rain:10,plan:['pond','shade','trees','trees','trees','trees'],pass:true},
  {sum:18,heat:9,rain:9,plan:['pond','shade','pond','trees','trees','trees'],pass:false}
 ];
 for(const item of cases){
  const c=await browser.newContext({storageState:checkpoint,viewport:{width:1280,height:800},hasTouch:true});
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
  try{
   await p.goto(base+'/#activity/9',{waitUntil:'domcontentloaded'});
   await p.locator('.stress-criteria').waitFor();
   const before=structuredClone((await saved(p)).records[9].before);
   await setPlan(p,item.plan);
   assert.deepEqual((await saved(p)).records[9].plan,item.plan);
   assert.deepEqual((await saved(p)).records[9].before,before);
   assert.equal(await p.locator('[data-current-total]').textContent(),String(item.sum));
   assert.equal(await p.locator('[data-total-limit]').textContent(),'17');
   assert.match(await p.locator('.criteria-gap').innerText(),new RegExp('합계 '+Math.max(0,item.sum-17)));
   for(const [w,h] of [[1024,768],[844,390]]){
    await p.setViewportSize({width:w,height:h});await p.waitForTimeout(200);
    await inViewport(p,'.stress-criteria');
    if(w===844){
     await inViewport(p,'[data-city-tool]');
     await p.locator('[data-city-tool]').selectOption('shade');await p.locator('[data-district="0"]').tap();
     assert.notEqual(await p.locator('[data-current-total]').textContent(),String(item.sum));
     await p.locator('[data-city-tool]').selectOption(item.plan[0]);await p.locator('[data-district="0"]').tap();
     assert.deepEqual((await saved(p)).records[9].plan,item.plan);
     assert.equal(await p.locator('[data-current-total]').textContent(),String(item.sum));
    }
    await capture(p,`boundary-${item.sum}-editing-${w}x${h}`);
   }
   await p.setViewportSize({width:1280,height:800});
   await p.locator('.retest').tap();await p.locator('.run').tap();
   const record=(await saved(p)).records[9];
   assert.equal(record.after.heat.total,item.heat);assert.equal(record.after.rain.total,item.rain);
   assert.equal(await p.locator('.run').textContent(),item.pass?'검증 기록 제출':'설계를 다시 살펴보기');
   if(!item.pass){
    assert.match(await p.locator('.activity-feedback').innerText(),/합계를 1 더 줄여/);
    await p.locator('.run').tap();assert.deepEqual((await saved(p)).records[9].plan,item.plan);
   }
   await capture(p,`boundary-${item.sum}-result`);
   boundaries.push({firstTotal:17,...item});
   console.log('PASS boundary: total '+item.sum+' vs first 17, accepted '+item.pass);
  }finally{await c.close();}
 }
}

try{
 // Begin on the actual home screen with empty storage, including story, walking and facility entry.
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.locator('#start').waitFor();
 const initial=await saved();assert.deepEqual(initial.completed,[]);assert.equal(initial.introSeen,false);assert.equal(initial.adminUnlocked,false);
 await page.locator('#start').tap();await page.locator('dialog[open] .story-next').waitFor();
 for(let i=0;i<3;i++)await page.locator('dialog[open] .story-next').tap();
 await page.locator('.map-action').waitFor({timeout:30000});await page.locator('.map-action').tap();
 await page.locator('[data-activity="0"]').tap({timeout:90000});
 for(let i=0;i<8;i++){
  await page.locator('.compare-slider').press('End');
  assert.equal((await saved()).records[0].collected.length,i+1);units++;
  if(i===3){
   for(const [w,h] of [[844,390],[915,412],[1024,768],[1280,800],[1920,1080]]){
    await page.setViewportSize({width:w,height:h});await page.waitForTimeout(250);
    const note=await inViewport(page,'.ov-data-note');assert.ok(note.scroll<=note.client+2);
    await inViewport(page,'.compare-slider');
    assert.match(await page.locator('.ov-data-note').innerText(),/낮을수록 일찍/);
    assert.match(await page.locator('.ov-data-note').innerText(),/한 장소 예시/);
    assert.match(await page.locator('.ov-data-note').innerText(),/가상 상대 단계 0~8/);
    await capture(page,`flower-${w}x${h}`);
   }
   await page.setViewportSize({width:1280,height:800});
   await page.reload({waitUntil:'domcontentloaded'});await page.locator('.compare-slider').waitFor();
   assert.equal((await saved()).records[0].collected.length,4);
  }
  if(i<7)await page.locator('.next-site').tap();
 }
 await page.locator('.submit').tap();await done(0);
 for(const [i,site] of evidenceSites.entries()){
  if(i===0){await page.locator('[data-answer="1"]').tap();assert.equal(await page.locator('.check').isDisabled(),true);}
  await page.locator(`[data-answer="${site.climate?0:1}"]`).tap();await page.locator('.check').tap();units++;
 }
 await done(1);
 for(let i=0;i<humanSites.length;i++){
  if(i===0){
   await page.locator('[data-resource-id="production"]').tap();assert.equal(await page.locator('.next-site').isDisabled(),true);
   assert.match(await page.locator('.activity-feedback').innerText(),/전기도 에너지/);
   assert.match(await page.locator('.ov-resource-question').innerText(),/조사할 주제/);
   assert.ok(!(await page.locator('.resource-grid').innerText()).includes('자원과 에너지'));
   await capture(page,'classification-retry');
  }
  await page.locator(`[data-resource-id="${humanSites[i].categoryId}"]`).press('Enter');units++;
  if(i<9)await page.locator('.next-site').tap();
 }
 await page.locator('.submit').tap();await done(2);
 for(const [i,item] of relationCases.entries()){
  if(i===0){
   await page.locator('[data-reason-id="production-inputs"]').tap();assert.equal(await page.locator('.check').isDisabled(),true);
   assert.match(await page.locator('.relation-retry').innerText(),/맞아요.*빈 교실의 조명/);
   await page.locator('[data-voice="retry-3"]').waitFor();
  }
  if(i===3||i===4){
   await page.locator('[data-reason-id="appearance-only"]').tap();assert.equal(await page.locator('.check').isDisabled(),true);
   assert.match(await page.locator('.relation-retry').innerText(),/사진 한 장으로 모든 영향을 확정할 수는 없/);
   assert.equal(await page.locator('[data-voice="retry-3"]').getAttribute('aria-label'),voiceLines['retry-3'].text+' 음성 듣기');
   await page.locator('.guide-avatar').tap();await page.locator('.activity-help[open]').waitFor();await page.locator('.help-close').tap();
   await capture(page,`relation-${item.id}-clear-wrong`);
  }
  const id=i===3?'less-new-production':i===4?'trees-absorb':item.middleId;
  if(i===3)await touchDrag(page,page.locator(`[data-reason-id="${id}"]`),page.locator('.chain-slot').nth(1));
  else await page.locator(`[data-reason-id="${id}"]`).press('Enter');
  assert.equal((await saved()).records[3].checked,true);
  assert.match(await page.locator('.chain-slot').nth(1).innerText(),new RegExp(relationReasons[id].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  if(i===3){await page.reload({waitUntil:'domcontentloaded'});await page.locator('.check:not(:disabled)').waitFor();assert.equal((await saved()).records[3].selectedId,id);}
  if(i===3||i===4)await capture(page,`relation-${item.id}-accepted-alternative`);
  await page.locator('.check').tap();assert.equal((await saved()).records[3].links[i].middle,relationReasons[id]);units++;
 }
 await done(3);
 for(const [i,level] of experimentLevels.entries()){
  await page.locator(`[data-predict="${i===0?'school':'beach'}"]`).tap();await page.locator('.run').tap();
  assert.equal((await saved()).records[4].level,level);await page.locator('.next').tap();units++;
 }
 await done(4);
 for(const [i] of effectChains.entries()){
  if(i===0){
   for(const part of [2,1,0])await page.locator(`[data-part="${part}"]`).tap();
   assert.equal(await page.locator('.check').isDisabled(),true);await voiceRegression('retry-5');await capture(page,'retry-5-v2');
   for(let j=0;j<3;j++)await page.locator('[data-remove="0"]').press('Enter');
  }
  for(const part of [0,1,2])await page.locator(`[data-part="${part}"]`).press('Enter');
  await page.locator('.check').tap();units++;
 }
 await done(5);
 for(const [i] of dailyCases.entries()){
  if(i===0){await page.locator('[data-choice="2"]').tap();assert.equal(await page.locator('.next').isDisabled(),true);}
  await page.locator('[data-choice="0"]').tap();await page.locator('.next').tap();units++;
 }
 await done(6);
 for(const [i] of compareCaseIndices.entries()){
  if(i===0){await page.getByRole('button',{name:'B의 선택',exact:true}).tap();assert.equal(await page.locator('.check').isDisabled(),true);await voiceRegression('retry-7');await capture(page,'retry-7-v2');}
  await page.getByRole('button',{name:'A의 선택',exact:true}).press('Space');await page.locator('.check').tap();units++;
 }
 await page.locator('[data-practice="1"]').tap();await page.locator('.submit').tap();await done(7);
 await page.locator('[data-tool="refuge"]').tap();for(let i=0;i<5;i++)await page.locator(`[data-district="${i}"]`).tap();
 assert.equal((await saved()).records[8].plan.filter(Boolean).length,4);assert.match(await page.locator('.activity-feedback').innerText(),/자원이 부족/);
 await setPlan(page,Array(6).fill('shade'));units+=6;await page.locator('.submit').tap();await done(8);
 for(let i=0;i<3;i++)await page.locator('.run').tap();units+=2;
 const first=(await saved()).records[9].before;assert.equal(first.heat.total,2);assert.equal(first.rain.total,15);
 const checkpoint=await context.storageState();await writeFile(out+'/earned-checkpoint.json',JSON.stringify(checkpoint,null,2));
 await boundaryCopies(checkpoint);
 const good=['shade','pond','shade','pond','shade','shade'];await setPlan(page,good);
 assert.equal(await page.locator('[data-current-total]').textContent(),'14');assert.equal(await page.locator('[data-total-limit]').textContent(),'17');
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('.retest').waitFor();assert.deepEqual((await saved()).records[9].plan,good);
 await page.locator('.retest').tap();await page.locator('.run').tap();units+=2;
 assert.equal((await saved()).records[9].after.heat.total,5);assert.equal((await saved()).records[9].after.rain.total,9);
 await page.locator('.run').tap();await done(9);
 assert.equal(units,72);
 await page.locator('.map-action').waitFor({timeout:30000});await page.locator('.map-action').tap();await page.waitForURL(/#ending$/,{timeout:90000});
 await page.locator('#finalize').tap();await page.locator('.story-film,.certificate-dialog').first().waitFor();
 for(let i=0;i<4&&!(await page.locator('.certificate-dialog').count());i++)await page.locator('.story-film .story-next').tap();
 await page.locator('.cert-paper').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
 assert.equal((await saved()).finalized,true);assert.equal(await page.locator('.cert-paper input').count(),0);
 assert.match(await page.locator('.cert-practice').innerText(),/쓰지 않는 조명 확인하기/);
 const downloaded=page.waitForEvent('download');await page.locator('#download-certificate').tap();const file=await downloaded;
 assert.match(file.suggestedFilename(),/인증서\.png$/);await file.saveAs(out+'/certificate-download.png');
 const png=await readFile(out+'/certificate-download.png');assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(png.readUInt32BE(16),2400);assert.equal(png.readUInt32BE(20),1697);
 await page.pdf({path:out+'/certificate.pdf',preferCSSPageSize:true,printBackground:true});
 const pdf=await readFile(out+'/certificate.pdf');assert.ok(pdf.subarray(0,5).equals(Buffer.from('%PDF-')));assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,1);
 await capture(page,'certificate-screen');
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('#finalize').waitFor();
 assert.equal((await saved()).completed.length,10);assert.equal((await saved()).finalized,true);
 await page.locator('[data-settings]').tap();await page.locator('#get-certificate').tap();await page.locator('.cert-paper').waitFor();await page.waitForTimeout(900);
 await capture(page,'certificate-settings-reentry');
 const final=await saved();assert.ok(Object.values(final.records).every(record=>record.done&&record.workComplete&&!record.example));assert.equal(final.adminUnlocked,false);
 assert.deepEqual(errors,[]);
 await writeFile(out+'/result.json',JSON.stringify({units,checks,boundaries,certificate:true,certificatePng:{bytes:png.length,width:2400,height:1697},certificatePdf:{bytes:pdf.length,pages:1,headlessPrintCss:true,nativeSafariPrint:false},reload:true,errors,state:final},null,2));
 console.log('PASS: empty student save → 72 actual units → ending → PNG/PDF; real earned checkpoint boundary forks; no teacher unlock or injected completion');
}catch(error){
 await capture(page,'failure').catch(()=>{});await writeFile(out+'/failure.json',JSON.stringify({units,checks,boundaries,errors,state:await saved().catch(()=>null),error:String(error)},null,2));throw error;
}finally{await browser.close();}
