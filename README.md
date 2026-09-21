# JTech Portfolio Hub

JTech Co. 프로젝트를 한 화면에서 확인하기 위한 **개인용 포트폴리오 인덱스**입니다. 최신 프로젝트 흐름을 빠르게 훑고, 각 카드에서 실제 페이지나 GitHub 저장소로 바로 이동하는 데 초점을 둡니다.

## Current UI

- 프로젝트 카드는 별도 상세 모달 없이 `실행/열기`와 `GitHub` 링크를 직접 제공합니다.
- 상단 `Recent Work`는 `updatedAt` 기준 최신 8개 프로젝트를 4열 × 2행으로 표시합니다.
- `Recent Work` 타일을 누르면 아래의 해당 프로젝트 카드로 스크롤한 뒤 카드가 한 번 강조됩니다.
- `Recent Work`는 접기/펼치기가 가능합니다.
- 상단 `KR / EN` 버튼으로 한국어와 영어 UI를 전환합니다. 선택 언어는 브라우저 저장소가 허용되는 경우 유지됩니다.
- 본문은 6개 카테고리와 JSON 카탈로그로 구성됩니다.

## Local run

프로젝트 카탈로그를 JSON `fetch()`로 읽기 때문에 `file://` 직접 실행 대신 간단한 로컬 HTTP 서버를 사용합니다.

```powershell
python tools/validate_catalog.py
python -m http.server 8080
```

브라우저에서 `http://localhost:8080`을 엽니다.

## Add or update a project

1. 적절한 `portfolio/<category>/items.json`을 수정합니다.
2. 한국어 `shortDescription`과 영어 `shortDescriptionEn`을 함께 작성합니다.
3. `updatedAt`을 `YYYY-MM-DD`로 넣으면 `Recent Work` 후보가 됩니다.
4. 대표작이면 `featured: true`를 지정합니다.
5. 실제 페이지가 있으면 `liveUrl`, 저장소가 있으면 `repoUrl`을 지정합니다.
6. `python tools/validate_catalog.py`로 데이터 형식을 확인합니다.

```json
{
  "id": "example-project",
  "name": "Example Project",
  "shortDescription": "한국어 카드 설명",
  "shortDescriptionEn": "English card description.",
  "icon": "fas fa-cube",
  "tags": ["Web", "Tool"],
  "status": "active",
  "updatedAt": "2026-09-22",
  "featured": false,
  "repoUrl": "https://github.com/JTech-CO/example-project",
  "liveUrl": null
}
```

## Structure

```text
index.html
assets/
css/
js/
  i18n.js
  catalog.js
  card.js
  portfolio.js
  main.js
portfolio/
  categories.json
  items.schema.json
  sync-snapshot.json
  <category>/items.json
tools/validate_catalog.py
```

별도 프레임워크나 npm 설치, 백엔드, 계정, API 키는 필요하지 않습니다.
