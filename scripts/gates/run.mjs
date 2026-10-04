// 게이트 실행기
//   node scripts/gates/run.mjs g2            → 결과 출력, 실패 시 exit 1
//   node scripts/gates/run.mjs g2 --report   → docs/harness/reports/g2-YYYYMMDD-HHmm.md 저장
//   node scripts/gates/run.mjs g2 --root DIR → 다른 폴더를 대상으로 실행 (드라이런용)
// 판정: fail이 하나라도 있으면 FAIL. skip(앱 생성 전 등 해당 없음)은 통과로 보되 결과에 표시.
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT_ROOT, loadRules } from './lib.mjs';

export const GATES = ['g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

export async function runGate(gate, root = PROJECT_ROOT) {
  const mod = await import(`./${gate}.mjs`);
  const checks = mod.run({ root, rules: loadRules() });
  const verdict = checks.some((c) => c.status === 'fail') ? 'FAIL' : 'PASS';
  return { gate: gate.toUpperCase(), verdict, checks };
}

export function toMarkdown({ gate, verdict, checks }) {
  const icon = { pass: '✅', fail: '❌', skip: '⏭️' };
  const lines = [
    `# ${gate} — ${verdict}`, '', `- 실행: ${new Date().toISOString()}`, '',
    '| 항목 | 결과 | 측정값 | 기준 |', '|---|---|---|---|',
    ...checks.map((c) => `| ${c.name} | ${icon[c.status]} | ${c.measured} | ${c.expected} |`),
  ];
  const details = checks.filter((c) => c.details?.length);
  if (details.length) {
    lines.push('', '## 실패 상세');
    for (const c of details) lines.push('', `### ${c.name}`, ...c.details.map((d) => `- \`${d}\``));
  }
  return lines.join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const gate = args[0]?.toLowerCase();
  if (!GATES.includes(gate)) {
    console.error(`사용법: node scripts/gates/run.mjs <${GATES.join('|')}> [--report] [--root DIR]`);
    process.exit(2);
  }
  const rootIdx = args.indexOf('--root');
  const root = rootIdx >= 0 ? path.resolve(args[rootIdx + 1]) : PROJECT_ROOT;
  const result = await runGate(gate, root);
  const md = toMarkdown(result);
  console.log(md);
  if (args.includes('--report')) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 13);
    const out = path.join(PROJECT_ROOT, 'docs/harness/reports', `${gate}-${stamp}.md`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, md);
    console.log(`리포트 저장: ${path.relative(PROJECT_ROOT, out)}`);
  }
  process.exit(result.verdict === 'PASS' ? 0 : 1);
}
