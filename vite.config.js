import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TOOL_META } from './src/seo/routeMeta.js';

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Per-route static <head> for the pre-rendered tool pages (the "Option B" head).
// vite-react-ssg renders every route from the SAME index.html template, so each
// tool page would otherwise inherit the homepage's title/description/canonical.
// Here we swap those (plus the matching OG/Twitter pairs) for the route's own
// values BEFORE render. The homepage ('/') has no entry in TOOL_META, so its
// <head> is returned untouched — byte-for-byte the original index.html. We only
// rewrite the *values* of existing tags (never reorder/add), and the site-wide
// Organization JSON-LD stays put.
function rewriteHeadForRoute(route, indexHTML) {
  const meta = TOOL_META[route];
  if (!meta) return indexHTML;
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const url = escapeHtml(meta.canonical);
  return indexHTML
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
}

// Local dev: run `vercel dev` from the repo root to get the frontend AND the
// /api/*.js serverless functions on a single port (default 3000), matching prod.
// Or run `npm run dev` for frontend-only on :5173 if you don't need the API.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  // Static-generation scope for vite-react-ssg. Only the static marketing/tool
  // routes are pre-rendered to HTML. Blog routes are intentionally excluded so
  // the request-time SSR function (api/blog-page.js, wired via vercel.json) keeps
  // serving live CMS content — a pre-rendered /blog file would shadow it. Admin,
  // the client redirects, and dynamic :slug routes are excluded too.
  ssgOptions: {
    entry: 'src/main.jsx',
    // nested -> dist/<route>/index.html, which Vercel serves at /<route> via
    // directory-index resolution (more robust than flat .html on Vercel).
    dirStyle: 'nested',
    includedRoutes() {
      return [
        '/',
        '/apply',
        '/keyword-density-checker',
        '/domain-authority-checker',
        '/page-speed-checker',
        '/competitor-analysis',
      ];
    },
    onBeforePageRender(route, indexHTML) {
      return rewriteHeadForRoute(route, indexHTML);
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      // manualChunks is a client-only concern. During the vite-react-ssg server
      // (SSR) build, react/react-dom are externalized, and listing an external in
      // manualChunks is a hard rollup error — so only apply it to the client build.
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              recharts: ['recharts'],
            },
          },
    },
  },
}));
