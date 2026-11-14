import { createMapCamera, bindMapCameraPointer, mapLabelGuard } from './map-camera.js';
import { mountMapEncounters } from './map-encounters.js';
import { encounterLook,encounterStage,loadEncounterActor,drawEncounterActor } from './map-encounter-theme.js';
import { buildingReveal, paintRestoredBuildings } from './building-restoration.js';
import {ipsaeWalkFrame} from './characters.js';
import { drawMapSprite } from './map-sprite.js';
import {bindDirectionPad,assistMapStep,MAP_VECTORS} from './map-controls.js';
import {mountRepair} from './map-repair.js';
import {world,nodePoint,projectPath,routeTo,isWalkable,inputVector} from './world.js';
import {stages,chapterDone,stageOpen,certificateEligible} from './state.js';
// Exploration fills the screen; overview contains the entire world. The camera follows the walker at FOLLOW
// times the cover scale; dragging, or hand mode, frees the camera until the walker moves again.
const FOLLOW=1.4;
export function mountMap(host,{state,save,go,icon,announce,tone,talkToIpsae,takeRestorations},[mapArt,sheet,parrot,parrotWalk]){
 const point=projectPath(state.position),p={x:point.x,y:point.y},follower={x:p.x-42,y:p.y+12};let route=[],target=null,frame=0,last=0,raf=0,direction=0,birdDirection=0,birdDistance=0,birdMoving=false,disposed=false,walk=false,lastSave=0;
 let padKey=null;const held=new Set(),trail=[{...follower},{...p}],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const next=stages.find(s=>!chapterDone(state,s.id));
 host.innerHTML=`<div id="map-viewport" tabindex="0" aria-label="연구기지 지도. 방향키 또는 WASD로 걸어요. 길이나 건물 이름을 누르면 길을 따라 이동해요. 지도를 끌면 주변을 둘러볼 수 있어요."><div class="map-world"><canvas class="map-actors" width="1672" height="941" aria-hidden="true"></canvas><div class="map-light-layer" aria-hidden="true"></div>${world.buildings.map(b=>{const s=stages[b.stage],open=s?stageOpen(state,b.stage):certificateEligible(state),completed=s?chapterDone(state,b.stage):state.finalized;return `<button class="map-node ${completed?'restored':!open?'locked':next?.id===b.stage?'current':''}" data-building="${b.stage}" style="left:${b.label.x/world.width*100}%;top:${b.label.y/world.height*100}%" aria-label="${s?`${b.stage+1}번 ${s.name}`:'중앙 작전실'}${completed?', 복구 완료':!open?', 먼저 앞 연구를 마쳐요':''}"><span class="map-label"><svg class="map-lock-icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="${open?'M8 11V7a4 4 0 0 1 7.5-2':'M8 11V7a4 4 0 0 1 8 0v4'}"/></svg>${s?.name||'중앙 작전실'}</span><span class="map-pin" aria-hidden="true"></span></button>`;}).join('')}<button class="companion-talk" aria-label="앵무새 잎새에게 다음 할 일 물어보기" aria-haspopup="dialog"><span>…</span></button></div></div><div class="map-bottom"><div class="map-stack map-stack-left"><div class="map-navigation"><div class="dpad" role="group" aria-label="이동 방향판"><button data-key="ArrowUp" aria-label="위로 이동">${icon('chevron')}</button><button data-key="ArrowLeft" aria-label="왼쪽 이동">${icon('back')}</button><button data-key="ArrowDown" aria-label="아래로 이동">${icon('chevron')}</button><button data-key="ArrowRight" aria-label="오른쪽 이동">${icon('arrow')}</button></div></div></div><div class="map-stack map-stack-right"><section class="map-next-card" aria-label="다음 목적지"><div class="map-tools"><button class="map-tool" data-map-overview aria-pressed="false"></button><button class="map-tool" data-map-hand aria-label="손으로 지도 이동" title="손으로 지도 이동" aria-pressed="false">${icon('hand')}</button></div><button class="button gold map-action${state.finalized?'':' map-next-cue'}">${next?`${next.name}로 가기`:state.finalized?'작전실 가기':'보고하러 가기'} ${icon('arrow')}</button></section></div></div>`;
 if(state.adminUnlocked||stages.some(s=>chapterDone(state,s.id)))mountRepair(host,{state,save,kind:'city',preview:state.adminUnlocked,available:stages.filter(s=>chapterDone(state,s.id)).map(s=>({id:s.id,label:s.name}))});
 const viewport=host.querySelector('#map-viewport'),layer=host.querySelector('.map-world'),canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),talk=host.querySelector('.companion-talk'),overviewButton=host.querySelector('[data-map-overview]'),handButton=host.querySelector('[data-map-hand]');
 mapArt.className='map-art';mapArt.alt='숲과 강 사이 여섯 연구 시설이 흙길과 다리로 연결된 마을';layer.prepend(mapArt);
 const nextButton=host.querySelector('.map-action'),nextLabel=nextButton.innerHTML;
 const restoredIds=takeRestorations?.()??[],reveal=buildingReveal(reduced,restoredIds);
 let lastRestoration=null;
 const camera=createMapCamera({width:world.width,height:world.height,baseZoom:FOLLOW,focusY:.46,reduced:()=>matchMedia('(prefers-reduced-motion: reduce)').matches});
 const blocked=()=>disposed||document.hidden||!!document.querySelector('dialog[open]')||!!host.querySelector('.map-repair[open]');
 const encounterStages=state.adminUnlocked?[]:stages.flatMap(s=>{
  const b=world.buildings.find(b=>b.stage===s.id),anchor=nodePoint(b.node);
  const node=world.edges.find(([from,to])=>from===b.node||to===b.node).find(point=>point!==b.node);
  const p=nodePoint(node),d=Math.hypot(p.x-anchor.x,p.y-anchor.y)||1;
  const next=world.edges.find(edge=>edge.includes(node)&&!edge.includes(b.node))?.find(point=>point!==node);
  const k=next===undefined?p:nodePoint(next),dl=Math.hypot(k.x-p.x,k.y-p.y)||1;
  const depth=72,fromDoor=Math.min(1,depth/d),onNext=Math.min(1,Math.max(0,depth-d)/dl);
  return chapterDone(state,s.id)?[encounterStage(s.id,s.id,s.name,{x:anchor.x+(p.x-anchor.x)*fromDoor+(k.x-p.x)*onNext,y:anchor.y+(p.y-anchor.y)*fromDoor+(k.y-p.y)*onNext})]:[];
 });
 const encounters=mountMapEncounters({requiredFoes:5,host:viewport,clearStage:()=>restoredIds.filter(id=>id!==5).at(-1),stages:encounterStages,progress:state.mapHits,onSave:patch=>{state.mapHits={...state.mapHits,...patch};save();},blocked,reduced:()=>reduced,tone,reach:92,contact:23,...encounterLook});
 const heroPose=encounterStages.length?loadEncounterActor('hero'):null,allyPose=encounterStages.length?loadEncounterActor('ally'):null;
 const guardLabels=mapLabelGuard(viewport,'.map-node','.screen-hud button,.map-bottom button,.map-repair summary');
 let lastScale=0,lastTransform='';
 const cameraEvents=new AbortController(),{signal}=cameraEvents;
 const landscape=document.createElement('canvas');landscape.width=world.width;landscape.height=world.height;const land=landscape.getContext('2d');
 const isRestored=id=>id===5?state.finalized:chapterDone(state,id);
 function apply(){
  if(lastScale!==camera.scale){guardLabels();lastScale=camera.scale;layer.style.width=world.width*lastScale+'px';layer.style.height=world.height*lastScale+'px';}
  const transform=`translate3d(${camera.x}px,${camera.y}px,0)`;
  if(transform!==lastTransform){layer.style.transform=transform;lastTransform=transform;guardLabels();}
 }
 function tools(){
  const overview=camera.mode==='overview',hand=camera.mode==='hand';
  viewport.classList.toggle('overview',overview);overviewButton.innerHTML=icon(overview?'locate':'fit');
  overviewButton.setAttribute('aria-label',overview?'이전 지도 보기':'지도 전체 보기');overviewButton.title=overviewButton.getAttribute('aria-label');
  overviewButton.setAttribute('aria-pressed',String(overview));handButton.setAttribute('aria-pressed',String(hand));viewport.classList.toggle('hand-on',hand);
 }
 function follow(){clearPointer();if(camera.mode!=='follow'){camera.follow(p);apply();tools();}}
 overviewButton.onclick=()=>{if(blocked())return;clearPointer();cancelRoute();camera.overview(p);apply();tools();announce(camera.mode==='overview'?'지도 전체를 한눈에 보여 줘요.':'이전 시점으로 돌아왔어요.');};
 handButton.onclick=()=>{if(blocked())return;clearPointer();cancelRoute();camera.hand(p);apply();tools();announce(camera.mode==='hand'?'손으로 밀기를 켰어요. 지도를 끌어서 둘러봐요.':'손으로 밀기를 껐어요. 길을 누르면 걸어가요.');};
 if(restoredIds.includes(5))camera.overview(p);
 tools();
 function sprite(pos,row,col,size){if(!sheet.complete||!sheet.naturalWidth)return;const sw=sheet.naturalWidth/4,sh=sheet.naturalHeight/8;drawMapSprite(ctx,sheet,Math.floor(col*sw),Math.floor(row*sh),Math.floor(sw),Math.floor(sh),pos.x-size/2,pos.y-size*.88,size,size);}
 function drawParrot(pos){
  if(!parrot.complete||!parrot.naturalWidth)return;
  const h=64,{width:sw,height:sh,count,rows,footX,footY}=ipsaeWalkFrame;
  ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(birdDirection===1?-1:1,1);
  // The asymmetric tail lies left of the feet, so mirror around the feet, not the image center.
  if(parrotWalk?.complete&&parrotWalk.naturalWidth===sw*count&&parrotWalk.naturalHeight===sh*rows){
   const row=birdDirection===0?1:birdDirection===3?2:0,cell=birdMoving&&!reduced?[1,2,3,2][Math.floor(birdDistance/12)%4]:0;
   const height=h/.86,width=height*sw/sh;
   drawMapSprite(ctx,parrotWalk,cell*sw,row*sh,sw,sh,-width*footX,-height*footY,width,height,true);
  }else{
   const w=h*parrot.naturalWidth/parrot.naturalHeight;
   drawMapSprite(ctx,parrot,0,0,parrot.naturalWidth,parrot.naturalHeight,-w*.62,-h*.975,w,h);
  }
  ctx.restore();
 }
 function draw(time){ctx.clearRect(0,0,world.width,world.height);{const progress=reveal(time),key=restoredIds.map(id=>progress(id)).join('|');
  if(key!==lastRestoration){land.clearRect(0,0,world.width,world.height);paintRestoredBuildings(land,{width:world.width,height:world.height,completed:isRestored,progress});lastRestoration=key;}
  ctx.drawImage(landscape,0,0);}
  if(route.length){ctx.strokeStyle='#ffefae';ctx.setLineDash([3,13]);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x,p.y);route.forEach(q=>ctx.lineTo(q.x,q.y));ctx.stroke();ctx.setLineDash([]);}
  const reactions=encounters.update({hero:p,ally:follower,project:q=>({x:q.x*camera.scale+camera.x,y:q.y*camera.scale+camera.y}),scale:camera.scale,now:time});
  const col=walk&&!reduced?Math.floor(time/140)%4:0;const actors=[{p:follower,bird:true,size:64},{p,row:direction,size:91}].sort((a,b)=>a.p.y-b.p.y);actors.forEach(a=>{ctx.fillStyle='rgba(17,59,48,.18)';ctx.beginPath();ctx.ellipse(a.p.x,a.p.y-3,a.size*.2,6,0,0,Math.PI*2);ctx.fill();if(a.bird){if(!drawEncounterActor(ctx,allyPose,a.p,a.size,reactions.ally))drawParrot(a.p);}else if(!drawEncounterActor(ctx,heroPose,a.p,a.size,reactions.hero,{native:-1}))sprite(a.p,a.row,col,a.size);});talk.style.left=`${follower.x/world.width*100}%`;talk.style.top=`${(follower.y-67)/world.height*100}%`;}
 function busy(active){
  if(active===nextButton.hasAttribute('aria-busy'))return;
  if(active){nextButton.setAttribute('aria-busy','true');nextButton.setAttribute('aria-disabled','true');nextButton.textContent='길을 따라 이동 중…';}
  else{nextButton.removeAttribute('aria-busy');nextButton.removeAttribute('aria-disabled');nextButton.innerHTML=nextLabel;}
 }
 function cancelRoute(){clear();route=[];target=null;busy(false);}
 function enter(id){cancelRoute();if(id===5){if(certificateEligible(state)){go('ending');}else announce('다섯 연구 기록을 모으면 최종 보고를 할 수 있어요. 관리자 열기는 탐구 완료가 아니에요.');return;}
  if(!stageOpen(state,id)){announce(`먼저 ${stages[id-1].name}의 연구를 마쳐 주세요.`);return;}state.position={...p};save();go('facility/'+id);}
 function destination(id,guided=false){
  if(disposed||document.hidden||document.querySelector('dialog[open]')||host.querySelector('.map-repair[open]')||(guided&&nextButton.hasAttribute('aria-busy')))return;
  cancelRoute();
  if(id===5?!certificateEligible(state):!stageOpen(state,id)){enter(id);return;}
  const building=world.buildings.find(b=>b.stage===id);if(!building)return;
  target=id;follow();
  const door=nodePoint(building.node);route=routeTo(p,door);
  if(!route.length){cancelRoute();announce('이곳까지 가는 길을 찾지 못했어요.');return;}
  if(guided)busy(true);
  if(reduced){p.x=door.x;p.y=door.y;enter(id);return;}
  announce(`${stages[id]?.name||'중앙 작전실'}로 길을 따라 이동해요.`);
  viewport.focus({preventScroll:true});
 }
 host.querySelectorAll('[data-building]').forEach(button=>button.onclick=()=>destination(Number(button.dataset.building)));
 nextButton.onclick=()=>destination(next?.id??5,true);
 talk.onclick=()=>{cancelRoute();talk.focus({preventScroll:true});talkToIpsae(next?.id??5);};
 function walkTo(e){cancelRoute();const r=viewport.getBoundingClientRect(),q=camera.world({x:e.clientX-r.left,y:e.clientY-r.top}),near=projectPath(q);
  if(near.distance>90){announce('흙길이나 건물 이름을 눌러 주세요. 강과 건물 안은 걸을 수 없어요.');return;}
  follow();route=routeTo(p,near);
 }
 const clearPointer=bindMapCameraPointer(viewport,{camera,player:()=>p,blocked,signal,control:el=>!!el.closest('.companion-talk'),onStart:cancelRoute,
  onMove(){apply();tools();},onTap(e){if(camera.mode!=='hand'&&!e.target.closest('button'))walkTo(e);}
 });
 function clear(){held.clear();padKey=null;walk=false;}
 const keydown=e=>{if(e.defaultPrevented)return;if(blocked()){cancelRoute();return;}if(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;if(/^(Arrow(Up|Down|Left|Right)|Key[WASD])$/.test(e.code)){e.preventDefault();if(route.length||target!==null)cancelRoute();follow();held.add(e.code);}if(e.code==='Enter'||e.code==='Space'){if(e.target.closest('button'))return;e.preventDefault();const b=world.buildings.find(b=>Math.hypot(nodePoint(b.node).x-p.x,nodePoint(b.node).y-p.y)<48);if(b)enter(b.stage);}};
 const keyup=e=>held.delete(e.code);
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',cancelRoute);document.addEventListener('visibilitychange',cancelRoute);
 const directionPad=bindDirectionPad(host,'[data-key]',b=>b.dataset.key.slice(5).toLowerCase(),{blocked,
  press:d=>{if(route.length||target!==null)cancelRoute();follow();padKey='Arrow'+d[0].toUpperCase()+d.slice(1);},release:()=>{padKey=null;},
  tap:d=>{cancelRoute();follow();const v=MAP_VECTORS[d],next=assistMapStep(p,{x:v.x*10,y:v.y*10},isWalkable);p.x=next.x;p.y=next.y;}
 });
 const resize=()=>{camera.resize(viewport.clientWidth,viewport.clientHeight,p);apply();guardLabels();};const observer=new ResizeObserver(resize);observer.observe(viewport);
 function tick(time){if(disposed)return;const dt=Math.min(.04,(time-last)/1000||0);last=time;walk=false;birdMoving=false;if(!document.hidden&&!document.querySelector('dialog[open]')&&!host.querySelector('.map-repair[open]')){let v=inputVector(new Set([...held,...(padKey?[padKey]:[])]));if(!v.x&&!v.y&&route.length){const q=route[0],d=Math.hypot(q.x-p.x,q.y-p.y);if(d<5){route.shift();if(!route.length&&target!==null){const t=target;enter(t);if(disposed)return;}}else{v={x:(q.x-p.x)/d,y:(q.y-p.y)/d};}}
 if(v.x||v.y){const speed=200*dt,q=assistMapStep(p,{x:v.x*speed,y:v.y*speed},isWalkable);walk=Math.hypot(q.x-p.x,q.y-p.y)>.01;p.x=q.x;p.y=q.y;direction=Math.abs(v.x)>Math.abs(v.y)?v.x>0?2:1:v.y>0?0:3;
 if(!trail.length||Math.hypot(p.x-trail.at(-1).x,p.y-trail.at(-1).y)>7)trail.push({...p});while(trail.length>8)trail.shift();
 if(time-lastSave>1200){state.position={...p};save();lastSave=time;}}
 const f=trail[0],dx=f.x-follower.x,dy=f.y-follower.y,k=Math.min(1,dt*9),step=Math.hypot(dx,dy)*k;
 if(step>.16)birdDirection=Math.abs(dx)>Math.abs(dy)?dx>0?2:1:dy>0?0:3;
 follower.x+=dx*k;follower.y+=dy*k;birdMoving=step>.16;birdDistance=(birdDistance+step)%48;
 }else{cancelRoute();}if(!blocked())camera.update(p,dt);apply();draw(time);frame++;raf=requestAnimationFrame(tick);}
 resize();raf=requestAnimationFrame(tick);
 return()=>{disposed=true;encounters.destroy();cameraEvents.abort();directionPad.destroy();cancelAnimationFrame(raf);observer.disconnect();clear();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',cancelRoute);document.removeEventListener('visibilitychange',cancelRoute);state.position={...p};save();};
}
