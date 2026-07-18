# JTech Portfolio Hub

JTech의 확장프로그램, 유틸리티, 시뮬레이션과 기타 프로젝트를 카테고리별로 보여주는 정적 포트폴리오입니다.

## 프로젝트 추가

기존 카테고리에 프로젝트를 추가할 때는 애플리케이션 코드를 수정하지 않습니다.

1. 대상 카테고리의 `portfolio/<category>/items.json`을 엽니다.
2. `items` 배열에 아래 형식의 객체를 추가합니다.
3. `portfolio/<category>/images/<프로젝트명>/` 폴더를 생성합니다.
4. 이미지가 있다면 해당 폴더에 `icon.png`로 배치합니다.
5. `python tools/validate_catalog.py`로 데이터를 검증하고 브라우저를 새로고침합니다.

```json
{
  "id": "my-project",
  "name": "My Project",
  "shortDescription": "카드에 표시할 짧은 설명",
  "fullDescription": "상세 모달에 표시할 설명",
  "icon": "fas fa-cube",
  "tags": ["도구", "생산성"],
  "status": "active",
  "version": "1.0.0",
  "url": "https://example.com",
  "actionLabel": "열기",
  "features": ["주요 기능 1", "주요 기능 2"]
}
```

`id`, `name`, `shortDescription`만 필수입니다. 프로젝트명은 이미지 폴더명으로 자동 변환됩니다. 공백은 하이픈으로 바뀌고 Windows에서 사용할 수 없는 문자는 하이픈으로 치환되며 마지막 마침표는 제거됩니다.

```text
My Project       -> images/My-Project/icon.png
AI Token Monitor -> images/AI-Token-Monitor/icon.png
N.P.M.           -> images/N.P.M/icon.png
```

`icon.png`가 있으면 카드와 상세 모달에 자동으로 표시됩니다. 이미지가 없거나 로드에 실패하면 `icon`에 지정한 Font Awesome 아이콘을 사용합니다. 따라서 이미지 경로를 JSON에 직접 작성할 필요가 없습니다.

링크가 아직 없다면 `url`을 `null`로 두면 모달 버튼이 자동으로 비활성화됩니다. 상태값은 `active`, `beta`, `coming-soon` 중 하나를 사용합니다. 각 `items.json`은 `portfolio/items.schema.json`을 참조하므로 지원하는 편집기에서 자동 완성과 오류 표시를 받을 수 있습니다.

## 카테고리 추가

새 카테고리는 코드가 아닌 데이터 인덱스에 등록합니다.

1. `portfolio/<category>/items.json`을 생성합니다.
2. `portfolio/<category>/images/` 폴더를 생성합니다.
3. `portfolio/categories.json`에 `key`, `label`, `source`를 추가합니다.

카테고리 표시 순서는 `portfolio/categories.json`의 배열 순서와 같습니다.

## 로컬 실행

JSON 파일을 `fetch()`로 읽으므로 `file://`로 열 수 없습니다.

```powershell
python tools/validate_catalog.py
python -m http.server 8080
```

브라우저에서 `http://localhost:8080`을 엽니다.

## 구조

```text
portfolio/categories.json                      카테고리 순서와 데이터 경로
portfolio/items.schema.json                    항목 데이터 스키마
portfolio/<category>/items.json                카테고리별 프로젝트 데이터
portfolio/<category>/images/<project>/icon.png 프로젝트 아이콘
js/catalog.js                                  JSON 로딩과 이미지 경로 계산
js/card.js                                     카드 DOM 및 이미지 대체 처리
js/modal.js                                    상세 모달과 포커스 관리
js/portfolio.js                                카테고리 섹션 렌더링
```
