// G4·G5 공통: 피그마 변수(JSON) ↔ tokens.css 비교
// 입력: docs/harness/figma-variables.json  { "variables": [{ "name": "color/primary", "value": "#FFD43B" }] }
// figma-sync가 Figma MCP로 받아 저장한다. 이름의 "/"는 "-"로 바꿔 토큰 이름과 비교.
import path from 'node:path';
import { exists, read, parseTokens, toPx, normHex } from './lib.mjs';

export function loadPair(root) {
  const tokFile = path.join(root, 'app/tokens.css');
  const figFile = path.join(root, 'docs/harness/figma-variables.json');
  if (!exists(tokFile)) return { error: 'app/tokens.css 없음' };
  if (!exists(figFile)) return { error: 'docs/harness/figma-variables.json 없음 (figma-sync가 export해야 함)' };
  const tokens = Object.fromEntries(Object.entries(parseTokens(read(tokFile))).filter(([k]) => !k.includes('--')));
  const figma = Object.fromEntries(JSON.parse(read(figFile)).variables.map((v) => [v.name.replace(/\//g, '-'), String(v.value)]));
  return { tokens, figma };
}

export const normValue = (v) => {
  const s = String(v).trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return normHex(s);
  const px = toPx(s);
  return px !== null ? `${px}` : s.replace(/\s+/g, ' ');
};
