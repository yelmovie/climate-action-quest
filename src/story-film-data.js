// 이야기 영상(인트로)과 마무리 영상(파이널). 영상은 소리 없이 재생되고, 장면마다 기존 내레이션(voice-lines.js)이 나온다.
// at: 그 장면 자막·목소리가 시작되는 영상 시각(초). 영상 합성 스크립트 _scratch/films-16-20261121/render.py의 구간과 맞춘다.
export const storyFilms = {
 intro: {
  src: '/assets/films/intro', duration: 39.5, label: '이야기 영상', finish: '연구기지로 출발!',
  cues: [
   {at: 0, voice: 'story-1', title: '끊어진 연구기지를 다시 연결해요', text: '도시를 살펴보던 연구 기록이 흩어졌어요. 무엇이 달라졌는지, 어떤 준비가 필요한지 확인할 단서가 필요해요.'},
   {at: 11.6, voice: 'story-2', title: '대원은 생각하고, 잎새는 함께 걸어요', text: '관측하고 → 관련성을 찾고 → 영향을 실험해요. 생활의 선택을 비교한 뒤, 직접 설계한 도시를 시험해요.'},
   {at: 23.9, voice: 'story-3', title: '다섯 기록이 모이면, 나만의 최종 보고!', text: '연구를 마칠 때마다 지도 속 시설에 불빛이 켜져요. 기록을 모아 탐구 인증서를 완성해요. 현실의 기후 문제는 우리 실천으로 계속 대응해야 해요.'}
  ]
 },
 finale: {
  src: '/assets/films/finale', duration: 24.5, label: '마무리 영상', finish: '인증서 받기',
  cues: [
   {at: 0, voice: 'ending-1', title: '다섯 불빛이 켜졌어요', text: '다섯 연구 기록이 모두 연결됐어요. 모은 발견으로 작전실을 켜고 탐구를 마무리해요.'},
   {at: 7.6, voice: 'finale-2', title: '중앙 작전실 보고', text: '다섯 메달이 하나로 이어졌어요. 이제 중앙 작전실에서 탐구 인증서를 받아요.'},
   {at: 15.0, voice: 'ending-2', title: '우리의 탐구는 계속돼요', text: '모형 속 답을 찾았다면, 이제 생활 속 작은 실천을 이어가요.'}
  ]
 }
};
