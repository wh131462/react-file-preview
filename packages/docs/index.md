---
layout: home

hero:
  name: React File Preview
  text: 现代化的文件预览组件
  tagline: 支持图片、视频、音频、PDF、Office 文档、Markdown 和代码文件
  image:
    src: /icon.svg
    alt: React File Preview
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在线示例
      link: https://wh131462.github.io/react-file-preview/
    - theme: alt
      text: GitHub
      link: https://github.com/wh131462/react-file-preview

features:
  - icon: 🖼️
    title: 多格式支持
    details: 支持图片、视频、音频、PDF、Word、Excel、PowerPoint、Markdown 和代码文件等多种格式
  - icon: ⚡
    title: 高性能
    details: 基于 React 18 和现代浏览器 API，提供流畅的预览体验
  - icon: 🎨
    title: 可定制
    details: 支持自定义渲染器和主题，轻松适配你的应用风格
  - icon: 📱
    title: 响应式设计
    details: 完美适配桌面和移动设备，提供一致的用户体验
  - icon: 🔧
    title: 易于集成
    details: 简单的 API 设计，几行代码即可集成到你的 React 应用
  - icon: 📦
    title: TypeScript 支持
    details: 完整的 TypeScript 类型定义，提供更好的开发体验
---

## 快速开始

### 安装

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

### 基础用法

```tsx
import { FilePreviewModal } from '@eternalheart/react-file-preview'
import '@eternalheart/react-file-preview/style.css'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const files = [
    { url: 'https://example.com/document.pdf', name: 'document.pdf' }
  ]

  return (
    <>
      <button onClick={() => setIsOpen(true)}>预览文件</button>
      <FilePreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        files={files}
        currentIndex={0}
      />
    </>
  )
}
```

## 支持的文件类型

- **图片**: JPG, PNG, GIF, WebP, SVG, BMP, ICO
- **视频**: MP4, WebM, OGG
- **音频**: MP3, WAV, OGG, AAC
- **文档**: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), PowerPoint (PPT/PPTX)
- **文本**: Markdown, 代码文件 (支持语法高亮)

## 许可证

[MIT License](https://github.com/wh131462/react-file-preview/blob/main/LICENSE)

