# 16 기후 미래 작전실 · 권리 장부 (2026-11-21)

**요약(2026-11-21 영상 추가 뒤): 전체 33줄 · 확인됨 12 · 근거 약함 21 · 출처 미확인 0 · 배포되는 그림 파일 77개 중 출처 미확인 0개.** 아침 장부의 출처 미확인 4줄(IMG-12·IMG-13·VID-03·FNT-02)을 `_shared/CODEX-IMAGE-RECORDS-20261121.md` 방법대로 생성·작업 기록과 이었다. 그림 두 줄은 만든 도구·시각·프롬프트 첫 구절까지 찾았지만 이미지 도구 요금제·약관 기록이 없어 다른 생성 그림처럼 「근거 약함」이다. 새로 FNT-03(화면 부분 글꼴)·VOX-06(다시 생각하기 새 녹음)을 더했다.

(아침 요약: 전체 28줄 · 확인됨 8 · 근거 약함 16 · 출처 미확인 4 · 배포되는 그림 파일 75개 중 출처 미확인 4개(`assets/map-encounters/villain-left.png`, `villain-right.png`, `assets/npc-dialogue/ipsae.webp`, `mulbangul.webp`).)

## 범위와 기준

- 대상: `npm run build`(`scripts/build.mjs`)가 `dist/`로 복사하는 `index.html`, `manifest.webmanifest`, `src/`, `assets/`에 든 그림·영상·음악·효과음·목소리·글꼴 파일. 빌드가 빼는 `jua-*.woff2`는 장부에서 뺐다. 이번에 빌드를 돌리지 않았다. 현재 `dist/`(2026-11-21 06:29) 파일 목록을 읽어 보니 원본 `assets/`·`src/`와 같고 Jua 두 파일만 빠져 있었다.
- 배포 미디어 파일 수: 그림 75(webp 67·png 6·jpg 1·svg 1, 개념 영상 포스터 webp 10 포함) · 영상 11(mp4) + 10(webm) · 배경음 2 · 효과음 15 · 목소리 151(mp3 150 + m4a 1) · 글꼴 4(woff2).
- 근거는 저장소 안 기록(`assets/CREDITS.md`, `docs/`, `references/`, `assets/audio/voices/manifest.json`, `src/voice-lines.js`, 저장소 git 기록)과 `_shared/`의 출처 문서만 썼다. 추측으로 채우지 않았다.
- 상태 뜻
  - **확인됨**: 만든 곳·만든 날·이용 조건이 기록에 모두 있다.
  - **근거 약함**: 기록은 있지만 이용 조건(요금제·약관) 또는 날짜·프롬프트가 빠져 있다. 빠진 것을 칸에 적었다.
  - **출처 미확인**: 이 파일을 누가·무엇으로 만들었는지 적은 기록을 못 찾았다.
- 이 장부는 출처 기록 정리다. 법률 검토나 상업 이용 허락을 대신하지 않는다.

## 1. 그림 (14줄 · 65파일. 개념 영상 포스터 10장은 2장 영상 줄에 넣었다)

| 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **IMG-01** 사용자 제공 AI 이미지에서 변환한 9장: `assets/home.webp`, `city.webp`, `coast.webp`, `bedroom.webp`, `design.webp`, `storm.webp`, `logo.webp`, `squirrel.webp`, `otter.webp` | 사용자가 준 ChatGPT 생성 그림 23장 중 일부(원본 이름 `chatgpt_generated_13·14·15·17·19·20·22·23.png`). Pillow로 WebP 변환·셀 자르기(`scripts/prepare-assets.py`) | 생성일 기록 없음. 원본 검토 2026-10-14(`docs/ASSET-CATALOG.md`), 이동 기록·SHA-256(`docs/reference-review/file-move-manifest.csv`), 변환 기록(`docs/reference-review/prepared-assets.json`) | 기록 없음. CREDITS가 직접 "생성 계정·생성 당시 요금제·이용 약관·권리자의 상업 배포 권한을 파일만으로 증명할 수 없음, 확인 필요"라고 적었다 | `assets/CREDITS.md`(도구·라이선스 검토, 제공 이미지의 실제 파생 파일), `docs/ASSET-CATALOG.md`, `docs/reference-review/`, `references/backgrounds/`, `references/branding/`, `references/characters/` | 근거 약함 · 빠진 것: 생성 계정·생성일·요금제·약관, 제공 경위(계약·메일). `squirrel.webp`는 코드에서 파일 이름으로 부르는 곳을 못 찾았다 |
| **IMG-02** 같은 원본에서 잘라 만든 3장: `assets/home-squirrel.webp`, `home-otter.webp`, `logo-title.webp` | 원본 `references/characters/chatgpt_generated_22.png`(자세 시트), `references/branding/chatgpt_generated_23.png`(로고). sharp로 배경 지우기·자르기(`scripts/prepare-home-assets.mjs`) | 2026-11-07 커밋 `dfb2a48`에 추가. 작업 기록 `docs/reviews/FRONTDOOR-20261030.md` | IMG-01과 같다(원본 권리 확인 필요) | `scripts/prepare-home-assets.mjs`, `docs/reviews/FRONTDOOR-20261030.md`, `assets/CREDITS.md` | 근거 약함 · 빠진 것: IMG-01 원본의 생성 계정·요금제·약관. `home-squirrel.webp`는 코드에서 부르는 곳을 못 찾았다 |
| **IMG-03** 공유 썸네일 `assets/og-image.jpg`(1200×630) | 기존 첫 화면 그림·로고·캐릭터를 합성(누가·어떤 도구로 합성했는지는 커밋 설명만 있음) | 2026-11-10 커밋 `49f5163`, `docs/reviews/UPGRADE-RESULT-20261109.md` 12행, `docs/reviews/UPGRADE-PLAN-20261109.md` 1-4 | 따로 없음. 재료가 IMG-01·IMG-02라 그 조건을 따른다 | `docs/reviews/UPGRADE-RESULT-20261109.md`, `index.html`(og:image) | 근거 약함 · 빠진 것: 재료 그림의 권리(IMG-01), 합성에 쓴 정확한 파일 목록 |
| **IMG-04** 지도·스프라이트 2장: `assets/village.webp`, `assets/field-team.webp` | Codex 내장 `image_gen` 도구로 이 프로젝트용 생성 | 2026-10-21. 프롬프트 원문 `docs/IMAGE-PROMPTS.md`, 원본 `references/generated/village-map.png`, `references/generated/field-team.png` | 기록 없음(생성 계정의 요금제·약관 미기록). CREDITS: "파일 생성 자체가 기존 제공 에셋의 권리 확인을 뜻하지 않음" | `docs/IMAGE-PROMPTS.md`, `assets/CREDITS.md`(이번 작업의 신규 생성 이미지) | 근거 약함 · 빠진 것: 생성 당시 ChatGPT/Codex 요금제와 이미지 이용 조건 |
| **IMG-05** 앵무새 잎새 3장: `assets/ipsae-parrot.webp`, `ipsae-parrot-walk.webp`, `ipsae-parrot-talk.webp` | Codex 이미지 생성(CREDITS 표의 "Codex 이미지 생성", "Codex 이미지 생성 포즈") | 생성일 기록 없음. 저장소 추가는 2026-11-14 커밋 `a1ce7f1`. 프롬프트 기록 못 찾음 | 기록 없음 | `assets/CREDITS.md`(제공 이미지의 실제 파생 파일 표 아래 세 줄) | 근거 약함 · 빠진 것: 생성일, 프롬프트, 원본 위치, 요금제·약관 |
| **IMG-06** 개념 그림 24장(2026-10-28 묶음): `assets/concept-art/`의 시설·장소 11장(`beach`, `ground`, `homes`, `park`, `pond`, `refuge`, `road`, `school`, `shade`, `trees`, `wetland`)과 장면 13장(`scene-bottle`, `scene-classroom`, `scene-commute`, `scene-cooling`, `scene-drought`, `scene-forest`, `scene-heat`, `scene-home`, `scene-meal`, `scene-power`, `scene-repair`, `scene-reuse`, `scene-workshop`) | Codex 내장 `image_gen`. `scripts/prepare-concept-art.mjs`로 크기 맞춤·WebP | 2026-10-28. 프롬프트 `docs/generated-prompts-core.json`, `-facilities.json`, `-coast.json`, `-scenes-school.json`, `-scenes-home.json`, `-drought.json`(24장 모두 파일별 프롬프트 있음). 원본 `references/generated/concept-art/*.png`, 크기·원본 SHA-256 `docs/concept-art-manifest.json` | 기록 없음(요금제·약관 미기록). "외부 스톡 사진이나 일러스트를 사용하지 않았다"만 있음 | `assets/CREDITS.md`(주요 개념 일러스트 추가 · 2026-10-28), 위 JSON들 | 근거 약함 · 빠진 것: 생성 당시 요금제와 이용 조건 |
| **IMG-07** 개념 그림 3장(2026-11-12): `assets/concept-art/scene-coast-landscape.webp`, `scene-rain-safety.webp`, `scene-snow-day.webp` | Codex 내장 `image_gen` | 2026-11-12. 프롬프트·원본 경로·검수 `docs/generated-prompts-learning-20261112.json`, 원본 `references/generated/concept-art/` | 기록 자체가 "계정 이용 조건은 납품자가 최종 확인"이라고 적음 | `docs/generated-prompts-learning-20261112.json`, `assets/CREDITS.md`(과학 개념 장면 보강 · 2026-11-12) | 근거 약함 · 빠진 것: 계정 요금제·이용 조건 |
| **IMG-08** 관측소 그림 `assets/concept-art/scene-observe-v2.webp` | Codex 내장 `image_gen`("model: not disclosed") | 2026-11-08. `docs/reviews/OVERNIGHT-20261108.md`, `docs/concept-art-manifest.json`(원본 SHA-256). 원본은 `output/overnight-20261108/observe-v2.png`(Git 제외 작업 폴더) | 기록 없음 | `docs/concept-art-manifest.json`, `docs/reviews/OVERNIGHT-20261108.md` | 근거 약함 · 빠진 것: 프롬프트 원문, 요금제·약관, `references/`에 원본 보존 |
| **IMG-09** 성취 카드 10장: `assets/reward-cards/card-{1..5}-{0..4}.webp`, `thumb-{1..5}-{0..4}.webp` | ChatGPT 앱의 Codex 내장 이미지 도구(GPT 이미지). `field-team.webp`·`ipsae-parrot*.webp`·시설 배경을 화풍 참고로 붙임. 글자·테두리는 코드(`src/reward-cards.js`, `src/reward-cards.css`) | 2026-11-18. 원본 PNG `_scratch/reward-cards-20261118/gen/16/`(Git 제외). 프롬프트 기록 위치는 CREDITS에 없음 | CREDITS: "생성 계정의 요금제·약관에 따른 이용 권리는 … 생성 이미지와 같은 조건으로 확인"(미확인) | `assets/CREDITS.md`(2026-11-18 성취 카드), `_shared/reward-cards/INTEGRATION.md`(코드 연결만, 그림 출처 없음) | 근거 약함 · 빠진 것: 프롬프트 기록, 요금제·약관 |
| **IMG-10** 지도 대원·동료 시트 2장: `assets/map-encounters/hero.png`, `ally.png` | 이 프로젝트용 새 자세를 "생성·알파 정리·검수"(도구 이름은 이 줄에 없음. 같은 문서의 악당 시안은 "Codex 기본 이미지 도구") | 2026-11-14 커밋 `50de79a`. `_shared/MAP-VILLAINS-HANDOFF-20261114.md` 114·116행, 작업 폴더 `_scratch/villain-resume-20261114/16-sheets/` | 기록 없음 | `_shared/MAP-VILLAINS-HANDOFF-20261114.md`, `docs/MAP-VILLAIN-HANDOFF-20261114.md`(설계·대사 계획만) | 근거 약함 · 빠진 것: 생성 도구 이름, 프롬프트, 요금제·약관 |
| **IMG-11** 악당 전투 자세 2장: `assets/map-encounters/villain-poses-left.png`, `villain-poses-right.png` | "16은 … 신규 악당 동작을 더했다", "새로 그렸다"(도구 이름 없음) | 2026-11-14 커밋 `1ad931f`. `_shared/MAP-VILLAINS-HANDOFF-20261114.md` 131행, `_scratch/map-redraw-20261114/README.md` 9행 | 기록 없음 | `_shared/MAP-VILLAINS-HANDOFF-20261114.md` | 근거 약함 · 빠진 것: 생성 도구, 프롬프트, 요금제·약관 |
| **IMG-12** 옛 악당 2장: `assets/map-encounters/villain-left.png`, `villain-right.png` | Codex 내장 이미지 도구(GPT 이미지)로 기존 지도 악당 그림을 고친 대기 자세 2장 → Swift 스크립트로 잘라 6칸 시트로 만듦 | 2026-11-14 01:17·01:19 KST, Codex 세션 `rollout-2026-11-14T00-29-37-01a1d587…`의 `image_gen` 「Edit the attached sprite into ONE map idle pose…」(`exec-ba62466f` → `_scratch/villain-concepts-20261114/readability-09-16/facing/villain-16-left.png`, `exec-4ac3dfe1` → `…-right.png`), 세션 `rollout-2026-11-14T01-24-29-01a1d5b9…`의 시트 스크립트(`villain(…, destinations[4]+"/map-encounters/villain-"+side+".png")`), 커밋 `50de79a`. `_shared/codex-image-records-20261121/` 색인(읽기 전용, 방법 `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 생성 계정 요금제·약관 기록 없음(IMG-04~11과 같음) | `_scratch/villain-concepts-20261114/readability-09-16/facing/`, `_scratch/map-encounters-12-16/integrate.py`, 위 세션 기록 | 근거 약함(2026-11-21 출처 미확인 → 생성 기록 연결) · 빠진 것: 이미지 도구 요금제·약관. 앱은 지금 `villain-poses-left/right.png`를 써서 이 두 파일을 부르지 않는다 |
| **IMG-13** 대화 초상 2장: `assets/npc-dialogue/ipsae.webp`, `mulbangul.webp` | Codex 내장 이미지 도구(GPT 이미지)로 만든 2×2 대화 초상 시트를 잘라 WebP 2장으로 | 2026-11-12 21:52 KST, Codex 세션 `rollout-2026-11-12T21-49-45-01a1cfce…`의 `image_gen` 「Transparent 2-column × 2-row dialogue portrait sprite sheet… Top left: Ipsae…」(`exec-260ce874`), 같은 세션이 `_scratch/npc-14-16-20261112/sheet-16.png`로 복사, `pack.sh` 13·14행이 `ipsae`·`mulbangul` 칸을 잘라 저장(`HANDOFF.md` 9·10행), 커밋 `85961fe`. `_shared/codex-image-records-20261121/` 색인(읽기 전용, 방법 `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 생성 계정 요금제·약관 기록 없음(IMG-04~11과 같음) | `_scratch/npc-14-16-20261112/sheet-16.png`·`pack.sh`·`HANDOFF.md`, 위 세션 기록 | 근거 약함(2026-11-21 출처 미확인 → 생성 기록 연결) · 빠진 것: 이미지 도구 요금제·약관. `ipsae.webp`(다람쥐 시절 잎새)는 지금 앱이 부르지 않는다 |
| **IMG-14** 앱 아이콘 `assets/favicon.svg`(307바이트 SVG) | 직접 쓴 SVG로 보이나, CREDITS의 "공통 SVG 아이콘·앱 UI … 프로젝트 코드에서 직접 제작"은 `src/icons.js` 이야기이고 이 파일을 따로 적지 않음 | 2026-10-21(`docs/reviews/ASSET-CLASSROOM-MEDIA-20261021.md` 36행 목록), 커밋 `9eb4c37` | CREDITS 권리 표시의 자체 제작물 조건이 적용된다고 볼 근거는 간접적 | `docs/reviews/ASSET-CLASSROOM-MEDIA-20261021.md`, `assets/CREDITS.md` | 근거 약함 · 빠진 것: 이 파일을 직접 만들었다는 한 줄 기록 |
| **IMG-15** 영상 장면 그림 6장(배포본에는 영상 첫 장면 `assets/films/intro.webp`·`finale.webp`로만 들어감) | Codex 내장 이미지 도구(GPT 이미지), 기존 그림 7장을 참고로 붙임 | 2026-11-21, `_scratch/films-16-20261121/gen-frames.sh`·`prompts.json`·`frames/`, `assets/CREDITS.md` 「인트로·마무리 영상」 | 생성 계정 요금제·약관 기록 없음(IMG-04~11과 같음) | 위 폴더, `assets/CREDITS.md` | 근거 약함 · 빠진 것: 이미지 도구 요금제·약관 |

## 2. 영상 (3줄 · 31파일)

| 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **VID-01** 앵무새 편 개념 영상 5편: `assets/concepts/{observe,resources,water,choices,design}.{mp4,webm,webp}`(영상 10 + 포스터 5) | HyperFrames로 프로젝트에서 직접 짠 HTML 모션을 로컬 렌더(`films/`). 그림 재료는 IMG-05 `ipsae-parrot.webp`와 IMG-06·07·08 개념 그림, 글꼴은 나눔스퀘어 네오(OFL). 소리 트랙 없음(ffprobe로 영상 트랙만 확인) | 2026-10-22 최초, 2026-10-28 그림 합성, 2026-11-10 HyperFrames 재제작(커밋 `30b02bb`), 2026-11-14 앵무새로 갱신(커밋 `a1ce7f1`). `films/build.mjs`, `films/REVIEW.md`, `docs/CONCEPT-CLIPS.md` | 영상 제작 자체는 자체 제작. 들어간 그림의 이용 조건은 IMG-05~08과 같이 미기록 | `assets/CREDITS.md`(개념 영상·CC0 효과음 추가, 주요 개념 일러스트 추가), `films/build.mjs`, `films/REVIEW.md` | 근거 약함 · 빠진 것: 들어간 생성 그림의 요금제·약관(IMG-05~08) |
| **VID-02** 물방울 편 개념 영상 5편: `assets/concepts/{evidence,connections,effects,compare,test}.{mp4,webm,webp}`(영상 10 + 포스터 5) | VID-01과 같은 방식. 물방울 자세는 사용자 제공 그림 `references/characters/chatgpt_generated_22.png`에서 잘라 씀(`films/build.mjs` 16~17행). 소리 트랙 없음 | VID-01과 같음(2026-10-22 ~ 2026-11-12 재렌더) | 들어간 물방울 그림은 IMG-01과 같은 "원본 권리 확인 필요" | `films/build.mjs`, `films/REVIEW.md`, `assets/CREDITS.md` | 근거 약함 · 빠진 것: `chatgpt_generated_22.png`의 권리(IMG-01), 생성 그림 요금제·약관 |
| **VID-03** 지도 파이널 영상 `assets/map-encounters/map-finale.mp4`(소리 없음) | ffmpeg로 만든 6초 영상: 운영 지도 공격 장면 캡처 한 장을 천천히 확대하고 글자 3줄을 얹음(macOS Apple SD Gothic Neo로 그린 그림 글자) | 2026-11-14, `_scratch/stage-villain-dialogue/movies.py`(`-loop 1 -i _scratch/live-map-contact-review/originals/16-attack.png … zoompan … drawtext`), 캡처 스크립트 `_scratch/live-map-contact-review/capture-16.mjs`, 커밋 `b3ac890` | 재료가 앱 지도 그림(IMG-10·11)이라 그 조건을 따른다. 글자는 시스템 글꼴로 그린 그림이고 글꼴 파일은 들어 있지 않다 | `_scratch/stage-villain-dialogue/movies.py`, `_scratch/live-map-contact-review/originals/16-attack.png` | 근거 약함(2026-11-21 출처 미확인 → 제작 방법 확인) · 빠진 것: 재료 그림의 요금제·약관 |
| **VID-04** 인트로·마무리 영상 `assets/films/intro.mp4`(33.5초), `finale.mp4`(29.5초), 소리 없음, 자막은 영상 안 | 장면별: I-1·I-2 Google Flow `Omni 1.2 Flash`(주 계정, 화면 표시 PRO) / I-3 Gemini 앱 Veo(보조 계정 1, 화면 표시 PRO, 사용자 확인 2026-11-21: 유료) / F-1·F-2 Gemini 앱 Veo(주 계정, PRO) / F-3 Gemini 앱 Veo(보조 계정 2, 요금제 표시 PRO(같은 계정 Flow 화면), 사용자 확인 2026-11-21: 유료, 19:36 KST 받음, 앞 6.5초를 쓰고 끝 장면은 천천히 당김). 자막: `_shared/caption-motion-20261118/burn.py`(주아체 OFL), 끝 장면 제목 그림 `logo-title.webp`·배지 | 2026-11-21 11:30~19:40 KST, `docs/story-films-20261121/README.md`(장면별 시각·계정), `render3.py`, 큐 JSON | Google Flow·Gemini 이용 약관(이 지역은 Veo 표시 필수, 영상에 남아 있음). 재료 그림은 IMG-15·IMG-01(로고) 조건 | 위 문서 | 근거 약함 · 빠진 것: Flow·Gemini 요금제·생성물 이용 약관 캡처 |

## 3. 음악 (1줄 · 2파일)

| 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **MUS-01** 배경음 2곡: `assets/audio/bgm/main-theme.mp3`, `final-theme.mp3` | Suno로 사용자가 생성해 제공 | 2026-11-17. 프롬프트 `_shared/music-prompts-10-16.html`. 원본 `references/suno/main_theme.mp3`, `final.mp3`(Git 제외. 배포 파일과 바이트가 같음을 이번에 확인) | Suno **Premier 유료 요금제**에서 생성, 상업 이용 근거(2026-11-18 사용자 확인) | `assets/CREDITS.md`(도구·라이선스 검토 표), `docs/AUDIO-PROVENANCE.md`, `_shared/voice-provenance-20261118.md`(요금제 표) | 확인됨 · 보강하면 좋음: 요금제 화면 캡처 |

## 4. 효과음 (3줄 · 15파일)

| 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **SFX-01** 지도 악당 7개: `assets/audio/sfx/wind-whoosh-02.mp3`, `hit-light-01.mp3`, `hit-heavy-03.mp3`, `wind-whoosh-03.mp3`, `villain-appear-03.mp3`, `hurt-bump-01.mp3`, `victory-jingle-04.mp3` | 과학34 공통 효과음 라이브러리 `_shared/sfx-library-20261117`(원본 Freesound: qubodup, mikala_oidua, insanity54, 1urker, Faulkin, mickleness) | 2026-11-17 적용. 원본 제목·제작자·원본 페이지 주소가 CREDITS 표에 있음. 라이브러리 파일과 바이트가 같음을 이번에 확인 | **CC0 1.0**(라이브러리 작성 때 원본 페이지에서 다시 확인. 라이브러리 정책 "CC0 또는 PDM만") | `assets/CREDITS.md`(지도 악당 효과음 · CC0 · 2026-11-17), `_shared/sfx-library-20261117/manifest.json`, `_shared/sfx-library-20261117/CREDITS.md` | 확인됨 |
| **SFX-02** 성취 카드 4개: `reward-01.mp3`, `reward-03.mp3`, `pickup-01.mp3`, `victory-jingle-01.mp3`(카드 휙 소리는 SFX-01의 `wind-whoosh-03.mp3`를 같이 씀) | 같은 라이브러리(원본 Freesound: ZenithInfinitiveStudios, CogFireStudios, DeltaCode, el_boss) | 2026-11-18 적용. CREDITS 표에 원본 정보. 바이트 일치 확인 | **CC0 1.0** | `assets/CREDITS.md`(2026-11-18 성취 카드), `_shared/sfx-library-20261117/manifest.json` | 확인됨 |
| **SFX-03** 발자국·스테이지 열림 4개: `step-01.mp3`, `step-02.mp3`, `open-03.mp3`, `twinkle-03.mp3` | 같은 라이브러리(원본 Freesound: sgossner, Yoyodaman234, ZenithInfinitiveStudios / Kenney Interface Sounds 1.0) | 2026-11-19 적용. CREDITS 표에 원본 정보. 바이트 일치 확인 | **CC0 1.0** | `assets/CREDITS.md`(지도 발자국·스테이지 열림 소리 · CC0 · 2026-11-19), `_shared/sfx-library-20261117/manifest.json` | 확인됨 |

## 5. 목소리 (6줄 · 153파일)

| 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **VOX-01** 지금 재생하는 ElevenLabs 대사 110개: `assets/audio/voices/el-*.mp3`(지도 안내·힌트·다시 생각하기·이야기·배지·엔딩·인증서·개념 영상 자막·도움말·악당 말풍선) | ElevenLabs `eleven_v4`. `el-map-0`은 Creative MCP 흐름, 나머지 109개는 공식 API. 목소리: 잎새 Bee, 물방울 SK, 내레이터 Haemi, 악당 Harry - Character. 실제 사람 목소리 복제 아님 | 2026-11-18. 줄별 요청 ID·받아쓰기·SHA-256: `docs/VOICE-FILL-20261118.json`, `assets/audio/voices/manifest.json` | **ElevenLabs Creator(유료, 연간) 요금제, 상업 이용 가능**(계정 조회 2026-11-18 `creator`, 사용자 확인) | `assets/CREDITS.md`(2026-11-18 잎새 지도 안내 음성, 캐릭터 목소리 통일·팝업 음성), `docs/VOICE-FILL-20261118.json`, `assets/audio/voices/manifest.json`, `src/voice-lines.js`, `_shared/voice-provenance-20261118.md` | 확인됨 · 보강하면 좋음: 요금제 화면 캡처 |
| **VOX-02** 지금 재생하는 ElevenLabs 대사 16개(2026-11-12): `welcome-1.mp3`, `home-bubble-new.mp3`, `home-bubble-back.mp3`, `facility-0~4.mp3`, `hint-1.mp3`, `hint-2.mp3`, `hint-3.mp3`, `hint-4a.mp3`, `hint-4b.mp3`, `hint-6.mp3`, `hint-8.mp3`, `hint-9.mp3` | ElevenLabs Voice Library 목소리(Bee 11개, SK 5개), `eleven_v4` | 2026-11-12. 줄별 원본 UUID·SHA-256: `assets/audio/voices/manifest.json` | manifest의 조건 칸은 "ElevenLabs account and Voice Library terms"뿐. `_shared/voice-provenance-20261118.md`는 2026-11-17까지 생성분이 **Starter(유료)**였다고 적음(사용자 확인) | `assets/audio/voices/manifest.json`, `_shared/voice-provenance-20261118.md`(요금제 표, 16번 표) | 근거 약함 · 빠진 것: Starter 요금제의 상업 이용 조항과 Voice Library 목소리 이용 조건을 적은 기록 |
| **VOX-03** 첫 인사 녹음 `assets/audio/npc-welcome.m4a` | 모모 로컬 음성(Supertonic 3). 앱에서 재생하지 않음(`_shared/voice-provenance-20261118.md` 157행. 코드에도 `.m4a` 경로 없음) | 2026-11-07T22:03:14Z. 원본 WAV·m4a SHA-256과 길이: `docs/AUDIO-PROVENANCE.md` | **OpenRAIL-M**(사용 제한 조항 있음, 출력물 권리 주장 없음). 라이선스 사본 `docs/SUPERTONIC3-LICENSE.txt` | `docs/AUDIO-PROVENANCE.md`, `docs/SUPERTONIC3-LICENSE.txt` | 확인됨 · 재생하지 않으니 배포본에서 빼는 편이 깔끔하다는 공통 기록 있음 |
| **VOX-04** 옛 모모 음성 21개(재생 안 함): `badge-0~4.mp3`, `ending-1.mp3`, `ending-2.mp3`, `map-0~5.mp3`, `retry-3.mp3`, `retry-5~8.mp3`, `story-1~3.mp3` | 모모 로컬 Qwen3-TTS-12Hz-1.7B-VoiceDesign(preset-01·02·06). 지금은 같은 대사의 `el-*`가 대신 재생됨(`src/voice-lines.js`의 target이 모두 `el-*`) | 2026-11-10 커밋 `4a60e7a`. 지금 manifest에는 없고, 파일 SHA-256이 git 기록의 옛 manifest(`13e86af`, `map-0`은 `d272074`)와 일치함을 이번에 확인. `docs/VOICE-INTEGRATION-20261110.md` | 모델 라이선스 **Apache-2.0** | `docs/VOICE-INTEGRATION-20261110.md`, `_shared/voice-provenance-20261118.md`(16번 표), git 기록 `assets/audio/voices/manifest.json`@`13e86af` | 확인됨 · 쓰지 않는 파일. 지금 작업 트리의 manifest에는 기록이 없다 |
| **VOX-05** 옛 Higgsfield 음성 3개(재생 안 함): `hint-0.mp3`, `hint-5.mp3`, `hint-7.mp3` | Higgsfield / ByteDance Seed Audio 1.0(기존 합성 녹음 참조). 지금은 `el-hint-*`가 대신 재생됨 | 2026-11-14. 파일 SHA-256이 git 기록의 옛 manifest(`13e86af`)와 일치 | 기록 없음. `_shared/voice-provenance-20261118.md`: "요금제·이용 조건 문구가 없다" | `_shared/voice-provenance-20261118.md`(16번 표, 빈칸 3번), git 기록 `assets/audio/voices/manifest.json`@`13e86af` | 근거 약함 · 빠진 것: Higgsfield 요금제·이용 조건. 쓰지 않는 파일 |
| **VOX-06** 다시 생각하기 새 녹음 2개: `el-retry-5-v2.mp3`(물방울 SK), `el-retry-7-v2.mp3`(잎새 Bee) | ElevenLabs 공식 API `eleven_v4`, VOX-01과 같은 목소리 | 2026-11-21, 요청 ID `A1picnWEqwp7XMRDY97u`·`SG91bPHk8nO6QMXL39vJ`, `assets/audio/voices/manifest.json`, `docs/VOICE-FILL-20261118.json` | ElevenLabs Creator 유료 요금제(VOX-01과 같은 계정, API 구독 조회 `tier: creator`) | 위 두 파일, `assets/CREDITS.md` | 확인됨 |
| **VOX-07** 영상 내레이션·대사 4개: `el-finale-2.mp3`(내레이터 Haemi), `el-intro-3.mp3`·`el-finale-4.mp3`(잎새 Bee), `el-intro-2.mp3`(물방울 SK) | ElevenLabs 공식 API `eleven_v4`, VOX-01과 같은 목소리 | 2026-11-21, 요청 ID `7JR4eQmFAUGOOxmyQlmd`·`5cWis7FIWvjifSdg69Ev`·`3c2mZvGeFCCguKR3KM2p`·`9m1OAgkCogpII56nI940`, `assets/audio/voices/manifest.json` | ElevenLabs Creator 유료 요금제(API 구독 조회 `tier: creator`) | 위 파일, `assets/CREDITS.md` | 확인됨 |

## 6. 글꼴 (3줄 · 6파일)

| 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **FNT-01** 본문 글꼴 2개: `assets/fonts/NanumSquareNeoTTF-bRg.woff2`, `NanumSquareNeoTTF-cBd.woff2` | 네이버 나눔스퀘어 네오 공식 배포본(수정 없음). 원본 https://campaign.naver.com/nanumsquare_neo/download/NaverNanumSquareNeo.zip | 2026-11-10 CREDITS 기록 | **SIL OFL 1.1**. 전문 `assets/fonts/NanumSquareNeo-OFL.txt`를 함께 배포 | `assets/CREDITS.md`(나눔스퀘어 네오 UI 글꼴), `assets/fonts/NanumSquareNeo-OFL.txt` | 확인됨 |
| **FNT-02** 제목 글꼴 2개: `assets/fonts/title-400.woff2`, `title-700.woff2`(CSS 이름 "Climate Lab Title", 시작 화면에서만 씀) | 나눔스퀘어 네오(FNT-01)를 시작 화면 글자만 남겨 줄인 파생본(fontTools). 글꼴 안 이름 「Climate Lab Title」(예약 글꼴 이름을 쓰지 않음, 2026-11-21 확인) | 2026-11-14, Codex 세션 `rollout-2026-11-13T21-43-10-01a1d4ee…`의 `fonts(16,'assets/fonts','Climate Lab Title',[index.html·main.js·voice-lines.js·welcome-voice.js],[(400,'bRg'),(700,'cBd')])`, 커밋 `5bdc48c` | **SIL OFL 1.1**(수정본). 전문 `assets/fonts/NanumSquareNeo-OFL.txt` | 위 세션 기록, `assets/fonts/NanumSquareNeo-OFL.txt` | 확인됨(2026-11-21 출처 미확인 → 원본·만든 방법 확인) |
| **FNT-03** 화면 본문 부분 글꼴 2개: `assets/fonts/climate-body-400.woff2`, `climate-body-700.woff2` | 나눔스퀘어 네오(FNT-01)를 앱 화면 글자 704자만 남겨 줄인 파생본. 글꼴 안 이름 「Climate Lab Body」 | 2026-11-21, `scripts/subset-fonts.py`(fontTools), 커밋 `2bdd154` | **SIL OFL 1.1**(수정본). 전문 `assets/fonts/NanumSquareNeo-OFL.txt` | `scripts/subset-fonts.py`, `assets/CREDITS.md` | 확인됨 |

## 참고: 장부 밖으로 둔 것

- 빌드가 빼는 파일: `assets/fonts/jua-korean-400.woff2`, `jua-latin-400.woff2`(Jua, OFL 1.1, `assets/fonts/OFL.txt`. CREDITS에 확인 기록 있음). `assets/fonts/OFL.txt`는 배포본에 남지만 글꼴 파일이 아니다.
- 배포되지 않는 폴더: `films/`(개념 영상 제작 원본), `references/`, `thumbnails/`, `_unused/`, `output/`.
- 파일이 아닌 화면 요소: `src/icons.js`의 SVG 아이콘과 `src/theme-effects.js`의 Web Audio 합성 효과음은 코드로 직접 만들었다고 기록돼 있다(`assets/CREDITS.md` 도구 표, `docs/AUDIO-PROVENANCE.md`).
- 미디어가 아닌 배포 파일: `assets/CREDITS.md`, `assets/audio/voices/manifest.json`.

## 사용자가 줘야 하는 자료

| 순서 | 필요한 자료 | 이어지는 줄 | 왜 필요한가 |
|---|---|---|---|
| 1 | 사용자 제공 AI 그림 23장(`chatgpt_generated_*.png`)의 **생성 계정과 생성 당시 ChatGPT 요금제 화면**, 대략의 생성일(대화 기록 캡처). 다른 사람이나 회사가 준 그림이면 **받은 경위를 보여 주는 계약·메일** | IMG-01, IMG-02, IMG-03, VID-02 | 원본 권리를 증명할 자료가 저장소에 하나도 없다 |
| 2 | **Codex/ChatGPT 이미지 도구의 요금제 화면과 이미지 이용 약관(출력물 소유·상업 이용 조항) 캡처**. 생성일 2026-10-21, 10-28, 11-08, 11-12, 11-14, 11-18 무렵 쓰던 요금제가 같았는지 한 줄 확인 | IMG-04~IMG-11, VID-01, VID-02 | 생성 기록·프롬프트는 있지만 이용 조건 기록이 없다 |
| 3 | 앵무새 잎새 3장의 **생성 대화 기록(프롬프트·날짜)** | IMG-05, VID-01 | CREDITS에 도구 이름만 있다 |
| 4 | 관측소 그림의 **프롬프트**(남아 있으면). 원본 `output/overnight-20261108/observe-v2.png`를 `references/`로 옮겨 보존할지 결정 | IMG-08 | 프롬프트 원문이 없다 |
| 5 | 성취 카드 그림의 **프롬프트 기록 위치**(`_scratch/reward-cards-20261118/gen/16/` 옆에 있는지) | IMG-09 | CREDITS에 프롬프트 위치가 없다 |
| 6 | 지도 대원·동료·악당 전투 자세를 **만든 도구 이름과 프롬프트**(`_scratch/villain-resume-20261114/16-sheets/`, `_scratch/map-redraw-20261114/`의 기록) | IMG-10, IMG-11 | "생성했다", "새로 그렸다"만 있다 |
| 7 | (2026-11-21 생성 기록으로 해결, 남은 것은 2번 요금제 자료) 옛 악당 그림 `villain-left.png`·`villain-right.png`와 대화 초상 `npc-dialogue/ipsae.webp`·`mulbangul.webp`를 **누가·무엇으로·언제 만들었는지**. 모르면 새로 만들거나(초상) 배포본에서 뺄지(옛 악당, 코드에서 안 부름) 결정 | IMG-12, IMG-13 | 어떤 기록도 없다 |
| 8 | (2026-11-21 제작 방법 확인: `movies.py`, 재료는 지도 캡처) 지도 파이널 영상 `map-finale.mp4`의 **제작 방법(도구·작업 파일)과 안에 들어간 그림 목록** | VID-03 | 어떤 기록도 없다 |
| 9 | (2026-11-21 해결: 나눔스퀘어 네오 OFL 파생본) 제목 글꼴 `title-400/700.woff2`의 **원래 글꼴 이름·배포처·라이선스 원문 파일**(예: OFL이면 `OFL.txt`) | FNT-02 | 이름·라이선스 기록이 없다 |
| 10 | **ElevenLabs Starter 요금제 화면(2026-11-12 무렵)과 상업 이용 조항**, Voice Library 목소리(Bee·SK) 이용 조건 캡처 | VOX-02 | 유료였다는 확인만 있고 조건 문구가 없다 |
| 11 | **Higgsfield 요금제·이용 조건** 캡처. 또는 쓰지 않는 세 파일을 배포본에서 빼기로 결정 | VOX-05 | 조건 기록이 없다 |
| 12 | (보강) **ElevenLabs Creator**, **Suno Premier** 요금제 화면 캡처 | VOX-01, MUS-01 | 지금도 확인됨이지만 사용자 확인 문장만 있어 캡처가 있으면 단단해진다 |
| 13 | (작은 일) `favicon.svg`를 직접 만들었다는 한 줄 확인 | IMG-14 | 파일 단위 기록이 없다 |

## 2026-11-22 점검 (판매 준비)

- 줄 수: 전체 33줄 · 확인됨 12 · 근거 약함 21 · 출처 미확인 0 · 비어 있거나 「미확인」으로 남은 칸 0. 위 표는 고치지 않았다.
- 「임시 판」으로 남은 줄: 없다. 인트로·마무리 영상(VID-04)은 장면별 도구·계정·시각이 이미 기록돼 있다(주 계정, 보조 계정 1·2).
- 2026-11-21 사용자 확인(그림은 모두 Codex(GPT 이미지), 이야기 영상은 구글 제미나이, 모두 유료 요금제, 보조 구글 계정 1·2·3도 유료)으로 도구와 유료 여부는 채워진다. 다만 21줄이 「근거 약함」인 이유는 요금제 화면과 이용 약관(출력물 소유·상업 이용 조항) 캡처가 없어서라 상태는 바꾸지 않았다. 아래 줄은 이 확인 문장을 근거로 덧붙이고 상태는 그대로 둔다.
  - 도구·유료 여부가 이 확인으로 채워지는 줄: IMG-04 ~ IMG-13, IMG-15, VID-04(영상 쪽은 구글 제미나이 유료).
  - IMG-01·IMG-02·IMG-03·VID-02: 사용자 제공 ChatGPT 그림의 원본 권리 증빙(생성 계정·요금제 화면 또는 받은 경위)이 필요하다. 이 확인에 「16곳 그림은 모두 Codex」라는 말이 있으나 이 원본들의 생성 도구와 계정이 같은지는 따로 기록이 없어 그대로 둔다.
  - IMG-05, IMG-08, IMG-09, IMG-10, IMG-11: 생성일·프롬프트 기록도 비어 있다(위 표의 「빠진 것」).
  - IMG-14(favicon): 직접 만들었다는 한 줄 확인이 필요하다.
  - VOX-02: ElevenLabs Starter 요금제 상업 이용 조항, Voice Library 목소리 이용 조건 캡처.
  - VOX-05: Higgsfield 요금제·이용 조건(쓰지 않는 파일이라 배포본에서 빼는 결정도 가능).
  - VID-01, VID-02, VID-03: 들어간 생성 그림의 요금제·약관에 따라 정해진다(IMG 줄과 같이 풀린다).
- 사용자 자료 대기: 이미지 도구(Codex/ChatGPT) 요금제 화면과 이용 약관 캡처, 영상 도구(Flow·Gemini) 요금제와 생성물 이용 약관 캡처, 사용자 제공 그림 23장의 생성 계정·요금제 또는 받은 경위, ElevenLabs Starter 조건 캡처, 위의 「사용자가 줘야 하는 자료」 1~13번 중 남은 것.
