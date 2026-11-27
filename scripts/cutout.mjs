// Removes the plain white studio background from a product photo and trims it to the piece.
// Returns the path of a transparent PNG (cached in .cache/cutouts/), or null when the
// photo has no white background (room shots, close-ups), in which case it is used as is.
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const VERSION = 4; // bump to redo every cutout
const MAX_SIDE = 3600; // the site shows photos at most 1800px wide, so this is plenty
const NEAR_WHITE = 34; // 255 - darkest channel below this counts as background
const SOFT_GREY = 80; // light, colourless pixels (soft shadows on the backdrop) up to this
const GREY_SPREAD = 14; // "colourless": channels differ by at most this
const MIN_BORDER_WHITE = 0.8; // share of the border that must be white to treat the photo as a studio shot
const PAD = 0.015; // empty margin kept around the trimmed piece

export async function cutout(sharp, srcFile, cacheDir) {
  const stat = await fs.stat(srcFile);
  const key = crypto.createHash('md5').update(`${VERSION}|${path.resolve(srcFile)}|${stat.size}|${stat.mtimeMs}`).digest('hex');
  const out = path.join(cacheDir, `${key}.png`);
  const none = path.join(cacheDir, `${key}.none`);
  if (existsSync(out)) return out;
  if (existsSync(none)) return null;
  await fs.mkdir(cacheDir, { recursive: true });

  const { data, info } = await sharp(srcFile, { limitInputPixels: false })
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const N = W * H;

  // 0 = clear white, 1 = soft grey (shadow), 2 = piece
  const kind = new Uint8Array(N);
  for (let p = 0, i = 0; p < N; p++, i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lo = Math.min(r, g, b);
    const hi = Math.max(r, g, b);
    const d = 255 - lo;
    kind[p] = d < NEAR_WHITE ? 0 : d < SOFT_GREY && hi - lo <= GREY_SPREAD ? 1 : 2;
  }

  // Is this a studio shot? Most of the border must be white.
  let border = 0, white = 0;
  const visit = (p) => { border++; if (kind[p] === 0) white++; };
  for (let x = 0; x < W; x++) { visit(x); visit((H - 1) * W + x); }
  for (let y = 1; y < H - 1; y++) { visit(y * W); visit(y * W + W - 1); }
  if (white / border < MIN_BORDER_WHITE) {
    await fs.writeFile(none, '');
    return null;
  }

  // Flood fill the background from the border, through white and soft grey.
  const bg = new Uint8Array(N);
  const queue = new Int32Array(N);
  let head = 0, tail = 0;
  const push = (p) => { if (!bg[p] && kind[p] < 2) { bg[p] = 1; queue[tail++] = p; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (head < tail) {
    const p = queue[head++];
    const x = p % W;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (p >= W) push(p - W);
    if (p < N - W) push(p + W);
  }

  // Alpha mask, and the bounding box of the piece.
  const mask = Buffer.alloc(N);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let p = 0; p < N; p++) {
    if (bg[p]) continue;
    mask[p] = 255;
    const x = p % W, y = (p / W) | 0;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) {
    await fs.writeFile(none, '');
    return null;
  }

  const soft = await sharp(mask, { raw: { width: W, height: H, channels: 1 } })
    .blur(1.2)
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const sc = soft.info.channels;
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * PAD);
  const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
  const width = Math.min(W, x1 + pad + 1) - left, height = Math.min(H, y1 + pad + 1) - top;

  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y + top) * W + (x + left);
      const o = (y * width + x) * 4;
      rgba[o] = data[p * 3];
      rgba[o + 1] = data[p * 3 + 1];
      rgba[o + 2] = data[p * 3 + 2];
      rgba[o + 3] = soft.data[p * sc];
    }
  }
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 6 })
    .toFile(out);
  return out;
}
