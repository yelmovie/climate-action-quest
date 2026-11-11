import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {freshState} from '../src/state.js';
import {evaluateCity} from '../src/activities.js';
const require=createRequire(import.meta.url),{chromium}=require('../.tools/node_modules/playwright-core');
const out=fileURLToPath(new URL('../.tmp/responsive-check/',import.meta.url));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-crash-reporter','--disable-breakpad'],downloadsPath:out});
const context=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.BASE_URL||'http://127.0.0.1:5368';
let fixture;
await page.route('**/',async route=>{const response=await route.fetch();let html=await response.text();if(fixture){html=html.replace('<head>',`<head><script>localStorage.setItem('climate-future:v1',${JSON.stringify(JSON.stringify(fixture))});</script>`);fixture=null;}await route.fulfill({response,body:html});});
const teacher=process.argv.includes('--teacher');
const expanded=process.argv.includes('--expanded');
const single=process.argv.includes('--single-screen');
const selected=process.argv.find(arg=>arg.startsWith('--activities='))?.split('=')[1].split(',').map(Number);
const label=single?(teacher?'single-teacher':selected&&selected.length<10?'single-selected':'single'):expanded?'expanded':teacher?'teacher':selected?'after-selected':process.argv.includes('--before')?'before':'after';
const quick=process.argv.includes('--quick');
const custom=process.argv.find(arg=>arg.startsWith('--profiles='))?.split('=')[1].split(',').map(v=>v.split('x').map(Number));
const profiles=custom?custom:quick?[[1280,800],[390,844],[844,390]]:[[1920,1080],[1366,768],[1280,800],[1024,768],[873,580],[844,390],[390,844],[768,1024]];
const good=['shade','pond','shade','pond','trees','trees'];
const tested={heat:evaluateCity(good,'heat'),rain:evaluateCity(good,'rain')};
const screens=[...Array.from({length:5},(_,i)=>['facility/'+i,{}]),...Array.from({length:10},(_,i)=>['activity/'+i,{}])];
const variants=[[0,{open:7,reveal:100,collected:['summer']}],[1,{round:6,selected:0,checked:true}],[2,{open:9,collected:[9]}],[3,{round:2,checked:true,selected:0}],[4,{round:4,ran:true,prediction:['beach']}],[5,{round:3,order:[0,1,2],checked:true}],[6,{round:5,picked:0}],[6,{round:5,picked:2}],[7,{round:1,picked:1,checked:true}],[7,{round:4,practice:0}],[8,{plan:good}],[9,{phase:2,sourcePlan:good,baseline:good,plan:good,before:{heat:{total:8},rain:{total:8}}}]];
for(const phase of [0,1,3,4])variants.push([9,{phase,sourcePlan:good,baseline:good,plan:good,before:tested,after:tested}]);
if(!quick)screens.push(...variants.map(([i,record],n)=>['activity/'+i,record,'variant-'+n]));
async function inspect(){return page.evaluate(single=>{
  const root=document.querySelector('dialog[open]')||document.querySelector('.screen'),workspace=root.querySelector('.activity-workspace'),issues=[];
  const name=e=>(e.getAttribute('aria-label')||e.textContent).trim().replace(/\s+/g,' ').slice(0,70);
  const box=e=>e.getBoundingClientRect();
  const visible=e=>{const r=box(e),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[hidden]');};
  const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
  const reachable=e=>{let r=box(e);for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=box(p);if(/auto|scroll/.test(s.overflowY)&&p.scrollHeight>p.clientHeight+2)return true;if(/hidden|clip/.test(s.overflowY)&&(r.bottom>b.bottom+2||r.top<b.top-2))return false;if(p===root)break;}return r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2;};
  for(const e of root.querySelectorAll('button,input[type=range],select,[role=button],summary')){
    if(!visible(e))continue;
    if(!reachable(e))issues.push({type:'unreachable',name:name(e)});
    const r=box(e);if(r.width<43||r.height<43)issues.push({type:'small-target',name:name(e),w:Math.round(r.width),h:Math.round(r.height)});
    if(e.scrollWidth>e.clientWidth+2)issues.push({type:'text-overflow',name:name(e)});
    if(r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth){
      let clipped=false;for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=box(p);if(/auto|scroll|hidden|clip/.test(s.overflowY)&&(r.top<b.top||r.bottom>b.bottom))clipped=true;}
      const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      if(!clipped&&top&&!e.contains(top)&&!top.contains(e))issues.push({type:'covered',name:name(e),by:name(top)});
    }
  }
  for(const sel of ['.scan-hotspot','.flood-district','.district-tile','.facility-button']){
    const all=[...root.querySelectorAll(sel)].filter(visible);
    all.forEach((a,i)=>all.slice(i+1).forEach(b=>{if(overlap(box(a),box(b)))issues.push({type:'overlap',name:name(a)+' / '+name(b)});}));
  }
  const heading=root.querySelector('.activity-heading');if(heading)for(const e of root.querySelectorAll('.screen-hud button'))if(overlap(box(heading),box(e)))issues.push({type:'heading-hud',name:name(e)});
  if(heading){const concept=heading.querySelector('.learning-key');if(!concept||!visible(concept)||!concept.querySelector('strong'))issues.push({type:'missing-learning-concept',name:'기억할 개념'});}
  if(single&&workspace){
    const bounds=box(workspace);
    if(workspace.scrollHeight>workspace.clientHeight+3)issues.push({type:'workspace-scroll',amount:workspace.scrollHeight-workspace.clientHeight});
    for(const e of workspace.querySelectorAll('button,select,input,h2,p,.city-risk-legend,.ov-chart')){if(!visible(e))continue;const r=box(e);if(r.top<bounds.top-3||r.bottom>bounds.bottom+3||r.left<bounds.left-3||r.right>bounds.right+3)issues.push({type:'workspace-outside',name:name(e)});}
  }
  for(const e of root.querySelectorAll('.district-tile,.illustrated-tool,.flood-district,.activity-card')){
    const image=e.querySelector('img'),text=e.querySelector('strong,h2');if(image&&text&&visible(image)&&visible(text)&&overlap(box(image),box(text)))issues.push({type:'image-label',name:name(text)});
  }
  const fonts=[...root.querySelectorAll('p,li,button,h1,h2,h3,span,strong,label,small')].filter(e=>visible(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>[parseFloat(getComputedStyle(e).fontSize),e.textContent.trim().slice(0,30)]).sort((a,b)=>a[0]-b[0]);
  return {minFont:fonts[0],issues,overflowX:document.documentElement.scrollWidth>innerWidth+2,workspaceScroll:workspace?Math.max(0,workspace.scrollHeight-workspace.clientHeight):0};
},single);}
try{
 for(const [w,h] of profiles){
  await page.setViewportSize({width:w,height:h});
  for(const [route,record,suffix='initial'] of screens.filter(([route])=>!selected||selected.includes(Number(route.split('/')[1]))&&route.startsWith('activity/'))){
   const state=freshState();state.introSeen=true;state.route=route;
   for(let i=0;i<10;i++){state.records[i]={done:true,workComplete:true};state.completed.push(i);}
   state.records[8].plan=good;
   if(route.startsWith('activity/')){const index=Number(route.split('/')[1]);state.records[index]={...record};state.completed=state.completed.filter(i=>i!==index);}
   await page.goto('about:blank');fixture=state;await page.goto(base+'/#'+route);
   await page.locator('h1').waitFor();await page.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})]));await page.waitForTimeout(40);
   if(teacher){await page.getByRole('button',{name:'설정',exact:true}).click();await page.getByText('교사용 가이드',{exact:true}).click();await page.getByText('교사용 도구',{exact:true}).click();await page.locator('#admin-unlock').click();await page.locator('#close-settings').click();await page.locator('.teacher-dock').waitFor({state:'attached'});await page.locator('#toast').evaluate(el=>el.hidden=true);}
   const result={w,h,route,suffix,...await inspect()};results.push(result);
   if((w===1280||w===390||w===844)&&suffix==='initial')await page.screenshot({path:`${out}${label}-${w}-${route.replace('/','-')}.png`});
   if(expanded&&route.startsWith('activity/')){
    await page.locator('.guide-avatar').click();results.push({w,h,route,suffix:'hint',...await inspect()});
    await page.locator('.help-close').click();results.push({w,h,route,suffix:'help-closed',...await inspect()});
   }
  }
  const smallest=results.filter(r=>r.w===w&&r.minFont).sort((a,b)=>a.minFont[0]-b.minFont[0])[0];
  console.log(`${label} ${w}x${h}: ${results.filter(r=>r.w===w&&r.issues.length).length} screens with issues · smallest text ${smallest?.minFont?.[0]}px "${smallest?.minFont?.[1]}" (${smallest?.route})`);
 }
 await writeFile(out+label+'.json',JSON.stringify({results,errors},null,2));
 console.log(JSON.stringify({screens:results.length,errors,failures:results.filter(r=>r.issues.length||r.overflowX)},null,2));
 if(errors.length||results.some(r=>r.issues.length||r.overflowX))process.exitCode=1;
}finally{await browser.close();}
