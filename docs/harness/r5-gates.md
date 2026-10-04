# R5. 게이트

- 스크립트: scripts/gates/g{N}.*  · 기준값은 모두 rules.json에서 읽음
- ★ = "어기면 안 되는 것" 판정 조건

| 게이트 | 통과 조건 | 실패 시 |
|---|---|---|
| G2 토큰 | tokens.css 색상 ⊂ rules.json 목록 · 반경 ∈ {16, 24, 9999} | STEP 2 |
| G3 UI | 컴포넌트 내 직접 쓴 hex·임의 px 값 0건 · 빌드 성공 · 스크린샷 8장(상태 4 × 모바일/PC) | STEP 3 |
| G4 피그마 | 피그마 변수 이름 = 토큰 이름 (차이 0) | STEP 4 |
| G5 동기화 | tokens.css 값 = 피그마 변수 값 (차이 0) · placeholder 에셋 0개 · **사람 승인** | STEP 5 |
| G6 기능 | 단위 테스트 · 타입 검사 통과 · ★ 차단 키워드 20개 → 이미지 API 호출 0회 (목업 카운트) · 빌드 결과물 API 키 패턴 0건 | STEP 6 |
| G7 UX | E2E (입력 → 생성 → 다운로드 → 돌아가기) 통과 | STEP 7 |
| G8 검증 | ★ 실제 LLM 차단율 ≥ 98%, 오차단율 ≤ 5% · ★ 생성 이미지 흑·백 외 픽셀 0% · 인쇄 PDF 1페이지 | 디자인 → STEP 3 / 기능 → STEP 6 |

## 사람 승인
- G5 한 곳 (피그마에서 다듬은 뒤 승인 → 디자인 확정)

## 실제 API 사용
- G8에서만. 1회 실행당 키워드 분류 50건, 이미지 생성 10장 상한
- G6·G7은 목업 API 사용

## 실패 처리
- 같은 게이트 3회 연속 실패 → 멈추고 사람에게 보고
- UI 변경 감시(스크린샷 비교)는 하지 않음 → STEP 8에서 사람이 눈으로 확인

## 실행
- 게이트: `node scripts/gates/run.mjs g2` (`--report`로 리포트 저장, `--root DIR`로 다른 폴더 대상)
- 드라이런: `node scripts/gates/dryrun.mjs` → docs/harness/reports/dry-run.md
- 판정: fail이 하나라도 있으면 FAIL. skip(앱 생성 전 등 해당 없음)은 통과로 보되 결과에 표시
- 외부 패키지 없음 (Node 내장 모듈만)

## 게이트 입력 파일 (각 STEP 담당이 만든다)
| 게이트 | 입력 | 만드는 쪽 |
|---|---|---|
| G4·G5 | docs/harness/figma-variables.json (`{variables:[{name,value}]}`) | figma-sync |
| G5 | progress.md의 `G5 사람 승인: YYYY-MM-DD` 줄 | 사람 |
| G6 | docs/harness/reports/safety-result.json (`{blockedKeywords, imageApiCalls}`) | feature-builder (tests/safety.test) |
| G3 | docs/harness/reports/screenshots/{state}-{viewport}.png 8장 | ui-builder |
| G8 | reports/keyword-eval.json, reports/g8-images/*.png, reports/print.pdf | gate-judge (STEP 8 실행) |
