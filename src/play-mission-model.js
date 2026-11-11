export const title='내가 운영하는 미래 도시';
export const intro='같은 예산으로 다른 도시를 만들고, 폭염과 많은 비를 시험해 봐.';
export const background='/assets/city.webp';
export const items=[{id:'park',effect:'그늘·빗물',name:'나무 그늘',icon:'leaf',cost:3,heat:3,rain:1,carbon:1,art:'./assets/concept-art/park.webp'},{id:'wetland',effect:'빗물 흡수',name:'빗물 정원',icon:'water',cost:3,heat:1,rain:3,carbon:0,art:'./assets/concept-art/pond.webp'},{id:'bus',effect:'배출 줄이기',name:'대중교통',icon:'bus',cost:4,heat:0,rain:0,carbon:4},{id:'solar',effect:'배출 줄이기',name:'태양광',icon:'sun',cost:4,heat:0,rain:0,carbon:4},{id:'roof',effect:'열 반사',name:'차열 지붕',icon:'home',cost:2,heat:2,rain:0,carbon:0,art:'./assets/concept-art/homes.webp'},{id:'empty',effect:'비우기',name:'빈 부지',icon:'erase',cost:0,heat:0,rain:0,carbon:0}];
export const missions=[{name:'폭염에 대비해',goal:'예산 12 안에서 폭염 부담을 6 이하로 줄여 봐.',budget:12,heat:6,rain:12,carbon:0},{name:'비에도 튼튼하게',goal:'예산 15 안에서 폭염과 많은 비 부담을 모두 7 이하로 줄여 봐.',budget:15,heat:7,rain:7,carbon:0},{name:'두 가지 길을 함께',goal:'예산 18 안에서 폭염·비 부담을 8 이하로, 배출 줄이기 지수를 4 이상으로 만들어 봐.',budget:18,heat:8,rain:8,carbon:4}];
export const note='수치는 비교를 위한 가정 점수이며 실제 예측값이 아니야. 실제 효과는 장소와 조건에 따라 달라.';
export function evaluate(plan,level){const m=missions[level];let cost=0,heat=12,rain=12,carbon=0;for(const id of plan){const x=items.find(x=>x.id===id);if(x){cost+=x.cost;heat-=x.heat;rain-=x.rain;carbon+=x.carbon;}}heat=Math.max(0,heat);rain=Math.max(0,rain);const reasons=[];if(cost>m.budget)reasons.push('예산을 넘었어. 시설을 바꾸거나 빈 부지로 돌려 봐.');if(heat>m.heat)reasons.push('폭염 부담이 남아 있어. 그늘이나 차열 지붕을 비교해 봐.');if(rain>m.rain)reasons.push('많은 비에 대한 대비가 부족해. 빗물이 스며들 공간을 마련해 봐.');if(carbon<m.carbon)reasons.push('배출 줄이기 조건도 확인해 봐. 대중교통이나 태양광을 비교해 봐.');return {cost,heat,rain,carbon,ok:!reasons.length,reasons,summary:reasons[0]||'조건을 만족했어! 다른 배치의 장단점도 비교해 봐.'};}

export const MISSION_SAVE_KEY='science-play-16-v1';

export function freshMissionState(){
 return {version:1,level:0,plans:missions.map(()=>Array(6).fill(null)),won:[],history:missions.map(()=>[])};
}

export function normalizeMissionState(raw){
 const state=freshMissionState();
 state.plans=missions.map((_,level)=>Array.from({length:6},(_,cell)=>{
  const id=raw.plans?.[level]?.[cell];
  return items.some(item=>item.id===id&&id!=='empty')?id:null;
 }));
 state.won=[...new Set(Array.isArray(raw.won)?raw.won.filter(level=>Number.isInteger(level)&&level>=0&&level<missions.length):[])];
 const firstLocked=missions.findIndex((_,level)=>level>0&&!state.won.includes(level-1));
 const maxLevel=firstLocked<0?missions.length-1:firstLocked-1;
 state.level=Math.max(0,Math.min(maxLevel,Math.trunc(Number(raw.level))||0));
 state.history=missions.map((_,level)=>Array.isArray(raw.history?.[level])?raw.history[level].slice(-2).map(record=>Object.fromEntries(
  ['heat','rain','carbon'].map(key=>[key,Math.max(0,Math.min(99,Number(record?.[key])||0))])
 )):[]);
 return state;
}
