import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface AudioMetersProps {
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
}

export const AudioMeters: React.FC<AudioMetersProps> = ({
  volume,
  isMuted,
  isPlaying,
  onVolumeChange,
  onToggleMute,
}) => {
  const [meterLeft, setMeterLeft] = useState(0);
  const [meterRight, setMeterRight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement | null>(null);

  // Dynamic analog VU meter simulation when audio is playing
  useEffect(() => {
    if (!isPlaying || isMuted || volume === 0) {
      setMeterLeft(0);
      setMeterRight(0);
      return;
    }

    const interval = setInterval(() => {
      // Base level is tied to the real volume
      const base = volume * 80;
      const jitterL = Math.sin(Date.now() / 120) * 15 + Math.random() * 8;
      const jitterR = Math.cos(Date.now() / 140) * 15 + Math.random() * 8;

      setMeterLeft(Math.max(5, Math.min(100, base + jitterL)));
      setMeterRight(Math.max(5, Math.min(100, base + jitterR)));
    }, 60);

    return () => clearInterval(interval);
  }, [isPlaying, isMuted, volume]);

  // Volume Potentiometer rotation (range from -135deg to +135deg = 270deg total)
  const rotationDegrees = (volume * 270) - 135;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'pointerdown') return;
    if (!dialRef.current) return;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Convert polar angle into 0-1 volume range
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    // Deadzone at bottom (135 to 225 deg)
    if (angle > 135 && angle < 225) {
      return;
    }

    let normalized: number;
    if (angle >= 225) {
      normalized = (angle - 225) / 270;
    } else {
      normalized = (angle + 135) / 270;
    }

    const clamped = Math.max(0, Math.min(1, normalized));
    onVolumeChange(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      onVolumeChange(Math.min(1, volume + 0.05));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onVolumeChange(Math.max(0, volume - 0.05));
    }
  };

  // Convert volume to simulated decibels
  const dbValue = isMuted || volume === 0 ? '-∞' : (20 * Math.log10(volume)).toFixed(1);

  return (
    <div className="flex flex-col justify-between p-3.5 bg-[#0f1218] rounded-xl border border-[#232b38] shadow-lg select-none">
      
      {/* Header Label */}
      <div className="flex items-center justify-between text-[11px] font-mono-numbers text-slate-400 mb-2 border-b border-white/5 pb-1">
        <span className="font-display font-semibold text-amber-400/90 tracking-wider">
          AUDIO MONITOR & LEVEL
        </span>
        <span className="text-slate-500 font-mono-numbers">CALIBRATED VU</span>
      </div>

      <div className="flex items-center justify-between gap-3 my-1">
        
        {/* Dual Channel Analog VU Meters */}
        <div className="flex-1 flex flex-col gap-2 p-2 rounded-lg bg-[#080a0e] border border-[#1f2633] shadow-inner">
          
          {/* Left Channel */}
          <div>
            <div className="flex items-center justify-between text-[9px] font-mono-numbers text-slate-500 mb-0.5">
              <span>CH-L</span>
              <span className="text-cyan-400">{isMuted ? 'MUTE' : `${Math.round(meterLeft)}%`}</span>
            </div>
            <div className="h-2 w-full bg-[#121620] rounded-sm overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                style={{ width: `${isMuted ? 0 : meterLeft}%` }}
              />
            </div>
          </div>

          {/* Right Channel */}
          <div>
            <div className="flex items-center justify-between text-[9px] font-mono-numbers text-slate-500 mb-0.5">
              <span>CH-R</span>
              <span className="text-cyan-400">{isMuted ? 'MUTE' : `${Math.round(meterRight)}%`}</span>
            </div>
            <div className="h-2 w-full bg-[#121620] rounded-sm overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                style={{ width: `${isMuted ? 0 : meterRight}%` }}
              />
            </div>
          </div>

          {/* Decibel Reference Marks */}
          <div className="flex justify-between text-[8px] font-mono-numbers text-slate-600 px-0.5 pt-0.5" aria-hidden="true">
            <span>-20</span>
            <span>-12</span>
            <span>-6</span>
            <span>0dB</span>
            <span className="text-rose-400/80">+3</span>
          </div>
        </div>

        {/* Rotary Potentiometer Dial */}
        <div className="flex flex-col items-center">
          <div
            ref={dialRef}
            role="slider"
            tabIndex={0}
            aria-label="Master volume potentiometer"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onKeyDown={handleKeyDown}
            className="relative w-16 h-16 rounded-full metal-knurl cursor-grab active:cursor-grabbing border-2 border-[#2b3547] flex items-center justify-center shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            style={{ touchAction: 'none' }}
          >
            {/* Center Knurled Rotor with Direction Needle */}
            <div
              className="w-full h-full rounded-full relative flex items-center justify-center transition-transform duration-75"
              style={{ transform: `rotate(${rotationDegrees}deg)` }}
            >
              <div className="absolute top-1 w-1.5 h-3 bg-amber-400 rounded-full shadow-[0_0_6px_#f59e0b]" />
            </div>

            {/* Inner Center Badge */}
            <div className="absolute w-8 h-8 rounded-full bg-[#11151c] border border-white/10 flex items-center justify-center pointer-events-none">
              <span className="text-[8px] font-mono-numbers text-slate-400 font-bold">VOL</span>
            </div>
          </div>

          {/* Volume Numeric Readout */}
          <div className="text-[10px] font-mono-numbers text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-amber-400 font-semibold">{Math.round(volume * 100)}%</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{dbValue}dB</span>
          </div>
        </div>
      </div>

      {/* Bottom Mute Hardware Button & Linear Track */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={onToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono-numbers transition-all border ${
            isMuted
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
              : 'bg-[#141923] border-[#293242] text-slate-400 hover:text-slate-200'
          }`}
          title="Hardware audio mute (M)"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          <span>MUTE: {isMuted ? 'ON' : 'OFF'}</span>
        </button>

        {/* Quick Linear Slider as Secondary Accessible Control */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            if (isMuted) onToggleMute();
            onVolumeChange(parseFloat(e.target.value));
          }}
          className="w-20 accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
          aria-label="Linear volume slider"
        />
      </div>
    </div>
  );
};
