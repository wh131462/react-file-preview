// 链接对象类型
export interface PreviewFileLink {
  id?: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

// 内部使用的标准化文件类型
export interface PreviewFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

// 支持 File 对象、链接对象或 HTTP URL 字符串
export type PreviewFileInput = File | PreviewFileLink | string;

export type FileType =
  | 'image'
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'video'
  | 'audio'
  | 'markdown'
  | 'text'
  | 'unsupported';

export interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface PreviewState {
  zoom: number;
  rotation: number;
  currentPage: number;
  totalPages: number;
}

// 自定义渲染器类型
export interface CustomRenderer {
  // 文件类型匹配函数
  test: (file: PreviewFile) => boolean;
  // 渲染组件
  render: (file: PreviewFile) => React.ReactNode;
}

