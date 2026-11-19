import {voiceControl,playVoice,isNarrating,onNarrationIdle,stopNarration} from './narration.js';
import {bindConceptFocus} from './concept-focus.js';
import {concepts,CONCEPT_DURATION,CONCEPT_CUES} from './concept-data.js';

/** Completion is saved before opening. Closing or a media failure never loses work. */
export function openConcept({index,dialog,audio,icon,next,label,reward=''}){
 const clip=concepts[index],base=`/assets/concepts/${clip.id}`;
 const d=dialog(`<div class="concept-screen"><video playsinline muted preload="metadata" poster="${base}.webp" aria-label="${clip.title}"></video><img class="concept-end" src="${base}.webp" alt="${clip.title}의 마지막 장면" hidden><button class="button primary concept-play">${icon('play')} 영상 재생</button></div><div class="concept-chrome"><header class="concept-heading"><span class="eyebrow">${reward||'발견을 움직임으로 다시 보기'} · ${CONCEPT_DURATION}초</span><h2>${clip.title}</h2></header><footer class="concept-actions"><button class="button secondary concept-pause" hidden>잠깐 멈춤</button><button class="button primary concept-next">${label} ${icon('arrow')}</button></footer></div><div class="concept-explanation"><p class="concept-caption" role="status" aria-live="polite">${clip.cues[0]}</p><ol class="concept-fallback" hidden>${clip.cues.map(t=>`<li>${t}</li>`).join('')}</ol><div class="concept-timeline" aria-hidden="true">${clip.cues.map(()=>'<i></i>').join('')}</div></div>`,'concept-dialog');
 if(index%2===1&&reward.endsWith('배지 획득!'))voiceControl(d.querySelector('.concept-heading'),`badge-${Math.floor(index/2)}`,{autoplay:true});
 const video=d.querySelector('video'),play=d.querySelector('.concept-play'),pause=d.querySelector('.concept-pause'),still=d.querySelector('.concept-end'),caption=d.querySelector('.concept-caption');
 let closed=false,failed=false,current=-1,formatFallback=false,held=false;let releaseFocus=()=>{};
 // Each caption is read once; the muted clip waits while the badge or the previous caption is still speaking. While it waits (held), the pause button still pauses instead of resuming.
 const voiced=new Set();let unhold=()=>{};
 function speak(n){if(closed||failed||n<0||voiced.has(n))return;voiced.add(n);playVoice(`concept-${clip.id}-${n+1}`);}
 function hold(){unhold();held=true;video.pause();unhold=onNarrationIdle(()=>{unhold=()=>{};if(!closed&&!failed)start();});}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 audio.quiet(true);
 function cue(n){if(n===current)return;current=n;caption.textContent=clip.cues[n];d.querySelectorAll('.concept-timeline i').forEach((el,i)=>el.classList.toggle('on',i<=n));}
 function fallback(){if(closed||failed)return;failed=true;d.classList.remove('is-playing','concept-film-live');releaseFocus();clearTimeout(timer);video.pause();video.removeAttribute('src');video.load();video.hidden=true;still.hidden=false;play.hidden=true;pause.hidden=true;caption.hidden=true;d.querySelector('.concept-fallback').hidden=false;}
 function start(){if(closed||failed)return;held=false;still.hidden=true;video.hidden=false;if(video.ended)video.currentTime=0;video.play().then(()=>{if(closed)return;play.hidden=true;pause.hidden=false;pause.textContent='잠깐 멈춤';}).catch(()=>{if(!closed&&!failed)play.hidden=false;});}
 video.addEventListener('timeupdate',()=>{const n=CONCEPT_CUES.reduce((n,at,i)=>video.currentTime>=at?i:n,0);if(n>current&&!video.paused&&isNarrating()){hold();return;}cue(n);if(!video.paused)speak(n);});
 video.addEventListener('playing',()=>{d.classList.add('is-playing','concept-film-live');if(!voiced.has(current)&&isNarrating()){hold();return;}speak(current);});
 video.addEventListener('pause',()=>d.classList.remove('is-playing'));
 video.addEventListener('seeked',()=>{if(!failed&&!video.ended&&video.currentTime>.25)d.classList.add('concept-film-live');});
 video.addEventListener('ended',()=>{d.classList.remove('is-playing','concept-film-live');still.hidden=false;play.textContent='다시 보기';play.hidden=false;pause.hidden=true;cue(2);});
 video.addEventListener('loadedmetadata',()=>{clearTimeout(timer);if(!reduced)start();});
 video.addEventListener('error',()=>{if(closed||failed)return;if(!formatFallback){formatFallback=true;video.src=base+'.mp4';video.load();}else fallback();});
 let chromeTimer=0;d.querySelector('.concept-screen').addEventListener('click',e=>{if(e.target.closest('.concept-play'))return;d.classList.add('show-chrome');clearTimeout(chromeTimer);chromeTimer=setTimeout(()=>d.classList.remove('show-chrome'),3500);});
 play.onclick=()=>{if(video.ended){voiced.clear();current=-1;}start();};
 pause.onclick=()=>{if(video.paused&&!held){start();}else{held=false;unhold();unhold=()=>{};stopNarration();voiced.delete(current);video.pause();pause.textContent='이어서 보기';}};
 d.querySelector('.concept-next').onclick=()=>{d.close();next();};
 const onVisibility=()=>{if(document.hidden&&!video.paused){video.pause();pause.textContent='이어서 보기';}};
 document.addEventListener('visibilitychange',onVisibility);
 d.addEventListener('close',()=>{releaseFocus();closed=true;unhold();clearTimeout(timer);clearTimeout(chromeTimer);document.removeEventListener('visibilitychange',onVisibility);video.pause();video.removeAttribute('src');video.load();audio.quiet(false);},{once:true});
 const timer=setTimeout(()=>{if(video.readyState<1)fallback();},6000);
 cue(0);
 video.src=base+(video.canPlayType('video/webm; codecs="vp9"')?'.webm':'.mp4');video.load();
 const words=[['날씨','여러 해','경향'],['날씨','기후','긴 기간','같은 장소','같은 기준'],['에너지','자원','오래'],['에너지','자원','줄이는'],['땅의 높이','수위','낮은 곳'],['변화','영향','대응'],['더위','물과 그늘','건강과 안전'],['같게','한 가지만','비교'],['더위','빗물','그늘','저류지'],['폭염','시설','같은 폭염','같은 조건','다시 시험']][index];
 const labels=[['하루 날씨','여러 해 기록','변화의 경향'],['날씨','기후','같은 기준'],['에너지와 자원','오래 쓰기','숲 지키기'],['영향 살피기','자원 연결','불필요한 사용 줄이기'],['땅 높이','수위 변화','영향 비교'],['환경 변화','생활의 영향','필요한 대응'],['더운 날의 선택','물과 그늘','건강과 안전'],['같은 조건','한 가지 변화','결과 비교'],['구역별 위험','맞는 시설','자원 나누기'],['시설 없이 시험','다시 시험','같은 조건 비교']][index];
 releaseFocus=bindConceptFocus(d,video,{steps:labels.map((term,i)=>({at:CONCEPT_CUES[i]+.3,term})),terms:words,caption,anchor:d.querySelector('.concept-heading'),controls:false,reduced});
 return d;
}
