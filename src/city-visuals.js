import {CITY_BUDGET,cityDistricts,facilities} from './activity-data.js';

const facilityFor=id=>facilities.find(f=>f.id===id);
const remaining=(district,facility,hazard)=>Math.max(0,district[hazard]-(facility?.[hazard]||0));
const safePlan=plan=>cityDistricts.map((_,i)=>facilityFor(plan?.[i])?.id||null);

/** Present the existing city model without changing plans, scoring or controls. */
export function enhanceCityVisuals({host,index,rec,icon=()=>''}){
  if(index!==8&&index!==9)return;
  const page=host.querySelector('.activity-page');
  if(!page||page.dataset.cityVisuals)return;
  page.dataset.cityVisuals='true';
  const design=host.querySelector('.city-design-layout');
  if(design){
    const plan=safePlan(rec.plan),used=plan.reduce((n,id)=>n+(facilityFor(id)?.cost||0),0);
    const tools=design.querySelector('.evidence-card'),heading=tools?.querySelector('h2');
    if(heading){
      heading.textContent=`자원 ${used} / ${CITY_BUDGET} · 남음 ${CITY_BUDGET-used}`;
      heading.insertAdjacentHTML('afterend',`<div class="city-budget"><div class="city-budget-track" role="meter" aria-label="사용한 설계 자원" aria-valuemin="0" aria-valuemax="${CITY_BUDGET}" aria-valuenow="${used}"><i style="--used:${used/CITY_BUDGET*100}%"></i></div></div>`);
    }
    const instruction=tools?.querySelector(':scope > p:not(.science-note)');
    if(instruction){design.querySelector('.facility-palette')?.setAttribute('aria-label','시설을 고른 뒤 놓을 구역을 눌러요.');instruction.remove();}
    design.querySelectorAll('[data-tool]').forEach(button=>{
      const facility=facilityFor(button.dataset.tool),stats=button.querySelector(':scope > span');
      if(!facility||!stats)return;
      stats.className='city-tool-stats';
      stats.innerHTML=`<span>자원 <b>${facility.cost}</b></span><span class="city-heat">더위 −${facility.heat}</span><span class="city-rain">빗물 −${facility.rain}</span>`;
      button.setAttribute('aria-label',`${facility.name}, 자원 ${facility.cost}, 더위 영향 ${facility.heat}단계 줄임, 빗물 영향 ${facility.rain}단계 줄임`);
    });
    design.querySelectorAll('[data-district]').forEach((tile,i)=>{
      const district=cityDistricts[i],facility=facilityFor(plan[i]);
      tile.querySelectorAll('.district-risks > span').forEach((row,j)=>{
        const hazard=j===0?'heat':'rain',label=j===0?'더위':'빗물',risk=remaining(district,facility,hazard),track=row.querySelector('.risk-track');
        if(!track)return;
        row.replaceChildren();
        const name=document.createElement('span'),value=document.createElement('b');
        name.textContent=label;value.textContent=`${district[hazard]} → ${risk}`;
        row.append(name,value,track);
        row.setAttribute('aria-label',`${label}: 원래 ${district[hazard]}단계에서 ${risk}단계가 남아요`);
      });
      tile.setAttribute('aria-label',`${district.name}, ${facility?.name||'시설 없음'}, 더위 ${district.heat}에서 ${remaining(district,facility,'heat')}, 빗물 ${district.rain}에서 ${remaining(district,facility,'rain')}단계. ${district.clue}`);
    });
    const note=tools?.querySelector('.science-note');
    if(note){note.classList.add('city-risk-legend');note.textContent='숫자: 원래 → 남은 영향';note.setAttribute('title','막대가 짧을수록 영향이 적어요.');}
  }

  const board=host.querySelector('.test-city');
  if(board){
    const hazard=rec.phase===0||rec.phase===3?'heat':'rain',label=hazard==='heat'?'더위':'빗물';
    const result=rec.phase<2?rec.before?.[hazard]:rec.after?.[hazard];
    board.setAttribute('aria-label',`${label} 조건의 도시 시험 결과`);
    board.querySelectorAll('.district-tile').forEach((tile,i)=>{
      const reading=tile.querySelector(':scope > span:not(.eyebrow):not(.risk-track)');
      if(result&&reading){reading.textContent=`남은 영향 ${result.districts[i].risk} / 4`;tile.setAttribute('aria-label',`${cityDistricts[i].name}, ${tile.querySelector('strong')?.textContent}, 남은 ${label} 영향 ${result.districts[i].risk}단계`);}
    });
    const summary=host.querySelector('.stress-results > .evidence-card');
    if(summary){
      summary.classList.add('city-weather-summary');
      summary.insertAdjacentHTML('afterbegin',`<span class="city-weather-symbol" aria-hidden="true">${icon(hazard==='heat'?'sun':'rain')}</span>`);
      if(rec.phase===4&&summary.querySelector('h2'))summary.querySelector('h2').textContent='빗물 관찰';
    }
  }
  if(index===9&&rec.phase===4){
    const cards=host.querySelectorAll('.stress-results .comparison-grid > .comparison-card');
    [rec.before,rec.after].forEach((results,i)=>{
      const text=cards[i]?.querySelector('p');
      if(!text||!results?.heat||!results?.rain)return;
      text.className='city-test-totals';
      text.innerHTML=['heat','rain'].map(hazard=>`<span class="city-total-row ${hazard==='heat'?'city-heat':'city-rain'}"><span>${hazard==='heat'?'더위':'빗물'} <b>${results[hazard].total}</b></span><i class="city-total-track" aria-hidden="true"><i style="--used:${results[hazard].total/24*100}%"></i></i></span>`).join('');
    });
  }
}
