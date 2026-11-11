import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {MISSION_SAVE_KEY} from '../src/play-mission-model.js';

const require=createRequire(import.meta.url);
const {chromium}=require('../.tools/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:5416';
const out='.tmp/play-mission-check';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-crash-reporter','--disable-breakpad']});
const checks=[],layouts=[],errors=[];
const plans=[['park','park'],['park','park','wetland','wetland'],['park','park','wetland','wetland','bus']];

async function audit(page,label){
 await page.evaluate(()=>document.fonts.ready);
 const result=await page.locator('.play-mission').evaluate(dialog=>{
  const issues=[];
  for(const button of dialog.querySelectorAll('button')){
   const rect=button.getBoundingClientRect();
   const name=button.getAttribute('aria-label')||button.textContent.trim();
   if(rect.width<43.9||rect.height<43.9)issues.push({type:'small-target',name});
   if(button.scrollWidth>button.clientWidth+2)issues.push({type:'text-overflow',name});
   const workspace=button.closest('.pm-workspace');
   if(workspace){const bounds=workspace.getBoundingClientRect();if(rect.top<bounds.top||rect.bottom>bounds.bottom)continue;}
   if(rect.top<0||rect.bottom>innerHeight||rect.left<0||rect.right>innerWidth)issues.push({type:'offscreen',name});
   else{const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);if(hit&&!button.contains(hit))issues.push({type:'covered',name});}
  }
  const small=[...dialog.querySelectorAll('p,span,small,button,h2,b')].filter(element=>element.getBoundingClientRect().height&&[...element.childNodes].some(node=>node.nodeType===3&&node.textContent.trim())).map(element=>parseFloat(getComputedStyle(element).fontSize));
  const feedback=dialog.querySelector('.pm-feedback')?.getBoundingClientRect();
  if(feedback&&(feedback.top<0||feedback.bottom>innerHeight))issues.push({type:'hidden-feedback'});
  return {issues,overflowX:document.documentElement.scrollWidth>innerWidth+2,dialogOverflow:dialog.scrollHeight>dialog.clientHeight+2,minFont:Math.min(...small)};
 });
 layouts.push({label,viewport:page.viewportSize(),...result});
 assert.deepEqual(result.issues,[],label);
 assert.equal(result.overflowX,false,label);
 assert.equal(result.dialogOverflow,false,label);
 assert.ok(result.minFont>=(page.viewportSize().width>=1600?18:14),label+' font minimum');
}

try{
 for(const [width,height] of [[1280,800],[1024,768],[1920,1080],[915,412],[1024,600],[830,515],[390,844],[768,1024]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await page.locator('.play-mission-entry').first().tap();
  await audit(page,'initial');
  await page.locator('[data-test]').tap();
  assert.match(await page.locator('.pm-feedback').innerText(),/폭염 부담/);
  assert.equal(await page.locator('[data-next]').count(),0);
  await audit(page,'retry');
  for(let level=0;level<plans.length;level++){
   for(const [cell,tool] of plans[level].entries()){
    await page.locator(`[data-tool="${tool}"]`).tap();
    await page.locator(`[data-cell="${cell}"]`).tap();
   }
   await page.locator('[data-test]').tap();
   await page.locator('.pm-feedback.good').waitFor();
   await audit(page,'success-'+level);
   if(level===2)await page.screenshot({path:`${out}/complete-${width}x${height}.png`});
   if(level<2)await page.locator('[data-next]').tap();
  }
  const completed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),MISSION_SAVE_KEY);
  assert.deepEqual(completed.won,[0,1,2]);
  await page.locator('[data-close]').tap();await page.reload();
  await page.locator('.play-mission-entry').first().tap();
  assert.equal(await page.locator('[aria-current="step"]').getAttribute('data-level'),'2');
  assert.equal(await page.locator('.pm-cell.occupied').count(),5);
  await page.locator('[data-tool="roof"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.tool),'roof');
  await page.locator('[data-cell="0"]').tap();await page.locator('[data-undo]').tap();
  assert.match(await page.locator('[data-cell="0"]').getAttribute('aria-label'),/나무 그늘/);
  await page.setViewportSize({width:height,height:width});await audit(page,'rotation');
  await page.setViewportSize({width,height});
  const inquiry=await page.evaluate(()=>localStorage.getItem('climate-future:v1'));
  await page.locator('[data-reset]').tap();await audit(page,'reset-confirm');
  await page.locator('[data-cancel-reset]').tap();
  assert.equal(await page.locator('.pm-cell.occupied').count(),5);
  await page.locator('[data-reset]').tap();await page.locator('[data-confirm-reset]').tap();
  assert.equal(await page.locator('.pm-cell.occupied').count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('climate-future:v1')),inquiry);
  assert.ok(await page.evaluate(key=>localStorage.getItem(key+':before-reset'),MISSION_SAVE_KEY));
  await page.keyboard.press('Escape');await page.locator('dialog.play-mission').waitFor({state:'detached'});
  checks.push(`${width}×${height} touch, 3 missions, focus, undo, reload, rotation, reset backup`);
  console.log('PASS',checks.at(-1));await context.close();
 }
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 await page.goto(base);await page.evaluate(key=>localStorage.setItem(key,'{broken'),MISSION_SAVE_KEY);
 await page.locator('.play-mission-entry').first().click();await page.locator('[data-cell="0"]').click();
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),MISSION_SAVE_KEY),'{broken');
 await page.locator('.pm-error').waitFor();await page.locator('[data-close]').click();
 await page.evaluate(key=>localStorage.removeItem(key),MISSION_SAVE_KEY);
 await page.locator('.play-mission-entry').first().click();
 const other=await context.newPage();await other.goto(base);await other.locator('.play-mission-entry').first().click();
 await other.locator('[data-tool="bus"]').click();await other.locator('[data-cell="0"]').click();
 const latest=await other.evaluate(key=>localStorage.getItem(key),MISSION_SAVE_KEY);
 await page.locator('[data-cell="1"]').click();
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),MISSION_SAVE_KEY),latest);
 assert.match(await page.locator('.pm-error').innerText(),/다른 탭/);
 checks.push('corrupt source and concurrent-tab revision preserved');
 await context.close();assert.deepEqual(errors,[]);
}finally{
 await writeFile(out+'/result.json',JSON.stringify({checks,layouts,errors},null,2));
 await browser.close();
}
