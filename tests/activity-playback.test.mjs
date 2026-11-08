import test from 'node:test';
import assert from 'node:assert/strict';
import {createActivityPlayback} from '../src/activity-playback.js';

function fakeClock(){
  let time=0,id=0;const jobs=new Map();
  return {
    now:()=>time,
    setTimeout(fn,delay){const key=++id;jobs.set(key,{at:time+delay,fn});return key;},
    clearTimeout(key){jobs.delete(key);},
    advance(ms){
      const end=time+ms;let iterations=0;
      while(true){const next=[...jobs].filter(([,job])=>job.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;
        assert.ok(++iterations<10000,'timer loop must make progress');time=next[1].at;jobs.delete(next[0]);next[1].fn();}
      time=end;
    },
    get pending(){return jobs.size;}
  };
}

test('comparison advances gradually and waits for the learner without selecting an answer',()=>{
  const clock=fakeClock(),actions=[];let step={key:'observe:0',kind:'compare',progress:0,duration:1000};
  const playback=createActivityPlayback({clock,getStep:()=>step,execute:action=>{actions.push(action);step={...step,progress:action.progress};if(action.progress===1)step={key:'question:0',kind:'wait'};}});
  playback.play();clock.advance(450);
  assert.ok(actions.length>1);assert.equal(actions.at(-1).progress,.45);
  clock.advance(550);assert.equal(actions.at(-1).progress,1);assert.equal(playback.snapshot.status,'waiting');assert.equal(playback.snapshot.active,true);assert.equal(clock.pending,0);
  const count=actions.length;clock.advance(5000);assert.equal(actions.length,count);
  step={key:'answer-confirmed:0',kind:'advance',delay:500};playback.refresh();clock.advance(500);
  assert.equal(actions.at(-1).kind,'advance');assert.equal(clock.pending,0);
});

test('changing speed preserves elapsed reading time and dispatches one latest DOM action',()=>{
  const clock=fakeClock(),actions=[];let target='first',step={key:'next:1',kind:'advance',delay:1000};
  const playback=createActivityPlayback({clock,getStep:()=>({...step,target}),execute:action=>{actions.push(action);playback.refresh();}});
  playback.play();clock.advance(400);playback.setSpeed(2);target='replacement';clock.advance(299);assert.equal(actions.length,0);
  clock.advance(1);assert.deepEqual(actions.map(a=>[a.kind,a.target]),[['advance','replacement']]);
  playback.refresh();playback.setSpeed(.5);clock.advance(5000);assert.equal(actions.length,1);assert.equal(clock.pending,0);
});

test('pausing and hiding freeze a pending step, then resume its remaining delay',()=>{
  const clock=fakeClock(),actions=[];
  const playback=createActivityPlayback({clock,getStep:()=>({key:'run:0',kind:'run',delay:1000}),execute:action=>actions.push(action)});
  playback.play();clock.advance(200);playback.pause();clock.advance(5000);assert.equal(actions.length,0);assert.equal(clock.pending,0);
  playback.play();clock.advance(300);playback.setVisible(false);assert.equal(playback.snapshot.status,'hidden');assert.equal(clock.pending,0);
  clock.advance(5000);assert.equal(actions.length,0);playback.setVisible(true);clock.advance(499);assert.equal(actions.length,0);clock.advance(1);assert.equal(actions.length,1);
});

test('refresh replaces a stale scheduled action and repeated play never creates two timers',()=>{
  const clock=fakeClock(),actions=[];let step={key:'old',kind:'run',delay:1000};
  const playback=createActivityPlayback({clock,getStep:()=>step,execute:action=>actions.push(action)});
  playback.play();playback.play();assert.equal(clock.pending,1);clock.advance(300);
  step={key:'new',kind:'advance',delay:500};playback.refresh();assert.equal(clock.pending,1);clock.advance(500);assert.deepEqual(actions.map(a=>a.key),['new']);
});

test('repeated play preserves elapsed time and a comparison completes exactly once',()=>{
  const clock=fakeClock(),actions=[];let step={key:'run',kind:'run',delay:1000};
  const playback=createActivityPlayback({clock,getStep:()=>step,execute:action=>{actions.push(action);if(action.kind==='compare')step={...step,progress:action.progress};}});
  playback.play();clock.advance(400);playback.play();clock.advance(600);assert.equal(actions.length,1);
  step={key:'compare',kind:'compare',progress:0,duration:1001};playback.refresh();clock.advance(1000);
  assert.notEqual(actions.at(-1).progress,1);clock.advance(1);assert.equal(actions.filter(a=>a.progress===1).length,1);
  playback.refresh();clock.advance(2000);assert.equal(actions.filter(a=>a.progress===1).length,1);
});

test('half speed comparison, stop and disposal cancel every future action',()=>{
  const clock=fakeClock(),actions=[];
  const playback=createActivityPlayback({clock,getStep:()=>({key:'compare',kind:'compare',duration:1000}),execute:action=>actions.push(action)});
  playback.setSpeed(.5);playback.play();clock.advance(1000);assert.equal(actions.at(-1).progress,.5);
  playback.stop();const count=actions.length;clock.advance(5000);assert.equal(actions.length,count);assert.equal(clock.pending,0);assert.equal(playback.snapshot.status,'stopped');
  playback.refresh();assert.equal(clock.pending,0);playback.play();assert.equal(clock.pending,1);playback.dispose();assert.equal(clock.pending,0);
  playback.play();playback.refresh();clock.advance(5000);assert.equal(actions.length,count);assert.equal(playback.snapshot.status,'disposed');
});

test('manual comparison progress is respected and invalid speeds cannot arm an action',()=>{
  const clock=fakeClock(),actions=[];let step={key:'compare',kind:'compare',progress:.2,duration:1000};
  const playback=createActivityPlayback({clock,getStep:()=>step,execute:action=>{actions.push(action);step={...step,progress:action.progress};}});
  playback.play();clock.advance(200);assert.equal(actions.at(-1).progress,.4);
  step={...step,progress:.8};playback.refresh();clock.advance(200);assert.equal(actions.at(-1).progress,1);assert.equal(clock.pending,0);
  assert.throws(()=>playback.setSpeed(3),RangeError);assert.equal(clock.pending,0);
});

test('stop steps and execution failure turn automatic playback off',()=>{
  const clock=fakeClock();let step={key:'finished',kind:'stop'};
  const playback=createActivityPlayback({clock,getStep:()=>step,execute:()=>{throw Error('missing button');}});
  playback.play();assert.equal(playback.snapshot.active,false);assert.equal(playback.snapshot.status,'stopped');assert.equal(clock.pending,0);
  step={key:'run',kind:'run',delay:50};playback.play();clock.advance(50);assert.equal(playback.snapshot.status,'error');assert.equal(playback.snapshot.error,'missing button');assert.equal(clock.pending,0);
});
