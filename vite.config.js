import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, the Vite server runs the SPA on :5173 but knows nothing about the
// /api routes — those are served by the Python file at api/index.py.
// Proxy /api/* to a locally-running FastAPI instance on :8000.
//
// Start the API in one terminal:
//   cd api && python index.py
// (or: uvicorn api.index:app --reload --port 8000 from the repo root)
//
// In production on Vercel, /api/* is routed to api/index.py by vercel.json
// — the proxy below has no effect there.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
