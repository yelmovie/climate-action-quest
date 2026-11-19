import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.js';

test('Suno music starts on the first gesture, switches to the final theme and respects ducking, mute, hidden and close boundaries', () => {
 const original = { document: globalThis.document, Audio: globalThis.Audio };
 const doc = new EventTarget();
 doc.hidden = false;
 globalThis.document = doc;
 const players = [];
 globalThis.Audio = class extends EventTarget {
  constructor(src){ super(); this.src = src; this.paused = true; this.currentTime = 0; this.volume = 1; players.push(this); }
  play(){ this.paused = false; return Promise.resolve(); }
  pause(){ this.paused = true; }
 };
 const track = name => players.find(p => p.src.endsWith(name));
 let audio;
 try {
  audio = createAudio({ getItem(){ return null; }, setItem(){} });
  audio.duckVoice(true); // Safe before the first user gesture.
  assert.equal(players.length, 0);
  audio.unlock();
  const main = track('/assets/audio/bgm/main-theme.mp3');
  assert.equal(main.paused, false);
  assert.equal(main.loop, true);
  assert.equal(main.volume, .25 * .25);
  audio.duckVoice(false);
  assert.equal(main.volume, .25);
  audio.quiet(true);
  assert.equal(main.paused, false);
  assert.equal(main.volume, .25 * .25);
  audio.quiet(false);

  audio.music('final');
  const final = track('/assets/audio/bgm/final-theme.mp3');
  assert.equal(main.paused, true);
  assert.equal(final.paused, false);
  assert.equal(final.loop, false);
  final.paused = true; final.dispatchEvent(new Event('ended'));
  assert.equal(final.paused, true); // The final theme plays once;
  assert.equal(main.paused, false); // the main theme then carries on underneath instead of silence.
  assert.equal(main.volume, .25 * 1 * .45);
  audio.duckVoice(true);
  assert.equal(main.volume, .25 * .25 * .45);
  audio.duckVoice(false);
  audio.save();
  assert.deepEqual([final.paused, main.paused, main.volume], [true, false, .25 * 1 * .45]);
  audio.music('main');
  assert.equal(main.paused, false);
  assert.equal(main.volume, .25); // Leaving the ending restores the usual size.

  audio.mapFinale(true);
  assert.equal(main.paused, true);
  assert.equal(final.paused, false);
  assert.equal(final.currentTime, 0);
  final.paused = true; final.dispatchEvent(new Event('ended'));
  assert.deepEqual([main.paused, main.volume], [false, .25 * 1 * .45]); // Staying in the map finale past the theme.
  audio.mapFinale(false);
  assert.equal(final.paused, true);
  assert.equal(main.paused, false);
  assert.equal(main.volume, .25);

  audio.settings.bgm = false;
  audio.save();
  assert.equal(main.paused, true);
  audio.settings.bgm = true;
  audio.save();
  assert.equal(main.paused, false);
  doc.hidden = true;
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(main.paused, true);
  doc.hidden = false;
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(main.paused, false);
 } finally {
  audio?.dispose();
  assert.equal(players.every(p => p.paused), true);
  Object.assign(globalThis, original);
 }
});
