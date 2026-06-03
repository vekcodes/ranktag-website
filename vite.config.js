import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
        '/keyword-density-checker',
        '/domain-authority-checker',
        '/page-speed-checker',
        '/competitor-analysis',
      ];
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
