import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  url: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ url }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('加载失败');
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError('Markdown 文件加载失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
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
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ children }) => (
                <h1 className="text-4xl font-bold mb-4 text-white border-b border-white/20 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-3xl font-bold mb-3 text-white mt-8">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-2xl font-bold mb-2 text-white mt-6">{children}</h3>
              ),
              p: ({ children }) => <p className="text-white/90 mb-4 leading-relaxed">{children}</p>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-white/90">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-white/90">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-white/80 my-4">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-white/20">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-white/20 px-4 py-2 bg-white/10 text-white font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-white/20 px-4 py-2 text-white/90">{children}</td>
              ),
              hr: () => <hr className="border-white/20 my-6" />,
              img: ({ src, alt }) => (
                <img src={src} alt={alt} className="rounded-lg max-w-full h-auto my-4" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

