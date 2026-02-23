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
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      },
      '/shortdrama-api': {
        target: 'https://wwzy.tv',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/shortdrama-api/, '/api.php/provide/vod'),
        secure: false
      }
    }
  }
})
