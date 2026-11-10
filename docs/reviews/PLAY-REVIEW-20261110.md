# 기후 미래 작전실 · 2026-11-10 이어서 검수

보존한 중단 시점 커밋: `7c8bb93`.

## 실행 결과

- 날씨와 장기 기후 자료의 기간·단위, 온실 기체와 생활 대응의 인과관계, 환경 변화→영향→대응 순서를 보존·검증했다.
- 내려받는 SVG 인증서에도 두 공식 글꼴과 전체 라이선스를 포함해 오프라인에서 같은 글꼴을 사용할 수 있게 했다.
- `npm test`: 41개, `npm run build` 통과.
- `check-full-journey.mjs`: 72개 학습 단위를 실제로 누적 완료, 인증서 내려받기·새로고침 통과. 완료 상태를 주입하지 않았다.
- `check-interactions.mjs`, `check-responsive.mjs`(93개 상태), `check-delivery.mjs`(오프라인 영상·바이트 범위 포함 5개), `check-save-safety.mjs`, `check-concept-art.mjs`(10개), `check-flow-resume.mjs`, `check-activity-playback.mjs` 통과.
- `check-first-load.mjs`: 6개 크기의 홈·이야기·지도 고정 UI 이슈 0. 지도 카메라에 의한 월드 영역의 의도적 클리핑은 고정 UI 오류와 구분한다. 로컬 모의 20Mbps 학교 Wi-Fi 결과이며 실제 현장 측정은 아니다.
- fixture를 주입하는 검사에 한해 서비스워커를 막아 주입 누락을 방지했다. 실제 전체 학습·오프라인 재생 검사는 서비스워커를 유지했다. 첫 화면 검사는 fixture 변경 후 문서를 재시작하여 가짜 저장 충돌을 없앴다.
- 기존 안내 음성: 11.424초, 44.1kHz mono, peak −6.04dBFS. 재생·음소거·중복 방지 통과.

## 공통 변경과 검증 범위

중단 시점 WIP를 그대로 보존하고 수정·검증했다. 공식 나눔스퀘어 네오 Regular/Bold를 로컬로 제공하고 브라우저 CDP에서 실제 `NanumSquareNeoTTF-cBd` 렌더링을 확인했다. 공식 원본은 https://campaign.naver.com/nanumsquare_neo/download/NaverNanumSquareNeo.zip 이며 안내는 https://campaign.naver.com/nanumsquare_neo/ 이다. 폰트 폴더에 전체 저작권 안내와 SIL OFL 1.1 전문을 포함했다. 기존 영상·삽화 안의 글자는 재제작하지 않았다.

검증 환경은 2026-11-10 Mac mini의 Chrome, 배포용 dist다. 주요 화면은 1280×800·1920×1080·915×412에서 확인했다. 실제 클릭·키보드·브라우저 터치 에뮬레이션을 사용했지만, 실제 태블릿 하드웨어나 교실 네트워크 시험은 아니다. 화면 캡처와 실행 로그는 검수 작업 폴더에 보존했다. `graphify update . --no-cluster`로 소스 그래프도 갱신했다.

기존 안내 음성은 브라우저 재생 시간 진행, 전체 디코딩, 빠른 재생 전환의 중복 방지, 음소거 중단·재생 차단을 확인했다. 학습 조작의 Web Audio 효과음 생성도 확인했다. 새 캐릭터 대사는 아직 생성 대기이므로 이 단계는 **기존 음성을 유지한 1차 코드·폰트 검수**이며 새 음성 납품 완료가 아니다. 새 파일의 청감·대사 일치·통합 검수는 후속 단계다.

## 남은 작업

새 대사 40줄과 manifest가 준비되면 검수·연결 후 별도 커밋·배포한다.
