/**
 * Madam Muse — chunked upload session store (SERVER ONLY: node:fs).
 *
 * Sessions live under os.tmpdir()/etch-chunk-uploads/:
 *   sessions/<sessionId>/manifest.json
 *   sessions/<sessionId>/chunks/<index>.part
 *   final/<fileId>.json            (metadata)
 *   final/<fileId>.bin             (assembled bytes)
 *
 * SERVERLESS HONESTY: /tmp is per-instance and ephemeral on Vercel. A
 * session created on one instance is invisible to another, so if an
 * instance rotates mid-upload the next chunk request gets a clear
 * SESSION_NOT_FOUND/410 and the client re-initiates instead of the
 * server faking success. Stale sessions are swept lazily (TTL 2h for
 * open sessions, 6h for finalized files awaiting their order).
 *
 * `ETCH_CHUNK_ROOT` overrides the root (used by tests).
 */
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2h
export const FINAL_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const SWEEP_MIN_INTERVAL_MS = 5 * 60 * 1000;

export interface ChunkSessionManifest {
  sessionId: string;
  userId: string;
  name: string;
  mimeType: string;
  size: number;
  chunkSize: number;
  totalChunks: number;
  createdAt: number;
  updatedAt: number;
}

export interface FinalFileMeta {
  fileId: string;
  userId: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

function storeRoot(): string {
  return process.env.ETCH_CHUNK_ROOT ?? path.join(os.tmpdir(), 'etch-chunk-uploads');
}

/** UUIDs only — anything else is a path-traversal attempt. */
export function isSafeId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function sessionDir(sessionId: string): string {
  return path.join(storeRoot(), 'sessions', sessionId);
}
function manifestPath(sessionId: string): string {
  return path.join(sessionDir(sessionId), 'manifest.json');
}
function chunkPath(sessionId: string, index: number): string {
  return path.join(sessionDir(sessionId), 'chunks', `${index}.part`);
}
function finalMetaPath(fileId: string): string {
  return path.join(storeRoot(), 'final', `${fileId}.json`);
}
function finalDataPath(fileId: string): string {
  return path.join(storeRoot(), 'final', `${fileId}.bin`);
}

async function readJson<T>(p: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(p, 'utf8')) as T;
  } catch {
    return null;
  }
}

/** Remove sessions older than SESSION_TTL_MS and finals older than FINAL_TTL_MS. */
export async function sweepStale(force = false): Promise<void> {
  const root = storeRoot();
  const marker = path.join(root, '.last-sweep');
  if (!force) {
    try {
      const st = await fs.stat(marker);
      if (Date.now() - st.mtimeMs < SWEEP_MIN_INTERVAL_MS) return;
    } catch {
      /* first sweep */
    }
  }
  const now = Date.now();
  // sessions
  const sessionsDir = path.join(root, 'sessions');
  try {
    for (const id of await fs.readdir(sessionsDir)) {
      if (!isSafeId(id)) continue;
      const m = await readJson<ChunkSessionManifest>(manifestPath(id));
      const staleAt = m ? m.updatedAt : 0;
      if (now - staleAt > SESSION_TTL_MS) {
        await fs.rm(sessionDir(id), { recursive: true, force: true }).catch(() => {});
      }
    }
  } catch {
    /* nothing stored yet */
  }
  // finals
  const finalDir = path.join(root, 'final');
  try {
    for (const f of await fs.readdir(finalDir)) {
      if (!f.endsWith('.json')) continue;
      const id = f.slice(0, -'.json'.length);
      if (!isSafeId(id)) continue;
      const meta = await readJson<FinalFileMeta>(finalMetaPath(id));
      if (meta && now - meta.createdAt > FINAL_TTL_MS) {
        await fs.unlink(finalMetaPath(id)).catch(() => {});
        await fs.unlink(finalDataPath(id)).catch(() => {});
      }
    }
  } catch {
    /* nothing stored yet */
  }
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(marker, String(now)).catch(() => {});
}

export async function createSession(m: ChunkSessionManifest): Promise<void> {
  if (!isSafeId(m.sessionId)) throw new Error('unsafe session id');
  const dir = sessionDir(m.sessionId);
  await fs.mkdir(path.join(dir, 'chunks'), { recursive: true });
  await fs.writeFile(manifestPath(m.sessionId), JSON.stringify(m));
  await sweepStale();
}

export async function getSession(sessionId: string): Promise<ChunkSessionManifest | null> {
  if (!isSafeId(sessionId)) return null;
  await sweepStale();
  const m = await readJson<ChunkSessionManifest>(manifestPath(sessionId));
  if (!m) return null;
  if (Date.now() - m.updatedAt > SESSION_TTL_MS) {
    await fs.rm(sessionDir(sessionId), { recursive: true, force: true }).catch(() => {});
    return null;
  }
  return m;
}

export async function touchSession(sessionId: string): Promise<void> {
  const m = await getSession(sessionId);
  if (!m) return;
  m.updatedAt = Date.now();
  await fs.writeFile(manifestPath(sessionId), JSON.stringify(m));
}

/** Idempotent: re-uploading the same index overwrites with identical bytes. */
export async function writeChunk(
  sessionId: string,
  index: number,
  data: Buffer,
  expectedSize: number
): Promise<void> {
  if (!isSafeId(sessionId)) throw new Error('unsafe session id');
  if (data.byteLength !== expectedSize) {
    throw new Error(
      `chunk ${index}: expected ${expectedSize} bytes, got ${data.byteLength}`
    );
  }
  await fs.writeFile(chunkPath(sessionId, index), data);
  await touchSession(sessionId);
}

export async function receivedIndices(sessionId: string): Promise<number[]> {
  if (!isSafeId(sessionId)) return [];
  const dir = path.join(sessionDir(sessionId), 'chunks');
  let names: string[];
  try {
    names = await fs.readdir(dir);
  } catch {
    return [];
  }
  const out: number[] = [];
  for (const n of names) {
    const m = /^(\d+)\.part$/.exec(n);
    if (m) out.push(Number(m[1]));
  }
  return out.sort((a, b) => a - b);
}

/**
 * Assemble all chunks in order. Throws when a chunk is missing or the
 * total size doesn't match the manifest — the finalize route converts
 * this into a clear 4xx, never a truncated file.
 */
export async function assembleSession(
  m: ChunkSessionManifest
): Promise<Buffer> {
  const parts: Buffer[] = [];
  let total = 0;
  for (let i = 0; i < m.totalChunks; i++) {
    let data: Buffer;
    try {
      data = await fs.readFile(chunkPath(m.sessionId, i));
    } catch {
      throw new Error(`chunk ${i} of ${m.totalChunks} missing`);
    }
    parts.push(data);
    total += data.byteLength;
  }
  if (total !== m.size) {
    throw new Error(
      `assembled size ${total} does not match declared ${m.size}`
    );
  }
  return Buffer.concat(parts, total);
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (!isSafeId(sessionId)) return;
  await fs.rm(sessionDir(sessionId), { recursive: true, force: true }).catch(() => {});
}

export async function storeFinal(
  meta: FinalFileMeta,
  data: Buffer
): Promise<void> {
  if (!isSafeId(meta.fileId)) throw new Error('unsafe file id');
  const dir = path.join(storeRoot(), 'final');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(finalDataPath(meta.fileId), data);
  await fs.writeFile(finalMetaPath(meta.fileId), JSON.stringify(meta));
  await sweepStale();
}

export async function getFinal(
  fileId: string
): Promise<{ meta: FinalFileMeta; data: Buffer } | null> {
  if (!isSafeId(fileId)) return null;
  await sweepStale();
  const meta = await readJson<FinalFileMeta>(finalMetaPath(fileId));
  if (!meta) return null;
  if (Date.now() - meta.createdAt > FINAL_TTL_MS) {
    await fs.unlink(finalMetaPath(fileId)).catch(() => {});
    await fs.unlink(finalDataPath(fileId)).catch(() => {});
    return null;
  }
  let data: Buffer;
  try {
    data = await fs.readFile(finalDataPath(fileId));
  } catch {
    return null;
  }
  if (data.byteLength !== meta.size) return null;
  return { meta, data };
}

export async function deleteFinal(fileId: string): Promise<void> {
  if (!isSafeId(fileId)) return;
  await fs.unlink(finalMetaPath(fileId)).catch(() => {});
  await fs.unlink(finalDataPath(fileId)).catch(() => {});
}
