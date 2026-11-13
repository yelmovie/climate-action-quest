import {sourceActivityRecord} from './activity-record.js';
import {voiceControl} from './narration.js';
import {voiceLines} from './voice-lines.js';
import {npcPortrait} from './npc-conversation.js';
import {activityTitles,evidenceSites,humanSites,resourceNames,relationCases,coastDistricts,experimentLevels,effectChains,dailyCases,compareCaseIndices,facilities,cityDistricts,CITY_BUDGET,activityLearning} from './activity-data.js';
import {activityGuide,activityAction} from './activity-guide.js';
import {bindManipulation} from './manipulation.js';
import {conceptArt,artImage,dailyArt,humanArt,effectArt} from './concept-art.js';
import {enhanceObservation as enhanceObservationVisuals} from './observation-visuals.js';
import {enhanceImpact} from './impact-visuals.js';
import {enhanceCityVisuals} from './city-visuals.js';
import {createActivityPlayback} from './activity-playback.js';

const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=value=>Array.isArray(value)?value:[];
const bounded=(value,max)=>Math.max(0,Math.min(max,Number.isFinite(+value)?Math.floor(+value):0));
const threeOrders=[[0,2,1],[1,0,2],[2,1,0],[2,0,1],[0,1,2],[1,2,0]];
export const activityChoiceOrder=round=>[...threeOrders[bounded(round,10000)%threeOrders.length]];
export const waterAffected=level=>coastDistricts.filter(d=>d.height<=bounded(level,4)).map(d=>d.id);
export const normalizePlan=plan=>cityDistricts.map((_,i)=>facilities.some(f=>f.id===arr(plan)[i])?plan[i]:null);
export const planCost=plan=>normalizePlan(plan).reduce((sum,id)=>sum+(facilities.find(f=>f.id===id)?.cost||0),0);
export function evaluateCity(plan,hazard){
  if(!['heat','rain'].includes(hazard))throw new TypeError('Unknown hazard');
  const normalized=normalizePlan(plan);
  const districts=cityDistricts.map((d,i)=>({id:d.id,name:d.name,risk:Math.max(0,d[hazard]-(facilities.find(f=>f.id===normalized[i])?.[hazard]||0))}));
  return {hazard,total:districts.reduce((n,d)=>n+d.risk,0),districts};
}
export function dailyMetrics(choices){
  return dailyCases.reduce((sum,c,i)=>{const choice=c.options[bounded(arr(choices)[i],c.options.length-1)];return sum.map((n,j)=>n+choice[1][j]);},[0,0,0]);
}
export function canCompleteStress(before,after){
  if(!before||!after||!['heat','rain'].every(h=>before[h]&&after[h]))return false;
  const first=before.heat.total+before.rain.total,last=after.heat.total+after.rain.total;
  return last<=first&&after.heat.total<=10&&after.rain.total<=10;
}
export function freshActivityRecord(record,example=false){
  // Replaying a real investigation keeps its earned completion. Preview work
  // is never promoted into an earned completion when real prerequisites arrive.
  const done=record?.done===true&&record?.example!==true&&!example;
  const next={example,done,workComplete:false};
  if(done){
    const {earnedRecord,...snapshot}=record;
    // Keep only the most recent completed evidence, never a growing history.
    next.earnedRecord=record.workComplete===false&&earnedRecord?earnedRecord:snapshot;
  }
  return next;
}
export {sourceActivityRecord} from './activity-record.js';

/** DOM activities are isolated from routing and storage. Every work step survives refresh. */
export function mountActivity(host,{index,state,save,complete,icon=()=>'',asset=name=>`/assets/${name}.webp`,announce=()=>{},effect=()=>{},watchConcept=()=>{},continueActivity=()=>{},continueLabel=()=> '다음 연구 시작'}){
  if(!Number.isInteger(index)||index<0||index>9)throw new RangeError('Unknown activity');
  state.records??={};
  if(!state.records[index]||typeof state.records[index]!=='object')state.records[index]={};
  let rec=state.records[index],controller,playback,disposed=false,finishing=false;
  const lifetime=new AbortController();
  const needsPrevious=[1,3,5,7,9].includes(index);
  const previous=index-1;
  const example=needsPrevious&&!arr(state.completed).includes(previous);
  // A classroom preview never silently turns into the student's own evidence.
  // Once the prerequisite exists, start a fresh real investigation.
  if(rec.example&&!example)rec=freshActivityRecord(rec,example);
  rec.example=example;
  const commit=()=>{state.records[index]=rec;save();};
  const b=(text,extra='',disabled=false)=>`<button type="button" class="button ${extra}" ${disabled?'disabled':''}>${text}</button>`;
  function on(selector,event,fn){host.querySelectorAll(selector).forEach(el=>el.addEventListener(event,fn,{signal:controller.signal}));}
  function say(text,good=false){rec.feedback=text;const el=host.querySelector('.activity-feedback');if(el){el.textContent=text;el.classList.toggle('positive',good);}presentAction();effect(good?'success':'retry');announce(text);commit();}
  function finish(summary){if(finishing)return;finishing=true;playback?.stop();rec.workComplete=true;commit();complete(summary);draw();}
  function recordRound(total,summary){commit();if(rec.round>=total)finish(summary);else draw();}
  function instruction(){return activityAction(index,rec);}
  function playbackAvailable(){return !rec.workComplete&&((index===0&&rec.collected?.length!==8)||(index===4&&!(rec.ran&&rec.round===5))||(index===9&&![2,4].includes(rec.phase)));}
  function playbackTools(){if(!playbackAvailable())return '';const speed=playback?.snapshot.speed||1;return `<div class="playback-tools" role="group" aria-label="실험 자동재생"><button type="button" class="button playback-toggle" data-playback aria-pressed="false">${icon('play')}<span>자동재생</span></button><label class="playback-speed"><span>속도</span><select aria-label="재생 속도">${[.5,1,2].map(n=>`<option value="${n}" ${n===speed?'selected':''}>${n}배</option>`).join('')}</select></label></div>`;}
  function frame(title,brief,body,progress,action='',note='가상 교육용 자료예요. 실제 측정값이나 특정 지역의 미래 예측이 아니에요.'){
    const guide=activityGuide(index,rec),learning=activityLearning[index];
    const teacherTools=host.closest('.screen')?.querySelector('.teacher-dock');
    if(teacherTools&&host.contains(teacherTools))host.parentElement.append(teacherTools);
    host.innerHTML=`<section class="activity-page activity-${index}" aria-label="${escapeText(activityTitles[index])}"><header class="activity-heading"><h1>${escapeText(title)}</h1><span class="round-progress">${escapeText(progress)}${example?' · 교사용 예시':''}</span><p class="learning-key" aria-label="기억할 개념">${escapeText(learning.lead)}<strong>${escapeText(learning.key)}</strong>${escapeText(learning.tail)}</p></header><div class="activity-workspace">${body}</div><footer class="activity-footer-wrap"><div class="activity-footer"><button class="guide-avatar" aria-label="${guide.name}의 힌트" aria-haspopup="dialog"><img src="${asset(guide.character)}" alt=""><span>도움</span></button><div class="guide-message"><p class="activity-feedback" role="status">${escapeText(rec.feedback||instruction())}</p><p class="learning-action" hidden></p></div>${playbackTools()}${action?`<div class="activity-next">${action}</div>`:''}</div></footer><dialog class="activity-help" aria-label="탐구 도움말"><button class="help-close icon-button" aria-label="도움말 닫기">${icon('close')}</button><h2>${guide.name}의 탐구 도움</h2><div class="npc-dialogue-grid">${npcPortrait(guide.character==='otter'?'mulbangul':'ipsae')}<div class="npc-dialogue-copy"><p>${escapeText(brief)}</p><p class="guide-deeper">${escapeText(guide.deeper)}</p></div></div>${[4,5].includes(index)?artImage(index===4||(rec.round||0)<4?'scene-coast-landscape':effectArt[Math.min(rec.round||0,7)],'learning-illustration'): ''}<h3>기억할 개념</h3><p>${escapeText(learning.detail)}</p><h3>내 말로 설명해 봐요</h3><p>${escapeText(learning.question)}</p><h3>다음 탐구와 연결해요</h3><p>${escapeText(learning.bridge)}</p><h3>자료 안내</h3><p>${escapeText(note)}</p>${example?'<p>교사용 예시이며 실제 완료 기록에는 반영되지 않아요.</p>':''}</dialog></section>`;
  }
  function draw(){
    if(disposed)return;
    const active=host.contains(document.activeElement)?document.activeElement:null;
    const key=active&&Object.keys(active.dataset).find(k=>['site','answer','resource','link','predict','reflect','part','remove','choice','practice','compare','tool','district'].includes(k));
    const action=active&&['check','next','run','submit','retest','redesign','finish','replay','next-site'].find(c=>active.classList.contains(c));
    const focusSelector=active?.matches('[data-playback]')?'[data-playback]':active?.matches('.playback-speed select')?'.playback-speed select':key?`[data-${key}="${active.dataset[key]}"]`:action?`.${action}`:null;
    controller?.abort();controller=new AbortController();
    [scanEvidence,judgeEvidence,scanHuman,linkRelations,waterExperiment,orderEffects,dailyChoice,compareChoices,designCity,stressTest][index]();
    enhance();
    const retry=`retry-${index}`;if(voiceLines[retry]&&rec.feedback===voiceLines[retry].text)voiceControl(host.querySelector('.guide-message'),retry,{autoplay:true});
    presentActivity();
    playback?.refresh();
    host.querySelectorAll('.choice-card,.flood-district,.scan-hotspot,.facility-button,[data-district]').forEach(el=>el.setAttribute('aria-pressed',String(el.classList.contains('selected')||el.classList.contains('correct'))));
    if(focusSelector){const target=host.querySelector(focusSelector);if(target&&!target.disabled)target.focus({preventScroll:true});else host.querySelector('.activity-next .button:not(:disabled)')?.focus({preventScroll:true});}
  }
  function reset(){finishing=false;rec=freshActivityRecord(rec,example);state.records[index]=rec;commit();draw();}
  function enhance(){
    const signal=controller.signal;
    if(rec.workComplete&&rec.done){const next=host.querySelector('.activity-next');if(next){next.innerHTML=b(escapeText(continueLabel()),'primary continue-activity');on('.continue-activity','click',continueActivity);host.querySelector('.activity-feedback').textContent='기록을 마쳤어요. 다음 탐구로 이어 가요.';}}
    on('.guide-avatar','click',()=>{
      playback?.pause();const help=host.querySelector('.activity-help'),tools=host.closest('.screen')?.querySelector('.teacher-dock');
      if(tools&&!help.contains(tools)){const title=document.createElement('h3');title.textContent='교사 단계 이동';help.append(title,tools);}
      help.showModal();effect('hint');help.querySelectorAll('.voice-replay,.voice-status').forEach(el=>el.remove());voiceControl(help.querySelector('.npc-dialogue-copy'),index===4?`hint-4${rec.ran?'b':'a'}`:`hint-${index}`,{autoplay:true});
    });
    on('.help-close','click',()=>host.querySelector('.activity-help').close());
    on('[data-playback]','click',()=>playback.toggle());
    on('.playback-speed select','change',e=>playback.setSpeed(Number(e.target.value)));
    if(rec.done&&!rec.example){const watch=document.createElement('button');watch.className='concept-revisit';watch.textContent='개념 영상 다시 보기';watch.onclick=()=>{host.querySelector('.activity-help').close();watchConcept();};host.querySelector('.guide-deeper').append(watch);}
    const drag=(el,value)=>{if(el){el.dataset.drag=value;el.classList.add('can-drag');}};
    if(index===1){drag(host.querySelector('.evidence-card'),'evidence');host.querySelectorAll('[data-answer]').forEach(el=>el.dataset.drop='judgment');}
    if(index===2&&!rec.collected?.includes(rec.open)){drag(host.querySelector('.evidence-card'),'resource');host.querySelectorAll('[data-resource]').forEach(el=>el.dataset.drop='resource');}
    if(index===3){host.querySelectorAll('[data-link]').forEach(el=>drag(el,'link:'+el.dataset.link));const slot=host.querySelectorAll('.chain-slot')[1];if(slot)slot.dataset.drop='link';}
    if(index===5){host.querySelectorAll('[data-part]').forEach(el=>{el.hidden=el.disabled;if(!rec.checked)drag(el,'part:'+el.dataset.part);});if(rec.order.length===3)host.querySelector('.chain-options').hidden=true;host.querySelectorAll('[data-remove]').forEach((el,i)=>{el.dataset.drop='part';if(rec.order[i]!==undefined&&!rec.checked)drag(el,'part:'+rec.order[i]);});}
    if(index===8||(index===9&&rec.phase===2)){host.querySelectorAll('[data-tool]').forEach(el=>drag(el,'tool:'+el.dataset.tool));host.querySelectorAll('[data-district]').forEach(el=>el.dataset.drop='tool');}
    bindManipulation(host,{signal,drop:(value,target)=>{
      const [kind,id]=value.split(':');
      if(kind==='evidence'&&target.dataset.answer!==undefined)target.click();
      else if(kind==='resource'&&target.dataset.resource!==undefined)target.click();
      else if(kind==='link'&&target.dataset.drop==='link')host.querySelector(`[data-link="${id}"]`)?.click();
      else if(kind==='part'&&target.dataset.remove!==undefined&&!rec.checked){const next=rec.order.filter(n=>n!==+id);next.splice(Math.min(+target.dataset.remove,next.length),0,+id);rec.order=next;checkEffectOrder();commit();draw();}
      else if(kind==='tool'&&target.dataset.district!==undefined){rec.tool=id;target.click();}
      else return;
      if(kind==='part'&&rec.order.length<3)effect('connect');
    }});
    if(index===4){
      const board=host.querySelector('.experiment-board');if(board)board.classList.toggle('experiment-ran',!!rec.ran);
    }
    if([6,7].includes(index))host.querySelectorAll('.metric').forEach((el,i)=>{const strong=el.querySelector('strong'),value=['낮음','보통','높음'].indexOf(strong?.textContent)+1;if(!value)return;el.insertAdjacentHTML('beforeend',`<span class="metric-track" aria-hidden="true"><i style="--fill:${value/3*100}%;--meter-color:${i%3===1?'#608d67':'#b78842'}"></i></span>`);});
    if(index===6){const scene=host.querySelector('.daily-scene');if(scene&&rec.picked!==undefined){const selected=dailyCases[Math.min(rec.round,9)].options[rec.picked];scene.classList.add(selected[2]?'preview-unsafe':'preview-choice');scene.insertAdjacentHTML('afterbegin',`<div class="choice-preview">${icon(selected[2]?'shield':'leaf')}<span>${selected[2]?'건강과 안전이 먼저!':'선택 결과 미리 보기'}</span></div>`);}}
    if(index===7&&rec.round<4)enhanceComparison();
    if(index===8||(index===9&&rec.phase===2))enhanceCity();
    if(index===9){const phase=rec.phase,hazard=phase===0||phase===3?'heat':'rain',result=phase<2?rec.before?.[hazard]:rec.after?.[hazard],board=host.querySelector('.test-city');if(board){board.classList.add('weather-'+hazard);if(result){board.classList.add('weather-tested');board.querySelectorAll('.district-tile').forEach((el,i)=>{const risk=result.districts[i].risk;el.insertAdjacentHTML('beforeend',`<span class="risk-track" aria-label="남은 영향 ${risk}단계"><i style="--fill:${risk/4*100}%"></i></span>`);});}}}
    if(index===9){
      const summary=host.querySelector('.test-summary');if(summary)summary.innerHTML=`<p>첫 영향 · 더위 ${rec.before.heat.total} · 빗물 ${rec.before.rain.total}</p><p>목표: 둘 다 10 이하 · 합계가 늘지 않기</p>`;
      const board=host.querySelector('.test-city'),workspace=host.querySelector('.activity-workspace');
      const extras=[...workspace.querySelectorAll(':scope > .evidence-card,:scope > .comparison-grid,:scope > .notice:not(.example-notice),:scope > .redesign')];
      if(board&&extras.length){const wrap=document.createElement('div'),aside=document.createElement('div');wrap.className='stress-result-layout';aside.className='stress-results';board.before(wrap);wrap.append(board,aside);extras.forEach(el=>aside.append(el));}
    }
    enhanceObservationVisuals({host,index,rec,icon});
    enhanceImpact({host,index,rec,icon});
    enhanceCityVisuals({host,index,rec,icon});
    host.querySelectorAll('.activity-next .button:disabled').forEach(el=>el.setAttribute('aria-description',activityGuide(index,rec).basic));
    // One local feedback per action; no delayed state updates or duplicated rewards.
    host.addEventListener('click',e=>{const button=e.target.closest('button');if(!button||button.disabled||button.matches('.guide-avatar,.concept-revisit,[data-answer],[data-resource],[data-link],[data-compare],[data-district],[data-part],[data-remove]'))return;effect(button.matches('.run,.retest')?'experiment':'tap');},{signal,capture:true});
  }
  function playbackStep(){
    const key=`${index}:${rec.open??0}:${rec.round??0}:${rec.phase??0}`;
    if(disposed||rec.workComplete||finishing)return {key,kind:'stop'};
    if(host.querySelector('dialog[open]')||host.ownerDocument.querySelector('.concept-dialog[open]'))return {key:key+':help',kind:'wait'};
    if(index===0){
      if(rec.collected?.length===8)return {key,kind:'stop'};
      if(rec.collected?.includes(evidenceSites[rec.open]?.id))return {key:key+':next',kind:'advance',target:'.next-site',delay:1400};
      return {key:key+':compare',kind:'compare',progress:(rec.reveal||0)/100,duration:2400};
    }
    if(index===4){
      if(!rec.ran)return {key:key+':run',kind:'run',target:'.run',observe:!rec.prediction?.length,delay:900};
      return rec.round===5?{key,kind:'stop'}:{key:key+':result',kind:'advance',target:'.next',delay:2600};
    }
    if(index===9){
      if(rec.phase===2||rec.phase===4)return {key,kind:'stop'};
      const result=rec.phase===0?rec.before?.heat:rec.phase===1?rec.before?.rain:rec.after?.heat;
      return {key:key+(result?':result':':run'),kind:result?'advance':'run',target:'.run',delay:result?2600:900};
    }
    return {key,kind:'stop'};
  }
  function playbackChange(snapshot){
    const button=host.querySelector('[data-playback]');
    if(button){button.setAttribute('aria-pressed',String(snapshot.active));button.innerHTML=icon(snapshot.active?'pause':'play')+`<span>${snapshot.waiting?'예상 대기':snapshot.active?'일시정지':'자동재생'}</span>`;}
    host.querySelector('.activity-page')?.classList.toggle('is-playing',snapshot.playing);
  }
  function presentAction(){
    const next=host.querySelector('.learning-action'),feedback=host.querySelector('.activity-feedback');
    const text=instruction();
    next.textContent='지금 할 일 · '+text;
    next.hidden=feedback.textContent===text;
  }
  function presentActivity(){
    if(index===4){
      const card=host.querySelector('.experiment-layout > .evidence-card');
      card?.querySelector(':scope > .eyebrow')?.remove();
      card?.querySelectorAll(':scope > p:not(.notice)').forEach(e=>e.remove());
      const run=card?.querySelector('.run');if(run){const next=document.createElement('div');next.className='activity-next';next.append(run);host.querySelector('.activity-footer').append(next);}
      host.querySelectorAll('[data-predict]').forEach(button=>{
        const district=coastDistricts.find(d=>d.id===button.dataset.predict),copy=button.querySelector('.flood-copy');
        copy.querySelector(':scope > span').textContent='높이 '+district.height;
        const result=copy.querySelector('small');result.textContent=rec.ran?'예상 '+(rec.prediction?.includes(district.id)?'✓':'—')+' · 물 '+(district.height<=experimentLevels[rec.round]?'✓':'—'):button.classList.contains('selected')?'✓':'';
        result.title='예상 표시 / 실제 물이 닿았는지';
      });
    }

    if(index===0||index===2){host.querySelector('.scene-brief h2')?.remove();host.querySelector('.scene-brief .eyebrow')?.remove();}
    host.querySelector('.observation-status')?.remove();
    if(index===2){const question=host.querySelector('.ov-resource-question');if(question)question.remove();host.querySelector('.evidence-card > .notice')?.remove();}
    if(index===3&&rec.checked)host.querySelector('.chain-options')?.remove();
    if(index===6){
      host.querySelector('.choice-preview')?.remove();
      const explanation=host.querySelector('.daily-layout > div:last-child > .notice');
      if(explanation){host.querySelector('.activity-feedback').textContent=explanation.textContent;explanation.remove();}
      const direction=host.querySelector('.metric-directions');if(direction){host.querySelector('.activity-help .guide-deeper').append(' '+direction.textContent);direction.remove();}
    }
    if(index===7){const question=host.querySelector('.comparison-question');if(question){host.querySelector('h1').textContent=question.textContent;question.remove();}}
    if(index===8||(index===9&&rec.phase===2)){
      host.querySelectorAll('.district-tile:has(.empty-plot) > strong').forEach(e=>e.remove());
      host.querySelector('.city-design-layout > .evidence-card > .eyebrow')?.remove();
      host.querySelectorAll('.facility-button[data-tool="erase"] > span').forEach(e=>e.remove());
    }
    if(index===9){
      host.querySelectorAll('.test-city .district-tile > span:not(.eyebrow):not(.risk-track)').forEach(e=>{if(e.textContent==='아직 시험하지 않았어요')e.remove();});
      if(rec.phase===2){host.querySelector('.test-summary')?.remove();const target=host.querySelector('.city-risk-legend');if(target)target.textContent='목표: 더위·빗물 각각 10 이하';}
      host.querySelector('.activity-help .guide-deeper').append(' 두 위험의 남은 영향이 각각 10 이하이며, 두 영향의 합계가 첫 설계보다 커지지 않아야 해요.');
      if(rec.phase===4){host.querySelector('.stress-results > .evidence-card')?.remove();const note=host.querySelector('.stress-results > .notice');if(note)note.textContent=canCompleteStress(rec.before,rec.after)?'두 위험 모두 기준을 지켰어요.':'남은 위험을 줄여 다시 시험해요.';}
      const repeated=host.querySelector('.stress-results > .notice');if(repeated&&rec.feedback)repeated.remove();
    }
    if(index===5)host.querySelectorAll('[data-remove] > p').forEach(p=>{if(p.textContent==='카드를 골라 놓아요'){p.textContent='＋';p.className='empty-cause';p.setAttribute('aria-hidden','true');}});
    // Keep the unmet prerequisite visible on disabled actions.
    host.querySelectorAll('.activity-next .button:disabled').forEach(button=>button.setAttribute('aria-description',instruction()));
    if(index===4&&!rec.ran){const run=host.querySelector('.run');if(run)run.textContent='실험 시작';}
    const next=host.querySelector('.activity-next .button:not(:disabled)');
    if(next)next.classList.add('next-action');
    else {
      const selector=index===0?'.compare-slider':index===1?'[data-answer]':index===2?'[data-resource]:not(:disabled)':index===3?'[data-link]':index===4?(rec.prediction?.length?'.run':'[data-predict]'):index===5?'[data-part]:not(:disabled)':index===6?'[data-choice]':index===7?(rec.round>=4?'[data-practice]':'.comparison-card'):!rec.tool?'[data-tool]':'[data-district]';
      host.querySelectorAll(selector).forEach(e=>e.classList.add('action-ready'));
    }
    presentAction();
    playbackChange(playback?.snapshot||{active:false,playing:false});
  }
  function enhanceComparison(){
    const answers=[...host.querySelectorAll('[data-compare]')];
    host.querySelectorAll('.comparison-card').forEach((card,i)=>{card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-label',i?'B의 선택':'A의 선택');card.setAttribute('aria-pressed',String(rec.picked===i));card.setAttribute('aria-disabled',String(!!rec.checked));card.classList.toggle('selected',rec.picked===i);const choose=()=>{if(rec.checked)return;answers[i]?.click();(rec.checked?host.querySelector('.check'):host.querySelectorAll('.comparison-card')[i])?.focus({preventScroll:true});};card.addEventListener('click',choose,{signal:controller.signal});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}},{signal:controller.signal});});
    host.querySelector('.compare-answers')?.remove();
  }
  function enhanceCity(){
    const plan=normalizePlan(rec.plan);
    host.querySelectorAll('[data-district]').forEach((el,i)=>{const f=facilities.find(n=>n.id===plan[i]),d=cityDistricts[i];el.insertAdjacentHTML('afterbegin',f?artImage(f.id,'district-art',true):'<span class="district-art empty-plot" aria-hidden="true">＋</span>');const risks=el.querySelector('.district-risks');if(risks)risks.innerHTML=`<span aria-label="더위의 남은 영향 ${Math.max(0,d.heat-(f?.heat||0))}단계">더위 <i class="risk-track"><i style="--fill:${Math.max(0,d.heat-(f?.heat||0))/4*100}%"></i></i></span><span aria-label="빗물의 남은 영향 ${Math.max(0,d.rain-(f?.rain||0))}단계">빗물 <i class="risk-track rain-risk"><i style="--fill:${Math.max(0,d.rain-(f?.rain||0))/4*100}%"></i></i></span>`;});
  }
  function replay(summary){frame('탐구 기록을 잘 모았어요!','내 기록을 다시 확인하거나 새로운 탐구를 시작해 보세요.',`<div class="evidence-card"><h2>${escapeText(activityTitles[index])}</h2><p>${escapeText(summary)}</p>${b('새로 탐구하기','secondary replay')}</div>`,'기록 완성',b('연구 기록 제출하기','primary finish'));on('.finish','click',()=>finish(summary));on('.replay','click',reset);}

  function scanEvidence(){
    rec.collected=arr(rec.collected).filter(id=>evidenceSites.some(s=>s.id===id));
    rec.open=bounded(rec.open,7);rec.compared=arr(rec.compared).filter(id=>evidenceSites.some(s=>s.id===id));const site=evidenceSites[rec.open];
    const collected=[...new Set([...rec.collected,...rec.compared])];if(collected.length!==rec.collected.length){rec.collected=collected;commit();}
    const done=rec.collected.length===8,nextSite=evidenceSites.findIndex(s=>!rec.collected.includes(s.id));
    const values=rec.reveal>=90?site.now:site.past;
    frame('두 시기의 기록을 살펴보세요','시간 손잡이를 끝까지 밀면 두 기록이 자동으로 수첩에 담겨요.',`<div class="scan-layout"><div class="scan-scene" style="background-image:url('${conceptArt['scene-observe'].src}')" aria-label="관측소 그림과 여덟 관측 기록 선택">${evidenceSites.map((s,i)=>`<button class="scan-hotspot ${rec.open===i?'selected':''} ${rec.collected.includes(s.id)?'correct':''}" style="left:${s.x}%;top:${s.y}%" data-site="${i}" aria-label="${escapeText(s.name)} ${rec.collected.includes(s.id)?'기록 완료':'살펴보기'}">${icon('search')}<span>${escapeText(s.name)}${rec.collected.includes(s.id)?' ✓':''}</span></button>`).join('')}</div><article class="evidence-card"><div class="scene-brief observation-heading">${artImage(site.id==='snow'?'scene-snow-day':'scene-observe','observation-art',true)}<div><span class="eyebrow">관측 수첩</span><h2>${escapeText(site.name)}</h2><p>${escapeText(site.clue)}</p></div></div><div class="evidence-data"><strong class="period-label">${rec.reveal>=90?'나중 기록':'이전 기록'}</strong><div class="mini-chart" aria-label="${escapeText(site.unit)}">${values.map((v,i)=>`<div style="height:${28+v*9}px"><span>${i+1}묶음</span></div>`).join('')}</div><p>${escapeText(site.unit)}</p></div><label class="water-control">이전 기록 ← 비교 → 나중 기록<input class="compare-slider" type="range" min="0" max="100" value="${bounded(rec.reveal,100)}" aria-label="관측 시기 비교" /></label><p class="observation-status ${rec.collected.includes(site.id)?'recorded':''}">${rec.collected.includes(site.id)?'✓ 수첩에 자동 기록했어요':'두 시기를 끝까지 비교해 보세요'}</p></article></div>`,`관측 수첩 ${rec.collected.length} / 8`,done?b('관측 마무리','primary submit'):b('다음 관측 지점 →','primary next-site',!rec.collected.includes(site.id)));
    on('[data-site]','click',e=>{rec.open=+e.currentTarget.dataset.site;rec.reveal=0;rec.feedback='';commit();draw();});
    on('.compare-slider','input',e=>{rec.reveal=+e.target.value;if(rec.reveal>=90&&!rec.compared.includes(site.id))rec.compared.push(site.id);commit();});
    on('.compare-slider','change',()=>{if(!rec.compared.includes(site.id)||rec.collected.includes(site.id))return;rec.collected.push(site.id);rec.feedback=`${site.name}의 두 기록을 수첩에 담았어요! ${rec.collected.length===8?'모든 관측을 마쳤어요.':'다음 지점의 변화도 찾아봐요.'}`;commit();effect('collect');draw();if(!playback.snapshot.active)host.querySelector('.activity-next .button:not(:disabled)')?.focus({preventScroll:true});announce(rec.feedback);});
    on('.next-site','click',()=>{if(nextSite<0||!rec.collected.includes(site.id))return;rec.open=nextSite;rec.reveal=0;rec.feedback='';commit();draw();if(!playback.snapshot.active)host.querySelector('.compare-slider')?.focus({preventScroll:true});});
    on('.submit','click',()=>{if(rec.collected.length===8)finish('여덟 관측 지점의 이전·나중 기록을 비교했어요. 다음에는 긴 변화의 근거를 찾아요.');});
  }
  function judgeEvidence(){
    rec.round=bounded(rec.round,8);rec.answers=arr(rec.answers);if(rec.round>=8){replay('오랜 기록과 하루 날씨를 구별하며 여덟 가지 판단의 근거를 확인했어요.');return;}
    const site=evidenceSites[rec.round];rec.selected=rec.selected===0||rec.selected===1?rec.selected:null;
    frame('이 판단을 자료로 뒷받침할 수 있나요?','모은 관측 기록을 읽고, 판단과 근거를 차례로 확인해요.',`<div class="comparison-grid"><article class="evidence-card"><div class="judgment-heading">${artImage(site.id==='snow'?'scene-snow-day':'scene-observe','observation-art',true)}<span class="eyebrow">${example?'예시 관측 자료':'내 관측 수첩'} · ${escapeText(site.name)}</span></div><h2>${escapeText(site.judgment)}</h2><p>${escapeText(site.clue)}</p><div class="comparison-data"><div><b>이전 기록</b><p>${site.past.join(' · ')}</p></div><div><b>나중 기록</b><p>${site.now.join(' · ')}</p></div></div><p class="science-note">숫자는 가상 상대 단계예요.</p></article><div class="choice-grid">${['긴 변화의 근거가 있어요','이 자료만으로 판단하기 어려워요'].map((t,i)=>b(`<span class="choice-indicator" aria-hidden="true">${rec.selected===i?'●':'○'}</span>${t}`,`choice-card ${rec.selected===i?'selected':''}`,rec.checked).replace('<button ',`<button data-answer="${i}" `)).join('')}</div></div>`,`판단 ${rec.round+1} / 8`,b(rec.checked?'근거 읽고 다음 →':'판단을 골라요','primary check',!rec.checked));
    on('[data-answer]','click',e=>{if(rec.checked)return;rec.selected=+e.currentTarget.dataset.answer;rec.checked=(rec.selected===0)===site.climate;rec.feedback=rec.checked?site.why:'기록의 기간을 다시 살펴보세요. '+site.clue;commit();effect(rec.checked?'success':'retry');draw();});
    on('.check','click',()=>{if(!rec.checked)return;rec.answers.push({site:site.id,climate:site.climate,reason:site.why});rec.round++;rec.selected=null;rec.checked=false;rec.feedback='';recordRound(8,'오랜 기록과 하루 날씨를 구별하며 여덟 가지 판단의 근거를 확인했어요.');});
  }
  function scanHuman(){
    rec.collected=arr(rec.collected).filter(n=>Number.isInteger(n)&&n>=0&&n<10);rec.open=bounded(rec.open,9);const site=humanSites[rec.open];
    frame('겉모습 뒤의 자원 사용을 찾아요','조사 지점을 누르고, 그 활동과 관련된 에너지·자원을 골라요.',`<div class="scan-layout"><div class="scan-scene" style="background-image:url('${asset('city')}')">${humanSites.map((s,i)=>`<button class="scan-hotspot ${rec.open===i?'selected':''} ${rec.collected.includes(i)?'correct':''}" style="left:${s.x}%;top:${s.y}%" data-site="${i}">${icon('search')}<span>${escapeText(s.name)}${rec.collected.includes(i)?' ✓':''}</span></button>`).join('')}</div><article class="evidence-card"><div class="scene-brief">${artImage(humanArt[rec.open],'resource-art')}<div><span class="eyebrow">활동 스캐너</span><h2>${escapeText(site.name)}</h2><p>${escapeText(site.scene)}</p></div></div><p>무엇의 사용·변화와 관련이 있나요?</p><div class="choice-grid resource-grid">${resourceNames.map((n,i)=>`<button class="button choice-card ${rec.collected.includes(rec.open)&&i===site.answer?'correct':''}" data-resource="${i}" ${rec.collected.includes(rec.open)?'disabled':''}>${escapeText(n)}</button>`).join('')}</div>${rec.collected.includes(rec.open)?`<p class="notice">${escapeText(site.mechanism)}</p>`:''}</article></div>`,`조사 기록 ${rec.collected.length} / 10`,rec.collected.length===10?b('조사 마무리','primary submit'):b('다음 조사 지점 →','primary next-site',!rec.collected.includes(rec.open)),'활동의 겉모습만 보고 좋고 나쁨을 단정하지 않아요. 사용한 에너지와 자원을 살펴봐요.');
    on('[data-site]','click',e=>{rec.open=+e.currentTarget.dataset.site;rec.feedback='';commit();draw();});
    on('[data-resource]','click',e=>{if(rec.collected.includes(rec.open))return;if(+e.currentTarget.dataset.resource===site.answer){rec.collected.push(rec.open);rec.feedback=site.mechanism;commit();effect('collect');draw();announce(rec.feedback);}else say('어떤 에너지나 자원을 쓰는지 장면을 다시 살펴보세요. '+site.scene);});
    on('.next-site','click',()=>{if(!rec.collected.includes(rec.open))return;const next=humanSites.findIndex((_,i)=>!rec.collected.includes(i));if(next<0)return;rec.open=next;rec.feedback='';commit();draw();host.querySelector('[data-resource]')?.focus({preventScroll:true});});
    on('.submit','click',()=>{if(rec.collected.length===10)finish('열 가지 도시 활동에서 에너지·자원 사용과 숲의 변화를 찾아 기록했어요.');});
  }
  function linkRelations(){
    rec.round=bounded(rec.round,8);rec.links=arr(rec.links);if(rec.round>=8){replay('도시 활동에서 에너지·자원 사용을 거쳐 기후변화 대응으로 이어지는 여덟 관계를 연결했어요.');return;}
    const item=relationCases[rec.round],site=humanSites[item.site];const options=[item.middle,relationCases[(rec.round+3)%8].middle,'사진 속 모습만으로 모든 영향을 확정해요.'];const order=activityChoiceOrder(rec.round);
    frame('가운데 연결 고리를 찾아요','내가 조사한 활동과 마지막 설명을 이어 주는 이유를 눌러요.',`<div class="link-chain"><article class="chain-slot filled chain-source"><span class="eyebrow">${example?'예시 조사':'내 조사 기록'}</span><div class="scene-brief">${artImage(humanArt[item.site],'relation-art')}<div><h2>${escapeText(site.name)}</h2><p>${escapeText(site.scene)}</p></div></div></article><span class="chain-arrow" aria-hidden="true">→</span><article class="chain-slot ${rec.checked?'filled':''}"><span class="eyebrow">가운데 이유</span><p>${rec.checked?escapeText(item.middle):'아래에서 연결 고리를 골라요'}</p></article><span class="chain-arrow" aria-hidden="true">→</span><article class="chain-slot filled"><span class="eyebrow">관련성</span><p>${escapeText(item.end)}</p></article></div><div class="choice-grid chain-options">${order.map(i=>`<button class="button choice-card ${rec.selected===i?'selected':''}" data-link="${i}" ${rec.checked?'disabled':''}>${escapeText(options[i])}</button>`).join('')}</div>`,`관계 연결 ${rec.round+1} / 8`,b(rec.checked?'연결 읽고 다음 →':'이유를 연결해요','primary check',!rec.checked),'연료를 태우거나 숲이 줄면 이산화 탄소 같은 온실 기체가 늘어, 오랜 기간에 걸쳐 지구의 평균 기온이 높아지는 것과 관련돼요. 한 번의 행동이 바로 날씨를 바꾸지는 않아요.');
    on('[data-link]','click',e=>{if(rec.checked)return;rec.selected=+e.currentTarget.dataset.link;rec.checked=rec.selected===0;rec.feedback=rec.checked?'활동에서 쓰는 자원과 기후변화 대응을 연결했어요.':'처음 활동과 마지막 설명을 함께 이어 주는 이유인지 다시 살펴보세요.';commit();effect(rec.checked?'success':'retry');draw();});
    on('.check','click',()=>{if(!rec.checked)return;rec.links.push({site:item.site,middle:item.middle,end:item.end});rec.round++;delete rec.selected;rec.checked=false;rec.feedback='';recordRound(8,'도시 활동에서 에너지·자원 사용을 거쳐 기후변화 대응으로 이어지는 여덟 관계를 연결했어요.');});
  }

  function runWater(observe=false){
    if(rec.ran||rec.round>=experimentLevels.length||(!observe&&!rec.prediction?.length))return;
    rec.ran=true;rec.level=experimentLevels[rec.round];rec.feedback=rec.prediction?.length?'예상과 실제로 물이 닿은 곳을 비교해요.':'땅 높이와 물의 높이를 비교하며 관찰해요.';
    commit();draw();
  }
  function waterExperiment(){
    rec.round=bounded(rec.round,6);rec.trials=arr(rec.trials);if(rec.round>=6){replay('여섯 수위 조건에서 낮은 곳부터 물이 닿는지 관찰하고, 내가 표시한 예상이 있다면 결과와 비교했어요.');return;}
    const level=experimentLevels[rec.round],pred=arr(rec.prediction),affected=waterAffected(level),ran=!!rec.ran;
    rec.level=ran?level:0;
    const last=rec.trials.at(-1),change=last?level-last.level:null;
    const condition=change===null?'첫 번째 실험 조건이에요':change>0?'지난 실험보다 수위를 '+change+'단계 높여요':change<0?'지난 실험보다 수위를 '+(-change)+'단계 낮춰요':'지난 실험과 같은 수위예요';
    const missed=affected.filter(id=>!pred.includes(id)),extra=pred.filter(id=>!affected.includes(id));
    frame(ran?(pred.length?'내 예상과 무엇이 달랐나요?':'수위에 따라 어디까지 물이 닿나요?'):'물이 닿을 곳을 먼저 예상해요',ran?'표시한 예상과 실제로 물이 닿은 구역을 나란히 살펴봐요.':condition+' · 구역을 여러 개 골라 예상해요.',
      '<div class="experiment-layout"><div class="experiment-board" style="background-image:url(\''+conceptArt['scene-coast-landscape'].src+'\')"><div class="flood-grid">'+coastDistricts.map(d=>'<button class="button flood-district '+(pred.includes(d.id)?'selected ':'')+(ran&&affected.includes(d.id)?'flooded':'')+'" data-predict="'+d.id+'" '+(ran?'disabled':'')+'>'+artImage(d.id,'coast-art',true)+'<span class="flood-copy"><strong>'+escapeText(d.name)+'</strong><span>땅 높이 '+d.height+'단계</span><small>'+(ran?(pred.includes(d.id)?'예상 ✓':'예상 —')+' · '+(affected.includes(d.id)?'물 닿음':'물 안 닿음'):(pred.includes(d.id)?'예상 표시됨':'눌러서 예상'))+'</small></span></button>').join('')+'</div></div><article class="evidence-card"><span class="eyebrow">실험 조건 '+(rec.round+1)+'</span><h2>실험 수위 '+level+'단계</h2><p>'+condition+'</p><div class="water-target" aria-label="설정 수위 '+level+'단계">'+[1,2,3,4].map(n=>'<span class="'+(n<=level?'on':'')+'">'+n+'</span>').join('')+'</div>'+(ran?(pred.length?'<p class="notice">예상한 곳 '+pred.length+'곳 · 물이 닿은 곳 '+affected.length+'곳<br>'+(missed.length||extra.length?'새로 발견한 곳 '+missed.length+'곳 · 예상과 달리 닿지 않은 곳 '+extra.length+'곳':'예상과 결과가 일치했어요!')+'</p>':'<p class="notice">물이 닿은 곳 '+affected.length+'곳 · 땅 높이와 수위를 비교해요.</p>'):b('수위 '+level+'단계로 실험','primary run',!pred.length))+'</article></div>',
      '예상 · 실험 '+(rec.round+1)+' / 6',ran?b(rec.round===5?'실험 마무리':'관찰 기록 · 다음 →','primary next'):'','높이와 물의 단계는 가상 모형의 상대값이에요. 실제 바닷물 높이나 어느 해의 미래를 예측한 값이 아니에요.');
    on('[data-predict]','click',e=>{if(rec.ran)return;const id=e.currentTarget.dataset.predict;rec.prediction=pred.includes(id)?pred.filter(n=>n!==id):[...pred,id];commit();draw();});
    on('.run','click',()=>runWater());
    on('.next','click',()=>{if(!rec.ran)return;rec.trials.push({level,prediction:[...pred],affected:[...affected]});rec.round++;rec.level=0;rec.prediction=[];rec.ran=false;delete rec.reflection;rec.feedback='';recordRound(6,'여섯 수위 조건에서 낮은 곳부터 물이 닿는지 관찰하고, 내가 표시한 예상이 있다면 결과와 비교했어요.');});
  }
  function orderEffects(){
    rec.round=bounded(rec.round,8);rec.chains=arr(rec.chains);rec.order=arr(rec.order).filter(n=>[0,1,2].includes(n));if(rec.round>=8){replay('생활 영향 네 가지와 환경 영향 네 가지를 원인부터 결과까지 연결했어요.');return;}
    if(!rec.checked&&rec.order.length===3&&rec.order.every((n,i)=>n===i)){rec.checked=true;rec.feedback='환경의 변화가 생활·환경에 주는 영향과 필요한 대응까지 연결했어요.';commit();}
    const item=effectChains[rec.round],order=rec.order;const trial=arr(sourceActivityRecord(state.records[4]).trials).find(t=>arr(t.affected).some(id=>coastDistricts.find(d=>d.id===id)?.name===item.source));
    frame('어떤 일이 차례로 이어질까요?','먼저 일어난 일부터 카드를 눌러 세 칸을 채워요. 누른 카드를 다시 누르면 빼요.',`<article class="evidence-card compact effect-context">${artImage(effectArt[rec.round],'effect-art')}<div><span class="eyebrow">${escapeText(item.kind)} 영향 · ${escapeText(item.source)}</span><p>${trial?`내 실험에서 수위 ${bounded(trial.level,4)}단계일 때 영향을 확인했어요.`:rec.round<4?'해안 모형에서 물의 범위 변화를 살펴봐요.':'다른 기후 상황에도 영향을 생각해 봐요.'}</p></div></article><div class="link-chain">${[0,1,2].map((n)=>`<button class="button chain-slot ${order[n]!==undefined?'filled':''}" data-remove="${n}"><span class="eyebrow">${n+1}번째</span><p>${order[n]!==undefined?escapeText(item.parts[order[n]]):'카드를 골라 놓아요'}</p></button>`).join('<span class="chain-arrow" aria-hidden="true">→</span>')}</div><div class="choice-grid chain-options">${activityChoiceOrder(rec.round+2).map(n=>`<button class="button choice-card" data-part="${n}" ${order.includes(n)?'disabled':''}>${escapeText(item.parts[n])}</button>`).join('')}</div>`,`영향 연결 ${rec.round+1} / 8`,b(rec.checked?'영향 읽고 다음 →':'세 장을 연결해요','primary check',!rec.checked),'기후변화의 영향은 장소와 조건에 따라 달라요. 게임 속 사례가 모든 지역에서 같은 모습으로 나타나는 것은 아니에요.');
    on('[data-part]','click',e=>{if(rec.checked)return;rec.order.push(+e.currentTarget.dataset.part);if(rec.order.length<3)effect('connect');checkEffectOrder();commit();draw();});
    on('[data-remove]','click',e=>{if(rec.checked)return;const n=+e.currentTarget.dataset.remove;if(n<rec.order.length){rec.order.splice(n,1);effect('tap');}rec.feedback='카드를 다시 놓거나 끌어서 순서를 바꿔 보세요.';commit();draw();});
    on('.check','click',()=>{if(!rec.checked)return;rec.chains.push({source:item.source,kind:item.kind,parts:[...item.parts]});rec.round++;rec.order=[];rec.checked=false;rec.feedback='';recordRound(8,'생활 영향 네 가지와 환경 영향 네 가지를 원인부터 결과까지 연결했어요.');});
  }
  function checkEffectOrder(){
    rec.checked=rec.order.length===3&&rec.order.every((n,i)=>n===i);
    rec.feedback=rec.checked?'환경의 변화가 생활·환경에 주는 영향과 필요한 대응까지 연결했어요.':rec.order.length===3?'환경의 변화 → 생활·환경의 영향 → 필요한 대응 순서로 생각해 보세요. 카드를 끌어 순서를 바꿀 수 있어요.':'카드를 놓으면 연결이 완성돼요. 원인에서 결과 순서로 이어 보세요.';
    if(rec.order.length===3)effect(rec.checked?'success':'retry');
  }
  function dailyChoice(){
    rec.round=bounded(rec.round,10);rec.choices=arr(rec.choices);if(rec.round>=10){replay('건강과 안전을 지키며 열 가지 생활 장면에서 선택하고 결과를 비교했어요.');return;}
    const item=dailyCases[rec.round];const picked=rec.picked===undefined?null:bounded(rec.picked,2);const option=picked!==null?item.options[picked]:null;
    frame('생활을 지키며 무엇을 바꿀까요?',`${item.time} · ${item.situation}`,`<div class="daily-layout"><div class="daily-scene illustrated-scene">${artImage(dailyArt[rec.round],'daily-art')}<article class="evidence-card compact"><span class="eyebrow">오늘의 장면</span><h2>${escapeText(item.time)}</h2><p>${escapeText(item.situation)}</p></article></div><div><div class="choice-grid">${activityChoiceOrder(rec.round).map(i=>{const o=item.options[i];return `<button class="button choice-card ${picked===i?'selected':''}" data-choice="${i}"><span class="choice-indicator" aria-hidden="true">${picked===i?'●':'○'}</span>${escapeText(o[0])}</button>`;}).join('')}</div>${option&&!option[2]?`<div class="metric-row">${['기후 부담','건강·생활','사용 자원'].map((name,i)=>`<div class="metric"><span>${name}</span><strong>${['','낮음','보통','높음'][option[1][i]]}</strong></div>`).join('')}</div><p class="notice">${option[1][0]===3?'이 선택은 기후 부담과 사용 자원이 높아요. ':''}${escapeText(item.reason)}</p>`:''}</div></div>`,`하루 선택 ${rec.round+1} / 10`,b('선택 기록 · 다음','primary next',!option||!!option[2]),'지표는 게임 안의 상대 비교예요. 건강·안전을 포기하는 행동은 실천으로 인정하지 않아요. 한 번의 선택이 즉시 날씨를 바꾸지는 않아요.');
    on('[data-choice]','click',e=>{rec.picked=+e.currentTarget.dataset.choice;rec.feedback=item.options[rec.picked][2]?'건강과 안전이 먼저예요. 몸과 다른 사람을 보호하는 선택을 다시 찾아보세요.':'';if(item.options[rec.picked][2])effect('retry');commit();draw();});
    on('.next','click',()=>{if(!option||option[2])return;rec.choices[rec.round]=picked;rec.round++;delete rec.picked;rec.feedback='';recordRound(10,'건강과 안전을 지키며 열 가지 생활 장면에서 선택하고 결과를 비교했어요.');});
  }
  function compareChoices(){
    rec.round=bounded(rec.round,4);rec.comparisons=arr(rec.comparisons);
    if(rec.round>=4){
      const practices=['안전하게 다시 쓸 물병 챙기기','쓰지 않는 조명 확인하기','먹을 만큼 받고 골고루 먹기','고쳐 쓸 수 있는 물건 살펴보기'];
      frame('내 생활에서 해 볼 일을 정해요','가족이나 선생님과 함께 실천할 수 있는 행동 하나를 골라요.',`<div class="choice-grid">${practices.map((p,i)=>`<button class="button choice-card practice-choice ${rec.practice===i?'selected':''}" data-practice="${i}">${artImage(['scene-bottle','scene-classroom','scene-meal','scene-repair'][i],'practice-art',true)}<span>${escapeText(p)}</span></button>`).join('')}</div>${rec.practice!==undefined?`<article class="evidence-card"><h2>나의 실천 약속</h2><p>${escapeText(practices[bounded(rec.practice,3)])}</p><p>먼저 주변 어른과 안전한 방법을 이야기하고, 해 본 뒤 달라진 점을 나눠요.</p></article>`:''}`,'네 가지 조건 비교 완성',b('실천 약속을 수첩에 담기','primary submit',rec.practice===undefined),'게임의 선택 기록은 실제 생활 실천을 대신하지 않아요. 직접 실천하고 이야기 나누는 활동으로 이어가요.');
      on('[data-practice]','click',e=>{rec.practice=+e.currentTarget.dataset.practice;rec.practiceText=practices[rec.practice];commit();draw();});on('.submit','click',()=>{if(rec.practice!==undefined)finish('같은 조건에서 한 가지 선택만 바꿔 네 번 비교하고, 생활 실천 약속을 정했어요.');});return;
    }
    const caseIndex=compareCaseIndices[rec.round],item=dailyCases[caseIndex];const recorded=arr(sourceActivityRecord(state.records[6]).choices)[caseIndex];const base=recorded===0||recorded===1?recorded:1,other=1-base;const baseline=item.options[base],alternative=item.options[other];
    frame('딱 한 가지를 바꾸면 어떻게 될까요?','다른 조건은 같게 두고, 선택 하나만 바꿔 나란히 비교해요.',`<article class="evidence-card compact comparison-context">${artImage(dailyArt[caseIndex],'comparison-art')}<div><span class="eyebrow">비교할 장면 · ${escapeText(item.time)}</span><p>${escapeText(item.situation)}</p></div></article><div class="comparison-grid">${[[baseline,'A · 내가 했던 선택'],[alternative,'B · 한 가지만 바꾼 선택']].map(([o,label])=>`<article class="comparison-card"><h2>${label}</h2><p>${escapeText(o[0])}</p><div class="metric-row">${['기후 부담','건강·생활','사용 자원'].map((n,i)=>`<div class="metric"><span>${n}</span><strong>${['','낮음','보통','높음'][o[1][i]]}</strong></div>`).join('')}</div></article>`).join('')}</div><p class="comparison-question">건강·생활을 지키며 낭비를 더 줄인 쪽은?</p><div class="choice-grid compare-answers">${['A의 선택','B의 선택'].map((t,i)=>`<button class="button choice-card ${rec.picked===i?'selected':''}" data-compare="${i}">${t}</button>`).join('')}</div>`,`조건 비교 ${rec.round+1} / 4`,b(rec.checked?'비교 기록 · 다음 →':'더 나은 쪽을 골라요','primary check',!rec.checked),'비교할 때는 한 가지 조건만 바꿔야 해요. 이 비교는 온실가스의 실제 배출량이나 즉각적인 날씨 변화가 아니에요.');
    on('[data-compare]','click',e=>{if(rec.checked)return;rec.picked=+e.currentTarget.dataset.compare;rec.checked=rec.picked===(base===0?0:1);rec.feedback=rec.checked?'건강·생활을 지키면서 기후 부담과 사용 자원을 줄인 선택을 찾았어요.':'건강·생활을 지키며 기후 부담과 사용 자원을 줄인 쪽을 찾아요.';commit();effect(rec.checked?'success':'retry');draw();});
    on('.check','click',()=>{if(!rec.checked)return;rec.comparisons.push({caseIndex,baseline:base,alternative:other,better:0});rec.round++;delete rec.picked;rec.checked=false;rec.feedback='';commit();draw();});
  }
  function designBody(plan,selected,editing=false){
    return `<div class="city-design-layout"><div class="city-board" style="background-image:url('${asset('design')}')">${cityDistricts.map((d,i)=>{const f=facilities.find(n=>n.id===plan[i]);return `<button class="button district-tile ${f?'filled':''} ${selected===i?'selected':''}" data-district="${i}"><span class="eyebrow">${escapeText(d.name)}</span><strong>${f?escapeText(f.name):'시설을 놓아 보세요'}</strong><span class="district-risks">더위 ${d.heat} · 빗물 ${d.rain}</span><small>${escapeText(d.clue)}</small></button>`;}).join('')}</div><article class="evidence-card"><span class="eyebrow">${editing?'다시 설계하기':'시설 연구 도구'}</span><h2>남은 자원 ${CITY_BUDGET-planCost(plan)} / ${CITY_BUDGET}</h2><p>시설을 고르면 여러 구역에 연속으로 놓을 수 있어요. 비울 때는 지우개를 골라요.</p><div class="facility-palette">${facilities.map(f=>`<button class="button facility-button illustrated-tool ${rec.tool===f.id?'selected':''}" data-tool="${f.id}" aria-pressed="${rec.tool===f.id}">${artImage(f.id,'tool-art',true)}<strong>${escapeText(f.name)}</strong><span>자원 ${f.cost} · 더위 ${f.heat} · 빗물 ${f.rain}</span></button>`).join('')}<button class="button facility-button ${rec.tool==='erase'?'selected':''}" data-tool="erase" aria-pressed="${rec.tool==='erase'}"><strong>지우개</strong><span>구역을 눌러 연속 비우기</span></button></div><p class="science-note">도움 단계는 게임 안의 상대값이에요.</p></article></div>`;
  }
  function bindDesign(plan,savePlan){
    on('[data-tool]','click',e=>{rec.tool=e.currentTarget.dataset.tool;rec.feedback=rec.tool==='erase'?'비울 구역을 누르세요. 여러 구역을 연속으로 비울 수 있어요.':facilities.find(f=>f.id===rec.tool).reason;commit();draw();});
    on('[data-district]','click',e=>{const district=+e.currentTarget.dataset.district;rec.selected=district;if(rec.tool){const value=rec.tool==='erase'?null:rec.tool;if(plan[district]===value){rec.feedback=value?'이미 같은 시설이 있어요. 다른 구역에 이어 놓아 보세요.':'이미 비어 있는 구역이에요.';}else{const next=[...plan];next[district]=value;if(planCost(next)>CITY_BUDGET){rec.feedback='자원이 부족해요. 비용이 낮은 시설로 바꾸거나 다른 시설을 빼 보세요.';effect('retry');}else{plan=next;savePlan(next);rec.feedback=cityDistricts[district].name+(value?'에 '+facilities.find(f=>f.id===value).name+'을 놓았어요.':'의 시설을 비웠어요.');effect('place');}}}else rec.feedback='먼저 시설 버튼을 골라요. 이 구역은 '+cityDistricts[district].clue;commit();draw();});
  }
  function designCity(){
    rec.plan=normalizePlan(rec.plan);const plan=rec.plan,count=plan.filter(Boolean).length;
    frame('우리 도시의 위험에 맞춰 설계해요','더위와 빗물 위험을 살펴보고 여섯 구역에 시설을 놓아요.',designBody(plan,rec.selected),`설계 구역 ${count} / 6`,b('설계 저장 · 시험으로','primary submit',count<6||planCost(plan)>CITY_BUDGET),'모든 시설이 모든 위험을 해결하지는 않아요. 도움 단계는 이 게임에서만 쓰는 가상 비교값이에요.');
    bindDesign(plan,next=>{rec.plan=next;rec.version=(rec.version||0)+1;});
    on('.submit','click',()=>{if(rec.plan.filter(Boolean).length<6||planCost(rec.plan)>CITY_BUDGET)return;rec.initialPlan=[...rec.plan];rec.reason='구역별 위험에 맞춰 시설을 배치했어요.';finish(`여섯 구역에 자원 ${planCost(rec.plan)}을 사용해 대응 시설을 설계했어요. 더위·빗물 시험으로 확인할 준비가 됐어요.`);});
  }
  function stressTest(){
    const source=normalizePlan(sourceActivityRecord(state.records[8]).plan);const sample=['shade','pond','shade','pond','trees','trees'];
    const effectiveSource=source.every(Boolean)?source:sample;
    // If the student submits a different city, test that city rather than
    // silently replaying the former city's test results.
    if(rec.sourcePlan&&JSON.stringify(rec.sourcePlan)!==JSON.stringify(effectiveSource)){
      rec=freshActivityRecord(rec,example);commit();
    }
    rec.sourcePlan=[...effectiveSource];
    rec.phase=bounded(rec.phase,4);rec.before??={};rec.after??={};
    if(!rec.baseline)rec.baseline=[...effectiveSource];
    rec.baseline=normalizePlan(rec.baseline);rec.plan=normalizePlan(rec.plan||rec.baseline);
    // Recompute model outputs from saved plans; never trust stale result numbers.
    for(const hazard of ['heat','rain']){
      if(rec.before[hazard])rec.before[hazard]=evaluateCity(rec.baseline,hazard);
      if(rec.after[hazard])rec.after[hazard]=evaluateCity(rec.plan,hazard);
    }
    if(rec.phase>=2&&(!rec.before.heat||!rec.before.rain))rec.phase=0;
    const phase=rec.phase;
    if(phase<2){
      const hazard=phase===0?'heat':'rain',label=hazard==='heat'?'폭염':'많은 비';const result=rec.before[hazard];
      frame('내가 만든 도시를 시험해요',`${label} 조건에서 어느 구역이 더 취약한지 확인해요.`,stressBoard(rec.baseline,result,hazard,'첫 설계'),`첫 설계 시험 ${phase+1} / 2`,b(result?(phase===0?'많은 비 시험 →':'결과 보고 설계 검토'):label+' 시험 시작','primary run'),'교육용 스트레스 모형이에요. 실제 재난의 발생 확률이나 피해 규모를 예측하지 않아요.');
      on('.run','click',()=>{if(!rec.before[hazard]){rec.before[hazard]=evaluateCity(rec.baseline,hazard);rec.feedback='위험이 남은 구역을 살펴봐요. 시설은 위험을 줄여도 모두 없애지는 못할 수 있어요.';}else {rec.phase++;if(rec.phase===1)rec.before.rain=evaluateCity(rec.baseline,'rain');rec.feedback='';}commit();draw();});return;
    }
    if(phase===2){
      const available=rec.plan.every(Boolean)&&planCost(rec.plan)<=CITY_BUDGET;
      frame('첫 결과를 보고 설계를 살펴봐요','위험이 남은 곳을 바꾸거나, 충분하다면 같은 설계를 다시 검증해요.',`<div class="test-summary"><p>첫 설계의 남은 영향 · 더위 ${rec.before.heat?.total??'—'} · 빗물 ${rec.before.rain?.total??'—'}</p><p>기준: 두 위험 모두 10단계 이하, 첫 설계보다 합계가 커지지 않기</p></div>${designBody(rec.plan,rec.selected,true)}`,'설계 검토 · 조건은 처음과 같게',b('폭염 재시험 시작','primary retest',!available),'좋은 설계라면 억지로 바꾸지 않아도 돼요. 같은 조건으로 다시 시험해 두 위험에 모두 대비했는지 검증해요.');
      bindDesign(rec.plan,next=>{rec.plan=next;rec.after={};});
      on('.retest','click',()=>{if(!rec.plan.every(Boolean)||planCost(rec.plan)>CITY_BUDGET)return;rec.phase=3;rec.after={heat:evaluateCity(rec.plan,'heat')};rec.feedback='첫 설계와 같은 폭염 조건으로 다시 시험했어요.';commit();draw();});return;
    }
    const hazard=phase===3?'heat':'rain',label=hazard==='heat'?'폭염':'많은 비',result=rec.after[hazard];
    const valid=phase===4&&canCompleteStress(rec.before,rec.after);
    frame('처음과 같은 조건에서 다시 확인해요',`${label} 조건은 그대로예요. 바꾼 것은 도시의 설계뿐이에요.`,`${stressBoard(rec.plan,result,hazard,'검토한 설계')}${phase===4&&result?`<div class="comparison-grid"><article class="comparison-card"><h2>첫 설계</h2><p>더위 ${rec.before.heat?.total} · 빗물 ${rec.before.rain?.total}</p></article><article class="comparison-card"><h2>검토한 설계</h2><p>더위 ${rec.after.heat?.total} · 빗물 ${rec.after.rain?.total}</p></article></div>${valid?'<p class="notice">두 위험 모두 기준을 지키고, 처음보다 합계가 커지지 않았어요. 대응안을 보관할 수 있어요.</p>':`<p class="notice">아직 한쪽 위험이 많이 남았거나 합계가 커졌어요. 더위에는 그늘·도시숲, 빗물에는 저류지·흡수 길을 비교해 보세요.</p>`}`:''}`,`재시험 ${phase===3?1:2} / 2`,b(!result?'재시험 시작':phase===3?'많은 비 재시험 →':valid?'검증 기록 제출':'설계를 다시 살펴보기','primary run'),'숫자는 남아 있는 영향을 합친 가상 단계예요. 낮을수록 이 모형에서 영향이 적어요.');
    on('.run','click',()=>{if(!result){rec.after[hazard]=evaluateCity(rec.plan,hazard);rec.feedback='첫 설계와 같은 조건으로 결과를 기록했어요.';commit();draw();}else if(phase===3){rec.phase=4;rec.after.rain=evaluateCity(rec.plan,'rain');rec.feedback=canCompleteStress(rec.before,rec.after)?'같은 많은 비 조건에서도 시험했어요. 두 위험 모두 기준을 지켰어요!':`아직 기준에 못 미쳐요. 더위 ${rec.after.heat.total}, 빗물 ${rec.after.rain.total} — 둘 다 10 이하이고 합계가 처음보다 크지 않아야 해요. 더위에는 그늘·도시숲, 빗물에는 저류지·흡수 길을 비교해 보세요.`;effect(canCompleteStress(rec.before,rec.after)?'success':'retry');commit();draw();}else if(valid){state.records[8]??={};sourceActivityRecord(state.records[8]).plan=[...rec.plan];rec.sourcePlan=[...rec.plan];rec.testedPlan=[...rec.plan];rec.verified=true;finish('내 설계를 폭염과 많은 비에 각각 두 번 시험했어요. 같은 조건에서 두 위험에 대비한 최종 도시 설계도를 얻었어요.');}else {rec.phase=2;rec.feedback='';commit();draw();}});
    on('.redesign','click',()=>{rec.phase=2;rec.feedback='';commit();draw();});
  }
  function stressBoard(plan,result,hazard,label){
    return `<div class="city-board test-city" style="background-image:url('${asset(hazard==='heat'?'city':'storm')}')">${cityDistricts.map((d,i)=>{const f=facilities.find(n=>n.id===plan[i]);const risk=result?.districts[i]?.risk;return `<article class="district-tile ${result&&risk>2?'at-risk':''}">${f?artImage(f.id,'district-art',true):''}<span class="eyebrow">${escapeText(d.name)}</span><strong>${escapeText(f?.name||'미배치')}</strong><span>${result?`남은 영향 ${bounded(risk,4)}단계`:'아직 시험하지 않았어요'}</span></article>`;}).join('')}</div>${result?`<article class="evidence-card compact"><h2>${escapeText(label)} · ${hazard==='heat'?'더위':'빗물'} 영향 합계 ${result.total}</h2><p>가장 영향이 큰 곳: ${escapeText(result.districts.filter(d=>d.risk===Math.max(...result.districts.map(n=>n.risk))).map(d=>d.name).join(', '))}</p></article>`:''}`;
  }
  playback=createActivityPlayback({getStep:playbackStep,onChange:playbackChange,execute:step=>{
    if(step.kind==='compare'){
      const slider=host.querySelector('.compare-slider');if(!slider)return;
      slider.value=String(Math.round(step.progress*100));slider.dispatchEvent(new Event('input',{bubbles:true}));
      if(step.progress===1)slider.dispatchEvent(new Event('change',{bubbles:true}));
    }else if(index===4&&step.observe){runWater(true);}else{const target=host.querySelector(step.target);if(target&&!target.disabled)target.click();}
  }});
  host.ownerDocument.addEventListener('visibilitychange',()=>playback.setVisible(!host.ownerDocument.hidden),{signal:lifetime.signal});
  host.addEventListener('pointerdown',e=>{if(e.isTrusted&&((index===0&&e.target.closest('[data-site],.compare-slider,.activity-next'))||(index===4&&e.target.closest('[data-predict],.run,.next'))||(index===9&&e.target.closest('[data-district],[data-tool],.run,.retest'))))playback.pause();},{signal:lifetime.signal,capture:true});
  host.addEventListener('keydown',e=>{if(e.isTrusted&&((index===0&&e.target.closest('[data-site],.compare-slider,.activity-next'))||(index===4&&e.target.closest('[data-predict],.run,.next'))||(index===9&&e.target.closest('[data-district],[data-tool],.run,.retest')))&&['ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(e.key))playback.pause();},{signal:lifetime.signal,capture:true});
  commit();draw();
  return ()=>{disposed=true;playback.dispose();lifetime.abort();controller?.abort();};
}
