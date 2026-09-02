import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/store/',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:4011',
    },
  },
})
