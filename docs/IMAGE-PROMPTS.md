# 생성 이미지 · 적용 기록

2026-10-21. 내장 `image_gen`으로 생성했다. 생성 도구의 기본 출력(C:)을 D: 프로젝트 `references/generated/`로 복사하고 실제 앱은 `assets/`의 WebP를 사용한다. 기존 원본 23장은 보존했다. 영상 생성은 수행하지 않았다.

## 마을 지도

- 원본: `references/generated/village-map.png` (1672×941)
- 배포: `assets/village.webp` (quality 92)
- 생성 프롬프트: “Use case: stylized-concept. Finished game world-map background for a Korean elementary climate science adventure, no UI and absolutely no lettering. Gorgeous expansive landscape 16:9 2.5D pixel-art RPG village, premium handcrafted large-pixel art, warm cozy adventure, crisp carefully clustered pixels, lush sage/emerald forests, turquoise river, cream sandy walking paths, charming scientific buildings, golden sunshine. Camera diagonally down about 35 degrees. Exactly SIX main buildings: bottom-left round glass-domed climate HQ; upper-left observatory with telescope and pale blue roof; upper-middle investigation lodge with antenna and amber roof; upper-right waterside laboratory with waterwheel and mint roof; lower-right sunny home-life research cottage with orange roof; lower-middle city design workshop with tiny city model under glass and teal roof. Broad winding connected ivory dirt trail connects every doorstep through the central meadow, a wooden bridge crosses the stream. Large distinguishable buildings, open paths, friendly flowers, mushrooms and weather instruments. NO characters, text, labels, buttons, borders, numbers, HUD, watermark or logos. Pixel ground and buildings consistent scale.”
- 지도 원본을 보고 문·길의 좌표를 `src/world.js`에 수동 작성했다. 생성 그림의 예상 좌표를 그대로 신뢰하지 않았다. 강·건물 내부를 걸을 수 있는 땅으로 취급하지 않는다.

## 학생 대원 · 잎새

- 원본: `references/generated/field-team.png` (887×1774 RGBA)
- 배포: `assets/field-team.webp` (lossless)
- 생성 프롬프트: “Use case: stylized-concept. Production pixel RPG walking sprite sheet, transparent background. Exact uniform 4-column by 8-row sheet, 32 equal square cells, same baseline at 85% cell height. No scenery, text, labels, borders or watermarks. Premium cozy 2.5D pixel RPG crisp pixel clusters. Cute elementary student science research cadet: moss-green cap, cream shirt, turquoise vest, brown hiking shorts, green backpack, brown boots, friendly chibi face. Top 4 rows: same student facing down/front, left, right, away/up; each row 4 walking steps. Lower 4 rows: tiny orange squirrel science companion, curled fluffy tail, green leaf scarf and tan satchel, same direction order. Student70% cell height, squirrel55%. Preserve identical design and scale, fully inside each cell, aligned feet, subtle steps, transparent between subjects. Usable game atlas, not a concept sheet.”
- 정해진 셀을 캔버스에서 분리해 그린다. 재생성·임의 배경 제거·원본 덮어쓰기는 하지 않았다. 방향별 걷기와 잎새의 길 따라오기를 실제 지도에 적용했다.

## 기존 이미지 재사용

`scripts/prepare-assets.py`가 제공된 연구실·도시·해안·방·도시 설계·날씨 이미지와 NPC를 WebP로 준비한다. 화면 시안처럼 UI 글자가 합쳐진 이미지를 통째로 눌러 쓰지 않는다. 홈·시설·활동 배경은 그림, 문구·입력·피드백은 실제 DOM, 공통 기능 아이콘은 `src/icons.js`의 SVG다. 생성·기존 에셋의 출처와 권리 확인 범위는 `assets/CREDITS.md`에 기록했다.
