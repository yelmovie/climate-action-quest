import {title,intro,background,items,missions,note,evaluate,MISSION_SAVE_KEY,freshMissionState,normalizeMissionState} from './play-mission-model.js';
import {createSaveSession} from './state.js';
import {icon} from './icons.js';

const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const levelLabels=['폭염','많은 비','함께 대비'];

export function openPlayMission(){
 if(document.querySelector('dialog[open]'))return;
 let storage;
 try{storage=window.localStorage;}catch{storage={getItem(){throw Error('unavailable');}};}
 const session=createSaveSession(storage,{key:MISSION_SAVE_KEY,createState:freshMissionState,normalize:normalizeMissionState});
 let state=session.state,selected=null,result=null,undo=[],resetPending=false,choosingSite=false;
 let saveError=session.error?'기존 미션 기록을 읽지 못해 자동 저장을 멈췄어. 기존 기록은 보존돼.':'';
 const opener=document.activeElement;
 const dialog=document.createElement('dialog');
 dialog.className='play-mission play-mode-16';
 dialog.setAttribute('aria-labelledby','pm-title');
 document.body.append(dialog);

 function persist(){
  const status=session.save(state);
  saveError=status.ok?'':status.reason==='conflict'
   ?'다른 탭에서 미션 기록이 바뀌어 저장을 멈췄어. 탭을 하나만 열고 다시 시작해 줘.'
   :'이번 변경을 저장하지 못했어. 창을 닫으면 이번 변경을 잃을 수 있어. 기존 기록은 보존돼.';
 }
 function changed(){choosingSite=false;result=null;persist();render();}
 const picture=item=>item?.art
  ?`<img src="${item.art}" alt="">`
  :icon(item?.icon||'plus');

 function render(){
  const active=document.activeElement;
  const focusAttribute=active?.getAttributeNames?.().find(name=>name.startsWith('data-'));
  const focusValue=focusAttribute?active.getAttribute(focusAttribute):null;
  const scrollTop=dialog.querySelector('.pm-workspace')?.scrollTop||0;
  const mission=missions[state.level],plan=state.plans[state.level],past=state.history[state.level];
  const selectedItem=items.find(item=>item.id===selected),cost=evaluate(plan,state.level).cost;
  const placed=plan.some(Boolean),step=choosingSite||selected==='empty'?'place':placed?'test':selected===null?'choose':'place';
  const targets=[['sun','폭염 부담',mission.heat,'이하'],['rain','비 부담',mission.rain,'이하'],['leaf','배출 줄이기',mission.carbon,'이상']].filter(([,label,value])=>label==='배출 줄이기'?value>0:value<12);
  const feedback=choosingSite?(selected==='empty'?'비울 부지를 눌러 봐.':'시설을 놓을 부지를 눌러 봐.')
   :result
   ?result.ok?'조건을 만족했어! 다른 배치의 장단점도 비교해 봐.'
    :cost>mission.budget?'예산을 넘었어. 시설을 바꿔 다시 시험해 봐.'
     :result.heat>mission.heat?'폭염 부담이 남아 있어. 시설의 역할을 비교해 봐.'
      :result.rain>mission.rain?'비 부담이 남아 있어. 시설의 역할을 비교해 봐.'
       :'배출 줄이기 조건을 살펴보고 다시 시험해 봐.'
   :selected==='empty'?'비울 부지를 눌러 봐.'
    :placed?'준비됐으면 도시를 시험해 봐.'
     :selected===null?'먼저 시설을 골라 봐.':'빈 부지에 시설을 놓아 봐.';
  dialog.innerHTML=`<div class="pm-shell" style="--pm-bg:url('${background}')">
   <header class="pm-head"><h2 id="pm-title">${title}</h2><div class="pm-head-actions"><details class="pm-model-help"><summary aria-label="도시 모형 안내">${icon('book')}</summary><div><p>${intro}</p><p>${mission.goal}</p><p>${note}</p>${past.length>1?`<p class="pm-compare">이전 시험 → 이번 시험 · 폭염 ${past[0].heat} → ${past[1].heat} / 비 ${past[0].rain} → ${past[1].rain} / 배출 줄이기 ${past[0].carbon} → ${past[1].carbon}</p>`:''}</div></details>${resetPending?'':`<button class="pm-reset-button" data-reset aria-label="미션 기록 초기화">${icon('reset')}</button>`}<button data-close aria-label="탐구로 돌아가기">${icon('close')}</button></div></header>
   ${resetPending?`<div class="pm-workspace pm-reset"><h3>도시 운영 미션을 처음부터 할까?</h3><p>세 미션의 설계와 시험 기록을 초기화해. 직전 기록 한 개는 이 기기에 보관돼. 열 가지 탐구 활동 기록은 그대로 이어 갈 수 있어.</p></div>`:`
   <nav class="pm-levels" aria-label="도시 운영 미션">${missions.map((item,level)=>`<button data-level="${level}" class="${level===state.level?'active':''}" aria-label="${level+1}. ${item.name}" ${level===state.level?'aria-current="step"':''} ${level>0&&!state.won.includes(level-1)?'disabled':''}><span class="pm-level-number">${state.won.includes(level)?icon('check'):level+1}</span>${levelLabels[level]}</button>`).join('')}</nav>
   <div class="pm-goal"><div class="pm-targets" aria-label="${escapeText(mission.goal)}">${targets.map(([symbol,label,value,direction])=>`<span>${icon(symbol)}${label} <b>${value}</b> ${direction}</span>`).join('')}</div><span class="pm-budget ${cost>mission.budget?'over-budget':''}">예산 <b>${cost}</b> / ${mission.budget}</span></div>
   <div class="pm-workspace">
    <div class="pm-content" data-step="${step}">
     <section class="pm-scene" aria-label="설계 공간">
      <div class="pm-grid ${result?'tested':''}" aria-label="시설을 놓을 여섯 부지">${plan.map((id,cell)=>{const item=items.find(item=>item.id===id);return `<button class="pm-cell ${item?'occupied':''} ${result?.ok?'active-life':''}" data-cell="${cell}" aria-label="${cell+1}번 공간 ${item?.name||'빈 공간'}" aria-describedby="pm-instruction"><span class="pm-slot" aria-hidden="true">${cell+1}</span>${picture(item)}${item?`<span class="pm-cell-label">${item.name}</span>`:''}</button>`;}).join('')}</div>
      ${result?`<div class="pm-metrics" aria-label="도시 시험 결과"><span>${icon('sun')}폭염 부담 <b>${result.heat}</b></span><span>${icon('rain')}비 부담 <b>${result.rain}</b></span><span>${icon('leaf')}배출 줄이기 <b>${result.carbon}</b></span></div>`:''}
     </section>
     <aside class="pm-palette" aria-label="설계 도구">${items.map(item=>`<button class="pm-tool" data-tool="${item.id}" aria-pressed="${selected===item.id}" aria-label="${item.name}, 비용 ${item.cost}, ${item.effect}" title="${item.effect}"><span class="pm-tool-cost" aria-label="비용 ${item.cost}">${item.cost}</span>${picture(item)}<span>${item.name}</span>${selected===item.id?`<span class="pm-tool-check">${icon('check')}</span>`:''}</button>`).join('')}<p class="pm-tool-detail" aria-live="polite">${selectedItem?escapeText(selectedItem.effect):'숫자는 시설 비용이야.'}</p></aside>
    </div>
   </div>`}
   <footer class="pm-footer">
    ${resetPending?'':`<div class="pm-feedback ${result?.ok?'good':''}" id="pm-instruction" role="status" aria-live="polite">${icon(choosingSite?(selected==='empty'?'erase':'plus'):result?(result.ok?'check':'search'):selected===null?'hand':selected==='empty'?'erase':placed?'flask':'plus')}<span>${escapeText(feedback)}</span></div>`}
    ${saveError?`<p class="pm-error" role="alert">${saveError}</p>`:''}
    <div class="pm-actions">${resetPending?'<button data-cancel-reset>계속 탐구하기</button><button class="pm-danger" data-confirm-reset>미션 기록 초기화</button>':`
     <button data-undo ${undo.length?'':'disabled'} aria-label="${undo.length?'마지막 배치를 한 번 되돌리기':'시설을 놓은 뒤 되돌릴 수 있어요'}">${icon('back')} 되돌리기</button>
     <button class="${step==='test'&&!(result?.ok&&state.level<missions.length-1)?'primary':''}" data-test>${icon('flask')} 도시 시험하기</button>
     ${result?.ok&&state.level<missions.length-1?`<button class="${choosingSite?'':'primary'}" data-next>다음 미션 ${icon('arrow')}</button>`:''}
     ${result?.ok&&state.level===missions.length-1?`<span class="pm-badge">${icon('trophy')} 세 미션 완료!</span>`:''}`}</div>
   </footer>
  </div>`;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  if(resetPending){
   dialog.querySelector('[data-cancel-reset]').onclick=()=>{resetPending=false;render();dialog.querySelector('[data-reset]').focus();};
   dialog.querySelector('[data-confirm-reset]').onclick=()=>{
    const status=session.reset();
    if(!status.ok){saveError='기존 기록을 안전하게 보관하지 못해 초기화를 멈췄어.';render();return;}
    state=freshMissionState();selected=null;choosingSite=false;result=null;undo=[];saveError='';resetPending=false;render();dialog.querySelector('[data-level="0"]').focus();
   };
   dialog.querySelector('[data-cancel-reset]').focus();
   return;
  }
  dialog.querySelectorAll('[data-tool]').forEach(button=>button.onclick=()=>{selected=button.dataset.tool;choosingSite=true;render();});
  dialog.querySelectorAll('[data-cell]').forEach(button=>button.onclick=()=>{
   if(selected===null){dialog.querySelector('[data-tool]').focus();return;}
   undo.push([...plan]);if(undo.length>20)undo.shift();
   plan[Number(button.dataset.cell)]=selected==='empty'?null:selected;changed();
  });
  dialog.querySelectorAll('[data-level]').forEach(button=>button.onclick=()=>{
   state.level=Number(button.dataset.level);selected=null;choosingSite=false;result=null;undo=[];persist();render();
  });
  dialog.querySelector('[data-undo]').onclick=()=>{const previous=undo.pop();if(previous){state.plans[state.level]=previous;changed();}};
  dialog.querySelector('[data-test]').onclick=()=>{
   choosingSite=false;result=evaluate(plan,state.level);
   if(result.ok&&!state.won.includes(state.level))state.won.push(state.level);
   const history=state.history[state.level];history.push({heat:result.heat,rain:result.rain,carbon:result.carbon});if(history.length>2)history.shift();
   persist();render();
  };
  const next=dialog.querySelector('[data-next]');
  if(next)next.onclick=()=>{state.level++;selected=null;choosingSite=false;result=null;undo=[];persist();render();dialog.querySelector(`[data-level="${state.level}"]`).focus();};
  dialog.querySelector('[data-reset]').onclick=()=>{resetPending=true;render();};
  dialog.querySelector('.pm-workspace').scrollTop=scrollTop;
  if(focusAttribute)dialog.querySelector(`[${focusAttribute}="${CSS.escape(focusValue)}"]`)?.focus({preventScroll:true});
 }
 dialog.addEventListener('close',()=>{dialog.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});
 render();dialog.showModal();dialog.querySelector(state.plans[state.level].some(Boolean)?'[data-test]':'[data-tool]').focus();
}
