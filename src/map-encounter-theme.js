const base='/assets/map-encounters/';
const story = [
  [
    "오늘 눈 왔으니 이 그림만 보자!",
    "눈송이 카드로 관측판을 가렸어!",
    "pane"
  ],
  [
    "이 날씨 스티커로 지도부터 가리자!",
    "스티커를 더 붙여 볼까?",
    "label"
  ],
  [
    "수위 눈금은 잠깐 가릴래!",
    "확성기 뒤에 눈금이 숨었지!",
    "ruler"
  ],
  [
    "실천 계획 표지를 뒤집어 둘래!",
    "표지 뒤쪽은 아무것도 없지!",
    "flip"
  ],
  [
    "도시 지도도 날씨 카드로 덮었지!",
    "어떤 구역을 가려 볼까?",
    "file"
  ]
];
const hit = ["팝! 관측점이 켜졌어!", "카드가 들려 추세선이 보이잖아!"], finish = "카드가 접혔어. 관측선이 다시 보여!";
export const encounterLook = {palette:'#ffcc8e', effect:'trend', art:{left:base+'villain-left.png',right:base+'villain-right.png',frames:6}};
export function encounterStage(index,id,name,point){
  const [one,two,prop]=story[index];
  return {id:String(id),name,x:point.x,y:point.y,lines:[one,two],prop,hit,finish};
}
export function loadEncounterActor(name){const image=new Image();image.src=base+name+'.png';return image;}
export function drawEncounterActor(context,image,point,size,pose,{native=1}={}){
  if(!pose||!image.complete||!image.naturalWidth)return false;
  const cell=image.naturalHeight;
  const index=pose.kind==='attack'?4+Number(pose.frame>0):Math.min(3,pose.frame);
  context.save();
  context.translate(point.x+pose.dx,point.y);
  context.scale(pose.direction*native,1);
  const side=size/.84;
  context.drawImage(image,index*cell,0,cell,cell,-side/2,-side*.935,side,side);
  context.restore();
  return true;
}
