import React from 'react';
import { Maximize, Minimize, PictureInPicture, Subtitles, Sliders, Monitor, Layers } from 'lucide-react';

interface AuxiliaryRackProps {
  isFullscreen: boolean;
  showNativeControls: boolean;
  playbackRate: number;
  onToggleFullscreen: () => void;
  onTogglePiP: () => void;
  onToggleNativeControls: () => void;
  onSetRate: (rate: number) => void;
}

export const AuxiliaryRack: React.FC<AuxiliaryRackProps> = ({
  isFullscreen,
  showNativeControls,
  playbackRate,
  onToggleFullscreen,
  onTogglePiP,
  onToggleNativeControls,
  onSetRate,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0c0f15] rounded-xl border border-[#202736] text-xs font-mono-numbers">
      
      {/* Left Group: Format & Speed */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-display">
          OUTPUT RACK
        </span>
        <span className="text-slate-600">·</span>
        
        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-[#141923] p-1 rounded-lg border border-white/5">
          <span className="text-[10px] text-slate-400 px-1">SPEED:</span>
          {[0.5, 1, 1.5, 2].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onSetRate(rate)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                playbackRate === rate
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Right Group: Action Toggles (PiP, Native Skin Reveal, Fullscreen) */}
      <div className="flex items-center gap-2">
        
        {/* Toggle Native Video.js Controls View */}
        <button
          type="button"
          onClick={onToggleNativeControls}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all ${
            showNativeControls
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-[#141923] border-[#252f40] text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle native Video.js v10 controls overlay"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">V10 NATIVE BAR: {showNativeControls ? 'VISIBLE' : 'HIDDEN'}</span>
        </button>

        {/* Picture-in-Picture */}
        <button
          type="button"
          onClick={onTogglePiP}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141923] border border-[#252f40] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all"
          title="Picture-in-Picture window"
          aria-label="Picture-in-Picture"
        >
          <PictureInPicture className="w-3.5 h-3.5" />
          <span className="hidden md:inline">PIP</span>
        </button>

        {/* Fullscreen Master Toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161d2a] border border-[#2d3a50] text-slate-200 hover:text-amber-400 hover:border-amber-500/50 transition-all font-semibold"
          title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}</span>
        </button>
      </div>
    </div>
  );
};
