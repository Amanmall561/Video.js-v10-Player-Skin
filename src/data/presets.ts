import { VideoPreset, ChapterMark } from '../types/player';

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'project-screen-demo',
    name: 'Project Screen-Recording Demo (20s Full Walkthrough)',
    category: 'bright',
    description: 'Complete 1080p screen-recording walkthrough of the Synth-10 Tactile Deck project showing Video.js v10 playback, timeline scrubbing, rotary jog wheel, and stereo VU meters working in real time.',
    src: '/videos/synth10-project-demo.mp4',
    type: 'video/mp4',
    poster: '/videos/synth10-project-demo-poster.jpg',
    fps: 30,
  },
  {
    id: 'trending-cartoon',
    name: 'Trending Cartoon Animation Reel (20s)',
    category: 'bright',
    description: 'Vibrant 20s trending cartoon animation reel featuring Sunny Candy Synth City (Daylight), Rainbow Rocket Flight, Midnight Neon Forest (Dark Shadows), and Boombox Dance Party. Ready to download and upload to your Mux account!',
    src: '/videos/trending-cartoon-reel.mp4',
    type: 'video/mp4',
    poster: '/videos/trending-cartoon-poster.jpg',
    fps: 30,
  },
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
    id: 'curated-bright-dark',
    name: 'Curated Bright & Dark Benchmark Reel (24s)',
    category: 'bright',
    description: '24-second continuous benchmark alternating 8s High-Key Daylight (96% Y), 8s Low-Key Obsidian (4% Y), and 8s Dynamic SMPTE Chroma with stereo audio.',
    src: '/videos/curated-bright-dark-reel.mp4',
    type: 'video/mp4',
    poster: '/videos/curated-bright-dark-poster.jpg',
    fps: 30,
  },
  {
    id: 'dark-audit',
    name: 'Low-Key Dark Sci-Fi Reel',
    category: 'dark',
    description: 'High-contrast sci-fi night footage to audit optical compensation and shadow separation.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'video/mp4',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80',
    fps: 24,
  },
];

export const CHAPTER_MARKS: ChapterMark[] = [
  { time: 0, label: '01. Video.js v10 & Sunny Candy City (0-5s)' },
  { time: 5, label: '02. Tactile Scrubber & Rainbow Flight (5-10s)' },
  { time: 10, label: '03. Precision Jog Wheel & Neon Forest (10-15s)' },
  { time: 15, label: '04. Calibrated VU Meters & Party Dance (15-20s)' },
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
