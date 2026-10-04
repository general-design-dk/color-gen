// G3 UI: 컴포넌트에 직접 쓴 hex·임의 px 0건 · 빌드 성공 · 스크린샷 8장
import path from 'node:path';
import { exists, read, walk, sh, pass, fail, skip } from './lib.mjs';

export function run({ root, rules }) {
  const u = rules.ui;
  const files = u.scanDirs.flatMap((d) => walk(path.join(root, d), ['.tsx', '.ts', '.jsx', '.js', '.css']))
    .filter((f) => !u.excludeFiles.some((x) => f.endsWith(x)) && !f.includes(`${path.sep}api${path.sep}`));
  const hits = [];
  for (const f of files) {
    read(f).split('\n').forEach((line, i) => {
      for (const p of u.forbiddenStylePatterns) {
        const m = line.match(new RegExp(p));
        if (m) hits.push(`${path.relative(root, f)}:${i + 1}  ${m[0]}`);
      }
    });
  }
  const checks = [hits.length
    ? fail('직접 쓴 hex·px 값', `${hits.length}건`, '0건', hits)
    : pass('직접 쓴 hex·px 값', `0건 (${files.length}개 파일 검사)`, '0건')];

  if (!exists(path.join(root, 'package.json'))) {
    checks.push(skip('빌드 성공', 'package.json 없음 (앱 생성 전)'));
    checks.push(skip('스크린샷 8장', 'package.json 없음 (앱 생성 전)'));
    return checks;
  }
  const build = sh('npm run build', root);
  checks.push(build.ok ? pass('빌드 성공', '성공', '성공') : fail('빌드 성공', '실패', '성공', build.out.split('\n').slice(-15)));

  const shotDir = path.join(root, 'docs/harness/reports/screenshots');
  const expected = u.states.flatMap((s) => u.viewports.map((v) => `${s}-${v}.png`));
  const missing = expected.filter((n) => !exists(path.join(shotDir, n)));
  checks.push(missing.length
    ? fail('스크린샷 8장', `${expected.length - missing.length}장`, `${expected.length}장`, missing)
    : pass('스크린샷 8장', `${expected.length}장`, `${expected.length}장`));
  return checks;
}
