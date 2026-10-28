# 삭제 후보 검토 · 2026-10-21

**이번 작업에서 실제로 삭제한 원본은 없다.** 아래는 현재 런타임 직접 사용 대상이 아닌 참고 자료다. 재설계·권리·제작 이력을 위한 근거이므로 삭제를 권고하지 않고, 학생 배포본에 넣지 않는 대상으로 기록한다. 원본 경로를 유지한다.

| 경로 | 바이트 | 직접 미사용 근거 | 권고 |
|---|---:|---|---|
| `references/screen-mockups/chatgpt_generated_01.png`~`10.png` | 합계 21,347,108 | 문구·UI가 합쳐진 시안이므로 전체를 클릭 화면으로 사용하지 않음 | 개발 참고 보존·정적 배포 제외 |
| `references/backgrounds/chatgpt_generated_11.png` | 2,499,393 | 홈은 중앙이 빈 13번을 사용 | 원본 보존·정적 배포 제외 |
| `references/backgrounds/chatgpt_generated_12.png` | 2,620,804 | 복합 기후 장면은 관측 수치의 증거로 사용하지 않음 | 원본 보존·정적 배포 제외 |
| `references/backgrounds/chatgpt_generated_16.png` | 3,045,244 | 도시 조사는 14번으로 통일 | 원본 보존·정적 배포 제외 |
| `references/backgrounds/chatgpt_generated_18.png` | 2,596,945 | 대비 그림을 과학적 실제 비교 자료로 쓰지 않음 | 원본 보존·정적 배포 제외 |
| `references/branding/chatgpt_generated_21.png` | 1,671,948 | 글자 중심 23번을 브랜딩 파생 자산으로 준비 | 원본 보존·정적 배포 제외 |

사용 원본도 런타임은 `assets/`의 WebP 파생 파일을 참조한다. PNG 원본이 런타임에서 직접 호출되지 않는다는 이유만으로 미사용·삭제 대상으로 판단하지 않는다. 최종 실제 배포 파일 목록은 빌드 결과를 기준으로 검사한다.
