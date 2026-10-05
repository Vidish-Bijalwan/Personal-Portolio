/**
 * Pixaura — Video Studio tool constants.
 *
 * Pure logic: no JSX, no I/O, no imports from server modules.
 * Unit-testable in isolation.
 */

/** ₹49 clean-video unlock, integer paise. */
export const VIDEO_JOB_PRICE_PAISE = 4900;

/** Max uploaded source video: 50MB (client + server enforced). */
export const MAX_INPUT_BYTES = 50 * 1024 * 1024;

/** Source video MIME allowlist for uploads. */
export const INPUT_MIMES = ['video/mp4'] as const;
export type InputMime = (typeof INPUT_MIMES)[number];

/** Max script length for TTS voice-over (mirrors the 2000-char prompt limit). */
export const SCRIPT_MAX = 2000;

export type VideoTool = 'tts' | 'caption' | 'trim';

export const VIDEO_TOOLS: readonly VideoTool[] = ['tts', 'caption', 'trim'];

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
