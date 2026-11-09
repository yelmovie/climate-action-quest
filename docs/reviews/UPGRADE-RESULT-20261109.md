# 기후 미래 작전실 · 고도화 결과 (2026-11-09 밤, 무인)

브랜치 `claude/upgrade-20261109`(시작 d1eb457 = 운영 e2fd559 + 미배포 지도 복구 커밋 2개). 배포·push 하지 않음. 점수는 `SCORE-20261109.md`, 계획은 `UPGRADE-PLAN-20261109.md`.

**총점: 최종스킬 71 → 87 /100, 디자인스킬 124 → 126 /130.**

## 바꾼 것

| 커밋 | 내용 |
|---|---|
| 3df7595 | 낡은 브라우저 검사기 3개 수정(교사 미리보기 진입·관측소 그림 v2 목록·합성 효과음), `check-first-load.mjs` 추가, `check-responsive --profiles=`. (예전 영상 도구 `tools/concept-clips` 삭제도 이 커밋에 같이 들어감) |
| 49f5163 | OG·카카오톡 태그 + 기존 그림으로 합성한 `assets/og-image.jpg`(1200×630, 156KB), 지도 복구 작업대 이모지 → SVG 아이콘·앱 글꼴, safe-area 여백, 죽은 효과음 상수 제거 |
| 908c1e5 | 활동별 성취기준 코드·학습목표, 검수 상태(`needsReview:true`)를 데이터로 + 테스트 |
| 8c9b519 | 이동하는 hover 6곳을 `(hover: hover) and (pointer: fine)` 안으로(태블릿에서 탭 뒤 들린 채 남던 문제) |
| 056a24a | 안 쓰는 Kenney mp3 8개·관측소 그림 v1을 `_unused/`로, 빌드 시작 때 `dist` 비우기(옮긴 파일이 배포본·오프라인 캐시 목록에 남던 문제) |
| 30b02bb | **개념영상 10편 HyperFrames 재제작** — `films/`(kit + 편별 데이터 + build/render), 9초 → 15초, 자막·장면 버튼 시각 0·5·10초(`CONCEPT_CUES`), 선택·스트레스 테스트 편 자막을 장면에 맞게, `tests/concept-films.test.mjs` |
| cfa02ea | 1920 화면에서 환영 자막·지도 표지·조작 안내·복구 패널 글자 14–16px → 18px 이상(clamp, 1024에서는 그대로) |
| 03c5817 | 검사기: 15초 영상·다시 보기 흐름, 뒤로가기, 화면별 최소 글자 기록 |

### 개념영상

- 10편 전부 교체: `assets/concepts/{observe,evidence,resources,connections,water,effects,choices,compare,design,test}.{mp4,webm,webp}` — 같은 경로·이름·형식, 1280×720, 15.00초, 무음.
- 용량: 편당 mp4 0.20–0.56MB, webm 0.22–0.53MB(한도 2.5MB). 30파일 합계 6.99MB(이전 약 8.6MB).
- 구성: 질문 말풍선 → 활동의 전·후 → 바뀐 곳 확대 + 이름표 → 결론 한 줄 → 잎새·물방울 반응. 그림은 게임 자세 시트·개념 그림만, 수치는 `activity-data.js`·`evaluateCity`(가상 교육 자료 표기).
- 소스: `films/<id>/index.html`, `films/kit`, `films/films.data.mjs`, `films/SPEC.md`, `films/REVIEW.md`. `films/<id>/assets/`는 build가 저장소 원본에서 다시 만들어 커밋하지 않음.

## 검증 명령과 실제 결과

| 명령 | 결과 |
|---|---|
| `npm test` | 38/38 통과(새 시간표·영상 파일 검사 2개, 성취기준 데이터 1개 포함) |
| `npm run build` | 통과, dist 109 files |
| `hyperframes check --json`(10편) | 오류 0. 경고는 `films/REVIEW.md`에 이유와 함께 |
| `hyperframes render`(10편) + ffprobe | 1080p 원본 15.00초, 게시 파일 1280×720·15.00초 |
| `check:interactions` | 24개 통과 — 10편 모두 앱 안에서 재생(readyState≥2, 1280×720, 15초), 두 번째 자막 전환, 끝 장면 포스터, 재생 실패 대체, 동작 줄이기 수동 재생 |
| `check:delivery`(dist) | 5개 통과 — 서버·오프라인 MP4 부분 요청, 오프라인 WebM, H.264 대체·탐색, 오프라인 힌트 |
| `check:art` | 10개 통과 |
| `check:flow` / `check:playback` | 7개 / 5개 통과 |
| `check:journey` | 72단위 실제 완주·인증서·새로고침 통과(15초 영상 포함) |
| `check:screen` | 8개 크기 208화면 문제 0 |
| `check-responsive --profiles=915x412,1024x600,830x515,1280x800` | 104화면 문제 0 |
| `check-first-load`(dist) | 시작 버튼까지 로컬 73–249ms(빌드 직후 첫 실행 한 번 5.0s 튐), 20Mbps·40ms 제한 854–862ms, 첫 화면 1.13MiB, 뒤 스테이지 자원·외부 요청 0. 홈·이야기·지도 6개 크기 가림·잘림 0, 1920 최소 글자 18px, 시설→지도 뒤로가기 정상, 페이지 오류 0 |

## 미검증과 이유

- `check:layout`(2026-10-22 검사기): 15분 제한 안에 끝나지 않아 브라우저가 닫힘. 같은 범위를 `check:screen`이 대신하므로 이번엔 다시 돌리지 않음.
- 학교 태블릿·크롬북·전자칠판 실기, 사파리, 카카오톡 미리보기, 배포 URL 점검 — 실기·배포가 필요(메인 세션 배포 후).
- 텍스트 200%/줌 125%, 스크린리더 읽기 순서, 40분 플레이 시간, 아무거나 누르기 전수.
- 영상 소리: 의도적으로 무음(플레이어가 muted 재생). 들어 보지 않음.
- 지도 복구 작업대(미배포 커밋)는 아이콘·글꼴·글자 크기만 손봤고 기능 흐름 전수는 기존 단위 테스트와 지도 화면 실측까지만.

## 남은 일

`UPGRADE-PLAN-20261109.md`의 "다음" 항목: 40분 실측(B16)·무작위 클릭(A8), 텍스트 확대(C25), 서비스워커가 첫 방문에 약 15.2MiB(109개 파일)를 받는 부담(교사 결정 필요), 영상 효과음과 소리 설정 연동, activities.js 분리, Jua 서브셋. 원본 저장소 `.git/objects/pack/`에 `._pack-*.idx`가 있어 git이 `non-monotonic index` 경고를 냄 — 원본 폴더는 이번 작업에서 쓰기 금지라 지우지 않았다(메인 세션에서 정리 필요).
