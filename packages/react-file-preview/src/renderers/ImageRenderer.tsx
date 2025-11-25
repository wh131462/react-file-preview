import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ImageRendererProps {
  url: string;
  zoom: number;
  rotation: number;
  onZoomChange?: (zoom: number) => void;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({
  url,
  zoom,
  rotation,
  onZoomChange
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [internalZoom, setInternalZoom] = useState(1); // 内部缩放状态
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(false);
    setError(null);
    setPosition({ x: 0, y: 0 });
    setInternalZoom(1);
  }, [url]);

  // 当外部 zoom 改变时,同步内部 zoom
  useEffect(() => {
    setInternalZoom(zoom);
  }, [zoom]);

  // 重置位置当缩放或旋转改变时
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [zoom, rotation]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError('图片加载失败');
    setLoaded(true);
  };

  const handleDoubleClick = () => {
    // 双击重置位置
    setPosition({ x: 0, y: 0 });
  };

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setInternalZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(5, prev + delta)); // 限制缩放范围 0.5-5
      // 同步缩放比例到父组件
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
      return newZoom;
    });
  }, [onZoomChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只响应左键
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {!loaded && !error && (
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-white/70 text-center">
          <p className="text-lg">{error}</p>
        </div>
      )}

      <motion.img
        src={url}
        alt="Preview"
        className={`max-w-none select-none ${!loaded ? 'hidden' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${internalZoom}) rotate(${rotation}deg)`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onLoad={handleLoad}
        onError={handleError}
        onDoubleClick={handleDoubleClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        draggable={false}
      />
    </div>
  );
};

