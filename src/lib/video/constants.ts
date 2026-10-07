/**
 * Etch — Video Studio tool constants.
 *
 * Pure logic: no JSX, no I/O, no imports from server modules.
 * Unit-testable in isolation. Prices come from the canonical catalog
 * (src/lib/pricing/catalog.ts) — never hardcode paise here.
 */
import { priceOf } from '@/lib/pricing/catalog';

/**
 * Per-tool price (integer paise) for a Video Studio job — always
 * catalog-derived, never hardcoded.
 *
 * Oct 2026 price drop: the trivial ffmpeg converters (MP4→MP3, GIF,
 * compressor) cost ₹5 ("tool-basic"); the heavier re-encode jobs
 * (trim & text, add-audio, denoise) cost ₹10 ("tool-plus"); the two AI
 * jobs (voice-over TTS, auto-captions) keep the ₹29 "video-studio" rate
 * because they run inference, not just transcoding.
 */
export const TOOL_PRICE_PAISE: Record<VideoTool, number> = {
  tts: priceOf('video-studio'),
  caption: priceOf('video-studio'),
  trim: priceOf('tool-plus'),
  compress: priceOf('tool-basic'),
  convert: priceOf('tool-basic'),
  gif: priceOf('tool-basic'),
  'add-audio': priceOf('tool-plus'),
  denoise: priceOf('tool-plus'),
};

/** Price (integer paise) for one job of the given Video Studio tool. */
export function toolPricePaise(tool: VideoTool): number {
  const p = TOOL_PRICE_PAISE[tool];
  if (p === undefined) throw new RangeError(`Unknown video tool: ${tool}`);
  return p;
}

/**
 * Legacy flat rate — the AI-job ("video-studio") catalog price.
 * Kept for tests and any caller that prices a job without a tool id.
 * New code should use toolPricePaise().
 */
export const VIDEO_JOB_PRICE_PAISE = priceOf('video-studio');

/** Max uploaded source video: 50MB (client + server enforced). */
export const MAX_INPUT_BYTES = 50 * 1024 * 1024;

/** Max uploaded audio track (add-audio): 20MB (client + server enforced). */
export const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

/** Source video MIME allowlist for uploads. */
export const INPUT_MIMES = ['video/mp4'] as const;
export type InputMime = (typeof INPUT_MIMES)[number];

/** Audio track MIME allowlist (add-audio second upload). */
export const AUDIO_MIMES = ['audio/mpeg', 'audio/wav', 'audio/mp4'] as const;
export type AudioMime = (typeof AUDIO_MIMES)[number];

/** Output mimes a finished Video Studio job can deliver. */
export const OUTPUT_MIMES = ['video/mp4', 'audio/mpeg', 'image/gif'] as const;
export type OutputMime = (typeof OUTPUT_MIMES)[number];

/** Max script length for TTS voice-over (mirrors the 2000-char prompt limit). */
export const SCRIPT_MAX = 2000;

export type VideoTool =
  | 'tts'
  | 'caption'
  | 'trim'
  | 'compress'
  | 'convert'
  | 'gif'
  | 'add-audio'
  | 'denoise';

export const VIDEO_TOOLS: readonly VideoTool[] = [
  'tts',
  'caption',
  'trim',
  'compress',
  'convert',
  'gif',
  'add-audio',
  'denoise',
];

/** Output mime per tool (what the watcher delivers). */
export const TOOL_OUTPUT_MIME: Record<VideoTool, OutputMime> = {
  tts: 'video/mp4',
  caption: 'video/mp4',
  trim: 'video/mp4',
  compress: 'video/mp4',
  convert: 'audio/mpeg',
  gif: 'image/gif',
  'add-audio': 'video/mp4',
  denoise: 'video/mp4',
};

/** File extension per output mime (preview/clean downloads). */
export const OUTPUT_MIME_EXT: Record<OutputMime, string> = {
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'image/gif': 'gif',
};

export type VideoJobStatus = 'queued' | 'processing' | 'done' | 'failed';

export const VIDEO_JOB_TRANSITIONS: Record<string, readonly string[]> = {
  queued: ['processing', 'failed'],
  processing: ['done', 'failed'],
  done: [],
  failed: [],
};

/** queued → processing → done | failed (queued may also fail fast). */
export function canTransitionVideoJob(from: string, to: string): boolean {
  return VIDEO_JOB_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface TtsVoice {
  id: string;
  label: string;
  hint: string;
}

/** Labeled voice vibes for the TTS tool. Watcher maps ids to provider voices. */
export const TTS_VOICES: readonly TtsVoice[] = [
  { id: 'warm', label: 'Warm', hint: 'Friendly narrator — promos, explainers' },
  { id: 'energetic', label: 'Energetic', hint: 'Upbeat — ads, launches, reels' },
  { id: 'calm', label: 'Calm', hint: 'Soft and steady — stories, docs' },
  { id: 'bold', label: 'Bold', hint: 'Deep and confident — trailers, brands' },
];

export type CaptionMode = 'auto' | 'script';

export interface PositionPreset {
  id: string;
  label: string;
}

export const TEXT_POSITIONS: readonly PositionPreset[] = [
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'bottom', label: 'Bottom' },
];

/* ---------------- Phase 4 tool options ---------------- */

export interface CompressQuality {
  id: string;
  label: string;
  /** Honest one-liner: what the preset actually does. */
  desc: string;
}

/** H.264 CRF ladder presets for the compressor. Watcher maps ids to ffmpeg args. */
export const COMPRESS_QUALITIES: readonly CompressQuality[] = [
  {
    id: 'small',
    label: 'Smaller file',
    desc: 'H.264 CRF 32, capped at 720p — smallest size, visible softness',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    desc: 'H.264 CRF 26 — good size/quality trade-off for sharing',
  },
  {
    id: 'best',
    label: 'Best quality',
    desc: 'H.264 CRF 21 — trims the fat, keeps the detail',
  },
];

export interface GifPreset {
  id: string;
  label: string;
}

export const GIF_FPS: readonly GifPreset[] = [
  { id: '10', label: '10 fps' },
  { id: '12', label: '12 fps' },
  { id: '15', label: '15 fps' },
];

export const GIF_WIDTHS: readonly GifPreset[] = [
  { id: '320', label: '320 px wide' },
  { id: '480', label: '480 px wide' },
];

/** Max GIF clip length in seconds — keeps output files sane. */
export const GIF_MAX_SECONDS = 10;

export interface DenoiseStrength {
  id: string;
  label: string;
  desc: string;
}

export const DENOISE_STRENGTHS: readonly DenoiseStrength[] = [
  {
    id: 'light',
    label: 'Light',
    desc: 'Gentle hiss reduction — voices stay untouched',
  },
  {
    id: 'medium',
    label: 'Medium',
    desc: 'Cuts steady hum and room noise',
  },
  {
    id: 'strong',
    label: 'Strong',
    desc: 'Aggressive cleanup — can slightly thin voices',
  },
];

export interface AddAudioMode {
  id: string;
  label: string;
  desc: string;
}

export const ADD_AUDIO_MODES: readonly AddAudioMode[] = [
  {
    id: 'mix',
    label: 'Mix over',
    desc: 'Blend your audio with the video\u2019s original sound',
  },
  {
    id: 'replace',
    label: 'Replace',
    desc: 'Swap the video\u2019s audio for your track entirely',
  },
];

/** Watcher stage labels for the new tools (mapped by progressForStage). */
export const TOOL_STAGES: Record<VideoTool, string> = {
  tts: 'Recording your voice-over',
  caption: 'Listening and captioning',
  trim: 'Cutting your clip',
  compress: 'Compressing your video',
  convert: 'Extracting your audio',
  gif: 'Building your GIF',
  'add-audio': 'Mixing in your audio',
  denoise: 'Cleaning background noise',
};
