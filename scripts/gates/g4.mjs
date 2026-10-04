// G4 피그마: 피그마 변수 이름 = 토큰 이름 (차이 0)
import { pass, fail } from './lib.mjs';
import { loadPair } from './figma.mjs';

export function run({ root }) {
  const { tokens, figma, error } = loadPair(root);
  if (error) return [fail('입력 파일', error, '있음')];
  const t = Object.keys(tokens), f = Object.keys(figma);
  const onlyCode = t.filter((k) => !f.includes(k)).map((k) => `코드에만: --${k}`);
  const onlyFigma = f.filter((k) => !t.includes(k)).map((k) => `피그마에만: ${k}`);
  const diff = [...onlyCode, ...onlyFigma];
  return [diff.length
    ? fail('변수 이름 일치', `차이 ${diff.length}개`, '0개', diff)
    : pass('변수 이름 일치', `${t.length}개 일치`, '0개 차이')];
}
