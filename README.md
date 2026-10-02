# JTech Portfolio Hub

JTech Co. 프로젝트를 한 화면에서 확인하기 위한 **개인용 포트폴리오 인덱스**입니다. 최신 프로젝트 흐름을 빠르게 훑고, 각 카드에서 실제 페이지나 GitHub 저장소로 바로 이동하는 데 초점을 둡니다.

## Current UI

- 프로젝트 카드는 별도 상세 모달 없이 `실행/열기`와 `GitHub` 링크를 직접 제공합니다.
- 상단 `Recent Work`는 실제 `pushedAt` 기준 최신 8개 프로젝트를 4열 × 2행으로 표시합니다.
- `Recent Work` 타일을 누르면 아래의 해당 프로젝트 카드로 스크롤한 뒤 카드가 한 번 강조됩니다.
- `Recent Work`는 접기/펼치기가 가능합니다.
- 본문은 6개 카테고리와 JSON 카탈로그로 구성됩니다.

## Snapshot — 2026-10-02 (Asia/Seoul)

공개 저장소 311개를 전체 페이지에 걸쳐 확인했습니다. Fork 157개를 제외한 원본 154개 중 Smart Cart 캡스톤 관련 9개를 제외해 **145개 프로젝트**를 수록합니다. 기존 33개 카드 중 관련 카드 4개를 제거하고 원본 저장소 116개를 추가했습니다.

- 제외: `Smart-Cart`, `Smart-Cart-2`, `Smart-Cart-4`, `Smart-Cart-5`, `Smart-Cart-BOM`, `Smart-Cart-Wiring`, `Smart-Cart-Autonomy-Lab`, `Smart-Cart-Autonomy-Lab-Jev`, `Motor-Bracket`.
- `snapshotDate`는 허브를 갱신한 날짜입니다. 프로젝트의 `updatedAt`은 실제 GitHub `pushed_at`을 한국 시간으로 환산한 날짜이며, 모두 오늘 날짜로 덮어쓰지 않습니다.
- `pushedAt`은 UTC 원본 시각을 보존해 같은 날의 작업도 최신순으로 정렬합니다.
- `portfolio/sync-snapshot.json`에 포함·제외 저장소, 원본 활동 시각과 집계 근거를 기록했습니다.
- 설명은 저장소 메타데이터와 README를 기준으로 작성했습니다. 기획 단계인 DevHarbor와 종결 연구인 TEA의 상태는 설명에 명시했습니다.

## Local run

프로젝트 카탈로그를 JSON `fetch()`로 읽기 때문에 `file://` 직접 실행 대신 간단한 로컬 HTTP 서버를 사용합니다.

```powershell
python tools/validate_catalog.py
python -m http.server 8080
```

브라우저에서 `http://localhost:8080`을 엽니다.

## Add or update a project

1. 적절한 `portfolio/<category>/items.json`을 수정합니다.
2. 카드에 표시할 `shortDescription`을 작성합니다.
3. 실제 `pushedAt`을 UTC ISO 시각으로, `updatedAt`을 한국 시간 기준 `YYYY-MM-DD`로 넣습니다.
4. 대표작이면 `featured: true`를 지정합니다.
5. 실제 페이지가 있으면 `liveUrl`, 저장소가 있으면 `repoUrl`을 지정합니다.
6. `portfolio/sync-snapshot.json`의 저장소 목록·집계와 기준일, 상단 Snapshot 날짜도 함께 갱신합니다.
7. `python tools/validate_catalog.py`로 데이터 형식, 전체 원본 저장소 포함 여부와 제외 규칙을 확인합니다.

```json
{
  "id": "example-project",
  "name": "Example Project",
  "shortDescription": "한국어 카드 설명",
  "icon": "fas fa-cube",
  "tags": ["Web", "Tool"],
  "status": "active",
  "updatedAt": "2026-10-02",
  "pushedAt": "2026-10-01T23:00:00Z",
  "featured": false,
  "repoUrl": "https://github.com/JTech-CO/example-project",
  "liveUrl": null
}
```

기존 카탈로그의 `shortDescriptionEn`, `actionLabelEn`, `labelEn`, `descriptionEn` 필드는 호환성을 위해 남아 있을 수 있지만 현재 UI에서는 사용하지 않습니다.

## Structure

```text
index.html
assets/
css/
  easter.css
js/
  catalog.js
  card.js
  portfolio.js
  easter-egg.js
  main.js
portfolio/
  categories.json
  items.schema.json
  sync-snapshot.json
  <category>/items.json
tools/validate_catalog.py
```

별도 프레임워크나 npm 설치, 백엔드, 계정, API 키는 필요하지 않습니다.
