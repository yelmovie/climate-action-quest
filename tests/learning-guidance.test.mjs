import test from 'node:test';
import assert from 'node:assert/strict';
import {activityLearning,activityStandards} from '../src/activity-data.js';
import {activityAction} from '../src/activity-guide.js';

test('each activity has a short concept, a reasoning prompt and an explicit learning bridge',()=>{
  assert.equal(activityLearning.length,10);
  activityLearning.forEach((lesson,index)=>{
    assert.equal(lesson.standard,activityStandards[index].code);
    for(const field of ['key','detail','question','bridge'])assert.ok(lesson[field]?.trim(),`${index} ${field}`);
    assert.ok((lesson.lead+lesson.key+lesson.tail).length<=42,`${index} compact concept`);
  });
  assert.match(activityLearning[1].detail,/하루|한 번/);
  assert.match(activityLearning[2].detail,/연료를 태우면 에너지를 얻어요/);
  assert.match(activityLearning[4].detail,/밀물|파도/);
  assert.match(activityLearning[5].detail,/한 번/);
  assert.match(activityLearning[7].bridge,/직접 실천/);
  assert.match(activityLearning[9].detail,/가상/);
});

test('next actions identify the missing step and exact touch target',()=>{
  assert.match(activityAction(0,{collected:[]}),/손잡이/);
  assert.match(activityAction(0,{collected:['summer'],open:0}),/다음 관측 지점/);
  assert.match(activityAction(1,{checked:false}),/판단/);
  assert.match(activityAction(4,{prediction:[]}),/구역/);
  assert.match(activityAction(4,{prediction:['beach']}),/실험 시작/);
  assert.match(activityAction(5,{order:[0]}),/2장/);
  assert.match(activityAction(5,{order:[2,0,1]}),/빼고|순서/);
  assert.match(activityAction(8,{plan:[],tool:'trees'}),/구역/);
  assert.match(activityAction(8,{plan:['shade','pond','shade','pond','trees','trees']}),/설계 저장/);
  assert.match(activityAction(9,{phase:2,plan:[]}),/시설|구역/);
  assert.match(activityAction(7,{round:4,practice:0}),/실천 약속/);
});
