import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.js';

test('story music stays under narration and respects modal, mute, hidden and close boundaries', () => {
 const original = { document: globalThis.document, AudioContext: globalThis.AudioContext, setInterval, clearInterval };
 const doc = new EventTarget();
 let modal = true, tick, cleared = false;
 doc.hidden = false;
 doc.querySelector = () => modal ? {} : null;
 globalThis.document = doc;
 globalThis.setInterval = callback => { tick = callback; return 1; };
 globalThis.clearInterval = () => { cleared = true; };
 const oscillators = [], gains = [];
 const param = () => ({ value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){}, setTargetAtTime(value){ this.value = value; } });
 globalThis.AudioContext = class {
  constructor(){ this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  createGain(){ const gain = { gain: param(), connect(){}, disconnect(){} }; gains.push(gain); return gain; }
  createOscillator(){ const oscillator = { frequency: param(), connect(){}, disconnect(){}, start(){ this.started = true; }, stop(){ this.stopped = true; } }; oscillators.push(oscillator); return oscillator; }
  resume(){ return Promise.resolve(); }
  suspend(){ return Promise.resolve(); }
  close(){ return Promise.resolve(); }
 };
 let audio;
 try {
  audio = createAudio({ getItem(){ return null; }, setItem(){} });
  audio.duckVoice(true); // Safe before the first user gesture creates AudioContext.
  audio.unlock();
  tick();
  assert.equal(oscillators.length, 0);
  audio.storyMusic(true);
  tick();
  assert.equal(oscillators.length, 1);
  assert.equal(gains[0].gain.value, .25);
  audio.storyMusic(false);
  assert.equal(oscillators[0].stopped, true);
  tick();
  assert.equal(oscillators.length, 1);
  audio.storyMusic(true);
  audio.settings.bgm = false;
  audio.save();
  tick();
  assert.equal(oscillators.length, 1);
  audio.settings.bgm = true;
  doc.hidden = true;
  doc.dispatchEvent(new Event('visibilitychange'));
  tick();
  assert.equal(oscillators.length, 1);
  doc.hidden = false;
  audio.quiet(true);
  tick();
  assert.equal(oscillators.length, 1);
  audio.quiet(false);
  audio.storyMusic(false);
  audio.duckVoice(false);
  modal = false;
  tick();
  assert.equal(oscillators.length, 2);
  assert.equal(gains[0].gain.value, 1);
 } finally {
  audio?.dispose();
  assert.equal(cleared, true);
  Object.assign(globalThis, original);
 }
});
