# 인트로·마무리 영상 (2026-11-21 최종)

앱 파일: `assets/films/intro.mp4`(33.5초), `finale.mp4`(29.5초), 포스터 `*.webp`. 1280×720 24fps H.264, 소리 없음(목소리·배경음은 앱이 튼다). 운영에서 Range 206(`run_worker_first`에 `/assets/films/*`, `_scratch/deploy-20261118/cfg/16.json`).
재생: 처음 「연구 시작하기」(저장 기록이 없을 때)·「어떤 모험인가요?」·설정 「이야기 다시 보기」에서 인트로, 처음 「작전실 켜고 인증서 받기」에서 마무리 뒤 인증서. 엔딩 화면 「마무리 영상 다시 보기」. 전체 화면(contain), 위쪽에 목소리·멈춤·다음 장면·건너뛰기(48px), 자막은 영상 안. 영상이 안 열리면 예전 이야기 3장 또는 인증서로 간다. 코드 `src/story-film.js`, `src/story-film-data.js`.

## 이야기
- 인트로(탐험하고 싶다): 연구기지에서 기록이 흩어지고 악당이 달아남(수수께끼) → 지도 탁자에서 물방울 「지도 속 다섯 시설이 모두 깜깜해! 누가 날씨 기록을 바꿔치기한 걸까? 그 단서는 다섯 곳에 숨어 있을 거야.」, 지도가 진짜 골짜기로 펼쳐짐 → 잎새의 초대 「대원, 네 도움이 필요해! 다섯 시설에 다시 불을 켜러 같이 가자!」 → 제목 그림과 「흩어진 기후 단서를 찾아 출발!」.
- 마무리(해냈다!): 같은 골짜기에 다섯 불빛이 켜지고 기록이 돌아옴, 악당은 머쓱하게 물러남 → 작전실에서 다섯 메달이 하나로, 인증서 → 다음 날 아침 생활 속 실천 → 잎새 「대원, 우리가 해냈어! 함께 탐구해서 정말 즐거웠어. 고마워!」와 「탐구 완료!」 배지·잎 꽃가루.

## 장면별 출처
| 장면 | 첫 프레임 | 움직임 | 목소리(ElevenLabs `eleven_v4`) |
|---|---|---|---|
| I-1 흩어진 기록 | GPT 이미지(Codex) `i1.png` | Google Flow `Omni 1.2 Flash`, 주 계정(화면 표시 PRO), 시작 i1 → 끝 i2, 2026-11-21 11:3x KST | 내레이터 Haemi `story-1`(기존) |
| I-2 지도 탁자 → 골짜기 | `i2.png` | Google Flow `Omni 1.2 Flash`, 주 계정, 시작 i2 → 끝 i3, 2026-11-21 11:4x KST | 물방울 SK `intro-2` ★ `9m1OAgkCogpII56nI940`(2026-11-21 18:3x, 설명 문장을 수수께끼로 바꿈. 원본 -23 LUFS라 +9.5 dB·리미터로 -16.9 LUFS) |
| I-3 다섯 시설로 | `i3.png` | Gemini 앱 동영상 만들기(Veo), 보조 계정 1(화면 표시 PRO·사용자 확인 유료), 2026-11-21 16:3x KST. 첫 시도(주 계정 15:51)는 물방울이 둘·악당이 함께 걸어 버림 | 잎새 Bee `intro-3` ★새 줄 `5cWis7FIWvjifSdg69Ev` |
| F-1 다섯 불빛 | `f1.png` | Gemini 앱 동영상 만들기(Veo), 주 계정(PRO), 2026-11-21 15:52 KST | Haemi `ending-1`(기존) |
| F-2 중앙 작전실 | `f2.png` | Gemini 앱 동영상 만들기(Veo), 주 계정(PRO), 2026-11-21 15:58 KST | Haemi `finale-2` ★ `7JR4eQmFAUGOOxmyQlmd` |
| F-3 다음 날 아침 | `f3.png` | **임시: ffmpeg 카메라 움직임.** Gemini 두 번(주 계정 15:59 「생성 용량 초과」, 보조 계정 2 16:5x 「오류」) 모두 영상이 오지 않음 | Haemi `ending-2`(기존), 잎새 `finale-4` ★ `3c2mZvGeFCCguKR3KM2p` |

- 장면 그림·프롬프트: `frame-prompts.json`, Flow `flow-clips.json`, Gemini `gemini-prompts.json`. 원본·작업 폴더: 외장 `_scratch/films-16-20261121/`.
- 합성: `render3.py`(장면 → 끝 장면 모션그래픽 → `_shared/caption-motion-20261118/burn.py` 자막 → 웹 인코딩). 자막 큐 `intro.json`, `finale.json`. 자막·목소리 대조와 음량: `CAPTION-VOICE-CHECK.md`.
- 전환: 인트로는 시작·끝 프레임으로 이은 한 흐름(Flow), 마무리는 0.5초 디졸브·흰빛. 끝 장면: 앱 제목 그림 `logo-title.webp`과 주아체 한 줄 / 금빛 「탐구 완료!」 배지(주아체)와 잎 꽃가루.
- 워터마크: Flow·Gemini 영상 오른쪽 아래의 작은 Veo 표시를 지우지 않았다.
- F-3을 바꾸려면: Gemini·Flow 한도가 풀린 뒤 `f3.png`와 `gemini-prompts.json`의 `F3`로 한 편을 만들어 `_scratch/films-16-20261121/clips/G-F3.mp4`에 두고 `render3.py`를 다시 돌린다(자막·목소리 시간은 그대로).
