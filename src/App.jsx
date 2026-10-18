import { Navigate, useLocation } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './pages/Home.jsx';
import { VERTICALS } from './pages/verticals/verticalsData.js';
import { COMPARISONS } from './pages/best/comparisonsData.js';
import { EXPLAINERS } from './pages/explainers/explainersData.js';

// react-router's `lazy` expects a module exposing a named `Component`. Our pages
// default-export their component, so this adapter wraps a dynamic import into the
// shape the data router wants — while preserving per-route code splitting and
// letting vite-react-ssg await the chunk during pre-render.
const lazyRoute = (factory) => async () => ({
  Component: (await factory()).default,
});

function ApplyRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/apply${search}`} replace />;
}

// Route data array consumed by vite-react-ssg (and react-router on the client).
// Pre-rendering scope is controlled separately via `ssgOptions.includedRoutes`
// in vite.config.js — only the static marketing/tool routes are baked to HTML.
// Blog routes stay served by the /api/blog-page SSR function; admin stays a
// client-only app. Both still appear here so client-side navigation works.
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },

      // Dedicated founder-review application page (pre-rendered). Lazy so its
      // chunk (HubSpot form helper etc.) stays out of the homepage bundle —
      // vite-react-ssg still awaits it when pre-rendering /apply.
      { path: 'apply', lazy: lazyRoute(() => import('./pages/Apply.jsx')) },

      // Standalone, indexable case study (pre-rendered).
      { path: 'case-study/sendr', lazy: lazyRoute(() => import('./pages/CaseStudySendr.jsx')) },

      // Vertical pages — commercial head-term pages, one per vertical, at
      // root level (slugs in src/pages/verticals/verticalsData.js). A vertical
      // only gets a route once its page is finished; an unfinished one must
      // 404, never render thin.
      // Comparison pages — shortlist intent, a different job from the
      // vertical sales pages. One route per researched list.
      { path: 'best', lazy: lazyRoute(() => import('./pages/best/BestHub.jsx')) },
      ...COMPARISONS.map((c) => ({
        path: `best/${c.slug}`,
        lazy: lazyRoute(() => import('./pages/best/ComparisonPage.jsx')),
      })),

      // Comparison explainers — expertise pages at root level, one route
      // each, same pattern as the vertical pages.
      ...EXPLAINERS.map((e) => ({
        path: e.slug,
        lazy: lazyRoute(() => import('./pages/explainers/ExplainerPage.jsx')),
      })),

      { path: 'who-we-help', lazy: lazyRoute(() => import('./pages/verticals/WhoWeHelp.jsx')) },
      ...VERTICALS.map((v) => ({
        path: v.slug,
        lazy: lazyRoute(() => import('./pages/verticals/VerticalPage.jsx')),
      })),

      // What we do — capability hub + one template-driven page per capability
      // (all pre-rendered; the concrete slugs live in
      // src/pages/whatWeDo/capabilitiesData.js). Moved from /services in the
      // multi-vertical restructure; the old URLs 301 in vercel.json.
      { path: 'what-we-do', lazy: lazyRoute(() => import('./pages/whatWeDo/WhatWeDo.jsx')) },
      { path: 'what-we-do/:slug', lazy: lazyRoute(() => import('./pages/whatWeDo/CapabilityPage.jsx')) },

      // NOTE: /llm-info is served as raw Markdown by api/llm-info.js (see the
      // vercel.json rewrite), so it is intentionally NOT a React route.

      // Founder Review IS the audit — these legacy paths bounce to /apply.
      { path: 'audit', element: <ApplyRedirect /> },
      { path: 'technical-audit', element: <ApplyRedirect /> },

      // Free tools. The three below are fully client-side: no API route, no
      // data leaves the page, which keeps them inside the Hobby plan.
      { path: 'schema-generator', lazy: lazyRoute(() => import('./pages/tools/SchemaGenerator.jsx')) },
      { path: 'llms-txt-generator', lazy: lazyRoute(() => import('./pages/tools/LlmsTxtGenerator.jsx')) },
      { path: 'serp-preview-tool', lazy: lazyRoute(() => import('./pages/tools/SerpPreview.jsx')) },

      // Free tools (static copy pre-rendered; interactive layer hydrates client-side).
      { path: 'domain-authority-checker', lazy: lazyRoute(() => import('./pages/BacklinkChecker.jsx')) },
      { path: 'keyword-density-checker', lazy: lazyRoute(() => import('./pages/DensityDashboard.jsx')) },
      { path: 'competitor-analysis', lazy: lazyRoute(() => import('./pages/CompetitorAnalysis.jsx')) },
      { path: 'page-speed-checker', lazy: lazyRoute(() => import('./pages/PageSpeed.jsx')) },

      // Legacy slug redirects — kept for SEO; server-side 301s also live in vercel.json.
      { path: 'backlink-checker', element: <Navigate to="/domain-authority-checker" replace /> },
      { path: 'keyword-density', element: <Navigate to="/keyword-density-checker" replace /> },
      { path: 'density', element: <Navigate to="/keyword-density-checker" replace /> },
      { path: 'competitor', element: <Navigate to="/competitor-analysis" replace /> },
      { path: 'page-speed', element: <Navigate to="/page-speed-checker" replace /> },

      // CMS admin — client-only, never pre-rendered.
      { path: 'admin', lazy: lazyRoute(() => import('./pages/admin/AdminApp.jsx')) },
      { path: 'admin/*', lazy: lazyRoute(() => import('./pages/admin/AdminApp.jsx')) },

      // Blog — production serves these via the SSR function (vercel.json rewrite);
      // these route records only drive client-side navigation.
      { path: 'blog', lazy: lazyRoute(() => import('./pages/Blog.jsx')) },
      { path: 'blog/:slug', lazy: lazyRoute(() => import('./pages/BlogPost.jsx')) },

      { path: '*', lazy: lazyRoute(() => import('./pages/NotFound.jsx')) },
    ],
  },
];
