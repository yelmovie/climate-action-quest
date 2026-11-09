import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {concepts,CONCEPT_DURATION,CONCEPT_CUES} from '../src/concept-data.js';
import {films} from '../films/films.data.mjs';
import {DURATION,CUES} from '../films/kit/kit.mjs';

test('film timeline and in-app captions/scene buttons share one schedule', () => {
  assert.equal(DURATION, CONCEPT_DURATION);
  assert.deepEqual(CUES, CONCEPT_CUES);
  assert.deepEqual(films.map(f => f.id), concepts.map(c => c.id));
  for (const c of concepts) assert.equal(c.cues.length, CONCEPT_CUES.length, c.id);
  // The question bubble leaves before the second caption and the conclusion lands at the third.
  const kit = readFileSync(new URL('../films/kit/kit.mjs', import.meta.url), 'utf8');
  assert.match(kit, /tl\.to\('#bubble',\{opacity:0[^}]*\},5\.0\)/);
  assert.match(kit, /id="big" class="clip big" data-start="10\.2"/);
});

test('every film fits the delivery budget and the player paths', () => {
  let ffprobe=true;try{execFileSync('ffprobe',['-version'],{stdio:'ignore'});}catch{ffprobe=false;}
  for (const {id} of concepts) for (const ext of ['mp4','webm','webp']) {
    const file = new URL(`../assets/concepts/${id}.${ext}`, import.meta.url);
    assert.ok(existsSync(file), `${id}.${ext}`);
    if (ext !== 'webp') assert.ok(statSync(file).size <= 2.5 * 1024 * 1024, `${id}.${ext} ≤ 2.5MB`);
    if (ffprobe && ext !== 'webp') {
      const [w, h, d] = execFileSync('ffprobe', ['-v','error','-select_streams','v:0','-show_entries','stream=width,height:format=duration','-of','csv=p=0:s=,', fileURLToPath(file)]).toString().trim().split(/[\n,]/).map(Number);
      assert.deepEqual([w, h], [1280, 720], `${id}.${ext} size`);
      assert.ok(Math.abs(d - CONCEPT_DURATION) < .1, `${id}.${ext} duration ${d}`);
    }
  }
});
