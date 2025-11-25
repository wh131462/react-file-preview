import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface AudioRendererProps {
  url: string;
  fileName: string;
}

export const AudioRenderer: React.FC<AudioRendererProps> = ({ url, fileName }) => {
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => setIsPlaying(false);
    const handleCanPlay = () => updateDuration();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    // 立即尝试获取时长
    if (audio.readyState >= 1) {
      updateDuration();
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleError = () => {
    setError('音频加载失败');
  };

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
    <div className="flex flex-col items-center justify-center w-full h-full p-8 gap-8">
      {/* 音频封面 */}
      <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-2xl backdrop-blur-xl">
        <Music className="w-32 h-32 text-white" />
      </div>

      {/* 文件名 */}
      <div className="text-white text-center max-w-md">
        <p className="text-2xl font-medium mb-1">{fileName}</p>
        <p className="text-sm text-white/60">音频文件</p>
      </div>

      {/* 播放控制器 */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        {/* 进度条 */}
        <div className="mb-4">
          <div className="relative h-4 flex items-center">
            {/* 进度条背景轨道 */}
            <div className="absolute w-full h-[6px] bg-white/20 rounded-full" />
            {/* 已播放进度覆盖层 */}
            <div
              className="absolute h-[6px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100 ease-linear pointer-events-none"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : (currentTime > 100 ? 100 : currentTime)}%`
              }}
            />
            {/* 进度条滑块 */}
            <input
              type="range"
              min="0"
              max={duration > 0 ? duration : 100 + (currentTime > 100 ? currentTime % 100 : 0)}
              value={currentTime}
              onChange={handleSeek}
              className="audio-slider absolute w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-3">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => skip(-10)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105 flex items-center justify-center text-white transition-all shadow-lg"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>

          <button
            onClick={() => skip(10)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* 音量控制 */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="text-white/80 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="flex-1 relative h-3 flex items-center">
            {/* 音量条背景轨道 */}
            <div className="absolute w-full h-[4px] bg-white/20 rounded-full" />
            {/* 音量覆盖层 */}
            <div
              className="absolute h-[4px] bg-purple-500 rounded-full transition-all duration-100 pointer-events-none"
              style={{
                width: `${(isMuted ? 0 : volume) * 100}%`
              }}
            />
            {/* 音量滑块 */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider absolute w-full"
            />
          </div>
        </div>
      </div>

      {/* 隐藏的 audio 元素 */}
      <audio
        ref={audioRef}
        src={url}
        onError={handleError}
        className="hidden"
      />
    </div>
  );
};

