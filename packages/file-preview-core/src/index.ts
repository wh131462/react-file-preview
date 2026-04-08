// 导出类型定义
export type {
  PreviewFile,
  PreviewFileLink,
  PreviewFileInput,
  FileType,
  PreviewState,
} from './types';

// 导出文件标准化工具
export {
  normalizeFile,
  normalizeFiles,
  getFileNameFromUrl,
  inferMimeType,
} from './utils/fileNormalizer';

// 导出文件类型识别 / 格式化工具
export {
  getFileType,
  getLanguageFromFileName,
  getVideoMimeType,
  formatFileSize,
  formatTime,
} from './utils/fileType';

// 导出 Excel 数据转换
export { convertWorkbookToSpreadsheetData } from './utils/excelDataConverter';

// 导出 PDF.js Worker 配置
export { configurePdfWorker } from './utils/pdfWorker';
export type { PdfWorkerOptions } from './utils/pdfWorker';
