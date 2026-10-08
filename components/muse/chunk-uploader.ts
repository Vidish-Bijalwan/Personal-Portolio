/**
 * Madam Muse — client chunked uploader (browser only).
 *
 * Used by the intake's upload areas for files above
 * CHUNK_UPLOAD_THRESHOLD_BYTES (4 MB). Smaller files keep the existing
 * direct multipart path untouched.
 *
 *  - Splits the file into ≤2 MB chunks and uploads them sequentially.
 *  - Persists progress in localStorage keyed by a SHA-256 fingerprint of
 *    the file, so a reload resumes instead of restarting; the server
 *    status endpoint is authoritative on resume.
 *  - Retries failed chunks with exponential backoff; a 410
 *    (expired/rotated session) re-initiates the session and restarts.
 *  - Reports progress via onProgress; supports AbortSignal.
 */
import {
  ATTACH_MAX_FILES,
  validateUploads,
} from "@/lib/vilish/attachments";
import {
  CHUNK_UPLOAD_THRESHOLD_BYTES,
  DEFAULT_CHUNK_BYTES,
  mergeReceivedIndices,
  missingIndices,
  planChunks,
  retryDelayMs,
  validateChunkableFile,
} from "@/lib/muse/chunk-plan";

export {
  CHUNK_UPLOAD_THRESHOLD_BYTES,
  validateChunkableFile,
};

export interface AttachCheck {
  ok: boolean;
  message?: string;
}

/**
 * Combined attach validation for the composer: files at or under the
 * chunk threshold keep the EXISTING legacy policy byte-for-byte
 * (allowlist, 8MB/file, 20MB total); files above it are validated for
 * the chunked pipeline (image/video only, images ≤8MB, videos ≤100MB).
 * The merged set keeps the existing max-files cap.
 */
export function validateAttachableFiles(files: File[]): AttachCheck {
  if (files.length > ATTACH_MAX_FILES) {
    return {
      ok: false,
      message: `Attach at most ${ATTACH_MAX_FILES} files — you picked ${files.length}.`,
    };
  }
  const direct = files.filter((f) => f.size <= CHUNK_UPLOAD_THRESHOLD_BYTES);
  const chunked = files.filter((f) => f.size > CHUNK_UPLOAD_THRESHOLD_BYTES);
  if (direct.length > 0) {
    const check = validateUploads(
      direct.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );
    if (!check.ok) return { ok: false, message: check.message };
  }
  for (const f of chunked) {
    const problem = validateChunkableFile({
      name: f.name,
      size: f.size,
      type: f.type,
    });
    if (problem) return { ok: false, message: problem };
  }
  return { ok: true };
}

/**
 * Chunk-upload every file in `files` (all must be over the threshold —
 * use validateAttachableFiles first). Returns the finalized fileIds in
 * order. Progress is aggregated across the files.
 */
export async function chunkUploadFiles(
  files: File[],
  hooks: ChunkUploadHooks = {}
): Promise<string[]> {
  const grandTotal = files.reduce((sum, f) => sum + f.size, 0);
  const loaded = new Array<number>(files.length).fill(0);
  const ids: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const result = await uploadFileChunked(files[i], {
      ...hooks,
      onProgress: (p) => {
        loaded[i] = p.loaded;
        const sum = loaded.reduce((a, b) => a + b, 0);
        hooks.onProgress?.({
          loaded: sum,
          total: grandTotal,
          chunksDone: 0,
          chunksTotal: 0,
        });
      },
    });
    ids.push(result.fileId);
  }
  return ids;
}

const STORAGE_PREFIX = "muse:chunk-upload:";
const MAX_ATTEMPTS = 4;

interface StoredProgress {
  sessionId: string;
  chunkSize: number;
  totalChunks: number;
  size: number;
  name: string;
  updatedAt: number;
}

export interface ChunkUploadProgress {
  loaded: number;
  total: number;
  chunksDone: number;
  chunksTotal: number;
}

export interface ChunkUploadResult {
  fileId: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface ChunkUploadHooks {
  onProgress?: (p: ChunkUploadProgress) => void;
  signal?: AbortSignal;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const e = new Error("Upload cancelled.");
    e.name = "AbortError";
    throw e;
  }
}

/** SHA-256 fingerprint: name|size|lastModified + head/tail samples. */
export async function fingerprintFile(file: File): Promise<string> {
  const head = file.slice(0, 64 * 1024);
  const tail = file.slice(Math.max(0, file.size - 64 * 1024));
  const [headBuf, tailBuf] = await Promise.all([
    head.arrayBuffer(),
    tail.arrayBuffer(),
  ]);
  const meta = new TextEncoder().encode(
    `${file.name}|${file.size}|${file.lastModified}|`
  );
  const combined = new Uint8Array(
    meta.byteLength + headBuf.byteLength + tailBuf.byteLength
  );
  combined.set(meta, 0);
  combined.set(new Uint8Array(headBuf), meta.byteLength);
  combined.set(new Uint8Array(tailBuf), meta.byteLength + headBuf.byteLength);
  const digest = await crypto.subtle.digest("SHA-256", combined.buffer as ArrayBuffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function storageKey(fp: string): string {
  return `${STORAGE_PREFIX}${fp}`;
}

function readStored(fp: string): StoredProgress | null {
  try {
    const raw = localStorage.getItem(storageKey(fp));
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredProgress;
    if (!p.sessionId || !Number.isInteger(p.totalChunks) || p.totalChunks <= 0)
      return null;
    return p;
  } catch {
    return null;
  }
}

function writeStored(fp: string, p: StoredProgress): void {
  try {
    localStorage.setItem(storageKey(fp), JSON.stringify(p));
  } catch {
    /* storage full/blocked — resume just won't survive a reload */
  }
}

function clearStored(fp: string): void {
  try {
    localStorage.removeItem(storageKey(fp));
  } catch {
    /* ignore */
  }
}

async function postJson(url: string, body: unknown, signal?: AbortSignal) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json().catch(() => null);
  return { res, data };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Upload `file` through the chunked pipeline. The file MUST pass
 * validateChunkableFile() first (the caller shows that message).
 */
export async function uploadFileChunked(
  file: File,
  hooks: ChunkUploadHooks = {}
): Promise<ChunkUploadResult> {
  const { onProgress, signal } = hooks;
  const fp = await fingerprintFile(file);
  throwIfAborted(signal);

  const initiate = async () => {
    const { res, data } = await postJson(
      "/api/uploads/chunks/initiate",
      {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        chunkSize: DEFAULT_CHUNK_BYTES,
      },
      signal
    );
    if (!res.ok || !data?.sessionId) {
      throw new Error(
        typeof data?.error === "string" && data.error
          ? data.error
          : "Couldn't start the chunked upload — try again in a moment."
      );
    }
    return data as {
      sessionId: string;
      chunkSize: number;
      totalChunks: number;
    };
  };

  const fetchStatus = async (sessionId: string) => {
    const res = await fetch(
      `/api/uploads/chunks/status?sessionId=${encodeURIComponent(sessionId)}`,
      { signal }
    );
    if (res.status === 410 || res.status === 404) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) throw new Error("Couldn't read upload progress.");
    return data as {
      chunkSize: number;
      totalChunks: number;
      received: number[];
      size: number;
    };
  };

  // ── resume: reuse a stored session when the server still has it ──
  let sessionId: string;
  let chunkSize: number;
  let totalChunks: number;
  let received: number[] = [];

  const stored = readStored(fp);
  if (stored && stored.size === file.size && stored.name === file.name) {
    const st = await fetchStatus(stored.sessionId).catch(() => null);
    if (st && st.size === file.size) {
      sessionId = stored.sessionId;
      chunkSize = st.chunkSize;
      totalChunks = st.totalChunks;
      received = mergeReceivedIndices([], st.received ?? [], totalChunks);
    } else {
      const fresh = await initiate();
      sessionId = fresh.sessionId;
      chunkSize = fresh.chunkSize;
      totalChunks = fresh.totalChunks;
    }
  } else {
    const fresh = await initiate();
    sessionId = fresh.sessionId;
    chunkSize = fresh.chunkSize;
    totalChunks = fresh.totalChunks;
  }
  const plan = planChunks(file.size, chunkSize);
  chunkSize = plan.chunkSize;
  totalChunks = plan.totalChunks;
  writeStored(fp, {
    sessionId,
    chunkSize,
    totalChunks,
    size: file.size,
    name: file.name,
    updatedAt: Date.now(),
  });

  const report = (done: number) => {
    onProgress?.({
      loaded: Math.min(file.size, done * chunkSize),
      total: file.size,
      chunksDone: done,
      chunksTotal: totalChunks,
    });
  };
  report(received.length);

  const uploadChunk = async (index: number): Promise<void> => {
    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);
    for (let attempt = 0; ; attempt++) {
      throwIfAborted(signal);
      try {
        const form = new FormData();
        form.append("sessionId", sessionId);
        form.append("index", String(index));
        form.append("chunk", blob, `chunk-${index}`);
        const res = await fetch("/api/uploads/chunks/chunk", {
          method: "POST",
          body: form,
          signal,
        });
        if (res.status === 410) {
          // Session expired or landed on a fresh instance: start over.
          clearStored(fp);
          throw new Error("__REINIT__");
        }
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            typeof data?.error === "string" && data.error
              ? data.error
              : `Chunk ${index + 1} failed to upload.`
          );
        }
        return;
      } catch (e) {
        if (e instanceof Error && e.message === "__REINIT__") throw e;
        if (e instanceof Error && e.name === "AbortError") throw e;
        if (attempt + 1 >= MAX_ATTEMPTS) throw e;
        await sleep(retryDelayMs(attempt));
      }
    }
  };

  try {
    for (const index of missingIndices(received, totalChunks)) {
      throwIfAborted(signal);
      try {
        await uploadChunk(index);
      } catch (e) {
        if (e instanceof Error && e.message === "__REINIT__") {
          // Restart the whole upload on a fresh session.
          const fresh = await initiate();
          sessionId = fresh.sessionId;
          const p = planChunks(file.size, fresh.chunkSize);
          chunkSize = p.chunkSize;
          totalChunks = p.totalChunks;
          received = [];
          writeStored(fp, {
            sessionId,
            chunkSize,
            totalChunks,
            size: file.size,
            name: file.name,
            updatedAt: Date.now(),
          });
          report(0);
          // re-queue every chunk from the top
          const remaining = missingIndices([], totalChunks);
          for (const i of remaining) {
            throwIfAborted(signal);
            await uploadChunk(i);
            received.push(i);
            report(received.length);
          }
          break;
        }
        throw e;
      }
      received.push(index);
      report(received.length);
    }

    throwIfAborted(signal);
    const { res, data } = await postJson(
      "/api/uploads/chunks/finalize",
      { sessionId },
      signal
    );
    if (!res.ok || !data?.fileId) {
      throw new Error(
        typeof data?.error === "string" && data.error
          ? data.error
          : "Couldn't finish assembling your file — try again."
      );
    }
    clearStored(fp);
    report(totalChunks);
    return {
      fileId: data.fileId as string,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };
  } catch (e) {
    // Keep the stored progress so a retry resumes; only clear on success.
    throw e;
  }
}
