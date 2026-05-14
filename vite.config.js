import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Local dev: run `vercel dev` from the repo root to get the frontend AND the
// /api/*.js serverless functions on a single port (default 3000), matching prod.
// Or run `npm run dev` for frontend-only on :5173 if you don't need the API.
export default defineConfig({
  plugins: [react()],
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
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          recharts: ['recharts'],
        },
      },
    },
  },
});
