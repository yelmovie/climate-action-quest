# 에셋·교실 네트워크·미디어 정적 점검

작성: 2026-10-21 · 대상: 기후 미래 작전실 v0.1.0 · 읽기 전용 점검 1회

적용 스킬: asset-audit, classroom-ready, media-check. 코드·에셋을 수정하거나 삭제하지 않았다. 이 보고서는 작업 중 소스와 당시 `dist`의 **정적 스냅샷**이다. 부모 작업자가 수행하는 브라우저 실측·최종 재빌드 결과는 최종 검수 보고서에서 이 결과를 갱신한다.

`PASS`는 표에 적힌 정적 사실만 확인했다는 뜻이다. 실제 네트워크·청음·오프라인 플레이를 확인한 것으로 읽으면 안 된다.

## 1. 에셋 현황

| 종류 | 개수 | 총 바이트 | 최대 파일 |
|---|---:|---:|---|
| WebP 이미지 | 11 | 4,243,384 | field-team.webp, 1,164,360 |
| SVG 이미지 | 1 | 307 | favicon.svg |
| WOFF2 폰트 | 2 | 384,792 | jua-korean-400.woff2, 368,172 |
| 음원 파일 | 0 | 0 | Web Audio 코드 합성 |
| 영상 파일 | 0 | 0 | 이야기·보상은 DOM 화면 |
| GLB/GLTF | 0 | 0 | 시설은 2D |
| CREDITS·OFL 텍스트 | 2 | 12,655 | CREDITS.md |

자산 합계 4,641,138 bytes. 당시 `dist`는 27개 파일·4,398,292 bytes였으나, **폰트 추가 전 빌드**여서 최신 배포본의 수치로 쓰면 안 된다.

| 파일 | 형식·바이트 | 파일 수정일 | 용도·참조 |
|---|---:|---|---|
| assets/home.webp | WebP 311,144 | 2026-10-21 | index.html:11 preload, src/main.js의 홈·스토리·엔딩 |
| assets/city.webp | WebP 420,874 | 2026-10-21 | src/state.js:5~6, 관측·활동 조사 |
| assets/coast.webp | WebP 351,134 | 2026-10-21 | src/state.js:7, 수위 모형 실험 |
| assets/bedroom.webp | WebP 263,016 | 2026-10-21 | src/state.js:8, 생활 선택 |
| assets/design.webp | WebP 387,326 | 2026-10-21 | src/state.js:9, src/activities.js:143 |
| assets/storm.webp | WebP 368,670 | 2026-10-21 | src/activities.js:193, 도시 시험 |
| assets/logo.webp | WebP 131,336 | 2026-10-21 | 현재 런타임의 직접 참조를 찾지 못함 |
| assets/squirrel.webp | WebP 8,932 | 2026-10-21 | 시설 안내 캐릭터의 동적 이름 참조 |
| assets/otter.webp | WebP 2,454 | 2026-10-21 | 시설 안내 캐릭터의 동적 이름 참조 |
| assets/village.webp | WebP 834,138 | 2026-10-21 | src/map.js:7 |
| assets/field-team.webp | WebP 1,164,360 | 2026-10-21 | src/map.js:9, 방향별 보행 프레임 |
| assets/favicon.svg | SVG 307 | 2026-10-21 | index.html:9, manifest.webmanifest:1 |
| assets/fonts/jua-korean-400.woff2 | WOFF2 368,172 | 2026-09-22 | src/styles.css:7 |
| assets/fonts/jua-latin-400.woff2 | WOFF2 16,620 | 2026-09-22 | src/styles.css:15 |
| assets/fonts/OFL.txt | TXT 4,332 | 2026-10-21 | 배포 시 라이선스 동봉 |
| assets/CREDITS.md | MD 8,323 | 2026-10-21 | 출처·권리 확인 기록 |

### 에셋 발견 사항

| 판정 | 항목 | 근거·영향 |
|---|---|---|
| PASS | 원본·배포본 분리 | scripts/build.mjs:6은 index·manifest·src·assets만 복사. references의 큰 PNG 원본을 배포하지 않음 |
| PASS | WebP 변환·이력 | scripts/prepare-assets.py, docs/reference-review/prepared-assets.json에 원본·SHA256·크롭·크기 기록 |
| PASS | 코드의 이미지 이름·대소문자 | 정적 literal 및 state의 background 열거형과 실제 파일 대조. 해당 이름의 파일 모두 존재 |
| PASS | 동일 내용 중복 | assets 전체 SHA256 비교 결과 동일 해시 그룹 0개 |
| PASS | 파일명 | 배포 이미지·폰트 경로는 영문 kebab-case, 공백·한글 없음 |
| PASS | 실제 UI 분리 | 활동 카드·버튼·문구는 DOM/SVG. 시안 전체 이미지를 클릭 UI로 쓰지 않음 |
| WARNING | 1MB 초과 이미지 | field-team.webp 1.16MB. 기능상 방향별 보행 아틀라스이므로 일반 콜라주와 구별. 실제 크기·프레임 선명도를 보고 최적화 여부 결정해야 함 |
| WARNING | 미사용 후보 | logo.webp 131,336 bytes의 런타임 직접 참조 없음. 빌드·사전 캐시에 포함됨. 동적 사용 가능성을 최종 확인하며 삭제하지 않음 |
| WARNING | 현재 dist가 소스보다 오래됨 | dist/assets/fonts가 없고 dist/sw.js 캐시 목록에 WOFF2·OFL이 없음. 최종 재빌드 필수 |
| NOT TESTED | 실제 HTTP 실패·404 | 부모가 브라우저 요청과 콘솔을 확인할 예정. 파일 존재를 404 없음으로 바꾸어 적지 않음 |
| NOT TESTED | 축소 그림·프레임 경계 품질 | 실제 지도에서 학생·동행 NPC의 방향별 발 위치와 프레임 잘림 확인 필요 |
| WARNING | 기존 AI 이미지의 상업 권리 | assets/CREDITS.md:7. 제공 파일의 생성 계정·요금제·계약 자료가 없어 상업 이용 권리 승인으로 판단하지 않음 |
| PASS | Jua 라이선스 | assets/fonts/OFL.txt, docs/reference-review/jua-fonts.json. Google Fonts 공식 OFL·메타데이터와 내장 Jua Regular v1.001 확인, 원문 동봉 |
| PASS | 앱의 AI·폰트 고지 | src/settings-content.js:25~27에 AI 생성 가상 이미지·코드 합성음·Jua OFL·자체 SVG 표시 |

정적 미사용 판정은 삭제 권고가 아니다. 원본 시안·미사용 후보는 `_unused/DELETE-CANDIDATES.md`에 보존 원칙을 기록했다.

## 2. 교실 네트워크·오프라인

### 첫 화면·30명 동시 접속

실제 첫 화면 전송 용량·요청 수·시간은 **NOT TESTED**다. 현재 구조는 첫 홈 배경을 preload하고, 서비스워커 설치 때 배포 파일 전체를 `addAll`한다. 최신 폰트까지 포함한 전체 준비 비용은 약 4.8MB 수준으로 예상되지만 실제 네트워크 측정값이 아니다.

참고 산술: 약 4.8MB 전체 준비 × 30명 ≈ 144MB. AP 대역폭·동시 캐시 상태를 측정하지 않아 교실 대기 시간을 추측하지 않는다. 홈이 뜨는 전송과 오프라인 자료 준비 전송을 나누어 실측해야 한다.

| 판정 | 항목 | 근거·한계 |
|---|---|---|
| PASS | 초기 대기 문구 | index.html:16의 boot 상태 문구가 흰 화면 대기를 대신함 |
| PASS | 외부 CDN·API 의존 없음 | src·index·manifest의 네트워크 참조 정적 검색. 발견된 http URI는 다운로드 SVG의 XML namespace이며 외부 요청이 아님. 폰트는 로컬 WOFF2 |
| WARNING | 첫 설치에 뒷장 자산까지 받음 | scripts/build.mjs:12의 FILES 전체 `addAll`. classroom-ready의 지연 로딩 기준은 현재 구조로 충족하지 못함. 홈 실측과 백그라운드 준비 비용을 확인하고, 필요하면 오프라인 준비를 명시적 행동으로 분리 |
| WARNING | 개발 서버의 압축·캐시 | scripts/dev.mjs:12는 no-cache이고 gzip/brotli 없음. 개발 서버 조건이며 운영 호스팅의 전송 압축·캐시 헤더는 별도 확인 |
| NOT TESTED | 초기 요청 수·3초 로딩 | 브라우저 cold-cache 네트워크 측정 필요 |
| NOT TESTED | 운영 HTTP 압축·장기 캐시 | 배포 URL이 아직 이 점검 대상에 없음 |

### PWA 구성

| 판정 | 항목 | 근거·한계 |
|---|---|---|
| PASS | manifest 링크·한글 이름·standalone | index.html:10, manifest.webmanifest:1 |
| WARNING | 가로 방향 지정 없음 | manifest.webmanifest에 orientation 필드 없음 |
| WARNING | 설치 아이콘 호환성 | SVG `sizes:any` 아이콘 한 장만 있음. 192·512 PNG 아이콘이 없어 해당 기기 설치 UI 실측 필요 |
| PASS | 서비스워커 등록 코드 | src/main.js:84, 배포본 sw.js가 있을 때만 등록하고 ready 후 준비 안내 |
| PASS | 캐시 버전·활성화 | scripts/build.mjs:10~14의 내용 해시·skipWaiting·clients.claim·해당 climate- 이전 캐시 정리 |
| WARNING | HTML도 cache-first | scripts/build.mjs:15. 새 SW 활성화 전의 갱신 경험·구버전 콘텐츠 잔류 여부 확인 필요. 사용자 버전 갱신 안내 없음 |
| WARNING | start_url은 도메인 루트 | `/` 및 절대 자산 URL. 루트 배포를 전제하므로 하위 경로 배포는 별도 대응 필요 |
| WARNING | 반복 빌드 시 이전 파일 혼입 가능 | build는 기존 dist를 비우지 않고 walk함. 이전 sw.js나 남은 파일까지 다음 캐시 목록에 포함될 가능성. 최종 산출물 목록 확인 필요 |
| NOT TESTED | HTTPS·설치 후 실행 | 실제 운영 배포·설치 환경에서 확인 필요 |

### 실제 끊김 시나리오

| 시나리오 | 판정 | 다음 확인 |
|---|---|---|
| 캐시 완료 후 오프라인 새로고침 | NOT TESTED | 부모 브라우저 네트워크 차단 실측 |
| 진행 중 끊김·다음 시설 이동 | NOT TESTED | 활동 도중 차단 후 저장·이동·새로고침 |
| 다시 온라인으로 복구 | NOT TESTED | 연결 복구 뒤 오류·중복 이벤트 확인 |
| 오프라인 상태 안내 | WARNING | 준비 완료 안내는 있지만 offline/online 상태 변화 안내 코드는 찾지 못함 |

### 저장 안정성

| 판정 | 항목 | 근거 |
|---|---|---|
| PASS | 프로젝트 전용 키 | src/state.js:2~3, climate-future 접두어 |
| PASS | 저장 예외·복구 | src/state.js:28~29의 try/catch, src/main.js:12의 저장 실패 안내 |
| PASS | 화면의 저장 정책 안내 | src/settings-content.js 교사용 가이드에 현재 브라우저 저장·서버 미전송 명시 |
| PASS | 확인 있는 초기화·소리 분리 | src/main.js의 confirmReset 진입과 별도 SOUND_KEY 사용 |
| NOT TESTED | 기록 크기·저장 차단 실제 동작 | 실제 완주 기록 JSON 크기, 저장소 차단·용량 초과 시나리오 필요 |
| NOT TESTED | 공용 태블릿 교대 | 새 학생 시작·이전 학생 기록 식별과 초기화 안내의 현장 이해도 확인 필요 |

## 3. 영상·오디오·성취 연출

### 영상 목록

실제 `<video>`나 mp4/webm 영상 파일은 없다. `manifest.webmanifest` 문자열의 `.webm` 부분 검색 결과는 영상이 아니다. 영상 코덱·재생 끊김·영상/BGM 충돌 항목은 **N/A**다. 의뢰 다시 보기는 src/main.js:55~58의 3장 DOM 이야기이며, 엔딩·인증서도 실제 UI다.

### 오디오 구조

| 판정 | 항목 | 근거·한계 |
|---|---|---|
| PASS | 전역 오디오 관리자 | src/main.js:10에서 createAudio 한 번 생성, src/audio.js:2~8이 합성음 담당 |
| PASS | 사용자 행동 후 시작 | src/main.js:13의 pointerdown·keydown에서 unlock. AudioContext 생성·resume 예외 처리 존재 |
| PASS | BGM·효과음 분리·초기 크기 | src/audio.js:3의 bgm/sfx 별도 설정, volume 25. settings의 두 스위치·BGM 전용 range |
| PASS | 음소거 위치·저장 코드 | src/main.js:14~15의 고정 소리 버튼, src/audio.js:8의 저장·toggle |
| PASS | BGM 중복 타이머 방지 | src/audio.js:7의 if(!timer). 새 화면마다 별도 BGM 인스턴스를 만들지 않음 |
| PASS | 숨긴 탭·모달에서 새 BGM음 억제 | src/audio.js:7의 document.hidden·dialog[open] 검사 |
| WARNING | 음소거 직후 잔향 가능 | tone은 이미 예약한 oscillator를 추적·중단하지 않고 toggle은 설정만 변경함. 현재 음이 최대 약1.3초 더 남을 수 있는 구조. 실제 청음 필요 |
| WARNING | 지연된 효과음의 설정 재확인 없음 | effect의 100ms setTimeout 내부는 sfx 상태를 다시 확인하지 않음. 그 사이 전체 음소거를 하면 두 번째 음이 재생될 수 있음 |
| NOT TESTED | 뒤로·재진입·새로고침의 실제 겹침 | 코드 구조를 실제로 겹치지 않는다는 판정으로 대신하지 않음 |
| NOT TESTED | 소리 켜기·끄기·볼륨 실제 청음 | 부모가 브라우저에서 실측 예정 |

### 성취 연출

| 판정 | 항목 | 근거·한계 |
|---|---|---|
| PASS | 연구 결과물·배지·인증서 UI | src/main.js:44~49의 활동 보상, :72~78의 기록 연결·인증서·SVG 내려받기 |
| PASS | 실제 기록 기반·완료 조건 | src/main.js:76의 학생 요약, src/state.js:27의 certificateEligible. 관리자 접근만으로 인증서 발급하지 않음 |
| PASS | 모달 등장 모션·동작 줄이기 | src/styles.css:299,359,572~573. DOM 등장 애니메이션과 reduced-motion 처리 |
| NOT TESTED | 축하 연출의 체감·실제 사운드 | 최종 완료까지 실제로 조작해 성취감·지속시간·겹침 확인 필요. 파일 존재만으로 연출 품질 통과하지 않음 |

## 4. 최종 보고에 흡수할 조건

1. 최신 소스로 재빌드하여 폰트·OFL과 실제 배포 파일·서비스워커 목록을 확인한다.
2. 첫 홈 화면의 전송/시간과 전체 오프라인 준비 비용을 분리해 잰다. 네트워크 차단 후 새로고침·다음 시설·진행 저장을 실제로 수행한다.
3. 음소거 직후 잔향·지연 효과음 및 재진입 BGM 겹침을 실제로 듣는다.
4. 설치 아이콘·manifest·HTTPS·운영 캐시 헤더는 실제 배포 환경에서 확인한다.
5. 기존 AI 원본의 상업 이용 권리는 권리자의 계약·생성 계정 자료 확인 전까지 미확인 상태로 유지한다.

이 보고서는 최종 배포 허가나 10/10 점수 판정이 아니다. 실제 측정하지 않은 항목을 PASS로 전환하지 않는다.
