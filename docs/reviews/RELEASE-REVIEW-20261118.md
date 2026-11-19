# 기후 미래 작전실 납품 점검 (놀이 화면 비율·중복 버튼 정리 후)

> 작성 2026-11-19 · 브랜치 `main` · 기준 커밋 `de2ab68` + 이번 CSS 2파일 · 배포 대상 Cloudflare Workers `climate-action-quest` (https://climate-action-quest.yelsam.workers.dev)
> 스킬 `edu-final-check`. 이전 보고서 `RELEASE-REVIEW-20261111.md`·`SCORE-20261112.md`를 입력으로 받아 이번 변경이 닿는 항목만 다시 실측하고 나머지는 이전 판정을 인용했다(인용 항목은 근거 칸에 「11-11 인용」).

## 최종 판정

**조건부 배포 가능** · 성적 83/100 (`SCORE-20261118.md`)

### 왜 이 판정인가

- 이번 변경(시설 카드 열 높이, 활동 1·6 선택 열 채우기, 활동 3·5·7 작업 칸 폭)은 화면 배치 CSS만 바꿨고 학습 문구·판정·저장·진행 로직은 그대로다. 단위 테스트 69개, 빌드, 화면 스윕 208상태(8개 해상도), 자동재생, 레이아웃, 저장·이어하기 점검을 통과했고, 홈에서 10개 활동 72단위·인증서까지 실제 클릭으로 완주했다(아래 B3·B9·B10·B14).
- FAIL은 없다. 조건부인 이유는 11-11과 같다: 학생 난이도·40분 수업(A6·A8·B16), 실제 학교 태블릿 성능(D9·D10), 반투명 배경 위 글자 대비 전수(C9), 카카오톡 미리보기·iOS 인쇄(G18·G19)가 미측정이고, 제공 AI 그림의 상업 이용 증빙(F12)이 남아 있다.
- 새로 찾은 WARNING 2건은 기존 점검 스크립트가 11-13·11-18 흐름 변경을 따라가지 못한 것으로, 이번 변경과 무관하다(E12 아래).

### 배포 전 처리할 조건

1. 없음(이번 범위). 위 미측정 항목은 납품처 실기 확인 대상.

### 배포 후 확인할 것

1. 운영 주소에서 시설 화면 카드 열과 활동 1·5·6·7 화면이 새 배치로 보이는지, 변경 CSS 2개의 해시가 빌드와 같은지(배포 기록에 적음).

---

## 요약

| 영역 | PASS | WARNING | FAIL | NOT TESTED | N/A |
|---|---|---|---|---|---|
| A 교육적 품질 | 15 | 0 | 0 | 2 | 0 |
| B 기능 | 18 | 0 | 0 | 1 | 0 |
| C 태블릿·UI | 22 | 0 | 0 | 2 | 1 |
| D 성능 | 7 | 4 | 0 | 2 | 1 |
| E 코드 품질 | 10 | 3 | 0 | 0 | 1 |
| F 데이터·안전 | 14 | 1 | 0 | 0 | 0 |
| G 배포 | 18 | 0 | 0 | 2 | 0 |
| **합계** | 104 | 8 | 0 | 9 | 3 |

## 실행 환경 (실측)

| 항목 | 값 |
|---|---|
| package manager | npm(lock 파일 없음, 의존성 없는 바닐라 JS). 브라우저 검사는 `.tools/node_modules/playwright-core` + macOS Chrome |
| 실행 명령 | `npm run dev` / `npm run build` / `npm test` / `npm run check:*` |
| 배포 URL | https://climate-action-quest.yelsam.workers.dev |

| 명령 | 결과 | 비고 |
|---|---|---|
| install | NOT APPLICABLE | 런타임 의존성 없음 |
| lint · typecheck | NOT APPLICABLE | `package.json`에 정의 없음 |
| `npm test` | PASS 69/69 | 0.3초 |
| `npm run build` | PASS · `dist` 331 files | |
| `check:screen` (8해상도 × 활동 10 + 변형) | PASS · 208상태, failures 0, errors 0 | 다른 세션의 미커밋 개념 영상 변경이 섞인 작업 트리에서 실행 |
| `check:playback` | PASS | 같은 작업 트리 |
| `check:layout` (`CHROME` 지정) | PASS · small 0, scroll 0 | HEAD + 이번 CSS만 넣은 깨끗한 트리(`.tmp/wt-check`) |
| `check:flow` (`CHROME` 지정) | PASS · errors 0 | 깨끗한 트리 |
| `check:journey` | 원본 스크립트 FAIL(스크립트 노후) → 지도 단계를 실제 클릭으로 넣은 사본으로 완주 | 아래 E12 |
| `check:interactions` (`CHROME` 지정) | FAIL — 개념 영상 일시정지 검사(`video.paused`)에서 멈춤 | 아래 E12 |

브라우저 확인: 함 — 1280×800·1024×768·1920×1080에서 홈·지도·시설 5·활동 10·엔딩 54장 전후 스크린샷과 조작 요소 목록(`.tmp/layout-balance-20261118/before|after/`), 팝업 4종. 8해상도 스윕(844×390·390×844·873×580 포함)은 `check:screen`.

---

## A~G 판정 근거

| 항목 | 판정 | 근거 |
|---|---|---|
| A1~A5, A7, A9~A17 | PASS | 11-11 인용. 이번 변경은 학습 문구·판정·피드백을 건드리지 않음(`git diff`는 CSS 2파일) |
| A6, A8 | NOT TESTED | 실제 학생 난이도·무작위 클릭 전수 평가 미실시 |
| B1~B15, B17~B19 | PASS(확인됨) | 홈→이야기→지도→시설 카드→활동 0~9(72단위)→지도 「보고하러 가기」→엔딩→인증서 실제 클릭 완주(깨끗한 트리). 저장·이어하기·새로고침 복원은 `check:flow` 통과 |
| B16 | NOT TESTED | 40분 수업 운영 실측 없음 |
| C1~C8, C10~C21, C23~C24 | PASS(확인됨) | 3뷰포트 측정·8해상도 스윕 208상태 0건. 시설 카드 열 높이 50→84%(1280), 활동 1·6 선택 버튼 최소 64px·글자 20~34px. 놀이 영역 수치는 `docs/LAYOUT-BALANCE-20261118.md` |
| C9 | NOT TESTED | 그림 위 반투명 카드의 글자 대비 전수 측정 미실시(11-11과 같음) |
| C22 | NOT APPLICABLE | 캔버스↔DOM 겹침 게임 엔진 없음(지도 캔버스는 표시용) |
| C25 | NOT TESTED | 브라우저 줌 125%·텍스트 200% 미확인 |
| D1 | PASS(확인됨) | 배포 후 운영 주소 실측(`check:first-load`): 시작 버튼 1,434ms, 그림 2,078ms, 첫 전송 1.02MiB, 뒷 단계 자원 0, 외부 요청 0. 모의 20Mbps·40ms에서 시작 버튼 1,698ms |
| D2, D6, D13, D14 | WARNING | 11-11 인용(큰 그림 1개, 미참조 폰트, 정적 효과 위험, 큰 한글 폰트) |
| D3, D5, D7, D8, D11, D12 | PASS | 11-11 인용. D12는 이번 운영 실측에서도 외부 요청 0 |
| D4 | NOT APPLICABLE | 3D 없음 |
| D9, D10 | NOT TESTED | 저사양 태블릿 FPS 실측 없음 |
| E1, E3, E5~E11, E13 | PASS | 콘솔 오류: 측정 중 404 1종(`/sw.js`)은 개발 서버가 빌드 산출물 `sw.js`를 제공하지 않아 생긴 것으로 배포본에는 있음 |
| E2 | WARNING | 11-11 인용(`src/activities.js` 긴 렌더 함수) |
| E4 | NOT APPLICABLE | TypeScript 아님 |
| E12 | WARNING(확인됨) | ① `check:journey` 원본은 활동 1 뒤 바로 시설 카드를 찾는데, 11-13 커밋 `e83c991`부터 짝수 장의 끝은 지도로 간다(스크립트 마지막 수정 11-12). 지도의 「…로 가기」를 누르는 사본으로 완주 확인. ② `check:interactions`는 개념 영상 일시정지 뒤 `video.paused`를 기대하는데 11-18 `a2fdb3c`(개념 팝업 음성) 이후 실패. 스크립트 노후인지 일시정지 동작 문제인지는 개념 영상 담당 작업(현재 다른 세션이 `src/concept-player.js` 수정 중)에서 확인해야 해서 이번에 고치지 않음 |
| E14 | WARNING | 11-11 인용(`references/` 생성기 기본 파일명, 배포 제외) |
| F1~F11, F13~F15 | PASS | 11-11 인용. 저장 구조 변경 없음 |
| F12 | WARNING | 제공 AI 그림 상업 이용 권리 증빙 미완결(11-11 인용) |
| G1~G17, G20 | PASS | 배포 절차·결과는 README 「놀이 화면 비율·배경 조화」 절과 아래 배포 기록 |
| G18, G19 | NOT TESTED | 카카오톡 미리보기·iOS 인쇄/공유 실기 미확인 |

## 이번에 고친 것

| 문제 | 수정 | 파일 |
|---|---|---|
| 시설 화면 활동 카드 두 장이 화면 가운데 낮은 띠(높이 40~52%)에 떠 있음 | 카드 열을 HUD 아래~화면 아래까지, 카드가 높이를 나눠 갖고 그림·제목 확대 | `src/frontdoor.css` |
| 활동 1·6 선택 버튼이 오른쪽 가운데 짧은 목록으로 떠 있음(커버율 30~51%) | 선택 열을 자료 높이만큼 채우는 큰 타일 | `src/activity-screen.css` |
| 활동 5·7(·3) 작업 칸 열이 내용 폭으로 줄어 1920에서 좌우 빈 띠 약 27% | 작업 칸 열 `minmax(0,1fr)` | `src/activity-screen.css` |

## 개선 권장(P3, 판정 밖)

- 활동 도움 말풍선의 문단별 「음성 듣기」 3개를 하나의 「모두 듣기」로 합치는 안(재생 로직 변경이라 음성 담당 작업에서 판단).
- 원본 `check:journey`·`check:interactions`를 현재 흐름에 맞게 갱신.

## 운영 배포 기록

- 커밋 `77acc78`을 `main`에 푸시하고 `_scratch/deploy-20261118/deploy.sh 16 "16 weatherchange" worker-cfg climate-action-quest`(설정 `cfg/16.json`, 11-18 성취 카드 배포와 같은 값)로 배포. 활성 버전 `fd8a2a88-192c-4f54-84a8-fc935343d99f`. 바뀐 파일 3개만 올라감(330개 기존).
- `cmp.sh`: `src/main.js`·루트 index MATCH. 변경 CSS `src/frontdoor.css`·`src/activity-screen.css`와 `sw.js` SHA-256 빌드=운영 MATCH.
- 운영 주소 실기 브라우저: 1280×800·873×580·915×412·1920×1080 × 시설·활동 1·6·7 16화면에서 새 CSS 적용, 가로 넘침 0, 44px 미만 버튼 0, 작업 칸 잘림 0, 콘솔 오류 0. 홈·이야기·지도 6해상도 0건, 최소 글자 18px.
- 롤백 대상: 직전 운영 커밋 `71a2294`(성취 카드)·버전 `296831d8-b352-4390-b193-9164b0ce7022`.
