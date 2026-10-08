/**
 * Madam Muse — order-route glue for chunked uploads (SERVER ONLY).
 *
 * The order routes (`/api/generation/start`, `/api/free/generate`) accept
 * multipart `files` today. Large files (>4 MB) now travel the chunked
 * pipeline instead and arrive as `uploadIds` form fields. This helper
 * resolves those ids into `File` objects so the assembled file feeds the
 * SAME attachments mechanism (bytea persistence) as direct uploads.
 *
 * Validation split (deliberate):
 *  - direct multipart files → the route's EXISTING validateUploads() +
 *    verifyUploadContents() gates, byte-for-byte unchanged;
 *  - chunked files → validated at chunk initiate (allowlist + per-file
 *    totals), at finalize (magic bytes on assembled bytes), and again
 *    here (ownership, caps, magic bytes) by resolveChunkedUploads().
 *  - the merged set keeps the existing max-files cap.
 */
import { ATTACH_MAX_FILES } from '@/lib/vilish/attachments';
import {
  releaseChunkedUploads,
  resolveChunkedUploads,
} from './chunked-uploads';

export { releaseChunkedUploads };

/** `uploadIds` may be repeated fields or comma-separated values. */
export function parseUploadIds(form: FormData): string[] {
  const ids: string[] = [];
  for (const v of form.getAll('uploadIds')) {
    if (typeof v !== 'string') continue;
    for (const part of v.split(',')) {
      const id = part.trim();
      if (id && !ids.includes(id)) ids.push(id);
    }
  }
  return ids.slice(0, ATTACH_MAX_FILES);
}

export interface AttachedUploads {
  ok: boolean;
  error?: string;
  status?: number;
  /** direct + chunked files, in order — drop-in for the route's `files`. */
  files: File[];
  /** chunked files only (already validated by the chunk pipeline). */
  chunkedFiles: File[];
  /** finalized file ids to release after the order persists. */
  chunkedFileIds: string[];
}

/**
 * Resolve `uploadIds` from a multipart form and merge with the direct
 * `files`. Returns `{ ok: false, error, status }` on any problem —
 * the route answers with a clear 4xx instead of a partial attachment set.
 */
export async function attachChunkedUploads(
  form: FormData,
  userId: string,
  directFiles: File[]
): Promise<AttachedUploads> {
  const ids = parseUploadIds(form);
  if (ids.length === 0) {
    return { ok: true, files: directFiles, chunkedFiles: [], chunkedFileIds: [] };
  }
  const resolved = await resolveChunkedUploads(userId, ids);
  if (!resolved.ok || !resolved.files) {
    return {
      ok: false,
      error: resolved.error ?? 'Could not read your uploaded files.',
      status: resolved.status ?? 400,
      files: directFiles,
      chunkedFiles: [],
      chunkedFileIds: [],
    };
  }
  const files = [...directFiles, ...resolved.files];
  if (files.length > ATTACH_MAX_FILES) {
    return {
      ok: false,
      error: `Attach at most ${ATTACH_MAX_FILES} files — you picked ${files.length}.`,
      status: 400,
      files: directFiles,
      chunkedFiles: [],
      chunkedFileIds: [],
    };
  }
  return {
    ok: true,
    files,
    chunkedFiles: resolved.files,
    chunkedFileIds: resolved.fileIds ?? [],
  };
}
