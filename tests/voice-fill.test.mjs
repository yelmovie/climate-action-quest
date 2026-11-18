import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {voiceLines} from '../src/voice-lines.js';
test('2026-11-18 ElevenLabs 음성은 출처·SHA·화면 글자가 일치하고 모든 대사 파일이 있다',()=>{
 const fill=JSON.parse(readFileSync(new URL('../docs/VOICE-FILL-20261118.json',import.meta.url),'utf8'));
 for(const line of fill.lines){const v=voiceLines[line.key];assert.ok(v,line.key);assert.equal(v.text,line.text,line.key);assert.equal(v.target,line.file,line.key);
  assert.equal(createHash('sha256').update(readFileSync(new URL('../'+line.file,import.meta.url))).digest('hex'),line.sha256,line.key);}
 for(const [id,v] of Object.entries(voiceLines))readFileSync(new URL('../'+v.target,import.meta.url)),assert.ok(v.text,id);
 const texts=Object.values(voiceLines).map(v=>v.text);assert.equal(new Set(texts).size,texts.length);
});
