import { certificateFontStyle } from './certificate-font.js';
import { mountWelcomeVoice } from './welcome-voice.js';
let welcomeCleanup = () => {};
import {VERSION,SAVE_KEY,stages,createSaveSession,freshState,stageOpen,activityOpen,chapterDone,certificateEligible} from './state.js';
import {icon} from './icons.js';
import {mountMap} from './map.js';
import {mountActivity,sourceActivityRecord} from './activities.js';
import {createAudio} from './audio.js';
import {content} from './settings-content.js';
import {openConcept} from './concept-player.js';
import {artImage,chapterArt} from './concept-art.js';
const app=document.querySelector('#app'),live=document.querySelector('#announcer'),toast=document.querySelector('#toast');
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('unavailable');},removeItem:()=>{}};}
const loaded=createSaveSession(storage);let studentState=null;let state=loaded.state,cleanup=()=>{},activeRoute='',toastTimer,saveWarning=false;
let resumeActivity=state.route.startsWith('activity/')?Number(state.route.split('/')[1]):null;
const audio=createAudio(storage),asset=name=>`/assets/${name}.webp`,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function announce(message){live.textContent='';requestAnimationFrame(()=>live.textContent=message);toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,5500);}
function storageNotice(message){
 let notice=document.querySelector('#save-protection');
 if(!notice){notice=document.createElement('aside');notice.id='save-protection';notice.setAttribute('role','status');document.body.prepend(notice);}
 notice.replaceChildren();const text=document.createElement('span');text.textContent=message;const button=document.createElement('button');button.className='button secondary';button.textContent='현재 기록 내려받기';button.onclick=()=>download('기후미래_복구용_기록.json',JSON.stringify(studentState||state,null,2),'application/json');notice.append(text,button);
}
function save(){const result=loaded.save(state);if(!result.ok){saveWarning=true;storageNotice(result.reason==='conflict'?'다른 탭에서 기록이 바뀌어 자동 저장을 멈췄어요. 현재 기록을 내려받고 탭을 하나만 사용해 주세요.':'기존 기록 보호를 위해 자동 저장을 멈췄어요. 현재 기록을 내려받아 주세요. 기존 기록은 덮어쓰지 않아요.');}return result.ok;}

document.addEventListener('pointerdown',()=>audio.unlock(),{once:true});document.addEventListener('keydown',()=>audio.unlock(),{once:true});
function hud(home=false){return `<div class="screen-hud"><div class="hud-left">${home?'':`<button class="icon-button" data-nav="home" aria-label="홈">${icon('home')}</button><button class="icon-button" data-back aria-label="이전 화면">${icon('back')}</button>`}</div><div class="hud-right"><button class="icon-button" data-sound aria-label="${audio.settings.bgm||audio.settings.sfx?'전체 소리 끄기':'전체 소리 켜기'}">${icon(audio.settings.bgm||audio.settings.sfx?'sound':'mute')}</button><button class="icon-button" data-settings aria-label="설정">${icon('settings')}</button></div></div>`;}
function wireHud(){app.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));app.querySelector('[data-back]')?.addEventListener('click',back);app.querySelector('[data-settings]')?.addEventListener('click',settings);app.querySelector('[data-sound]')?.addEventListener('click',e=>{audio.toggle();e.currentTarget.innerHTML=icon(audio.settings.bgm||audio.settings.sfx?'sound':'mute');e.currentTarget.setAttribute('aria-label',audio.settings.bgm||audio.settings.sfx?'전체 소리 끄기':'전체 소리 켜기');announce(audio.settings.bgm||audio.settings.sfx?'소리를 켰어요.':'전체 소리를 껐어요.');});}
function back(){if(document.querySelector('dialog[open]')){document.querySelector('dialog[open]').close();return;}if(activeRoute.startsWith('activity/'))go('facility/'+Math.floor(Number(activeRoute.split('/')[1])/2));else if(activeRoute.startsWith('facility/')||activeRoute==='ending')go('map');else go('home');}
function go(route){
 welcomeCleanup(); welcomeCleanup = () => {};
 if(!/^(home|map|ending|facility\/[0-4]|activity\/[0-9])$/.test(route))route='home';
 if(route.startsWith('facility/')&&!stageOpen(state,Number(route.split('/')[1]))){announce('먼저 앞 연구를 마쳐 주세요.');route='map';}
 if(route.startsWith('activity/')&&!activityOpen(state,Number(route.split('/')[1]))){announce('앞 활동의 기록이 필요해요. 먼저 연구 기록을 모아 주세요.');route='map';}
 if(route==='ending'&&!certificateEligible(state)){announce('열 가지 활동의 실제 연구 기록이 모이면 최종 보고를 열 수 있어요.');route='map';}
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());cleanup();cleanup=()=>{};activeRoute=route;state.route=route;if(route.startsWith('activity/'))resumeActivity=Number(route.split('/')[1]);save();
 if(location.hash.slice(1)!==route)history.pushState(null,'','#'+route);
 if(route==='home')home();else if(route==='map')map();else if(route.startsWith('facility/'))facility(Number(route.split('/')[1]));else if(route.startsWith('activity/'))activity(Number(route.split('/')[1]));else ending();
 teacherDock();wireHud();app.querySelector('h1')?.setAttribute('tabindex','-1');app.querySelector('h1')?.focus({preventScroll:true});
}
// Teacher preview: while every stage is unlocked, step through the ten activities without solving them.
function teacherStep(dir){
 const [kind,n]=activeRoute.split('/'),id=Number(n);
 if(kind==='activity'){const i=id+dir;return i<0||i>9?'map':'activity/'+i;}
 if(kind==='facility')return dir>0?'activity/'+id*2:id===0?'map':'activity/'+(id*2-1);
 if(dir<0)return null;const resume=resumeRoute();return resume.startsWith('activity/')?resume:'activity/0';
}
function teacherName(route){if(!route?.startsWith('activity/'))return '연구기지 지도';const i=Number(route.split('/')[1]);return `${i+1}/10 · ${stages[Math.floor(i/2)].activities[i%2]}`;}
function teacherDock(){
 if(!state.adminUnlocked||!/^(map|facility|activity)/.test(activeRoute))return;
 const prev=teacherStep(-1),next=teacherStep(1),screen=app.querySelector('.screen');
 const pad=`<div class="teacher-pad" role="group" aria-label="교사용 단계 이동"><span class="teacher-badge">교사 미리보기</span><button class="teacher-arrow" data-teacher="-1" aria-label="이전 단계: ${teacherName(prev)}" ${prev?'':'disabled'}>${icon('back')}</button><span class="teacher-where">${activeRoute.startsWith('activity/')?teacherName(activeRoute):activeRoute==='map'?'연구기지 지도':stages[Number(activeRoute.split('/')[1])].name}</span><button class="teacher-arrow" data-teacher="1" aria-label="다음 단계: ${teacherName(next)}">${icon('arrow')}</button><kbd class="teacher-keys">Shift + ← →</kbd></div>`;
 const skip=`<button class="teacher-skip" data-teacher="1"><span><small>조작 없이 바로 이동</small>${next==='map'?'지도로 돌아가기':'다음 단계: '+esc(teacherName(next).split(' · ')[1])}</span>${icon('skip')}</button>`;
 if(activeRoute==='map'){app.querySelector('.map-stack-left').insertAdjacentHTML('afterbegin',pad);app.querySelector('.map-stack-right').insertAdjacentHTML('afterbegin',skip);}
 else{screen.classList.add('teacher-on');screen.insertAdjacentHTML('beforeend',`<nav class="teacher-dock" aria-label="교사용 빠른 이동">${pad}${skip}</nav>`);}
 app.querySelectorAll('[data-teacher]').forEach(b=>b.onclick=()=>teacherMove(Number(b.dataset.teacher)));
}
function teacherMove(dir){const route=teacherStep(dir);if(!route)return;go(route);announce(`교사 미리보기 · ${teacherName(route)}로 이동했어요.`);}
document.addEventListener('keydown',e=>{if(!state.adminUnlocked||document.querySelector('dialog[open]')||e.target.closest?.('input,textarea,select,[contenteditable="true"]')||!/^(map|facility|activity)/.test(activeRoute))return;const dir=e.key==='PageDown'||(e.shiftKey&&e.key==='ArrowRight')?1:e.key==='PageUp'||(e.shiftKey&&e.key==='ArrowLeft')?-1:0;if(!dir)return;e.preventDefault();teacherMove(dir);});
function resumeRoute(){
 const current=state.records[resumeActivity];
 if(Number.isInteger(resumeActivity)&&activityOpen(state,resumeActivity)&&current&&!current.example&&current.workComplete!==true&&(!current.done||current.workComplete===false))return 'activity/'+resumeActivity;
 const next=Array.from({length:10},(_,i)=>i).find(i=>!state.completed.includes(i)&&activityOpen(state,i));
 if(next!==undefined)return 'activity/'+next;
 return certificateEligible(state)?'ending':'map';
}
function home(){
 const begun=Object.keys(state.records).length>0;
 const restored=stages.filter(s=>chapterDone(state,s.id)).length;
 app.innerHTML=`<section class="screen home-screen"><img class="home-art" src="${asset('home')}" alt="강과 초록 도시를 바라보는 따뜻한 기후 연구실"><div class="home-copy"><span class="home-tag">${icon('leaf')} 작은 발견이 모여, 더 나은 내일로</span><h1 class="home-title"><img class="home-logo" src="${asset('logo-title')}" alt="기후 미래 작전실"></h1><p class="hero-subtitle">관측하고, 실험하고, 도시를 설계해요.<br><strong>잎새·물방울과 함께 더 안전한 미래 도시를 만들어 봐!</strong></p><div class="hero-actions"><button class="button gold" id="start">${begun?'탐구 이어하기':'연구 시작하기'} ${icon('arrow')}</button><button class="button ghost" id="mission-story">${icon('book')} 어떤 모험인가요?</button></div>${begun?`<div class="home-progress" aria-label="완료한 연구 ${state.completed.length}개, 복구한 시설 ${restored}곳"><span class="home-progress-bar"><i style="width:${state.completed.length*10}%"></i></span><span>연구 ${state.completed.length} / 10 · 시설 복구 ${restored} / 5</span></div>`:''}</div><div class="home-cast" aria-hidden="true"><p class="home-bubble">${begun?'다음 연구 기록도 같이 모아 보자!':'같이 기후 단서를 찾아보자!'}</p><img class="home-squirrel" src="${asset('home-squirrel')}" alt=""><img class="home-otter" src="${asset('home-otter')}" alt=""></div>${hud(true)}</section>`;
 welcomeCleanup=mountWelcomeVoice(app.querySelector('.home-copy'),{caption:'기후 연구기지에 온 걸 환영해! 날씨와 기후의 차이를 알아보고, 관찰한 자료를 바탕으로 지구를 지킬 실천 방법을 찾아보자.',isMuted:()=>!audio.settings.sfx,duck:value=>audio.quiet(value)});
 app.querySelector('#start').onclick=()=>{if(!state.introSeen)story(()=>{state.introSeen=true;save();go('map');});else go(resumeRoute());};
 app.querySelector('#mission-story').onclick=()=>story();
}
function map(){app.innerHTML=`<section class="screen map-screen"><div id="map-host"></div>${hud()}</section>`;cleanup=mountMap(app.querySelector('#map-host'),{state,save,go,icon,announce});}
function facility(id){
 const s=stages[id];
 app.innerHTML=`<section class="screen facility-screen"><img class="facility-art" src="${asset(s.background)}" alt="${s.name}의 2D 연구 장면"><div class="facility-copy"><span class="eyebrow">${s.badge}의 연구 의뢰</span><h1>${s.name}</h1><p>${s.subtitle}</p><div class="facility-reward">${icon('book')}<span>모을 기록 <strong>${s.reward}</strong></span></div></div><div class="facility-activities">${s.activities.map((name,j)=>{const i=id*2+j,done=state.completed.includes(i),open=activityOpen(state,i);return `<button class="activity-card ${done?'done':''} ${open?'':'locked'}" data-activity="${i}" ${!open?'disabled':''}><span class="activity-card-visual">${artImage(chapterArt[id],'chapter-art',true)}<span class="activity-card-state">${icon(done?'check':open?j===0?s.icon:'book':'lock')}</span></span><span class="eyebrow">${j===0?'먼저 탐구해요':'기록을 이어 써요'} · ${s.counts[j]}</span><h2>${name}</h2><p>${done?'연구 완료 · 다시 탐구할 수 있어요':open?'눌러서 연구를 시작해요':'앞 활동의 기록을 먼저 모아 주세요'}</p><span class="card-go">${done?'다시 살펴보기':'연구하러 가기'} ${icon('arrow')}</span></button>`;}).join('')}</div><button class="guide-character" aria-label="${id===2||id===4?'물방울':'잎새'}의 도움말"><img src="${asset(id===2||id===4?'otter':'squirrel')}" alt=""><span>…</span></button><div class="facility-help" hidden></div>${hud()}</section>`;
 app.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>go('activity/'+b.dataset.activity));
 const clips=s.activities.map((name,j)=>({name,index:id*2+j})).filter(c=>state.completed.includes(c.index));
 if(clips.length){app.querySelector('.facility-activities').insertAdjacentHTML('beforeend',`<nav class="facility-clips" aria-label="완료한 탐구의 개념 영상">${clips.map((c,j)=>`<button class="button secondary" data-clip="${c.index}">${icon('play')} ${j===0?'첫 탐구':'다음 탐구'} 개념 영상</button>`).join('')}</nav>`);app.querySelectorAll('[data-clip]').forEach(b=>b.onclick=()=>openConcept({index:+b.dataset.clip,dialog,audio,icon,next:()=>{},label:'시설로 돌아가기'}));}
 const help=app.querySelector('.facility-help');app.querySelector('.guide-character').onclick=()=>{help.hidden=!help.hidden;help.textContent=`${s.subtitle}! 연구 카드를 순서대로 눌러 시작해 봐. 활동 중에 내 그림을 누르면 힌트를 볼 수 있어.`;};
}
function activity(index){
 const s=stages[Math.floor(index/2)];
 app.innerHTML=`<section class="screen activity-screen"><img class="scene-bg" src="${asset(s.background)}" alt=""><div id="activity-host"></div>${hud()}</section>`;
 const advance=()=>go(state.records[index]?.example?'facility/'+s.id:index%2===0?'activity/'+(index+1):index<9?'facility/'+(s.id+1):certificateEligible(state)?'ending':'map');
 const nextLabel=()=>state.records[index]?.example?'시설로 돌아가기':index%2===0?'다음 연구 시작':index<9?stages[s.id+1].name+'로 이동':certificateEligible(state)?'최종 보고 완성하기':'연구기지 돌아보기';
 const watch=reward=>openConcept({index,dialog,audio,icon,next:advance,label:nextLabel(),reward});
 cleanup=mountActivity(app.querySelector('#activity-host'),{index,state,save,icon,asset,announce:message=>{live.textContent=message;},effect:name=>audio.effect(name),watchConcept:()=>watch(),continueActivity:advance,continueLabel:nextLabel,complete:summary=>{
  const record=state.records[index]??={};record.done=true;state.summaries[index]=summary;
  const example=record.example===true;
  if(!example&&!state.completed.includes(index))state.completed.push(index);
  save();audio.effect();
  const chapter=chapterDone(state,s.id);
  watch(example?'교사용 예시 탐구':chapter?s.badge+' 배지 획득!':'탐구 기록 저장 완료');
 }});
}
function dialog(html,classes=''){
 const opener=document.activeElement,d=document.createElement('dialog');d.className='game-dialog '+classes;d.innerHTML=`<button class="dialog-close icon-button" aria-label="닫기">${icon('close')}</button><div class="dialog-body">${html}</div>`;document.body.append(d);d.querySelector('.dialog-close').onclick=()=>d.close();d.addEventListener('close',()=>{d.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});d.showModal();return d;
}
function story(after){
 const pages=[['끊어진 연구기지를 다시 연결해요','도시를 살펴보던 연구 기록이 흩어졌어요. 무엇이 달라졌는지, 어떤 준비가 필요한지 확인할 단서가 필요해요.','home'],['대원은 생각하고, 잎새는 함께 걸어요','관측하고 → 관련성을 찾고 → 영향을 실험해요. 생활의 선택을 비교한 뒤, 직접 설계한 도시를 시험해요.','village'],['다섯 기록이 모이면, 나만의 최종 보고!','연구를 마칠 때마다 지도 속 시설에 불빛이 켜져요. 기록을 모아 탐구 인증서를 완성해요. 현실의 기후 문제는 우리 실천으로 계속 대응해야 해요.','design']];let n=0;
 const d=dialog('','story-dialog');const body=d.querySelector('.dialog-body');function draw(){const p=pages[n];body.innerHTML=`<img class="story-art" src="${asset(p[2])}" alt=""><span class="eyebrow">잎새가 보낸 연구 의뢰 · ${n+1} / 3</span><h2>${p[0]}</h2><p>${p[1]}</p><button class="button primary story-next">${n===2?'연구기지로 출발!':'다음 이야기'} ${icon('arrow')}</button>`;body.querySelector('button').onclick=()=>{if(n<2){n++;draw();}else{d.close();after?.();}};}draw();
}
function settings(){
 const s=audio.settings;const paras=items=>items.map(t=>`<p>${esc(t)}</p>`).join('');
 const d=dialog(`<h2>연구기지 설정</h2><div class="settings-scroll"><div class="settings-row"><label for="bgm">배경 음악</label><button id="bgm" class="switch" aria-pressed="${s.bgm}">${s.bgm?'켜짐':'꺼짐'}</button></div><div class="settings-row"><label for="sfx">효과음</label><button id="sfx" class="switch" aria-pressed="${s.sfx}">${s.sfx?'켜짐':'꺼짐'}</button></div><label class="volume-label" for="volume">배경 음악 크기 <output>${s.volume}</output></label><input id="volume" type="range" min="0" max="100" step="5" value="${s.volume}" ${s.bgm?'':'disabled'}><button class="button secondary settings-wide" id="replay-story">이 연구를 하는 이유 다시 보기 ${icon('play')}</button><button class="button secondary settings-wide" id="replay-ending" ${state.finalized?'':'disabled'}>엔딩 다시 보기 ${state.finalized?icon('play'):'· 최종 보고 후 열려요'}</button><button class="button secondary settings-wide" id="get-certificate" ${state.finalized?'':'disabled'}>인증서 받기 ${state.finalized?icon('download'):'· 최종 보고 후 열려요'}</button><details class="settings-section"><summary>앱 정보 · 배움과 보상</summary><p><strong>탐구 목적</strong> ${content.purpose}</p><p><strong>미션 보상</strong> ${content.reward}</p><p><strong>남는 배움</strong> ${content.learning}</p><p>기후 미래 작전실 v${VERSION} · 기획·제작: 옐샘 & 아이스크림미디어</p><p>완료한 연구 ${state.completed.length} / 10 · 복구한 시설 ${stages.filter(x=>chapterDone(state,x.id)).length} / 5</p><button class="button secondary" id="export-record">내 탐구 기록 내려받기 ${icon('download')}</button></details><details class="settings-section"><summary>학생용 가이드</summary>${paras(content.student)}</details><details class="settings-section"><summary>교사용 가이드</summary>${paras(content.teacher)}<details><summary>성취기준</summary><p>${content.disclaimer}</p>${paras(content.standards)}</details><details><summary>교사용 도구</summary><p>수업 시연용이에요. 보안 비밀번호가 필요한 기능이 아니에요. 전체 해금은 접근만 열며, 완료·보상·인증서를 자동으로 만들지 않아요.</p><button class="button secondary" id="admin-unlock" aria-pressed="${state.adminUnlocked}">${state.adminUnlocked?'모두 열림 · 다시 누르면 닫기':'모든 단계 한 번에 열기'}</button><p>시연은 임시 사본에서 진행하며 새로고침하거나 다시 누르면 학생의 원래 진행으로 돌아가요. 선행 기록이 없으면 예시 자료라고 표시돼요.</p></details></details><details class="settings-section"><summary>이미지·소리·저작권 고지</summary>${paras(content.credits)}<details><summary>자료 출처 모아 보기</summary>${paras(content.sources)}</details><p>ⓒ 2026 옐샘 & 아이스크림미디어. All rights reserved.</p><p>앱 화면 캡처·자체 제작 일러스트·자체 제작 음원은 무단 복제·재배포·전용·상업적 이용을 금지해요.</p><p>외부 공개자료·폰트의 저작권은 각 원저작자와 소장 기관에 있으며, 각 자료의 공개 라이선스와 이용 조건을 따라요.</p></details></div><div class="dialog-footer"><button class="button secondary" id="reset-progress">탐구 기록 초기화</button><button class="button primary" id="close-settings">닫기</button></div>`,'settings-dialog');
 const sync=()=>{audio.save();app.querySelector('[data-sound]').innerHTML=icon(s.bgm||s.sfx?'sound':'mute');app.querySelector('[data-sound]').setAttribute('aria-label',s.bgm||s.sfx?'전체 소리 끄기':'전체 소리 켜기');};
 for(const key of ['bgm','sfx'])d.querySelector('#'+key).onclick=e=>{s[key]=!s[key];e.currentTarget.setAttribute('aria-pressed',String(s[key]));e.currentTarget.textContent=s[key]?'켜짐':'꺼짐';d.querySelector('#volume').disabled=!s.bgm;sync();};
 d.querySelector('#volume').oninput=e=>{s.volume=Number(e.target.value);d.querySelector('output').textContent=s.volume;sync();};
 d.querySelector('#close-settings').onclick=()=>d.close();d.querySelector('#replay-story').onclick=()=>{d.close();story();};d.querySelector('#replay-ending').onclick=()=>{d.close();go('ending');};d.querySelector('#get-certificate').onclick=downloadCertificate;
 d.querySelector('#admin-unlock').onclick=e=>{if(!studentState){studentState=state;state=structuredClone(state);state.adminUnlocked=true;}else{state=studentState;studentState=null;}e.currentTarget.setAttribute('aria-pressed',String(state.adminUnlocked));e.currentTarget.textContent=state.adminUnlocked?'교사 미리보기 종료':'모든 단계 한 번에 열기';announce(state.adminUnlocked?'교사 미리보기예요. 시연 기록은 학생 기록에 저장되지 않아요.':'학생의 원래 기록으로 돌아왔어요.');d.addEventListener('close',()=>go(state.route),{once:true});};
 d.querySelector('#export-record').onclick=()=>download('기후미래_탐구기록.json',JSON.stringify({game:'기후 미래 작전실',version:VERSION,completed:state.completed,records:state.records,summaries:state.summaries},null,2),'application/json');
 try{const previous=storage.getItem(SAVE_KEY+':before-reset');if(previous){const button=document.createElement('button');button.className='button secondary';button.id='export-reset-backup';button.textContent='초기화 직전 기록 내려받기';button.onclick=()=>download('기후미래_초기화전_기록.json',previous,'application/json');d.querySelector('#export-record').after(button);}}catch{}
 d.querySelector('#reset-progress').onclick=()=>{d.close();confirmReset();};
}
function confirmReset(){const d=dialog('<h2>탐구 기록을 초기화할까요?</h2><p>진행한 활동을 처음부터 시작해요. 초기화 직전 기록 한 개는 이 기기에 보관하며, 다음 초기화 때 교체돼요. 소리 설정은 남아요. 중요한 기록은 먼저 내려받아 주세요.</p><div class="dialog-footer"><button class="button secondary cancel-reset">취소</button><button class="button danger confirm-reset">기록 지우기</button></div>');d.querySelector('.cancel-reset').onclick=()=>d.close();d.querySelector('.cancel-reset').focus();d.querySelector('.confirm-reset').onclick=()=>{if(studentState){announce('교사 미리보기를 종료한 뒤 초기화해 주세요.');return;}if(!loaded.reset().ok){storageNotice('기존 기록 보관 또는 저장을 완료하지 못해 초기화를 취소했어요. 기록을 내려받아 주세요.');return;}cleanup();cleanup=()=>{};state=freshState();resumeActivity=null;d.close();go('home');announce('초기화했어요. 직전 기록은 이 기기에 보관했어요.');};}
function ending(){
 app.innerHTML=`<section class="screen ending-screen"><img class="scene-bg" src="${asset('home')}" alt="다시 연결된 기후 미래 작전실"><div class="ending-copy"><span class="eyebrow">${state.finalized?'연구 대원의 마지막 기록':'다섯 연구 기록, 하나의 대응안'}</span><h1>${state.finalized?'우리의 탐구는 계속돼요':'다섯 연구 기록이 모두 연결됐어요'}</h1><p>${state.finalized?'모형 속 답을 찾았다면, 이제 생활 속 작은 실천을 이어가요.':'모은 발견으로 작전실을 켜고 탐구를 마무리해요.'}</p><div class="report-records" role="list" aria-label="연결한 다섯 연구 기록">${stages.map(s=>`<div class="report-record button secondary connected" data-record="${s.id}" role="listitem">${icon(s.icon)}<span>${s.reward}</span>${icon('check')}</div>`).join('')}</div><div class="final-actions"><button class="button primary" id="finalize">${state.finalized?'탐구 인증서 받기':'작전실 켜고 인증서 받기'} ${icon('trophy')}</button><button class="button secondary" id="back-map">연구기지 돌아보기</button></div></div>${hud()}</section>`;

 app.querySelector('#back-map').onclick=()=>go('map');app.querySelector('#finalize').onclick=()=>{if(!certificateEligible(state))return;state.finalized=true;save();audio.effect();certificate();};
}
function certificate(){if(state.adminUnlocked){announce("교사 미리보기에서는 인증서를 발급하지 않아요.");return;}if(!state.finalized||!certificateEligible(state))return;const d=dialog(`<div class="certificate"><div class="certificate-stamp">${icon('trophy')}</div><span class="eyebrow">기후 미래 작전실</span><h2>기후 미래 탐구 대원 인증서</h2><p>자료로 판단하고, 예상과 결과를 비교하며,<br>생활과 도시의 대응을 설계했어요.</p><div class="certificate-badges">${stages.map(s=>`<span>${icon(s.icon)} ${s.badge}</span>`).join('')}</div><p>내가 남긴 연구 기록</p><p class="certificate-summary">나의 실천: ${esc(researchHighlights()[0])}<br>${esc(researchHighlights()[1])}</p><p class="science-note">게임 속 탐구를 마친 기록이에요. 배운 것은 수업과 생활에서 계속 이어 가요.</p><strong>옐샘 & 아이스크림미디어</strong></div><button class="button primary" id="download-certificate">인증서 내려받기 ${icon('download')}</button>`,'certificate-dialog');d.querySelector('#download-certificate').onclick=downloadCertificate;}
function download(filename,data,type){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function researchHighlights(){const practice=sourceActivityRecord(state.records[7])?.practiceText||'나에게 맞는 생활 실천 약속';const r=sourceActivityRecord(state.records[9]);const result=r?.before?.heat&&r?.after?.heat?`내 도시의 남은 영향: 더위 ${r.before.heat.total} → ${r.after.heat.total}, 빗물 ${r.before.rain.total} → ${r.after.rain.total} (가상 비교 단계)`:'내 도시를 같은 조건에서 다시 시험했어요.';return [practice,result];}
async function downloadCertificate(){if(state.adminUnlocked){announce("교사 미리보기에서는 인증서를 발급하지 않아요.");return;}if(!state.finalized||!certificateEligible(state))return;let fontStyle;try{fontStyle=await certificateFontStyle();}catch{announce('인증서 글꼴을 불러오지 못했어요. 연결을 확인하고 다시 눌러 주세요.');return;}const labels=stages.map((s,i)=>`<text x="600" y="${400+i*48}" text-anchor="middle" font-size="24" fill="#315e4c">${esc(s.badge)} · ${esc(s.reward)}</text>`).join('');download('기후미래_탐구대원_인증서.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">${fontStyle}<rect width="1200" height="900" fill="#f9f5df"/><rect x="32" y="32" width="1136" height="836" rx="35" fill="none" stroke="#2d6857" stroke-width="5"/><circle cx="600" cy="138" r="58" fill="#e6bc58"/><path d="m600 98 12 25 28 4-20 20 5 28-25-13-25 13 5-28-20-20 28-4Z" fill="#fff9e6"/><g font-family="NanumSquareNeo, sans-serif"><text x="600" y="275" text-anchor="middle" font-size="49" font-weight="700" fill="#174f47">기후 미래 탐구 대원 인증서</text><text x="600" y="330" text-anchor="middle" font-size="25" fill="#315e4c">자료를 비교하고, 실험하며, 기후변화 대응을 설계했어요.</text>${labels}<text x="600" y="720" text-anchor="middle" font-size="22" fill="#315e4c">10개 활동 · 다섯 연구 기록 완성</text><text x="600" y="770" text-anchor="middle" font-size="19" fill="#566b57">게임 속 탐구를 마친 기록이에요. 배운 것은 수업과 생활에서 계속 이어 가요.</text><text x="600" y="820" text-anchor="middle" font-size="22" fill="#174f47">ⓒ 2026 옐샘 &amp; 아이스크림미디어</text></g></svg>`,'image/svg+xml');}
window.addEventListener('hashchange',()=>go(location.hash.slice(1)));
window.addEventListener('error',()=>announce('화면을 처리하다 문제가 생겼어요. 홈으로 이동해 다시 이어가 주세요. 저장된 기록은 남아 있어요.'));
if(loaded.error)storageNotice('이전 기록을 읽지 못해 자동 저장을 멈췄어요. 원본은 보존되어 있어요. 현재 활동은 기록 내려받기로 보관해 주세요.');
go(location.hash.slice(1)||state.route);
// The deployment build supplies sw.js; development stays free of stale caches.
if('serviceWorker' in navigator)fetch('/sw.js',{method:'HEAD'}).then(r=>{if(r.ok)navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready).then(()=>announce('이 기기에 탐구 자료를 준비했어요. 연결이 끊겨도 이어갈 수 있어요.')).catch(()=>{});}).catch(()=>{});
