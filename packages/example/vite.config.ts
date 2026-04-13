import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 演示应用构建配置（用于 GitHub Pages）
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/file-preview/' : '/',
  plugins: [
    react(),
    // 复制 PDF.js worker 和 cmaps 文件到构建输出
    viteStaticCopy({
      targets: [
        {
          src: resolve(__dirname, '../react-file-preview/node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
          dest: './pdfjs',
        },
        {
          src: resolve(__dirname, '../react-file-preview/node_modules/pdfjs-dist/cmaps'),
          dest: './pdfjs',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      // 指向库构建产物，配合 vite build --watch 实现热更新
      '@eternalheart/react-file-preview/style.css': resolve(__dirname, '../react-file-preview/lib/index.css'),
      '@eternalheart/react-file-preview': resolve(__dirname, '../react-file-preview/lib/index.mjs'),
      // iconv-lite(msgreader 的依赖) 会尝试 require('stream') 并访问 stream.Transform
      // Vite 在浏览器中会把内置 `stream` externalize 后触发警告。此处给一个空 stub 即可
      stream: resolve(__dirname, 'src/shims/stream-stub.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  },
  server: {
    port: 4800,
    strictPort: true,
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
