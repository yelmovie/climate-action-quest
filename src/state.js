export const VERSION='0.1.0';
export const SAVE_KEY='climate-future:v1';
export const SOUND_KEY='climate-future:sound:v1';
export const stages=[
 {id:0,name:'언덕 관측소',subtitle:'오래 모은 자료에서 단서를 찾아요',reward:'기후 신호 관측 기록',badge:'관측 대원',icon:'scan',background:'city',activities:['도시 이상 신호 스캔','증거 판독실'],counts:['8곳 관측','8가지 판단']},
 {id:1,name:'마을 조사소',subtitle:'우리 생활과 기후의 연결을 찾아요',reward:'인간 활동 관련성 지도',badge:'연결 탐정',icon:'link',background:'city',activities:['도시 활동 스캐너','관련성 추적망'],counts:['10곳 조사','8가지 연결']},
 {id:2,name:'물가 실험실',subtitle:'예상하고 바꾸고 다시 확인해요',reward:'미래 영향 예측 보고서',badge:'실험 연구원',icon:'flask',background:'coast',activities:['해수면 미래 실험','영향 연쇄 분석'],counts:['6번 실험','8가지 영향']},
 {id:3,name:'생활 연구소',subtitle:'안전하고 지속할 수 있는 실천을 골라요',reward:'나의 생활 대응 실천안',badge:'생활 실천가',icon:'leaf',background:'bedroom',activities:['오늘의 기후 선택','선택 비교와 실천'],counts:['10가지 상황','4번 비교']},
 {id:4,name:'도시 설계소',subtitle:'내가 만든 도시를 같은 조건에서 시험해요',reward:'검증된 기후 대응 도시 설계도',badge:'미래 설계자',icon:'city',background:'design',activities:['미래도시 설계','기후 스트레스 테스트'],counts:['6구역 설계','4번 검증']}
];
export function freshState(){return {version:1,mapRepairs:[],mapRepairLayouts:{},records:{},completed:[],adminUnlocked:false,introSeen:false,finalized:false,route:'home',position:{x:500,y:603},summaries:{}};}
export function normalizeState(raw){
 const base=freshState();if(!raw||typeof raw!=='object'||raw.version!==1)return base;
 base.mapRepairs=Array.isArray(raw.mapRepairs)?[...new Set(raw.mapRepairs.filter(n=>Number.isInteger(n)&&n>=0&&n<5))]:[];
 base.mapRepairLayouts=Object.fromEntries(Object.entries(raw.mapRepairLayouts||{}).filter(([id,v])=>/^[0-4]$/.test(id)&&v&&typeof v==='object').map(([id,v])=>[id,Object.fromEntries(Object.entries(v).filter(([slot,item])=>/^[0-2]$/.test(slot)&&Number.isInteger(item)&&item>=0&&item<3))]));
 const records=raw.records&&typeof raw.records==='object'&&!Array.isArray(raw.records)?raw.records:{};
 base.records=Object.fromEntries(Object.entries(records).filter(([k,v])=>/^\d$/.test(k)&&v&&typeof v==='object'&&!Array.isArray(v)));
 base.completed=Array.isArray(raw.completed)?[...new Set(raw.completed.filter(i=>Number.isInteger(i)&&i>=0&&i<10&&base.records[i]&&!base.records[i].example&&base.records[i].done===true))]:[];
 base.adminUnlocked=raw.adminUnlocked===true;base.introSeen=raw.introSeen===true;
 base.finalized=raw.finalized===true&&base.completed.length===10;
 if(typeof raw.route==='string'&&/^(home|map|ending|facility\/[0-4]|activity\/[0-9])$/.test(raw.route))base.route=raw.route;
 if(Number.isFinite(raw.position?.x)&&Number.isFinite(raw.position?.y))base.position=raw.position;
 if(raw.summaries&&typeof raw.summaries==='object')base.summaries=Object.fromEntries(Object.entries(raw.summaries).filter(([k,v])=>/^\d$/.test(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,1000)]));
 return base;
}
export function stageOpen(state,id){return id===0||state.adminUnlocked||chapterDone(state,id-1);}
export function chapterDone(state,id){return state.completed.includes(id*2)&&state.completed.includes(id*2+1);}
export function activityOpen(state,id){return state.adminUnlocked||(stageOpen(state,Math.floor(id/2))&&(id%2===0||state.completed.includes(id-1)));}
export function certificateEligible(state){return state.completed.length===10&&Array.from({length:10},(_,i)=>i).every(i=>state.completed.includes(i)&&state.records[i]?.done&&!state.records[i]?.example);}
export function loadState(storage){try{return {state:normalizeState(JSON.parse(storage.getItem(SAVE_KEY))),error:false};}catch{return {state:freshState(),error:true};}}
export function storeState(storage,state){try{storage.setItem(SAVE_KEY,JSON.stringify(state));return true;}catch{return false;}}

/** One tab owns its observed save revision; damaged or foreign saves are read-only. */
export function createSaveSession(storage,{key=SAVE_KEY,createState=freshState,normalize=normalizeState}={}){
 let baseline=null,blocked=null,state=createState();
 try{
  baseline=storage.getItem(key);
  if(baseline!==null){const raw=JSON.parse(baseline);if(!raw||Array.isArray(raw)||raw.version!==1)blocked='invalid';else state=normalize(raw);}
 }catch{blocked='unavailable';}
 if('adminUnlocked' in state)state.adminUnlocked=false;
 const check=()=>{if(blocked)return {ok:false,reason:blocked};try{if(storage.getItem(key)!==baseline)return {ok:false,reason:'conflict'};}catch{return {ok:false,reason:'unavailable'};}return {ok:true};};
 const save=next=>{if(next.adminUnlocked)return {ok:true,reason:'preview'};const status=check();if(!status.ok)return status;try{const value=JSON.stringify(next);storage.setItem(key,value);baseline=value;return {ok:true};}catch{return {ok:false,reason:'unavailable'};}};
 return {state,error:Boolean(blocked),save,reset(){const status=check();if(!status.ok)return status;try{if(baseline!==null)storage.setItem(key+':before-reset',baseline);}catch{return {ok:false,reason:'backup'};}return save(createState());}};
}
