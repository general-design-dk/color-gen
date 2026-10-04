# R4. 산출물

| STEP | 산출물 |
|---|---|
| 1 | docs/prd.md, docs/userflow.md (완료) |
| 2 | app/tokens.css (Tailwind v4 @theme) |
| 3 | app/page.tsx, components/* — `?state=idle|loading|done|error`로 상태별 확인 |
| 4 | 피그마 파일 (URL은 progress.md에 기록) |
| 5 | app/tokens.css 갱신, public/assets/* |
| 6 | app/api/generate/route.ts, lib/* |
| 7 | components/* (인터랙션 추가) |
| 8 | docs/harness/reports/test-report.md |

## 규칙 SSOT
- docs/harness/rules.json — 게이트 스크립트는 이 파일만 읽는다
- 담는 것: 허용 색상값, 반경(16/24/9999), 폰트 크기 목록, 차단율 기준(98%),
  오차단율 기준(5%), 금지 패턴(API 키)
- design.md는 사람용 문서. 값이 바뀌면 design.md → rules.json → tokens.css 순서로 갱신

## 재개
- docs/harness/progress.md: 현재 STEP, 게이트 통과 여부, 실패 횟수, 피그마 URL
- 세션 시작 시 이 파일을 먼저 읽고 이어서 진행

## 테스트셋
- tests/fixtures/keywords.json: 허용 30 + 차단 20 (무관 10, 부적절 10)
- AI 초안 → 사람 승인 후 고정
