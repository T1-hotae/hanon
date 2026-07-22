import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      // 로컬 UI(npm run dev)에서 /api 요청을 배포된 Vercel 함수로 전달.
      '/api': {
        target: 'https://hanon-rho.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
