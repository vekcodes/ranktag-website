// One-off: rasterize the white-background RankedTag favicon into square PNGs.
// Run: node scripts/gen-favicons.mjs   (sharp must be installed)
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const p = (rel) => fileURLToPath(new URL(rel, import.meta.url));
// favicon.svg already has a white background + centered mark, so every raster
// below is white-bg + centered to match what Google shows next to results.
const svg = readFileSync(p('../public/favicon.svg'));

// Google prefers favicons that are a multiple of 48px; ship a range.
for (const size of [16, 32, 48, 96, 192, 512]) {
  await sharp(svg, { density: 512 })
    .resize(size, size, { fit: 'contain', background: '#FFFFFF' })
    .flatten({ background: '#FFFFFF' })
    .png()
    .toFile(p(`../public/favicon-${size}x${size}.png`));
  console.log('✓ favicon-' + size + 'x' + size + '.png');
}

// Apple touch icon (180x180, same white-bg centered treatment).
await sharp(svg, { density: 512 })
  .resize(180, 180, { fit: 'contain', background: '#FFFFFF' })
  .flatten({ background: '#FFFFFF' })
  .png()
  .toFile(p('../public/apple-touch-icon.png'));
console.log('✓ apple-touch-icon.png');
