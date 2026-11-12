import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, SkipBack, SkipForward, Repeat } from 'lucide-react';

interface MechanicalTransportProps {
  isPlaying: boolean;
  isLooping: boolean;
  onPlayPause: () => void;
  onSeekRelative: (deltaSeconds: number) => void;
  onSeekTo: (seconds: number) => void;
  onToggleLoop: () => void;
  duration: number;
}

export const MechanicalTransport: React.FC<MechanicalTransportProps> = ({
  isPlaying,
  isLooping,
  onPlayPause,
  onSeekRelative,
  onSeekTo,
  onToggleLoop,
  duration,
}) => {
  return (
    <div className="flex flex-col justify-between p-3.5 bg-[#0f1218] rounded-xl border border-[#232b38] shadow-lg select-none">
      
      {/* Header Label with LED Indicator */}
      <div className="flex items-center justify-between text-[11px] font-mono-numbers text-slate-400 mb-2 border-b border-white/5 pb-1">
        <span className="font-display font-semibold text-amber-400/90 tracking-wider">
          MECHANICAL TRANSPORT
        </span>
        <div className="flex items-center gap-1.5">
          <span 
            className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse' : 'bg-amber-500/60'
            }`} 
            aria-hidden="true" 
          />
          <span className="text-[10px] text-slate-400">
            {isPlaying ? 'ROLLING' : 'STOPPED'}
          </span>
        </div>
      </div>

      {/* Main Transport Button Rack */}
      <div className="grid grid-cols-5 gap-2 my-1">
        
        {/* Rewind to Start */}
        <button
          type="button"
          onClick={() => onSeekTo(0)}
          className="h-12 flex flex-col items-center justify-center rounded-lg bg-[#181d27] border border-[#2c3749] text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 active:translate-y-0.5 active:bg-[#121620] transition-all shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Return to zero (Start)"
          aria-label="Return to zero"
        >
          <SkipBack className="w-4 h-4" />
          <span className="text-[8px] font-mono-numbers mt-0.5">RTZ</span>
        </button>

        {/* Jump -10s */}
        <button
          type="button"
          onClick={() => onSeekRelative(-10)}
          className="h-12 flex flex-col items-center justify-center rounded-lg bg-[#181d27] border border-[#2c3749] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 active:translate-y-0.5 active:bg-[#121620] transition-all shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title="Jump back 10 seconds (J)"
          aria-label="Jump back 10 seconds"
        >
          <Rewind className="w-4 h-4" />
          <span className="text-[8px] font-mono-numbers mt-0.5">-10S</span>
        </button>

        {/* Primary Mechanical Master Play/Pause Switch */}
        <button
          type="button"
          onClick={onPlayPause}
          className={`h-12 flex flex-col items-center justify-center rounded-lg transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 ${
            isPlaying
              ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.35)] active:translate-y-0.5 ring-rose-400'
              : 'bg-amber-500/90 border-2 border-amber-300 text-black shadow-[0_0_16px_rgba(245,158,11,0.45)] hover:bg-amber-400 active:translate-y-0.5 ring-amber-400 font-bold'
          }`}
          title={isPlaying ? 'Pause playback (Space)' : 'Start playback (Space)'}
          aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span className="text-[8px] font-mono-numbers font-semibold">PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span className="text-[8px] font-mono-numbers font-bold">PLAY</span>
            </>
          )}
        </button>

        {/* Jump +10s */}
        <button
          type="button"
          onClick={() => onSeekRelative(10)}
          className="h-12 flex flex-col items-center justify-center rounded-lg bg-[#181d27] border border-[#2c3749] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 active:translate-y-0.5 active:bg-[#121620] transition-all shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title="Jump forward 10 seconds (L)"
          aria-label="Jump forward 10 seconds"
        >
          <FastForward className="w-4 h-4" />
          <span className="text-[8px] font-mono-numbers mt-0.5">+10S</span>
        </button>

        {/* Jump to End */}
        <button
          type="button"
          onClick={() => onSeekTo(duration)}
          className="h-12 flex flex-col items-center justify-center rounded-lg bg-[#181d27] border border-[#2c3749] text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 active:translate-y-0.5 active:bg-[#121620] transition-all shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Jump to end"
          aria-label="Jump to end"
        >
          <SkipForward className="w-4 h-4" />
          <span className="text-[8px] font-mono-numbers mt-0.5">END</span>
        </button>
      </div>

      {/* Auxiliary Loop Toggle */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={onToggleLoop}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono-numbers transition-all border ${
            isLooping
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
              : 'bg-[#141923] border-[#293242] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>SEAMLESS LOOP: {isLooping ? 'ON' : 'OFF'}</span>
        </button>

        <span className="text-[10px] text-slate-500 font-mono-numbers">SPACE = PLAY/PAUSE</span>
      </div>
    </div>
  );
};
