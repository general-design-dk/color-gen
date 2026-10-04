# R6. 역할

| 에이전트 | 담당 STEP | 편집 범위 | 자연어 트리거 |
|---|---|---|---|
| ui-builder | 2, 3, 7 | app/ (api 제외), components/ | "토큰 만들어", "화면 만들어", "인터랙션 넣어" |
| figma-sync | 4, 5 | 피그마 파일 (MCP), public/assets/, app/tokens.css | "피그마로 옮겨", "피그마 맞춰줘" |
| feature-builder | 6 | app/api/, lib/, tests/ | "기능 붙여", "API 만들어" |
| gate-judge (읽기 전용) | 모든 게이트 | docs/harness/reports/ 만 쓰기 | "게이트 돌려", "검증해" |
| 오케스트레이터 (메인) | 전체 | docs/harness/progress.md | "이어서 해", "STEP N 진행해" |

## 규칙·게이트 수정
- docs/harness/rules.json, scripts/gates/는 오케스트레이터가 수정안 작성 → 사람 승인 후 반영

## 유연성
- 편집 범위 밖 수정이 필요하면 이유를 말하고 진행 (막지 않음, 기록만)

## 정의 파일
- .claude/agents/{ui-builder, figma-sync, feature-builder, gate-judge}.md

## 트리거 규칙
- 표에 없는 요청 → 오케스트레이터가 progress.md의 현재 STEP 기준으로 위임
