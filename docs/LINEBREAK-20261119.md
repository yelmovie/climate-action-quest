# 문장 줄바꿈 균형 점검·수정 (2026-11-19~20)

공통 지침: `_shared/LINEBREAK-BALANCE-20261119.md`. 학습 문구·대사는 바꾸지 않고 줄바꿈 위치만 고쳤다.

## 측정 방법

- 도구: `_scratch/linebreak-audit-20261119/measure.js`를 주요 화면에 직접 들어가 돌리는 `.tmp/linebreak-20261119/audit.mjs`(Git 미포함).
- 화면 37곳: 첫 화면(처음·이어하기), 이야기 3쪽, 지도(일부·전체 진행), 시설 5곳, 활동 10개 처음 화면과 힌트 말풍선, 활동 변형 16개(정답 확인·결과·도시 설계 단계), 설정(접힌 절 모두 펼침), 도시 운영 미션, 결말 2종.
- 크기: 1280×800, 1920×1080. 로컬은 `dist` 배포본을 `scripts/dev.mjs --dist`로 띄워 쟀다.

## 결과

| 단계 | 1280×800 | 1920×1080 |
|---|---|---|
| 전(운영) | 15 | 9 |
| 공통 규칙만(로컬) | 3 | 2 |
| 후(로컬, 보정 포함) | 1 (오탐) | 1 (오탐) |
| 운영 배포 뒤 | 1 (같은 오탐) | — |

전에 잡힌 것: 활동 힌트 말풍선 끝줄 외톨이(「확인해요.」「해요.」「비교해 봐!」 등 6곳), 활동 4 선택 카드 「확정해요.」「필요해요.」, 활동 4 원인 사슬 칸, 첫 화면 부제목 「…만들어 / 봐!」, 첫 화면 환영 자막 「찾아보자.」, 설정 창 출처·이용 조건 문단 끝줄 3곳.

## 고친 곳

- `src/korean-linebreak.css`: 공통 파일 복사(`keep-all`·`pretty`·제목·버튼·팝업 `balance`). `index.html`에서 다른 스타일보다 먼저 링크. `scripts/build.mjs`는 `src` 전체를 `dist`로 복사해 따로 손볼 것 없음. 프로젝트에 `text-wrap`을 직접 준 곳이 거의 없어 힌트 말풍선(dialog)·선택 카드(button)·설정 문단이 공통 규칙만으로 고쳐짐.
- 같은 파일 「프로젝트 보정」 절:
  - `.home-copy .hero-subtitle strong { display:block; text-wrap:balance }` — `<br>` 뒤 둘째 문장만 두 줄 길이를 고르게.
  - `.home-copy .npc-welcome-voice p { text-wrap:balance }` — 세 줄 환영 자막 끝줄이 짧게 남지 않게(한 자씩 나오는 글 아님).

## 남은 것

- 오탐 1: 활동 5 변형(물길 실험 결과) `.evidence-card p.notice` 「…물이 닿은 곳 5곳 / 새로 발견한 곳…」은 코드의 `<br>`로 나눈 두 요약 줄이라 낱말 끊김이 아님.
- 지도 화면 캔버스 글·개념 영상에 구운 자막은 측정 범위 밖(도구가 못 잼). 이번에 손대지 않음.
- 레이아웃: `check:screen`(10개 활동, 8개 화면 크기)·`check:layout` 모두 통과, `npm test` 69개 통과.

## 운영 반영

- 커밋 `661e2b5` main 푸시, `run-lock.sh lbk-deploy-1 deploy.sh 16 "16 weatherchange" worker-cfg climate-action-quest`.
- 활성 버전 `66b1fcbf-776e-4da5-af34-f34173f27d34`, 바뀐 파일 3개 업로드(333 기존).
- 해시(빌드=운영): `src/korean-linebreak.css` `0d021a96896eba90`, `src/frontdoor.css`·`/`(index) MATCH, `sw.js` `36dd0e8c05e99da2`(cache `eb63f6f26a1b`).
- 추가 수정(2026-11-20, 공통 지침 8절): `src/reward-cards.css` `.rc-locked small` 아래 컨테이너 규칙 4줄 — 좁은 잠긴 카드 「악당을 물리치면 / 열려요」를 「악당을 / 물리치면 / 열려요」로. 로컬 확인 1280×800 한 줄(카드 폭 180), 1024×768 세 줄(175), 넘침 없음. 커밋 `ec59e90`, 활성 버전 `dca6f9cf-37f2-4600-a2fb-8d12ff66fa92`, `reward-cards.css` `7bf850473c4e60f3`·index 빌드=운영 MATCH.

## 남은 것 정리 (2026-11-20, 공통 지침 9절)

- 지도 악당 말풍선 `.map-encounter-say`: 지도 화면에 같은 클래스 요소를 띄워 악당 대사 25줄 전부(만남 2·맞음 2·퇴장 1 × 5곳)와 도움 배너 `.map-encounter-clear` 5줄을 1280×800·1024×768에서 잼. 전 1줄(「내가 가린 행동 카드가 / 다 보여!」, 184px) → 후 0. `src/korean-linebreak.css` 프로젝트 보정에 `.map-encounter-say { text-wrap: balance; }`. 말풍선 위치는 기존 `layoutSpeech`가 버튼·캐릭터·이름표를 피해 화면 안에 두는 코드라 그대로(최대 폭 184px 그대로).
- 1차 때 못 잰 DOM 화면: 성취 카드 획득 장면(`awardRewardCards`로 실제 공개 장면을 띄움)을 두 크기에서 잼 — 문제 0.
- 활동 5의 1건: 물길 실험 결과 `.evidence-card p.notice`의 두 요약 줄 사이 `<br>`를 도구가 낱말 끊김으로 본 오탐. 두 줄 길이 268/420px(1280)로 고르게 나뉘어 고칠 것 없음.
- 캔버스 글: `src/`에 `fillText`·`strokeText`·`wordWrap`이 없음. 지도 캔버스는 그림만 그리고 이름표·안내·말풍선은 모두 DOM이라 1차·이번 측정에 포함됨. 확인함, 문제없음.
- 검사: 깨끗한 사본(HEAD + 이번 CSS)에서 `npm test` 76개 통과, 빌드 성공.
- 운영: 커밋 `3debf89`, `lbk-deploy-1`에서 같은 deploy 명령, 활성 버전 `f0402982-e68a-4e40-a79c-8dae4d82d651`, `korean-linebreak.css` `6bc20cee3d367728`·index 빌드=운영 MATCH.

## 악당 글자 18px 뒤 다시 재기 (2026-11-20 밤, 공통 지침 10절)

- 기준: 18px 커밋 `038f675`(말풍선 18px·최대 폭 `min(360px,70vw)`, 격퇴 안내 18px·`clamp(260px,100% - 640px,440px)`, 공격 버튼 18px)이 들어간 `origin/main`을 깨끗한 사본으로 빌드해 잼(`.tmp/linebreak-20261119/probe3.mjs`).
- 잰 글: 악당 대사 25줄 전부(만남 2·맞음 2·퇴장 1 × 5곳)를 `.map-encounter-say`로, 격퇴 안내 5줄을 실제 지도 층 안의 `.map-encounter-clear`로, 1280×800·1024×768·1920×1080 세 크기 = 90번.
- 결과: 문제 0(전/후 모두 0, 고친 것 없음). 말풍선은 세 크기 모두 최대 2줄, 지난번 넣은 `.map-encounter-say { text-wrap: balance }` 그대로 적용됨. 격퇴 안내는 1280·1920에서 최대 2줄, 1024에서 최대 3줄(끝줄 「카드 실패야!」 등 외톨이 아님, 공통 `pretty`). 화면 밖 넘침 0.
- 공격 버튼은 그림 아이콘만 있는 둥근 버튼(`map-attack-control.js`, 글은 `title`·`aria-label`)이라 화면에 보이는 글이 없어 잴 것 없음.
- 고친 파일 없음 → 배포하지 않음. 운영은 그대로 18px 배포본.

## 최종 상태 (2026-11-21, 공통 지침 11절 마무리)

- 운영: 활성 버전 `056631b9-1e10-4d00-bfa8-db3b668f11e8`(18px 커밋 `038f675` 배포본). 그 뒤 `origin/main` 커밋은 문서뿐. `origin/main` 깨끗한 사본 빌드와 운영 해시 대조 — `korean-linebreak.css` `6bc20cee3d367728`, `reward-cards.css` `7bf850473c4e60f3`, `map-encounters.js` `43af369d2a1e7b5a`, `map-attack-control.js` `e30f09a86733b3f7`, `sw.js` `c98b44cc2d6db9e3`, index `7d00b8c9be268a07` 모두 MATCH. 이 작업의 줄바꿈 코드는 전부 운영에 들어가 있음.
- 마무리 점검(같은 사본): 화면 37곳 전체 측정 1280×800·1920×1080 각 1블록(아래 오탐)·오류 0, `check:screen`·`check:layout` 통과(잘림·겹침·작은 글·스크롤 0), `npm test` 76개 통과.
- 고친 것: 이번 마무리에서 새로 고친 것 없음 → 배포 없음. 지금까지 고친 것은 공통 규칙 + 첫 화면 부제목·환영 자막 + 잠긴 성취 카드 + 지도 악당 말풍선 `balance`(위 절들).
- 그대로 둔 것과 이유:
  - 활동 5 물길 실험 결과 `.evidence-card p.notice` 1건(1280·1920): 지금도 같은 1건. 코드의 `<br>`로 나눈 두 요약 줄(「…물이 닿은 곳 N곳」 / 「새로 발견한 곳…」)을 도구가 낱말 끊김으로 본 오탐이고 두 줄 길이도 고름(268/420px). 고칠 것 없음.
  - 음성과 이어진 악당 대사: 기준대로 글·표시는 손대지 않음. 말풍선 `text-wrap: balance`만 유지, 18px 뒤 세 크기 문제 0.
  - 지도 캔버스·3D 글: `src/`에 캔버스 글 그리기 없음(이름표·안내는 DOM으로 측정됨). 새로 고치지 않음.
  - 개념 영상에 구운 자막: 측정 범위 밖, 기준상 고치지 않음.
  - 폭·크기·위치 변경: 하지 않음.
- 미확인: 실물 태블릿·전자칠판 화면.
- 참고: 다른 세션의 미커밋 변경(`scripts/check-voices.mjs`, `src/frontdoor.css`, `src/styles.css`)은 손대지 않음.
