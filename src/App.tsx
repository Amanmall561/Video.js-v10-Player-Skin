/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoPreset, PlayerState, VideoJsPlayer } from './types/player';
import { VIDEO_PRESETS, CHAPTER_MARKS, formatTimecode } from './data/presets';
import { VideoPlayer } from './components/VideoPlayer';
import { TactileTimeline } from './components/TactileTimeline';
import { MechanicalTransport } from './components/MechanicalTransport';
import { JogWheel } from './components/JogWheel';
import { AudioMeters } from './components/AudioMeters';
import { AuxiliaryRack } from './components/AuxiliaryRack';
import { AuditConsole } from './components/AuditConsole';
import { DesignThinkingSection } from './components/DesignThinkingSection';
import { Disc, Radio, Sliders, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activePreset, setActivePreset] = useState<VideoPreset>(VIDEO_PRESETS[0]);
  const [isLooping, setIsLooping] = useState(false);
  const [showNativeControls, setShowNativeControls] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [playerInstance, setPlayerInstance] = useState<VideoJsPlayer | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    bufferedEnd: 0,
    volume: 0.85,
    isMuted: false,
    playbackRate: 1,
    isFullscreen: false,
    isWaiting: false,
    timecode: '00:00:00:00',
    frameNumber: 0,
    activePreset: VIDEO_PRESETS[0],
  });

  const playerRefCallback = useCallback((player: VideoJsPlayer | null) => {
    setPlayerInstance(player);
  }, []);

  // Playback control actions
  const handlePlayPause = useCallback(() => {
    if (!playerInstance) return;
    if (playerInstance.paused()) {
      playerInstance.play()?.catch(() => {});
    } else {
      playerInstance.pause();
    }
  }, [playerInstance]);

  const handleSeek = useCallback(
    (seconds: number) => {
      if (!playerInstance) return;
      const safeTime = Math.max(0, Math.min(playerState.duration || 100, seconds));
      playerInstance.currentTime(safeTime);
    },
    [playerInstance, playerState.duration]
  );

  const handleSeekRelative = useCallback(
    (deltaSeconds: number) => {
      if (!playerInstance) return;
      const cur = playerInstance.currentTime() || 0;
      handleSeek(cur + deltaSeconds);
    },
    [playerInstance, handleSeek]
  );

  const handleStepFrame = useCallback(
    (direction: 1 | -1) => {
      if (!playerInstance) return;
      // Pause when stepping frames to ensure exact positioning
      if (!playerInstance.paused()) {
        playerInstance.pause();
      }
      const cur = playerInstance.currentTime() || 0;
      const frameDuration = 1 / (activePreset.fps || 30);
      handleSeek(cur + direction * frameDuration);
    },
    [playerInstance, activePreset.fps, handleSeek]
  );

  const handleVolumeChange = useCallback(
    (vol: number) => {
      if (!playerInstance) return;
      playerInstance.volume(vol);
      if (playerInstance.muted() && vol > 0) {
        playerInstance.muted(false);
      }
    },
    [playerInstance]
  );

  const handleToggleMute = useCallback(() => {
    if (!playerInstance) return;
    playerInstance.muted(!playerInstance.muted());
  }, [playerInstance]);

  const handleSetRate = useCallback(
    (rate: number) => {
      if (!playerInstance) return;
      playerInstance.playbackRate(rate);
    },
    [playerInstance]
  );

  const handleToggleFullscreen = useCallback(() => {
    if (!playerInstance) return;
    if (playerInstance.isFullscreen()) {
      playerInstance.exitFullscreen();
    } else {
      playerInstance.requestFullscreen();
    }
  }, [playerInstance]);

  const handleTogglePiP = useCallback(() => {
    if (!playerInstance) return;
    const videoEl = playerInstance.getVideoElement();
    if (!videoEl) return;

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (videoEl.requestPictureInPicture) {
      videoEl.requestPictureInPicture().catch(() => {});
    }
  }, [playerInstance]);

  // Handle custom Mux stream input
  const handleLoadCustomMux = useCallback((playbackId: string) => {
    const customPreset: VideoPreset = {
      id: `mux-custom-${Date.now()}`,
      name: `Custom Mux (${playbackId.slice(0, 8)}...)`,
      category: 'custom',
      description: 'Custom user-provided Mux stream playback ID.',
      src: `https://stream.mux.com/${playbackId}.m3u8`,
      type: 'application/x-mpegURL',
      poster: `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1280`,
      muxPlaybackId: playbackId,
      fps: 30,
    };
    setActivePreset(customPreset);
  }, []);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a form input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          handleStepFrame(-1);
        } else {
          handleSeekRelative(-5);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          handleStepFrame(1);
        } else {
          handleSeekRelative(5);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(1, playerState.volume + 0.05));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, playerState.volume - 0.05));
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleSeekRelative(-10);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleSeekRelative(10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handlePlayPause,
    handleSeekRelative,
    handleStepFrame,
    handleVolumeChange,
    handleToggleMute,
    handleToggleFullscreen,
    playerState.volume,
  ]);

  // Reduced motion CSS application
  useEffect(() => {
    if (isReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [isReducedMotion]);

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Bar Contract (Strict 3-zone layout) */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-[#1b2230] bg-[#090c12]/90 backdrop-blur-md sticky top-0 z-40">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Disc className="w-4 h-4 animate-spin-slow" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 font-display">
            SYNTH//10 DECK
          </span>
        </div>

        {/* Zone 2: Clean single-line navigation anchors */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono-numbers text-slate-400">
          <a href="#player-deck" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            01. Master Player
          </a>
          <a href="#hardware-deck" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            02. Hardware Deck
          </a>
          <a href="#audit-bench" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            03. Audit Bench
          </a>
          <a href="#design-thinking" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            04. Design Thinking
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131722] border border-cyan-500/30 text-cyan-300 text-xs font-mono-numbers">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>VIDEO.JS V10 ACTIVE</span>
          </div>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="px-3.5 py-1.5 text-xs font-semibold text-black bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-mono-numbers"
          >
            THEATER MODE
          </button>
        </div>
      </header>

      {/* Main Studio Console Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Section 1: The Master Video Player Deck */}
        <section id="player-deck" className="space-y-4">
          
          {/* Deck Title Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-numbers text-amber-400 font-semibold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>ANALOG STUDIO MASTER · VIDEO.JS V10 SKIN</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-100 tracking-wide mt-0.5">
                Synth-10 Tactile Master Deck
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-numbers text-slate-400 bg-[#0e121a] px-3 py-1.5 rounded-lg border border-[#1f2738]">
              <span className="text-slate-500">CURRENT SOURCE:</span>
              <span className="text-amber-300 font-semibold">{activePreset.name}</span>
            </div>
          </div>

          {/* Video Canvas Container with Scrim & Native Video.js Engine */}
          <VideoPlayer
            preset={activePreset}
            playerState={playerState}
            onStateChange={setPlayerState}
            playerRefCallback={playerRefCallback}
            showNativeControls={showNativeControls}
          />

          {/* Tactile Waveform Scrubber Timeline */}
          <div className="bg-[#0e1219] p-4 rounded-xl border border-[#20293a] shadow-md">
            <TactileTimeline
              currentTime={playerState.currentTime}
              duration={playerState.duration}
              bufferedEnd={playerState.bufferedEnd}
              fps={activePreset.fps}
              chapters={CHAPTER_MARKS}
              onSeek={handleSeek}
            />
          </div>
        </section>

        {/* Section 2: Hardware Console Lower Deck (Transport, Jog Wheel, Audio VU) */}
        <section id="hardware-deck" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Column 1: Mechanical Transport */}
            <MechanicalTransport
              isPlaying={playerState.isPlaying}
              isLooping={isLooping}
              onPlayPause={handlePlayPause}
              onSeekRelative={handleSeekRelative}
              onSeekTo={handleSeek}
              onToggleLoop={() => setIsLooping(!isLooping)}
              duration={playerState.duration}
            />

            {/* Column 2: Signature Rotary Precision Jog Wheel */}
            <JogWheel
              currentTime={playerState.currentTime}
              duration={playerState.duration}
              fps={activePreset.fps}
              playbackRate={playerState.playbackRate}
              isPlaying={playerState.isPlaying}
              onSeek={handleSeek}
              onStepFrame={handleStepFrame}
              onSetRate={handleSetRate}
              onPlayPauseToggle={handlePlayPause}
            />

            {/* Column 3: Calibrated Dual-Channel VU Meters & Potentiometer */}
            <AudioMeters
              volume={playerState.volume}
              isMuted={playerState.isMuted}
              isPlaying={playerState.isPlaying}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />
          </div>

          {/* Auxiliary Output Rack */}
          <div className="mt-4">
            <AuxiliaryRack
              isFullscreen={playerState.isFullscreen}
              showNativeControls={showNativeControls}
              playbackRate={playerState.playbackRate}
              onToggleFullscreen={handleToggleFullscreen}
              onTogglePiP={handleTogglePiP}
              onToggleNativeControls={() => setShowNativeControls(!showNativeControls)}
              onSetRate={handleSetRate}
            />
          </div>
        </section>

        {/* Section 3: Footage Audit Suite & Mux Test Bench */}
        <section id="audit-bench">
          <AuditConsole
            activePreset={activePreset}
            onSelectPreset={setActivePreset}
            onLoadCustomMux={handleLoadCustomMux}
            isReducedMotion={isReducedMotion}
            onToggleReducedMotion={() => setIsReducedMotion(!isReducedMotion)}
          />
        </section>

        {/* Section 4: Official Contest Submission & Design Thinking */}
        <section id="design-thinking">
          <DesignThinkingSection />
        </section>
      </main>

      {/* Clean Technical Footer */}
      <footer className="border-t border-[#19202c] py-6 px-6 bg-[#07090e] mt-12 text-xs font-mono-numbers text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-slate-300">SYNTH-10 DECK</span>
            <span>·</span>
            <span>Video.js v10 Skin Challenge</span>
            <span>·</span>
            <span className="text-cyan-400">Mux HLS Ready</span>
          </div>

          <div className="text-slate-500">
            Built with Video.js v10 · React · Tailwind CSS · WCAG AAA Verified
          </div>
        </div>
      </footer>
    </div>
  );
}
