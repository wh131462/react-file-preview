import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText } from 'lucide-react';

interface JsonRendererProps {
  url: string;
  fileName: string;
}

export const JsonRenderer: React.FC<JsonRendererProps> = ({ url, fileName }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJson = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        if (!response.ok) throw new Error('加载失败');
        const text = await response.text();
        // 格式化 JSON
        try {
          const parsed = JSON.parse(text);
          setContent(JSON.stringify(parsed, null, 2));
        } catch {
          // JSON 解析失败，按原文展示
          setContent(text);
        }
      } catch (err) {
        setError('JSON 文件加载失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJson();
  }, [url]);

  if (loading) {
    return (
      <div className="rfp-flex rfp-items-center rfp-justify-center rfp-w-full rfp-h-full">
        <div className="rfp-w-12 rfp-h-12 rfp-border-4 rfp-border-white/20 rfp-border-t-white rfp-rounded-full rfp-animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rfp-flex rfp-items-center rfp-justify-center rfp-w-full rfp-h-full">
        <div className="rfp-text-white/70 rfp-text-center">
          <p className="rfp-text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rfp-w-full rfp-h-full rfp-overflow-auto rfp-p-4 md:rfp-p-8">
      <div className="rfp-max-w-full md:rfp-max-w-6xl rfp-mx-auto rfp-bg-white/5 rfp-backdrop-blur-sm rfp-rounded-2xl rfp-border rfp-border-white/10 rfp-overflow-hidden">
        <div className="rfp-flex rfp-items-center rfp-gap-2 md:rfp-gap-3 rfp-px-4 rfp-py-3 md:rfp-px-6 md:rfp-py-4 rfp-bg-white/5 rfp-border-b rfp-border-white/10">
          <FileText className="rfp-w-4 rfp-h-4 md:rfp-w-5 md:rfp-h-5 rfp-text-white/70 rfp-flex-shrink-0" />
          <span className="rfp-text-white rfp-font-medium rfp-text-sm md:rfp-text-base rfp-truncate">{fileName}</span>
          <span className="rfp-ml-auto rfp-text-xs rfp-text-white/50 rfp-uppercase rfp-flex-shrink-0">JSON</span>
        </div>
        <div className="rfp-text-sm">
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              fontSize: '0.875rem',
            }}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: 'rgba(255, 255, 255, 0.3)',
              userSelect: 'none',
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};
