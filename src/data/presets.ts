import { VideoPreset, ChapterMark } from '../types/player';

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'mux-master',
    name: 'Mux HLS Master (Official)',
    category: 'mux',
    description: 'Public adaptive bitrate HLS stream hosted directly on Mux CDN for contest bonus point.',
    src: 'https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqTtjhqNZNUdMm3.m3u8',
    type: 'application/x-mpegURL',
    poster: 'https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqTtjhqNZNUdMm3/thumbnail.jpg?width=1280',
    muxPlaybackId: 'VZtzUzGRv02OhRnZCxcNg49OilvolTqTtjhqNZNUdMm3',
    fps: 30,
  },
  {
    id: 'bright-audit',
    name: 'High-Key Bright Reel (Snow & Light)',
    category: 'bright',
    description: 'Blinding white snowscapes and high-luminance footage to audit WCAG AA/AAA text legibility.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video/mp4',
    poster: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1280&q=80',
    fps: 30,
  },
  {
    id: 'dark-audit',
    name: 'Low-Key Dark Reel (Deep Shadows)',
    category: 'dark',
    description: 'High-contrast sci-fi night footage to audit optical compensation and shadow separation.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'video/mp4',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80',
    fps: 24,
  },
  {
    id: 'mux-alt',
    name: 'Mux Motion Graphics (60fps)',
    category: 'mux',
    description: 'Fast-paced Mux stream ideal for evaluating rotary jog wheel and frame scrubbing precision.',
    src: 'https://stream.mux.com/249oQ39F9p7i6QWdGzU1vW3c34V9jH01X2.m3u8',
    type: 'application/x-mpegURL',
    poster: 'https://image.mux.com/249oQ39F9p7i6QWdGzU1vW3c34V9jH01X2/thumbnail.jpg?width=1280',
    muxPlaybackId: '249oQ39F9p7i6QWdGzU1vW3c34V9jH01X2',
    fps: 60,
  },
];

export const CHAPTER_MARKS: ChapterMark[] = [
  { time: 0, label: '01. Deck Initialization' },
  { time: 30, label: '02. Analog Calibration' },
  { time: 90, label: '03. Main Sequence' },
  { time: 180, label: '04. Peak Resonance' },
  { time: 300, label: '05. Outro & Decay' },
];

export function formatTimecode(seconds: number, fps: number = 30): string {
  if (isNaN(seconds) || seconds < 0) return '00:00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

export function formatStandardTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
