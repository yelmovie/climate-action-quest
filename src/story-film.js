import {voiceControl,stopNarration} from './narration.js';
import {storyFilms} from './story-film-data.js';

/** Intro/finale film: a muted video with a caption card per scene and that scene's recorded narration.
 *  「다음 장면」 jumps to the next scene; on the last scene it becomes the finish button (after()).
 *  If the video cannot load, fallback() runs instead, so the story never blocks progress. */
export function openStoryFilm({id,dialog,audio,icon,after,fallback}){
 const film=storyFilms[id],n=film.cues.length;
 const d=dialog(`<div class="film-screen"><video playsinline muted preload="auto" poster="${film.src}.webp" aria-label="${film.label}"></video></div><div class="film-card"><span class="eyebrow film-step"></span><h2 class="film-title"></h2><p class="film-text"></p><div class="film-voice"></div><div class="film-actions"><button class="button secondary film-pause" type="button" hidden>잠깐 멈춤</button><button class="button primary story-next" type="button"></button></div></div><div class="film-progress" aria-hidden="true">${film.cues.map(()=>'<i></i>').join('')}</div>`,'film-dialog story-film');
 const video=d.querySelector('video'),next=d.querySelector('.story-next'),pause=d.querySelector('.film-pause');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let current=-1,closed=false,failed=false,finished=false;
 audio.quiet(true);
 function show(i){
  if(i===current||closed)return;current=i;const c=film.cues[i];
  d.querySelector('.film-step').textContent=`${film.label} · ${i+1} / ${n}`;
  d.querySelector('.film-title').textContent=c.title;d.querySelector('.film-text').textContent=c.text;
  const voice=d.querySelector('.film-voice');stopNarration();voice.replaceChildren();voiceControl(voice,c.voice,{autoplay:true});
  d.querySelectorAll('.film-progress i').forEach((el,k)=>el.classList.toggle('on',k<=i));
  next.innerHTML=i<n-1?`다음 장면 ${icon('arrow')}`:`${film.finish} ${icon('arrow')}`;
 }
 function finish(){if(finished)return;finished=true;d.close();after?.();}
 function fail(){if(closed||failed)return;failed=true;finished=true;d.close();fallback?.();}
 function play(){if(closed||failed)return;video.play().then(()=>{pause.hidden=false;pause.textContent='잠깐 멈춤';}).catch(()=>{pause.hidden=false;pause.textContent='영상 재생';});}
 video.addEventListener('timeupdate',()=>{const i=film.cues.reduce((k,c,j)=>video.currentTime>=c.at?j:k,0);if(i>current)show(i);});
 video.addEventListener('ended',()=>{pause.hidden=true;next.classList.add('film-ready');});
 video.addEventListener('loadedmetadata',()=>{clearTimeout(timer);if(!reduced)play();else{pause.hidden=false;pause.textContent='영상 재생';}});
 video.addEventListener('error',()=>{if(video.currentSrc.endsWith('.webm')){video.src=film.src+'.mp4';video.load();}else fail();});
 pause.onclick=()=>{if(video.paused){play();}else{video.pause();stopNarration();pause.textContent='이어서 보기';}};
 next.onclick=()=>{if(current>=n-1){finish();return;}const i=current+1;show(i);video.currentTime=film.cues[i].at;if(!reduced)play();};
 const onVisibility=()=>{if(document.hidden&&!video.paused){video.pause();pause.textContent='이어서 보기';}};
 document.addEventListener('visibilitychange',onVisibility);
 d.addEventListener('close',()=>{closed=true;clearTimeout(timer);document.removeEventListener('visibilitychange',onVisibility);stopNarration();video.pause();video.removeAttribute('src');video.load();audio.quiet(false);},{once:true});
 const timer=setTimeout(()=>{if(video.readyState<1)fail();},8000);
 show(0);
 video.src=film.src+'.mp4';video.load();
 return d;
}
