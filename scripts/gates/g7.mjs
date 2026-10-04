// G7 UX: E2E (입력 → 생성 → 다운로드 → 돌아가기) 통과
import path from 'node:path';
import { exists, sh, pass, fail, skip } from './lib.mjs';

export function run({ root }) {
  if (!exists(path.join(root, 'package.json'))) return [skip('E2E', 'package.json 없음 (앱 생성 전)')];
  const hasConfig = ['playwright.config.ts', 'playwright.config.js', 'playwright.config.mjs'].some((f) => exists(path.join(root, f)));
  if (!hasConfig) return [fail('E2E', 'playwright 설정 없음', 'playwright.config.*')];
  const r = sh('npx playwright test', root);
  return [r.ok ? pass('E2E', '통과', '통과') : fail('E2E', '실패', '통과', r.out.split('\n').slice(-20))];
}
