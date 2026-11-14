import {evidenceSites,dailyCases} from './activity-data.js';

// Describe the next deliberate action separately from the last result.
export function activityAction(index,r){
 if(r.workComplete&&r.done)return '다음 탐구 버튼을 눌러 기록을 이어 가요.';
 switch(index){
  case 0:return r.collected?.length===8?'관측 마무리를 눌러요.':r.collected?.includes(evidenceSites[r.open||0]?.id)?'다음 관측 지점을 눌러요.':'시간 손잡이를 오른쪽 끝까지 밀어요.';
  case 1:return r.checked?'근거를 읽고 다음 버튼을 눌러요.':'자료를 보고 알맞은 판단을 눌러요.';
  case 2:return r.collected?.length===10?'조사 마무리를 눌러요.':r.collected?.includes(r.open||0)?'다음 조사 지점을 눌러요.':'장면과 관련된 자원 버튼을 눌러요.';
  case 3:return r.checked?'연결을 읽고 다음 버튼을 눌러요.':'가운데 칸에 맞는 이유 카드를 눌러요.';
  case 4:return r.ran?'예상과 결과를 보고 다음 버튼을 눌러요.':r.prediction?.length?'실험 시작을 눌러요.':'물이 닿을 것 같은 구역을 모두 눌러요.';
  case 5:return r.checked?'연결을 읽고 다음 버튼을 눌러요.':r.order?.length===3?'놓인 카드를 눌러 빼고 순서를 바꿔요.':`현장 설명과 카드의 앞뒤 관계를 보고 ${3-(r.order?.length||0)}장을 더 눌러요.`;
  case 6:return r.picked===undefined?'생활 선택 카드 하나를 눌러요.':dailyCases[r.round||0]?.options[r.picked]?.[2]?'몸을 보호하는 다른 선택을 눌러요.':'선택 기록 · 다음을 눌러요.';
  case 7:return r.round>=4?(r.practice===undefined?'직접 실천할 행동 하나를 눌러요.':'실천 약속을 수첩에 담기를 눌러요.'):r.checked?'비교 기록 · 다음을 눌러요.':'두 선택을 비교하고 더 나은 쪽을 눌러요.';
  case 8:return r.plan?.filter(Boolean).length===6?'설계 저장 · 시험으로를 눌러요.':r.tool==='erase'?'시설을 뺄 구역을 눌러요.':r.tool?'고른 시설을 놓을 구역을 눌러요.':'시설 하나를 고른 뒤 빈 구역을 눌러요.';
  case 9:return r.phase===2?(r.plan?.filter(Boolean).length===6?'시설을 살펴본 뒤 폭염 재시험 시작을 눌러요.':'빈 구역에 시설을 놓아요.'):'시험 버튼으로 결과를 차례로 확인해요.';
  default:return '';
 }
}

// Hints explain manipulation and reasoning without selecting an answer.
export function activityGuide(index,r){
 const has=k=>Array.isArray(r[k])&&r[k].length>0;
 const basic=[
  r.collected?.length===8?'관측 기록이 모였어! 관측 마무리로 발견을 정리해 봐!':has('collected')?'자동으로 수첩에 담았어! 다음 관측 지점에서 변화를 찾아봐!':'시간 손잡이를 끝까지 밀면 두 기록을 자동으로 모을 수 있어!',
  r.checked?'근거를 확인했으면 오른쪽 버튼으로 기록을 이어 가!':'자료 카드를 알맞은 판단 쪽으로 끌어 봐. 눌러 골라도 돼!',
  r.collected?.length===10?'열 곳의 조사를 마쳤어! 조사 마무리로 기록을 정리해 봐!':'조사 카드를 관련 자원에 연결해 봐. 다음 조사 지점으로 계속 탐험할 수 있어!',
  r.checked?'연결된 이유를 읽고 다음 관계를 찾아봐!':'이유 카드를 가운데 빈칸으로 끌어 두 설명을 이어 봐!',
  r.ran?'내 예상과 물이 닿은 곳을 비교해 봐. 다르게 나타난 곳이 새로운 발견이야!':!has('prediction')?'먼저 물이 닿을 것 같은 구역을 눌러 표시해 봐!':'수위는 준비됐어! 실험 버튼으로 예상과 결과를 비교해 봐!',
  r.checked?'변화에서 대응까지 이어졌어! 오른쪽 버튼으로 기록해 봐!':'카드를 순서 칸으로 끌어 봐. 놓인 카드의 순서도 바꿀 수 있어!',
  r.picked===undefined?'선택을 눌러 세 지표가 어떻게 달라지는지 살펴봐!':'다른 선택도 비교할 수 있어. 안전한 선택을 기록해 봐!',
  r.round>=4?'직접 해 볼 실천 하나를 골라 내 약속으로 남겨 봐!':'두 선택의 지표를 나란히 보고 더 나은 쪽을 골라 봐!',
  r.tool==='erase'?'비울 구역을 연속으로 눌러 봐. 다시 놓을 때는 시설을 골라!':r.tool?'선택한 시설을 여러 구역에 이어 놓아 봐. 끌기와 누르기 모두 가능해!':'시설을 구역으로 끌어 봐. 시설을 누르고 구역을 눌러도 돼!',
  r.phase===2?'첫 시험에서 영향이 남은 곳을 찾아 시설을 검토해 봐!':'시험 버튼을 눌러 더위와 많은 비를 각각 확인해 봐!'
 ];
 const deeper=[
  '줄무늬 막대와 단색 막대 중 어느 쪽이 더 높은지 비교해 봐. 여러 해 기록 사이에 하루나 며칠만 적힌 날씨 기록도 섞여 있어!',
  '기록의 기간이 얼마나 긴지, 장소와 관측 기준이 같은지 확인해 봐. 하루 자료로 긴 변화를 판단할 수 있을까?',
  '물건의 겉모습만 보지 말고, 작동하거나 만들어질 때 무엇을 쓰는지 생각해 봐!',
  '처음 활동과 마지막 설명 사이에 어떤 에너지·자원 사용이 있는지 찾아봐!',
  r.ran?'땅 높이와 실험 수위를 비교해 봐. 내 예상이 달라도 새로운 발견이야!':'여러 구역을 예상해도 돼. 예상은 점수가 아니니 실험으로 확인해 봐!',
  '순서대로 놓은 카드를 눌러 다시 읽어 봐. 앞 장면이 다음 장면을 어떻게 바꾸는지 두 장씩 비교해 봐!',
  '건강과 안전을 포기하지 마. 생활을 지키면서 필요 없는 사용을 줄여 봐!',
  '같은 길이의 막대는 같은 단계를 뜻해. 건강과 생활을 지키는지도 확인해 봐!',
  '구역의 더위·빗물 막대와 시설의 도움을 비교해 봐. 자원이 모자라면 시설을 빼거나 바꿀 수 있어!',
  '처음과 같은 날씨 조건이어야 공정하게 비교할 수 있어. 좋은 설계는 바꾸지 않고 다시 확인해도 돼!'
 ];
 const water=[4,5,9].includes(index);
 return {name:water?'물방울':'잎새',character:water?'otter':'parrot',basic:basic[index],deeper:deeper[index]};
}
