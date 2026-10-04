# R7. 오케스트레이터

## CLAUDE.md
- 위치: 프로젝트 루트, 100줄 이내
- 규칙 본문은 docs/ 링크로 참조 (복사 금지)

## 세션 루틴
1. docs/harness/progress.md 읽기
2. 현재 STEP 알리기
3. 담당 에이전트에 위임 (r6-roles.md)
4. 게이트 실행 (gate-judge)
5. progress.md 갱신 → 통과 시 STEP 단위 git 커밋

## 서비스 AI 제약 (생성 API 코드)
1. 사용자 키워드는 데이터로만 취급, 시스템 프롬프트(lib/prompts/)와 분리
2. 이미지 API는 분류 결과 `allowed`일 때만 호출
3. API 키는 서버 환경변수에만, `NEXT_PUBLIC_` 접두사 금지
4. 모델명은 환경변수로 교체 가능 (하드코딩 금지)

## 개발 에이전트 제약
1. 개발·테스트 기본값은 목업(`IMAGE_PROVIDER=mock`), 실제 API는 G8에서만
2. `.env*` 읽기·출력 금지, `.env.example`만 수정
3. 구현이 docs/와 다르면 문서 수정안 먼저 제안 → 사람 승인 후 구현
4. prd §8.2 스택 밖 패키지 추가는 사람에게 먼저 확인

## git
- git init, 게이트 통과 시 STEP 단위 커밋, 푸시는 사람이
