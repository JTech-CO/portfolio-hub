# Changelog

## 2026-10-02 - Original repository snapshot refresh

- GitHub 공개 저장소 311개를 전수 확인하고 Fork 157개를 제외했습니다.
- 원본 154개 중 Smart Cart 캡스톤 저장소 8개와 관련 Motor-Bracket을 제외해 145개 프로젝트를 수록했습니다.
- 기존 관련 카드 4개를 제거하고 원본 프로젝트 116개를 추가했으며, 6개 카테고리를 유지했습니다.
- 상단 Snapshot을 2026.10.02 KST로 갱신하고 모든 카드에 실제 push 시각과 한국 시간 기준 업데이트 날짜를 반영했습니다.
- Recent Work와 날짜 기반 이스터에그 폴백이 같은 날에도 push 시각으로 정렬되도록 변경했습니다.
- Tetrio-AI, RepoDelta, Chzzk Downloader와 RAM 관련 최신 README 정보·버전·계산기 링크를 반영했습니다.
- 한국어 UI에서 사용하지 않는 영문 설명 필드를 스키마 선택 항목으로 정리했습니다.
- 스냅샷 대조 검증을 추가해 원본 저장소 누락·중복, 캡스톤 재유입, 날짜 불일치와 안전하지 않은 링크를 확인합니다.

## 2026-09-22 - Easter egg full-document scroll fix

- Easter egg scroll now writes directly to `document.scrollingElement.scrollTop` instead of repeatedly invoking native smooth `window.scrollTo()`.
- Native `scroll-behavior: smooth` is temporarily disabled only while the sequence runs.
- The bottom target is recalculated from the document, stage, and footer after the scale animation settles, so the sequence reaches the actual footer before returning to the top.

## 2026-09-22 - Easter egg & fixed Korean UI

- KR/EN 전환 버튼과 `i18n.js`를 제거하고 UI를 한국어 기준으로 고정했습니다.
- 우측 상단 탐색을 항상 `Recent / GitHub / JTech Main`으로 표시하도록 정리했습니다.
- `dltmxjdprm` 물리 키 시퀀스를 감지하는 이스터에그를 추가했습니다. 한글 입력 상태에서도 동일한 키 위치로 발동합니다.
- 이스터에그 실행 시 상단바를 제외한 본문이 0.5초 동안 50% 크기로 축소되고 0.5초 동안 원래 크기로 복귀합니다.
- 이후 페이지를 위에서 아래로 2초, 다시 위로 2초 동안 자동 스크롤합니다.
- 전체 화면 흰색 펄스 후 2초간 암전하고, 가장 최근에 업데이트된 등록 프로젝트 카드만 페이드인·흰색 펄스한 뒤 해당 GitHub 저장소로 이동합니다.
- 최신 프로젝트는 실행 시 공개 GitHub API의 `pushed_at`을 우선 확인하고, 실패 시 카탈로그 `updatedAt`으로 폴백합니다.

## 2026-09-22 - Interaction & readability revision

- 상세 모달과 관련 CSS/JavaScript를 완전히 제거했습니다.
- 각 프로젝트 카드에 실제 페이지와 GitHub 저장소 링크를 직접 배치했습니다.
- KR/EN 언어 전환 버튼과 프로젝트·카테고리 영문 설명을 추가했습니다.
- `Recent Work`를 최신 8개, 데스크톱 4열 × 2행의 정사각형 패널로 변경했습니다.
- `Recent Work` 타일 클릭 시 해당 본문 카드로 스크롤하고 한 번 강조하도록 변경했습니다.
- `Recent Work` 접기/펼치기를 추가했습니다.
- 지나치게 작은 메타 텍스트를 확대하고 다크 배경에서 보조 텍스트 대비를 높였습니다.
- 개인용 구성에 맞춰 README의 배포 설명과 로컬 실행 스크립트 파일을 제거했습니다.

## 2026-09-22 - Portfolio snapshot refresh

- JTech Co. 프로필의 최신 프로젝트 방향을 기준으로 6개 카테고리를 구성했습니다.
- 대표 프로젝트와 2026년 9월 최근 작업 저장소를 카탈로그에 반영했습니다.
- `updatedAt` 기반 Recent Work 정렬과 `featured` 표시를 추가했습니다.
