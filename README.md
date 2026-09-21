# JTech Portfolio Hub

JTech Co.의 공개 프로젝트를 최신 프로필 구조에 맞춰 정리한 정적 포트폴리오입니다.

## 2026-09-22 snapshot

이번 스냅샷은 `JTech-CO/JTech-CO` 프로필 README의 최신 Featured Projects와 최근 작업 저장소의 push 상태를 기준으로 갱신했습니다.

- 상단 `Recent Work`는 각 프로젝트의 `updatedAt`을 기준으로 자동 정렬됩니다.
- 본문은 현재 프로필의 핵심 영역을 바탕으로 6개 카테고리로 재구성했습니다.
- 카드 데이터는 HTML에 하드코딩하지 않고 `portfolio/<category>/items.json`에서 읽습니다.
- GitHub Pages에서 별도 빌드 없이 정적으로 실행됩니다.
- 스냅샷 근거는 `portfolio/sync-snapshot.json`에 기록합니다.

## Local run

```powershell
python tools/validate_catalog.py
python -m http.server 8080
```

브라우저에서 `http://localhost:8080`을 엽니다. JSON을 `fetch()`하므로 `file://` 직접 실행은 지원하지 않습니다.

## Add or update a project

1. 적절한 `portfolio/<category>/items.json`을 수정합니다.
2. `updatedAt`을 `YYYY-MM-DD`로 넣으면 `Recent Work` 후보가 됩니다.
3. 대표작이면 `featured: true`를 지정합니다.
4. `repoUrl`과 필요하면 `liveUrl`을 지정합니다.
5. `python tools/validate_catalog.py`를 실행합니다.

```json
{
  "id": "example-project",
  "name": "Example Project",
  "shortDescription": "카드 설명",
  "fullDescription": "상세 설명",
  "icon": "fas fa-cube",
  "tags": ["Web", "Tool"],
  "status": "active",
  "updatedAt": "2026-09-22",
  "featured": false,
  "repoUrl": "https://github.com/JTech-CO/example-project",
  "liveUrl": null,
  "features": ["기능 1", "기능 2"]
}
```

## Structure

```text
index.html
assets/
css/
js/
portfolio/
  categories.json
  items.schema.json
  sync-snapshot.json
  <category>/items.json
tools/validate_catalog.py
```

No framework, npm install, backend, account, API key or build step is required.
