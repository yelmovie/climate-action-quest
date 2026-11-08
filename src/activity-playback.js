const speeds=[.5,1,2];
const timedKinds=['compare','run','advance'];
const defaults={compare:3000,run:1000,advance:1800};
const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));

/**
 * One controller belongs to one mounted activity, independently of its DOM.
 * getStep(): {key,kind:'compare'|'run'|'advance'|'wait'|'stop',progress?,duration?,delay?}
 * key identifies the logical action and must change when the action changes.
 * execute(step) receives compare.progress in hundredths (0..1), or one run/advance.
 * wait keeps autoplay armed; call refresh() after a learner changes the activity.
 * duration is compare's 1x duration; delay is run/advance's 1x reading delay (ms).
 * Visibility is supplied by the host through setVisible(); there are no globals.
 */
export function createActivityPlayback({getStep,execute,onChange=()=>{},clock={}}){
  if(typeof getStep!=='function'||typeof execute!=='function')throw new TypeError('Playback needs getStep and execute');
  const now=clock.now||(()=>globalThis.performance?.now()??Date.now());
  const later=clock.setTimeout||((fn,delay)=>globalThis.setTimeout(fn,delay));
  const cancel=clock.clearTimeout||((id)=>globalThis.clearTimeout(id));
  let active=false,visible=true,disposed=false,speed=1,current=null,timer=null,lastAt=null,status='paused',error=null;
  let dispatching=false,lastPublished='';
  const snapshot=()=>({active,playing:active&&visible&&status==='playing',waiting:active&&status==='waiting',visible,speed,status,kind:current?.kind??null,key:current?.key??null,progress:current?.delivered??0,error});
  function publish(){const value=snapshot(),signature=JSON.stringify(value);if(signature!==lastPublished){lastPublished=signature;onChange(value);}}
  function clearTimer(){if(timer!==null){cancel(timer);timer=null;}}
  function account(){
    const time=now();
    if(lastAt!==null&&active&&visible&&current&&timedKinds.includes(current.kind)&&!current.completed){
      current.remaining=Math.max(0,current.remaining-Math.max(0,time-lastAt)*speed);
      if(current.kind==='compare')current.progress=1-current.remaining/current.duration;
    }
    lastAt=time;
  }
  function fail(reason){clearTimer();active=false;error=String(reason?.message||reason);status='error';publish();}
  function read(){
    let step;try{step=getStep();}catch(reason){fail(reason);return null;}
    if(!step||!['compare','run','advance','wait','stop'].includes(step.kind)){fail('Unknown playback step');return null;}
    return {...step,key:String(step.key??step.kind)};
  }
  function sync(step){
    if(current?.key===step.key&&current.kind===step.kind){
      current.step=step;
      if(step.kind==='compare'&&Number.isFinite(step.progress)&&Math.abs(clamp(step.progress)-current.delivered)>.0001){
        current.progress=clamp(step.progress);current.delivered=current.progress;
        current.remaining=current.duration*(1-current.progress);current.completed=false;
      }
      return;
    }
    const raw=step.kind==='compare'?step.duration:step.delay;
    const duration=Number.isFinite(raw)&&raw>0?raw:defaults[step.kind]||1;
    const progress=step.kind==='compare'?clamp(step.progress):0;
    current={key:step.key,kind:step.kind,step,duration,remaining:duration*(1-progress),progress,delivered:progress,completed:false};
    lastAt=now();
  }
  function schedule(){
    clearTimer();
    if(disposed)return;
    if(!active){status=status==='error'?'error':status==='stopped'?'stopped':'paused';publish();return;}
    if(!visible){status='hidden';publish();return;}
    if(!current||current.kind==='wait'||current.completed){status='waiting';publish();return;}
    if(current.kind==='stop'){active=false;status='stopped';publish();return;}
    status='playing';lastAt=now();publish();
    const delay=current.kind==='compare'?Math.min(50,current.remaining/speed):current.remaining/speed;
    timer=later(tick,Math.max(0,delay));
  }
  function refresh(){
    if(disposed)return;
    if(dispatching)return;
    account();
    const step=read();if(!step)return;
    sync(step);schedule();
  }
  function deliver(step){
    dispatching=true;
    try{execute(step);}catch(reason){fail(reason);}finally{dispatching=false;}
  }
  function tick(){
    timer=null;if(disposed||!active||!visible)return;
    account();
    const step=read();if(!step)return;
    const changed=current?.key!==step.key||current.kind!==step.kind;
    sync(step);
    if(changed||!timedKinds.includes(current.kind)||current.completed){schedule();return;}
    if(current.kind==='compare'){
      const progress=current.remaining===0?1:Math.min(.99,Math.round(current.progress*100)/100);
      if(progress!==current.delivered||current.remaining===0){
        current.delivered=progress;
        if(current.remaining===0)current.completed=true;
        deliver({...current.step,progress});
      }
    }else if(current.remaining===0){current.completed=true;deliver(current.step);}
    if(!disposed&&active)refresh();
  }
  function play(){if(disposed)return;error=null;if(!active){active=true;lastAt=now();}status='playing';refresh();}
  function pause(){if(disposed)return;account();active=false;clearTimer();status='paused';publish();}
  function stop(){if(disposed)return;account();active=false;clearTimer();current=null;lastAt=null;error=null;status='stopped';publish();}
  function setSpeed(value){
    if(disposed)return;
    if(!speeds.includes(value))throw new RangeError('Playback speed must be 0.5, 1 or 2');
    account();speed=value;schedule();
  }
  function setVisible(value){if(disposed)return;account();visible=!!value;lastAt=now();if(visible&&active)refresh();else schedule();}
  function dispose(){if(disposed)return;clearTimer();active=false;disposed=true;current=null;lastAt=null;status='disposed';publish();}
  publish();
  return {play,pause,toggle(){if(active)pause();else play();},stop,setSpeed,setVisible,refresh,dispose,get snapshot(){return snapshot();}};
}
