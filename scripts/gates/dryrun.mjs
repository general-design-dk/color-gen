// 드라이런: 게이트마다 정상 샘플(PASS 기대)과 틀린 샘플(FAIL 기대)을 임시 폴더에 만들어 실행한다.
// 샘플은 커밋하지 않고 실행할 때마다 생성한다 (가짜 API 키 문자열이 저장소에 남지 않도록).
//   node scripts/gates/dryrun.mjs   → docs/harness/reports/dry-run.md 저장
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PROJECT_ROOT, encodePng } from './lib.mjs';
import { runGate } from './run.mjs';

const TOKENS_OK = `@theme {
  --color-primary: #FFD43B;
  --color-on-primary: #111111;
  --color-bg: #FFFFFF;
  --radius-card: 24px;
  --radius-full: 9999px;
  --text-display: 48px;
  --text-display--line-height: 56px;
  --spacing-md: 16px;
}
`;
const FIGMA_OK = { variables: [
  { name: 'color/primary', value: '#FFD43B' }, { name: 'color/on-primary', value: '#111111' },
  { name: 'color/bg', value: '#FFFFFF' }, { name: 'radius/card', value: '24' }, { name: 'radius/full', value: '9999' },
  { name: 'text/display', value: '48' }, { name: 'spacing/md', value: '16' },
] };
const PDF = (n) => '%PDF-1.4\n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj\n2 0 obj<</Type /Pages /Count ' + n + '>>endobj\n'
  + Array.from({ length: n }, (_, i) => `${3 + i} 0 obj<</Type /Page /Parent 2 0 R>>endobj\n`).join('') + '%%EOF\n';
const evalResults = (missBlocked) => ({ results: [
  ...Array.from({ length: 30 }, (_, i) => ({ keyword: `허용${i + 1}`, expected: 'allowed', actual: 'allowed' })),
  ...Array.from({ length: 20 }, (_, i) => ({ keyword: `차단${i + 1}`, expected: 'blocked', actual: i < missBlocked ? 'allowed' : 'blocked' })),
] });
const bwPng = () => encodePng(40, 56, (x, y) => ((x + y) % 7 === 0 ? [0, 0, 0] : [255, 255, 255]));
const grayPng = () => encodePng(40, 56, (x, y) => ((x + y) % 7 === 0 ? [0, 0, 0] : (x % 5 === 0 ? [128, 128, 128] : [255, 255, 255])));
const fakeKey = () => ['sk', 'ant', 'api03', 'X'.repeat(32)].join('-');

// 게이트별 샘플: { 설명, files: { 상대경로: 내용 } }
const CASES = {
  g2: {
    good: { desc: '허용 색상·반경만 쓴 tokens.css', files: { 'app/tokens.css': TOKENS_OK } },
    bad: { desc: '목록 밖 색상 #FF00AA, 반경 12px', files: { 'app/tokens.css': TOKENS_OK.replace('}', '  --color-pink: #FF00AA;\n  --radius-input: 12px;\n}') } },
  },
  g3: {
    good: { desc: '토큰 클래스만 쓴 컴포넌트', files: { 'components/Button.tsx': 'export const B = () => <button className="bg-primary text-on-primary rounded-full" />;\n' } },
    bad: { desc: '컴포넌트에 bg-[#FF0000], p-[13px] 직접 사용', files: { 'components/Button.tsx': 'export const B = () => <button className="bg-[#FF0000] p-[13px]" />;\n' } },
  },
  g4: {
    good: { desc: '피그마 변수 이름 = 토큰 이름', files: { 'app/tokens.css': TOKENS_OK, 'docs/harness/figma-variables.json': JSON.stringify(FIGMA_OK) } },
    bad: { desc: '피그마에 spacing/md 누락, color/accent 추가', files: { 'app/tokens.css': TOKENS_OK, 'docs/harness/figma-variables.json': JSON.stringify({ variables: [...FIGMA_OK.variables.filter((v) => v.name !== 'spacing/md'), { name: 'color/accent', value: '#FF0000' }] }) } },
  },
  g5: {
    good: { desc: '값 일치 + 실제 에셋 + 승인 기록', files: { 'app/tokens.css': TOKENS_OK, 'docs/harness/figma-variables.json': JSON.stringify(FIGMA_OK), 'public/assets/logo.svg': '<svg/>', 'docs/harness/progress.md': '- G5 사람 승인: 2026-10-04\n' } },
    bad: { desc: '피그마 primary 값 변경 미반영, placeholder 에셋, 승인 없음', files: { 'app/tokens.css': TOKENS_OK, 'docs/harness/figma-variables.json': JSON.stringify({ variables: FIGMA_OK.variables.map((v) => (v.name === 'color/primary' ? { ...v, value: '#FFE066' } : v)) }), 'public/assets/placeholder-logo.svg': '<svg/>', 'docs/harness/progress.md': '- 승인 대기\n' } },
  },
  g6: {
    good: { desc: '차단 20개 → 이미지 API 0회, 번들에 키 없음', files: { 'docs/harness/reports/safety-result.json': '{"blockedKeywords":20,"imageApiCalls":0}', '.next/static/chunks/main.js': 'console.log("ok")' } },
    bad: { desc: '★ 차단 키워드인데 이미지 API 3회 호출, 번들에 API 키 노출', files: { 'docs/harness/reports/safety-result.json': '{"blockedKeywords":20,"imageApiCalls":3}', '.next/static/chunks/main.js': `const k="${fakeKey()}";` } },
  },
  g7: {
    good: { desc: '앱 생성 전 (해당 없음 → skip)', files: {} },
    bad: { desc: '앱은 있는데 E2E 설정 없음', files: { 'package.json': '{"name":"x"}' } },
  },
  g8: {
    good: { desc: '차단율 100%, 흑백 이미지, PDF 1페이지', files: { 'docs/harness/reports/keyword-eval.json': JSON.stringify(evalResults(0)), 'docs/harness/reports/g8-images/a.png': bwPng(), 'docs/harness/reports/print.pdf': PDF(1) } },
    bad: { desc: '★ 차단 2개 놓침(90%), ★ 회색 픽셀 섞인 이미지, PDF 2페이지', files: { 'docs/harness/reports/keyword-eval.json': JSON.stringify(evalResults(2)), 'docs/harness/reports/g8-images/a.png': grayPng(), 'docs/harness/reports/print.pdf': PDF(2) } },
  },
};

function makeRoot(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-dryrun-'));
  for (const [rel, content] of Object.entries(files)) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  return dir;
}

const rows = [], details = [];
let allOk = true;
for (const [gate, { good, bad }] of Object.entries(CASES)) {
  for (const [kind, sample, expect] of [['정상', good, 'PASS'], ['틀린', bad, 'FAIL']]) {
    const root = makeRoot(sample.files);
    const r = await runGate(gate, root);
    fs.rmSync(root, { recursive: true, force: true });
    const ok = r.verdict === expect;
    allOk &&= ok;
    const caught = r.checks.filter((c) => c.status === 'fail').map((c) => c.name).join(', ') || '-';
    const skipped = r.checks.filter((c) => c.status === 'skip').map((c) => c.name).join(', ');
    rows.push(`| ${gate.toUpperCase()} | ${kind} | ${sample.desc} | ${expect} | ${r.verdict} | ${ok ? '✅' : '❌'} | ${caught}${skipped ? ` (skip: ${skipped})` : ''} |`);
    if (kind === '틀린') details.push(`### ${gate.toUpperCase()}`, ...r.checks.filter((c) => c.status === 'fail').map((c) => `- ${c.name}: 측정 ${c.measured} / 기준 ${c.expected}`), '');
  }
}

const md = [
  '# 하네스 드라이런', '',
  `- 실행: ${new Date().toISOString()}`,
  `- 결과: **${allOk ? '모든 게이트가 기대대로 판정' : '기대와 다른 판정 있음'}**`,
  '- 방법: 게이트마다 정상 샘플(PASS 기대)과 틀린 샘플(FAIL 기대)을 임시 폴더에 만들어 실행', '',
  '| 게이트 | 샘플 | 내용 | 기대 | 실제 | 일치 | 걸린 항목 |', '|---|---|---|---|---|---|---|',
  ...rows, '', '## 틀린 샘플에서 잡아낸 내용', '', ...details,
].join('\n');
const out = path.join(PROJECT_ROOT, 'docs/harness/reports/dry-run.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log(md);
process.exit(allOk ? 0 : 1);
