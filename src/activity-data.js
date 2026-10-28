// All numbers below are invented teaching data, not measurements or forecasts.
export const activityTitles = ['도시 이상 신호 스캔','증거 판독실','도시 활동 스캐너','관련성 추적망','해수면 미래 실험','영향 연쇄 분석','오늘의 기후 선택','선택 비교와 실천','미래도시 설계','기후 스트레스 테스트'];

export const evidenceSites = [
  {id:'summer',name:'더운 날 기록',x:18,y:27,past:[2,3,3,4],now:[5,6,7,8],unit:'여름철 매우 더운 날',climate:true,clue:'같은 지역에서 여러 해를 묶어 비교했어요.',judgment:'여러 해에 걸쳐 매우 더운 날이 늘어나는 경향이 있어요.',why:'하루가 아니라 여러 해의 기록을 같은 기준으로 비교했기 때문이에요.'},
  {id:'rain',name:'비의 기록',x:44,y:22,past:[2,3,2,3],now:[4,5,5,6],unit:'많은 비가 내린 날',climate:true,clue:'같은 관측소의 긴 기간 기록이에요.',judgment:'오랜 기간의 비 내리는 양상이 달라졌어요.',why:'같은 기준의 긴 관측 기록은 변화의 경향을 찾는 자료가 돼요.'},
  {id:'snow',name:'오늘의 눈',x:72,y:24,past:[0,0,0,0],now:[0,0,0,7],unit:'오늘 내린 눈',climate:false,clue:'오늘 하루의 날씨만 적혀 있어요.',judgment:'눈이 왔으니 지구의 기후변화가 멈췄어요.',why:'하루의 추위나 눈만으로 긴 기간의 기후변화를 판단할 수 없어요.'},
  {id:'flower',name:'꽃 피는 때',x:86,y:46,past:[7,7,6,7],now:[5,5,4,4],unit:'꽃 피는 시기 · 앞쪽일수록 빨라요',climate:true,clue:'같은 종류의 꽃을 같은 장소에서 여러 해 관찰했어요.',judgment:'꽃 피는 시기가 여러 해에 걸쳐 빨라지는 경향이 있어요.',why:'종류와 장소를 같게 두고 여러 해의 기록을 비교했어요. 다른 자료와도 함께 살펴야 해요.'},
  {id:'sea',name:'바닷물 기록',x:69,y:68,past:[2,2,3,2],now:[4,4,5,5],unit:'바닷물 높이의 상대 단계',climate:true,clue:'같은 기준점에서 오랜 기간 살펴본 가상 기록이에요.',judgment:'오랜 기간에 걸쳐 바닷물 높이가 달라졌어요.',why:'같은 기준점의 긴 기록을 비교해야 해요. 한 번의 밀물만 본 것은 아니에요.'},
  {id:'cold',name:'이번 주 추위',x:43,y:68,past:[4,4,4,4],now:[4,2,3,4],unit:'이번 주의 기온',climate:false,clue:'한 주의 날씨만 적혀 있어요.',judgment:'이번 주 추웠으니 장기적인 온난화는 없어요.',why:'한 주의 날씨는 길게 나타나는 기후의 경향과 달라요.'},
  {id:'warm',name:'긴 기온 기록',x:20,y:60,past:[2,3,2,3],now:[4,5,5,6],unit:'여러 해 평균 기온의 상대 단계',climate:true,clue:'기간을 길게 묶고 같은 관측 기준을 사용했어요.',judgment:'여러 해 평균 기온이 높아지는 경향이 있어요.',why:'여러 해를 묶은 평균을 비교하면 긴 변화의 경향을 찾을 수 있어요.'},
  {id:'storm',name:'어제의 소나기',x:49,y:45,past:[0,0,0,0],now:[0,0,0,6],unit:'어제 내린 소나기',climate:false,clue:'어제 한 번의 소나기 사진뿐이에요.',judgment:'어제 소나기 한 번으로 기후변화를 확정할 수 있어요.',why:'한 번의 사건만으로 확정하지 않아요. 오랜 기록과 다른 근거도 필요해요.'},
];

export const humanSites = [
  {name:'교실의 빈자리',scene:'아무도 없는 교실에 조명이 켜져 있어요.',resource:'전기',mechanism:'쓰지 않는 전기 사용을 줄일 수 있어요.',answer:0,x:17,y:22},
  {name:'등굣길 자동차',scene:'가까운 거리를 한 명씩 자동차로 가요.',resource:'연료',mechanism:'연료를 쓰는 이동과 관련이 있어요.',answer:1,x:38,y:20},
  {name:'집의 냉난방',scene:'창문을 연 채 냉방기를 계속 켜요.',resource:'전기',mechanism:'불필요한 에너지 사용이 늘 수 있어요.',answer:0,x:61,y:20},
  {name:'물건 만드는 곳',scene:'새 물건을 만들 때 원료와 에너지를 써요.',resource:'자원과 에너지',mechanism:'필요한 만큼 만들고 오래 쓰는 선택과 관련돼요.',answer:2,x:83,y:23},
  {name:'숲의 변화',scene:'나무가 있던 공간을 넓게 없앴어요.',resource:'숲',mechanism:'이산화탄소를 흡수하는 숲이 줄어들 수 있어요.',answer:3,x:87,y:50},
  {name:'학교 급식',scene:'먹을 수 있는 음식이 많이 남았어요.',resource:'자원과 에너지',mechanism:'음식을 만들고 운반한 자원과 에너지도 함께 낭비돼요.',answer:2,x:73,y:74},
  {name:'공동 버스',scene:'여러 사람이 버스를 함께 타요.',resource:'연료',mechanism:'사람마다 따로 차를 타는 경우와 비교해 볼 수 있어요.',answer:1,x:51,y:72},
  {name:'고쳐 쓰는 가게',scene:'끈이 풀린 가방을 고쳐서 다시 써요.',resource:'자원과 에너지',mechanism:'새 물건을 만드는 자원과 에너지를 아낄 수 있어요.',answer:2,x:29,y:72},
  {name:'초록 학교',scene:'학교 안 나무와 작은 숲을 돌봐요.',resource:'숲',mechanism:'숲을 보전하는 활동과 관련이 있어요.',answer:3,x:12,y:51},
  {name:'집의 대기전력',scene:'쓰지 않는 기기의 전원을 정리해요.',resource:'전기',mechanism:'필요 없는 전기 사용을 줄일 수 있어요.',answer:0,x:49,y:46},
];
export const resourceNames=['전기','연료','자원과 에너지','숲'];

export const relationCases = [
  {site:0,middle:'쓰지 않는 전기를 계속 사용해요.',end:'에너지 사용을 줄일 여지가 있어요.'},
  {site:1,middle:'이동에 연료를 사용해요.',end:'이동 방법에 따라 기후 부담이 달라질 수 있어요.'},
  {site:2,middle:'바깥 공기가 들어와 냉방 에너지가 더 필요해요.',end:'적절한 냉방 방법으로 에너지 사용을 줄일 수 있어요.'},
  {site:3,middle:'새 물건 생산에 원료와 에너지가 필요해요.',end:'물건을 오래 쓰는 선택이 관련돼요.'},
  {site:4,middle:'이산화탄소를 흡수하는 나무가 줄어요.',end:'숲 보전도 기후변화 대응에 필요해요.'},
  {site:5,middle:'음식 생산과 운반에도 자원이 쓰여요.',end:'먹을 만큼 준비하는 선택이 관련돼요.'},
  {site:7,middle:'새로 만들 물건과 자원 사용을 줄여요.',end:'고쳐 쓰는 활동은 기후변화 대응과 관련돼요.'},
  {site:8,middle:'나무가 이산화탄소를 흡수해요.',end:'숲을 가꾸고 지키는 활동이 관련돼요.'},
];

export const coastDistricts=[
  {id:'beach',name:'모래 해변',height:1,kind:'environment'},
  {id:'road',name:'해안 도로',height:2,kind:'life'},
  {id:'wetland',name:'하구 습지',height:2,kind:'environment'},
  {id:'homes',name:'낮은 주택가',height:3,kind:'life'},
  {id:'park',name:'언덕 공원',height:4,kind:'environment'},
  {id:'school',name:'높은 학교',height:5,kind:'life'},
];
export const experimentLevels=[1,2,3,2,4,3];

export const effectChains=[
  {source:'해안 도로',parts:['물이 낮은 도로에 들어와요.','길을 지나기 어려워져요.','안전한 다른 길이 필요해요.'],kind:'생활'},
  {source:'하구 습지',parts:['물의 범위가 달라져요.','습지의 환경이 바뀌어요.','그곳 생물의 서식지를 살펴야 해요.'],kind:'환경'},
  {source:'낮은 주택가',parts:['낮은 주택가로 물이 들어와요.','생활 공간을 쓰기 어려워져요.','안전하게 대피할 준비가 필요해요.'],kind:'생활'},
  {source:'모래 해변',parts:['물이 닿는 범위가 넓어져요.','해변의 환경이 바뀌어요.','해안 생물의 생활 터전이 달라질 수 있어요.'],kind:'환경'},
  {source:'도시의 폭염',parts:['매우 더운 날이 이어져요.','밖에서 활동하기 어려워져요.','그늘과 시원한 쉼터가 필요해요.'],kind:'생활'},
  {source:'숲의 가뭄',parts:['비가 적게 오는 날이 이어져요.','흙 속 물이 부족해져요.','식물이 자라기 어려워질 수 있어요.'],kind:'환경'},
  {source:'많은 비',parts:['짧은 시간에 비가 많이 와요.','낮은 길에 물이 모여요.','통행을 멈추고 안전한 곳으로 가요.'],kind:'생활'},
  {source:'기온 변화',parts:['따뜻한 시기가 달라져요.','꽃 피는 때가 달라질 수 있어요.','꽃과 곤충의 관계도 살펴야 해요.'],kind:'환경'},
];

// Metrics: [climate burden, comfort, resources], relative to this game only.
export const dailyCases=[
  {time:'아침',situation:'햇빛이 밝은 방이에요. 책을 읽으려 해요.',options:[['자연 빛이 충분한 자리에서 읽어요.',[1,3,1]],['방의 모든 불을 켜요.',[3,3,3]],['어두운 곳에서 눈을 찡그리며 읽어요.',[0,0,0],true]],reason:'눈에 편안한 밝기를 지키며 불필요한 전기를 줄여요.'},
  {time:'등교',situation:'가깝고 안전한 길이에요. 함께 갈 어른이 있어요.',options:[['어른과 함께 걸어요.',[1,3,1]],['한 사람씩 자동차를 타요.',[3,3,3]],['차가 많은 길을 혼자 급히 건너요.',[0,0,0],true]],reason:'안전한 조건에서 걷거나 함께 타는 방법을 비교해요.'},
  {time:'교실',situation:'이동 수업을 가서 교실이 비게 돼요.',options:[['선생님과 확인한 뒤 불을 꺼요.',[1,3,1]],['빈 교실의 불을 켜 둬요.',[3,3,3]],['젖은 손으로 전기 기기를 만져요.',[0,0,0],true]],reason:'사람이 없는 곳의 불필요한 전기 사용을 줄여요.'},
  {time:'점심',situation:'급식을 먹기 전, 먹을 양을 고를 수 있어요.',options:[['먹을 만큼 받고 부족하면 더 받아요.',[1,3,1]],['많이 받은 뒤 남은 음식을 버려요.',[3,3,3]],['자원을 아끼려고 점심을 굶어요.',[0,0,0],true]],reason:'충분히 먹으면서 음식물 낭비를 줄일 수 있어요.'},
  {time:'쉬는 시간',situation:'밖이 매우 더워요. 목도 말라요.',options:[['물과 그늘에서 쉬며 몸을 보호해요.',[2,3,2]],['시원한 실내 쉼터에서 쉬어요.',[2,3,2]],['전기를 아끼려고 더위를 계속 참아요.',[0,0,0],true]],reason:'폭염에는 건강과 안전이 먼저예요. 물과 쉼터를 이용해요.'},
  {time:'미술 시간',situation:'종이 한쪽 면은 아직 깨끗해요.',options:[['깨끗한 뒷면을 연습에 써요.',[1,3,1]],['매번 새 종이를 꺼내요.',[3,3,3]],['친구의 필요한 종이를 빼앗아요.',[0,0,0],true]],reason:'쓸 수 있는 물건을 다시 쓰면 자원을 아낄 수 있어요.'},
  {time:'방과 후',situation:'자주 쓰던 가방 끈이 조금 풀렸어요.',options:[['어른과 함께 고쳐서 써요.',[1,3,1]],['바로 새 가방을 사요.',[3,3,3]],['찢어진 끈으로 무거운 것을 무리해 들어요.',[0,0,0],true]],reason:'안전하게 수리해 오래 쓰는 방법을 먼저 살펴요.'},
  {time:'집에서',situation:'방 안에 아무도 없는데 냉방 중이에요.',options:[['어른과 확인한 뒤 필요한 만큼만 사용해요.',[1,3,1]],['빈방을 계속 강하게 냉방해요.',[3,3,3]],['아픈 가족이 있어도 냉방을 무조건 꺼요.',[0,0,0],true]],reason:'사람의 건강을 지키면서 불필요한 사용을 줄여요.'},
  {time:'저녁',situation:'내일 쓸 물병을 준비해요.',options:[['씻어서 안전하게 다시 쓸 물병을 챙겨요.',[1,3,1]],['매번 새 일회용 물병을 준비해요.',[3,3,3]],['씻지 않은 더러운 물병을 써요.',[0,0,0],true]],reason:'위생을 지키며 다시 쓰는 생활 도구를 골라요.'},
  {time:'잠들기 전',situation:'사용을 마친 전기 기기가 있어요.',options:[['어른과 안전하게 전원을 정리해요.',[1,3,1]],['필요 없는 기기를 계속 켜 둬요.',[3,3,3]],['혼자 위험한 전선을 고쳐요.',[0,0,0],true]],reason:'필요 없는 전기 사용을 줄이되 전기 안전을 지켜요.'},
];
export const compareCaseIndices=[0,1,3,6];

export const facilities=[
  {id:'trees',name:'도시숲',cost:3,heat:2,rain:1,reason:'나무 그늘과 빗물이 스며드는 땅을 함께 마련해요.'},
  {id:'shade',name:'그늘 쉼터',cost:2,heat:3,rain:0,reason:'햇빛을 가려 더울 때 안전하게 쉬어요.'},
  {id:'pond',name:'빗물 저류지',cost:3,heat:0,rain:3,reason:'비가 올 때 빗물을 잠시 모아 두어요.'},
  {id:'refuge',name:'안전 대피소',cost:4,heat:2,rain:2,reason:'더위와 많은 비에 사람이 안전하게 머물 공간을 마련해요.'},
  {id:'ground',name:'빗물 흡수 길',cost:2,heat:0,rain:2,reason:'빗물이 땅으로 스며들도록 돕는 길이에요.'},
];
export const cityDistricts=[
  {id:'school',name:'학교 앞',heat:4,rain:1,clue:'햇빛이 강하고 학생이 많이 다녀요.'},
  {id:'homes',name:'낮은 주택가',heat:2,rain:4,clue:'지대가 낮아 빗물이 모이기 쉬워요.'},
  {id:'square',name:'버스 광장',heat:4,rain:2,clue:'넓은 포장 바닥에 그늘이 적어요.'},
  {id:'river',name:'강변 산책길',heat:1,rain:4,clue:'강 가까이의 낮은 길이에요.'},
  {id:'market',name:'마을 시장',heat:3,rain:2,clue:'사람이 많고 더울 때 쉴 곳이 부족해요.'},
  {id:'park',name:'언덕 공원',heat:2,rain:2,clue:'휴식 공간과 빗물 관리가 모두 필요해요.'},
];
export const CITY_BUDGET=18;
