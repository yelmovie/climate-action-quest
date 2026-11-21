# 16 기후 미래 작전실 · 필요한 그림 목록 (2026-11-21, 3-1단계 ⑤)

기준: 앱 코드 `7ac9804`, 권리 장부 `docs/RIGHTS-LEDGER-20261121.md`. 그림은 이 단계에서 만들지 않는다. 새 그림이 필요한 자리만 적었다.

요약(2026-11-21 3-2a 갱신): **새 그림 0장**(가 0 · 나 0 · 다 0). 아침에는 1장(가 1)이었다. 권리 장부의 출처 미확인 그림 4개를 생성 기록과 이어(`docs/RIGHTS-LEDGER-20261121.md` IMG-12·IMG-13) 출처 미확인이 0이 됐다. 이 그림들은 다른 생성 그림처럼 요금제·약관 자료만 기다린다(장부 맨 아래 2번).

아침 요약: **새 그림 1장**(가 1 · 나 0 · 다 0). 출처 미확인 그림 4개 중 3개는 앱이 부르지 않는 남은 파일이라 새 그림 대신 배포본에서 빼는 쪽을 적었다.

## (가) 권리 장부에서 출처 미확인인 그림

**2026-11-21 3-2a: 해당 없음.** 아래 줄의 `mulbangul.webp`는 Codex 생성 기록(2026-11-12 21:52 KST `exec-260ce874` → `_scratch/npc-14-16-20261112/sheet-16.png` → `pack.sh`)을 찾아 새로 그리지 않는다. 기록용으로 아침 표를 남긴다.

| 쓰이는 화면 | 지금 파일 | 필요한 크기·비율 | 화풍을 맞출 참고 그림 | 왜 필요한지 |
|---|---|---|---|---|
| 활동 안내 대화창에서 수달 물방울이 말할 때(`src/activities.js:78` `npcPortrait(guide.character==='otter'?'mulbangul':'ipsae')`, `src/npc-conversation.js:7`) | `assets/npc-dialogue/mulbangul.webp`(880×474, 두 칸: 입 다문 얼굴·입 벌린 얼굴, 칸마다 약 440×474, 표시 비율 576/620) | 지금과 같은 두 칸 스프라이트, 칸 비율 576:620, 칸마다 576×620 이상, 투명 배경 | `assets/home-otter.webp`(시작 화면 수달), `assets/otter.webp`, 성취 카드 `assets/reward-cards/card-*.webp`의 그림체 | 권리 장부 IMG-13: CREDITS·프롬프트 기록이 없고 `_shared/OBSIDIAN-RULES-AUDIT-PROPOSAL-20261117.md:199`에도 「CREDITS에 출처 없음」. 지금 쓰는 그림이라 자료가 없으면 새로 만들어 바꿔야 한다(결정 「출처 모르는 옛 그림」, 3-3단계) |

### 새 그림 없이 정리할 것 (출처 미확인이지만 앱이 쓰지 않음)

| 파일 | 확인한 것 | 제안 |
|---|---|---|
| `assets/npc-dialogue/ipsae.webp`(880×474, 다람쥐 두 칸) | 잎새 대화 그림은 `src/npc-conversation.js:5`에서 `ipsaeDialogueArt`(`assets/ipsae-parrot-talk.webp`, 앵무새)를 쓴다. 이 파일을 부르는 코드 없음 | 배포본에서 빼기(3-3단계에서 함께) |
| `assets/map-encounters/villain-left.png`, `villain-right.png`(672×112) | 지도 악당은 `src/map-encounter-theme.js:9`의 `villain-poses-left/right.png`를 쓴다. `loadEncounterActor`는 `hero`·`ally`만 부른다. 이 두 파일을 부르는 코드 없음 | 배포본에서 빼기 |

## (나) 화풍·해상도가 튀거나 임시로 넣은 그림

없음. 배포되는 그림 75개(`dist` 전체, 래스터 74개는 `sips`로 크기 확인)를 봤다. 눈에 띄게 작은 것은 시작 화면 수달 `assets/home-otter.webp`(208×233)로, 1920×1080에서 약 290px 높이로 그려져 1.24배 늘어난다. 1280×800에서는 거의 원래 크기다. 스크린숏(`.tmp/score-fix-20261121/after-prod/home-new-1920x1080.png`)에서 흐림이 보이지 않아 새 그림 대상으로 올리지 않았다. 배경 그림(1672×941)도 1920 폭에서 1.15배라 같은 판단이다.

## (다) 게임성·화면 보강에 필요한 소품·배경

없음. 할 일 목록(`SCORE-100-TODO-20261120.md`)에 A17·C14 같은 게임성·화면 보강 줄이 없다.

## 학습 문구 초안(COPY-DRAFT)

만들지 않았다. 할 일 목록에 학습 문구·피드백 줄(A4·A5·A8·A9·A13·A14·A15·B15)이 없다. 교사 검수표(`docs/TEACHER-REVIEW-20261121.md`)의 「확인 필요」 11곳은 교사가 먼저 보고 고칠지 정한다.
