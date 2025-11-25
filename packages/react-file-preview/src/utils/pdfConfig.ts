import { pdfjs } from 'react-pdf';

/**
 * PDF.js Worker 配置
 *
 * 配置策略:
 * 1. 优先尝试使用本地 public 目录中的 worker 文件
 * 2. 如果本地文件不存在,降级使用 CDN
 * 3. 使用 HTTPS CDN 确保安全性
 */

const pdfjsVersion = pdfjs.version;

// 配置 worker 路径
// 优先使用本地 worker,如果不存在则使用 CDN
const workerSrc = `/pdf.worker.min.mjs`;

// 尝试使用本地 worker
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

// 添加错误处理,如果本地 worker 加载失败,自动降级到 CDN
const originalWorkerSrc = pdfjs.GlobalWorkerOptions.workerSrc;
const cdnWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

// 监听 worker 加载错误
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('pdf.worker') && pdfjs.GlobalWorkerOptions.workerSrc === originalWorkerSrc) {
      console.warn('本地 PDF worker 加载失败,切换到 CDN:', cdnWorkerSrc);
      pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerSrc;
    }
  });
}

export { pdfjs };

