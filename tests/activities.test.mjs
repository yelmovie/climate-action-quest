import test from 'node:test';
import assert from 'node:assert/strict';
import {waterAffected,normalizePlan,planCost,evaluateCity,dailyMetrics,canCompleteStress,freshActivityRecord,sourceActivityRecord,activityChoiceOrder} from '../src/activities.js';
import {evidenceSites,humanSites,relationCases,experimentLevels,effectChains,dailyCases,compareCaseIndices,cityDistricts,CITY_BUDGET} from '../src/activity-data.js';

test('expanded content has the declared twofold scenario counts',()=>{
 assert.deepEqual([evidenceSites.length,humanSites.length,relationCases.length,experimentLevels.length,effectChains.length,dailyCases.length,compareCaseIndices.length,cityDistricts.length],[8,10,8,6,8,10,4,6]);
 assert.equal(new Set(evidenceSites.map(d=>d.id)).size,8);
});
test('sea-level model affects low districts first, never predicts the highest school',()=>{
 assert.deepEqual(waterAffected(0),[]);
 assert.deepEqual(waterAffected(2),['beach','road','wetland']);
 assert.ok(waterAffected(3).includes('homes'));
 assert.ok(!waterAffected(4).includes('school'));
 assert.deepEqual(waterAffected(Infinity),[]);
});
test('city costs and hazard effects depend on facility and district, with a reachable budget',()=>{
 const good=['shade','pond','shade','pond','trees','trees'];
 assert.ok(planCost(good)<=CITY_BUDGET);
 assert.equal(planCost(good),16);
 assert.ok(evaluateCity(good,'heat').total<=10);
 assert.ok(evaluateCity(good,'rain').total<=10);
 const allShade=Array(6).fill('shade'),allPonds=Array(6).fill('pond');
 assert.ok(evaluateCity(allShade,'heat').total<evaluateCity(allPonds,'heat').total);
 assert.ok(evaluateCity(allPonds,'rain').total<evaluateCity(allShade,'rain').total);
 assert.throws(()=>evaluateCity(good,'wind'),TypeError);
});
test('design does not treat unknown facilities as free protection',()=>{
 assert.deepEqual(normalizePlan(['unknown']),Array(6).fill(null));
 assert.equal(evaluateCity(['unknown'],'heat').total,16);
 assert.equal(planCost(['unknown']),0);
});
test('stress completion requires both same-condition trials, protects against worse aggregate and accepts good unchanged plans',()=>{
 const plan=['shade','pond','shade','pond','trees','trees'];
 const result={heat:evaluateCity(plan,'heat'),rain:evaluateCity(plan,'rain')};
 assert.equal(canCompleteStress(result,{}),false);
 assert.equal(canCompleteStress(result,result),true);
 const weak={heat:evaluateCity(Array(6).fill('shade'),'heat'),rain:evaluateCity(Array(6).fill('shade'),'rain')};
 assert.equal(canCompleteStress(result,weak),false);
 assert.equal(canCompleteStress(weak,result),true);
});
test('daily choices include safe comparison alternatives and health-sacrificing options are explicitly unsafe',()=>{
 assert.equal(dailyCases.length,10);
 for(const c of dailyCases){assert.equal(c.options.length,3);assert.equal(c.options[2][2],true);assert.ok(c.options[0][1][1]>=3);}
 const low=dailyMetrics(Array(10).fill(0)),high=dailyMetrics(Array(10).fill(1));
 assert.ok(low[0]<high[0]);assert.equal(low[1],high[1]);assert.ok(low[2]<high[2]);
});
test('replaying preserves earned completion while a preview never becomes earned evidence',()=>{
 assert.equal(freshActivityRecord({done:true,example:false,round:8}).done,true);
 assert.equal(freshActivityRecord({done:true,example:true,round:8}).done,false);
 assert.equal(freshActivityRecord({done:true,example:true},true).done,false);
 assert.equal(freshActivityRecord({round:3}).done,false);
});
test('downstream activities retain the last completed evidence while a new attempt is in progress',()=>{
 const completed={done:true,example:false,workComplete:true,choices:[0,1,0],round:10};
 const replay=freshActivityRecord(completed);replay.choices=[1];
 assert.deepEqual(sourceActivityRecord(replay).choices,[0,1,0]);
 const secondReplay=freshActivityRecord(replay);
 assert.deepEqual(sourceActivityRecord(secondReplay).choices,[0,1,0]);
 assert.equal(secondReplay.earnedRecord.earnedRecord,undefined);
 replay.workComplete=true;
 assert.deepEqual(sourceActivityRecord(replay).choices,[1]);
});
test('question orders stay stable on resume but use all six permutations across rounds',()=>{
 const orders=Array.from({length:6},(_,round)=>activityChoiceOrder(round));
 assert.equal(new Set(orders.map(a=>a.join(','))).size,6);
 for(let round=0;round<12;round++){
   assert.deepEqual(activityChoiceOrder(round),activityChoiceOrder(round));
   assert.deepEqual([...activityChoiceOrder(round)].sort(),[0,1,2]);
 }
 assert.equal(new Set(orders.map(a=>a.indexOf(0))).size,3);
 const changed=activityChoiceOrder(0);changed.reverse();
 assert.notDeepEqual(changed,activityChoiceOrder(0));
});

test('each activity carries a real standard code and objective; content stays flagged for teacher review', async () => {
  const {activityStandards, activityTitles, contentReview} = await import('../src/activity-data.js');
  assert.equal(activityStandards.length, activityTitles.length);
  for (const s of activityStandards) { assert.match(s.code, /^4과16-0[123]$/); assert.ok(s.objective.trim().length > 10); }
  assert.equal(contentReview.needsReview, true);
  assert.ok(contentReview.source.includes('4과16'));
});
