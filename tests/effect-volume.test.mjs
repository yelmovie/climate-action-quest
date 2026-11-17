import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio, MAP_CUES } from '../src/audio.js';
import { createThemeEffects } from '../src/theme-effects.js';

const storage = value => ({ saved: null, getItem(){ return value == null ? null : JSON.stringify(value); }, setItem(_, v){ this.saved = JSON.parse(v); } });

test('effect size is stored apart from the music size and older saves start from their shared value', () => {
 const original = globalThis.document;
 const doc = new EventTarget(); doc.hidden = false; globalThis.document = doc;
 try {
  const fresh = createAudio(storage(null));
  assert.deepEqual([fresh.settings.volume, fresh.settings.sfxVolume], [25, 25]);
  fresh.dispose();
  const older = createAudio(storage({ bgm: true, sfx: false, volume: 40 }));
  assert.deepEqual([older.settings.volume, older.settings.sfxVolume, older.settings.sfx], [40, 40, false]);
  older.dispose();
  const store = storage({ bgm: true, sfx: true, volume: 40, sfxVolume: 70 });
  const split = createAudio(store);
  assert.deepEqual([split.settings.volume, split.settings.sfxVolume], [40, 70]);
  split.settings.volume = 10; split.save();
  assert.deepEqual([store.saved.volume, store.saved.sfxVolume], [10, 70]);
  split.dispose();
 } finally { globalThis.document = original; }
});

test('map cues layer decoded CC0 files at the effect size, fall back to a tone until decoded, and stay silent when muted', async () => {
 const original = { document: globalThis.document, fetch: globalThis.fetch };
 const doc = new EventTarget(); doc.hidden = false; globalThis.document = doc;
 const fetched = [], started = [], oscillators = [];
 globalThis.fetch = async src => { fetched.push(src); return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; };
 const param = () => ({ value: 1, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} });
 globalThis.AudioContext = class {
  constructor(){ this.state = 'running'; this.currentTime = 2; this.destination = {}; }
  createGain(){ return { gain: param(), connect(){}, disconnect(){} }; }
  createOscillator(){ const o = { frequency: param(), connect(){}, disconnect(){}, start(){}, stop(){ this.stopped = true; } }; oscillators.push(o); return o; }
  createBufferSource(){ const s = { playbackRate: param(), connect(g){ this.gain = g.gain; return g; }, disconnect(){}, start(at){ this.at = at; started.push(this); }, stop(){ this.stopped = true; } }; return s; }
  decodeAudioData(){ return Promise.resolve({ duration: .3 }); }
  suspend(){ return Promise.resolve(); } resume(){ return Promise.resolve(); } close(){ return Promise.resolve(); }
 };
 const settings = { muted: false, enabled: true, volume: .5 };
 try {
  const effects = createThemeEffects('climate', () => settings, { samples: MAP_CUES });
  effects.unlock();
  effects.play('map-hit-1');
  assert.equal(started.length, 0); assert.equal(oscillators.length, 1); // not decoded yet: synthesized fallback
  await new Promise(r => setTimeout(r, 0));
  assert.ok(fetched.includes('/assets/audio/sfx/hit-light-01.mp3'));
  effects.play('map-hit-1');
  assert.equal(started.length, 2);
  assert.deepEqual(started.map(s => s.at), [2, 2.08]); // swing on the press, the hit 80 ms later
  assert.deepEqual(started.map(s => s.gain.value), [.55 * .5, .75 * .5]);
  effects.prepare();
  await new Promise(r => setTimeout(r, 0));
  effects.play('map-victory');
  assert.ok(started.slice(0, 2).every(s => s.stopped)); // one cue at a time
  const jingle = started.at(-1);
  assert.ok(jingle.at - 2 + 2.403 / jingle.playbackRate.value < 2.92); // ends before the map finale theme
  const count = started.length;
  settings.muted = true; effects.play('map-contact'); assert.equal(started.length, count);
  settings.muted = false; settings.enabled = false; effects.play('map-contact'); assert.equal(started.length, count);
  settings.enabled = true; settings.volume = 0; effects.play('map-contact'); assert.equal(started.at(-1).gain.value, 0);
  effects.dispose();
 } finally { delete globalThis.AudioContext; Object.assign(globalThis, original); }
});
