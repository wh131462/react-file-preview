import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import { PreviewFile, PreviewFileInput, FileType, CustomRenderer } from './types';
import { normalizeFiles } from './utils/fileNormalizer';
import { ImageRenderer } from './renderers/ImageRenderer';
import { PdfRenderer } from './renderers/PdfRenderer';
import { DocxRenderer } from './renderers/DocxRenderer';
import { XlsxRenderer } from './renderers/XlsxRenderer';
import { PptxRenderer } from './renderers/PptxRenderer';
import { VideoRenderer } from './renderers/VideoRenderer';
import { AudioRenderer } from './renderers/AudioRenderer';
import { MarkdownRenderer } from './renderers/MarkdownRenderer';
import { TextRenderer } from './renderers/TextRenderer';
import { UnsupportedRenderer } from './renderers/UnsupportedRenderer';

interface FilePreviewModalProps {
  files: PreviewFileInput[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
  customRenderers?: CustomRenderer[];
}

const getFileType = (file: PreviewFile): FileType => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();

  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image';
  }
  if (mimeType.includes('pdf') || ext === 'pdf') {
    return 'pdf';
  }
  if (mimeType.includes('wordprocessingml') || ext === 'docx') {
    return 'docx';
  }
  if (mimeType.includes('spreadsheetml') || ext === 'xlsx') {
    return 'xlsx';
  }
  if (mimeType.includes('presentationml') || ext === 'pptx' || ext === 'ppt') {
    return 'pptx';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'mkv', 'm4v', '3gp', 'flv'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }
  if (ext === 'md' || ext === 'markdown') {
    return 'markdown';
  }
  // 文本文件和代码文件
  const textExtensions = [
    'txt', 'log', 'csv',
    'js', 'jsx', 'ts', 'tsx', 'json',
    'py', 'java', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
    'html', 'css', 'scss', 'sass', 'less',
    'xml', 'yaml', 'yml', 'toml', 'ini', 'conf',
    'sh', 'bash', 'zsh', 'sql',
  ];
  if (mimeType.startsWith('text/') || textExtensions.includes(ext)) {
    return 'text';
  }
  return 'unsupported';
};

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  files,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  customRenderers = [],
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [, setTotalPages] = useState(1); // PDF 总页数,由 PdfRenderer 更新

  // 标准化文件输入
  const normalizedFiles = useMemo(() => normalizeFiles(files), [files]);

  const currentFile = normalizedFiles[currentIndex];

  // 检查是否有自定义渲染器匹配当前文件
  const customRenderer = useMemo(() => {
    if (!currentFile) return null;
    return customRenderers.find(renderer => renderer.test(currentFile));
  }, [currentFile, customRenderers]);

  const fileType = currentFile ? getFileType(currentFile) : 'unsupported';

  // 重置状态当文件改变时
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setCurrentPage(1);
    setTotalPages(1);
  }, [currentIndex]);

  // 键盘导航
  // 锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      // 保存原始的 overflow 值
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // 获取滚动条宽度
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // 锁定滚动并补偿滚动条宽度
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        // 恢复原始值
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate?.(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < normalizedFiles.length - 1) {
        onNavigate?.(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, normalizedFiles.length, onClose, onNavigate]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => prev - 90);
  }, []);

  const handleFitToWidth = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const handleOriginalSize = useCallback(() => {
    setZoom(1);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const handleDownload = useCallback(() => {
    if (!currentFile) return;
    const link = document.createElement('a');
    link.href = currentFile.url;
    link.download = currentFile.name;
    link.click();
  }, [currentFile]);

  if (!isOpen || !currentFile) return null;

  const showZoomControls = fileType === 'image' || fileType === 'pdf';
  const showRotateControl = fileType === 'image';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden"
          onClick={onClose}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* 主内容区域 */}
          <div
            className="relative w-full h-full flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部工具栏 */}
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="absolute top-0 left-0 right-0 z-10 p-4"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between bg-black/40 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/10">
                {/* 文件名 */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-medium text-lg truncate">
                    {currentFile.name}
                  </h2>
                  <p className="text-white/60 text-sm">
                    {currentIndex + 1} / {normalizedFiles.length}
                  </p>
                </div>

                {/* 工具按钮 */}
                <div className="flex items-center gap-2 ml-4">
                  {showZoomControls && (
                    <>
                      <ToolbarButton
                        icon={<ZoomOut className="w-5 h-5" />}
                        label="缩小"
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.5}
                      />
                      <span className="text-white/70 text-sm min-w-[4rem] text-center font-medium">
                        {Math.round(zoom * 100)}%
                      </span>
                      <ToolbarButton
                        icon={<ZoomIn className="w-5 h-5" />}
                        label="放大"
                        onClick={handleZoomIn}
                        disabled={zoom >= 5}
                      />
                      <div className="w-px h-6 bg-white/20 mx-2" />
                      <ToolbarButton
                        icon={<Minimize2 className="w-5 h-5" />}
                        label="适应窗口"
                        onClick={handleFitToWidth}
                      />
                      <ToolbarButton
                        icon={<Maximize2 className="w-5 h-5" />}
                        label="原始尺寸"
                        onClick={handleOriginalSize}
                      />
                      <div className="w-px h-6 bg-white/20 mx-2" />
                    </>
                  )}

                  {showRotateControl && (
                    <>
                      <ToolbarButton
                        icon={<RotateCcw className="w-5 h-5" />}
                        label="向左旋转"
                        onClick={handleRotateLeft}
                      />
                      <ToolbarButton
                        icon={<RotateCw className="w-5 h-5" />}
                        label="向右旋转"
                        onClick={handleRotate}
                      />
                      <div className="w-px h-6 bg-white/20 mx-2" />
                    </>
                  )}

                  {(showZoomControls || showRotateControl) && (
                    <>
                      <ToolbarButton
                        icon={<RefreshCw className="w-5 h-5" />}
                        label="复原"
                        onClick={handleReset}
                      />
                      <div className="w-px h-6 bg-white/20 mx-2" />
                    </>
                  )}

                  <ToolbarButton
                    icon={<Download className="w-5 h-5" />}
                    label="下载"
                    onClick={handleDownload}
                  />

                  <div className="w-px h-6 bg-white/20 mx-2" />

                  <ToolbarButton
                    icon={<X className="w-5 h-5" />}
                    label="关闭"
                    onClick={onClose}
                  />
                </div>
              </div>
            </motion.div>

            {/* 内容区域 */}
            <div className="flex-1 flex items-center justify-center pt-24 pb-8 overflow-auto">
              {customRenderer ? (
                // 使用自定义渲染器
                customRenderer.render(currentFile)
              ) : (
                <>
                  {fileType === 'image' && (
                    <ImageRenderer
                      url={currentFile.url}
                      zoom={zoom}
                      rotation={rotation}
                      onZoomChange={handleZoomChange}
                    />
                  )}
                  {fileType === 'pdf' && (
                    <PdfRenderer
                      url={currentFile.url}
                      zoom={zoom}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      onTotalPagesChange={setTotalPages}
                    />
                  )}
                  {fileType === 'docx' && <DocxRenderer url={currentFile.url} />}
                  {fileType === 'xlsx' && <XlsxRenderer url={currentFile.url} />}
                  {fileType === 'pptx' && <PptxRenderer url={currentFile.url} />}
                  {fileType === 'video' && <VideoRenderer url={currentFile.url} />}
                  {fileType === 'audio' && (
                    <AudioRenderer url={currentFile.url} fileName={currentFile.name} />
                  )}
                  {fileType === 'markdown' && <MarkdownRenderer url={currentFile.url} />}
                  {fileType === 'text' && (
                    <TextRenderer url={currentFile.url} fileName={currentFile.name} />
                  )}
                  {fileType === 'unsupported' && (
                    <UnsupportedRenderer
                      fileName={currentFile.name}
                      fileType={currentFile.type}
                      onDownload={handleDownload}
                    />
                  )}
                </>
              )}
            </div>

            {/* 左右导航箭头 */}
            {normalizedFiles.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <motion.button
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    onClick={() => onNavigate?.(currentIndex - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-2xl"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>
                )}

                {currentIndex < normalizedFiles.length - 1 && (
                  <motion.button
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    onClick={() => onNavigate?.(currentIndex + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-2xl"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 使用 Portal 将模态框渲染到 document.body
  return createPortal(modalContent, document.body);
};

// 工具栏按钮组件
interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-2 rounded-lg transition-all ${disabled
        ? 'text-white/30 cursor-not-allowed'
        : 'text-white hover:bg-white/10 active:bg-white/20'
        }`}
    >
      {icon}
    </button>
  );
};

