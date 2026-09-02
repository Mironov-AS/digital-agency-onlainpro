import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  cacheDir: process.env.VITE_CACHE_DIR || '/tmp/vite-cache',
  base: '/erp/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    exclude: ['**/node_modules/**', '**/dist/**', 'backend/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/test/**'],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3006,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      '/api/erp': { target: 'http://localhost:4010', changeOrigin: true },
      '/api/ai-chat': { target: 'http://localhost:4010', changeOrigin: true },
      '/api/auth': { target: 'http://localhost:4001', changeOrigin: true },
    },
  },
})
