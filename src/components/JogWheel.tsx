import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, RotateCw, ChevronLeft, ChevronRight, FastForward, Rewind } from 'lucide-react';

interface JogWheelProps {
  currentTime: number;
  duration: number;
  fps: number;
  playbackRate: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  onStepFrame: (direction: 1 | -1) => void;
  onSetRate: (rate: number) => void;
  onPlayPauseToggle: () => void;
}

export const JogWheel: React.FC<JogWheelProps> = ({
  currentTime,
  duration,
  fps,
  playbackRate,
  isPlaying,
  onSeek,
  onStepFrame,
  onSetRate,
  onPlayPauseToggle,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  const frameDuration = 1 / (fps || 30);

  const getPointerAngle = (clientX: number, clientY: number): number => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const radians = Math.atan2(dy, dx);
    return (radians * 180) / Math.PI;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const angle = getPointerAngle(e.clientX, e.clientY);
    setLastAngle(angle);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || lastAngle === null) return;
    const currentAngle = getPointerAngle(e.clientX, e.clientY);
    let delta = currentAngle - lastAngle;

    // Normalize wrap around (-180 to 180)
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    setRotation((prev) => (prev + delta) % 360);
    setLastAngle(currentAngle);

    // Each 6 degrees of rotation = 1 frame
    const framesMoved = Math.round(delta / 6);
    if (framesMoved !== 0) {
      const timeDelta = framesMoved * frameDuration;
      const targetTime = Math.max(0, Math.min(duration, currentTime + timeDelta));
      onSeek(targetTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setLastAngle(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Keyboard navigation for wheel
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onStepFrame(-1);
      setRotation((prev) => (prev - 12) % 360);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onStepFrame(1);
      setRotation((prev) => (prev + 12) % 360);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-3.5 bg-[#0f1218] rounded-xl border border-[#232b38] shadow-lg select-none">
      
      {/* Header Label */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono-numbers text-slate-400 mb-2 border-b border-white/5 pb-1">
        <span className="font-display font-semibold text-amber-400/90 tracking-wider">
          PRECISION JOG / SHUTTLE
        </span>
        <span className="text-slate-500">1 FRAME = 6° ROT</span>
      </div>

      {/* Main Rotary Wheel Section */}
      <div className="flex items-center gap-4 my-1">
        {/* Step -1 Frame Button */}
        <button
          type="button"
          onClick={() => {
            onStepFrame(-1);
            setRotation((prev) => (prev - 12) % 360);
          }}
          className="flex flex-col items-center justify-center w-11 h-12 rounded-lg bg-[#181d27] border border-[#2c3749] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 active:translate-y-0.5 active:bg-[#121620] transition-all shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title="Step backward 1 frame"
          aria-label="Step backward 1 frame"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[9px] font-mono-numbers mt-0.5">-1 FR</span>
        </button>

        {/* Rotary Knurled Wheel */}
        <div
          ref={wheelRef}
          role="slider"
          tabIndex={0}
          aria-label="Rotary jog wheel for frame-by-frame scrubbing"
          aria-valuenow={Math.round(rotation)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          className={`relative w-28 h-28 rounded-full metal-knurl cursor-grab active:cursor-grabbing border-4 border-[#222a38] flex items-center justify-center transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isDragging ? 'metal-knurl-active ring-2 ring-amber-500/40' : ''
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Radial tick marks around dial bezel */}
          <div className="absolute inset-1 rounded-full border border-white/5 pointer-events-none" />
          
          {/* Inner rotating rotor with dimple */}
          <div
            className="w-full h-full rounded-full relative flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Circular Brushed Radial Texture Indicator */}
            <div className="absolute top-2 w-3.5 h-3.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.7)] border border-[#0d1017]" />
            
            {/* Center Cap with Synthetic Brand Stamping */}
            <div className="w-12 h-12 rounded-full bg-[#141923] border border-[#2b3547] flex flex-col items-center justify-center shadow-inner pointer-events-none">
              <span className="text-[8px] font-display font-bold text-slate-400">JOG</span>
              <span className="text-[7px] font-mono-numbers text-amber-500">{fps}FPS</span>
            </div>
          </div>
        </div>

        {/* Step +1 Frame Button */}
        <button
          type="button"
          onClick={() => {
            onStepFrame(1);
            setRotation((prev) => (prev + 12) % 360);
          }}
          className="flex flex-col items-center justify-center w-11 h-12 rounded-lg bg-[#181d27] border border-[#2c3749] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 active:translate-y-0.5 active:bg-[#121620] transition-all shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title="Step forward 1 frame"
          aria-label="Step forward 1 frame"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="text-[9px] font-mono-numbers mt-0.5">+1 FR</span>
        </button>
      </div>

      {/* Shuttle Variable Speed Selector */}
      <div className="w-full mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-mono-numbers text-slate-400 mb-1">
          <span>SHUTTLE TAPE SPEED</span>
          <span className="text-amber-400 font-semibold">{playbackRate}x</span>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {[0.5, 0.75, 1, 1.5, 2].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onSetRate(rate)}
              className={`py-1 text-[10px] font-mono-numbers rounded transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${
                playbackRate === rate
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'bg-[#161a23] text-slate-400 hover:text-slate-200 hover:bg-[#1e2430]'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
