import {voiceControl,stopNarration} from './narration.js';
import {storyFilms} from './story-film-data.js';

/** Intro/finale film, full screen like the other story films: the captions are burned into the video, so the
 *  controls sit at the top and nothing covers the lower caption area. Each scene plays its recorded line
 *  (voice switch respected); the background music keeps playing and ducks under the voice.
 *  「다음 장면」 jumps ahead; on the last scene it becomes the finish button (after()). 「건너뛰기」 finishes at once.
 *  If the video cannot load, fallback() runs instead, so the story never blocks progress. */
export function openStoryFilm({id,dialog,icon,after,fallback}){
 const film=storyFilms[id],n=film.cues.length;
 const d=dialog(`<div class="film-screen"><video playsinline muted preload="auto" poster="${film.src}.webp" aria-label="${film.label}"></video></div><div class="film-top"><span class="film-voice"></span><button class="button secondary film-pause" type="button" hidden>잠깐 멈춤</button><span class="film-spacer"></span><button class="button primary story-next" type="button"></button><button class="button secondary film-skip" type="button">건너뛰기</button></div><div class="film-card visually-hidden" aria-live="polite"><span class="film-step"></span><h2 class="film-title"></h2><p class="film-text"></p></div>`,'film-dialog story-film');
 const video=d.querySelector('video'),next=d.querySelector('.story-next'),pause=d.querySelector('.film-pause');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let current=-1,closed=false,failed=false,finished=false;
 function show(i){
  if(i===current||closed)return;current=i;const c=film.cues[i];
  d.querySelector('.film-step').textContent=`${film.label} ${i+1} / ${n}`;
  d.querySelector('.film-title').textContent=c.title;d.querySelector('.film-text').textContent=c.text;
  const voice=d.querySelector('.film-voice');stopNarration();voice.replaceChildren();voiceControl(voice,c.voice,{autoplay:true});
  next.innerHTML=i<n-1?`다음 장면 ${icon('arrow')}`:`${film.finish} ${icon('arrow')}`;
 }
 // The dialog is removed on its close event (a task later); drop the scene's voice button now so the next screen's button is the only one.
 function end(){stopNarration();d.querySelector('.film-voice').replaceChildren();d.close();}
 function finish(){if(finished)return;finished=true;end();after?.();}
 function fail(){if(closed||failed)return;failed=true;finished=true;end();fallback?.();}
 function play(){if(closed||failed)return;video.play().then(()=>{pause.hidden=false;pause.textContent='잠깐 멈춤';}).catch(()=>{pause.hidden=false;pause.textContent='영상 재생';});}
 // The first scene's line starts with the picture; later lines start at their scene time.
 video.addEventListener('timeupdate',()=>{const i=film.cues.reduce((k,c,j)=>video.currentTime>=c.at-.05?j:k,0);if(i>current)show(i);});
 video.addEventListener('ended',()=>{pause.hidden=true;next.classList.add('film-ready');next.focus({preventScroll:true});});
 video.addEventListener('loadedmetadata',()=>{clearTimeout(timer);if(!reduced)play();else{pause.hidden=false;pause.textContent='영상 재생';}});
 video.addEventListener('error',()=>fail());
 pause.onclick=()=>{if(video.paused){play();}else{video.pause();stopNarration();pause.textContent='이어서 보기';}};
 next.onclick=()=>{if(current>=n-1){finish();return;}const i=current+1;show(i);video.currentTime=film.cues[i].at;if(!reduced)play();};
 d.querySelector('.film-skip').onclick=finish;
 const onVisibility=()=>{if(document.hidden&&!video.paused){video.pause();pause.textContent='이어서 보기';}};
 document.addEventListener('visibilitychange',onVisibility);
 d.addEventListener('close',()=>{closed=true;clearTimeout(timer);document.removeEventListener('visibilitychange',onVisibility);stopNarration();video.pause();video.removeAttribute('src');video.load();},{once:true});
 const timer=setTimeout(()=>{if(video.readyState<1)fail();},8000);
 show(0);
 video.src=film.src+'.mp4';video.load();
 return d;
}
