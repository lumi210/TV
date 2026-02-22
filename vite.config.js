import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: ['.monkeycode-ai.online', 'all'],
    proxy: {
      '/api': {
        target: 'http://47.113.227.252:3000',
        changeOrigin: true
      }
    }
  }
})
