// G5 동기화: 토큰 값 = 피그마 변수 값 · placeholder 에셋 0개 · 사람 승인 기록
import path from 'node:path';
import { exists, read, walk, pass, fail } from './lib.mjs';
import { loadPair, normValue } from './figma.mjs';

export function run({ root }) {
  const checks = [];
  const { tokens, figma, error } = loadPair(root);
  if (error) checks.push(fail('입력 파일', error, '있음'));
  else {
    const diff = Object.keys(tokens).filter((k) => k in figma && normValue(tokens[k]) !== normValue(figma[k]))
      .map((k) => `--${k}: 코드 ${tokens[k]} / 피그마 ${figma[k]}`);
    checks.push(diff.length
      ? fail('토큰 값 일치', `차이 ${diff.length}개`, '0개', diff)
      : pass('토큰 값 일치', '모두 일치', '0개 차이'));
  }

  const placeholders = walk(path.join(root, 'public/assets')).filter((f) => /placeholder|dummy|temp/i.test(path.basename(f)));
  checks.push(placeholders.length
    ? fail('placeholder 에셋', `${placeholders.length}개`, '0개', placeholders.map((f) => path.relative(root, f)))
    : pass('placeholder 에셋', '0개', '0개'));

  // 사람 승인: progress.md에 "G5 사람 승인: YYYY-MM-DD" 줄이 있어야 통과
  const prog = path.join(root, 'docs/harness/progress.md');
  const approved = exists(prog) && /G5 사람 승인:\s*\d{4}-\d{2}-\d{2}/.test(read(prog));
  checks.push(approved
    ? pass('사람 승인', '기록 있음', 'progress.md "G5 사람 승인: 날짜"')
    : fail('사람 승인', '기록 없음', 'progress.md "G5 사람 승인: 날짜"'));
  return checks;
}
