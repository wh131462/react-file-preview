# 组件 API

## FilePreviewModal

主要的文件预览模态框组件。

### Props

#### files

- **类型**: `PreviewFileInput[]`
- **必需**: 是
- **描述**: 要预览的文件列表，支持三种输入格式：
  - `File` 对象（原生浏览器 File）
  - `PreviewFileLink` 对象（包含 name, url, type 等属性）
  - `string`（HTTP URL）

```tsx
// 方式 1: URL 字符串
const files1 = ['https://example.com/image.jpg']

// 方式 2: 文件对象
const files2 = [
  {
    name: 'document.pdf',
    url: '/files/doc.pdf',
    type: 'application/pdf'
  }
]

// 方式 3: File 对象
const files3 = [new File(['content'], 'text.txt')]

// 方式 4: 混合使用
const files4 = [
  'https://example.com/image.jpg',
  { name: 'doc.pdf', url: '/doc.pdf', type: 'application/pdf' },
  fileObject
]
```

#### currentIndex

- **类型**: `number`
- **必需**: 是
- **描述**: 当前显示的文件索引（从 0 开始）

```tsx
<FilePreviewModal currentIndex={0} ... />
```

#### isOpen

- **类型**: `boolean`
- **必需**: 是
- **描述**: 控制模态框的显示/隐藏状态

```tsx
<FilePreviewModal isOpen={true} ... />
```

#### onClose

- **类型**: `() => void`
- **必需**: 是
- **描述**: 关闭模态框时的回调函数

```tsx
<FilePreviewModal onClose={() => setIsOpen(false)} ... />
```

#### onNavigate

- **类型**: `(index: number) => void`
- **必需**: 否
- **描述**: 文件切换时的回调函数，参数为新的文件索引

```tsx
<FilePreviewModal
  onNavigate={(index) => {
    console.log('切换到文件:', index)
    setCurrentIndex(index)
  }}
  ...
/>
```

#### customRenderers

- **类型**: `CustomRenderer[]`
- **必需**: 否
- **描述**: 自定义渲染器数组，用于扩展或覆盖默认的文件渲染逻辑

每个 `CustomRenderer` 对象包含：
- `test: (file: PreviewFile) => boolean` - 文件匹配函数，返回 `true` 表示使用此渲染器
- `render: (file: PreviewFile) => React.ReactNode` - 渲染函数，返回要显示的 React 组件

自定义渲染器会优先于内置渲染器执行。如果多个自定义渲染器匹配同一文件，将使用第一个匹配的渲染器。

```tsx
import type { CustomRenderer } from '@eternalheart/react-file-preview'

const customRenderers: CustomRenderer[] = [
  {
    // 为 JSON 文件添加格式化显示
    test: (file) => file.name.endsWith('.json'),
    render: (file) => (
      <div className="p-8">
        <pre className="bg-gray-900 text-white p-4 rounded">
          <JsonViewer url={file.url} />
        </pre>
      </div>
    ),
  },
  {
    // 为特定 MIME 类型添加自定义渲染
    test: (file) => file.type === 'application/x-custom',
    render: (file) => <CustomFileViewer file={file} />,
  },
]

<FilePreviewModal
  customRenderers={customRenderers}
  ...
/>
```

### 完整示例

```tsx
import { useState } from 'react'
import { FilePreviewModal } from '@eternalheart/react-file-preview'
import type { PreviewFileInput } from '@eternalheart/react-file-preview'
import '@eternalheart/react-file-preview/style.css'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const files: PreviewFileInput[] = [
    'https://example.com/image.jpg',
    {
      name: 'document.pdf',
      url: 'https://example.com/document.pdf',
      type: 'application/pdf'
    }
  ]

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        打开预览
      </button>

      <FilePreviewModal
        files={files}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigate={setCurrentIndex}
      />
    </>
  )
}
```

## 渲染机制

### Portal 渲染

`FilePreviewModal` 使用 React Portal (`createPortal`) 将模态框渲染到 `document.body`，而不是在组件树的当前位置渲染。

**优势：**

- ✅ **最高层级**: 模态框的 `z-index` 设置为 `9999`，确保始终显示在页面最上层
- ✅ **样式隔离**: 不受父元素的 CSS 样式影响（如 `overflow: hidden`、`transform`、`filter` 等）
- ✅ **定位准确**: 模态框使用 `fixed` 定位相对于视口，不受父元素定位上下文影响
- ✅ **无需配置**: 开箱即用，无需担心层级和定位问题

**示例：**

```tsx
// 即使在复杂的嵌套结构中使用也没问题
<div style={{ position: 'relative', overflow: 'hidden', zIndex: 100 }}>
  <div style={{ transform: 'scale(0.9)' }}>
    <FilePreviewModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      files={files}
      currentIndex={0}
    />
  </div>
</div>
```

模态框会自动渲染到 `document.body`，完全不受上述样式影响。

## 功能特性

### 工具栏控制

根据文件类型，组件提供不同的工具栏控制：

#### 图片预览
- **缩放控制**: 放大/缩小按钮（步进 0.25，范围 0.5x - 5x）
- **旋转控制**: 顺时针/逆时针旋转（每次 90°）
- **拖拽移动**: 缩放后可拖拽图片
- **重置按钮**: 恢复到原始状态

#### PDF 预览
- **缩放控制**: 放大/缩小按钮（范围 0.5x - 5x）
- **页面导航**: 上一页/下一页按钮
- **页码显示**: 当前页/总页数
- **连续滚动**: 支持滚动浏览所有页面

#### Office 文档
- **Word (DOCX)**: 完整文档渲染
- **Excel (XLSX)**: 显示所有工作表
- **PowerPoint (PPTX)**: 显示所有幻灯片

#### 视频/音频
- 使用原生 HTML5 播放器
- 支持播放控制、音量调节、全屏等

#### Markdown
- 实时渲染 Markdown 内容
- 支持 GFM (GitHub Flavored Markdown)
- 支持表格、代码块、任务列表等

#### 代码文件
- 语法高亮显示（40+ 种语言）
- 自动检测语言类型
- VS Code Dark+ 主题

### 通用功能

- **文件导航**: 上一个/下一个文件按钮
- **下载功能**: 下载当前文件
- **关闭操作**: 关闭按钮、ESC 键、点击背景

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| `Escape` | 关闭预览 |
| `←` | 上一个文件 |
| `→` | 下一个文件 |

### 响应式设计

- **桌面端**: 完整工具栏和控制按钮
- **移动端**: 优化的触摸操作和简化的 UI
- **平板**: 介于两者之间的体验

### 滚动锁定

预览打开时自动锁定页面滚动，关闭后恢复，并自动处理滚动条宽度补偿。

## 下一步

- [类型定义](./types) - 查看所有类型定义
- [工具函数](./utils) - 了解可用的工具函数

