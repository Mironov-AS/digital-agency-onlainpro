import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/crm/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3005,
    allowedHosts: true,
    proxy: {
      '/api/crm': { target: 'http://localhost:4009', changeOrigin: true },
      '/api/auth': { target: 'http://localhost:4001', changeOrigin: true },
    },
  },
})
