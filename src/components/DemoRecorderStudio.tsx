import React, { useState, useRef, useEffect } from 'react';
import { VideoPreset, PlayerState, VideoJsPlayer } from '../types/player';
import { VIDEO_PRESETS } from '../data/presets';
import { Video, Download, Play, Square, Sparkles, CheckCircle2, Film, Disc, Radio } from 'lucide-react';

interface DemoRecorderStudioProps {
  playerState: PlayerState;
  playerInstance: VideoJsPlayer | null;
  onSelectPreset: (preset: VideoPreset) => void;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onStepFrame: (direction: 1 | -1) => void;
  onSetRate: (rate: number) => void;
  onVolumeChange: (vol: number) => void;
}

export const DemoRecorderStudio: React.FC<DemoRecorderStudioProps> = ({
  playerState,
  playerInstance,
  onSelectPreset,
  onPlayPause,
  onSeek,
  onStepFrame,
  onSetRate,
  onVolumeChange,
}) => {
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourStepText, setTourStepText] = useState<string>('Ready to run live automated walkthrough');
  const [tourProgress, setTourProgress] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const tourTimersRef = useRef<number[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      tourTimersRef.current.forEach((id) => window.clearTimeout(id));
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Draw live Synth-10 UI + active <video> frame onto the recording canvas at 30fps
  const startCanvasRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    recordedChunksRef.current = [];
    setRecordedBlobUrl(null);

    const renderLoop = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Chassis background
      ctx.fillStyle = '#07090d';
      ctx.fillRect(0, 0, w, h);

      // 2. Top Header Bar
      ctx.fillStyle = '#090c12';
      ctx.fillRect(0, 0, w, 48);
      ctx.strokeStyle = '#1b2230';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 48);
      ctx.lineTo(w, 48);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('SYNTH//10 DECK — LIVE SCREEN RECORDING', 24, 30);

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(w - 150, 24, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('REC LIVE DEMO', w - 135, 29);

      // 3. Draw live <video> element frame inside the viewport box
      const vx = 40;
      const vy = 68;
      const vw = w - 80;
      const vh = 420;

      ctx.fillStyle = '#050608';
      ctx.fillRect(vx, vy, vw, vh);

      const videoEl = playerInstance?.getVideoElement();
      if (videoEl && videoEl.readyState >= 2) {
        try {
          ctx.drawImage(videoEl, vx, vy, vw, vh);
        } catch {
          // Fallback if cross-origin tainted
          ctx.fillStyle = '#111827';
          ctx.fillRect(vx, vy, vw, vh);
        }
      }

      // Scrim overlay
      const grad = ctx.createLinearGradient(0, vy + vh - 140, 0, vy + vh);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(vx, vy, vw, vh);

      // Viewport border & HUD
      ctx.strokeStyle = '#263145';
      ctx.lineWidth = 2;
      ctx.strokeRect(vx, vy, vw, vh);

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(vx + 16, vy + 16, 360, 28);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`SOURCE: ${playerState.activePreset.name.slice(0, 32)}`, vx + 26, vy + 35);

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(vx + vw - 190, vy + 16, 174, 28);
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(`FRAME: ${playerState.frameNumber.toString().padStart(6, '0')}`, vx + vw - 178, vy + 35);

      // 4. Tactile Scrubber Timeline Bar
      const tx = 40;
      const ty = 502;
      const tw = w - 80;
      const th = 56;
      ctx.fillStyle = '#0e1219';
      ctx.fillRect(tx, ty, tw, th);
      ctx.strokeStyle = '#20293a';
      ctx.strokeRect(tx, ty, tw, th);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`TIMECODE: ${playerState.timecode}`, tx + 16, ty + 22);

      // Progress groove
      const gx = tx + 16;
      const gy = ty + 32;
      const gw = tw - 32;
      const gh = 12;
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(gx, gy, gw, gh);

      const pct = playerState.duration > 0 ? Math.min(1, playerState.currentTime / playerState.duration) : 0;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(gx, gy, Math.max(8, gw * pct), gh);

      // Playhead
      ctx.fillStyle = '#fde047';
      ctx.fillRect(gx + gw * pct - 4, gy - 4, 8, gh + 8);

      // 5. Lower Hardware Deck Modules
      const dy = 572;
      const dh = 124;
      const colW = (tw - 24) / 3;

      // Module 1: Transport
      ctx.fillStyle = '#0f1218';
      ctx.fillRect(tx, dy, colW, dh);
      ctx.strokeStyle = '#232b38';
      ctx.strokeRect(tx, dy, colW, dh);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('01. MECHANICAL TRANSPORT', tx + 14, dy + 24);
      ctx.fillStyle = playerState.isPlaying ? '#f43f5e' : '#94a3b8';
      ctx.fillText(playerState.isPlaying ? '● ROLLING (PLAYING)' : '■ PAUSED / CUE', tx + 14, dy + 55);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`SPEED: ${playerState.playbackRate}x SHUTTLE`, tx + 14, dy + 85);

      // Module 2: Jog Wheel
      const jx = tx + colW + 12;
      ctx.fillStyle = '#0f1218';
      ctx.fillRect(jx, dy, colW, dh);
      ctx.strokeStyle = '#232b38';
      ctx.strokeRect(jx, dy, colW, dh);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('02. PRECISION JOG WHEEL', jx + 14, dy + 24);
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(`ROTARY ANGLE: ${(playerState.frameNumber * 6) % 360}°`, jx + 14, dy + 55);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('STEP: -1 FR / +1 FR (6°/FR)', jx + 14, dy + 85);

      // Module 3: VU Meters
      const ax = jx + colW + 12;
      ctx.fillStyle = '#0f1218';
      ctx.fillRect(ax, dy, colW, dh);
      ctx.strokeStyle = '#232b38';
      ctx.strokeRect(ax, dy, colW, dh);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('03. DUAL ANALOG VU METERS', ax + 14, dy + 24);

      const vuL = playerState.isPlaying ? Math.min(1, playerState.volume * (0.75 + 0.2 * Math.sin(Date.now() / 110))) : 0.05;
      const vuR = playerState.isPlaying ? Math.min(1, playerState.volume * (0.75 + 0.2 * Math.cos(Date.now() / 130))) : 0.05;

      ctx.fillStyle = '#10b981';
      ctx.fillRect(ax + 14, dy + 42, (colW - 28) * vuL, 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ax + 14, dy + 64, (colW - 28) * vuR, 12);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`MASTER VOL: ${Math.round(playerState.volume * 100)}%`, ax + 14, dy + 100);

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    try {
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setIsRecording(false);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200);
      setIsRecording(true);
    } catch (err) {
      console.warn('Canvas MediaRecorder fallback:', err);
    }
  };

  const stopCanvasRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsRecording(false);
  };

  // Automated 15-second live choreographed demo tour of the entire app
  const startAutomatedDemoTour = () => {
    // Clear existing timers
    tourTimersRef.current.forEach((id) => window.clearTimeout(id));
    tourTimersRef.current = [];

    setIsTourRunning(true);
    setTourProgress(5);
    setTourStepText('Step 1/5: Loading Trending Cartoon Reel & Starting Video.js v10 Playback...');

    // Switch to Cartoon Reel or Demo Reel and play
    const cartoonPreset = VIDEO_PRESETS.find((p) => p.id === 'trending-cartoon') || VIDEO_PRESETS[0];
    onSelectPreset(cartoonPreset);

    startCanvasRecording();

    const schedule = (ms: number, fn: () => void) => {
      const id = window.setTimeout(fn, ms);
      tourTimersRef.current.push(id);
    };

    schedule(500, () => {
      playerInstance?.play();
      setTourProgress(20);
    });

    schedule(3500, () => {
      setTourStepText('Step 2/5: Scrubbing Tactile Waveform Timeline to Chapter 02 (Rainbow Rocket Flight)...');
      onSeek(6.0);
      setTourProgress(40);
    });

    schedule(6500, () => {
      setTourStepText('Step 3/5: Engaging Precision Rotary Jog Wheel (Frame-by-Frame Stepping +1 FR)...');
      onStepFrame(1);
      setTourProgress(60);
    });

    schedule(7500, () => {
      onStepFrame(1);
    });

    schedule(8500, () => {
      setTourStepText('Step 4/5: Resuming Playback at 1.5x Shuttle Tape Speed & Sweeping Master Volume...');
      onSetRate(1.5);
      onSeek(11.0);
      playerInstance?.play();
      onVolumeChange(0.95);
      setTourProgress(80);
    });

    schedule(11500, () => {
      setTourStepText('Step 5/5: Restoring 1.0x Normal Shuttle Speed & Verifying Stereo VU Meters...');
      onSetRate(1.0);
      onVolumeChange(0.85);
      setTourProgress(95);
    });

    schedule(14000, () => {
      setTourStepText('Complete! Live Automated Demo Walkthrough & Screen Recording Finished.');
      setTourProgress(100);
      setIsTourRunning(false);
      stopCanvasRecording();
    });
  };

  const stopAutomatedDemoTour = () => {
    tourTimersRef.current.forEach((id) => window.clearTimeout(id));
    tourTimersRef.current = [];
    setIsTourRunning(false);
    setTourStepText('Demo tour stopped.');
    stopCanvasRecording();
  };

  const handleLoadPreRenderedDemo = () => {
    const demoPreset = VIDEO_PRESETS.find((p) => p.id === 'project-screen-demo') || VIDEO_PRESETS[0];
    onSelectPreset(demoPreset);
    setTimeout(() => {
      playerInstance?.play();
    }, 300);
  };

  return (
    <div className="hidden w-full bg-[#0b0f17] rounded-2xl border border-amber-500/40 p-5 shadow-[0_0_30px_rgba(245,158,11,0.12)] mt-6">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <span className="text-xs font-mono-numbers font-bold uppercase tracking-wider text-rose-400">
              SCREEN-RECORDING & WALKTHROUGH STUDIO
            </span>
          </div>
          <h2 className="text-lg font-display font-bold text-slate-100 mt-1">
            Full Project Working Demo Video (Screen Recording)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Watch or download the pre-recorded 1080p full-screen project demo video, or trigger a live automated walkthrough recording right in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleLoadPreRenderedDemo}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold font-mono-numbers transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>PLAY DEMO IN MAIN PLAYER</span>
          </button>

          <a
            href="/videos/synth10-project-demo.mp4"
            download="synth10-project-demo.mp4"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161e2e] hover:bg-[#1f2a40] border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono-numbers transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD DEMO (.MP4)</span>
          </a>
        </div>
      </div>

      {/* Two-Column Showcase: Left = Pre-Rendered 1080p Screen Recording Video, Right = Live Automated Tour & Recorder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Card: Embedded 1080p Screen-Recording Demo Video */}
        <div className="bg-[#0e131d] rounded-xl border border-[#222c3f] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono-numbers mb-2.5">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Film className="w-4 h-4" />
                <span>PRE-RECORDED 1080P PROJECT WALKTHROUGH (20s)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[10px]">
                READY TO SHARE / MUX
              </span>
            </div>

            {/* Embedded HTML5 Video Preview of the Screen Recording */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-[#2a364f] shadow-inner">
              <video
                src="/videos/synth10-project-demo.mp4"
                poster="/videos/synth10-project-demo-poster.jpg"
                controls
                playsInline
                loop
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-numbers text-slate-400">
            <span>1920×1080 HD · 30 FPS · H.264 + AAC</span>
            <a
              href="/videos/synth10-project-demo.mp4"
              download="synth10-project-demo.mp4"
              className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save synth10-project-demo.mp4</span>
            </a>
          </div>
        </div>

        {/* Right Card: Interactive Self-Driving Demo Tour & Live Session Recorder */}
        <div className="bg-[#0e131d] rounded-xl border border-[#222c3f] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono-numbers mb-2.5">
              <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                <Radio className="w-4 h-4" />
                <span>INTERACTIVE AUTOMATED TOUR & LIVE RECORDER</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isTourRunning
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isTourRunning ? '● RECORDING LIVE TOUR' : 'STANDBY'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Click below to watch the player automatically demonstrate every control on this page (Play/Pause, Timeline Scrubbing, Rotary Jog Wheel Frame-Stepping, Shuttle Speeds, and VU Meters) while capturing a live screen recording.
            </p>

            {/* Live Status & Progress Box */}
            <div className="p-3 rounded-lg bg-[#080b11] border border-[#1e2738] mb-3 font-mono-numbers">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span>AUTOMATED TOUR STATUS:</span>
                <span className="text-amber-400 font-bold">{tourProgress}%</span>
              </div>
              <div className="text-xs text-slate-200 font-semibold mb-2">
                {tourStepText}
              </div>
              <div className="w-full h-2 bg-[#141b29] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${tourProgress}%` }}
                />
              </div>
            </div>

            {/* Hidden high-DPI compositor canvas used for live WebM recording */}
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="hidden"
            />

            {/* Checklist of Demonstrated Features */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-numbers text-slate-400 mb-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Video.js v10 Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Rotary Jog (6°/Frame)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Waveform Chapter Seek</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Stereo VU Level Meters</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
            {!isTourRunning ? (
              <button
                type="button"
                onClick={startAutomatedDemoTour}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs font-mono-numbers shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>START AUTOMATED LIVE DEMO + RECORD</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopAutomatedDemoTour}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs font-mono-numbers transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>STOP DEMO TOUR & SAVE RECORDING</span>
              </button>
            )}

            {recordedBlobUrl && (
              <a
                href={recordedBlobUrl}
                download="synth10-live-session-recording.webm"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono-numbers transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD LIVE CAPTURE (.WEBM)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
