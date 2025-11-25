import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText } from 'lucide-react';

interface TextRendererProps {
  url: string;
  fileName: string;
}

const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    json: 'json',
    xml: 'xml',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    conf: 'nginx',
    md: 'markdown',
    txt: 'text',
  };
  return languageMap[ext] || 'text';
};

export const TextRenderer: React.FC<TextRendererProps> = ({ url, fileName }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const language = getLanguageFromFileName(fileName);

  useEffect(() => {
    const loadText = async () => {
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
        setError('文本文件加载失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadText();
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
      <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {/* 文件头部 */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
          <FileText className="w-5 h-5 text-white/70" />
          <span className="text-white font-medium">{fileName}</span>
          <span className="ml-auto text-xs text-white/50 uppercase">{language}</span>
        </div>

        {/* 代码内容 */}
        <div className="text-sm">
          {language === 'text' ? (
            <pre className="p-6 text-white/90 font-mono whitespace-pre-wrap break-words">
              {content}
            </pre>
          ) : (
            <SyntaxHighlighter
              language={language}
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
          )}
        </div>
      </div>
    </div>
  );
};

