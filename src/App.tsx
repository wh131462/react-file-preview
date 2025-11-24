import { useState, useRef } from 'react';
import { FilePreviewModal } from './FilePreviewModal';
import { PreviewFile, PreviewFileInput } from './types';
import { FileText, Image, FileSpreadsheet, Video, Music, Upload, X, Package, BookOpen, Code } from 'lucide-react';
import packageJson from '../package.json';

function App() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<PreviewFile[]>([]);
  const [allFiles, setAllFiles] = useState<PreviewFileInput[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = (index: number) => {
    setCurrentFileIndex(index);
    setIsPreviewOpen(true);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (type.includes('pdf')) return <FileText className="w-8 h-8" />;
    if (type.includes('spreadsheet')) return <FileSpreadsheet className="w-8 h-8" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (type.startsWith('audio/')) return <Music className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: PreviewFile[] = Array.from(files).map((file, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
      size: file.size,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setAllFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    processFiles(files);

    // 清空 input 以允许重复上传同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 只有当离开整个拖拽区域时才设置为 false
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        // 释放 blob URL
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter((f) => f.id !== fileId);
    });
    setAllFiles((prev) => prev.filter((f) => {
      if (typeof f === 'string') return true;
      if (f instanceof File) return true;
      return f.id !== fileId;
    }));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 导航栏 */}
      <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">React File Preview</h1>
                <p className="text-xs text-gray-400">v{packageJson.version}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/wh131462/react-file-preview"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105"
              >
                <Code className="w-5 h-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a
                href="https://www.npmjs.com/package/@eternalheart/react-file-preview"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105"
              >
                <Package className="w-5 h-5" />
                <span className="hidden sm:inline">npm</span>
              </a>
              <a
                href="#api-docs"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all hover:scale-105 hover:shadow-lg"
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline">API Docs</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            文件预览演示
          </h2>
          <p className="text-gray-400 text-lg">
            支持 20+ 种文件格式的现代化预览组件
          </p>
        </div>

        {/* 文件上传区域 */}
        <div className="max-w-6xl mx-auto mb-12">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed transition-all ${isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-105'
              : 'border-white/20 hover:border-white/40'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,audio/*,.pdf,.docx,.xlsx,.pptx,.ppt,.md,.txt,.js,.jsx,.ts,.tsx,.json,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.html,.css,.xml,.yaml,.yml,.mp4,.webm,.ogg,.ogv,.mov,.avi,.mkv,.m4v,.3gp,.flv"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 transition-transform ${isDragging ? 'scale-110' : ''
                }`}>
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white text-xl font-medium mb-2">
                {isDragging ? '松开以上传文件' : '上传本地文件预览'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {isDragging ? '将文件拖放到此处' : '支持图片、PDF、Word、Excel、视频、音频等格式'}
              </p>
              {!isDragging && (
                <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:scale-105 transition-all">
                  选择文件或拖拽到此处
                </div>
              )}
            </label>
          </div>
        </div>

        {/* 已上传的文件列表 */}
        {uploadedFiles.length > 0 && (
          <div className="max-w-6xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">已上传的文件</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedFiles.map((file, index) => {
                return (
                  <div
                    key={file.id}
                    className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    <button
                      onClick={() => handleFileClick(index)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 text-white group-hover:scale-110 transition-transform">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-lg mb-2 truncate">
                            {file.name}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </p>
                          {file.size && (
                            <p className="text-gray-500 text-xs mt-1">
                              {formatFileSize(file.size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 text-green-400 text-sm font-medium group-hover:text-green-300">
                        点击预览 →
                      </div>
                    </button>

                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.id);
                      }}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                      title="删除文件"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* API 文档 */}
      <div id="api-docs" className="max-w-6xl mx-auto mt-24 mb-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            API 参考文档
          </h2>

          <div className="space-y-8">
            {/* Props 表格 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">FilePreviewModal Props</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-4 text-gray-300 font-medium">属性</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">类型</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">必填</th>
                      <th className="py-3 px-4 text-gray-300 font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-400">
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-blue-400">files</td>
                      <td className="py-3 px-4 font-mono text-sm">PreviewFileInput[]</td>
                      <td className="py-3 px-4">✅</td>
                      <td className="py-3 px-4">文件列表（支持 File 对象、文件对象或 URL 字符串）</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-blue-400">currentIndex</td>
                      <td className="py-3 px-4 font-mono text-sm">number</td>
                      <td className="py-3 px-4">✅</td>
                      <td className="py-3 px-4">当前文件索引</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-blue-400">isOpen</td>
                      <td className="py-3 px-4 font-mono text-sm">boolean</td>
                      <td className="py-3 px-4">✅</td>
                      <td className="py-3 px-4">是否打开预览</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-blue-400">onClose</td>
                      <td className="py-3 px-4 font-mono text-sm">() =&gt; void</td>
                      <td className="py-3 px-4">✅</td>
                      <td className="py-3 px-4">关闭回调</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-blue-400">onNavigate</td>
                      <td className="py-3 px-4 font-mono text-sm">(index: number) =&gt; void</td>
                      <td className="py-3 px-4">❌</td>
                      <td className="py-3 px-4">导航回调</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 类型定义 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">支持的文件类型</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <pre className="text-gray-300">
                  {`// 1. 原生 File 对象
const file: File = ...;

// 2. 文件对象（包含 name, url, type）
interface PreviewFileLink {
  id?: string;
  name: string;      // 文件名
  type: string;      // MIME 类型
  url: string;       // 文件 URL
  size?: number;     // 文件大小（字节）
}

// 3. HTTP URL 字符串
const url: string = 'https://example.com/file.pdf';

// files 属性支持以上三种类型的混合数组
type PreviewFileInput = File | PreviewFileLink | string;`}
                </pre>
              </div>
            </div>

            {/* 使用示例 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">使用示例</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-gray-300">
                  {`import { FilePreviewModal } from '@eternalheart/react-file-preview';
import { useState } from 'react';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // 方式 1: 使用原生 File 对象
  const handleFileSelect = (file: File) => {
    setFiles([file]); // 直接传入 File 对象
    setCurrentIndex(0);
    setIsOpen(true);
  };

  // 方式 2: 使用 HTTP URL 字符串
  const files = [
    'https://example.com/image.jpg',
    'https://example.com/document.pdf',
  ];

  // 方式 3: 使用文件对象
  const files = [
    {
      name: 'presentation.pptx',
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      url: '/path/to/presentation.pptx',
    },
  ];

  // 方式 4: 混合使用
  const files = [
    file1,  // File 对象
    'https://example.com/image.jpg',  // URL 字符串
    { name: 'doc.pdf', type: 'application/pdf', url: '/doc.pdf' },  // 文件对象
  ];

  return (
    <FilePreviewModal
      files={files}
      currentIndex={currentIndex}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onNavigate={setCurrentIndex}
    />
  );
}`}
                </pre>
              </div>
            </div>

            {/* 支持的格式 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">支持的文件格式</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">📷 图片</h4>
                  <p className="text-gray-400 text-sm">JPG, PNG, GIF, WebP, SVG, BMP, ICO</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">🎬 视频</h4>
                  <p className="text-gray-400 text-sm">MP4, WebM, OGG, MOV, AVI, MKV</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">🎵 音频</h4>
                  <p className="text-gray-400 text-sm">MP3, WAV, OGG, M4A, AAC, FLAC</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">📄 文档</h4>
                  <p className="text-gray-400 text-sm">PDF, DOCX, XLSX, PPTX</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">📝 Markdown</h4>
                  <p className="text-gray-400 text-sm">MD, Markdown</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">💻 代码</h4>
                  <p className="text-gray-400 text-sm">JS, TS, Python, Java, C++, Go, 等 40+ 种语言</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="max-w-6xl mx-auto mt-12 mb-8 text-center">
        <div className="text-gray-400 text-sm">
          <p className="mb-2">
            Made with ❤️ by{' '}
            <a
              href="https://github.com/wh131462"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              EternalHeart
            </a>
          </p>
          <p>
            <a
              href="https://github.com/wh131462/react-file-preview/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400 transition-colors"
            >
              MIT License
            </a>
            {' '} · {' '}
            <a
              href="https://github.com/wh131462/react-file-preview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400 transition-colors"
            >
              GitHub
            </a>
            {' '} · {' '}
            <a
              href="https://www.npmjs.com/package/@eternalheart/react-file-preview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400 transition-colors"
            >
              npm
            </a>
          </p>
        </div>
      </footer>

      <FilePreviewModal
        files={allFiles}
        currentIndex={currentFileIndex}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onNavigate={setCurrentFileIndex}
      />
    </div>
  );
}

export default App;

