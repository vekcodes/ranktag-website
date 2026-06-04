#!/usr/bin/env node
// Build-time SEO validator. Run after `npm run build` (or via `npm run seo:check`).
// Fails (exit 1) on hard errors; prints WARN for soft issues.
//
// Checks, per pre-rendered page in dist/:
//   - every JSON-LD block is valid JSON
//   - exactly ONE set of og:* and twitter:* tags (no duplicates)
//   - exactly one <h1>
//   - a canonical that is an absolute URL
//   - og:image asset actually ships in dist/ (URL path -> local file) and,
//     when readable, is roughly landscape ~1.91:1 (1200x630)
//   - title 50-60 chars, description 140-160 chars (soft WARN)
//
// Note: /blog and /blog/:slug are SSR (not in dist) and are validated at
// request time by their own renderer; this covers the static surface.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

function imgDims(file) {
  try {
    const b = readFileSync(file);
    if (b.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
      return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    }
    // JPEG
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      if (m === 0xd8 || m === 0xd9) { i += 2; continue; }
      i += 2 + b.readUInt16BE(i + 2);
    }
  } catch {}
  return null;
}

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const files = walk(DIST);
const ogImages = new Set();

for (const file of files) {
  const rel = file.slice(DIST.length).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');

  // JSON-LD validity (always — even on noindex pages)
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  blocks.forEach((b, i) => {
    try { JSON.parse(b[1]); } catch (e) { err(`${rel}: JSON-LD block #${i + 1} invalid — ${e.message}`); }
  });

  // Skip indexable-page rules (canonical, lengths, h1) for noindex/utility pages.
  if (/name="robots"\s+content="[^"]*noindex/i.test(html)) continue;

  // exactly one social set
  const count = (re) => (html.match(re) || []).length;
  for (const [label, re] of [
    ['og:title', /property="og:title"/g],
    ['og:description', /property="og:description"/g],
    ['og:image', /property="og:image"(?!:)/g],
    ['og:url', /property="og:url"/g],
    ['twitter:card', /name="twitter:card"/g],
    ['twitter:title', /name="twitter:title"/g],
    ['twitter:image', /name="twitter:image"/g],
  ]) {
    const n = count(re);
    if (n > 1) err(`${rel}: duplicate ${label} (${n}× — must be exactly one)`);
  }

  // exactly one h1
  const h1 = count(/<h1[\s>]/g);
  if (h1 !== 1) warn(`${rel}: ${h1} <h1> (want exactly 1)`);

  // canonical absolute
  const can = html.match(/rel="canonical" href="([^"]*)"/);
  if (!can) err(`${rel}: missing canonical`);
  else if (!/^https:\/\//.test(can[1])) err(`${rel}: canonical not absolute — ${can[1]}`);

  // title / description lengths (soft)
  const t = html.match(/<title>([\s\S]*?)<\/title>/);
  if (t) {
    const len = decode(t[1].trim()).length;
    if (len < 50 || len > 60) warn(`${rel}: title ${len} chars (want 50-60)`);
  }
  const d = html.match(/<meta name="description" content="([^"]*)"/);
  if (d) {
    const len = decode(d[1].trim()).length;
    if (len < 140 || len > 160) warn(`${rel}: description ${len} chars (want 140-160)`);
  }

  // collect og:image
  const og = html.match(/property="og:image" content="([^"]*)"/);
  if (og) ogImages.add(og[1]);
}

// og:image assets must ship in dist/ and be ~1.91:1 landscape
for (const url of ogImages) {
  const path = url.replace(/^https?:\/\/[^/]+/, '');
  const local = join(DIST, path);
  if (!existsSync(local)) {
    err(`og:image does not resolve to a shipped asset: ${url} (expected dist${path})`);
    continue;
  }
  const dims = imgDims(local);
  if (dims) {
    const ratio = dims.w / dims.h;
    if (ratio < 1.7 || ratio > 2.1) {
      warn(`og:image ${path} is ${dims.w}x${dims.h} (ratio ${ratio.toFixed(2)}); ideal is 1200x630 (~1.91)`);
    }
  }
}

console.log(`SEO check: ${files.length} pages, ${ogImages.size} unique og:image(s)`);
for (const w of warns) console.log(`  WARN  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}
console.log(`\nOK — no hard errors${warns.length ? ` (${warns.length} warning(s))` : ''}.`);
