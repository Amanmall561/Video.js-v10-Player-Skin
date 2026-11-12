export interface VideoPreset {
  id: string;
  name: string;
  category: 'mux' | 'bright' | 'dark' | 'custom';
  description: string;
  src: string;
  type: string;
  poster?: string;
  muxPlaybackId?: string;
  fps: number;
}

export interface ChapterMark {
  time: number;
  label: string;
}

export interface VideoJsPlayer {
  play(): Promise<void> | void;
  pause(): void;
  paused(): boolean;
  currentTime(seconds?: number): number;
  duration(): number;
  volume(percent?: number): number;
  muted(muted?: boolean): boolean;
  playbackRate(rate?: number): number;
  isFullscreen(): boolean;
  requestFullscreen(): void;
  exitFullscreen(): void;
  buffered(): { length: number; start(index: number): number; end(index: number): number };
  getVideoElement(): HTMLVideoElement | null;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isWaiting: boolean;
  timecode: string;
  frameNumber: number;
  activePreset: VideoPreset;
}

export interface AuditState {
  contrastRatio: string;
  isCompliantAA: boolean;
  isCompliantAAA: boolean;
  isReducedMotion: boolean;
  keyboardGuideOpen: boolean;
}
