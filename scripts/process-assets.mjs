// One-time asset processor. Run with: node scripts/process-assets.mjs
// Generates optimized hero/logo/avatar from the source art + styled placeholder
// tiles for the editable content slots (videos, shorts, updates). Placeholders
// are meant to be replaced by the client in Decap CMS.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT = 'public/images';
await mkdir(OUT, { recursive: true });

// --- Hero + logo (kept on black for mix-blend-mode: screen compositing) ---
await sharp('Logo.png')
  .resize(1100, 1100, { fit: 'inside' })
  .webp({ quality: 90 })
  .toFile(`${OUT}/hero-logo.webp`);

// Transparent hero logo (no baked glow) — the live hero. Glow is added in CSS.
await sharp('logo trans no glow.png')
  .resize(1024, 1024, { fit: 'inside' })
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile(`${OUT}/hero-logo-trans.webp`);

// Transparent character cutout (alternate/parallax layer if needed)
await sharp('Full body character.png')
  .resize(1400, null, { fit: 'inside' })
  .webp({ quality: 88 })
  .toFile(`${OUT}/hero-characters.webp`);

// --- Shark avatar: square crop from the centre of the logo, rounded later in CSS ---
await sharp('Logo.png')
  .extract({ left: 372, top: 372, width: 510, height: 510 })
  .resize(320, 320)
  .webp({ quality: 90 })
  .toFile(`${OUT}/avatar.webp`);

// --- Placeholder tile generator -------------------------------------------
const svgTile = (w, h, label, sub = '') => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#0e3a82"/>
      <stop offset="55%" stop-color="#071a3d"/>
      <stop offset="100%" stop-color="#02060f"/>
    </radialGradient>
    <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3aa0ff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#3aa0ff" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
      <path d="M26 0H0V26" fill="none" stroke="#1f5cae" stroke-opacity="0.18" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect width="${w}" height="${h}" fill="url(#scan)"/>
  <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="10" fill="none" stroke="#2f8bff" stroke-opacity="0.45" stroke-width="2"/>
  <g transform="translate(${w / 2}, ${h / 2 - (sub ? 14 : 0)})">
    <circle r="34" fill="#0a1d44" stroke="#3aa0ff" stroke-opacity="0.7" stroke-width="2"/>
    <path d="M-9 -15 L18 0 L-9 15 Z" fill="#7cc4ff"/>
  </g>
  <text x="${w / 2}" y="${h - (sub ? 46 : 28)}" font-family="Arial, sans-serif" font-size="${Math.round(w / 16)}" font-weight="700" letter-spacing="2" fill="#bfe0ff" text-anchor="middle">${label}</text>
  ${sub ? `<text x="${w / 2}" y="${h - 22}" font-family="Arial, sans-serif" font-size="${Math.round(w / 26)}" fill="#5b86c4" text-anchor="middle">${sub}</text>` : ''}
</svg>`;

const tile = (name, w, h, label, sub) =>
  sharp(Buffer.from(svgTile(w, h, label, sub))).webp({ quality: 86 }).toFile(`${OUT}/${name}.webp`);

// Featured videos (16:9)
await Promise.all([
  tile('featured-1', 640, 360, 'FEATURED 01', 'REPLACE IN CMS'),
  tile('featured-2', 640, 360, 'FEATURED 02', 'REPLACE IN CMS'),
  tile('featured-3', 640, 360, 'FEATURED 03', 'REPLACE IN CMS'),
]);

// Shorts / TikTok (9:16)
await Promise.all(
  [1, 2, 3, 4, 5, 6].map((n) => tile(`short-${n}`, 360, 640, `CLIP 0${n}`, 'REPLACE'))
);

console.log('Assets written to', OUT);
