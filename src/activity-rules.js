import {resourceCategories,relationReasons} from './activity-data.js';

export function gradeResource(site,categoryId){
 const category=resourceCategories.find(item=>item.id===categoryId);
 const expected=resourceCategories.find(item=>item.id===site.categoryId);
 const accepted=!!category&&category.id===site.categoryId;
 return {accepted,feedback:accepted?site.mechanism:expected.guide+' 장면에 직접 적힌 활동을 기준으로 골라요.'};
}

export function gradeRelation(item,reasonId){
 const offered=item.choices.includes(reasonId)&&Object.hasOwn(relationReasons,reasonId);
 const accepted=offered&&item.acceptedIds.includes(reasonId);
 const feedback=accepted?(reasonId===item.middleId?'활동에서 쓰는 자원과 기후변화 대응을 연결했어요.':item.alternativeFeedback):reasonId==='appearance-only'?'사진 한 장으로 모든 영향을 확정할 수는 없어요. 에너지·자원 사용이나 숲의 변화를 연결해 보세요.':item.otherFeedback||'이 장면과 마지막 설명을 이어 주는 이유를 다시 살펴보세요.';
 return {accepted,text:offered?relationReasons[reasonId]:null,feedback};
}

// An in-progress v1 save used a semantic source index (before display shuffling).
export function savedRelationId(item,record){
 if(record.selectedId!==undefined)return item.choices.includes(record.selectedId)?record.selectedId:null;
 if(Number.isInteger(record.selected)&&record.selected>=0&&record.selected<item.choices.length)return item.choices[record.selected];
 return record.checked===true?item.middleId:null;
}

export function cityTestCriteria(before,after){
 const ready=['heat','rain'].every(h=>Number.isFinite(before?.[h]?.total)&&Number.isFinite(after?.[h]?.total));
 if(!ready)return {ready:false,passed:false};
 const heat=after.heat.total,rain=after.rain.total,total=heat+rain,limit=before.heat.total+before.rain.total;
 const heatExcess=Math.max(0,heat-10),rainExcess=Math.max(0,rain-10),totalExcess=Math.max(0,total-limit);
 return {ready:true,heat,rain,total,limit,heatExcess,rainExcess,totalExcess,passed:heatExcess===0&&rainExcess===0&&totalExcess===0};
}

export function cityTestFeedback(before,after){
 const c=cityTestCriteria(before,after);
 if(!c.ready)return '같은 조건에서 더위와 많은 비를 모두 시험해요.';
 const values=`가상 모형값: 더위 ${c.heat}, 빗물 ${c.rain}, 합계 ${c.total} / 기준 ${c.limit} 이하.`;
 if(c.passed)return values+' 세 기준을 모두 지켰어요. 검증 기록을 제출해요.';
 const gaps=[c.heatExcess?`더위를 ${c.heatExcess}`:'',c.rainExcess?`빗물을 ${c.rainExcess}`:'',c.totalExcess?`합계를 ${c.totalExcess}`:''].filter(Boolean).join(', ');
 return values+' '+gaps+' 더 줄여 다시 시험해요. 더위와 빗물은 각각 10 이하여야 해요.';
}
