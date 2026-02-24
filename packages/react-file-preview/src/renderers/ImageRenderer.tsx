import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ImageRendererProps {
  url: string;
  zoom: number;
  rotation: number;
  onZoomChange?: (zoom: number) => void;
  onNaturalWidthChange?: (width: number) => void;
  onNaturalHeightChange?: (height: number) => void;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({
  url,
  zoom,
  rotation,
  onZoomChange,
  onNaturalWidthChange,
  onNaturalHeightChange
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [internalZoom, setInternalZoom] = useState(1); // 内部缩放状态
  const imgRef = useRef<HTMLImageElement>(null);
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

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    const img = e.currentTarget;
    onNaturalWidthChange?.(img.naturalWidth);
    onNaturalHeightChange?.(img.naturalHeight);
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
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setInternalZoom(prev => {
      const newZoom = Math.max(0.01, Math.min(10, prev + delta)); // 限制缩放范围 0.01-10
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
      className="rfp-flex rfp-items-center rfp-justify-center rfp-w-full rfp-h-full rfp-overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {!loaded && !error && (
        <div className="rfp-flex rfp-items-center rfp-justify-center">
          <div className="rfp-w-12 rfp-h-12 rfp-border-4 rfp-border-white/20 rfp-border-t-white rfp-rounded-full rfp-animate-spin" />
        </div>
      )}

      {error && (
        <div className="rfp-text-white/70 rfp-text-center">
          <p className="rfp-text-lg">{error}</p>
        </div>
      )}

      <motion.img
        ref={imgRef}
        src={url}
        alt="Preview"
        className={`rfp-max-w-none rfp-select-none ${!loaded ? 'rfp-hidden' : ''}`}
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
