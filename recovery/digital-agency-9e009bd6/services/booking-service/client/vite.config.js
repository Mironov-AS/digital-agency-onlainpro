import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/booking/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3003,
    allowedHosts: true,
    proxy: {
      '/api/booking': { target: 'http://localhost:4008', changeOrigin: true }
    }
  }
});
