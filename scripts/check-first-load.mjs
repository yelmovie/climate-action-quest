// First screen load (edu-final-check D1 + 8번) and home/map/story layout at the classroom viewports.
// Run against the deployment build: `npm run preview` (PORT), then BASE_URL=http://127.0.0.1:PORT node scripts/check-first-load.mjs
// Throttled profile approximates a busy school Wi-Fi (20 Mbps down, 40 ms latency). Numbers are local measurements, not field data.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright-core'));}catch{({chromium}=require('../.tools/node_modules/playwright-core'));}
const base=process.env.BASE_URL||'http://127.0.0.1:4275',out='.tmp/first-load';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-crash-reporter','--disable-breakpad']});
const result={base,load:[],layout:[],errors:[]};
async function firstLoad(label,throttle){
 const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'}),page=await context.newPage();
 page.on('pageerror',e=>result.errors.push(label+': '+e.message));
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 if(throttle)await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:20e6/8,uploadThroughput:5e6/8});
 let bytes=0,requests=0,external=[];const seen=new Map();
 cdp.on('Network.responseReceived',e=>{seen.set(e.requestId,e.response.url);if(!e.response.url.startsWith(base)&&!e.response.url.startsWith('data:'))external.push(e.response.url);});
 cdp.on('Network.loadingFinished',e=>{bytes+=e.encodedDataLength;requests++;});
 const t0=Date.now();await page.goto(base+'/',{waitUntil:'commit'});
 await page.locator('.boot').waitFor({state:'attached',timeout:5000}).catch(()=>{});
 const bootShown=await page.locator('.boot').count();
 await page.locator('#start').waitFor({state:'visible'});const startVisible=Date.now()-t0;
 await page.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>i.complete?0:i.decode().catch(()=>{}))]));const artReady=Date.now()-t0;
 const bytesAtStart=bytes;
 await page.waitForLoadState('networkidle');const idle=Date.now()-t0;
 const urls=[...seen.values()].map(u=>u.replace(base,'')).filter(u=>/\/assets\/(concepts|concept-art)\//.test(u));
 result.load.push({label,startVisibleMs:startVisible,artReadyMs:artReady,networkIdleMs:idle,bytesAtStart,bytesAtIdle:bytes,requests,bootPlaceholder:bootShown>0,laterStageAssetsFetched:urls,external});
 await context.close();
}
await firstLoad('local',false);
await firstLoad('school-wifi-20mbps',true);
// Layout: title, story dialog, map. The activity screens are covered by check-responsive.mjs.
const sizes=[[1280,800],[1920,1080],[1024,768],[915,412],[1024,600],[830,515]];
const inspect=()=>{
 const root=document.querySelector('dialog[open]')||document.querySelector('.screen'),issues=[];
 const name=e=>(e.getAttribute('aria-label')||e.textContent).trim().replace(/\s+/g,' ').slice(0,60);
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[hidden]');};
 for(const e of root.querySelectorAll('button,a[href],[role=button]')){
  if(!visible(e))continue;const r=e.getBoundingClientRect();
  if(r.width<44||r.height<44)issues.push({type:'small-target',name:name(e),w:Math.round(r.width),h:Math.round(r.height)});
  let scroller=false;for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/auto|scroll/.test(s.overflowY)&&p.scrollHeight>p.clientHeight+2){scroller=true;break;}}
  if(!scroller&&(r.right>innerWidth+2||r.bottom>innerHeight+2||r.left<-2||r.top<-2))issues.push({type:'offscreen',name:name(e)});
  if(!scroller&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth){const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(top&&!e.contains(top)&&!top.contains(e))issues.push({type:'covered',name:name(e),by:name(top)});}
  if(e.scrollWidth>e.clientWidth+2)issues.push({type:'text-overflow',name:name(e)});
 }
 const small=[...root.querySelectorAll('p,li,button,h1,h2,h3,span,strong,label')].filter(e=>visible(e)&&e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>parseFloat(getComputedStyle(e).fontSize));
 return {issues,overflowX:document.documentElement.scrollWidth>innerWidth+2,minFont:Math.min(...small)};
};
for(const [w,h] of sizes){
 const context=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage();
 page.on('pageerror',e=>result.errors.push(`${w}x${h}: `+e.message));
 await page.goto(base+'/');await page.locator('#start').waitFor();await page.evaluate(()=>document.fonts.ready);
 result.layout.push({w,h,screen:'home',...await page.evaluate(inspect)});await page.screenshot({path:`${out}/home-${w}x${h}.png`});
 await page.locator('#start').click();await page.locator('dialog[open]').waitFor();
 result.layout.push({w,h,screen:'story',...await page.evaluate(inspect)});await page.screenshot({path:`${out}/story-${w}x${h}.png`});
 await page.keyboard.press('Escape');await page.waitForTimeout(150);
 if(await page.locator('dialog[open]').count()){const close=page.locator('dialog[open] button').last();await close.click();}
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('climate-future:v1')||'{}');s.version=1;s.introSeen=true;s.route='map';localStorage.setItem('climate-future:v1',JSON.stringify(s));});
 await page.goto(base+'/#map');await page.locator('#map-viewport').waitFor();await page.waitForTimeout(300);
 result.layout.push({w,h,screen:'map',...await page.evaluate(inspect)});await page.screenshot({path:`${out}/map-${w}x${h}.png`});
 await context.close();
}
await browser.close();
await writeFile(out+'/result.json',JSON.stringify(result,null,1));
for(const l of result.load)console.log(`${l.label}: start button ${l.startVisibleMs}ms, art ${l.artReadyMs}ms, idle ${l.networkIdleMs}ms, ${(l.bytesAtStart/1048576).toFixed(2)}MiB at start, ${(l.bytesAtIdle/1048576).toFixed(2)}MiB at idle, later-stage assets ${l.laterStageAssetsFetched.length}, external ${l.external.length}`);
for(const r of result.layout)console.log(`${r.w}x${r.h} ${r.screen}: ${r.issues.length} issues${r.overflowX?' +overflowX':''}, min font ${r.minFont}px ${r.issues.length?JSON.stringify(r.issues.slice(0,4)):''}`);
console.log(result.errors.length?'ERRORS '+JSON.stringify(result.errors):'no page errors');
