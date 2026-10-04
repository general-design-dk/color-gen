// 게이트 공통 유틸. 외부 패키지 없이 Node 내장 모듈만 사용한다.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';

export const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

export function loadRules() {
  return JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'docs/harness/rules.json'), 'utf8'));
}

// check 결과: status = 'pass' | 'fail' | 'skip'
export const pass = (name, measured, expected) => ({ name, status: 'pass', measured, expected });
export const fail = (name, measured, expected, details = []) => ({ name, status: 'fail', measured, expected, details });
export const skip = (name, reason) => ({ name, status: 'skip', measured: reason, expected: '-' });

export const exists = (p) => fs.existsSync(p);
export const read = (p) => fs.readFileSync(p, 'utf8');

export function walk(dir, exts) {
  if (!exists(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (!exts || exts.includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

// tokens.css에서 `--name: value;` 선언을 모두 읽는다
export function parseTokens(css) {
  const tokens = {};
  for (const m of css.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) tokens[m[1]] = m[2].trim();
  return tokens;
}

// "24px" | "1.5rem" | "24" → 24, 그 외는 null
export function toPx(v) {
  const m = String(v).trim().match(/^(-?[\d.]+)(px|rem)?$/);
  if (!m) return null;
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
}

export const normHex = (h) => {
  let s = h.replace('#', '').toUpperCase();
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return '#' + s;
};

export function sh(cmd, cwd) {
  try {
    return { ok: true, out: execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf8' }) };
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || '') };
  }
}

// --- PNG 디코더 (8bit, 비인터레이스, 그레이/RGB/그레이A/RGBA) ---
export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('PNG 아님');
  let pos = 8, width, height, bitDepth, colorType, interlace;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (bitDepth !== 8 || !channels || interlace !== 0) {
    throw new Error(`지원하지 않는 PNG 형식 (bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace})`);
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? px[y * stride + x - channels] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= channels && y > 0 ? px[(y - 1) * stride + x - channels] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[y * stride + x] = v & 0xff;
    }
  }
  return { width, height, channels, px };
}

// --- PNG 인코더 (RGB 8bit, 드라이런 샘플 생성용) ---
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (b) => {
  let c = 0xffffffff;
  for (const x of b) c = CRC_TABLE[(c ^ x) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
export function encodePng(width, height, pixelFn) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y);
      const o = y * (width * 3 + 1) + 1 + x * 3;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}
