import { Navigate, useLocation } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

// react-router's `lazy` expects a module exposing a named `Component`. Our pages
// default-export their component, so this adapter wraps a dynamic import into the
// shape the data router wants — while preserving per-route code splitting and
// letting vite-react-ssg await the chunk during pre-render.
const lazyRoute = (factory) => async () => ({
  Component: (await factory()).default,
});

function ApplyRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/${search}#apply`} replace />;
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

      // Founder Review IS the audit — these legacy paths bounce to the apply form.
      { path: 'audit', element: <ApplyRedirect /> },
      { path: 'technical-audit', element: <ApplyRedirect /> },

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

      { path: '*', element: <NotFound /> },
    ],
  },
];
