// 导入样式
import './index.css';

// 导出主组件
export { FilePreviewModal } from './FilePreviewModal';

// 导出类型定义
export type {
  PreviewFile,
  PreviewFileLink,
  PreviewFileInput,
  FileType,
  ToolbarAction,
  PreviewState,
  CustomRenderer,
} from './types';

// 导出工具函数
export { normalizeFile, normalizeFiles } from './utils/fileNormalizer';

