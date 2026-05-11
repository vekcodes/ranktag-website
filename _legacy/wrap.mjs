#!/usr/bin/env node
// Combines a converted body fragment + page-specific imports/effects into a JSX page component.

import fs from 'node:fs';
import path from 'node:path';

const IN_DIR = '_legacy/converted';
const OUT_DIR = 'src/pages';

const pages = [
  {
    file: 'home',
    component: 'Home',
    variant: 'home',
    effects: `
  // FAQ accordion (delegated)
  useEffect(() => {
    const handler = (e) => {
      const q = e.target.closest('.faq-q');
      if (!q) return;
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Pipeline tabs (delegated)
  useEffect(() => {
    const handler = (e) => {
      const tab = e.target.closest('.pipeline-tab');
      if (!tab) return;
      document.querySelectorAll('.pipeline-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
`,
  },
  { file: 'audit', component: 'Audit', variant: 'audit', effects: '' },
  { file: 'technical-audit', component: 'TechnicalAudit', variant: 'tech', effects: '' },
  { file: 'roi-calculator', component: 'RoiCalculator', variant: 'roi', effects: '' },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const p of pages) {
  const body = fs.readFileSync(path.join(IN_DIR, `${p.file}.body.jsx`), 'utf8').trim();
  const cssSrc = path.join(IN_DIR, `${p.file}.css`);
  const cssDest = path.join(OUT_DIR, `${p.component}.css`);
  fs.copyFileSync(cssSrc, cssDest);

  const jsx = `import { useEffect } from 'react';
import Nav from '../components/Nav.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import './${p.component}.css';

export default function ${p.component}() {
  useScrollReveal();
${p.effects}
  return (
    <>
      <Nav variant="${p.variant}" />
${body
  .split('\n')
  .map((l) => '      ' + l)
  .join('\n')}
    </>
  );
}
`;
  fs.writeFileSync(path.join(OUT_DIR, `${p.component}.jsx`), jsx, 'utf8');
  console.log(`wrote ${path.join(OUT_DIR, p.component + '.jsx')}`);
}
