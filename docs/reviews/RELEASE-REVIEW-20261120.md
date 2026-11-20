# 기후 미래 작전실 최종 재점검 (최신 커밋 운영 빌드 기준)

> 점검 2026-11-20 10:00~12:30 · 브랜치 `main` · 기준 커밋(앱 코드) `6a789cf` · 운영 https://climate-action-quest.yelsam.workers.dev · 운영 배포 버전 `b95463c9-04c8-4827-86fb-2fcd43f29231`(2026-11-20 01:40 KST)
> 스킬 `edu-final-check`, 지침 `_shared/FINAL-RECHECK-20261120.md` 16번 줄. **대상은 운영 주소에 올라가 있는 빌드**이고, 브라우저 점검은 전부 운영 주소로 했다. 지난 판정을 옮겨 적지 않았다. 이번에 다시 보지 못한 항목은 NOT TESTED로 적었다.
> 점검 중(10:29) 다른 세션이 앱 커밋 `a5a786d`(저작권·제작 표기 문구 통일, `src/main.js` 6줄·`assets/CREDITS.md`)를 올렸다. 이 문서 작성 시점(12:40) 운영은 아직 `6a789cf` 빌드(prodcmp 일치 40/40)라 판정 대상은 그대로 `6a789cf`다. 그 세션은 `src/main.js`·`src/frontdoor.css`를 더 고치는 중이다(미커밋, 건드리지 않음).
> 지난 점검: `RELEASE-REVIEW-20261118.md`(11-19 저녁 절, 문서 커밋 `be04423`) · `SCORE-20261119.md` 86점.

## 최종 판정

**조건부 배포 가능** · 성적 84/100 (`SCORE-20261120.md`, 지난 86점)

### 왜 이 판정인가

- 운영 빌드는 기준 커밋 `6a789cf`의 빌드와 같다(index MATCH, JS·CSS 40개 해시 일치, `prodcmp.sh 16`).
- 지난 점검 뒤 들어온 코드 커밋 5개는 소리 2·3차, 한국어 줄바꿈 균형, 성취 카드 잠긴 문구다. 운영에서 모두 기대대로 동작했다(아래 「그 뒤 들어간 변경」).
- 홈부터 72단위·인증서·새로고침까지 운영에서 실제 클릭으로 완주했다. 312화면 레이아웃과 8해상도 208상태 스윕은 0건이다. 오프라인 재방문, 저장 보호, 미션 터치(5개 화면 크기)도 통과했다.
- FAIL은 없다. 조건부인 이유는 실기기·사람 확인 항목이 남았기 때문이다.
  - 학생 난이도·40분 수업(A6·A8·B16)
  - 학교 태블릿 FPS(D9·D10)
  - 반투명 배경 위 글자 대비 전수(C9), 텍스트 확대(C25)
  - 카카오톡 미리보기·iOS 인쇄(G18·G19)
  - 제공 AI 그림의 상업 이용 증빙(F12)
- **새로 찾은 WARNING 2건**: B18과 E12. 이번 5개 커밋과는 무관하게 11-12·11-14부터 있던 것이다. 지금까지 이 검사 스크립트(`check-voices`)를 돌리지 않아 놓쳤다.

### 배포 전 처리할 조건

1. 없음. B18(활동 5·7 다시 하기 음성)은 학습 문구 변경이나 새 녹음이 필요해서 이번 범위 밖이다. 교사 결정 사항으로 넘긴다(아래 12항목).

### 배포 후 확인할 것

1. 실제 학교 태블릿에서 지도·활동 화면 끊김(D9·D10).
2. 카카오톡 링크 미리보기와 iPad 인증서 인쇄(G18·G19).

---

## 지난 점검 대비 달라진 판정

| 항목 | 11-19 저녁 | 이번 | 이유 |
|---|---|---|---|
| B18 피드백 동기화 | PASS | **WARNING(확인됨)** | 활동 5·7에서 순서·선택을 틀렸을 때 녹음된 「다시 하기」 음성(`retry-5`·`retry-7`)이 붙지 않는다. 아래 12항목 |
| E12 테스트 실패 | PASS | **WARNING(확인됨)** | `scripts/check-voices.mjs`는 위 문제로 활동 5에서 멈춘다. 또 11-10 이후 추가된 대사(brief·learn·개념·악당·인증서 86개)를 모르는 낡은 전체 목록 비교로 끝난다. `scripts/check-save-safety.mjs`는 운영처럼 설정 내용을 늦게 받는 환경에서 설정 창이 뜨기 전에 칸을 펼치려 했다(타이밍). 이것은 이번에 한 줄 고쳐 통과시켰다 |
| 그 밖 | — | 같음 | D2·D6 PASS 유지(1MB 넘는 그림 0, Jua 미배포 확인) |

## 요약

| 영역 | PASS | WARNING | FAIL | NOT TESTED | N/A |
|---|---|---|---|---|---|
| A 교육적 품질 | 15 | 0 | 0 | 2 | 0 |
| B 기능 | 17 | 1 | 0 | 1 | 0 |
| C 태블릿·UI | 22 | 0 | 0 | 2 | 1 |
| D 성능 | 9 | 2 | 0 | 2 | 1 |
| E 코드 품질 | 10 | 3 | 0 | 0 | 1 |
| F 데이터·안전 | 14 | 1 | 0 | 0 | 0 |
| G 배포 | 18 | 0 | 0 | 2 | 0 |
| **합계** | **105** | **7** | **0** | **9** | **3** |

(11-19 저녁: PASS 107 · WARNING 5 · FAIL 0 · NOT TESTED 9 · N/A 3)

## 실행 환경 (실측)

| 항목 | 값 |
|---|---|
| 작업 트리 | `main` = `origin/main`(`1ef4ded`, 기록 커밋). 미커밋 앱 변경 없음(추적 안 된 `.wrangler/`·`graphify-out/`·`output*/`·`references/suno/`는 다른 작업물, 건드리지 않음) |
| 운영 일치 | `prodcmp.sh 16`: app=`6a789cf`, 빌드 최신, index MATCH, 파일 일치 40 불일치 0 |
| 빌드 근거 | `_scratch/deploy-20261118/wt/16/dist`(운영과 해시 일치) 336 files. 1MB 넘는 그림 0, 5MB 넘는 음원·영상 0(가장 큰 것 `main-theme.mp3` 2.55MiB) |
| 브라우저 | macOS Chrome 헤드리스(`playwright-core`, 소리 확인은 `--autoplay-policy=document-user-activation-required`). 대상은 전부 운영 주소. 로그·JSON·스크린숏은 `.tmp/final-recheck-20261120/`(Git 제외) |

| 명령 | 결과 |
|---|---|
| install · lint · typecheck | NOT APPLICABLE(의존성·정의 없음) |
| `npm test` | PASS 76/76 |
| `check:layout` | PASS · 312화면(1280·1024·1920·873 등), errors·clipped·overlaps·small·scroll 0 |
| `check:screen` | PASS · 8해상도 208상태, failures·errors 0, 최소 글자 18px |
| `check:journey` | PASS · 홈→이야기→지도→시설→활동 0~9 72단위→엔딩→인증서 내려받기→새로고침, 주입 완료 없음 |
| `check:flow` | PASS · 저장·이어하기·옛 저장 호환·10개 활동 기록 유지, errors 0 |
| `check:interactions` | PASS · 개념 영상 멈춤·자막·실패 포스터·reduced motion 등, errors 0 |
| `check:playback` | PASS · 활동 자동재생, 나갈 때 늦은 저장 없음 |
| `check:mission` | PASS · 1280·1024×600·915×412·830×515·390×844·768×1024 터치, 미션 3개, 포커스, 되돌리기, 새로고침, 회전, 초기화 백업 |
| `check:first-load` | PASS · 시작 버튼 1,165ms, 그림 1,374ms, 첫 전송 1.02MiB, 뒷 단계 자원 0, 외부 요청 0. 모의 20Mbps 1,687ms. 6해상도 홈·이야기·지도 0건 |
| `check-delivery.mjs`(운영은 이제 Range 206을 주므로 기본 모드) | PASS · MP4 구간 요청·MIME, 오프라인 새로고침, 오프라인 WebM·MP4 대체, 힌트 열고 닫기 |
| `check-save-safety.mjs` | 처음 FAIL(스크립트 타이밍) → 한 줄 수정 뒤 PASS · 교사 미리보기가 학생 기록 안 바꿈, 손상 원본 보호, 다른 탭 보호, 4해상도 가로 넘침 0 |
| `check-voice-controls.mjs` | PASS · 경로 이동 시 재생 멈춤, 네트워크 실패 시 글·학습 조작 유지 |
| `check-voices.mjs` | **FAIL → 활동 5 다시 하기 음성 없음**. 5·7을 뺀 사본으로 화면 연결 38개 PASS, 운영 음성 파일 126개 모두 200 |
| 소리 확인 `sound-probe.mjs`·`concept-probe.mjs` | 아래 「그 뒤 들어간 변경」 |

---

## 그 뒤 들어간 변경 확인 (`be04423..6a789cf`)

| 커밋 | 내용 | 운영 확인(귀 대신 상태 값) |
|---|---|---|
| `a11c9a4`·`bc3154b` 소리 2차 | 효과음 갈래 분리, 지도 발자국, 스테이지 열림 소리, 대사 차례 | 새 효과음 4개(`open-03`·`step-01`·`step-02`·`twinkle-03`) 200. 지도·카드 흐름은 `check:journey` 완주에서 오류 0. 발자국·열림 소리의 실제 들림은 귀로 확인하지 못함 |
| `661e2b5` 줄바꿈 균형 | `korean-linebreak.css`(keep-all·pretty·balance), 첫 화면 부제목·환영 자막 보정 | 3뷰포트(1280×800·1024×768·1920×1080)를 포함한 `check:layout` 312화면·`check:screen` 208상태에서 잘림·넘침·버튼 밖 글 0 |
| `ec59e90` 성취 카드 잠긴 문구 | 좁은 카드에서 「악당을 / 물리치면 / 열려요」 | 보관함 잠긴 카드 5장: 1280·1920은 한 줄, 1024는 세 줄. 모두 카드 안, 넘침 0(`album-*.png`) |
| `6a789cf` 소리 3차 | 목소리 스위치 분리, 옛 저장 이어받기, 첫 입력 전 음성 시도 안 함 | 첫 입력 전 4초 재생 시도 **0**. 「연구 시작하기」 뒤 이야기 음성 재생, 배경음 0.063(=25%×음성 아래 0.25). 설정에 배경 음악·효과음·목소리 스위치 3개. 셋 다 끄면 저장값 `bgm/sfx/voice:false`, 배경음 멈춤, 크기 슬라이더 비활성, 헤더 「전체 소리 켜기」. 다시 켜면 재생. 배경 음악 크기 50 → `volume` 0.5. 헤더 버튼 한 번으로 셋 다 끔·켬 |
| (공통) 개념 영상 뒤 배경음 복귀 | — | 영상 재생 중 배경음 0.25 → 0.063, 영상 `muted:true`, Esc로 닫으면 0.25로 복귀 |
| (공통) 이야기 영상 목소리 끔 | 1·2·3·4·7·8번 대상 | 16번은 대상 아님(NOT APPLICABLE) |
| 회귀: 설정 창 닫기 | — | 위 X 0개, 오른쪽 아래 「닫기」 1개(창 오른쪽에서 48px·아래에서 26px), 「닫기」·Esc 모두 닫힘 |
| 회귀: 콘솔·404 | — | 소리 확인 중 콘솔 오류·4xx 0. 모든 점검 스크립트 `errors: []` |

---

## A~G 판정 근거

| 항목 | 판정 | 근거 |
|---|---|---|
| A1~A5, A7, A9~A15 | PASS(확인됨) | 학습 문구·판정·데이터 파일(`activities.js`·`activity-data.js`·`concept-data.js`·`state.js`·`settings-content.js`·`voice-lines.js`)은 지난 점검과 바이트까지 같다(`git diff be04423 6a789cf` 0줄). 운영에서 10개 활동을 실제 조작으로 완주했다(`check:journey`·`check:flow`의 오답·재시도·비교 경로 포함). 성취기준·목표 구조는 `settings-content.js` 교사용 가이드 |
| A16, A17 | PASS(확인됨) | 활동마다 조작이 다르다(관측 핫스팟·판단·자원 배분·연결·예측 실행·순서·선택·비교·도시 설계·조건 시험). `check:mission`·`check:flow`로 단계 상승 확인 |
| A6, A8 | NOT TESTED | 학생 대상 난이도·무작위 클릭 전수 평가는 사람 관찰이 필요 |
| B1~B15, B17, B19 | PASS(확인됨) | `check:journey`(시작→완료·인증서), `check:flow`(자동 저장·이어하기·새로고침 복원 B9·B10·B14), `check:mission`(되돌리기·초기화 백업 B11), `check-save-safety`(교사 미리보기·손상 저장), 브라우저 뒤로가기 → `#map` 정상(B13) |
| B18 | **WARNING(확인됨)** | 활동 5·7 틀린 답의 녹음 음성 미연결. 아래 12항목 |
| B16 | NOT TESTED | 40분 수업 실측 없음 |
| C1~C8, C10~C21, C23, C24 | PASS(확인됨) | `check:layout` 312화면, `check:screen` 8해상도 208상태, `check:first-load` 6해상도 0건. 최소 글자 18px(1920에서 20px). 44px 미만 버튼 0. 가로 넘침 0(`check-save-safety` 4해상도). 회전·포커스(`check:mission`), reduced motion(`check:interactions`). 줄바꿈은 위 「그 뒤 들어간 변경」 |
| C9 | NOT TESTED | 그림 위 반투명 카드 글자 대비 전수 측정 없음 |
| C22 | NOT APPLICABLE | Phaser 같은 캔버스↔DOM 겹침 엔진 없음(지도 캔버스는 표시용) |
| C25 | NOT TESTED | 브라우저 줌 125%·텍스트 200%는 이번에 재지 않음 |
| D1 | PASS(확인됨) | 운영 실측 시작 버튼 1,165ms, 20Mbps 1,687ms |
| D2, D3, D5~D8, D11, D12 | PASS(확인됨) | 1MB 넘는 그림 0, 5MB 넘는 음원·영상 0. Jua 미배포(운영 404). 의존성 없음. 오프라인 재방문(`check-delivery`). 런타임 외부 요청 0. D8은 `check:playback`의 해제·늦은 저장 없음 |
| D13 | WARNING(추정) | 정적 위험(그림자 전환·`backdrop-filter`·지도 `will-change`). 실측 없이 FPS 저하로 단정하지 않음 |
| D14 | WARNING(확인됨) | 나눔스퀘어 네오 WOFF2 2개 합 754KiB, 전체 글리프. 인증서 이름 칸에 임의 한글이 들어와 부분 글꼴 불가 |
| D4 | NOT APPLICABLE | 3D 없음 |
| D9, D10 | NOT TESTED | 저사양 태블릿 FPS 실측 없음 |
| E1, E3, E5~E11, E13 | PASS(확인됨) | 콘솔 오류 0(모든 스크립트·소리 확인), 404 0, 비밀키 0(`service_role`·API 키 문자열 0), lock 파일 없음(의존성 없음), 빌드 336 files(운영 일치) |
| E2 | WARNING(확인됨) | `src/activities.js` 긴 렌더 함수, 이번에도 그대로 |
| E12 | **WARNING(확인됨)** | 위 「달라진 판정」. `check-save-safety`는 고침, `check-voices`는 남음 |
| E14 | WARNING(확인됨) | `references/`의 생성기 기본 파일명(`chatgpt_generated_*.png`). 출처 추적용이라 유지, 배포 제외 |
| E4 | NOT APPLICABLE | TypeScript 아님 |
| F1~F11, F13~F15 | PASS(확인됨) | 이름 수집 없음, 저장 키 `climate-future:v1`·`climate-future:sound:v1`, `version:1`, 옛 저장 이어받기(`check:flow` legacy), 손상·다른 탭 보호(`check-save-safety`), 외부 전송 0, 외부 링크 0 |
| F12 | WARNING | 제공 AI 그림 상업 이용 권리 증빙 미완결(사람 확인) |
| G1~G17, G20 | PASS(확인됨) | 운영 `/` 200, 없는 경로 404, `#map` 새로고침 200, OG 이미지 200(159KB), 파비콘·매니페스트·`sw.js` 200, 운영=기준 커밋 빌드. 롤백 대상은 아래 |
| G18, G19 | NOT TESTED | 카카오톡 미리보기·iOS 인쇄 실기 미확인 |

---

## 문제 12항목

### 1. 활동 5·7에서 틀렸을 때 녹음된 「다시 하기」 음성이 나오지 않는다 (B18)

1. **문제 제목**: 활동 5(영향 연결)·7(생활 비교) 오답 음성 미연결
2. **우선순위**: P2(WARNING) — 글 피드백은 정상으로 보이고 진행도 막히지 않는다
3. **발생 화면**: `#activity/5`에서 카드를 틀린 순서로 세 칸 채웠을 때, `#activity/7`에서 틀린 쪽을 골랐을 때
4. **재현**: 운영에서 활동 5를 열고 카드 2→1→0 순서로 누른다
5. **예상**: 활동 3·6·8처럼 안내 말풍선에 「음성 듣기」(`retry-5`)가 붙고 자동 재생된다
6. **실제**: 음성 버튼이 생기지 않는다(30초 대기 실패, `check-voices.log`)
7. **근거**: `src/activities.js:89`는 피드백 문구가 `voice-lines.js`의 대본과 글자까지 같을 때만 음성을 붙인다.
   - 활동 5는 11-14 `a1ce7f1`, 활동 7은 11-12 `af6b9e8`에서 피드백 문구가 바뀌었다. 대본은 옛 문구 그대로다(5: 「…카드를 끌어 순서를 바꿀 수 있어요」, 7: 「기후 부담과 사용 자원은 낮은 쪽…」).
   - 교실 언어로: 소리로 안내를 듣던 학생이 활동 5·7에서만 틀렸을 때 목소리 도움을 못 받는다.
8. **관련 파일**: `src/activities.js:89·304~311`(활동 5), 활동 7 비교 선택 처리, `src/voice-lines.js`의 `retry-5`·`retry-7`, `assets/audio/voices/el-retry-5.mp3`·`el-retry-7.mp3`
9. **권장 수정**: 지금 피드백 문구로 두 음성을 새로 녹음하고 `voice-lines.js` 대본을 맞춘다. 옛 대본의 「끌어」는 지금 조작(누르기)과도 다르다.
10. **수정 위험**: 음성 생성·대본 변경만이고 판정 로직은 그대로다. 문구를 옛 대본에 맞추는 쪽은 학습 문구 변경이라 권하지 않는다.
11. **검증**: `scripts/check-voices.mjs`의 `retry-5`·`retry-7` 단계 통과
12. **증거등급**: 확인됨(운영)

### 2. `check-voices` 전체 목록 비교가 낡았다 (E12)

- 스크립트 끝의 `assert.deepEqual(seen, Object.keys(voiceLines))`는 11-10 대사 목록 기준이다. 그 뒤 생긴 brief·learn·learn-detail·개념·악당·인증서 대사 86개를 열어 보지 않아 항상 실패한다.
- 이 대사들은 앱 코드에 연결돼 있다(`activities.js` `brief-`·`learn-`·`learn-detail-`, `concept-player.js`, `map-encounters.js`, `main.js` `certificate`). 운영 파일 126개도 모두 200이다.
- 권장: 1번을 고칠 때 이 목록 비교도 현재 대사 갈래에 맞게 고친다. 범위 판단이 필요해서 이번에는 고치지 않았다.

---

## 이번에 고친 것

| 문제 | 수정 | 파일 |
|---|---|---|
| `check-save-safety`가 운영처럼 설정 내용을 늦게 받으면 설정 창이 뜨기 전에 `details`를 펼쳐, 교사용 도구 버튼이 접힌 채 30초 대기 실패 | 설정 창이 뜰 때까지 기다린 뒤 펼친다(한 줄) | `scripts/check-save-safety.mjs` |

점검 스크립트라 배포본에 들어가지 않는다. 그래서 운영 재배포는 하지 않았다.

## 개선 권장(P3, 판정 밖)

- 위 1·2번을 한 작업으로 처리하면 `check-voices`가 다시 전체 검사로 쓸 수 있게 된다.

## 롤백 대상

- 현재 운영: `6a789cf` · 버전 `b95463c9-04c8-4827-86fb-2fcd43f29231`
- 직전 운영: `ec59e90`(성취 카드 잠긴 문구) · 버전 `dca6f9cf…`(기록 커밋 `3c245b6`)
