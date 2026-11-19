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
