// G8 검증: ★ 차단율·오차단율 · ★ 흑·백 외 픽셀 0% · 인쇄 PDF 1페이지 · 실제 API 상한
// 입력 (STEP 8 실행 결과, docs/harness/reports/ 아래):
//   keyword-eval.json  { "results": [{ "keyword": "공룡", "expected": "allowed", "actual": "allowed" }] }
//   g8-images/*.png    실제 생성·후처리된 도안
//   print.pdf          인쇄 미리보기 PDF
import fs from 'node:fs';
import path from 'node:path';
import { exists, read, walk, decodePng, pass, fail } from './lib.mjs';

export function run({ root, rules }) {
  const dir = path.join(root, 'docs/harness/reports');
  const s = rules.safety, cap = rules.realApi;
  const checks = [];

  const evalFile = path.join(dir, 'keyword-eval.json');
  if (!exists(evalFile)) checks.push(fail('★ 키워드 판정', '결과 파일 없음', 'keyword-eval.json'));
  else {
    const r = JSON.parse(read(evalFile)).results;
    const blk = r.filter((x) => x.expected === 'blocked'), alw = r.filter((x) => x.expected === 'allowed');
    const blockRate = blk.filter((x) => x.actual === 'blocked').length / (blk.length || 1);
    const falseBlock = alw.filter((x) => x.actual === 'blocked').length / (alw.length || 1);
    const missed = blk.filter((x) => x.actual !== 'blocked').map((x) => `차단 실패: ${x.keyword}`);
    const wrong = alw.filter((x) => x.actual === 'blocked').map((x) => `오차단: ${x.keyword}`);
    const pct = (v) => `${(v * 100).toFixed(1)}%`;
    checks.push(blockRate >= s.blockRateMin
      ? pass('★ 차단율', pct(blockRate), `≥ ${pct(s.blockRateMin)}`)
      : fail('★ 차단율', pct(blockRate), `≥ ${pct(s.blockRateMin)}`, missed));
    checks.push(falseBlock <= s.falseBlockRateMax
      ? pass('오차단율', pct(falseBlock), `≤ ${pct(s.falseBlockRateMax)}`)
      : fail('오차단율', pct(falseBlock), `≤ ${pct(s.falseBlockRateMax)}`, wrong));
    checks.push(r.length <= cap.classifyMax
      ? pass('실제 분류 호출 상한', `${r.length}건`, `≤ ${cap.classifyMax}건`)
      : fail('실제 분류 호출 상한', `${r.length}건`, `≤ ${cap.classifyMax}건`));
  }

  const imgs = walk(path.join(dir, 'g8-images'), ['.png']);
  if (!imgs.length) checks.push(fail('★ 흑백 픽셀', '이미지 없음', 'g8-images/*.png'));
  else {
    const bad = [];
    for (const f of imgs) {
      try {
        const { px, channels } = decodePng(fs.readFileSync(f));
        let n = 0, total = px.length / channels;
        for (let i = 0; i < px.length; i += channels) {
          const isBW = (v) => v === 0 || v === 255;
          const [r, g, b] = channels >= 3 ? [px[i], px[i + 1], px[i + 2]] : [px[i], px[i], px[i]];
          const a = channels === 4 ? px[i + 3] : channels === 2 ? px[i + 1] : 255;
          if (!(r === g && g === b && isBW(r) && a === 255)) n++;
        }
        if (n / total > s.nonBlackWhitePixelRatioMax) bad.push(`${path.basename(f)}: 흑·백 외 ${(n / total * 100).toFixed(2)}%`);
      } catch (e) { bad.push(`${path.basename(f)}: ${e.message}`); }
    }
    checks.push(bad.length
      ? fail('★ 흑백 픽셀', `${bad.length}/${imgs.length}장 위반`, '흑·백 외 0%', bad)
      : pass('★ 흑백 픽셀', `${imgs.length}장 모두 흑·백`, '흑·백 외 0%'));
    checks.push(imgs.length <= cap.imageMax
      ? pass('실제 이미지 생성 상한', `${imgs.length}장`, `≤ ${cap.imageMax}장`)
      : fail('실제 이미지 생성 상한', `${imgs.length}장`, `≤ ${cap.imageMax}장`));
  }

  const pdf = path.join(dir, 'print.pdf');
  if (!exists(pdf)) checks.push(fail('인쇄 PDF 1페이지', 'print.pdf 없음', `${rules.print.pageCount}페이지`));
  else {
    const pages = (fs.readFileSync(pdf, 'latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
    checks.push(pages === rules.print.pageCount
      ? pass('인쇄 PDF 1페이지', `${pages}페이지`, `${rules.print.pageCount}페이지`)
      : fail('인쇄 PDF 1페이지', `${pages}페이지`, `${rules.print.pageCount}페이지`));
  }
  return checks;
}
