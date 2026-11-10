import {evidenceSites,humanSites} from './activity-data.js';

const chartMaximum=Math.max(1,...evidenceSites.flatMap(site=>[...site.past,...site.now]));
const at=(items,value)=>items[Math.max(0,Math.min(items.length-1,Math.floor(Number(value)||0)))];
const resourcePaths=[
  '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  '<path d="M4 21V5h9v16M3 21h12M6 8h5v4H6zm7 5h3v5a2 2 0 0 0 4 0V9l-3-3m0 3h3"/>',
  '<path d="m3 7 9-5 9 5v10l-9 5-9-5Zm0 0 9 5 9-5M12 12v10M7 5l10 5"/>',
  '<path d="m8 3-5 7h3l-4 6h12l-4-6h3Zm8 0-3 5m3-5 5 7h-3l4 6h-5M8 16v5m8-5v5"/>'
];
const resourceIcon=n=>`<svg class="icon ov-resource-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${resourcePaths[n]}</svg>`;

// Weather sites name their real short periods (어제·오늘, 요일) so a day's data never looks like a multi-year record.
const periodsOf=site=>site.periods||['이전 여러 해','나중 여러 해'];
export function observationChart(site){
  const [before,after]=periodsOf(site);
  return `<div class="ov-legend"><span>줄무늬 · ${before}</span><span>단색 · ${after}</span><small>가상 자료 · ${site.unit}<span class="ov-scale"> · 가상 상대 단계 0~${chartMaximum}</span></small></div><div class="ov-chart" style="--ov-maximum:${chartMaximum}" role="img" aria-label="${site.unit}. 같은 눈금, 0부터 ${chartMaximum}까지의 가상 상대 단계. ${before} ${site.past.join(', ')}. ${after} ${site.now.join(', ')}.">${site.past.map((value,i)=>`<div class="ov-pair"><div class="ov-bars"><div class="ov-column ov-past" style="--ov-value:${value}"><span>${value}</span><i></i></div><div class="ov-column ov-now" style="--ov-value:${site.now[i]}"><span>${site.now[i]}</span><i></i></div></div><span class="ov-group-label">${site.groups?.[i]||`${i+1}묶음`}</span></div>`).join('')}</div>`;
}

/** Presentation only: source values and the activity's saved answers remain unchanged. */
export function enhanceObservation({host,index,rec,icon=()=>''}){
  if(index===0){
    const original=host.querySelector('.mini-chart'),data=host.querySelector('.evidence-data');
    if(!original||!data)return;
    const site=at(evidenceSites,rec.open),visual=document.createElement('div');
    visual.className='ov-chart-wrap';visual.innerHTML=observationChart(site);
    original.replaceWith(visual);data.classList.add('ov-data');
    data.querySelector(':scope > p')?.remove();
    data.querySelector(':scope > .chart-legend')?.remove();
    data.querySelector('.period-label')?.remove();
    const sliderLabel=host.querySelector('.compare-slider')?.parentElement;
    if(sliderLabel?.firstChild?.nodeType===3)sliderLabel.firstChild.textContent='시간 손잡이 ';
    const update=()=>{
      const reveal=Math.max(0,Math.min(100,Number(rec.reveal)||0))/100;
      visual.style.setProperty('--ov-reveal',String(reveal));
      // Reveal the actual second record, never invent intermediate measurements.
      visual.querySelectorAll('.ov-now').forEach(el=>el.setAttribute('aria-hidden',String(reveal===0)));
      const [before,after]=periodsOf(site);
      visual.querySelector('.ov-chart').setAttribute('aria-label',reveal===0?`${site.unit}. 같은 눈금, 0부터 ${chartMaximum}까지의 가상 상대 단계. ${before} ${site.past.join(', ')}. 손잡이를 밀어 ${after} 기록을 비교해요.`:`${site.unit}. 같은 눈금, 0부터 ${chartMaximum}까지의 가상 상대 단계. ${before} ${site.past.join(', ')}. ${after} ${site.now.join(', ')}.`);
    };
    update();host.querySelector('.compare-slider')?.addEventListener('input',update);
  }
  if(index===1){
    const data=host.querySelector('.comparison-data');if(!data)return;
    const site=at(evidenceSites,rec.round);data.classList.remove('paired-data');data.classList.add('ov-data');data.innerHTML=observationChart(site);
    const note=data.parentElement.querySelector(':scope > .science-note');
    if(note){data.setAttribute('title',note.textContent);note.remove();}
    const clue=data.previousElementSibling;if(clue?.tagName==='P')clue.classList.add('ov-evidence-clue');
  }
  if(index===2){
    const grid=host.querySelector('.resource-grid');if(!grid)return;
    host.querySelectorAll('[data-resource]').forEach((button,i)=>{
      const label=document.createElement('span');label.textContent=button.textContent;
      button.replaceChildren();button.insertAdjacentHTML('afterbegin',resourceIcon(i));button.append(label);
      button.classList.add('ov-resource-choice');
    });
    const site=at(humanSites,rec.open),found=Array.isArray(rec.collected)&&rec.collected.includes(Number(rec.open)||0);
    const question=grid.previousElementSibling;
    if(question?.tagName==='P'){
      question.classList.add('ov-resource-question');
      if(found){grid.setAttribute('aria-label',`이 장면과 연결된 자원: ${site.resource}`);question.remove();}
      else question.innerHTML=`${icon('scan')}<span>연결된 자원은?</span>`;
    }
  }
  if(index===3){
    const chain=host.querySelector('.link-chain');if(!chain)return;
    chain.classList.add('ov-cause-chain');
    chain.querySelectorAll('.chain-arrow').forEach(arrow=>arrow.innerHTML=icon('arrow'));
    const labels=['관찰한 활동','가운데 이유','이어지는 관련성'];
    chain.querySelectorAll('.chain-slot').forEach((slot,i)=>{
      slot.classList.add('ov-chain-step');
      const heading=slot.querySelector(':scope > .eyebrow');
      if(heading)heading.innerHTML=`<span class="ov-step-number">${i+1}</span><span>${labels[i]}</span>`;
    });
  }
}
