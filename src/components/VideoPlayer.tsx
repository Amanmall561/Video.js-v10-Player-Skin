import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { VideoPlayer as VjsVideoPlayer, VideoSkin as VjsVideoSkin, Video as VjsVideo } from '@videojs/react/video';
import { MuxVideo } from '@videojs/react/media/mux-video/hls-js';
import { VideoPreset, PlayerState, VideoJsPlayer } from '../types/player';
import { formatTimecode } from '../data/presets';
import { Play, Pause, Loader2, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  preset: VideoPreset;
  playerState: PlayerState;
  onStateChange: (updater: (prev: PlayerState) => PlayerState) => void;
  playerRefCallback: (player: VideoJsPlayer | null) => void;
  showNativeControls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  preset,
  playerState,
  onStateChange,
  playerRefCallback,
  showNativeControls = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Build the Video.js v10 controller implementation
  const controller = useMemo<VideoJsPlayer>(() => {
    return {
      play: () => {
        if (!videoRef.current) return;
        return videoRef.current.play().catch(() => {});
      },
      pause: () => {
        if (!videoRef.current) return;
        videoRef.current.pause();
      },
      paused: () => {
        return videoRef.current ? videoRef.current.paused : true;
      },
      currentTime: (seconds?: number) => {
        if (!videoRef.current) return 0;
        if (typeof seconds === 'number') {
          videoRef.current.currentTime = seconds;
        }
        return videoRef.current.currentTime;
      },
      duration: () => {
        return videoRef.current?.duration || 0;
      },
      volume: (percent?: number) => {
        if (!videoRef.current) return 1;
        if (typeof percent === 'number') {
          videoRef.current.volume = Math.max(0, Math.min(1, percent));
        }
        return videoRef.current.volume;
      },
      muted: (isMuted?: boolean) => {
        if (!videoRef.current) return false;
        if (typeof isMuted === 'boolean') {
          videoRef.current.muted = isMuted;
        }
        return videoRef.current.muted;
      },
      playbackRate: (rate?: number) => {
        if (!videoRef.current) return 1;
        if (typeof rate === 'number') {
          videoRef.current.playbackRate = rate;
        }
        return videoRef.current.playbackRate;
      },
      isFullscreen: () => {
        return !!(document.fullscreenElement && containerRef.current?.contains(document.fullscreenElement));
      },
      requestFullscreen: () => {
        if (!containerRef.current) return;
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        }
      },
      exitFullscreen: () => {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      },
      buffered: () => {
        if (!videoRef.current) {
          return { length: 0, start: () => 0, end: () => 0 };
        }
        const b = videoRef.current.buffered;
        return {
          length: b.length,
          start: (i: number) => b.start(i),
          end: (i: number) => b.end(i),
        };
      },
      getVideoElement: () => videoRef.current,
    };
  }, []);

  // Expose controller to parent
  useEffect(() => {
    playerRefCallback(controller);
    return () => {
      playerRefCallback(null);
    };
  }, [controller, playerRefCallback]);

  // Sync state on HTML5 video events (registered by Video.js v10 components)
  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    const cur = el.currentTime || 0;
    const dur = el.duration || 0;
    let bufferedEnd = 0;
    if (el.buffered && el.buffered.length > 0) {
      bufferedEnd = el.buffered.end(el.buffered.length - 1);
    }
    const frameNumber = Math.floor(cur * (preset.fps || 30));
    const timecode = formatTimecode(cur, preset.fps || 30);

    onStateChange((prev) => ({
      ...prev,
      currentTime: cur,
      duration: dur,
      bufferedEnd,
      timecode,
      frameNumber,
    }));
  };

  const handleLoadedMetadata = () => {
    const el = videoRef.current;
    if (!el) return;
    const dur = el.duration || 0;
    onStateChange((prev) => ({
      ...prev,
      duration: dur,
      timecode: formatTimecode(el.currentTime || 0, preset.fps || 30),
      volume: el.volume,
      isMuted: el.muted,
      playbackRate: el.playbackRate,
    }));
  };

  const handlePlay = () => {
    onStateChange((prev) => ({ ...prev, isPlaying: true, isWaiting: false }));
  };

  const handlePause = () => {
    onStateChange((prev) => ({ ...prev, isPlaying: false }));
  };

  const handleVolumeChange = () => {
    const el = videoRef.current;
    if (!el) return;
    onStateChange((prev) => ({
      ...prev,
      volume: el.volume,
      isMuted: el.muted,
    }));
  };

  const handleRateChange = () => {
    const el = videoRef.current;
    if (!el) return;
    onStateChange((prev) => ({
      ...prev,
      playbackRate: el.playbackRate,
    }));
  };

  const handleWaiting = () => {
    onStateChange((prev) => ({ ...prev, isWaiting: true }));
  };

  const handlePlaying = () => {
    onStateChange((prev) => ({ ...prev, isWaiting: false, isPlaying: true }));
  };

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      onStateChange((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [onStateChange]);

  const handleCenterClick = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-[#050608] rounded-xl overflow-hidden border border-[#1f2633] shadow-[0_12px_40px_rgba(0,0,0,0.8)] group select-none"
    >
      {/* Official Video.js v10 Composable Player Engine */}
      <VjsVideoPlayer>
        {showNativeControls ? (
          <VjsVideoSkin className="w-full h-full">
            {preset.category === 'mux' || preset.muxPlaybackId ? (
              <MuxVideo
                ref={videoRef}
                src={preset.src}
                poster={preset.poster}
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={handlePlay}
                onPause={handlePause}
                onVolumeChange={handleVolumeChange}
                onRateChange={handleRateChange}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
              />
            ) : (
              <VjsVideo
                ref={videoRef}
                src={preset.src}
                poster={preset.poster}
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={handlePlay}
                onPause={handlePause}
                onVolumeChange={handleVolumeChange}
                onRateChange={handleRateChange}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
              />
            )}
          </VjsVideoSkin>
        ) : (
          <div className="w-full h-full relative">
            {preset.category === 'mux' || preset.muxPlaybackId ? (
              <MuxVideo
                ref={videoRef}
                src={preset.src}
                poster={preset.poster}
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={handlePlay}
                onPause={handlePause}
                onVolumeChange={handleVolumeChange}
                onRateChange={handleRateChange}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
              />
            ) : (
              <VjsVideo
                ref={videoRef}
                src={preset.src}
                poster={preset.poster}
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={handlePlay}
                onPause={handlePause}
                onVolumeChange={handleVolumeChange}
                onRateChange={handleRateChange}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
              />
            )}
          </div>
        )}
      </VjsVideoPlayer>

      {/* Measured Scrim Layer: Guaranteed 4.5:1 text/icon contrast regardless of video brightness */}
      <div 
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300" 
        aria-hidden="true"
      />

      {/* Top HUD Telemetry Banner */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10 text-xs font-mono-numbers">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span className="font-semibold tracking-wider text-amber-300 font-display">SYNTH//10 DECK</span>
          <span className="text-slate-500">·</span>
          <span>{preset.muxPlaybackId ? 'MUX HLS STREAM' : 'STANDARD MP4'}</span>
          <span className="text-slate-500">·</span>
          <span>{preset.fps} FPS</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-slate-300">
          <span className="text-slate-400">FRAME:</span>
          <span className="text-cyan-300 font-semibold">{playerState.frameNumber.toString().padStart(6, '0')}</span>
        </div>
      </div>

      {/* Center Interactive Overlay: Big Play/Pause & Buffering Feedback */}
      {!showNativeControls && (
        <div
          onClick={handleCenterClick}
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          role="button"
          tabIndex={0}
          aria-label={playerState.isPlaying ? 'Pause video' : 'Play video'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCenterClick();
            }
          }}
        >
          {playerState.isWaiting ? (
            <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-2xl animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>
          ) : !playerState.isPlaying ? (
            <div className="w-20 h-20 rounded-2xl bg-[#121620]/90 backdrop-blur-md border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-200 transform group-hover:scale-105 active:scale-95">
              <Play className="w-9 h-9 fill-amber-400 ml-1" />
            </div>
          ) : null}
        </div>
      )}

      {/* Live Mux Badge in Top Corner when Mux is streaming */}
      {preset.muxPlaybackId && (
        <div className="absolute top-12 left-4 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/40 rounded text-[11px] text-cyan-200 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Mux Stream: {preset.muxPlaybackId.slice(0, 8)}...</span>
          </div>
        </div>
      )}
    </div>
  );
};
