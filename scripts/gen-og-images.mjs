// Generates the 1200x630 OG cards in public/og/, with no dependencies.
//
//   node scripts/gen-og-images.mjs
//
// How it works: each card is written as an SVG, rendered to PNG by macOS's
// built-in `qlmanage`, then cropped to 1200x630 by `sips`. Both ship with the
// OS, which is why this replaced the old Pillow script — that one hardcoded
// C:/Windows/Fonts paths and could never have run on this machine, and adding
// Pillow would have meant a new dependency for ten static images.
//
// qlmanage only renders into a square box, so each card is authored on a
// 1200x1200 canvas with the artwork in the middle 630 band and then centre
// cropped. That is the whole trick.
//
// On Linux/Windows: install librsvg or ImageMagick and swap the two commands
// in `render()`. The SVG generation above it is portable.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = 'public/og';
const PAPER = '#F4EFE7';
const INK = '#0E0E10';
const RED = '#FF3B14';
const MUTED = '#6E6E76';
const SERIF = 'Georgia,"Times New Roman",serif';
const SANS = 'Helvetica,Arial,sans-serif';

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Rough width estimate so headlines wrap before they run off the card. Georgia
// at the sizes used here averages a little over half the point size per glyph.
const widthOf = (text, size) => text.length * size * 0.52;

function wrap(text, size, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w;
    if (widthOf(trial, size) <= maxWidth) line = trial;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function svg(eyebrow, headline) {
  let size = 62;
  let lines = wrap(headline, size, 1000);
  if (lines.length > 2) {
    size = 52;
    lines = wrap(headline, size, 1020);
  }
  const blockHeight = lines.length * (size + 16);
  const top = 300 - blockHeight / 2;
  const text = lines
    .map(
      (ln, i) =>
        `<text x="600" y="${top + i * (size + 16)}" text-anchor="middle" font-family='${SERIF}' font-size="${size}" fill="${INK}">${esc(ln)}</text>`
    )
    .join('\n    ');
  const ruleY = top + blockHeight + 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="${PAPER}"/>
  <g transform="translate(0,285)">
    <text x="600" y="120" text-anchor="middle" font-family='${SANS}' font-size="26" letter-spacing="3" fill="${MUTED}">${esc(eyebrow.toUpperCase())}</text>
    ${text}
    <rect x="530" y="${ruleY}" width="140" height="4" fill="${RED}"/>
    <text x="600" y="${ruleY + 75}" text-anchor="middle" font-family='${SANS}' font-size="28" fill="${MUTED}">rankedtag.com</text>
  </g>
</svg>`;
}

const tmp = mkdtempSync(join(tmpdir(), 'og-'));

function render(name, markup) {
  const src = join(tmp, `${name}.svg`);
  writeFileSync(src, markup);
  execFileSync('qlmanage', ['-t', '-s', '1200', '-o', tmp, src], { stdio: 'ignore' });
  execFileSync('sips', ['-c', '630', '1200', join(tmp, `${name}.svg.png`), '--out', `${OUT}/${name}.png`], {
    stdio: 'ignore',
  });
  console.log(`  wrote ${OUT}/${name}.png`);
}

// One entry per page with its own card. Keep in step with routeMeta.js.
const CARDS = [
  ['saas-seo-agency', 'Who we help · B2B SaaS', 'SaaS SEO that fills pipeline, not sessions'],
  ['ecommerce-seo-agency', 'Who we help · Ecommerce', 'Ecommerce SEO that treats the catalogue as the product'],
  ['local-seo-agency', 'Who we help · Local', 'Local SEO that works the Map Pack, not just the site'],
  ['who-we-help', 'Who we help', 'Three verticals, three playbooks'],
  ['best', 'Shortlists · updated quarterly', 'Agency shortlists we publish, bias included'],
  ['best-seo-agencies-for-saas', 'Shortlist · 2026', 'The best SaaS SEO agencies, honestly compared'],
  ['best-seo-agencies-for-ecommerce', 'Shortlist · 2026', 'The best ecommerce SEO agencies, honestly compared'],
  ['best-seo-agencies-for-local-business', 'Shortlist · 2026', 'The best local SEO agencies, honestly compared'],
  ['what-we-do', 'What we do', 'SEO, AI SEO, GEO and AEO, under one roof'],
  ['apply', 'Four slots a month', 'A free founder review of your domain'],
  ['what-we-do-seo', 'Capability · Full-stack SEO', 'Full-stack SEO that fills pipeline, not dashboards'],
  ['what-we-do-ai-seo', 'Capability · AI SEO', 'Own the answer, not just the ranking'],
  ['what-we-do-generative-engine-optimization', 'Capability · GEO', 'Get recommended by ChatGPT'],
  ['what-we-do-answer-engine-optimization', 'Capability · AEO', 'Be the answer buyers see first'],
  ['what-we-do-technical-seo', 'Capability · Technical SEO', 'The foundation your content deserves'],
  ['what-we-do-content-marketing', 'Capability · Content engine', 'A content engine that outships teams 10x its size'],
  ['seo-vs-geo', 'Explainer · 2026', 'SEO vs GEO: what actually changes'],
];

try {
  mkdirSync(OUT, { recursive: true });
  console.log(`Rendering ${CARDS.length} cards...`);
  for (const [name, eyebrow, headline] of CARDS) render(name, svg(eyebrow, headline));
  console.log(`\nDone. Commit ${OUT}/ and make sure routeMeta.js points at the new paths.`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
