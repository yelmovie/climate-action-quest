/** Pointer drag with a tap/keyboard equivalent provided by each activity.
 * Nothing is committed until a valid drop. Cancellation just removes the ghost.
 */
export function bindManipulation(host,{signal,drop}){
 let drag=null,ghost=null;
 const clear=()=>{ghost?.remove();ghost=null;host.querySelectorAll('.drop-ready').forEach(e=>e.classList.remove('drop-ready'));if(drag){try{host.releasePointerCapture(drag.pointer);}catch{}}drag=null;};
 host.addEventListener('pointerdown',e=>{
  host.dataset.suppressClickUntil='0';
  const source=e.target.closest('[data-drag]');if(!source||source.disabled||e.button!==0||!e.isPrimary)return;
  if(source!==e.target.closest('button')&&e.target.closest('button,input,a,summary'))return;
  drag={source,pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
 },{signal});
 host.addEventListener('pointermove',e=>{
  if(!drag||drag.pointer!==e.pointerId)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<9)return;
  e.preventDefault();
  if(!drag.moved){drag.moved=true;host.setPointerCapture(e.pointerId);ghost=document.createElement('div');ghost.className='drag-ghost';ghost.textContent=drag.source.querySelector('strong')?.textContent||drag.source.textContent;ghost.setAttribute('aria-hidden','true');document.body.append(ghost);host.querySelectorAll('[data-drop]').forEach(el=>el.classList.add('drop-ready'));}
  ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';
 },{signal,passive:false});
 host.addEventListener('pointerup',e=>{
  if(!drag||drag.pointer!==e.pointerId)return;
  const {moved,source}=drag,target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]');
  clear();if(!moved)return;
  e.preventDefault();host.dataset.suppressClickUntil=performance.now()+400;
  if(target&&host.contains(target)&&!target.disabled)drop(source.dataset.drag,target);
 },{signal});
 host.addEventListener('click',e=>{if(e.isTrusted&&e.detail>0&&performance.now()<Number(host.dataset.suppressClickUntil)){e.preventDefault();e.stopImmediatePropagation();}},{signal,capture:true});
 host.addEventListener('pointercancel',clear,{signal});
 host.addEventListener('lostpointercapture',e=>{if(e.target===host&&drag)clear();},{signal});
 signal.addEventListener('abort',clear,{once:true});
}
