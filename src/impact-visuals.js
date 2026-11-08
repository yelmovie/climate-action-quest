import {coastDistricts,experimentLevels} from './activity-data.js';

/** Visual explanations only: the activity owns all answers, events and records. */
export function enhanceImpact({host,index,rec,icon=()=>''}){
  if(index===4)coastProfile(host,rec,icon);
  if(index===5)effectSteps(host,rec,icon);
  if(index===6||index===7)relativeMetrics(host,index);
}

function coastProfile(host,rec,icon){
  const target=host.querySelector('.water-target');
  const level=experimentLevels[rec.round];
  if(!target||!Number.isInteger(level))return;
  const figure=document.createElement('figure');
  figure.className='coast-profile'+(rec.ran?' is-tested':'');
  figure.style.setProperty('--water-height',level/5*100+'%');
  figure.setAttribute('title','땅과 물을 같은 높이 기준으로 비교해요.');
  figure.innerHTML=`<figcaption>${icon('water')}<span>${rec.ran?'푸른 선: 실험 수면':'점선: 예상 수면'}</span></figcaption><div class="coast-profile-land" role="img" aria-label="수위 ${level}단계. 같은 기준의 땅 높이: ${coastDistricts.map(d=>d.name+' '+d.height+'단계').join(', ')}. ${rec.ran?'땅 높이가 수위보다 낮거나 같은 곳에 물이 닿았어요.':'점선은 실험할 수위예요.'}"><div class="coast-profile-water" aria-hidden="true"></div>${coastDistricts.map(d=>`<div class="coast-profile-column" style="--land-height:${d.height/5*100}%"><div class="coast-profile-ground"><b>${d.height}</b></div></div>`).join('')}</div><div class="coast-profile-names" aria-hidden="true">${coastDistricts.map(d=>`<span>${d.name}</span>`).join('')}</div>`;
  target.replaceWith(figure);
  host.querySelectorAll('.flood-district').forEach(button=>{
    const district=coastDistricts.find(d=>d.id===button.dataset.predict);
    if(!district)return;
    button.style.setProperty('--terrain-height',district.height/5*100+'%');
    button.setAttribute('aria-label',`${district.name}, 땅 높이 ${district.height}단계, ${rec.ran?(district.height<=level?'물 닿음':'물 안 닿음'):(rec.prediction||[]).includes(district.id)?'예상 표시됨':'눌러서 예상'}`);
  });
}

function effectSteps(host,rec,icon){
  const labels=['환경의 변화','공간·조건의 변화','사람·생물의 영향'];
  const symbols=['water','map','shield'];
  host.querySelectorAll('.link-chain > .chain-arrow').forEach(arrow=>{arrow.innerHTML=icon('arrow');});
  host.querySelectorAll('[data-remove]').forEach((slot,i)=>{
    const heading=slot.querySelector('.eyebrow');
    if(heading)heading.innerHTML=`<span class="effect-step-number">${i+1}</span><span>${labels[i]}</span>`;
    slot.classList.add('effect-step');
    slot.setAttribute('aria-label',`${i+1}번째 ${labels[i]}: ${slot.querySelector('p')?.textContent||''}${rec.checked?'':'. 누르면 카드를 빼요.'}`);
    if(!slot.querySelector('.effect-step-symbol'))slot.insertAdjacentHTML('afterbegin',`<span class="effect-step-symbol" aria-hidden="true">${icon(symbols[i])}</span>`);
  });
}

function relativeMetrics(host,index){
  const directions=['낮을수록 부담이 적어요','건강·생활을 지켜요','낮을수록 덜 써요'];
  host.querySelectorAll('.metric-row').forEach(row=>{
    row.querySelectorAll('.metric').forEach((metric,i)=>{
      const value=['낮음','보통','높음'].indexOf(metric.querySelector('strong')?.textContent)+1;
      if(value<1)return;
      metric.querySelector('.metric-track')?.remove();
      metric.classList.add('relative-metric');
      metric.dataset.metric=i===1?'comfort':'burden';
      metric.setAttribute('aria-label',`${metric.querySelector('span')?.textContent}: ${metric.querySelector('strong')?.textContent}. ${directions[i]}`);
      metric.insertAdjacentHTML('beforeend',`<span class="relative-meter" aria-hidden="true">${[1,2,3].map(n=>`<i class="${n<=value?'is-on':''}"></i>`).join('')}</span>`);
    });
  });
  const metrics=host.querySelector('.metric-row');
  if(index===6&&metrics)metrics.insertAdjacentHTML('afterend','<p class="metric-directions">부담·자원은 낮게, 건강·생활은 안전하게.</p>');
  if(index===7)host.querySelectorAll('.comparison-card[role="button"]').forEach((card,i)=>{
    card.insertAdjacentHTML('afterbegin',`<span class="comparison-choice-mark" aria-hidden="true">${i?'B':'A'}</span>`);
    const heading=card.querySelector('h2');
    if(heading)heading.textContent=heading.textContent.replace(/^[AB]\s*·\s*/,'');
  });
}
