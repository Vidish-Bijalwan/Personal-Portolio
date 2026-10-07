/**
 * Etch — free-tier image + paid video generation policy.
 *
 * Pure logic: no JSX, no I/O, no imports from server modules.
 * Unit-testable in isolation.
 */

import { priceOf } from '../pricing/catalog';

/** Max free image generations per user per IST day. */
export const FREE_DAILY_CAP = 3;

/** Prompt length bounds (characters). */
export const PROMPT_MIN = 1;
export const PROMPT_MAX = 2000;

/** Clean-image unlock, integer paise — always the catalog single-image price. */
export const UNLOCK_PRICE_PAISE = priceOf('single-image');
/** Paid 5s video clip, integer paise — always the catalog clip price. */
export const VIDEO_PRICE_PAISE = priceOf('clip-5s');

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

/* ---------------- failure classes ---------------- */

/**
 * Advisory failure class stored on generations.error_code.
 *
 * - 'content_refused': the provider's safety filter declined the prompt
 *   (a word like "fire" or "blood" tripped it) — the user needs a
 *   rephrase, not a blind retry.
+ * - 'missing_reference': the prompt asks for a specific person/photo
+ *   ("the person in the reference photo") but no reference file was
+ *   attached — the user must attach the photo and try again. Never
+ *   generate a random face in its place.
 * - 'technical': everything else (timeouts, provider errors, stalls,
 *   reap-after-too-many-attempts).
 *
 * status stays 'failed' for both; neither ever consumes the free cap.
 */
export const GENERATION_ERROR_CODES = [
  'content_refused',
  'missing_reference',
  'technical',
] as const;

export type GenerationErrorCode = (typeof GENERATION_ERROR_CODES)[number];

export function isGenerationErrorCode(v: unknown): v is GenerationErrorCode {
  return (
    typeof v === 'string' &&
    (GENERATION_ERROR_CODES as readonly string[]).includes(v)
  );
}

/**
 * The ONLY user-visible messages for classified failures. Watcher and
 * admin routes store these fixed strings — never raw provider/watcher
 * text, so tracebacks and provider internals can't reach the client.
 */
export const FAILURE_COPY: Record<GenerationErrorCode, string> = {
  content_refused:
    'The image model declined this prompt — usually a word like "fire" or "blood" trips the safety filter. Reword it and try again; your free tries are untouched.',
  missing_reference:
    'This prompt asks for a specific person, but no reference photo was attached — attach the photo and try again. Your free tries are untouched.',
  technical: 'The grill flared up — try again. It’s still free.',
};

export function failureMessageFor(code: unknown): string {
  return isGenerationErrorCode(code) ? FAILURE_COPY[code] : FAILURE_COPY.technical;
}

/**
 * Heuristic rephrase hints for prompts a safety filter is likely to
 * refuse. Word-boundary, case-insensitive; the first hit wins and the
 * rest of the prompt is preserved verbatim. Returns null when nothing
 * matches — callers should only offer the "safer rephrase" path when a
 * concrete suggestion exists. Best-effort hint, not a guarantee the
 * filter will accept it.
 */
const SAFETY_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bon fire\b/gi, 'lit by warm dramatic light'],
  [/\bburning\b/gi, 'glowing with warm light'],
  [/\bbloodied\b/gi, 'painted with red paint'],
  [/\bbloody\b/gi, 'deep red'],
  [/\bblood\b/gi, 'red paint'],
  [/\bcorpse\b/gi, 'sleeping figure'],
  [/\bgun\b/gi, 'camera'],
  [/\bweapon\b/gi, 'harmless object'],
];

export function suggestSaferPrompt(prompt: unknown): string | null {
  if (typeof prompt !== 'string') return null;
  for (const [pattern, replacement] of SAFETY_REPLACEMENTS) {
    const re: RegExp = pattern;
    const sub: string = replacement;
    const candidate: string = prompt.replace(re, sub);
    if (candidate !== prompt) return candidate;
  }
  return null;
}

/* ---------------- stuck detection & retry ---------------- */

/**
 * A queued/generating row with no update for this long is treated as
 * stuck (watcher down, provider hung). The admin reaper uses 45 min;
 * the watch room flags it far earlier so the user can re-queue instead
 * of staring at an animation.
 */
export const STUCK_AFTER_MINUTES = 15;

export function isStuck(
  status: string,
  updatedAt: Date | string | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (status !== 'queued' && status !== 'generating') return false;
  if (!updatedAt) return false;
  const t =
    updatedAt instanceof Date ? updatedAt.getTime() : new Date(updatedAt).getTime();
  if (Number.isNaN(t)) return false;
  return nowMs - t > STUCK_AFTER_MINUTES * 60 * 1000;
}

/**
 * Statuses a retry may launch from: a terminal failure, or a still-open
 * row the user is re-queuing after a stall. 'done' rows are never
 * retried (the preview/download path already exists).
 */
export function canRetryFromStatus(status: string): boolean {
  return status === 'failed' || status === 'queued' || status === 'generating';
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
