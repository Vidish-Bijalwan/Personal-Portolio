/**
 * Vidish Studio — free-tier image + paid video generation policy.
 *
 * Pure logic: no JSX, no I/O, no imports from server modules.
 * Unit-testable in isolation.
 */

/** Max free image generations per user per IST day. */
export const FREE_DAILY_CAP = 3;

/** Prompt length bounds (characters). */
export const PROMPT_MIN = 1;
export const PROMPT_MAX = 2000;

/** ₹29 clean-image unlock, integer paise. */
export const UNLOCK_PRICE_PAISE = 2900;
/** ₹99 paid 5s video clip, integer paise. */
export const VIDEO_PRICE_PAISE = 9900;

export type GenerationStatus = 'queued' | 'generating' | 'done' | 'failed';
export type MediaType = 'image' | 'video';
export type Tier = 'free' | 'paid';

/**
 * Start of the calendar day in Asia/Kolkata, as a UTC Date.
 * (Same arithmetic as /api/generation/start — kept in sync deliberately.)
 */
export function istDayStart(date: Date): Date {
  const IST_MS = 5.5 * 3600 * 1000;
  const ist = new Date(date.getTime() + IST_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_MS);
}

export function isVideo(mediaType: string): boolean {
  return mediaType === 'video';
}

export function isFreeTier(tier: string): boolean {
  return tier === 'free';
}

/**
 * A generation counts toward the free daily cap only when it is a
 * free-tier image that did not fail. Failed generations never consume
 * cap; paid rows and videos never count.
 */
export function countsTowardCap(input: {
  status: string;
  mediaType?: string;
  tier?: string;
}): boolean {
  const { status, mediaType = 'image', tier = 'free' } = input;
  if (tier !== 'free' || mediaType !== 'image') return false;
  return status !== 'failed';
}

const TRANSITIONS: Record<string, readonly string[]> = {
  queued: ['generating', 'failed'],
  generating: ['done', 'failed'],
  done: [],
  failed: [],
};

/** queued → generating → done | failed (queued may also fail fast). */
export function canTransition(from: string, to: string): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function isValidPrompt(prompt: unknown): prompt is string {
  return (
    typeof prompt === 'string' &&
    prompt.trim().length >= PROMPT_MIN &&
    prompt.trim().length <= PROMPT_MAX
  );
}

/* ---------------- deliverable validation ---------------- */

/** Max deliverable bytes: 8MB per image file, 32MB per video file. */
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 32 * 1024 * 1024;

export const IMAGE_MIMES = ['image/jpeg', 'image/png'] as const;
export const VIDEO_MIMES = ['video/mp4'] as const;

export type DeliverableMime = 'image/jpeg' | 'image/png' | 'video/mp4';

/**
 * Sniff the MIME from magic bytes. JPEG: FF D8 FF. PNG: 89 50 4E 47
 * 0D 0A 1A 0A. MP4: 'ftyp' box at offset 4. Null when unrecognized —
 * the deliver endpoint rejects those outright.
 */
export function mimeForMagic(bytes: Uint8Array): DeliverableMime | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 && // f
    bytes[5] === 0x74 && // t
    bytes[6] === 0x79 && // y
    bytes[7] === 0x70 // p
  ) {
    return 'video/mp4';
  }
  return null;
}

export function maxBytesForMime(mime: DeliverableMime): number {
  return mime === 'video/mp4' ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
}

/* ---------------- waiting-room stage keywords ---------------- */

/**
 * Canonical stage labels the watcher/operator may set on a generation.
 * The waiting room renders these verbatim; unknown stages are shown
 * as-is but never crash the UI.
 */
export const STAGE_KEYWORDS = [
  'queued',
  'rendering',
  'watermarking',
  'delivering',
] as const;

export type StageKeyword = (typeof STAGE_KEYWORDS)[number];

export function isKnownStage(stage: string | null | undefined): boolean {
  if (!stage) return false;
  return (STAGE_KEYWORDS as readonly string[]).includes(stage);
}
