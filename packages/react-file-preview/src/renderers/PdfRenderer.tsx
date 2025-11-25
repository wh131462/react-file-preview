import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// 导入 PDF.js 配置
import '../utils/pdfConfig';

interface PdfRendererProps {
  url: string;
  zoom: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
}

export const PdfRenderer: React.FC<PdfRendererProps> = ({
  url,
  zoom,
  currentPage,
  onPageChange,
  onTotalPagesChange,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    setError(null);
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onTotalPagesChange(numPages);
    onPageChange(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF 加载错误:', error);
    setError('PDF 文件加载失败');
  };

  // 滚动时更新当前页码
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const scrollCenter = scrollTop + containerHeight / 2;

    // 找到当前可见的页面
    let currentVisiblePage = 1;
    let minDistance = Infinity;

    pageRefs.current.forEach((pageElement, pageNumber) => {
      const rect = pageElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const pageCenter = rect.top - containerRect.top + rect.height / 2 + scrollTop;
      const distance = Math.abs(pageCenter - scrollCenter);

      if (distance < minDistance) {
        minDistance = distance;
        currentVisiblePage = pageNumber;
      }
    });

    if (currentVisiblePage !== currentPage) {
      onPageChange(currentVisiblePage);
    }
  }, [currentPage, onPageChange]);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 设置页面引用
  const setPageRef = useCallback((pageNumber: number, element: HTMLDivElement | null) => {
    if (element) {
      pageRefs.current.set(pageNumber, element);
    } else {
      pageRefs.current.delete(pageNumber);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full h-full overflow-auto py-8 px-4"
    >
      {error && (
        <div className="text-white/70 text-center">
          <p className="text-lg">{error}</p>
        </div>
      )}

      {!error && (
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {Array.from(new Array(numPages), (_, index) => {
              const pageNumber = index + 1;
              return (
                <div
                  key={`page_${pageNumber}`}
                  ref={(el) => setPageRef(pageNumber, el)}
                  className="relative"
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={zoom}
                    loading={
                      <div className="flex items-center justify-center p-8 bg-white/5 rounded-lg min-h-[600px]">
                        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    }
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-2xl"
                  />
                  {/* 页码标签 */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                    {pageNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </Document>
      )}

      {/* 底部页码指示器 */}
      {numPages > 0 && (
        <div className="sticky bottom-4 mt-8 bg-black/60 backdrop-blur-xl text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl border border-white/10">
          第 {currentPage} 页 / 共 {numPages} 页
        </div>
      )}
    </div>
  );
};

