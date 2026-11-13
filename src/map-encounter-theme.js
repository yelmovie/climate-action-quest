const base='/assets/map-encounters/';
const story = [
  ["pane", "오늘 눈이랑 여러 해 기후 기록을 구분했어? 내 눈송이 카드 실패야!", "내일도 눈이 오면 같은 카드 또 써먹어야지!", "팝! 눈송이 카드가 들렸어!", "가려 둔 여러 해 관측선이 보이잖아!", "쳇, 관측판은 돌려줄게. 눈송이는 가져갈래!"],
  ["label", "여러 해의 변화를 지도에서 찾아냈어? 스티커가 부족했나 봐!", "다음엔 지도만 한 스티커를 주문해야겠군!", "앗, 내 스티커 끝이 들렸어!", "숨긴 변화 지도가 다 펼쳐졌잖아!", "흥, 지도를 돌려줄게. 스티커 주문은 취소!"],
  ["ruler", "수위가 바뀌면 어디가 잠기는지 봤어? 확성기 뒤에 눈금을 가렸는데!", "다음엔 확성기 볼륨부터 엄청 키우겠어!", "앗, 확성기가 옆으로 돌아갔어!", "숨겨 둔 수위 눈금이 드러났잖아!", "쳇, 물높이 표지는 원래대로 세울게!"],
  ["flip", "기후 변화에 맞는 실천을 골랐어? 계획판을 거꾸로 매달았는데!", "내 실천 계획은 장난 횟수 줄이기… 일단 하루만!", "앗, 실천 표지가 돌아갔어!", "내가 가린 행동 카드가 다 보여!", "흥, 실천 계획판은 네가 맡아!"],
  ["file", "안전한 미래 도시를 설계했어? 내가 날씨 카드로 지도 전체를 덮었는데!", "그 도시에 악당 연구실도 하나쯤은 있겠지?", "팝! 도시 구역을 가린 카드가 떨어졌어!", "살펴본 도시 설계가 다시 보이잖아!", "쳇, 미래 지도는 돌려줄게. 내 기지는 더 안전하게 지어야지!"],
];
export const encounterLook = {palette:'#ffcc8e', effect:'trend', art:{left:base+'villain-poses-left.png',right:base+'villain-poses-right.png',frames:6}};
export function encounterStage(index,id,name,point){
  const [prop,one,two,hitOne,hitTwo,finish]=story[index];
  return {id:String(id),name,speaker:"날씨 바꿔치기 악당",x:point.x,y:point.y,lines:[one,two],prop,hit:[hitOne,hitTwo],finish};
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
