# 이미지·소리·교육 내용 출처

## 도구·라이선스 검토 · 2026-10-21

| 도구·자료 | 쓰는 곳 | 확인한 내용 | 판정·남은 조치 |
|---|---|---|---|
| 사용자 제공 AI 이미지 23장 | 기존 배경·로고·캐릭터 | 원본 위치와 SHA256은 `docs/reference-review/file-move-manifest.csv`; 파일명·기존 자료에서 AI 생성 이미지로 분류 | **확인 필요**: 생성 계정·생성 당시 요금제·이용 약관·권리자의 상업 배포 권한을 파일만으로 증명할 수 없음. 권리자 확인 전 상업 납품 승인으로 취급하지 않음 |
| 새 생성 지도·학생·동행 캐릭터 | 지도 | 2026-10-21 내장 `image_gen` 도구로 생성, 원본·적용 파일 아래 기록 | 프롬프트는 `docs/IMAGE-PROMPTS.md`. 파일 생성 자체가 기존 제공 에셋의 권리 확인을 뜻하지 않음 |
| 공통 SVG 아이콘·앱 UI | 홈·이전·소리·설정·활동 | 프로젝트 코드에서 직접 제작; 외부 유료 아이콘·UI 키트 사용 안 함 | 코드 검수와 함께 확인 |
| Jua Regular 400 한글·라틴 WOFF2 | 전체 텍스트 | Google Fonts 공식 Jua 메타데이터와 SIL OFL 1.1 원문 확인; 로컬 파일의 내장 이름·버전·저작권도 확인 | **PASS**: 저작권·OFL 원문을 `assets/fonts/OFL.txt`로 함께 배포. 외부 CDN 요청 없음 |
| Web Audio 합성음 | 배경음 | 브라우저에서 코드로 합성 | 효과음은 아래 Kenney CC0 자료로 교체 |
| Pillow | 제공 이미지의 WebP 변환·셀 추출 | 로컬 제작 도구이며 학생 배포본에 라이브러리를 포함하지 않음 | `scripts/prepare-assets.py`로 재현. 배포용 이미지 이용 권리는 원본 권리와 별개로 생기지 않음 |
| 교육과정 원문 | 설정의 교사용 가이드·교육 설계 | 아래 공식 교육청 자료로 성취기준 확인 | 출처를 표시하며 학습효과 보증·성취기준 완전 달성 주장에 사용하지 않음 |

이 검토는 파일·코드의 출처 기록이며 법률 검토나 상업 이용 허락의 대체물이 아니다. 확인하지 않은 자료를 ‘라이선스 통과’로 표시하지 않는다. 현재 원본의 권리 확인 자료가 없으므로 **상업 납품 전 원본 권리 확인이 남아 있다.**

## 제공 이미지의 실제 파생 파일

원본은 모두 `references/`에 그대로 보존한다. WebP 변환은 시각 내용 변경 없이 압축했으며, 캐릭터 두 장은 시트를 시각 확인한 후 원래 크림 배경까지 포함하는 직사각형 셀로 잘랐다. 투명 스프라이트나 배경 제거 결과물이 아니다.

| 배포 파일 | 원본 | 용도 | 처리 |
|---|---|---|---|
| `assets/home.webp` | `references/backgrounds/chatgpt_generated_13.png` | 시작·작전실 | WebP, 1672×941 |
| `assets/city.webp` | `references/backgrounds/chatgpt_generated_14.png` | 도시 조사 | WebP, 1672×941 |
| `assets/coast.webp` | `references/backgrounds/chatgpt_generated_15.png` | 해수면 모형 실험 | WebP, 1672×941 |
| `assets/bedroom.webp` | `references/backgrounds/chatgpt_generated_17.png` | 생활 선택 | WebP, 1672×941 |
| `assets/design.webp` | `references/backgrounds/chatgpt_generated_19.png` | 도시 설계 | WebP, 1672×941 |
| `assets/storm.webp` | `references/backgrounds/chatgpt_generated_20.png` | 기후 조건 시험 | WebP, 1672×941 |
| `assets/logo.webp` | `references/branding/chatgpt_generated_23.png` | 브랜딩 | WebP, 1672×941, 원본 배경 유지 |
| `assets/squirrel.webp` | `references/characters/chatgpt_generated_22.png` | 잎새 기록 포즈 | 원본 (0,320)~(220,579) 셀, 220×259 |
| `assets/otter.webp` | `references/characters/chatgpt_generated_22.png` | 물방울 안내 얼굴 | 원본 (838,805)~(986,938) 셀, 148×133 |

상세 바이트·원본 SHA256·처리 정보는 `docs/reference-review/prepared-assets.json`에서 확인한다. 제공 이미지 안의 도시·장면은 생성형 AI로 만든 교육용 가상 표현이다. 실제 도시나 특정 시점의 미래 피해 지도가 아니다.

## 이번 작업의 신규 생성 이미지

생성일: 2026-10-21. 생성 도구: Codex 내장 `image_gen` 도구. 외부 유료 스톡 자료나 별도 이미지 SDK를 사용하지 않았다. 최종 프롬프트·생성 목적·검수 메모는 `docs/IMAGE-PROMPTS.md`를 참조한다.

| 적용 파일 | 보존 원본 | 원본 규격 | 처리·용도 |
|---|---|---|---|
| `assets/village.webp` | `references/generated/village-map.png` | 1672×941 | WebP quality 92; 사선 시점 픽셀 연구마을 지도 |
| `assets/field-team.webp` | `references/generated/field-team.png` | 887×1774 RGBA, 4열×8행 | lossless WebP; 학생 대원 위 4행·잎새 동행 아래 4행, 방향 down/left/right/up |

픽셀 지도와 시설 일러스트는 각각 지도/실내라는 다른 공간에서 사용한다. 스프라이트의 원본 픽셀 크기와 프레임 접지·잘림은 실제 지도 렌더에서 최종 확인한다.

## Jua 웹폰트

Google Fonts 배포판 **Jua Regular**, weight 400, Version 1.001을 사용한다. 기기에 한글 산세리프가 없는 브라우저에서도 동일한 글자를 표시하도록 두 WOFF2를 로컬에서 제공한다. 폰트 제작: Woowahan Brothers. 폰트 파일의 내장 저작권 표기: `Copyright 2018 The BM JUA Project Authors`.

- `assets/fonts/jua-korean-400.woff2` — 368,172 bytes
- `assets/fonts/jua-latin-400.woff2` — 16,620 bytes
- 복사 원본: 비교 프로젝트 `1udangtangtang/public/assets/fonts/`의 동일 파일. 이번 작업에서 폰트 바이너리를 수정하지 않았다.
- 공식 원문: [Google Fonts Jua OFL.txt](https://raw.githubusercontent.com/google/fonts/main/ofl/jua/OFL.txt), [Jua METADATA.pb](https://raw.githubusercontent.com/google/fonts/main/ofl/jua/METADATA.pb). 확인일 2026-10-21.
- SIL Open Font License 1.1은 저작권·라이선스를 동봉해 폰트를 소프트웨어에 포함·임베딩·재배포하는 것을 허용한다. 폰트 자체만 별도로 판매할 수 없다. 폰트 파일은 OFL을 유지하며 앱 자체 제작물 제한 문구의 대상이 아니다.
- 공식 라이선스 전체를 `assets/fonts/OFL.txt`로 동봉한다. 폰트 설치는 필요하지 않고 외부 서버로 요청하지 않는다.

## 교육 내용 출처

확인일: 2026-10-21. 사용한 원문은 2022 개정 과학과의 [4과16-01], [4과16-02], [4과16-03]이다.

- 경기도교육청, 「2025학년도 초등학교 3~4학년 2학기 수업·평가 계획 예시 자료」, goe.go.kr. [확인한 PDF](https://www.goe.go.kr/resource/goe/na/bbs_2675/2025/07/f4c15fac-ae7b-46aa-8e16-b8d86b710d44.pdf)
- 전라남도교육청, 기후변화·생태교육 관련 성취기준 공개 자료, jne.go.kr. [확인한 PDF](https://www.jne.go.kr/upload/eco/na/bbs_530/ntt_5115332/doc_6587a4a4-4ca0-4604-a732-67d7608f344f1714a7100b38897.pdf)
- 경기도교육청, 「초등 깊이있는 수업 프레임워크 부록(3~4학년군)」, goe.go.kr. [확인한 PDF](https://www.goe.go.kr/resource/old/BBSMSTR_000000030136/BBS_202411110127574203.pdf)

게임의 비교 자료·수위·생활 지표·도시 위험 단계는 **가상 교육 모형의 상대 자료**다. 공식 기관이 발표한 실제 관측값이나 미래 예측 수치로 소개하지 않는다. 앱 화면의 자료 출처는 클릭 링크 없이 기관·자료명·도메인으로 모아 표시한다.

## 권리 표시

ⓒ 2026 옐샘 & 아이스크림미디어. 기획·제작: 옐샘 & 아이스크림미디어. 실제 배포 플랫폼의 이용 조건은 해당 플랫폼 약관을 따른다.

앱의 자체 제작 화면·화면 캡처·일러스트·코드 합성음은 권리자의 허락 없이 복제·재배포·타 서비스 전용·상업적으로 이용할 수 없다. 사용자 제공 원본의 권리 귀속·상업 이용 범위는 별도 권리 확인을 따른다.

외부 공개자료의 저작권은 각 저작자·제공 기관에 있고 해당 기관의 이용 조건을 따른다. 이 앱의 자체 제작물 제한 문구가 외부 자료의 권리를 대신하거나 확대하지 않는다. 생성형 AI를 활용한 이미지가 포함되어 있다.


## 개념 영상·CC0 효과음 추가 · 2026-10-22

최초 개념 영상은 프로젝트에서 직접 작성한 SVG 모션을 sharp와 로컬 FFmpeg로 인코딩했다. 2026-10-28에는 아래 생성 일러스트를 SVG 프레임에 합성해 열 영상을 갱신했다. 생성 영상 서비스·Remotion·외부 영상 클립을 사용하지 않는다. 학생 배포본에는 인코딩 도구를 포함하지 않는다. 자막은 `src/concept-data.js`, 샷 설계는 `docs/CONCEPT-CLIPS.md`에 기록했다.

효과음은 [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds)의 1.0 공식 배포본이다. 공식 페이지와 ZIP 안의 License.txt에서 Creative Commons Zero(CC0)를 확인했다. 원문을 `assets/audio/Kenney-LICENSE.txt`로 동봉했다. 이 앱의 자체 제작물 제한 문구는 해당 CC0 효과음의 이용을 제한하지 않는다.

- 공식 ZIP: https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip
- 다운로드 확인일: 2026-10-22
- ZIP SHA256: `F2193D072726D6758A5F7871B2DCC54DCCE0D5C35C6F0A62F92549B327C81232`
- 원본 OGG를 MP3(44.1kHz, 모노, 96kbps)로 변환하고 loudnorm(I=-20, TP=-3, LRA=7)을 적용했다. 이름은 원본을 유지했다. 적용 파일 8개의 합계는 32,321 bytes다.

| 동작 | assets/audio/ 적용 파일 | 원본 |
|---|---|---|
| 선택 | click_003.mp3 | click_003.ogg |
| 기록 수집 | pluck_001.mp3 | pluck_001.ogg |
| 시설 배치 | drop_002.mp3 | drop_002.ogg |
| 연결 | confirmation_002.mp3 | confirmation_002.ogg |
| 완료 | confirmation_004.mp3 | confirmation_004.ogg |
| 캐릭터 힌트 | open_001.mp3 | open_001.ogg |
| 실험 | switch_004.mp3 | switch_004.ogg |
| 다시 생각하기 | pluck_002.mp3 | pluck_002.ogg |

배경음과 효과음은 독립적으로 끌 수 있다. 효과음은 고정 음량 0.4로 한 번에 하나만 재생한다. 배경음 슬라이더는 배경음만 조절한다. 영상 재생 중에는 배경음이 멈춘다.

## 주요 개념 일러스트 추가 · 2026-10-28

Codex 내장 `image_gen` 도구로 대상 그림 11장과 장면 그림 14장, 총 25장을 생성했다. 시설과 해안 장소는 각각 독립된 투명 배경 이미지이며, 생활·자원·기후 영향 장면은 상황별 배경이 있는 이미지다. 외부 스톡 사진이나 일러스트를 사용하지 않았다.

| 그림 묶음 | 내용·사용 위치 | 프롬프트 기록 |
|---|---|---|
| 시설 5장 | 도시숲·그늘 쉼터·빗물 저류지·안전 대피소·빗물 흡수 길. 도구 선택·도시 배치·기후 시험 | `docs/generated-prompts-core.json`, `docs/generated-prompts-facilities.json` |
| 해안 장소 6장 | 해변·해안 도로·하구 습지·낮은 주택가·언덕 공원·높은 학교. 수위 예측·영향 분석 | `docs/generated-prompts-coast.json` |
| 상황 장면 14장 | 관측소·교실·등굣길·냉방·물건 생산·숲의 변화·급식·다시 쓰기·수선·물병·더위·대기전력·집·가뭄. 관측·자원 조사·생활 선택·영향 분석 | `docs/generated-prompts-core.json`, `docs/generated-prompts-scenes-school.json`, `docs/generated-prompts-scenes-home.json`, `docs/generated-prompts-drought.json` |

- 보존 원본: `references/generated/concept-art/*.png`.
- 적용 파일: `assets/concept-art/*.webp`, 25장 합계 약 3.47MiB.
- 제작 처리: `scripts/prepare-concept-art.mjs`에서 장면은 1280×720, 대상 그림은 투명 여백을 유지한 640×480으로 맞춰 WebP로 압축한다. 그림의 의미를 바꾸는 합성이나 배경 제거는 하지 않는다.
- 개별 파일 크기·용량·원본 SHA256: `docs/concept-art-manifest.json`.
- 화면별 연결: `src/concept-art.js`. 기존 홈·지도·시설의 전체 배경은 유지하고, 생활 선택 카드에는 상황별 그림을 적용했다.

열 개념 영상도 이 그림을 사용해 다시 인코딩했다. 그림은 장소와 시설을 보여 주고, 그래프·수면·시설 배치 순서와 위험 막대는 코드로 계산한다. 자막은 이미지나 영상에 굽지 않고 화면 텍스트로 제공한다. 영상·포스터는 총 30파일, 약 7MiB다. 생성 그림은 교육용 가상 표현이며 실제 장소의 관측 사진이나 미래 예측 지도가 아니다.

## 2026-11-09 정리

효과음은 866a6d0부터 Web Audio 합성음(`src/theme-effects.js`)이라 위 Kenney mp3 8개와 라이선스는 배포본에서 빼 `_unused/audio-kenney/`로 옮겼다(원본 보존). 관측소 그림 v1(`scene-observe.webp`)은 v2로 바뀌어 `_unused/concept-art/`로 옮겼다. 원본 PNG는 `references/generated/concept-art/`에 그대로 있다.

## 나눔스퀘어 네오 UI 글꼴 (2026-11-10)

네이버 공식 배포 원본 WOFF2 Regular/Bold를 수정 없이 함께 제공한다.
- 공식 안내: https://campaign.naver.com/nanumsquare_neo/
- 원본: https://campaign.naver.com/nanumsquare_neo/download/NaverNanumSquareNeo.zip
- 라이선스: SIL Open Font License 1.1. 전체 저작권 안내·전문은 `fonts/NanumSquareNeo-OFL.txt`.
- 기존 영상·삽화에 포함된 글자는 영상 제작 당시 글꼴을 유지한다.

## 과학 개념 장면 보강 · 2026-11-12

사용자의 교육게임 고도화 요청에 따라 Codex 내장 `image_gen`으로 해안 지형, 많은 비의 영향과 안전한 이동, 하루의 눈 관찰 장면 3장을 생성했다. 그림은 글자 없이 만들고 설명·개념 강조·조작 안내는 HTML로 제공한다.

| 적용 파일 | 용도 |
|---|---|
| `assets/concept-art/scene-coast-landscape.webp` | 해안 모형의 공간 이해와 영향 활동 도움말 |
| `assets/concept-art/scene-rain-safety.webp` | 낮은 길에 고인 빗물과 높은 길로 안전하게 이동하는 대응 |
| `assets/concept-art/scene-snow-day.webp` | 하루의 눈과 긴 기간 기록을 구별하는 관측·판단 |

원본은 `references/generated/concept-art/`에 보존한다. 배포 파일은 960×540 WebP이며 세 장 합계 410,492바이트다. 생성 프롬프트·원본·이용 조건 확인 사항은 `docs/generated-prompts-learning-20261112.json`, 크기·해시는 `docs/concept-art-manifest.json`에 기록했다. 그림과 실제 활동 화면을 직접 확인했다.

`evidence`·`effects` 영상의 장면 그림을 적용하고 `observe` 영상의 누락된 단위 문구를 복구해 기존 HyperFrames 제작 경로로 다시 렌더링했다. 모형 수면과 그래프는 계산된 자료로 표현한다. 생성 장면의 수위·날씨·배치는 수치 판정에 사용하지 않는다.
