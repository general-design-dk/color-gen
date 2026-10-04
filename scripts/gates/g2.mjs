// G2 토큰: tokens.css 색상·반경·폰트 크기·간격이 rules.json 목록 안에 있는지
import path from 'node:path';
import { exists, read, parseTokens, toPx, normHex, pass, fail } from './lib.mjs';

export function run({ root, rules }) {
  const file = path.join(root, 'app/tokens.css');
  if (!exists(file)) return [fail('tokens.css 존재', '없음', 'app/tokens.css')];
  const css = read(file);
  const tokens = parseTokens(css);
  const d = rules.design;
  const checks = [pass('tokens.css 존재', '있음', 'app/tokens.css')];

  const allowed = d.colors.map(normHex);
  const hexes = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => normHex(m[0]));
  const badColors = [...new Set(hexes.filter((h) => !allowed.includes(h)))];
  checks.push(badColors.length
    ? fail('색상 ⊂ 허용 목록', `목록 밖 ${badColors.length}개`, '0개', badColors)
    : pass('색상 ⊂ 허용 목록', `${new Set(hexes).size}종 모두 허용`, '0개 위반'));

  const group = (prefix, allowedVals, label) => {
    const entries = Object.entries(tokens).filter(([k]) => k.startsWith(prefix) && !k.includes('--'));
    const bad = entries.filter(([, v]) => !allowedVals.includes(toPx(v))).map(([k, v]) => `--${k}: ${v}`);
    if (!entries.length) return;
    checks.push(bad.length
      ? fail(label, `위반 ${bad.length}개`, `∈ {${allowedVals.join(', ')}}`, bad)
      : pass(label, `${entries.length}개 모두 허용`, `∈ {${allowedVals.join(', ')}}`));
  };
  group('radius-', d.radius, '반경');
  group('text-', d.fontSizes, '폰트 크기');
  group('spacing-', d.spacing, '간격');
  return checks;
}
