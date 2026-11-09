// 공용 장면 부품. 편별 데이터(films.data.mjs)가 무대(stage)만 채우고, 머리말·질문·결론·캐릭터 반응은 여기서 같은 규칙으로 만든다.
// 시간표: 15초 = 앱 자막 세 칸(0·5·10초). src/concept-data.js의 CONCEPT_CUES와 테스트(tests/concept-films.test.mjs)가 함께 지킨다.
export const DURATION = 15, FPS = 30, CUES = [0, 5, 10];
export const CAST = {
  squirrel: { name: '잎새', ask: 'squirrel-think', react: 'squirrel-wow' },
  otter: { name: '물방울', ask: 'otter-think', react: 'otter-cheer' },
};
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// "**낱말**"은 강조색(호박색) 한 곳. 낱말 단위로 나눠 차례로 드러낸다.
export function words(text) {
  const chars = []; let key = false;
  for (const part of text.split('**')) { for (const c of part) chars.push([c, key]); key = !key; }
  const out = []; let word = [];
  const flush = () => { if (!word.length) return; let html = '', run = null;
    for (const [c, k] of word) { if (k !== run) { if (run) html += '</em>'; if (k) html += '<em class="key">'; run = k; } html += esc(c); }
    if (run) html += '</em>'; out.push(`<span class="w">${html}</span>`); word = []; };
  for (const ch of chars) ch[0] === ' ' ? flush() : word.push(ch);
  flush(); return out.join(' ');
}
const px = v => `${Math.round(v)}px`;

/** 이름표: (x,y)는 가리키는 물체 위의 점. dir up이면 카드가 위, down이면 아래. */
export function tag(id, x, y, text, { dir = 'up', len = 80, hot = false, small = '' } = {}) {
  const card = `<b class="card" style="${dir === 'up' ? 'bottom' : 'top'}:${px(len)}">${esc(text)}${small ? `<small>${esc(small)}</small>` : ''}</b>`;
  return `<div id="${id}" class="tag ${dir}${hot ? ' hot' : ''}" style="left:${px(x)};top:${px(y)}"><i class="dot"></i><i class="lead" style="height:${px(len)}"></i>${card}</div>`;
}
/** 이름표 등장: 점 → 지시선 0.2초 → 카드 0.3초(작게 튀어나옴). */
export const tagIn = (id, t) => `tl.set('#${id}',{opacity:1},${t});tl.fromTo('#${id} .lead',{scaleY:0},{scaleY:1,duration:.2,ease:'power2.out'},${t});tl.fromTo('#${id} .card',{opacity:0,scale:.7},{opacity:1,scale:1,duration:.3,ease:'back.out(1.6)'},${t + .15});`;

export const img = (id, src, x, y, w, h, cls = 'pic') => `<div id="${id}" class="${cls}" style="left:${px(x)};top:${px(y)};width:${px(w)};${h ? `height:${px(h)}` : ''}"><img src="assets/img/${src}.webp" alt=""></div>`;
/** 막대: 기준선 baseY에서 위로. step은 한 단계 높이(px). 값은 게임 데이터(상대 단계) 그대로. */
export function bars(prefix, x, baseY, values, { step = 60, width = 70, gap = 24, cls = 'new' } = {}) {
  return values.map((v, i) => `<i id="${prefix}${i}" class="bar ${cls}" style="left:${px(x + i * (width + gap))};top:${px(baseY - v * step)};height:${px(v * step)};width:${px(width)}"></i>`).join('');
}
export const growBars = (prefix, n, t, gapT = .12, dur = .5) => `tl.fromTo('${Array.from({ length: n }, (_, i) => `#${prefix}${i}`).join(',')}',{scaleY:0,transformOrigin:'50% 100%'},{scaleY:1,duration:${dur},ease:'expo.out',stagger:${gapT}},${t});`;
export const show = (sel, t, from = { opacity: 0, y: 30 }, dur = .5, ease = 'expo.out') => `tl.fromTo('${sel}',${JSON.stringify(from)},{opacity:1,${'y' in from ? 'y:0,' : ''}${'x' in from ? 'x:0,' : ''}${'scale' in from ? 'scale:1,' : ''}duration:${dur},ease:'${ease}'},${t});`;

/** 한 편의 HTML. body = 무대 안 HTML, js = 무대 타임라인 코드, zoom = {at,scale,x,y} 바뀐 곳 확대. */
export function page(f, css) {
  const cast = CAST[f.cast];
  const zoom = f.zoom ? `tl.fromTo('#zoom',{scale:1,x:0,y:0},{scale:${f.zoom.scale},x:${f.zoom.x},y:${f.zoom.y},duration:.9,ease:'power2.inOut'},${f.zoom.at});` : '';
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(f.title)}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
${css}
${f.css || ''}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DURATION}" data-width="1920" data-height="1080" data-fps="${FPS}">
      <div id="paper" class="clip paper" data-start="0" data-duration="${DURATION}" data-track-index="0"></div>
      <div id="head" class="clip head" data-start="0" data-duration="${DURATION}" data-track-index="1">${esc(cast.name)}의 탐구 노트 <small>· ${esc(f.activity)}</small></div>
      <div id="stage" class="clip stage" data-start="0" data-duration="${DURATION}" data-track-index="2" data-layout-allow-overflow><div id="zoom" class="zoom">${f.body}</div></div>
      <div id="cast" class="clip cast" data-start="0" data-duration="${DURATION}" data-track-index="3"><img id="pose-ask" class="on" src="assets/img/${cast.ask}.webp" alt="${esc(cast.name)}"><img id="pose-react" src="assets/img/${cast.react}.webp" alt=""></div>
      <div id="bubble" class="clip bubble" data-start="0.6" data-duration="4.7" data-track-index="4">${words(f.question)}</div>
      <div id="big" class="clip big" data-start="10.2" data-duration="${(DURATION - 10.2).toFixed(1)}" data-track-index="5">${words(f.conclusion)}</div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${f.body.includes('tag up') ? "tl.set('.tag.up .lead',{transformOrigin:'50% 100%'},0);tl.set('.tag.up .card',{xPercent:-50,transformOrigin:'50% 100%'},0);" : ''}
      ${f.body.includes('tag down') ? "tl.set('.tag.down .lead',{transformOrigin:'50% 0%'},0);tl.set('.tag.down .card',{xPercent:-50,transformOrigin:'50% 0%'},0);" : ''}
      // 머리말과 캐릭터 등장(자세 바뀜은 찌그러짐 → 새 자세 → 복귀).
      tl.fromTo('#cast',{x:420,opacity:0},{x:0,opacity:1,duration:.8,ease:'expo.out'},.3);
      tl.fromTo('#cast',{scaleY:1,transformOrigin:'50% 100%'},{scaleY:.94,duration:.12,ease:'power2.in'},1.05);
      tl.to('#cast',{scaleY:1,duration:.3,ease:'back.out(1.6)'},1.17);
      // 질문(낱말씩 흐림→선명), 5초에 물러남.
      tl.fromTo('#bubble',{opacity:0,scale:.92,transformOrigin:'85% 100%'},{opacity:1,scale:1,duration:.35,ease:'back.out(1.5)'},.6);
      tl.fromTo('#bubble .w',{opacity:0,filter:'blur(6px)'},{opacity:1,filter:'blur(0px)',duration:.13,stagger:.07},.8);
      tl.to('#bubble',{opacity:0,filter:'blur(8px)',duration:.22,ease:'power3.in'},5.0);
      // 바뀌는 순간 캐릭터가 무대를 바라봄.
      tl.fromTo('#cast',{rotation:0},{rotation:-4,duration:.35,ease:'power2.out'},6.2);
      tl.to('#cast',{rotation:0,duration:.45,ease:'power2.inOut'},7.4);
${f.js}
      ${zoom}
      // 결론 한 줄(흐린 글자 → 잉크, 열쇠 낱말은 호박색) + 캐릭터 반응.
      tl.fromTo('#big .w',{color:'#C9D6D0'},{opacity:1,duration:.01,stagger:.09},10.35);
      tl.to('#big .w',{color:'#173F42',duration:.25,stagger:.09},10.45);
      tl.fromTo('#big .key',{color:'#C9D6D0'},{color:'#9A5E0C',duration:.25},10.45);
      tl.to('#cast',{scaleY:.9,duration:.12,ease:'power2.in'},10.9);
      tl.set('#pose-ask',{opacity:0},11.02);
      tl.set('#pose-react',{opacity:1},11.02);
      tl.to('#cast',{scaleY:1,y:-18,duration:.25,ease:'back.out(1.6)'},11.02);
      tl.to('#cast',{y:0,duration:.35,ease:'power2.in'},11.27);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}
