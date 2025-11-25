import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 演示应用构建配置（用于 GitHub Pages）
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/react-file-preview/' : '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  },
  build: {
    // 输出到 dist 目录
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist']
        }
      }
    }
  }
})
