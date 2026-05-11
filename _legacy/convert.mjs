#!/usr/bin/env node
// HTML -> JSX conversion helper for the RankedTag static site.
// Reads a legacy HTML file, splits into <style> + body markup + <script>,
// and emits a .css file plus a JSX body fragment ready to paste into a page component.

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('usage: node convert.mjs <input.html> <outDir> [pageName]');
  process.exit(1);
}
const [inputPath, outDir, rawName] = args;
const pageName = rawName || path.basename(inputPath, '.html');

const html = fs.readFileSync(inputPath, 'utf8');

// 1. Extract <style>...</style>
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const styleCss = styleMatch ? styleMatch[1].trim() : '';

// 2. Find the body section: between </nav> and <script>
const navEnd = html.indexOf('</nav>');
const scriptStart = html.indexOf('<script>', navEnd);
if (navEnd < 0 || scriptStart < 0) {
  console.error('could not locate </nav> or <script> markers');
  process.exit(1);
}
let body = html.slice(navEnd + '</nav>'.length, scriptStart).trim();

// 3. Extract <script>...</script>
const scriptMatch = html.slice(scriptStart).match(/<script>([\s\S]*?)<\/script>/);
const scriptJs = scriptMatch ? scriptMatch[1].trim() : '';

// --- transform body to JSX ---

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function styleToObj(str) {
  const decls = str.split(';').map((d) => d.trim()).filter(Boolean);
  const pairs = decls
    .map((d) => {
      const i = d.indexOf(':');
      if (i < 0) return null;
      const prop = d.slice(0, i).trim();
      const val = d.slice(i + 1).trim();
      const key = camel(prop);
      const safeKey = /^[a-zA-Z][a-zA-Z0-9]*$/.test(key) ? key : `'${key}'`;
      let v;
      if (/^-?\d+(\.\d+)?$/.test(val)) v = val;
      else v = `'${val.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      return `${safeKey}: ${v}`;
    })
    .filter(Boolean);
  return `{{${pairs.join(', ')}}}`;
}

let out = body;

// HTML comments -> JSX comments
out = out.replace(/<!--([\s\S]*?)-->/g, (_, b) => {
  const safe = b.replace(/\*\//g, '*\\/');
  return `{/*${safe}*/}`;
});

// style="..." -> style={{...}}
out = out.replace(/style="([^"]*)"/g, (_, b) => `style=${styleToObj(b)}`);
out = out.replace(/style='([^']*)'/g, (_, b) => `style=${styleToObj(b)}`);

// class= -> className=
out = out.replace(/(\s)class=/g, '$1className=');
// for="X" on <label> -> htmlFor=
out = out.replace(/(<label[^>]*?)\sfor=/gi, '$1 htmlFor=');
// tabindex -> tabIndex
out = out.replace(/\btabindex=/g, 'tabIndex=');
// xlink:href -> xlinkHref
out = out.replace(/xlink:href=/g, 'xlinkHref=');
// readonly -> readOnly
out = out.replace(/\breadonly\b/g, 'readOnly');
// autocomplete -> autoComplete
out = out.replace(/\bautocomplete=/g, 'autoComplete=');

// Self-close void elements (only those without a trailing slash already)
const voids = ['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr'];
for (const tag of voids) {
  // Match <tag ...> not already self-closing
  const re = new RegExp(`<${tag}(\\b[^>]*?)?>`, 'gi');
  out = out.replace(re, (m, attrs = '') => {
    if (m.endsWith('/>')) return m;
    const a = (attrs || '').trim();
    return `<${tag}${a ? ' ' + a : ''} />`;
  });
}

// SVG attributes that need camelCase
const svgAttrMap = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  'text-anchor': 'textAnchor',
  'dominant-baseline': 'dominantBaseline',
  'gradient-units': 'gradientUnits',
  'gradient-transform': 'gradientTransform',
  'preserveAspectRatio': 'preserveAspectRatio',
  'viewBox': 'viewBox',
};
for (const [k, v] of Object.entries(svgAttrMap)) {
  out = out.replace(new RegExp(`\\b${k}=`, 'g'), `${v}=`);
}

// Ensure no stray `</br>` etc
out = out.replace(/<\/(br|img|input|hr|meta|link)>/g, '');

// Make local hrefs use React Router-friendly paths.
// audit.html      -> /audit
// technical-audit.html -> /technical-audit
// roi-calculator.html -> /roi-calculator
// index.html#x    -> /#x
// index.html      -> /
out = out
  .replace(/href="audit\.html"/g, 'href="/audit"')
  .replace(/href="technical-audit\.html"/g, 'href="/technical-audit"')
  .replace(/href="roi-calculator\.html"/g, 'href="/roi-calculator"')
  .replace(/href="index\.html#([\w-]+)"/g, 'href="/#$1"')
  .replace(/href="index\.html"/g, 'href="/"');

// Curly braces in literal text would be parsed as JSX expressions. The site has none.

fs.mkdirSync(outDir, { recursive: true });
const cssOut = path.join(outDir, `${pageName}.css`);
const jsxOut = path.join(outDir, `${pageName}.body.jsx`);
const scriptOut = path.join(outDir, `${pageName}.script.js`);

fs.writeFileSync(cssOut, styleCss + '\n', 'utf8');
fs.writeFileSync(jsxOut, out + '\n', 'utf8');
fs.writeFileSync(scriptOut, scriptJs + '\n', 'utf8');

console.log(`wrote ${cssOut}`);
console.log(`wrote ${jsxOut}`);
console.log(`wrote ${scriptOut}`);
