# 기후 미래 작전실 3D 제작용 기본 이미지와 프롬프트

활동 화면은 2D로 유지하고, 해수면 실험·도시 설계·스트레스 테스트의 중앙 모형만 회전 가능한 3D로 만드는 방향으로 확정했어. 스테이지 선택 화면은 별도의 2.5D 픽셀아트 맵으로 만들고, 아래 3D 자산을 그대로 배치하지 않아.

우선 준비할 기본 이미지는 8종이야. 그중 해안 지형 1종은 높이와 배치 참고용이고, 나머지 7종은 개별 3D 오브젝트 제작용이야. 추가 3종은 후순위 후보야. 지금은 목록과 프롬프트만 준비하며 이미지나 3D 모델을 생성한 상태는 아니야.

# 3D가 의미 있는 화면

| 화면 | 3D로 다룰 대상 | 학생이 하는 일 |
| --- | --- | --- |
| 3장 첫 활동 해수면 미래 실험 | 높이가 다른 가상 해안도시 | 시점을 바꾸며 높낮이를 보고, 침수 범위를 예상한 뒤 수위를 바꿔 비교 |
| 5장 첫 활동 미래도시 설계 | 앞서 조사한 같은 도시와 대응 시설 | 위험 구역에 시설을 배치하고 위치에 따른 차이 확인 |
| 5장 둘째 활동 기후 스트레스 테스트 | 학생이 저장한 도시 설계 | 같은 조건에서 수정 전후를 시험하고 취약 구역 비교 |

화면의 안내, NPC, 버튼, 기록 패널은 2D로 유지해. 3D는 중앙 실험판 안에서만 동작해. 세 활동은 같은 도시 모형과 학생의 설계 기록을 이어서 사용해.

메인 화면, 자연 속 스테이지 맵, 증거 판독, 관계 연결, 하루 선택, 보고서와 인증서는 실시간 3D가 필요하지 않아.

# 참고 이미지와 스타일

기존 배경 14·15·19번의 초록 지형, 청록색 물, 밝은 크림색 건물, 친근한 미니어처 비율을 참고해. 특히 19번은 도시 전체 분위기와 배치 참고용이야. 화면 시안 05·09·10번은 조작 영역의 참고 자료야.

기존 22번 캐릭터 시트의 잎새 다람쥐와 물방울 수달은 2D NPC로 유지해. 다람쥐의 주황 털·잎 장식·초록 스카프·베이지 조끼, 수달의 갈색 털·청록 스카프·물방울 무늬·베이지 조끼를 이어가면 돼. 3D 캐릭터 제작은 이번 기본 목록에서 제외해.

스테이지 맵은 픽셀아트, 활동 배경과 캐릭터는 기존의 부드러운 일러스트, 실험 모형은 그 팔레트를 공유하는 단순한 미니어처로 구분해.

# 이미지 생성 공통 지침

아래 공통 프롬프트에 해당 자산의 개별 프롬프트를 이어 붙여 사용해. 첫 자산의 스타일을 정한 다음 같은 참고 이미지를 재사용해.

- 개별 오브젝트는 정사각형 1024×1024 이상, 물체 전체가 보이고 사방 여백 10~15%인 한 장으로 준비해.
- 배경은 무늬 없는 흰색으로 통일하고 바닥 그림자는 약하게 해. 투명 배경이 필요하면 체크무늬를 그리는 대신 실제 알파 채널로 출력해.
- 정면과 오른쪽 면, 윗면이 보이는 일정한 사선 시점으로 맞춰. 여러 방향이 필요하면 승인된 같은 물체에서 별도 이미지를 만들어.
- 한 장에 여러 모델이나 여러 시점을 합친 시트는 최종 변환 입력으로 사용하지 않아.
- 글자, 수치, 아이콘, 물, 비, 열기, 영향 영역은 모델에 그려 넣지 않고 화면에서 따로 표현해.

공통 프롬프트

```text
Create one clean reference image of a single modular asset for a child-friendly climate science city model. Use a cohesive stylized miniature aesthetic with simple solid forms, matte painted surfaces, soft rounded edges, cream and warm sand building colors, leaf-green vegetation and restrained teal accents. Show the complete object in an orthographic three-quarter view from the front-right, looking down about 30 degrees. Use soft neutral studio lighting, a plain white background, a faint contact shadow and generous empty margins. Keep the silhouette clear and construction plausible, with thick readable structural parts and restrained detail. No text, labels, logos, interface, people, animals, decorative scenery or extra objects. One asset, one view.
```

공통 제외 조건

```text
No photorealism, dramatic perspective, depth-of-field blur, metallic chrome, glossy plastic, bloom, neon holograms, baked weather effects, painted water reflections, tiny floating parts, fragile wires, cut-off geometry, exploded views, multi-view collage, ornamental display pedestal, text, numbers, watermark or checkerboard background.
```

# 기본 이미지 목록

| 번호 | 기본 이미지 | 우선순위 | 사용 목적 |
| --- | --- | --- | --- |
| 01 | 높낮이가 보이는 가상 해안 지형 | 우선 | 해수면 실험·도시 설계·테스트의 공통 배치 참고 |
| 02 | 기본 주택 | 우선 | 주거 지역 구성, 반복 배치 |
| 03 | 학교 건물 | 우선 | 학교 위치 조사, 안전한 쉼터의 재사용 모형 |
| 04 | 도로를 잇는 작은 다리 | 우선 | 해안 수위 변화와 이동 경로 단절 관찰 |
| 05 | 도시숲 모듈 | 우선 | 녹지·그늘 대응 시설 |
| 06 | 그늘 쉼터 | 우선 | 학교 앞·보행 공간의 폭염 대응 |
| 07 | 빗물 저장 시설 | 우선 | 물 부족 대응 시설 |
| 08 | 빗물을 잠시 담는 저류 공간 | 우선 | 많은 비 상황의 물 관리 대응 시설 |
| 09 | 대중교통 정류장 | 후순위 | 도시의 이동·장기 대응 선택 확장 |
| 10 | 지붕 태양광 모듈 | 후순위 | 기존 건물에 부착하는 장기 대응 표현 |
| 11 | 기후 코어 중앙 장치 | 후순위 | 엔딩 장식 후보 |

# 자산별 이미지 프롬프트

## 01 높낮이가 보이는 가상 해안 지형

파일명: `coastal-terrain-reference.png`

기존 15·19번의 분위기를 참고하되 물과 건물을 뺀 지형만 제작해. 생성된 메시를 침수 계산의 기준으로 삼지 않고, 높이 단계와 바다 연결 정보를 별도 데이터로 만든 뒤 지형을 구성해.

```text
A single compact square coastal terrain tile seen as an educational landform model, with an exposed sandy low coast along the front edge, a broad gently raised middle terrace and a clearly higher grassy hill at the rear. Include one shallow open channel connected to the coast and broad empty spaces for later placement of houses, a school and roads. Make all land-height transitions clearly readable with simple slopes. Dry terrain only: no sea surface, no water, no buildings, no roads, no trees, no arrows or contour labels. This is a layout and elevation reference, not a finished city.
```

## 02 기본 주택

파일명: `house-base.png`

한 채를 여러 위치에 배치하고 색·방향만 변주해. 가족·주민은 2D 표식으로 표현할 수 있어.

```text
One small two-storey detached house with cream walls, a warm terracotta pitched roof, a teal front door and a few large recessed windows. Use a simple rectangular footprint, a closed roof and clearly readable front and right sides. No garden, fence, trees, furniture, people, ground tile or attached accessories.
```

## 03 학교 건물

파일명: `school-base.png`

기본 학교 모델을 쉼터 상태에도 재사용해. 쉼터 안내판은 화면 UI로 얹어.

```text
One compact two-storey school building with cream walls, a muted teal flat roof, a broad central entrance and a simple row of large rectangular windows. A friendly low-rise silhouette with a shallow entrance canopy integrated into the building. No written school name, clock numbers, flags, playground, people, trees, ground tile or signage.
```

## 04 도로를 잇는 작은 다리

파일명: `bridge-short.png`

모델 형상과 별도로 두 도로를 연결하는 경로 정보를 지정해. 침수 시 길이 끊기는 판단은 그 데이터로 처리해.

```text
One short straight modular bridge segment with a thick flat cream deck, two solid support piers and simple chunky teal safety rails. Keep both ends open for connection to roads. The complete underside and supports should be understandable from the three-quarter view. No river, water, vehicles, road markings, terrain or decorative base.
```

## 05 도시숲 모듈

파일명: `urban-forest.png`

한 구역에 놓을 3그루의 작은 나무 묶음이야. 나무 수를 늘린다고 모든 위험이 해결되는 규칙은 만들지 않아.

```text
One compact urban forest planting module containing three sturdy broadleaf trees of slightly different heights arranged on a thin square patch of grass. Rounded simple green canopies and thick warm-brown trunks, with each trunk visibly connected to the ground. No tiny leaves, exposed roots, flowers, benches, fences, signs or extra scenery. The thin grass footprint is part of the functional placement module, not a display plinth.
```

## 06 그늘 쉼터

파일명: `shade-canopy.png`

냉방 건물을 새로 만드는 대신 단순한 그늘 시설을 우선 사용해. 시설 영향 범위는 화면에서 표시해.

```text
One small public shade shelter with a broad pale-cream solid canopy, four thick teal support posts and one simple integrated wooden bench. Keep the open space beneath the canopy visible, with clear sturdy connections. No people, surrounding pavement, trees, ground tile, fabric fringe, hanging accessories or signs.
```

## 07 빗물 저장 시설

파일명: `rainwater-storage.png`

빗물 저장과 침수 대응의 역할을 동일하게 취급하지 않아. 저장량 표시는 실제 용량 대신 게임의 상대 지표로 따로 표현해.

```text
One compact rainwater storage tank, an upright broad rounded cylinder in muted teal with a cream top, a thick visible inlet pipe and a short sturdy outlet near its base. All pipes must be clearly attached to the tank. Use a closed exterior with no cutaway or transparent wall. No water stream, droplets, gauges, printed capacity, numbers, building or ground tile.
```

## 08 빗물을 잠시 담는 저류 공간

파일명: `rain-garden-basin.png`

마른 상태로 만들고 물은 프로그램에서 추가해. 실제 배수 성능을 재현한다고 표현하지 않아.

```text
One square modular rain-garden basin with a visibly lowered shallow center, gently sloping grassy sides, a simple gravel channel and a few sturdy low plant clumps along the rim. Show the entire depression clearly from above and the front-right. The basin is dry and empty so water can be added later in the simulation. No pond water, reflections, bridge, trees, labels, measurement marks or ornamental pedestal.
```

## 09 대중교통 정류장

파일명: `bus-stop.png`

폭염·침수의 즉각적인 보호 시설과 구분해. 당장 버스를 배치하면 재난이 사라진다는 규칙을 쓰지 않아.

```text
One compact bus-stop shelter with a thick cream roof, sturdy teal posts, one integrated bench and one blank solid sign panel. Simple open sides without thin transparent glass sheets. No bus, passengers, road, timetable, lettering, numbers, logos or ground tile.
```

## 10 지붕 태양광 모듈

파일명: `solar-roof-module.png`

에너지 선택을 확장할 때만 제작해. 별도 건물을 만들지 않고 학교 지붕 위에 배치할 수 있어.

```text
One compact rooftop solar module: two broad matte dark-blue solar panels joined by a thick simple frame and sturdy short mounting supports. Show the full object without any roof or building underneath. Use a few large panel divisions rather than tiny cells, with a solid readable silhouette. No cables, electrical sparks, glossy reflections, text, numbers or background props.
```

## 11 기후 코어 중앙 장치

파일명: `climate-core.png`

MVP에서는 2D 이미지와 점등 효과로 충분해. 제작하더라도 화면 전체를 3D로 전환하지 않아.

```text
One compact tabletop climate research core with a broad cream circular housing, a central matte teal dome and five clearly separated recessed module sockets arranged evenly around the rim. Chunky child-friendly construction and a stable flat bottom. No floating parts, holograms, beams, glow, electricity, text, numbers, symbols, hands or surrounding laboratory.
```

# 이미지 다음 제작 단계

이미지 프롬프트는 3D 모델 자체를 만들지 않아. 기본 이미지를 확인한 뒤 개별 오브젝트를 모델로 제작하고, 회전해서 보이지 않았던 뒷면과 바닥까지 검수해야 해.

3D 변환 요청문

```text
Use the supplied approved image as the visual reference for one stylized game prop. Preserve its proportions, color blocking and silhouette. Create a complete solid object with plausible rear and bottom surfaces, clean closed geometry where appropriate and no floating or paper-thin fragments. Keep materials simple and surfaces matte. Use a flat usable bottom and a pivot at the bottom center; preserve a consistent scale across the asset family. Do not bake lighting, shadows, water, weather, text or interface marks into the texture. Provide a GLB asset for inspection.
```

지형 높이, 바다 연결 여부, 도로 연결, 시설 영향 범위, 예산과 결과값은 모델과 별도의 게임 데이터로 관리해. 물 높이, 비, 열기, 위험 표시, 침수 색, 선택 테두리와 글자는 프로그램에서 만들어.

검수할 때는 모델의 앞뒤·바닥, 가는 부품, 원치 않는 배경 조각, 배치 기준점, 모델 간 크기를 확인해. 실제 성능 기준과 모델 수는 대표 태블릿에서 측정한 다음 TRD에서 정해.

# 스테이지 맵에서 따로 필요한 2D 자산

자연 속 2.5D 픽셀아트 맵에는 잔디·흙길·물가 타일, 5개 연구 장소의 입구, 중앙 작전실, 나무·바위, 입구 점등 상태, 플레이어의 방향별 대기·걷기 스프라이트가 필요해. 현재 참고 폴더에는 완성된 픽셀 타일셋이나 걷기 스프라이트가 없어.

맵에서 직접 움직이는 주인공은 별도 학생 연구 대원으로 확정했어. 학생 대원의 픽셀아트 방향별 대기·걷기 스프라이트를 새로 준비해. 잎새 다람쥐는 관측·기록, 물방울 수달은 실험·검증을 돕는 안내 NPC로 유지해. 같은 캐릭터를 맵과 활동 화면에 표현할 때는 색·실루엣을 일치시켜.

