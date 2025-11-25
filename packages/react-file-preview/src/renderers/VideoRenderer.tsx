import { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type VideoJsPlayer = ReturnType<typeof videojs>;

interface VideoRendererProps {
  url: string;
}

// 根据 URL 获取视频 MIME 类型
const getVideoType = (url: string): string => {
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
  const typeMap: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime', // MOV 使用 QuickTime MIME 类型
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    m4v: 'video/mp4',
    '3gp': 'video/3gpp',
    flv: 'video/x-flv',
  };
  return typeMap[ext] || 'video/mp4';
};

export const VideoRenderer: React.FC<VideoRendererProps> = ({ url }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);

  useEffect(() => {
    // 确保 Video.js 播放器只初始化一次
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-apple');
      videoRef.current.appendChild(videoElement);

      const videoType = getVideoType(url);

      // 为 MOV 格式提供多个 MIME 类型作为备用
      const sources = videoType === 'video/quicktime'
        ? [
          { src: url, type: 'video/quicktime' },
          { src: url, type: 'video/mp4' } // 备用方案
        ]
        : [{ src: url, type: videoType }];

      const player = videojs(videoElement, {
        controls: true,
        responsive: true,
        fluid: true,
        preload: 'auto',
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            'remainingTimeDisplay',
            'fullscreenToggle'
          ],
          volumePanel: {
            inline: false
          }
        },
        html5: {
          vhs: {
            overrideNative: true
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false
        },
        sources
      });

      // 监听加载完成
      player.on('loadeddata', () => {
        setIsLoading(false);
      });

      player.on('error', () => {
        const error = player.error();
        console.error('Video.js error:', error);
        setError(`视频加载失败: ${error?.message || '未知错误'}`);
        setIsLoading(false);
      });

      playerRef.current = player;
    }
  }, [url]);

  // 清理函数
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white/90 mb-2">视频加载失败</p>
          <p className="text-sm text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div className="w-full max-w-5xl relative">
        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl z-10">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-sm text-white/70 font-medium">加载视频中...</p>
            </div>
          </div>
        )}

        {/* 视频播放器容器 */}
        <div
          ref={videoRef}
          className="overflow-hidden"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        />
      </div>
    </div>
  );
};

