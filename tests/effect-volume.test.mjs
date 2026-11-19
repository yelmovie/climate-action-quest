import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio, MAP_CUES, CARD_CUES, STEP_CUES } from '../src/audio.js';
import { existsSync, readFileSync } from 'node:fs';
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
  assert.ok(started.slice(0, 2).every(s => !s.stopped)); // fight and reward cues ring together
  const jingle = started.at(-1);
  assert.ok(jingle.at - 2 + 2.403 / jingle.playbackRate.value < 2.92); // ends before the map finale theme
  const count = started.length;
  settings.muted = true; effects.play('map-contact'); assert.equal(started.length, count);
  settings.muted = false; settings.enabled = false; effects.play('map-contact'); assert.equal(started.length, count);
  settings.enabled = true; settings.volume = 0; effects.play('map-contact'); assert.equal(started.at(-1).gain.value, 0);
  effects.dispose();
 } finally { delete globalThis.AudioContext; Object.assign(globalThis, original); }
});

// A Web Audio stand-in that records every started source, tone and gain ramp.
function audioWorld() {
 const original = { document: globalThis.document, fetch: globalThis.fetch, Audio: globalThis.Audio, AudioContext: globalThis.AudioContext };
 const doc = new EventTarget(); doc.hidden = false; globalThis.document = doc;
 const started = [], tones = [];
 globalThis.fetch = async src => ({ ok: true, arrayBuffer: async () => new TextEncoder().encode(src).buffer });
 const param = () => ({ value: 1, ramps: [], setValueAtTime(){}, linearRampToValueAtTime(v, t){ this.ramps.push([v, t]); }, exponentialRampToValueAtTime(){} });
 const lengths = { 'victory-jingle-01': 2.429, 'step-01': .418, 'step-02': .444 };
 globalThis.AudioContext = class {
  constructor(){ this.state = 'running'; this.currentTime = 5; this.destination = {}; }
  createGain(){ return { gain: param(), connect(){}, disconnect(){} }; }
  createOscillator(){ const o = { frequency: param(), connect(g){ this.gain = g.gain; return g; }, disconnect(){}, start(){}, stop(at){ if (at == null) this.stopped = true; } }; tones.push(o); return o; }
  createBufferSource(){ return { playbackRate: param(), connect(g){ this.gain = g.gain; return g; }, disconnect(){}, start(at){ this.at = at; started.push(this); }, stop(at){ this.stopped = true; this.stopAt = at; } }; }
  decodeAudioData(data){ const src = new TextDecoder().decode(data), name = src.split('/').pop().replace('.mp3', ''); return Promise.resolve({ duration: lengths[name] ?? .3, src }); }
  suspend(){ return Promise.resolve(); } resume(){ return Promise.resolve(); } close(){ return Promise.resolve(); }
 };
 globalThis.Audio = class extends EventTarget { constructor(src){ super(); this.src = src; this.paused = true; this.volume = 1; this.currentTime = 0; } play(){ this.paused = false; return Promise.resolve(); } pause(){ this.paused = true; } };
 return { doc, started, tones, restore(){ for (const key in original) { if (original[key] === undefined) delete globalThis[key]; else globalThis[key] = original[key]; } } };
}
const settle = () => new Promise(r => setTimeout(r, 0));

test('three lanes: interface tones replace one another, fight and reward cues ring together (four at most) and footsteps keep their own voice', async () => {
 const world = audioWorld(), { started, tones } = world;
 try {
  const settings = { muted: false, enabled: true, volume: .25 };
  const effects = createThemeEffects('climate', () => settings, { samples: { ...MAP_CUES, ...CARD_CUES, ...STEP_CUES } });
  effects.unlock(); effects.prepare(); await settle();
  assert.equal(effects.play('map-hit-3'), .3 + .3 / .85); // the cue's length in seconds
  const hit = started.slice();
  effects.play('hint'); effects.play('success');
  assert.equal(tones[0].stopped, true); // a new interface tone replaces the previous one
  assert.ok(hit.every(s => !s.stopped)); // and never the fight cue
  assert.equal(tones[1].gain.ramps[0][0], .28 * .25); // interface tones are audible beside the samples
  assert.equal(effects.step('map-step-1', { gain: .5, rate: 1.05 }), true);
  const first = started.at(-1);
  assert.equal(first.gain.value, .6 * .25 * .5); assert.equal(first.playbackRate.value, 1.05);
  assert.ok(hit.every(s => !s.stopped)); assert.equal(tones.at(-1).stopped, undefined); // a footstep cuts nothing
  effects.play('card-slot'); effects.play('error');
  assert.equal(first.stopped, undefined); // and nothing cuts a footstep
  effects.step('map-step-2');
  assert.deepEqual([first.stopped, first.gain.ramps.at(-1)[0]], [true, 0]); // except the next step, with a short fade
  const second = started.at(-1);
  effects.stopStep();
  assert.ok(second.stopped && second.stopAt < 5.1); // the walker stopped: gone within 0.1 s
  effects.play('card-whoosh'); effects.play('card-reveal');
  assert.ok(hit.every(s => !s.stopped)); // four cues: hit, slot, whoosh, reveal
  effects.play('card-complete');
  assert.ok(hit.every(s => s.stopped)); // a fifth cue lets go of the oldest one
  const count = started.length;
  settings.enabled = false; assert.equal(effects.step('map-step-1'), false); assert.equal(started.length, count);
  settings.enabled = true; settings.muted = true; assert.equal(effects.step('map-step-1'), false);
  settings.muted = false; world.doc.hidden = true; assert.equal(effects.step('map-step-1'), false); assert.equal(started.length, count);
  world.doc.hidden = false; effects.step('map-step-1'); effects.play('map-contact'); effects.stop();
  assert.ok(started.every(s => s.stopped)); // mute, hidden tab and concept films still stop every lane
  effects.dispose();
 } finally { world.restore(); }
});

test('map footsteps alternate two files at 0.15, halve under a voice and follow the effect switch; a jingle holds the map finale', async () => {
 const world = audioWorld(), { started } = world;
 let audio;
 try {
  audio = createAudio({ getItem(){ return null; }, setItem(){} });
  assert.equal(audio.effect('map-appear'), false); assert.equal(audio.step(), false); // no gesture yet: the caller may try again
  audio.unlock(); await settle();
  for (let i = 0; i < 4; i++) audio.step();
  assert.deepEqual(started.map(s => s.buffer.src.split('/').pop()), ['step-01.mp3', 'step-02.mp3', 'step-01.mp3', 'step-02.mp3']);
  assert.ok(started.every(s => Math.abs(s.playbackRate.value - 1) <= .06 + 1e-9));
  assert.ok(new Set(started.map(s => s.playbackRate.value)).size > 1);
  assert.equal(started[0].gain.value, .6 * .25);
  audio.duckVoice(true); audio.step();
  assert.equal(started.at(-1).gain.value, .6 * .25 * .5);
  audio.duckVoice(false);
  const count = started.length;
  audio.settings.sfx = false; audio.save(); assert.equal(audio.step(), false); assert.equal(started.length, count);
  audio.settings.sfx = true; audio.save();
  audio.quiet(true); assert.equal(audio.step(), false); audio.quiet(false);

  assert.equal(audio.celebrating(), false);
  audio.effect('card-complete');
  const jingle = started.at(-1);
  assert.equal(audio.celebrating(), true);
  audio.effect('tap'); audio.step(); audio.mapFinale(true); audio.mapFinale(false);
  assert.equal(jingle.stopped, undefined); // neither a tap, a footstep nor the finale theme cuts the set jingle
  audio.quiet(true); // a concept film mutes new effects and lets a ringing one finish
  assert.equal(jingle.stopped, undefined); assert.equal(audio.effect('success'), undefined);
  audio.quiet(false); audio.settings.sfx = false; audio.save(); // turning effects off stops it, and the wait ends with it
  assert.deepEqual([jingle.stopped, audio.celebrating()], [true, false]);
 } finally { audio?.dispose(); world.restore(); }
});

test('the footstep and stage-open files ship with the app and are credited', () => {
 const root = new URL('../', import.meta.url), credits = readFileSync(new URL('assets/CREDITS.md', root), 'utf8');
 for (const parts of [...Object.values(STEP_CUES), MAP_CUES['map-open']]) for (const { src } of parts) {
  assert.ok(existsSync(new URL('.' + src, root)), src);
  assert.ok(credits.includes('`' + src.split('/').pop() + '`'), src);
 }
});
