import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  base: '/',
  build: {
    outDir: path.resolve(__dirname, '../dist/admin'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': 'https://backend.qxmr.quest',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

