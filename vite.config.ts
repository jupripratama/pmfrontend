import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // pastikan ini sama dengan vercel output
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5116',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
