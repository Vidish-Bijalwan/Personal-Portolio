/**
 * Madam Muse — chunked upload server orchestration (SERVER ONLY).
 *
 * Used by the /api/uploads/chunks/* routes and by the order routes that
 * resolve chunked `uploadIds` into File objects. Validation reuses the
 * EXISTING gates from `@/lib/muse/uploads`:
 *  - extension+MIME allowlist (image/* + video/*),
 *  - magic-byte / content-mismatch check on the ASSEMBLED bytes,
 *  - per-file totals (images 8 MB, videos 100 MB) enforced at initiate,
 *    finalize, and resolve time.
 */
import {
  assembleSession,
  createSession,
  deleteFinal,
  deleteSession,
  getFinal,
  getSession,
  isSafeId,
  receivedIndices,
  storeFinal,
  writeChunk,
  type ChunkSessionManifest,
  type FinalFileMeta,
} from './chunk-store';
import {
  CHUNKED_EXT_FAMILY,
  DEFAULT_CHUNK_BYTES,
  MAX_CHUNK_BYTES,
  extensionOf,
  maxTotalForExt,
  mb,
  planChunks,
} from './chunk-plan';
import { contentMismatchMessage } from './uploads';

export interface InitiateInput {
  name: string;
  size: number;
  mimeType: string;
  chunkSize?: number;
}

export interface InitiateResult {
  ok: boolean;
  error?: string;
  session?: {
    sessionId: string;
    chunkSize: number;
    totalChunks: number;
    expiresAt: number;
  };
}

function familyOfMime(mime: string): 'image' | 'video' | null {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return null;
}

/**
 * Validate an initiate request and create the session. Returns
 * `{ ok: false, error }` with a human sentence when the file may not
 * enter the chunked pipeline.
 */
export async function initiateChunkedUpload(
  userId: string,
  input: InitiateInput
): Promise<InitiateResult> {
  const name = (input.name ?? '').trim() || 'unnamed file';
  const ext = extensionOf(name);
  const family = CHUNKED_EXT_FAMILY[ext];
  if (!family) {
    return {
      ok: false,
      error: `"${name}" isn't an image or video — chunked upload accepts only images (png, jpg, webp, gif) and videos (mp4, mov, webm).`,
    };
  }
  const mime = (input.mimeType ?? '').toLowerCase();
  const mimeFamily = familyOfMime(mime);
  if (mime && (!mimeFamily || mimeFamily !== family)) {
    return {
      ok: false,
      error: `"${name}" claims to be a .${ext} file but reports a ${mime || 'missing'} type — rejected to be safe.`,
    };
  }
  const size = Number(input.size);
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, error: `"${name}" has no readable size.` };
  }
  const cap = maxTotalForExt(ext);
  if (size > cap) {
    return {
      ok: false,
      error: `"${name}" is ${mb(size)} — chunked upload accepts ${family === 'video' ? 'videos' : 'images'} up to ${mb(cap)} per file.`,
    };
  }
  const { chunkSize, totalChunks } = planChunks(
    size,
    Number(input.chunkSize) || DEFAULT_CHUNK_BYTES
  );
  const manifest: ChunkSessionManifest = {
    sessionId: crypto.randomUUID(),
    userId,
    name,
    mimeType: mime || (family === 'video' ? 'video/mp4' : 'image/png'),
    size,
    chunkSize,
    totalChunks,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await createSession(manifest);
  return {
    ok: true,
    session: {
      sessionId: manifest.sessionId,
      chunkSize,
      totalChunks,
      expiresAt: manifest.createdAt + 2 * 60 * 60 * 1000,
    },
  };
}

export interface ChunkWriteResult {
  ok: boolean;
  error?: string;
  status?: number;
  receivedCount?: number;
}

/**
 * Store one chunk. Idempotent — re-sending an index overwrites it.
 * The per-chunk byte cap (MAX_CHUNK_BYTES) is enforced here so a single
 * request can never blow the serverless body limit.
 */
export async function writeUploadChunk(
  userId: string,
  sessionId: string,
  index: number,
  data: Buffer
): Promise<ChunkWriteResult> {
  if (!isSafeId(sessionId)) {
    return { ok: false, error: 'Unknown upload session.', status: 404 };
  }
  if (data.byteLength > MAX_CHUNK_BYTES) {
    return {
      ok: false,
      error: `Chunk is ${mb(data.byteLength)} — keep each chunk under ${mb(MAX_CHUNK_BYTES)}.`,
      status: 413,
    };
  }
  const m = await getSession(sessionId);
  if (!m) {
    return {
      ok: false,
      error:
        'This upload session expired or moved to another server — please retry the upload from the start.',
      status: 410,
    };
  }
  if (m.userId !== userId) {
    return { ok: false, error: 'Not your upload session.', status: 403 };
  }
  if (!Number.isInteger(index) || index < 0 || index >= m.totalChunks) {
    return {
      ok: false,
      error: `Chunk ${index} is out of range (0..${m.totalChunks - 1}).`,
      status: 400,
    };
  }
  // Expected size: full chunkSize except the last chunk, which is the remainder.
  const isLast = index === m.totalChunks - 1;
  const expected = isLast ? m.size - m.chunkSize * (m.totalChunks - 1) : m.chunkSize;
  if (data.byteLength > expected || (!isLast && data.byteLength !== expected)) {
    return {
      ok: false,
      error: `Chunk ${index} has the wrong size — expected ${expected} bytes.`,
      status: 400,
    };
  }
  try {
    await writeChunk(sessionId, index, data, data.byteLength);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Could not store the chunk.',
      status: 500,
    };
  }
  const received = await receivedIndices(sessionId);
  return { ok: true, receivedCount: received.length };
}

export interface FinalizeResult {
  ok: boolean;
  error?: string;
  status?: number;
  file?: { fileId: string; name: string; size: number; mimeType: string };
}

/**
 * Assemble the session, run the EXISTING content validation
 * (magic-byte check via contentMismatchMessage + size re-check) on the
 * assembled bytes, then promote to a finalized file the order routes
 * can resolve via `uploadIds`.
 */
export async function finalizeChunkedUpload(
  userId: string,
  sessionId: string
): Promise<FinalizeResult> {
  if (!isSafeId(sessionId)) {
    return { ok: false, error: 'Unknown upload session.', status: 404 };
  }
  const m = await getSession(sessionId);
  if (!m) {
    return {
      ok: false,
      error:
        'This upload session expired or moved to another server — please retry the upload from the start.',
      status: 410,
    };
  }
  if (m.userId !== userId) {
    return { ok: false, error: 'Not your upload session.', status: 403 };
  }
  let data: Buffer;
  try {
    data = await assembleSession(m);
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : 'Could not assemble the file.',
      status: 400,
    };
  }
  // Size re-check on the assembled file (per-file TOTALS, not per-request).
  const ext = extensionOf(m.name);
  const cap = maxTotalForExt(ext);
  if (data.byteLength > cap) {
    return {
      ok: false,
      error: `"${m.name}" is ${mb(data.byteLength)} — the limit is ${mb(cap)} per file.`,
      status: 413,
    };
  }
  // Magic-byte check on the ASSEMBLED bytes — the same gate the direct
  // path runs via verifyUploadContents().
  const mismatch = contentMismatchMessage(m.name, ext, new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
  if (mismatch) {
    await deleteSession(sessionId);
    return { ok: false, error: mismatch, status: 400 };
  }
  const fileId = crypto.randomUUID();
  const meta: FinalFileMeta = {
    fileId,
    userId,
    name: m.name,
    mimeType: m.mimeType,
    size: data.byteLength,
    createdAt: Date.now(),
  };
  await storeFinal(meta, data);
  await deleteSession(sessionId);
  return {
    ok: true,
    file: { fileId, name: m.name, size: data.byteLength, mimeType: m.mimeType },
  };
}

export interface SessionStatus {
  sessionId: string;
  name: string;
  size: number;
  mimeType: string;
  chunkSize: number;
  totalChunks: number;
  received: number[];
  expiresAt: number;
}

export async function getUploadStatus(
  userId: string,
  sessionId: string
): Promise<{ ok: boolean; error?: string; status?: number; session?: SessionStatus }> {
  if (!isSafeId(sessionId)) {
    return { ok: false, error: 'Unknown upload session.', status: 404 };
  }
  const m = await getSession(sessionId);
  if (!m) {
    return { ok: false, error: 'Upload session expired.', status: 410 };
  }
  if (m.userId !== userId) {
    return { ok: false, error: 'Not your upload session.', status: 403 };
  }
  const received = await receivedIndices(sessionId);
  return {
    ok: true,
    session: {
      sessionId: m.sessionId,
      name: m.name,
      size: m.size,
      mimeType: m.mimeType,
      chunkSize: m.chunkSize,
      totalChunks: m.totalChunks,
      received,
      expiresAt: m.createdAt + 2 * 60 * 60 * 1000,
    },
  };
}

export interface ResolveResult {
  ok: boolean;
  error?: string;
  status?: number;
  files?: File[];
  fileIds?: string[];
}

/**
 * Resolve finalized `uploadIds` into File objects for the order routes,
 * so the assembled file feeds the SAME attachments mechanism as direct
 * multipart uploads. Re-checks ownership, size caps, and magic bytes —
 * a finalized fileId alone never bypasses validation.
 */
export async function resolveChunkedUploads(
  userId: string,
  fileIds: string[]
): Promise<ResolveResult> {
  const files: File[] = [];
  const seen: string[] = [];
  for (const raw of fileIds) {
    const id = (raw ?? '').trim();
    if (!id || seen.includes(id)) continue;
    seen.push(id);
    if (!isSafeId(id)) {
      return { ok: false, error: `Unknown upload "${id}".`, status: 400 };
    }
    const rec = await getFinal(id);
    if (!rec) {
      return {
        ok: false,
        error:
          'One of your uploads expired before the order was placed — please upload it again.',
        status: 410,
      };
    }
    if (rec.meta.userId !== userId) {
      return { ok: false, error: 'Not your upload.', status: 403 };
    }
    const ext = extensionOf(rec.meta.name);
    if (!CHUNKED_EXT_FAMILY[ext]) {
      return { ok: false, error: `"${rec.meta.name}" is no longer an accepted type.`, status: 400 };
    }
    const cap = maxTotalForExt(ext);
    if (rec.meta.size > cap || rec.data.byteLength > cap) {
      return {
        ok: false,
        error: `"${rec.meta.name}" is ${mb(rec.data.byteLength)} — the limit is ${mb(cap)} per file.`,
        status: 413,
      };
    }
    const mismatch = contentMismatchMessage(
      rec.meta.name,
      ext,
      new Uint8Array(rec.data.buffer, rec.data.byteOffset, rec.data.byteLength)
    );
    if (mismatch) {
      return { ok: false, error: mismatch, status: 400 };
    }
    // Copy into an ArrayBuffer-backed view: Buffer's ArrayBufferLike
    // is not assignable to BlobPart under the DOM lib.
    const bytes = new Uint8Array(rec.data.byteLength);
    bytes.set(rec.data);
    files.push(new File([bytes], rec.meta.name, { type: rec.meta.mimeType }));
  }
  return { ok: true, files, fileIds: seen };
}

/** Release finalized files after the order persisted them (best-effort). */
export async function releaseChunkedUploads(fileIds: string[]): Promise<void> {
  for (const id of fileIds) {
    if (isSafeId(id)) await deleteFinal(id).catch(() => {});
  }
}
