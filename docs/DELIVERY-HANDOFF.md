# 기후 미래 작전실 · 납품 안내

기존 인계 문서는 따로 없습니다. 기능 설명은 [README](../README.md), 기획은 [PRD](PRD.md)에 있습니다.

## 1. 한눈에

| 항목 | 내용 |
|---|---|
| 프로젝트 | 기후 미래 작전실 (과학34 16번, 폴더 `16 weatherchange`, 패키지 이름 `climate-future-operations`) |
| 운영 주소 | https://climate-action-quest.yelsam.workers.dev |
| 저장소 | 이 폴더의 Git 저장소(`main` 브랜치). 원격 주소는 시트 H열 「깃허브 공개 코드」 |
| 현재 앱 코드 커밋 | `4f70cd6` (2026-11-22, 최신 인증서) |
| 마지막 점수 | 총점 94, 실기기 제외 98 (`docs/reviews/SCORE-20261121.md`, 앱 `ce6ad36` 기준) |

공식 운영 주소에서 최신 인증서 코드를 다시 대조했습니다. 아래 최신 인증서·운영 확인 기록의 Worker 버전과 파일 일치 결과를 참고합니다.

## 2. 폴더 구조

배포되는 것(`scripts/build.mjs`가 `dist/`로 복사)
- `index.html`, `manifest.webmanifest`
- `src/` 화면 코드와 CSS, `assets/` 그림·영상·음악·효과음·목소리·글꼴
- `worker/media-range.js` 영상 Range 처리(Worker 코드, `dist/`가 아니라 배포 설정에서 연결)

보관용(배포되지 않음)
- `films/` 개념 영상 제작 원본(HyperFrames), `references/` 원본 그림·Suno 음악·기획 자료
- `docs/` 기획, 검수, 점수, 권리 장부, 영상 기록(`docs/story-films-20261121/`)
- `scripts/` 빌드와 검사 도구, `tests/` 단위 테스트, `thumbnails/` 공유용 썸네일, `_unused/`, `output/`

## 3. 실행·빌드·검사 명령

`package.json`에서 확인한 것입니다. Node.js 20 이상이 필요하고 설치할 패키지는 없습니다.

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버(http://localhost:4173) |
| `npm run build` | `dist/` 생성(서비스 워커 `sw.js` 포함) |
| `npm run preview` | `dist/` 배포본 확인 |
| `npm test` | 단위 테스트(`node --test tests/*.test.mjs`) |
| `npm run check:layout` `check:interactions` `check:flow` `check:art` | 개발 서버 4175 포트에서 브라우저 검사 |
| `npm run check:delivery` `check:first-load` | 배포본 서버 4275 포트에서 영상 부분 요청·첫 화면 검사 |
| `npm run check:screen` `check:journey` `check:playback` `check:mission` | 화면 크기, 전체 완주, 활동 재생, 미션 검사 |
| `npm run concepts:render` | 개념 영상 다시 만들기(`films/`) |

브라우저 검사는 Playwright Core와 Chrome이 필요하고 Chrome 경로는 `CHROME`, 주소는 `BASE_URL` 환경 변수로 바꿉니다.

## 4. 배포

- 호스팅: Cloudflare Workers(정적 자산 + Worker). Worker 이름 `climate-action-quest`.
- 설정 파일: 저장소 안에는 `wrangler` 설정이 없습니다. 설정은 `_scratch/deploy-20261118/cfg/16.json`에 있습니다(정적 자산 폴더 `dist`, 진입점 `worker/media-range.js`, 자산 바인딩 `ASSETS`).
- 배포 명령: `_scratch/deploy-20261118/deploy.sh 16 "16 weatherchange" worker-cfg climate-action-quest`
- 영상 Range 처리: `worker/media-range.js`. Cloudflare 정적 자산은 Range 요청에 전체 파일(200)을 돌려주어 브라우저가 영상 탐색을 못 하므로, `/assets/concepts/*`, `/assets/map-encounters/*`, `/assets/films/*` 요청을 Worker가 먼저 받아 206 조각으로 답합니다.
- 이 저장소에는 푸시로 배포를 실행하는 워크플로(`.github/workflows`)가 없습니다. 푸시만으로는 운영이 바뀌지 않습니다.

## 5. 다른 호스팅으로 옮길 때 챙길 것

- 정적 파일 폴더: `npm run build`가 만든 `dist/` 전체.
- 서비스 워커: `dist/sw.js`(빌드가 생성, 캐시 이름에 버전 포함). 같은 경로 루트(`/`)에서 서비스해야 합니다.
- Range 처리: mp4, webm 요청에 `Range`를 지원해야 합니다. 지원하지 않으면 영상 탐색이 안 되고 iPad Safari에서 mp4가 재생되지 않습니다.
- 환경 값: 환경 변수와 비밀 값은 필요 없습니다(`.env.example`에 그렇게 적혀 있습니다). 서버나 데이터베이스는 없고 기록은 학생 기기의 브라우저에만 저장됩니다.
- 주소를 바꾸면 시트의 운영 주소와 `index.html`의 공유 미리보기 주소(og:image)도 맞춰야 합니다.

## 6. 버전과 변경 이력

앱 표시 버전은 `0.1.0`(`src/state.js`)입니다. 최근 주요 변경(`git log`)

- 2026-11-22 `98e6410` 첫 화면을 1번 우당탕 양식으로(가운데 로고, 「시작하기/새로 시작」「이어 하기」, 소리·설정 아이콘만). 음성 두 개는 설정 「안내 목소리 듣기」, 「도시 운영 미션」은 설정 「앱 정보 · 배움과 보상」 위로 옮김. Worker 버전 `a8cc8711`, cmp MATCH
- 2026-11-22 `d86b063` 지도 악당을 다 물리쳐도 지도 피날레 영상을 띄우지 않음(악당은 성취 카드만, 마무리 영상은 최종 보고 때 한 번). Worker 버전 `413bdbe2`
- 2026-11-22 `a8e2349` 영상 자막이 완전히 사라진 뒤 다음 자막이 나오게 수정
- 2026-11-21 `685cbc0` 마무리 장면 3을 Gemini Veo 영상으로 교체
- 2026-11-21 `ce6ad36` 공용 창과 시작 이야기 코드를 `main.js`에서 분리(동작 같음)
- 2026-11-21 `de1835e` 인트로 장면 2를 물방울의 수수께끼 질문으로 변경
- 2026-11-21 `0900b93` 인트로·마무리 영상 완성(전체 화면, 자막, 캐릭터 목소리)
- 2026-11-21 `1c4b3ae` 인트로·마무리 영상 추가
- 2026-11-19 `aa5d69e` 지도 대원 그림 용량 축소, 안 쓰는 글꼴 제외
- 2026-11-19 `f38030e` 개념 영상 멈춤 오류 수정, 설정 창 닫기 버튼을 하나로 정리
- 2026-11-18 `71a2294` 성취 카드(악당 격퇴 보상) 추가
- 2026-11-18 `77acc78` 놀이 화면 비율과 배경 조화

## 7. 권리·출처

[권리 장부](RIGHTS-LEDGER-20261121.md)에 배포되는 그림, 영상, 음악, 효과음, 목소리, 글꼴 33줄이 있습니다. 한 줄 요약: 확인됨 12줄, 근거 약함 21줄, 출처 미확인 0줄입니다. 근거 약함은 대부분 이미지 도구·영상 도구의 요금제와 이용 약관 화면 캡처가 없어서입니다. 2026-11-21 사용자 확인으로 그림은 Codex(GPT 이미지), 영상은 구글 제미나이로 만들었고 모두 유료 요금제입니다. 캡처 자료는 사용자 제공을 기다립니다.

## 8. 알려진 한계와 남은 일

`docs/reviews/SCORE-20261121.md`의 남은 감점입니다.

- E2: `src/activities.js`(63.6KB)가 아직 큽니다. 옮기기만으로는 기준에 못 닿았습니다.
- 실기기·수업 확인 대기: 학생 난이도(A6), 40분 수업(B16), 저사양 태블릿(D10), 실기기 FPS(D13).
- F12: AI 그림 권리 자료(이미지 도구 요금제·약관 캡처) 대기.
- 앱 안의 과학 문장 교사 검토가 끝나지 않았습니다(`docs/TEACHER-REVIEW-20261121.md`).

## 운영 대조 기록 (2026-11-22 12:56)

- 조율 세션이 운영 주소의 `index`와 스크립트·스타일 파일 40개를 저장소 `origin/main`과 대조했습니다. 결과는 모두 일치입니다(불일치 0).
- 위 본문에 「운영 반영 확인 필요」로 적힌 칸은 이 대조로 확인된 것입니다. 이후 앱을 다시 배포하면 `_scratch/final-recheck-20261120/prodcmp.sh 16`로 다시 대조합니다.


## 최신 인증서·운영 확인 (2026-11-22)

- 앱 코드 `4f70cd6`, 기존 운영 Worker 버전 `fe924fab-79dd-4afe-a7bf-ac2bbcd96f70`입니다. 배포 기준 커밋 `4f70cd6`에는 해당 앱과 출처·문서 갱신이 포함됩니다.
- 공식 주소 `https://climate-action-quest.yelsam.workers.dev/`의 index와 실제 참조 코드·스타일 및 인증서 핵심 파일 17개를 현재 검증 빌드와 SHA256으로 다시 대조하여 모두 일치함을 확인했습니다. 앱이 이미 최신이어서 운영 버전은 유지했습니다.
- 학교·학년·반·번호·이름은 출력 후 손으로 적는 빈칸입니다. A4 가로 인쇄/PDF와 2400×1697 PNG를 지원하며, 진행 숫자 요약은 표시하지 않고 제목 굵기·획은 PNG에도 적용됩니다. 기존 세 화면·PDF·PNG 검증 근거는 각 인증서 작업 기록에 있습니다.
- 교사·실기기·수업 검수와 사용자 제공 권리 증빙은 기존 미확인 상태를 유지합니다.
