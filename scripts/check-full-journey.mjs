import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {evidenceSites,humanSites,relationCases,effectChains,dailyCases,compareCaseIndices,experimentLevels} from '../src/activity-data.js';
const require=createRequire(import.meta.url),{chromium}=require('../.tools/node_modules/playwright-core');
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true}),page=await context.newPage(),errors=[],checks=[];
const base=process.env.BASE_URL||'http://127.0.0.1:5357',out='.tmp/full-journey';await mkdir(out,{recursive:true});
page.on('pageerror',e=>errors.push(e.message));
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('climate-future:v1')));
let units=0;
async function done(index){await page.locator('.concept-dialog').waitFor();const s=await saved();assert.deepEqual(s.completed,Array.from({length:index+1},(_,i)=>i));assert.equal(s.records[index].example,false);assert.equal(s.records[index].workComplete,true);assert.equal(s.adminUnlocked,false);await page.locator('.concept-dialog .dialog-close').click();await page.locator('.continue-activity').click();if(index%2===1&&index<9)await page.locator(`[data-activity="${index+1}"]`).click();checks.push(`activity ${index}: actual cumulative completion, ${units} units`);console.log(checks.at(-1));}
try{
 await page.goto(base+'/#activity/0');assert.deepEqual((await saved()).completed,[]);
 for(let i=0;i<8;i++){await page.locator('.compare-slider').focus();await page.keyboard.press('End');assert.equal((await saved()).records[0].collected.length,i+1);units++;if(i<7)await page.locator('.next-site').click();}await page.locator('.submit').click();await done(0);
 for(const site of evidenceSites){await page.locator(`[data-answer="${site.climate?0:1}"]`).click();await page.locator('.check').click();units++;}await done(1);
 for(let i=0;i<humanSites.length;i++){await page.locator(`[data-resource="${humanSites[i].answer}"]`).click();units++;if(i<9)await page.locator('.next-site').click();}await page.locator('.submit').click();await done(2);
 for(const _ of relationCases){await page.locator('[data-link="0"]').click();await page.locator('.check').click();units++;}await done(3);
 for(const level of experimentLevels){await page.locator('[data-predict="beach"]').click();await page.locator('.run').click();assert.equal((await saved()).records[4].level,level);await page.locator('.next').click();units++;}await done(4);
 for(const _ of effectChains){for(const part of [0,1,2])await page.locator(`[data-part="${part}"]`).click();await page.locator('.check').click();units++;}await done(5);
 for(const _ of dailyCases){await page.locator('[data-choice="0"]').click();await page.locator('.next').click();units++;}await done(6);
 for(const _ of compareCaseIndices){await page.getByRole('button',{name:'A의 선택',exact:true}).click();await page.locator('.check').click();units++;}await page.locator('[data-practice="1"]').click();await page.locator('.submit').click();await done(7);
 const good=['shade','pond','shade','pond','trees','trees'];for(let i=0;i<6;i++){await page.locator(`[data-tool="${good[i]}"]`).click();await page.locator(`[data-district="${i}"]`).click();units++;}await page.locator('.submit').click();await done(8);
 for(let i=0;i<3;i++)await page.locator('.run').click();const before=(await saved()).records[9].before;assert.deepEqual(Object.keys(before).sort(),['heat','rain']);units+=2;
 await page.locator('.retest').click();await page.reload();assert.equal((await saved()).records[9].phase,3);await page.locator('.run').click();units+=2;await page.locator('.run').click();await done(9);
 assert.equal(units,72);assert.equal(new URL(page.url()).hash,'#ending');await page.locator('#finalize').click();await page.locator('.certificate-dialog').waitFor();assert.equal((await saved()).finalized,true);
 const dl=page.waitForEvent('download');await page.locator('#download-certificate').click();const file=await dl;assert.match(file.suggestedFilename(),/인증서/);await file.saveAs(out+'/certificate.svg');
 const exported=await readFile(out+'/certificate.svg','utf8');assert.equal((exported.match(/data:font\/woff2;base64,/g)||[]).length,2);assert.match(exported,/OPEN FONT LICENSE/);assert.match(exported,/font-family="NanumSquareNeo, sans-serif"/);
 await page.screenshot({path:out+'/certificate.png'});
 const exportedPage=await context.newPage();await exportedPage.setContent(exported);await exportedPage.evaluate(()=>document.fonts.ready);
 const exportedCdp=await context.newCDPSession(exportedPage);await exportedCdp.send('DOM.enable');await exportedCdp.send('CSS.enable');const doc=await exportedCdp.send('DOM.getDocument');const node=await exportedCdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'svg text'});const rendered=await exportedCdp.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId});assert.ok(rendered.fonts.some(font=>font.postScriptName.startsWith('NanumSquareNeo')&&font.isCustomFont),'downloaded certificate must render the embedded font');await exportedPage.screenshot({path:out+'/certificate-export-font.png'});await exportedPage.close();checks.push('downloaded SVG contains both fonts and full license; embedded font actually renders');
 await page.reload();assert.equal((await saved()).completed.length,10);assert.equal((await saved()).finalized,true);assert.deepEqual(errors,[]);
 await writeFile(out+'/result.json',JSON.stringify({units,checks,certificate:true,reload:true,errors,state:await saved()},null,2));console.log('PASS: 72 actual units, cumulative records, certificate download, refresh; no injected completion state');
}catch(e){await page.screenshot({path:out+'/failure.png'});await writeFile(out+'/failure.json',JSON.stringify({units,checks,errors,state:await saved(),error:String(e)},null,2));throw e;}finally{await browser.close();}
