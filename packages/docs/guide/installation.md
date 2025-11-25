# 安装

## 环境要求

- React >= 18.0.0
- React DOM >= 18.0.0

## 包管理器安装

::: code-group

```bash [pnpm]
pnpm add @eternalheart/react-file-preview
```

```bash [npm]
npm install @eternalheart/react-file-preview
```

```bash [yarn]
yarn add @eternalheart/react-file-preview
```

:::

## 导入样式

在你的应用入口文件中导入样式：

```tsx
import '@eternalheart/react-file-preview/style.css'
```

## PDF 支持配置（可选）

组件已内置 PDF.js worker 配置，会自动尝试从以下位置加载：

1. 本地 `/pdf.worker.min.mjs`（如果存在）
2. CDN（自动降级）

如果你想使用本地 worker 以获得更好的性能，可以将 worker 文件复制到 public 目录：

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

::: tip
如果不复制 worker 文件，组件会自动使用 CDN 加载，无需额外配置。
:::

## 验证安装

创建一个简单的示例来验证安装：

```tsx
import { useState } from 'react'
import { FilePreviewModal } from '@eternalheart/react-file-preview'
import '@eternalheart/react-file-preview/style.css'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开预览</button>
      <FilePreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        files={[
          { url: 'https://via.placeholder.com/800', name: 'test.png' }
        ]}
        currentIndex={0}
      />
    </div>
  )
}

export default App
```

## 下一步

- [基础用法](./basic-usage) - 学习如何使用组件
- [支持的文件类型](./supported-types) - 查看所有支持的文件格式

