import React, { useState, useRef, useCallback } from 'react';
import { ChapterMark } from '../types/player';
import { formatTimecode, formatStandardTime } from '../data/presets';

interface TactileTimelineProps {
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  fps: number;
  chapters: ChapterMark[];
  onSeek: (seconds: number) => void;
}

export const TactileTimeline: React.FC<TactileTimelineProps> = ({
  currentTime,
  duration,
  bufferedEnd,
  fps,
  chapters,
  onSeek,
}) => {
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  const safeDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));
  const bufferedPercent = Math.min(100, Math.max(0, (bufferedEnd / safeDuration) * 100));

  const calculateSeekTime = useCallback(
    (clientX: number) => {
      if (!barRef.current) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;
      return percentage * safeDuration;
    },
    [safeDuration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const newTime = calculateSeekTime(e.clientX);
    onSeek(newTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    setHoverPosition(pct * 100);
    setHoverTime(pct * safeDuration);

    if (isDragging) {
      const newTime = calculateSeekTime(e.clientX);
      onSeek(newTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (e.key === 'ArrowLeft') delta = e.shiftKey ? -0.1 : -5;
    else if (e.key === 'ArrowRight') delta = e.shiftKey ? 0.1 : 5;
    else if (e.key === 'Home') {
      e.preventDefault();
      onSeek(0);
      return;
    } else if (e.key === 'End') {
      e.preventDefault();
      onSeek(safeDuration);
      return;
    } else {
      return;
    }

    e.preventDefault();
    const target = Math.max(0, Math.min(safeDuration, currentTime + delta));
    onSeek(target);
  };

  return (
    <div className="w-full select-none">
      {/* Upper Timeline Ribbon: Timecode & Chapter Readout */}
      <div className="flex items-center justify-between text-xs mb-1.5 font-mono-numbers px-1">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-semibold text-sm glow-amber">
            {formatTimecode(currentTime, fps)}
          </span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">
            {formatTimecode(duration, fps)}
          </span>
        </div>

        <div className="text-slate-400 text-xs hidden sm:flex items-center gap-1.5">
          <span className="text-slate-500">REMAINING:</span>
          <span className="text-slate-300 font-mono-numbers">
            -{formatStandardTime(Math.max(0, duration - currentTime))}
          </span>
        </div>
      </div>

      {/* Interactive Track Container (Minimum 44px touch target height via py-3) */}
      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label="Video seek scrubber"
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(currentTime)}
        aria-valuetext={formatTimecode(currentTime, fps)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        className="relative py-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
      >
        {/* Recessed Machine Groove Track */}
        <div className="relative h-3 w-full bg-[#0a0d14] rounded-full overflow-hidden border border-[#222a3a] shadow-inner">
          
          {/* Subtle Decorative Tick Marks in Groove (every 10%) */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-25" aria-hidden="true">
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className="w-[1px] h-full bg-slate-500" />
            ))}
          </div>

          {/* Buffered Track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#253247]/70 transition-all duration-150"
            style={{ width: `${bufferedPercent}%` }}
            aria-hidden="true"
          />

          {/* Played Progress Track (Amber Phosphor Laser with Glow) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-l-full shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />

          {/* Chapter Notch Indicators */}
          {chapters.map((ch, idx) => {
            const chPct = (ch.time / safeDuration) * 100;
            if (chPct <= 0 || chPct >= 100) return null;
            return (
              <div
                key={idx}
                className="absolute top-0 bottom-0 w-[2px] bg-cyan-400/80 z-10 pointer-events-none shadow-[0_0_4px_#22d3ee]"
                style={{ left: `${chPct}%` }}
                title={ch.label}
              />
            );
          })}
        </div>

        {/* Playhead Needle / Scrub Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-[#d1d5db] rounded-[3px] border-2 border-[#121620] shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none transition-transform duration-75 flex items-center justify-center group-hover:scale-110 group-focus-visible:ring-2 ring-amber-400"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="w-[2px] h-3 bg-amber-500 rounded-full" />
        </div>

        {/* Hover Scrub Preview Tooltip */}
        {hoverPosition !== null && (
          <div
            className="absolute -top-10 -translate-x-1/2 pointer-events-none z-30 px-2 py-1 rounded bg-[#0b0e14]/95 border border-amber-500/40 text-amber-300 text-[11px] font-mono-numbers shadow-xl backdrop-blur-md"
            style={{ left: `${hoverPosition}%` }}
          >
            <span>{formatTimecode(hoverTime, fps)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
