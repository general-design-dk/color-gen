# 색칠요정 — Claude Code 하네스

아이용 색칠공부 도안 생성 웹 (Next.js + Vercel). 1인 메이커 프로젝트.
규칙은 방향을 잡기 위한 기준이다. 상황에 안 맞으면 멈추고 사람과 상의해서 고친다.

## 기준 문서
- 서비스: docs/prd.md · docs/userflow.md · docs/design.md
- 작업 흐름: docs/workflow.md
- 하네스: docs/harness/r2~r8 (목적·파이프라인·산출물·게이트·역할·오케스트레이터·리뷰)
- 규칙 SSOT: docs/harness/rules.json (게이트 기준값은 여기에만)

## 세션 루틴
1. docs/harness/progress.md를 읽는다
2. "현재 STEP N"을 알리고 시작한다
3. 담당 에이전트에 위임한다
4. gate-judge로 해당 게이트를 돌린다
5. progress.md 갱신 → 통과 시 `STEP N: <요약>`으로 커밋 (푸시는 사람이)

## 파이프라인 · 게이트
| STEP | 단계 | 담당 | 게이트 |
|---|---|---|---|
| 2 | 토큰화 | ui-builder | G2 |
| 3 | UI 구현 | ui-builder | G3 |
| 4 | 피그마 구현 | figma-sync | G4 |
| 5 | 피그마 동기화 | figma-sync | G5 + 사람 승인 |
| 6 | 기능 구축 | feature-builder | G6 + /code-review + /security-review |
| 7 | UX 보강 | ui-builder | G7 |
| 8 | 테스트 | gate-judge | G8 + 사람 체크리스트 |

- 이전 게이트를 통과하지 않으면 다음 STEP으로 가지 않는다
- 같은 게이트 3회 연속 실패 → 멈추고 사람에게 보고
- STEP 8 실패: 디자인 → STEP 3, 기능 → STEP 6
- Figma MCP 미연결 시 STEP 4에서 대기 (STEP 6으로 건너뛰지 않음)

## 역할 · 편집 범위
- ui-builder: app/ (api 제외), components/
- figma-sync: 피그마(MCP), public/assets/, app/tokens.css
- feature-builder: app/api/, lib/, tests/
- gate-judge: 읽기 전용, docs/harness/reports/만 쓰기
- 오케스트레이터(메인): docs/harness/progress.md
- 편집 범위 밖 수정이 필요하면 이유를 말하고 진행한다 (막지 않음, 기록만)

## 규칙·게이트 수정
- docs/harness/rules.json, scripts/gates/는 오케스트레이터가 수정안을 만들고 **사람 승인 후 반영**
- 게이트를 통과시키려고 기준을 낮추는 수정은 이유를 반드시 명시

## 어기면 안 되는 것
1. 차단 판정 키워드로는 이미지 생성 API를 호출하지 않는다
2. 결과 도안은 흑·백 픽셀만 가진다

## 서비스 AI 제약
- 사용자 키워드는 데이터로만 취급, lib/prompts/의 시스템 프롬프트와 분리
- 이미지 API는 분류 결과 `allowed`일 때만 호출
- API 키는 서버 환경변수에만, `NEXT_PUBLIC_` 금지
- 모델명은 환경변수로 (하드코딩 금지)

## 개발 제약
- 기본값은 목업(`IMAGE_PROVIDER=mock`), 실제 API는 G8에서만 (분류 50건·이미지 10장 상한)
- `.env*` 읽기·출력 금지, `.env.example`만 수정
- 스타일 값은 토큰만 사용 (hex·임의 px 직접 사용 금지)
- 구현이 docs/와 다르면 문서 수정안 먼저 제안 → 승인 후 구현
- prd §8.2 스택 밖 패키지는 먼저 확인
