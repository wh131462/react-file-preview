# 自定义渲染器

自定义渲染器允许你为特定的文件类型提供自定义的预览实现。

## 基本概念

自定义渲染器是一个对象，包含两个属性：

- `test`: 一个函数，用于判断是否应该使用该渲染器
- `render`: 一个 React 组件，用于渲染文件预览

## 类型定义

```tsx
interface CustomRenderer {
  test: (file: PreviewFile) => boolean
  render: (file: PreviewFile) => React.ReactNode
}
```

## 基本示例

```tsx
import { FilePreviewModal, CustomRenderer, PreviewFile } from '@eternalheart/react-file-preview'

const customRenderers: CustomRenderer[] = [
  {
    // 判断是否使用该渲染器
    test: (file: PreviewFile) => {
      return file.name.endsWith('.custom')
    },
    // 渲染预览内容
    render: (file: PreviewFile) => {
      return (
        <div className="custom-preview">
          <h2>自定义文件预览</h2>
          <p>文件名: {file.name}</p>
        </div>
      )
    }
  }
]

function App() {
  return (
    <FilePreviewModal
      isOpen={true}
      onClose={() => {}}
      files={files}
      currentIndex={0}
      customRenderers={customRenderers}
    />
  )
}
```

## 高级示例

### 自定义 JSON 查看器

```tsx
import { useState, useEffect } from 'react'

function JsonViewer({ url }: { url: string }) {
  const [content, setContent] = useState<string>('加载中...')

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(json => setContent(JSON.stringify(json, null, 2)))
      .catch(err => setContent(`加载失败: ${err.message}`))
  }, [url])

  return (
    <div className="w-full h-full p-8 overflow-auto">
      <pre className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
        {content}
      </pre>
    </div>
  )
}

const jsonRenderer: CustomRenderer = {
  test: (file) => file.name.endsWith('.json'),
  render: (file) => <JsonViewer url={file.url} />,
}
```

### 自定义 CSV 表格查看器

```tsx
import { useState, useEffect } from 'react'

function CsvViewer({ url }: { url: string }) {
  const [rows, setRows] = useState<string[][]>([])

  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n')
        const data = lines.map(line => line.split(','))
        setRows(data)
      })
  }, [url])

  return (
    <div className="w-full h-full p-8 overflow-auto">
      <table className="border-collapse border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-100">
            {rows[0]?.map((cell, i) => (
              <th key={i} className="border border-gray-300 px-4 py-2 font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-300 px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const csvRenderer: CustomRenderer = {
  test: (file) => file.name.endsWith('.csv'),
  render: (file) => <CsvViewer url={file.url} />,
}
```

## 渲染器优先级

自定义渲染器的优先级高于内置渲染器。渲染器按照数组顺序进行测试，第一个匹配的渲染器将被使用。

```tsx
const customRenderers = [
  // 这个会先被测试
  { test: (file) => file.name.endsWith('.txt'), render: CustomTextRenderer },
  // 如果上面的不匹配，才会测试这个
  { test: (file) => file.name.endsWith('.log'), render: LogRenderer }
]
```

## 访问文件内容

所有文件都通过 `file.url` 访问，这个 URL 可能是：
- HTTP/HTTPS URL（远程文件）
- Blob URL（本地 File 对象）
- Data URL（Base64 编码）

### 读取文本内容

```tsx
function TextViewer({ url }: { url: string }) {
  const [content, setContent] = useState<string>('加载中...')

  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(setContent)
      .catch(err => setContent(`加载失败: ${err.message}`))
  }, [url])

  return <div>{content}</div>
}
```

### 读取 JSON 内容

```tsx
function JsonViewer({ url }: { url: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(err))
  }, [url])

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

### 读取二进制内容

```tsx
function BinaryViewer({ url }: { url: string }) {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(setBuffer)
  }, [url])

  return <div>文件大小: {buffer?.byteLength} 字节</div>
}
```

## 样式建议

建议为自定义渲染器添加适当的样式，以保持与内置渲染器的一致性：

```css
.custom-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: auto;
}
```

## 下一步

- [主题定制](./theming) - 了解如何自定义组件样式
- [API 参考](../api/components) - 查看完整的 API 文档

