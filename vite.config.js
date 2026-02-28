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
        target: 'https://any.lumi210.ggff.net',
        changeOrigin: true,
        secure: true
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
