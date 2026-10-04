// G6 기능: 단위 테스트 · 타입 검사 · ★ 차단 키워드 → 이미지 API 호출 0회 · 번들 API 키 0건
// ★ 입력: docs/harness/reports/safety-result.json  { "blockedKeywords": 20, "imageApiCalls": 0 }
//   tests/safety.test.ts가 목업 이미지 API 호출 횟수를 세어 이 파일로 남긴다.
import path from 'node:path';
import { exists, read, walk, sh, pass, fail, skip } from './lib.mjs';

export function run({ root, rules }) {
  const checks = [];
  const hasApp = exists(path.join(root, 'package.json'));

  if (!hasApp) {
    checks.push(skip('단위 테스트', 'package.json 없음 (앱 생성 전)'));
    checks.push(skip('타입 검사', 'package.json 없음 (앱 생성 전)'));
  } else {
    const test = sh('npm test --silent', root);
    checks.push(test.ok ? pass('단위 테스트', '통과', '통과') : fail('단위 테스트', '실패', '통과', test.out.split('\n').slice(-20)));
    const tsc = sh('npx tsc --noEmit', root);
    checks.push(tsc.ok ? pass('타입 검사', '통과', '통과') : fail('타입 검사', '실패', '통과', tsc.out.split('\n').slice(0, 20)));
  }

  const safetyFile = path.join(root, 'docs/harness/reports/safety-result.json');
  if (!exists(safetyFile)) {
    checks.push(hasApp
      ? fail('★ 차단 키워드 → 이미지 API 0회', '결과 파일 없음', 'safety-result.json')
      : skip('★ 차단 키워드 → 이미지 API 0회', 'safety-result.json 없음 (앱 생성 전)'));
  } else {
    const s = JSON.parse(read(safetyFile));
    const max = rules.safety.blockedImageApiCallsMax;
    checks.push(s.imageApiCalls <= max && s.blockedKeywords > 0
      ? pass('★ 차단 키워드 → 이미지 API 0회', `차단 ${s.blockedKeywords}개 중 호출 ${s.imageApiCalls}회`, `≤ ${max}회`)
      : fail('★ 차단 키워드 → 이미지 API 0회', `차단 ${s.blockedKeywords}개 중 호출 ${s.imageApiCalls}회`, `≤ ${max}회`));
  }

  const bundle = path.join(root, rules.security.bundleDir);
  if (!exists(bundle)) checks.push(skip('번들 API 키 패턴', `${rules.security.bundleDir} 없음 (빌드 전)`));
  else {
    const hits = [];
    for (const f of walk(bundle, ['.js', '.json', '.html', '.txt'])) {
      const txt = read(f);
      for (const p of rules.security.forbiddenPatterns) {
        if (new RegExp(p).test(txt)) hits.push(`${path.relative(root, f)}  /${p}/`);
      }
    }
    checks.push(hits.length
      ? fail('번들 API 키 패턴', `${hits.length}건`, '0건', hits)
      : pass('번들 API 키 패턴', '0건', '0건'));
  }
  return checks;
}
