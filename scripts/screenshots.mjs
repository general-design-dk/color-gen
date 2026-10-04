// G3용 스크린샷 8장 촬영: 상태 4개 × (mobile 390x844, desktop 1440x900), fullPage
// 사용법:
//   node scripts/screenshots.mjs                   # next build 결과를 next start(3100)로 띄워 촬영 후 종료
//   node scripts/screenshots.mjs http://localhost:3000   # 이미 떠 있는 서버를 촬영
// 먼저 `npm run build` 가 되어 있어야 한다(첫 번째 방식).
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs/harness/reports/screenshots');
const STATES = ['idle', 'loading', 'done', 'error'];
const VIEWPORTS = { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };
const PORT = 3100;

async function waitFor(url, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`서버 응답 없음: ${url}`);
}

let server = null;
let base = process.argv[2];
if (!base) {
  base = `http://localhost:${PORT}`;
  server = spawn(path.join(root, 'node_modules/.bin/next'), ['start', '-p', String(PORT)], { cwd: root, stdio: 'ignore' });
}

const stop = () => { if (server && !server.killed) server.kill('SIGTERM'); };
process.on('SIGINT', () => { stop(); process.exit(130); });

let browser;
try {
  await waitFor(base);
  mkdirSync(outDir, { recursive: true });
  browser = await chromium.launch();
  for (const [vp, size] of Object.entries(VIEWPORTS)) {
    const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
    for (const s of STATES) {
      await page.goto(`${base}/?state=${s}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const file = path.join(outDir, `${s}-${vp}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('saved', path.relative(root, file));
    }
    await page.close();
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await browser?.close();
  stop();
}
