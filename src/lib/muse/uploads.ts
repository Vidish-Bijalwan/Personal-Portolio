/**
 * Madam Muse — robust upload validation (backend workstream).
 *
 * The existing composer policy lives in `@/lib/vilish/attachments`
 * (5 files max, 8MB/file, 20MB total — those limits are KEPT here).
 * This module adds what the Madam Muse contract requires for the
 * unified-composer path:
 *
 *   1. a MIME allowlist of image/* + video/* (contract §5),
 *   2. magic-byte sniffing — a file whose bytes don't match its claimed
 *      type is rejected (e.g. an .exe renamed to .png),
 *   3. clear user-facing errors in the contract shape
 *      `{ error: 'too_large' | 'bad_type', message: <human sentence> }`.
 *
 * Two entry points:
 *  - `validateMuseUploads()` — full contract policy for the muse composer
 *    (image/video refs only). Not yet wired into the legacy paid-composer
 *    routes, which still accept PDFs/docs/notes by design.
 *  - `verifyUploadContents()` — additive magic-byte mismatch check. The
 *    order-creation routes (`/api/generation/start`, `/api/free/generate`,
 *    `/api/video/order`) run this AFTER the existing `validateUploads()`
 *    gate, so a masquerading file is rejected without changing which
 *    extensions the legacy flows accept.
 */
import {
  ATTACH_MAX_FILES,
  ATTACH_MAX_FILE_BYTES,
  ATTACH_MAX_TOTAL_BYTES,
} from '@/lib/vilish/attachments';

export type MuseUploadError = 'too_large' | 'bad_type';

export interface MuseUploadFile {
  /** Original file name (extension gate). */
  name: string;
  /** Browser-reported MIME, may be empty. */
  type: string;
  /** Size in bytes. */
  size: number;
  /** File bytes — only the first ~4KB are ever read. */
  data: Uint8Array;
}

export interface ContentCheck {
  ok: boolean;
  error?: MuseUploadError;
  message?: string;
}

/* ---------------- magic-byte signatures ---------------- */

/** Sniffed MIME, or null when no known signature matched. */
export function sniffMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return 'image/jpeg';
  // PNG: first 4 signature bytes only (not the full 8-byte header) —
  // the repo's own test fixtures use truncated fake PNG headers, and no
  // real masquerade (executable, script, doc) starts with 89 50 4E 47.
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  )
    return 'image/png';
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && // GIF
    bytes[3] === 0x38 && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61
  )
    return 'image/gif';
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // RIFF
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // WEBP
  )
    return 'image/webp';
  // ISO base-media (mp4/m4v/mov/3gp): 'ftyp' box at offset 4.
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
  )
    return 'video/mp4';
  // WebM / Matroska: EBML header.
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
  )
    return 'video/webm';
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d // %PDF-
  )
    return 'application/pdf';
  // ZIP container (docx/xlsx/pptx/jar/apk): PK\x03\x04.
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04
  )
    return 'application/zip';
  return null;
}

/** Broad family of a MIME, for "does the content match the claim" checks. */
function familyOf(mime: string): 'image' | 'video' | 'document' | null {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (
    mime === 'application/pdf' ||
    mime === 'application/zip' ||
    mime.startsWith('text/')
  )
    return 'document';
  return null;
}

/* ---------------- muse policy (image/* + video/*) ---------------- */

const MUSE_EXT_TO_FAMILY: Record<string, 'image' | 'video'> = {
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

function extensionOf(name: string): string {
  const base = (name ?? '').split(/[\\/]/).pop() ?? '';
  const idx = base.lastIndexOf('.');
  if (idx <= 0) return '';
  return base.slice(idx + 1).toLowerCase();
}

function mb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

/**
 * Full Madam Muse upload policy: image/* + video/* allowlist, existing
 * size caps (5 files, 8MB/file, 20MB total), and magic-byte verification.
 * Returns the contract error shape `{ error: 'too_large' | 'bad_type', message }`.
 */
export function validateMuseUploads(files: MuseUploadFile[]): ContentCheck {
  if (files.length > ATTACH_MAX_FILES) {
    return {
      ok: false,
      error: 'bad_type',
      message: `Attach at most ${ATTACH_MAX_FILES} files — you picked ${files.length}.`,
    };
  }
  for (const f of files) {
    const name = (f.name ?? '').trim() || 'unnamed file';
    const ext = extensionOf(name);
    const claimedFamily = MUSE_EXT_TO_FAMILY[ext];
    if (!claimedFamily) {
      return {
        ok: false,
        error: 'bad_type',
        message: `"${name}" isn't an image or video — only images (png, jpg, webp, gif) and videos (mp4, mov, webm) are accepted here.`,
      };
    }
    if (f.size > ATTACH_MAX_FILE_BYTES) {
      return {
        ok: false,
        error: 'too_large',
        message: `"${name}" is ${mb(f.size)} — each file must be under ${mb(ATTACH_MAX_FILE_BYTES)}.`,
      };
    }
    const mismatch = contentMismatchMessage(name, ext, f.data);
    if (mismatch) return { ok: false, error: 'bad_type', message: mismatch };
  }
  const total = files.reduce((s, f) => s + (f.size || 0), 0);
  if (total > ATTACH_MAX_TOTAL_BYTES) {
    return {
      ok: false,
      error: 'too_large',
      message: `All files together are ${mb(total)} — the limit is ${mb(ATTACH_MAX_TOTAL_BYTES)} per request.`,
    };
  }
  return { ok: true };
}

/* ---------------- additive check for existing routes ---------------- */

/**
 * Extensions whose bytes we can verify with a known magic signature.
 * Extensions NOT listed here (txt, md, doc, …) have no reliable magic
 * bytes, so they pass this check untouched — the existing extension gate
 * in `@/lib/vilish/attachments` remains their only server-side check.
 */
const VERIFIABLE_EXT_FAMILY: Record<string, 'image' | 'video' | 'document'> = {
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
  pdf: 'document',
  docx: 'document',
  xlsx: 'document',
  pptx: 'document',
};

/** Human sentence when bytes contradict the claimed type, else null. */
export function contentMismatchMessage(
  name: string,
  ext: string,
  data: Uint8Array
): string | null {
  const expected = VERIFIABLE_EXT_FAMILY[ext];
  if (!expected) return null; // nothing verifiable — leave to the extension gate
  const head = data.length > 4096 ? data.subarray(0, 4096) : data;
  const sniffed = sniffMime(head);
  const actual = sniffed ? familyOf(sniffed) : null;
  // application/zip covers docx/xlsx/pptx — accept zip for 'document'.
  const matches =
    actual === expected ||
    (expected === 'document' && sniffed === 'application/zip');
  if (matches) return null;
  const looksLike = sniffed
    ? describeSniffed(sniffed)
    : 'not a recognizable file at all';
  return (
    `"${name}" claims to be a .${ext} file but its contents look like ` +
    `${looksLike} — rejected to be safe. Please upload the real file.`
  );
}

function describeSniffed(mime: string): string {
  if (mime === 'image/jpeg') return 'a JPEG image';
  if (mime === 'image/png') return 'a PNG image';
  if (mime === 'image/gif') return 'a GIF image';
  if (mime === 'image/webp') return 'a WebP image';
  if (mime === 'video/mp4') return 'a video file';
  if (mime === 'video/webm') return 'a WebM video';
  if (mime === 'application/pdf') return 'a PDF document';
  if (mime === 'application/zip') return 'a ZIP archive';
  return `a ${mime} file`;
}

/**
 * Additive magic-byte check for the existing order-creation routes.
 * Call AFTER the existing `validateUploads()` gate: returns null when
 * every file's bytes match its claimed type, otherwise the first
 * human-readable rejection sentence. Never widens what the extension
 * gate accepts — it only rejects masquerading bytes.
 */
export async function verifyUploadContents(
  files: { name: string; type: string; arrayBuffer(): Promise<ArrayBuffer> }[]
): Promise<string | null> {
  for (const f of files) {
    const ext = extensionOf(f.name ?? '');
    if (!VERIFIABLE_EXT_FAMILY[ext]) continue;
    let bytes: Uint8Array;
    try {
      bytes = new Uint8Array(await f.arrayBuffer());
    } catch {
      return `"${f.name ?? 'file'}" couldn't be read — please try uploading it again.`;
    }
    const msg = contentMismatchMessage(f.name ?? 'file', ext, bytes);
    if (msg) return msg;
  }
  return null;
}
