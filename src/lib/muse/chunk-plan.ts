/**
 * Madam Muse — chunked upload planning (isomorphic pure logic).
 *
 * No DOM, no node:fs, no fetch here — safe to import from both the
 * browser uploader and the server routes/tests.
 *
 * Contract:
 *  - Files above CHUNK_UPLOAD_THRESHOLD_BYTES (4 MB) use the chunked
 *    pipeline; smaller files keep the existing direct multipart path.
 *  - A single chunk is at most MAX_CHUNK_BYTES (2 MB) so each request
 *    stays far under the serverless body limits.
 *  - Per-file TOTALS (not per-request): images ≤ 8 MB, videos ≤ 100 MB.
 *    Videos may be larger because the chunked path exists precisely to
 *    carry footage the old single-request upload could not.
 */

/** Files bigger than this go through the chunked pipeline. */
export const CHUNK_UPLOAD_THRESHOLD_BYTES = 4 * 1024 * 1024; // 4 MB

/** Default chunk payload size (1 MB). */
export const DEFAULT_CHUNK_BYTES = 1024 * 1024;

/** Hard cap on a single chunk request (2 MB). */
export const MAX_CHUNK_BYTES = 2 * 1024 * 1024;

/** Smallest chunk the server will accept (64 KB). */
export const MIN_CHUNK_BYTES = 64 * 1024;

/** Per-file total for images in the chunked pipeline. */
export const CHUNKED_MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

/** Per-file total for videos in the chunked pipeline. */
export const CHUNKED_MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

/** Extensions the chunked pipeline accepts (image/* + video/* only). */
export const CHUNKED_EXT_FAMILY: Record<string, 'image' | 'video'> = {
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  webp: 'image',
  gif: 'image',
  mp4: 'video',
  m4v: 'video',
  mov: 'video',
  webm: 'video',
  mkv: 'video',
};

export function extensionOf(name: string): string {
  const base = (name ?? '').split(/[\\/]/).pop() ?? '';
  const idx = base.lastIndexOf('.');
  if (idx <= 0) return '';
  return base.slice(idx + 1).toLowerCase();
}

export function maxTotalForExt(ext: string): number {
  return CHUNKED_EXT_FAMILY[ext] === 'video'
    ? CHUNKED_MAX_VIDEO_BYTES
    : CHUNKED_MAX_IMAGE_BYTES;
}

export function mb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

/** True when the file should travel the chunked pipeline. */
export function shouldUseChunkedUpload(sizeBytes: number): boolean {
  return sizeBytes > CHUNK_UPLOAD_THRESHOLD_BYTES;
}

export interface ChunkPlan {
  chunkSize: number;
  totalChunks: number;
}

/**
 * Split a file into chunk ranges. Chunk size is clamped to
 * [MIN_CHUNK_BYTES, MAX_CHUNK_BYTES]; the last chunk may be smaller.
 */
export function planChunks(
  fileSize: number,
  requestedChunkSize = DEFAULT_CHUNK_BYTES
): ChunkPlan {
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    throw new Error('planChunks: fileSize must be a positive number');
  }
  const chunkSize = Math.min(
    MAX_CHUNK_BYTES,
    Math.max(MIN_CHUNK_BYTES, Math.floor(requestedChunkSize) || DEFAULT_CHUNK_BYTES)
  );
  return { chunkSize, totalChunks: Math.ceil(fileSize / chunkSize) };
}

/** Byte range [start, end) of chunk `index` within a file of `fileSize`. */
export function chunkRange(
  index: number,
  chunkSize: number,
  fileSize: number
): { start: number; end: number } {
  const start = index * chunkSize;
  return { start, end: Math.min(start + chunkSize, fileSize) };
}

/**
 * Merge two received-index sets (e.g. localStorage progress + server
 * status) into one sorted, de-duplicated list. Out-of-range indices are
 * dropped — a stale resume record must never mark a bogus chunk done.
 */
export function mergeReceivedIndices(
  a: Iterable<number>,
  b: Iterable<number>,
  totalChunks: number
): number[] {
  const seen = new Set<number>();
  for (const src of [a, b]) {
    for (const i of src) {
      if (Number.isInteger(i) && i >= 0 && i < totalChunks) seen.add(i);
    }
  }
  return [...seen].sort((x, y) => x - y);
}

/** Indices still missing, in ascending order. */
export function missingIndices(
  received: Iterable<number>,
  totalChunks: number
): number[] {
  const have = new Set<number>();
  for (const i of received) {
    if (Number.isInteger(i) && i >= 0 && i < totalChunks) have.add(i);
  }
  const missing: number[] = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!have.has(i)) missing.push(i);
  }
  return missing;
}

export interface ChunkableInput {
  name: string;
  size: number;
  /** Browser-reported MIME, may be empty. */
  type?: string;
}

/**
 * Intake-side validation for a file entering the chunked pipeline.
 * Mirrors the server's initiate gate so the client fails fast with the
 * same human message. Returns null when the file may be chunk-uploaded.
 */
export function validateChunkableFile(f: ChunkableInput): string | null {
  const name = (f.name ?? '').trim() || 'unnamed file';
  const ext = extensionOf(name);
  const family = CHUNKED_EXT_FAMILY[ext];
  if (!family) {
    return `"${name}" isn't an image or video — chunked upload accepts only images (png, jpg, webp, gif) and videos (mp4, mov, webm).`;
  }
  if (f.type && f.type !== '' && !f.type.startsWith(`${family}/`)) {
    return `"${name}" looks like a ${f.type} file, not a .${ext} ${family} — rejected to be safe.`;
  }
  if (!Number.isFinite(f.size) || f.size <= 0) {
    return `"${name}" is empty.`;
  }
  const cap = maxTotalForExt(ext);
  if (f.size > cap) {
    return `"${name}" is ${mb(f.size)} — chunked upload accepts ${family === 'video' ? 'videos' : 'images'} up to ${mb(cap)} per file.`;
  }
  return null;
}

/** Exponential backoff with jitter for chunk retries (ms). */
export function retryDelayMs(attempt: number): number {
  const base = 400 * 2 ** Math.max(0, attempt);
  return Math.min(8000, base + Math.floor(Math.random() * 250));
}
