import { useState, useEffect } from 'react';
import mammoth from 'mammoth';

interface DocxRendererProps {
  url: string;
}

export const DocxRenderer: React.FC<DocxRendererProps> = ({ url }) => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocx = async () => {
      setLoading(true);
      setError(null);
      setHtml('');

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('文件加载失败');
        }

        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtml(result.value);
      } catch (err) {
        console.error('Docx 解析错误:', err);
        setError('Word 文档解析失败');
      } finally {
        setLoading(false);
      }
    };

    loadDocx();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-white/70 text-center">
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-8">
      <div
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-12"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.6',
          color: '#333',
        }}
      />
    </div>
  );
};

