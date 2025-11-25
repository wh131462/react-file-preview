import { FileQuestion, Download } from 'lucide-react';

interface UnsupportedRendererProps {
  fileName: string;
  fileType: string;
  onDownload: () => void;
}

export const UnsupportedRenderer: React.FC<UnsupportedRendererProps> = ({
  fileName,
  fileType,
  onDownload,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 gap-6">
      <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
        <FileQuestion className="w-16 h-16 text-white/70" />
      </div>

      <div className="text-white text-center">
        <p className="text-xl font-medium mb-2">{fileName}</p>
        <p className="text-white/70">不支持预览此文件类型 ({fileType})</p>
      </div>

      <button
        onClick={onDownload}
        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium transition-all"
      >
        <Download className="w-5 h-5" />
        下载文件查看
      </button>
    </div>
  );
};

