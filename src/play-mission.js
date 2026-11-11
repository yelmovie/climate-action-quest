import {title,intro,background,items,missions,note,evaluate,MISSION_SAVE_KEY,freshMissionState,normalizeMissionState} from './play-mission-model.js';
import {createSaveSession} from './state.js';
import {icon} from './icons.js';

const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function openPlayMission(){
 if(document.querySelector('dialog[open]'))return;
 let storage;
 try{storage=window.localStorage;}catch{storage={getItem(){throw Error('unavailable');}};}
 const session=createSaveSession(storage,{key:MISSION_SAVE_KEY,createState:freshMissionState,normalize:normalizeMissionState});
 let state=session.state,selected=items[0].id,result=null,undo=[],resetPending=false;
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
 function changed(){result=null;persist();render();}
 const picture=item=>item?.art
  ?`<img src="${item.art}" alt="">`
  :icon(item?.icon||'plus');

 function render(){
  const active=document.activeElement;
  const focusAttribute=active?.getAttributeNames?.().find(name=>name.startsWith('data-'));
  const focusValue=focusAttribute?active.getAttribute(focusAttribute):null;
  const scrollTop=dialog.querySelector('.pm-workspace')?.scrollTop||0;
  const mission=missions[state.level],plan=state.plans[state.level],past=state.history[state.level];
  const selectedItem=items.find(item=>item.id===selected);
  dialog.innerHTML=`<div class="pm-shell" style="--pm-bg:url('${background}')">
   <header class="pm-head"><div><h2 id="pm-title">${title}</h2><p>${intro}</p></div><button data-close aria-label="탐구로 돌아가기">닫기 ${icon('close')}</button></header>
   ${resetPending?`<div class="pm-workspace pm-reset"><h3>도시 운영 미션을 처음부터 할까?</h3><p>세 미션의 설계와 시험 기록을 초기화해. 직전 기록 한 개는 이 기기에 보관돼. 열 가지 탐구 활동 기록은 그대로 이어갈 수 있어.</p></div>`:`
   <nav class="pm-levels" aria-label="도시 운영 미션">${missions.map((item,level)=>`<button data-level="${level}" class="${level===state.level?'active':''}" ${level===state.level?'aria-current="step"':''} ${level>0&&!state.won.includes(level-1)?'disabled':''}>${state.won.includes(level)?icon('check'):''}${level+1}. ${item.name}</button>`).join('')}</nav>
   <div class="pm-goal"><p>${mission.goal}</p><span class="pm-budget">예산 ${evaluate(plan,state.level).cost} / ${mission.budget}</span></div>
   <div class="pm-workspace">
    <div class="pm-content">
     <section class="pm-scene" aria-label="설계 공간"><p class="pm-mission-help">${selectedItem.name} 선택 중 · 공간을 누르면 ${selected==='empty'?'시설을 지워.':'놓거나 바꿀 수 있어.'}</p>
      <div class="pm-grid ${result?'tested':''}">${plan.map((id,cell)=>{const item=items.find(item=>item.id===id);return `<button class="pm-cell ${item?'occupied':''} ${result?.ok?'active-life':''}" data-cell="${cell}" aria-label="${cell+1}번 공간 ${item?.name||'빈 공간'}">${picture(item)}<span>${item?.name||'여기에 놓기'}</span></button>`;}).join('')}</div>
      ${result?`<div class="pm-metrics"><span>폭염 부담 <b>${result.heat}</b></span><span>비 부담 <b>${result.rain}</b></span><span>배출 줄이기 <b>${result.carbon}</b></span></div>`:''}
     </section>
     <aside class="pm-palette" aria-label="설계 도구">${items.map(item=>`<button class="pm-tool" data-tool="${item.id}" aria-pressed="${selected===item.id}">${picture(item)}<span>${item.name}</span><small>비용 ${item.cost} · ${item.effect}</small></button>`).join('')}</aside>
    </div>
    ${past.length>1?`<p class="pm-compare">이전 시험 → 이번 시험 · 폭염 ${past[0].heat} → ${past[1].heat} / 비 ${past[0].rain} → ${past[1].rain} / 배출 줄이기 ${past[0].carbon} → ${past[1].carbon}</p>`:''}
    <p class="pm-note">${note}</p>
   </div>`}
   <footer class="pm-footer">
    ${resetPending?'':`<div class="pm-feedback ${result?.ok?'good':''}" role="status" aria-live="polite">${result?icon(result.ok?'check':'search')+escapeText(result.summary):'도구를 골라 도시를 만들고, 준비되면 시험해 봐.'}</div>`}
    ${saveError?`<p class="pm-error" role="alert">${saveError}</p>`:''}
    <div class="pm-actions">${resetPending?'<button data-cancel-reset>계속 탐구하기</button><button class="pm-danger" data-confirm-reset>미션 기록 초기화</button>':`
     <button class="${result?.ok&&state.level<missions.length-1?'':'primary'}" data-test>${icon('flask')} 폭염·많은 비 시험</button>
     <button data-undo ${undo.length?'':'disabled'} aria-label="${undo.length?'마지막 배치를 한 번 되돌리기':'시설을 놓은 뒤 되돌릴 수 있어요'}">${icon('back')} 한 번 되돌리기</button>
     ${result?.ok&&state.level<missions.length-1?`<button class="primary" data-next>다음 미션 ${icon('arrow')}</button>`:''}
     ${result?.ok&&state.level===missions.length-1?`<span class="pm-badge">${icon('trophy')} 세 미션 완료!</span>`:''}
     <button class="pm-reset-button" data-reset>기록 초기화</button>`}</div>
   </footer>
  </div>`;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  if(resetPending){
   dialog.querySelector('[data-cancel-reset]').onclick=()=>{resetPending=false;render();dialog.querySelector('[data-reset]').focus();};
   dialog.querySelector('[data-confirm-reset]').onclick=()=>{
    const status=session.reset();
    if(!status.ok){saveError='기존 기록을 안전하게 보관하지 못해 초기화를 멈췄어.';render();return;}
    state=freshMissionState();result=null;undo=[];saveError='';resetPending=false;render();dialog.querySelector('[data-level="0"]').focus();
   };
   dialog.querySelector('[data-cancel-reset]').focus();
   return;
  }
  dialog.querySelectorAll('[data-tool]').forEach(button=>button.onclick=()=>{selected=button.dataset.tool;render();});
  dialog.querySelectorAll('[data-cell]').forEach(button=>button.onclick=()=>{
   undo.push([...plan]);if(undo.length>20)undo.shift();
   plan[Number(button.dataset.cell)]=selected==='empty'?null:selected;changed();
  });
  dialog.querySelectorAll('[data-level]').forEach(button=>button.onclick=()=>{
   state.level=Number(button.dataset.level);result=null;undo=[];persist();render();
  });
  dialog.querySelector('[data-undo]').onclick=()=>{const previous=undo.pop();if(previous){state.plans[state.level]=previous;changed();}};
  dialog.querySelector('[data-test]').onclick=()=>{
   result=evaluate(plan,state.level);
   if(result.ok&&!state.won.includes(state.level))state.won.push(state.level);
   const history=state.history[state.level];history.push({heat:result.heat,rain:result.rain,carbon:result.carbon});if(history.length>2)history.shift();
   persist();render();
  };
  const next=dialog.querySelector('[data-next]');
  if(next)next.onclick=()=>{state.level++;result=null;undo=[];persist();render();dialog.querySelector(`[data-level="${state.level}"]`).focus();};
  dialog.querySelector('[data-reset]').onclick=()=>{resetPending=true;render();};
  dialog.querySelector('.pm-workspace').scrollTop=scrollTop;
  if(focusAttribute)dialog.querySelector(`[${focusAttribute}="${CSS.escape(focusValue)}"]`)?.focus({preventScroll:true});
 }
 dialog.addEventListener('close',()=>{dialog.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});
 render();dialog.showModal();dialog.querySelector('[data-close]').focus();
}

function install(){
 const host=document.querySelector('.hero-actions, .facility-copy');
 if(!host||host.querySelector('.play-mission-entry'))return;
 const button=document.createElement('button');
 button.className='play-mission-entry';button.textContent='도시 운영 미션';button.onclick=openPlayMission;
 host.append(button);
}
const observer=new MutationObserver(install);
observer.observe(document.getElementById('app'),{childList:true,subtree:true});
install();
