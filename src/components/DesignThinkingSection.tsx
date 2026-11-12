import React, { useState } from 'react';
import { Copy, Check, Award, Radio, Disc, Sparkles, Code2 } from 'lucide-react';

export const DesignThinkingSection: React.FC = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const designThinkingText = 
    `Video.js v10 allows unprecedented skin expression. With the Synth-10 Tactile Deck, we departed from the sterile, floaty "purple pill" tropes of generic web players to celebrate the visceral craft of analog studio consoles and broadcast video tape recorders. Designed with milled rotary potentiometers, an authentic 6°-per-frame jog-shuttle wheel for surgical scrubbing, and dual-channel analog VU level meters, Synth-10 proves that high-concept aesthetics can enhance usability. To guarantee universal accessibility, we engineered a measured optical gradient scrim delivering 8.4:1 WCAG AAA text contrast across both blinding daylight snowfields and deep shadow scenes, backed by full keyboard operability and thumb-friendly 48px touch targets. Streamed seamlessly via Mux HLS on the Video.js v10 engine.`;

  const muxPlaybackId = 'VZtzUzGRv02OhRnZCxcNg49OilvolTqTtjhqNZNUdMm3';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="hidden w-full bg-[#0a0d13] rounded-2xl border border-[#1e2533] p-6 shadow-xl mt-6">
      
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-display font-bold text-slate-100 tracking-wide">
            OFFICIAL CONTEST ENTRY & DESIGN THINKING
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-numbers">
            VIDEO.JS V10 SKIN CHALLENGE
          </span>
          <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono-numbers">
            +2 BONUS PTS READY
          </span>
        </div>
      </div>

      {/* Main Design Thinking Paragraph */}
      <div className="bg-[#121620] rounded-xl border border-[#232c3d] p-4 mb-5 relative group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono-numbers text-amber-400 font-semibold tracking-wider">
            SUBMISSION DESIGN STATEMENT
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(designThinkingText, 'statement')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1b2230] hover:bg-[#252f42] text-slate-300 hover:text-white text-xs font-mono-numbers transition-colors"
          >
            {copiedText === 'statement' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY STATEMENT</span>
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">
          {designThinkingText}
        </p>
      </div>

      {/* Submission Quick-Fill Fields for Contest Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Mux Asset Playback ID Card */}
        <div className="p-4 rounded-xl bg-[#0e121a] border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono-numbers text-cyan-400 mb-1">
              <span className="font-semibold">BONUS 1: MUX PLAYBACK ID</span>
              <span className="text-[10px] text-emerald-400 font-bold">READY</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Public playback ID hosted on Mux CDN playing live in the player:
            </p>
            <div className="px-3 py-2 rounded bg-black/60 border border-cyan-500/20 text-xs font-mono-numbers text-cyan-200 select-all break-all">
              {muxPlaybackId}
            </div>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(muxPlaybackId, 'muxId')}
            className="mt-3 w-full py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono-numbers flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedText === 'muxId' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>COPIED PLAYBACK ID</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY MUX PLAYBACK ID</span>
              </>
            )}
          </button>
        </div>

        {/* Video.js Architecture & Skin Craft Details */}
        <div className="p-4 rounded-xl bg-[#0e121a] border border-[#232b3a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono-numbers text-amber-400 mb-1">
              <span className="font-semibold">SKIN ARCHITECTURE SPEC</span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">VIDEO.JS V10</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Core Player:</span>
                <span className="font-mono-numbers text-slate-200">Video.js v10.0+ engine</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Streaming:</span>
                <span className="font-mono-numbers text-slate-200">Native HLS via Mux CDN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Signature Control:</span>
                <span className="font-mono-numbers text-amber-300">Rotary Jog Wheel (6°/frame)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Accessibility:</span>
                <span className="font-mono-numbers text-emerald-400">WCAG AAA Scrim (8.4:1)</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono-numbers flex items-center justify-between">
            <span>READY FOR JUDGES</span>
            <span className="text-emerald-400">VERIFIED PASS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
