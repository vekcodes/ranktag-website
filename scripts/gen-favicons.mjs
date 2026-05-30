// One-off: rasterize the RankedTag mark SVG into square favicon PNGs.
// Run: node scripts/gen-favicons.mjs   (sharp must be installed)
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const svg = readFileSync(p('../public/rankedtag-mark.svg'));

// Transparent square favicons.
for (const size of [16, 32, 192, 512]) {
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(p(`../public/favicon-${size}x${size}.png`));
  console.log('✓ favicon-' + size + 'x' + size + '.png');
}

// Apple touch icon: mark on a white background with padding (iOS ignores alpha).
const inner = 132;
const pad = (180 - inner) / 2;
const markPng = await sharp(svg, { density: 512 }).resize(inner, inner, {
  fit: 'contain',
  background: { r: 255, g: 255, b: 255, alpha: 0 },
}).png().toBuffer();

await sharp({
  create: { width: 180, height: 180, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([{ input: markPng, top: pad, left: pad }])
  .png()
  .toFile(p('../public/apple-touch-icon.png'));
console.log('✓ apple-touch-icon.png');
