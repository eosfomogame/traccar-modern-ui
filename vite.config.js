import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Proxy is used only in local dev mode (npm run dev).
 * When the app is deployed as a static bundle alongside Traccar,
 * or when a custom serverUrl is saved, all requests go directly
 * to the remote URL via apiFetch() — no proxy needed.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
});
