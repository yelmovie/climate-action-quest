import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {freshState} from '../src/state.js';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright-core'));}catch{({chromium}=require('../.tools/node_modules/playwright-core'));}
const out='.tmp/experience-check';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-crash-reporter','--disable-breakpad'],env:{...process.env,TEMP:process.cwd()+'/.tmp',TMP:process.cwd()+'/.tmp'}});
const page=await browser.newPage({serviceWorkers:'block'}),errors=[];page.on('requestfailed',req=>{if(req.failure()?.errorText!=='net::ERR_ABORTED')console.warn('Failed request',req.url(),req.failure()?.errorText);});page.on('pageerror',e=>errors.push(e.message));
const state=freshState();state.adminUnlocked=true;state.introSeen=true;
for(let i=0;i<10;i++){state.records[i]={done:true,workComplete:true};state.completed.push(i);}

const base=process.env.BASE_URL||'http://localhost:4175',results=[];
await page.goto(base);
await page.evaluate(s=>localStorage.setItem('climate-future:v1',JSON.stringify(s)),state);
await page.reload();
const good=['shade','pond','shade','pond','trees','trees'];
async function loadFixture(route,index,record={}){
 console.log('Fixture',route,index??'complete');
 const s=freshState();s.adminUnlocked=true;s.introSeen=true;
 for(let i=0;i<10;i++){s.records[i]={done:true,workComplete:true};s.completed.push(i);}
 s.records[8].plan=good;if(index!==undefined){Object.assign(s.records[index],record,{done:false,workComplete:false});s.completed=s.completed.filter(n=>n!==index);}s.finalized=true;
 await page.evaluate(({s,route})=>{localStorage.setItem('climate-future:v1',JSON.stringify(s));history.replaceState(null,'','#'+route);},{s,route});await page.reload();await page.locator('h1').waitFor();await page.evaluate(()=>Promise.race([Promise.all([document.fonts.ready,...[...document.images].filter(img=>img.getBoundingClientRect().width&&img.getBoundingClientRect().height).map(img=>img.decode().catch(()=>{}))]),new Promise((_,reject)=>setTimeout(()=>reject(Error('Page assets did not settle within 10 seconds')),10000))]));await page.waitForTimeout(220);
}
const viewport=process.argv.find(arg=>/^--viewport=\d+x\d+$/.test(arg))?.split('=')[1];
const profiles=viewport?[viewport.split('x').map(Number)]:process.argv.includes('--quick')?[[1280,800]]:[[906,755],[1024,768],[1280,720],[1366,768],[1920,1080],[873,580]];
async function inspect(name,w,h){
 const checks=await page.evaluate(()=>{
  const visible=e=>{const scroll=e.closest('.settings-scroll,.home-copy'),r=e.getBoundingClientRect(),s=scroll?.getBoundingClientRect();return !!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&getComputedStyle(e).visibility!=='hidden'&&(!e.closest('details')||e.closest('details').open||e.tagName==='SUMMARY')&&(!s||(r.top<s.bottom&&r.bottom>s.top));};
  const root=document.querySelector('dialog[open]')||document.querySelector('.screen');
  // Map labels live on the pannable world layer; off-screen ones are reached by walking or dragging.
  const clipped=[...root.querySelectorAll('button,input[type=range],[role=button]')].filter(visible).filter(e=>!e.closest('.map-world')).filter(e=>!e.closest('.home-copy')||getComputedStyle(e.closest('.home-copy')).overflowY!=='auto').filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5||r.top<-.5||r.bottom>innerHeight+.5;}).map(e=>(e.getAttribute('aria-label')||e.textContent).trim().slice(0,50));
  const small=[...root.querySelectorAll('button,input[type=range],[role=button]')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.width<43||r.height<43;}).map(e=>(e.getAttribute('aria-label')||e.textContent).trim().slice(0,40));
  const workspace=document.querySelector('.activity-workspace');
  const overlaps=[];
  for(const group of ['.scan-hotspot','.map-node']){const boxes=[...root.querySelectorAll(group)].filter(visible).map(e=>({name:e.textContent.trim(),r:e.getBoundingClientRect()}));boxes.forEach((a,i)=>boxes.slice(i+1).forEach(b=>{if(Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)>3&&Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top)>3)overlaps.push(a.name+' / '+b.name);}));}
  const shortText=[...root.querySelectorAll('p,strong,.button')].filter(visible).filter(e=>parseFloat(getComputedStyle(e).fontSize)<18).map(e=>e.textContent.trim().slice(0,40));
  return {clipped,small,shortText,overlaps,scroll:workspace?Math.max(0,workspace.scrollHeight-workspace.clientHeight):0,overflowX:document.documentElement.scrollWidth>innerWidth};
 });
 results.push({name,w,h,...checks});
 if(w===1280||checks.clipped.length||checks.overflowX||checks.overlaps.length)await page.screenshot({path:`${out}/${w}-${h}-${name.replaceAll('/','-')}.png`,animations:'disabled',timeout:15000});
}
try{
 for(const [w,h] of profiles){
 console.log('Viewport',w,h);
  await page.setViewportSize({width:w,height:h});
  // Each size starts from the same preview state, independent of the previous size's completed fixtures.
  await page.evaluate(s=>{localStorage.setItem('climate-future:v1',JSON.stringify(s));history.replaceState(null,'','#home');},state);
  await page.reload();
  for(const route of ['home','map','facility/0','facility/1','facility/2','facility/3','facility/4',...Array.from({length:10},(_,i)=>'activity/'+i)]){
   await page.goto(base+'/#'+route);await page.locator('h1,.map-action').first().waitFor();await page.evaluate(()=>Promise.race([Promise.all([document.fonts.ready,...[...document.images].filter(img=>img.getBoundingClientRect().width&&img.getBoundingClientRect().height).map(img=>img.decode().catch(()=>{}))]),new Promise((_,reject)=>setTimeout(()=>reject(Error('Page assets did not settle within 10 seconds')),10000))]));await page.waitForTimeout(220);
   if(new URL(page.url()).hash!=='#'+route)throw new Error('Expected route '+route+', got '+page.url());
   await inspect(route,w,h);
   if(route==='home'&&await page.locator('.home-copy').evaluate(el=>getComputedStyle(el).overflowY==='auto')){
    for(const button of await page.locator('.home-copy [data-voice]').all()){
     await button.click();
     const bounds=await button.boundingBox();
     if(!bounds||bounds.y<0||bounds.y+bounds.height>h)throw Error('Scrolled home voice remains offscreen');
    }
    await page.locator('.home-copy').evaluate(el=>el.scrollTop=0);
   }
  }
  await page.getByRole('button',{name:'설정',exact:true}).click();await page.waitForTimeout(220);await inspect('settings',w,h);
  for(let i=0;i<4;i++){await page.locator('.settings-section').nth(i).locator('summary').first().click();await inspect('settings-section-'+i,w,h);}
  await page.locator('#replay-story').click();await page.waitForTimeout(220);await inspect('story',w,h);for(let i=2;i<=3;i++){await page.locator('.story-next').click();await inspect('story-'+i,w,h);}await page.locator('.dialog-close').click();
  const scenarios=[
   [0,'observation-recorded',{open:0,reveal:100,compared:['summer'],collected:['summer']}],
   [1,'judgment-feedback',{round:6,selected:0,checked:true,feedback:'같은 기준으로 여러 해의 평균을 비교해 긴 변화의 경향을 찾아요.'}],
   [2,'scanner-found',{open:9,collected:[9]}],
   [3,'link-finished',{round:2,checked:true,selected:0}],
   [4,'water-result',{round:4,ran:true,level:4,prediction:['beach']}],
   [5,'chain-filled',{round:3,order:[0,1,2],checked:true}],
   [6,'choice-preview',{round:5,picked:0}],
   [7,'comparison-selected',{round:1,picked:1,checked:true}],
   [7,'practice-pledge',{round:4,practice:0}],
   [8,'city-filled',{plan:good}],
   [8,'city-erase',{plan:good,tool:'erase',selected:4}],
   [9,'stress-first',{phase:1,sourcePlan:good,baseline:good,plan:good,before:{heat:{},rain:{}}}],
   [9,'stress-review',{phase:2,sourcePlan:good,baseline:good,plan:good,before:{heat:{},rain:{}}}],
   [9,'stress-final',{phase:4,sourcePlan:good,baseline:good,plan:good,before:{heat:{},rain:{}},after:{heat:{},rain:{}}}]
  ];
  for(const [i,name,record] of scenarios){await loadFixture('activity/'+i,i,record);await inspect(name,w,h);}
  for(let i=0;i<10;i++){await loadFixture('facility/'+Math.floor(i/2));await page.locator(`[data-clip="${i}"]`).click();await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);await page.waitForTimeout(220);await inspect('concept-'+i,w,h);await page.locator('.dialog-close').click();}
  await loadFixture('ending');await inspect('ending',w,h);await page.locator('#finalize').click();await page.waitForTimeout(220);await inspect('certificate',w,h);await page.locator('.dialog-close').click();await page.getByRole('button',{name:'설정',exact:true}).click();await page.locator('#reset-progress').click();await page.waitForTimeout(220);await inspect('reset-confirmation',w,h);
 }
 await writeFile(out+(viewport?'/layout-'+viewport+'.json':'/layout.json'),JSON.stringify({results,errors},null,2));
 console.log(JSON.stringify({screens:results.length,errors,clipped:results.filter(r=>r.clipped.length||r.overflowX),overlaps:results.filter(r=>r.overlaps.length),small:results.filter(r=>r.small.length),scroll:results.filter(r=>r.scroll>20).map(({name,w,h,scroll})=>({name,w,h,scroll}))},null,2));
 if(errors.length||results.some(r=>r.clipped.length||r.overlaps.length||r.small.length||r.overflowX||r.scroll>20))process.exitCode=1;
}catch(error){console.error('Layout failure:',error,'URL:',page.url(),'Page errors:',errors);await page.screenshot({path:out+'/layout-failure.png',timeout:5000}).catch(()=>{});throw error;}finally{await browser.close();}
