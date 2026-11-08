// Illustrations describe places and objects. All values, controls and judgments stay in DOM.
const objects={
  trees:'나무 그늘과 흙바닥을 갖춘 도시숲',
  shade:'지붕 아래 벤치가 있는 그늘 쉼터',
  pond:'빗물을 잠시 모으는 낮은 저류지',
  refuge:'안전하게 머물 수 있는 대피소',
  ground:'물 스며드는 틈과 자갈층이 있는 빗물 흡수 길',
  beach:'모래와 바닷물이 만나는 해변',
  road:'바다 가까이에 놓인 해안 도로',
  wetland:'갈대와 얕은 물이 있는 하구 습지',
  homes:'해안 가까이 모여 있는 주택',
  park:'나무와 산책길이 있는 언덕 공원',
  school:'운동장이 있는 학교',
};
const scenes={
  observe:'날씨를 꾸준히 관측하는 기상 관측소',
  classroom:'아무도 없는 교실에 켜져 있는 조명',
  commute:'자동차와 버스, 보행자가 함께 있는 등굣길',
  cooling:'창문과 냉방기를 살펴볼 수 있는 방',
  workshop:'재료와 에너지로 물건을 만드는 작업장',
  forest:'나무가 남은 곳과 숲이 줄어든 곳',
  drought:'비가 적어 땅이 마른 숲',
  meal:'먹을 양과 남은 음식을 살펴보는 급식실',
  reuse:'종이와 물건을 다시 활용하는 책상',
  repair:'어른과 함께 가방을 고치는 장면',
  bottle:'깨끗하게 씻어 다시 쓰는 물병',
  heat:'더운 날 그늘과 물을 이용하는 쉼터',
  power:'어른과 안전하게 전원을 정리하는 장면',
  home:'밝은 자연 빛이 들어오는 집 안',
};
export const conceptArt=Object.freeze(Object.fromEntries([
  ...Object.entries(objects).map(([id,alt])=>[id,Object.freeze({src:`/assets/concept-art/${id}.webp`,alt,kind:'object'})]),
  ...Object.entries(scenes).map(([id,alt])=>['scene-'+id,Object.freeze({src:`/assets/concept-art/scene-${id}${id==='observe'?'-v2':''}.webp`,alt,kind:'scene'})]),
]));
export const dailyArt=['scene-home','scene-commute','scene-classroom','scene-meal','scene-heat','scene-reuse','scene-repair','scene-cooling','scene-bottle','scene-power'];
export const humanArt=['scene-classroom','scene-commute','scene-cooling','scene-workshop','scene-forest','scene-meal','scene-commute','scene-repair','park','scene-power'];
// A place illustration is context, not a generated prediction of flooding or drought.
export const effectArt=['road','wetland','homes','beach','scene-heat','scene-drought','road','park'];
export const chapterArt=['scene-observe','scene-classroom','beach','scene-home','trees'];
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function artImage(id,className='',decorative=false){
  const art=conceptArt[id];if(!art)return '';
  return `<img class="concept-art art-${art.kind} ${escape(className)}" src="${art.src}" alt="${decorative?'':escape(art.alt)}" width="${art.kind==='scene'?960:512}" height="${art.kind==='scene'?540:384}" loading="lazy" decoding="async" draggable="false">`;
}
