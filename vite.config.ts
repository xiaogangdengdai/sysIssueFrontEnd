import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    strictPort: true,  // 强制使用3000端口，被占用则启动失败
    host: '0.0.0.0',  // 允许外网访问
    allowedHosts: ['sustenanceless-superindifferently-germaine.ngrok-free.dev', '.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
