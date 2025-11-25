import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        // 开发环境代理配置
        // 如果想测试本地后端：target: 'http://localhost:8080'
        // 如果想测试 Vercel 后端：target: 'https://image-puzzle-server.vercel.app'
        target: 'https://image-puzzle-server.vercel.app',
        changeOrigin: true,
        secure: true, // 如果 target 是 https，需要设置为 true
        // 不移除 /api 前缀，因为后端路由需要 /api 前缀
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
})

