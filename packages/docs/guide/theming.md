# 主题定制

React File Preview 提供了灵活的样式定制选项。

## CSS 变量

组件使用 CSS 变量来定义主题颜色和样式，你可以通过覆盖这些变量来自定义主题。

### 默认变量

```css
:root {
  --rfp-bg-color: rgba(0, 0, 0, 0.95);
  --rfp-text-color: #ffffff;
  --rfp-border-color: rgba(255, 255, 255, 0.1);
  --rfp-button-bg: rgba(255, 255, 255, 0.1);
  --rfp-button-hover-bg: rgba(255, 255, 255, 0.2);
  --rfp-button-active-bg: rgba(255, 255, 255, 0.3);
  --rfp-overlay-bg: rgba(0, 0, 0, 0.8);
}
```

### 自定义主题

创建一个自定义主题：

```css
/* 亮色主题 */
.light-theme {
  --rfp-bg-color: rgba(255, 255, 255, 0.98);
  --rfp-text-color: #000000;
  --rfp-border-color: rgba(0, 0, 0, 0.1);
  --rfp-button-bg: rgba(0, 0, 0, 0.05);
  --rfp-button-hover-bg: rgba(0, 0, 0, 0.1);
  --rfp-button-active-bg: rgba(0, 0, 0, 0.15);
  --rfp-overlay-bg: rgba(255, 255, 255, 0.9);
}

/* 蓝色主题 */
.blue-theme {
  --rfp-bg-color: #1a1f3a;
  --rfp-text-color: #e0e6ff;
  --rfp-border-color: rgba(96, 165, 250, 0.2);
  --rfp-button-bg: rgba(96, 165, 250, 0.1);
  --rfp-button-hover-bg: rgba(96, 165, 250, 0.2);
  --rfp-button-active-bg: rgba(96, 165, 250, 0.3);
  --rfp-overlay-bg: rgba(26, 31, 58, 0.9);
}
```

应用主题：

```tsx
<div className="light-theme">
  <FilePreviewModal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    files={files}
    currentIndex={0}
  />
</div>
```

## 自定义样式类

你可以通过 CSS 覆盖组件的默认样式：

```css
/* 自定义模态框样式 */
.file-preview-modal {
  border-radius: 12px;
}

/* 自定义工具栏 */
.file-preview-toolbar {
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
  padding: 1rem;
}

/* 自定义按钮 */
.file-preview-button {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.file-preview-button:hover {
  transform: scale(1.1);
}

/* 自定义导航按钮 */
.file-preview-nav-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
```

## Tailwind CSS 集成

如果你使用 Tailwind CSS，可以使用 `@apply` 指令：

```css
.file-preview-modal {
  @apply rounded-xl shadow-2xl;
}

.file-preview-toolbar {
  @apply bg-gradient-to-b from-black/80 to-transparent p-4;
}

.file-preview-button {
  @apply rounded-lg transition-all duration-200 hover:scale-110;
}
```

## 响应式设计

组件已经内置了响应式设计，但你可以进一步自定义：

```css
/* 移动设备 */
@media (max-width: 768px) {
  .file-preview-toolbar {
    padding: 0.5rem;
  }
  
  .file-preview-button {
    width: 36px;
    height: 36px;
  }
}

/* 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
  .file-preview-toolbar {
    padding: 0.75rem;
  }
}

/* 桌面设备 */
@media (min-width: 1025px) {
  .file-preview-toolbar {
    padding: 1rem;
  }
}
```

## 动画定制

自定义动画效果：

```css
/* 自定义淡入动画 */
.file-preview-modal {
  animation: customFadeIn 0.3s ease-out;
}

@keyframes customFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 自定义滑动动画 */
.file-preview-content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 暗色模式支持

支持系统暗色模式：

```css
@media (prefers-color-scheme: dark) {
  :root {
    --rfp-bg-color: rgba(0, 0, 0, 0.95);
    --rfp-text-color: #ffffff;
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --rfp-bg-color: rgba(255, 255, 255, 0.98);
    --rfp-text-color: #000000;
  }
}
```

## 完整示例

```tsx
import { FilePreviewModal } from '@eternalheart/react-file-preview'
import '@eternalheart/react-file-preview/style.css'
import './custom-theme.css'

function App() {
  const [theme, setTheme] = useState('dark')

  return (
    <div className={theme === 'light' ? 'light-theme' : 'dark-theme'}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
      <FilePreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        files={files}
        currentIndex={0}
      />
    </div>
  )
}
```

## 下一步

- [API 参考](../api/components) - 查看完整的 API 文档
- [类型定义](../api/types) - 了解所有类型定义

