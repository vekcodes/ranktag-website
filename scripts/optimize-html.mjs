// Post-build HTML optimization for the pre-rendered pages (runs as part of
// `npm run build`, after `vite-react-ssg build`). Three transforms, all aimed
// at making the first paint complete and self-contained:
//
// 1. Inline every referenced stylesheet into the page (deduped — the SSG can
//    emit the app CSS link twice: once in <head>, once inside the React tree).
//    The render-blocking CSS request (DNS+TCP+request on mobile RTTs) was the
//    biggest network item on the critical path; the CSS is small enough
//    (~14 KB gzipped) that carrying it inside each page is the faster trade.
//
// 2. Inline the ROUTE's own CSS chunk (resolved via dist/.vite/manifest.json).
//    Lazy routes (case study, tools, services) get their CSS only when their
//    JS chunk loads, so the page would first paint unstyled and then shift
//    once hydration pulls the chunk in (measured CLS 0.37 on the case study).
//    Baking the route CSS into the page makes the first paint final.
//
// 3. Defer React hydration until after the first paint. The pages are full
//    static HTML — hydration changes nothing visually — but if the module
//    evaluates before the first paint it (and the 95 KB of JS it needs) counts
//    against LCP on a throttled phone. The modulepreload links are kept so the
//    bytes still download early; only *evaluation* moves past the paint.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.cwd(), 'dist');

// Route page-module map — mirror of the lazy routes in src/App.jsx. Routes
// whose component is statically imported (Home) need no entry: their CSS is
// already part of the main app stylesheet.
const ROUTE_MODULES = [
  [/^apply$/, 'src/pages/Apply.jsx'],
  [/^case-study\/sendr$/, 'src/pages/CaseStudySendr.jsx'],
  [/^services$/, 'src/pages/services/Services.jsx'],
  [/^services\/.+$/, 'src/pages/services/ServicePage.jsx'],
  [/^domain-authority-checker$/, 'src/pages/BacklinkChecker.jsx'],
  [/^keyword-density-checker$/, 'src/pages/DensityDashboard.jsx'],
  [/^competitor-analysis$/, 'src/pages/CompetitorAnalysis.jsx'],
  [/^page-speed-checker$/, 'src/pages/PageSpeed.jsx'],
];

let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'));
} catch {
  console.warn('[optimize-html] no .vite/manifest.json — route CSS will not be inlined');
}

// All CSS files a module needs, including CSS of its statically imported chunks.
function collectCss(moduleId, seen = new Set()) {
  const entry = manifest[moduleId];
  if (!entry || seen.has(moduleId)) return [];
  seen.add(moduleId);
  const css = [...(entry.css || [])];
  for (const imp of entry.imports || []) css.push(...collectCss(imp, seen));
  return css;
}

const cssCache = new Map();
function readCss(assetPath) {
  const abs = path.join(dist, assetPath.replace(/^\//, ''));
  if (!fs.existsSync(abs)) return null;
  if (!cssCache.has(abs)) cssCache.set(abs, fs.readFileSync(abs, 'utf8'));
  return cssCache.get(abs);
}

const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) htmlFiles.push(p);
  }
})(dist);

let pages = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  const inlinedHrefs = new Set();

  // 1. Inline linked stylesheets; drop duplicate links to an already-inlined sheet.
  html = html.replace(
    /<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g,
    (tag, href) => {
      const css = readCss(href);
      if (css === null) return tag;
      if (inlinedHrefs.has(href)) return '';
      inlinedHrefs.add(href);
      return `<style>${css}</style>`;
    }
  );

  // 2. Add the route's own CSS chunk if the page didn't already carry it.
  const route = path
    .relative(dist, file)
    .replace(/\\/g, '/')
    .replace(/\/?index\.html$/, '');
  const mapping = ROUTE_MODULES.find(([re]) => re.test(route));
  if (mapping) {
    const missing = collectCss(mapping[1])
      .map((c) => '/' + c.replace(/^\//, ''))
      .filter((href) => !inlinedHrefs.has(href));
    let extra = '';
    for (const href of missing) {
      const css = readCss(href);
      if (css === null) continue;
      inlinedHrefs.add(href);
      extra += `<style>${css}</style>`;
    }
    if (extra) html = html.replace('</head>', `${extra}</head>`);
  }

  // 3. Hydrate only after the browser reports a real first-contentful-paint
  //    (rAF ticks can fire before the first frame is painted, which would put
  //    module evaluation back on the LCP-critical path).
  html = html.replace(
    /<script type="module"[^>]*\bsrc="(\/assets\/[^"]+\.js)"[^>]*><\/script>/,
    (_tag, src) =>
      `<script type="module">(function(){var d=false;function go(){if(d)return;d=true;import('${src}')}` +
      `try{if(performance.getEntriesByType('paint').some(function(e){return e.name==='first-contentful-paint'})){go()}` +
      `else{new PerformanceObserver(function(l,o){if(l.getEntries().some(function(e){return e.name==='first-contentful-paint'})){o.disconnect();go()}}).observe({type:'paint',buffered:true});` +
      `setTimeout(go,3500)}}catch(e){setTimeout(go,500)}})()</script>`
  );

  if (html !== before) {
    fs.writeFileSync(file, html);
    pages++;
  }
}

console.log(`[optimize-html] optimized ${pages}/${htmlFiles.length} pages`);
