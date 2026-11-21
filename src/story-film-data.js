// 이야기 영상(인트로)과 마무리 영상(파이널). 자막은 영상 안에 들어 있고(burn.py), 장면마다 앱이 그 장면 목소리를 튼다.
// at: 그 장면 목소리가 시작되는 영상 시각(초). 화면 글(title·text)은 읽기 도구용이고 목소리·영상 자막과 같은 글이다.
// 영상 합성: _scratch/films-16-20261121/render3.py, 자막 큐: docs/story-films-20261121/*.json
export const storyFilms = {
 intro: {
  src: '/assets/films/intro', duration: 33.5, label: '이야기 영상', finish: '연구기지로 출발!',
  cues: [
   {at: 0.5, voice: 'story-1', title: '끊어진 연구기지를 다시 연결해요', text: '끊어진 연구기지를 다시 연결해요. 도시를 살펴보던 연구 기록이 흩어졌어요. 무엇이 달라졌는지, 어떤 준비가 필요한지 확인할 단서가 필요해요.'},
   {at: 11.8, voice: 'story-2', title: '대원은 생각하고, 잎새는 함께 걸어요', text: '대원은 생각하고, 잎새는 함께 걸어요. 관측하고 → 관련성을 찾고 → 영향을 실험해요. 생활의 선택을 비교한 뒤, 직접 설계한 도시를 시험해요.'},
   {at: 24.2, voice: 'intro-3', title: '같이 가자!', text: '대원, 네 도움이 필요해! 다섯 시설에 다시 불을 켜러 같이 가자!'}
  ]
 },
 finale: {
  src: '/assets/films/finale', duration: 29.5, label: '마무리 영상', finish: '인증서 받기',
  cues: [
   {at: 0.4, voice: 'ending-1', title: '다섯 불빛이 켜졌어요', text: '다섯 연구 기록이 모두 연결됐어요. 모은 발견으로 작전실을 켜고 탐구를 마무리해요.'},
   {at: 8.0, voice: 'finale-2', title: '중앙 작전실 보고', text: '다섯 메달이 하나로 이어졌어요. 이제 중앙 작전실에서 탐구 인증서를 받아요.'},
   {at: 15.4, voice: 'ending-2', title: '우리의 탐구는 계속돼요', text: '우리의 탐구는 계속돼요. 모형 속 답을 찾았다면, 이제 생활 속 작은 실천을 이어가요.'},
   {at: 22.6, voice: 'finale-4', title: '우리가 해냈어!', text: '대원, 우리가 해냈어! 함께 탐구해서 정말 즐거웠어. 고마워!'}
  ]
 }
};
