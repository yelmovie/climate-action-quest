// 열 편의 무대. 값은 모두 게임 데이터(src/activity-data.js · evaluateCity)에서 가져온다 — 게임 속 가상 교육 자료이며 실제 관측·예측이 아니다.
// 무대 좌표는 stage(1300×690, 화면 (110,300)) 기준. 시간표: 0–5초 질문과 '전', 5–10초 바뀜·확대·이름표, 10–15초 결론과 반응.
import { evidenceSites, dailyCases, facilities, cityDistricts, coastDistricts, activityTitles } from '../src/activity-data.js';
import { evaluateCity } from '../src/activities.js';
import { tag, tagIn, img, bars, growBars, show } from './kit/kit.mjs';

const site = id => evidenceSites.find(s => s.id === id);
const good = ['shade', 'pond', 'shade', 'pond', 'trees', 'trees'];
const fac = id => facilities.find(f => f.id === id);
const dots = (n, on) => Array.from({ length: n }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('');

// 막대 8개(예전 4 + 최근 4)를 한 기준선에 그리는 차트. 값 = 게임 속 상대 단계.
function longChart(prefix, s, { x, base, step, width = 60, gap = 22, groupGap = 44 }) {
  const old = bars(prefix + 'o', x, base, s.past, { step, width, gap, cls: 'old' });
  const nx = x + 4 * (width + gap) - gap + groupGap;
  const neu = bars(prefix + 'n', nx, base, s.now, { step, width, gap, cls: 'new' });
  const top = (i, v) => ({ x: (i < 4 ? x + i * (width + gap) : nx + (i - 4) * (width + gap)) + width / 2, y: base - v * step });
  return { html: old + neu, nx, top, end: nx + 4 * (width + gap) - gap };
}
function trend(id, a, b, t) {
  const len = Math.hypot(b.x - a.x, b.y - a.y), ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  return { html: `<i id="${id}" class="trend" style="left:${a.x}px;top:${a.y - 30}px;width:${len.toFixed(0)}px"></i>`, js: `tl.set('#${id}',{rotation:${ang.toFixed(2)},scaleX:0},0);tl.to('#${id}',{scaleX:1,duration:.8,ease:'power2.inOut'},${t});` };
}

export const films = [
  (() => { // 0 도시 이상 신호 스캔
    const s = site('summer'), c = longChart('ob', s, { x: 610, base: 560, step: 52 });
    const tr = trend('ob-trend', c.top(0, s.past[0]), c.top(7, s.now[3]), 7.1);
    return {
      id: 'observe', cast: 'parrot', question: '하루 기록만 보면 알 수 있을까?', conclusion: '긴 기록에서 **경향**을 찾아요',
      body: img('ob-pic', 'scene-observe-v2', 0, 30, 520, 293) + `<div id="ob-panel" class="panel" style="left:560px;top:0;width:740px;height:640px"></div><i id="ob-axis" class="axis" style="left:590px;top:560px;width:690px"></i>` +
        `<i id="ob-day" class="bar new" style="left:900px;top:${560 - 5 * 52}px;height:${5 * 52}px;width:60px"></i>` + c.html + tr.html +
        `<p id="ob-note" class="note" style="left:600px;top:580px">${s.unit} · 탐구용 가상 기록</p>` +
        tag('ob-t0', 260, 60, '관측소', { dir: 'down', len: 40 }) + tag('ob-t1', 930, 560 - 5 * 52, '오늘 하루', { len: 60 }) +
        tag('ob-t2', 733, c.top(3, 4).y, '예전 기록', { len: 120 }) + tag('ob-t3', c.top(6, 7).x - 41, c.top(7, 8).y, '최근 기록', { len: 60, hot: true }),
      js: show('#ob-pic', .8) + tagIn('ob-t0', 2.0) + show('#ob-panel,#ob-axis', 1.4, { opacity: 0 }, .4) +
        `tl.fromTo('#ob-day',{scaleY:0,transformOrigin:'50% 100%'},{scaleY:1,duration:.6,ease:'expo.out'},2.6);` + tagIn('ob-t1', 3.2) +
        `tl.to('#ob-day,#ob-t1',{opacity:0,duration:.25,ease:'power3.in'},5.05);` + growBars('obo', 4, 5.3, .14) + growBars('obn', 4, 6.1, .14) + show('#ob-note', 5.6, { opacity: 0 }, .4) + tr.js +
        tagIn('ob-t2', 8.2) + tagIn('ob-t3', 8.8),
      zoom: { at: 7.7, scale: 1.08, x: 20, y: 10 },
    };
  })(),
  (() => { // 1 증거 판독실
    const s = site('warm'), c = longChart('ev', s, { x: 620, base: 540, step: 62, width: 58, gap: 20 });
    return {
      id: 'evidence', cast: 'otter', question: '눈이 온 날, 기후가 바뀐 걸까?', conclusion: '기후는 **긴 기간**의 기록으로 판단해요',
      body: img('ev-card', 'scene-snow-day', 0, 80, 500, 360) +
        `<p class="note" style="left:40px;top:470px;opacity:.95;font-size:38px">오늘의 눈</p>` +
        `<div id="ev-panel" class="panel" style="left:540px;top:0;width:760px;height:640px"></div><i id="ev-axis" class="axis" style="left:575px;top:540px;width:700px"></i>` + c.html +
        `<p id="ev-note" class="note" style="left:600px;top:560px">${s.unit} · 탐구용 가상 기록</p>` +
        tag('ev-t1', 235, 580, '하루 날씨', { dir: 'down', len: 30 }) + tag('ev-t2', c.top(5, 5).x, c.top(7, 6).y, '여러 해 기록', { len: 80, hot: true, small: '기후를 판단해요' }) +
        tag('ev-t3', 930, 600, '같은 장소 · 같은 기준', { dir: 'down', len: 30 }),
      js: show('#ev-card', 1.0, { opacity: 0, scale: .94 }) + tagIn('ev-t1', 3.2) +
        `tl.to('#ev-card',{opacity:.55,duration:.4},5.1);` + show('#ev-panel,#ev-axis', 5.2, { opacity: 0 }, .4) + growBars('evo', 4, 5.6, .14) + growBars('evn', 4, 6.4, .14) + show('#ev-note', 5.8, { opacity: 0 }, .4) +
        tagIn('ev-t2', 8.2) + tagIn('ev-t3', 8.9),
      zoom: { at: 7.5, scale: 1.06, x: 0, y: 0 },
    };
  })(),
  { // 2 도시 활동 스캐너 — 사선으로 겹친 세 장면(나란한 카드 아님)
    id: 'resources', cast: 'parrot', question: '생활 속 어디에 자원이 쓰일까?', conclusion: '생활 곳곳에서 **자원**을 아껴요',
    body: img('rs-a', 'scene-classroom', 0, 0, 600, 338) + img('rs-b', 'scene-repair', 340, 175, 600, 338) + img('rs-c', 'scene-forest', 680, 350, 600, 338) +
      tag('rs-t1', 330, 140, '전기', { len: 60, small: '빈 교실의 조명' }) + tag('rs-t2', 640, 290, '자원과 에너지', { len: 60, small: '고쳐 쓰기' }) + tag('rs-t3', 990, 470, '숲', { len: 60, hot: true, small: '나무 지키기' }),
    js: show('#rs-a', 1.2, { opacity: 0, x: -60 }, .6) + tagIn('rs-t1', 2.6) +
      `tl.to('#rs-a,#rs-t1',{opacity:.5,duration:.4},5.0);` + show('#rs-b', 5.3, { opacity: 0, x: -60 }, .6) + tagIn('rs-t2', 6.1) +
      `tl.to('#rs-b,#rs-t2',{opacity:.5,duration:.4},7.0);` + show('#rs-c', 7.2, { opacity: 0, x: -60 }, .6) + tagIn('rs-t3', 8.1) +
      `tl.to('#rs-a,#rs-t1,#rs-b,#rs-t2',{opacity:1,duration:.5},9.2);`,
  },
  { // 3 관련성 추적망 — 활동 → 자원 → 대응 한 줄로 자라는 그림
    id: 'connections', cast: 'otter', question: '냉방과 기후는 어떻게 이어질까?', conclusion: '활동 → **자원** → 대응으로 이어요',
    body: img('cn-pic', 'scene-cooling', 0, 120, 560, 315) + `<i id="cn-a1" class="arrow" style="left:580px;top:276px;width:120px"></i>` +
      `<div id="cn-b" class="chip" style="left:730px;top:220px">냉방 전기를 더 써요</div><i id="cn-a2" class="arrow" style="left:915px;top:330px;width:150px"></i>` +
      `<div id="cn-c" class="chip" style="left:730px;top:500px">창문 닫고 알맞게 냉방</div>` +
      `<p id="cn-n1" class="note" style="left:20px;top:70px">활동</p><p id="cn-n2" class="note" style="left:740px;top:170px">자원 사용</p><p id="cn-n3" class="note" style="left:740px;top:450px">대응</p>` +
      tag('cn-t1', 280, 435, '창문 연 채 냉방', { dir: 'down', len: 50 }),
    js: show('#cn-pic', 1.2, { opacity: 0, scale: .94 }) + show('#cn-n1', 1.6, { opacity: 0 }, .4) + tagIn('cn-t1', 2.8) +
      `tl.fromTo('#cn-a1',{scaleX:0},{scaleX:1,duration:.5,ease:'power2.inOut'},5.3);` + show('#cn-b', 5.7) + show('#cn-n2', 5.9, { opacity: 0 }, .4) +
      `tl.set('#cn-a2',{rotation:90},0);tl.fromTo('#cn-a2',{scaleX:0},{scaleX:1,duration:.5,ease:'power2.inOut'},6.8);` + show('#cn-c', 7.3) + show('#cn-n3', 7.5, { opacity: 0 }, .4) +
      `tl.to('#cn-b',{borderColor:'#C9821C',backgroundColor:'#FFF3D6',duration:.3},8.3);`,
    zoom: { at: 8.6, scale: 1.08, x: 20, y: 0 },
  },
  (() => { // 4 해수면 미래 실험 — 땅 높이(게임의 coastDistricts)와 수위 1·2·3
    const unit = 82, ground = h => 610 - h * unit, xs = [120, 330, 530, 730, 940, 1150];
    const places = coastDistricts.map((d, i) => ({ ...d, x: xs[i], y: ground(d.height) }));
    const steps = places.map((p, i) => `${i ? 'L' : 'M'}${p.x - 105} ${p.y + 22} L${p.x + 105} ${p.y + 22}`).join(' ');
    const level = l => ground(l) + 22;
    return {
      id: 'water', cast: 'parrot', question: '물이 높아지면 어디부터 닿을까?', conclusion: '**낮은 곳**부터 물이 닿아요',
      body: `<div id="wt-box" class="panel" style="left:0;top:0;width:1300px;height:690px;overflow:hidden;background:#EEF6E8"><svg width="1300" height="690" style="position:absolute;left:0;top:0"><path d="${steps} L1300 ${places[5].y + 22} L1300 690 L0 690 L0 ${places[0].y + 22} Z" fill="#D9C38F" stroke="#A5B57A" stroke-width="5"/></svg>` +
        places.map((p, i) => `<div id="wt-p${i}" class="obj" style="left:${p.x - 115}px;top:${p.y - 150}px;width:230px"><img src="assets/img/${p.id}.webp" alt=""></div>`).join('') +
        `<div id="wt-water" class="water" style="left:0;top:0;width:1300px;height:690px"></div></div>` +
        tag('wt-t0', places[0].x, places[0].y - 120, '높이 1', { len: 40 }) + tag('wt-t1', places[1].x, places[1].y - 120, '높이 2', { len: 40 }) +
        tag('wt-t3', places[3].x, places[3].y - 120, places[3].name, { len: 40, hot: true, small: '높이 3 · 물이 닿아요' }) + tag('wt-t4', places[4].x, places[4].y - 130, places[4].name, { len: 60, small: '높이 4 · 아직 괜찮아요' }),
      js: show('#wt-box', .8, { opacity: 0 }, .4) + places.map((_, i) => show(`#wt-p${i}`, 1.3 + i * .3, { opacity: 0, y: -40 }, .5)).join('') +
        `tl.set('#wt-water',{y:${level(0) + 20}},0);` + [1, 2, 3].map((l, i) => `tl.to('#wt-water',{y:${level(l)},duration:.7,ease:'power1.inOut'},${5.2 + i});`).join('') +
        tagIn('wt-t0', 5.9) + tagIn('wt-t1', 6.9) + tagIn('wt-t3', 8.4) + tagIn('wt-t4', 9.0),
      zoom: { at: 7.9, scale: 1.1, x: 20, y: 40 },
    };
  })(),
  { // 5 영향 연쇄 분석 — 많은 비 사례에서 변화 → 영향 → 대응
    id: 'effects', cast: 'otter', question: '물이 고인 길, 어떻게 해야 할까?', conclusion: '변화 → **영향** → 대응을 이어요',
    body: img('ef-scene', 'scene-rain-safety', 0, 0, 1300, 690) +
      tag('ef-t1', 260, 520, '낮은 길에 물이 고여요', { len: 110, small: '변화' }) +
      tag('ef-t2', 590, 330, '지나기 어려워요', { len: 110, small: '영향' }) +
      tag('ef-t3', 1070, 300, '어른과 안전한 길로', { dir: 'down', len: 190, hot: true, small: '대응' }),
    js: show('#ef-scene', .8, { opacity: 0 }, .5) + tagIn('ef-t1', 2.0) + tagIn('ef-t2', 5.5) + tagIn('ef-t3', 8.0),
  },
  { // 6 오늘의 기후 선택 — 더운 날 쉬는 시간(dailyCases[4])
    id: 'choices', cast: 'parrot', question: '더운 날, 전기를 아끼려고 참을까?', conclusion: '**건강과** 안전을 먼저 지켜요',
    body: img('ch-pic', 'scene-heat', 0, 40, 740, 416) + `<div id="ch-a" class="chip" style="left:800px;top:110px">물과 그늘에서 쉬기</div><div id="ch-b" class="chip" style="left:800px;top:330px">더위를 계속 참기</div>` +
      `<i id="ch-x" data-layout-allow-occlusion class="strike" style="left:790px;top:372px;width:420px"></i><i id="ch-ok" class="check" style="left:1210px;top:98px"></i>` +
      tag('ch-t1', 1000, 430, '몸이 위험해요', { dir: 'down', len: 50 }) + tag('ch-t2', 1000, 110, '건강과 안전 먼저', { len: 50, hot: true }),
    js: show('#ch-pic', 1.1, { opacity: 0, scale: .95 }) + show('#ch-a', 2.4, { opacity: 0, x: 40 }) + show('#ch-b', 2.8, { opacity: 0, x: 40 }) +
      `tl.fromTo('#ch-x',{scaleX:0},{scaleX:1,duration:.4,ease:'power2.out'},5.4);tl.to('#ch-b',{opacity:.6,duration:.3},5.6);` + tagIn('ch-t1', 6.0) +
      `tl.fromTo('#ch-ok',{opacity:0,scale:.4},{opacity:1,scale:1,duration:.35,ease:'back.out(1.8)'},7.0);tl.to('#ch-a',{borderColor:'#C9821C',backgroundColor:'#FFF3D6',duration:.3},7.0);` + tagIn('ch-t2', 7.6),
    zoom: { at: 8.2, scale: 1.08, x: -20, y: 20 },
  },
  (() => { // 7 선택 비교와 실천 — 등교(dailyCases[1]) 두 선택의 게임 지표 [기후 부담, 생활 만족, 자원 사용]
    const c = dailyCases[1], [walk, car] = [c.options[0], c.options[1]], step = 75, base = 610;
    const panel = (id, x, title, vals) => `<div id="${id}" class="panel" style="left:${x}px;top:240px;width:600px;height:450px"></div><p id="${id}-h" class="note" style="left:${x + 30}px;top:250px;opacity:.95;font-size:38px">${title}</p>` +
      bars(id + '-b', x + 65, base, vals, { step, width: 110, gap: 70, cls: id === 'cp-l' ? 'rust' : 'new' }) + ['기후 부담', '생활 만족', '자원 사용'].map((l, i) => `<p class="note" style="left:${x + 55 + i * 180}px;top:${base + 12}px;font-size:28px">${l}</p>`).join('');
    return {
      id: 'compare', cast: 'otter', question: '한 가지만 바꾸면 무엇이 달라질까?', conclusion: '만족은 지키고 사용은 **줄였어요**',
      body: img('cp-pic', 'scene-commute', 0, 0, 380, 214) + `<p id="cp-n" class="note" style="left:420px;top:70px">바꾼 것: 이동 방법 하나 · 다른 조건은 같게</p>` +
        panel('cp-l', 0, '한 사람씩 자동차', car[1]) + panel('cp-r', 680, '어른과 함께 걷기', car[1]) +
        tag('cp-t1', 680 + 65 + 2 * 180 + 55, base - walk[1][2] * step, '줄었어요', { len: 70, hot: true }) + tag('cp-t2', 680 + 65 + 180 + 55, base - walk[1][1] * step, '그대로', { len: 20 }),
      js: show('#cp-pic', .9, { opacity: 0 }, .4) + show('#cp-l,#cp-l-h', 1.4, { opacity: 0, y: 30 }) + growBars('cp-l-b', 3, 1.9) + show('#cp-r,#cp-r-h', 2.9, { opacity: 0, y: 30 }) + growBars('cp-r-b', 3, 3.4) +
        show('#cp-n', 5.2, { opacity: 0 }, .4) + walk[1].map((v, i) => v !== car[1][i] ? `tl.to('#cp-r-b${i}',{scaleY:${v / car[1][i]},duration:.8,ease:'power2.inOut'},${5.7 + i * .2});` : '').join('') +
        tagIn('cp-t1', 7.0) + tagIn('cp-t2', 7.7),
      zoom: { at: 8.3, scale: 1.08, x: -10, y: -20 },
    };
  })(),
  (() => { // 8 미래도시 설계 — 구역 위험(cityDistricts)과 시설(good 배치)
    const W = 400, H = 300, pos = i => ({ x: (i % 3) * 450, y: 20 + Math.floor(i / 3) * 340 }), used = good.reduce((n, id) => n + fac(id).cost, 0);
    const tile = (d, i) => { const p = pos(i); return `<div id="ds-d${i}" class="panel" style="left:${p.x}px;top:${p.y}px;width:${W}px;height:${H}px"><p class="note" style="left:24px;top:18px;opacity:.95;font-size:36px">${d.name}</p>` +
      `<div class="meter heat" style="left:24px;top:220px">더위 ${dots(4, d.heat)}</div><div class="meter rain" style="left:24px;top:258px">비 ${dots(4, d.rain)}</div>` +
      `<div id="ds-f${i}" class="obj" style="left:190px;top:60px;width:200px"><img src="assets/img/${good[i]}.webp" alt=""></div></div>`; };
    return {
      id: 'design', cast: 'parrot', question: '구역마다 어떤 시설이 맞을까?', conclusion: '**위험**에 맞는 시설을 골라요',
      body: cityDistricts.map(tile).join('') + `<p id="ds-n" class="note" style="left:960px;top:-40px">자원 ${18} 중 ${used} 사용</p>` +
        tag('ds-t1', 290, 90, `더위 → ${fac('shade').name}`, { len: 50, hot: true }) + tag('ds-t2', 740, 90, `빗물 → ${fac('pond').name}`, { len: 50 }),
      js: cityDistricts.map((_, i) => show(`#ds-d${i}`, 1.0 + i * .15, { opacity: 0, y: 30 })).join('') +
        cityDistricts.map((_, i) => `tl.fromTo('#ds-f${i}',{opacity:0,y:-70},{opacity:1,y:0,duration:.5,ease:'back.out(1.4)'},${5.2 + i * .3});`).join('') + show('#ds-n', 7.2, { opacity: 0 }, .4) +
        tagIn('ds-t1', 8.2) + tagIn('ds-t2', 8.8),
      zoom: { at: 7.5, scale: 1.06, x: 20, y: 20 },
    };
  })(),
  (() => { // 9 기후 스트레스 테스트 — 같은 폭염 조건, 시설 없음 → 시설 있음(evaluateCity)
    const empty = evaluateCity(Array(6).fill(null), 'heat'), built = evaluateCity(good, 'heat'), pos = i => ({ x: (i % 3) * 450, y: 60 + Math.floor(i / 3) * 320 });
    const tile = (d, i) => { const p = pos(i); return `<div id="ts-d${i}" class="panel" style="left:${p.x}px;top:${p.y}px;width:400px;height:280px"><p class="note" style="left:24px;top:16px;opacity:.95;font-size:34px">${d.name}</p>` +
      `<div id="ts-f${i}" class="obj" style="left:220px;top:40px;width:170px"><img src="assets/img/${good[i]}.webp" alt=""></div><i class="axis" style="left:24px;top:240px;width:320px;background:#E3E8DD;height:22px;border-radius:11px"></i>` +
      `<i id="ts-b${i}" class="axis" style="left:24px;top:240px;width:${80 * empty.districts[i].risk}px;height:22px;border-radius:11px;background:#C2703F;transform-origin:0 50%"></i><p class="note" style="left:24px;top:196px;font-size:26px">남은 영향</p></div>`; };
    return {
      id: 'test', cast: 'otter', question: '시설을 놓으면 정말 나아질까?', conclusion: '**같은** 조건으로 다시 시험해요',
      body: `<div id="ts-c1" class="chip" style="left:0;top:-30px;font-size:36px;padding:10px 24px 8px">폭염 시험 · 시설 없음</div><div id="ts-c2" class="chip" style="left:0;top:-30px;font-size:36px;padding:10px 24px 8px;border-color:#C9821C">같은 폭염으로 다시 시험</div>` +
        cityDistricts.map(tile).join('') + tag('ts-t1', 900, -60, `남은 영향 ${empty.total} → ${built.total}`, { dir: 'down', len: 10, hot: true }),
      js: `tl.set('#ts-c2',{opacity:0},0);` + cityDistricts.map((_, i) => show(`#ts-d${i}`, .9 + i * .12, { opacity: 0, y: 30 })).join('') + cityDistricts.map((_, i) => `tl.set('#ts-f${i}',{opacity:0},0);`).join('') +
        show('#ts-c1', 1.8, { opacity: 0, x: -30 }) + `tl.fromTo('${cityDistricts.map((_, i) => '#ts-b' + i).join(',')}',{scaleX:0},{scaleX:1,duration:.7,ease:'expo.out',stagger:.1},2.4);` +
        cityDistricts.map((_, i) => `tl.fromTo('#ts-f${i}',{opacity:0,y:-60},{opacity:1,y:0,duration:.45,ease:'back.out(1.4)'},${5.2 + i * .2});`).join('') +
        `tl.to('#ts-c1',{opacity:0,duration:.2},6.6);` + show('#ts-c2', 6.7, { opacity: 0, x: -30 }) +
        built.districts.map((d, i) => `tl.to('#ts-b${i}',{scaleX:${(d.risk / empty.districts[i].risk || 0).toFixed(3)},duration:.8,ease:'power2.inOut'},${7.1 + i * .08});`).join('') + tagIn('ts-t1', 8.4),
    };
  })(),
].map((f, i) => ({ ...f, activity: activityTitles[i], title: `${activityTitles[i]} 개념 영상` }));
