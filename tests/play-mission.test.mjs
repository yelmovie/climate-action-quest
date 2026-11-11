import test from 'node:test';import assert from 'node:assert/strict';import{evaluate,freshMissionState,normalizeMissionState,note,items}from'../src/play-mission-model.js';
test('alternative adaptation designs and budget',()=>{assert.equal(evaluate([],0).ok,false);assert.equal(evaluate(['park','park'],0).ok,true);assert.equal(evaluate(['roof','roof','roof'],0).ok,true);assert.equal(evaluate(Array(6).fill('park'),0).ok,false);});
test('adaptation and mitigation are distinct',()=>{assert.equal(evaluate(['park','park','wetland','wetland'],1).ok,true);assert.equal(evaluate(['park','park','wetland','wetland'],2).ok,false);assert.equal(evaluate(['park','park','wetland','wetland','bus'],2).ok,true);assert.equal(evaluate(['bus','solar'],2).ok,false);});

test('grade 3–4 instructions describe practical effects without requiring terminology classification',()=>{
 assert.doesNotMatch(note+evaluate(['park','park','wetland','wetland'],2).summary,/적응|완화/);
 assert.ok(items.every(item=>typeof item.effect==='string'&&item.effect.length>0));
});

test('mission recovery retains valid plans when unrelated fields have invalid types',()=>{
 const state=normalizeMissionState({version:1,level:2,plans:[['park','unknown','bus']],won:'invalid',links:{},history:[null]});
 assert.deepEqual(state.plans[0],['park',null,'bus',null,null,null]);
 assert.equal(state.level,0);
 assert.deepEqual(state.won,[]);
 assert.deepEqual(state.history,[[],[],[]]);
});

test('legacy mission progress keeps completed stages and clamps to available levels',()=>{
 const raw={...freshMissionState(),level:2,won:[0,0,9],history:[[{heat:4,rain:7,carbon:1},{heat:3,rain:5,carbon:2},{heat:-1,rain:500,carbon:'4'}]]};
 const state=normalizeMissionState(raw);
 assert.equal(state.level,1);
 assert.deepEqual(state.won,[0]);
 assert.deepEqual(state.history[0],[{heat:3,rain:5,carbon:2},{heat:0,rain:99,carbon:4}]);
 assert.notEqual(state.plans[0],state.plans[1]);
});
