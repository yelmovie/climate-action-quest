import test from 'node:test';
import assert from 'node:assert/strict';
import { observationChart } from '../src/observation-visuals.js';
import { evidenceSites } from '../src/activity-data.js';
test('every visible observation chart identifies its fictional scale and non-color legend',()=>{
 for(const site of evidenceSites){const html=observationChart(site);assert.match(html,/가상 상대 단계 0~8/);assert.match(html,/줄무늬 · /);assert.match(html,/단색 · /);assert.equal((html.match(/ov-pair/g)||[]).length,4);}
});
test('short weather observations retain short periods rather than multi-year labels',()=>{
 for(const site of evidenceSites.filter(s=>!s.climate)){const html=observationChart(site);for(const period of site.periods)assert.ok(html.includes(period));assert.ok(!html.includes('여러 해'));for(const group of site.groups)assert.ok(html.includes(group));}
});
test('zero observations remain zero instead of acquiring a decorative positive bar',()=>{
 const html=observationChart(evidenceSites.find(s=>s.id==='snow'));
 assert.equal((html.match(/--ov-value:0/g)||[]).length,7);
 assert.ok(html.includes('같은 눈금, 0부터 8까지'));
});
