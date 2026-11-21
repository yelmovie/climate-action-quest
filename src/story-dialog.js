// 공용 창(dialog)과 첫 이야기(story: 인트로 영상, 못 열면 그림 이야기 세 장). main.js에서 그대로 옮겼다(3-4단계 2차, 동작 같음).
import {stopNarration,yieldNarration,voiceControl} from './narration.js';
import {icon} from './icons.js';
const asset=name=>`/assets/${name}.webp`;
export function dialog(html,classes=''){
 // 이미 시작된 악당의 짧은 대사는 바로 끊지 않는다(최대 2초). 창 안의 안내 음성은 그 뒤에 시작한다(narration.js).
 yieldNarration();
 const opener=document.activeElement,d=document.createElement('dialog');d.className='game-dialog '+classes;d.innerHTML=`<button class="dialog-close icon-button" aria-label="닫기">${icon('close')}</button><div class="dialog-body">${html}</div>`;document.body.append(d);d.querySelector('.dialog-close').onclick=()=>d.close();d.addEventListener('close',()=>{stopNarration();d.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});d.showModal();return d;
}
// The story opens as the intro film; the three illustrated pages stay as the fallback when the film cannot play.
export function story(after){
 import('./story-film.js').then(({openStoryFilm})=>openStoryFilm({id:'intro',dialog,icon,after,fallback:()=>storyPages(after)})).catch(()=>storyPages(after));
}
function storyPages(after){
 const pages=[['끊어진 연구기지를 다시 연결해요','도시를 살펴보던 연구 기록이 흩어졌어요. 무엇이 달라졌는지, 어떤 준비가 필요한지 확인할 단서가 필요해요.','home'],['대원은 생각하고, 잎새는 함께 걸어요','관측하고 → 관련성을 찾고 → 영향을 실험해요. 생활의 선택을 비교한 뒤, 직접 설계한 도시를 시험해요.','village'],['다섯 기록이 모이면, 나만의 최종 보고!','연구를 마칠 때마다 지도 속 시설에 불빛이 켜져요. 기록을 모아 탐구 인증서를 완성해요. 현실의 기후 문제는 우리 실천으로 계속 대응해야 해요.','design']];let n=0;
 const d=dialog('','story-dialog');const body=d.querySelector('.dialog-body');function draw(){stopNarration();const p=pages[n];body.innerHTML=`<img class="story-art" src="${asset(p[2])}" alt=""><span class="eyebrow">잎새가 보낸 연구 의뢰 · ${n+1} / 3</span><h2>${p[0]}</h2><p>${p[1]}</p><button class="button primary story-next">${n===2?'연구기지로 출발!':'다음 이야기'} ${icon('arrow')}</button>`;body.querySelector('button').onclick=()=>{if(n<2){n++;draw();}else{d.close();after?.();}};voiceControl(body,`story-${n+1}`,{autoplay:true});}draw();
}
