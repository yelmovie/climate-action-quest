import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState, normalizeState} from '../src/state.js';
test('legacy saves preserve learning and initialize repair records',()=>{const old=freshState();const before=normalizeState(old);assert.deepEqual(before.mapRepairs,[]);const next=normalizeState({...old,mapRepairs:[0,2,2,4,-1,5,'1',null]});assert.deepEqual(next.mapRepairs,[0,2,4]);delete before.mapRepairs;delete next.mapRepairs;assert.deepEqual(next,before);});
test('completed repair survives serialization without awarding learning',()=>{const s=freshState();s.mapRepairs=[1];assert.deepEqual(normalizeState(JSON.parse(JSON.stringify(s))).mapRepairs,[1]);});

test('city model preserves the selected plots',()=>{const s=freshState();s.mapRepairLayouts={0:{2:0,0:1,1:2}};assert.deepEqual(normalizeState(JSON.parse(JSON.stringify(s))).mapRepairLayouts,s.mapRepairLayouts);});
