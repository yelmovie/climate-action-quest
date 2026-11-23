import test from 'node:test';
import assert from 'node:assert/strict';
import {humanSites,resourceCategories,relationCases,relationReasons} from '../src/activity-data.js';
import {gradeResource,gradeRelation,savedRelationId,cityTestCriteria,cityTestFeedback} from '../src/activity-rules.js';

const relation=id=>relationCases.find(item=>item.id===id);
test('investigation topics separate use contexts while keeping electricity inside energy',()=>{
 const expected=['electricity','transport-fuel','electricity','production','forest','production','transport-fuel','production','forest','electricity'];
 for(const [i,site] of humanSites.entries()){
  assert.equal(gradeResource(site,expected[i]).accepted,true,site.name);
  for(const category of resourceCategories)assert.equal(gradeResource(site,category.id).accepted,category.id===expected[i],site.name+' / '+category.id);
 }
 assert.ok(resourceCategories.every(item=>item.name!=='자원과 에너지'));
 const retry=gradeResource(humanSites[0],'production');
 assert.match(retry.feedback,/전기도 에너지/);
 assert.match(retry.feedback,/조명·기기의 전기 사용/);
 assert.match(retry.feedback,/장면에 직접 적힌 활동/);
 assert.equal(gradeResource(humanSites[0],'unknown').accepted,false);
 assert.match(gradeResource(humanSites[7],'electricity').feedback,/만들고 쓰는 데 필요한 재료/);
});

test('both justified links for production and forest loss are accepted by reason ID, independent of order',()=>{
 for(const [caseId,accepted] of [['production',['production-inputs','less-new-production']],['forest-loss',['forest-loss','trees-absorb']]]){
  const item=relation(caseId);
  for(const choices of [item.choices,[...item.choices].reverse()])for(const id of accepted){
   const result=gradeRelation({...item,choices},id);
   assert.equal(result.accepted,true,caseId+' / '+id);
   assert.equal(result.text,relationReasons[id]);
   assert.ok(result.feedback.length>15);
  }
  const wrong=gradeRelation(item,'appearance-only');
  assert.equal(wrong.accepted,false);
  assert.match(wrong.feedback,/사진/);
  assert.match(wrong.feedback,/확정할 수는 없/);
 }
 assert.match(gradeRelation(relation('production'),'less-new-production').feedback,/오래 쓰면/);
 assert.match(gradeRelation(relation('forest-loss'),'trees-absorb').feedback,/흡수할 나무가 줄/);
});

test('a true statement from a different case receives a contextual explanation, and unknown IDs cannot pass',()=>{
 const result=gradeRelation(relation('classroom'),'production-inputs');
 assert.equal(result.accepted,false);
 assert.match(result.feedback,/맞아요/);
 assert.match(result.feedback,/빈 교실의 조명/);
 assert.equal(gradeRelation(relation('classroom'),'trees-absorb').accepted,false);
 assert.equal(gradeRelation(relation('classroom'),'unknown').accepted,false);
 for(const item of relationCases){
  assert.equal(item.choices.length,3);
  assert.equal(new Set(item.choices).size,3);
  assert.ok(item.choices.every(id=>Object.hasOwn(relationReasons,id)));
  assert.ok(item.acceptedIds.every(id=>item.choices.includes(id)));
 }
});

test('v1 in-progress choices retain their meaning without resetting completed links',()=>{
 const item=relation('production');
 assert.equal(savedRelationId(item,{selected:1,checked:false}),'less-new-production');
 assert.equal(gradeRelation(item,savedRelationId(item,{selected:1})).accepted,true);
 assert.equal(savedRelationId(item,{selected:2,checked:false}),'appearance-only');
 assert.equal(savedRelationId(item,{checked:true}),item.middleId);
 assert.equal(savedRelationId({...item,choices:[...item.choices].reverse()},{selectedId:'less-new-production'}),'less-new-production');
 assert.equal(savedRelationId(item,{selectedId:'unknown',checked:true}),null);
 assert.equal(savedRelationId(item,{}),null);
});

const results=(heat,rain)=>({heat:{total:heat},rain:{total:rain}});
test('city criteria explain totals immediately below, equal to, and above the first sum',()=>{
 const before=results(2,15);
 assert.deepEqual([cityTestCriteria(before,results(8,8)).total,cityTestCriteria(before,results(8,8)).passed],[16,true]);
 assert.deepEqual([cityTestCriteria(before,results(8,9)).total,cityTestCriteria(before,results(8,9)).passed],[17,true]);
 const nine=cityTestCriteria(before,results(9,9));
 assert.equal(nine.total,18);assert.equal(nine.limit,17);assert.equal(nine.totalExcess,1);
 assert.equal(nine.heatExcess,0);assert.equal(nine.rainExcess,0);assert.equal(nine.passed,false);
 assert.equal(cityTestCriteria(results(10,10),results(11,7)).heatExcess,1);
 assert.equal(cityTestCriteria(results(10,10),results(7,11)).rainExcess,1);
 assert.equal(cityTestCriteria(before,{}).ready,false);
});

test('the 9/9 rejection explains the actual excess instead of asking for an arbitrary higher score',()=>{
 const feedback=cityTestFeedback(results(2,15),results(9,9));
 assert.match(feedback,/가상 모형값/);assert.match(feedback,/합계 18 \/ 기준 17 이하/);assert.match(feedback,/합계를 1 더 줄여/);
 assert.match(cityTestFeedback(results(2,15),results(8,9)),/세 기준을 모두 지켰/);
});
