// 类型从 core 包导入并 re-export
export type {
  PreviewFile,
  PreviewFileLink,
  PreviewFileInput,
  FileType,
  PreviewState,
} from '@eternalheart/file-preview-core';

import type { PreviewFile } from '@eternalheart/file-preview-core';

// React 专属的 UI 类型
export interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// 自定义渲染器类型
export interface CustomRenderer {
  // 文件类型匹配函数
  test: (file: PreviewFile) => boolean;
  // 渲染组件
  render: (file: PreviewFile) => React.ReactNode;
}
