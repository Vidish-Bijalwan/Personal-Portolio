/**
 * Chunked upload — session store tests (filesystem sessions under a
 * temp ETCH_CHUNK_ROOT: lifecycle, idempotent chunk writes, assembly,
 * TTL sweep, id safety).
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
  sweepStale,
  writeChunk,
  type ChunkSessionManifest,
} from '../chunk-store';

let root: string;

function manifest(over: Partial<ChunkSessionManifest> = {}): ChunkSessionManifest {
  return {
    sessionId: '11111111-2222-3333-4444-555555555555',
    userId: 'user-1',
    name: 'clip.mp4',
    mimeType: 'video/mp4',
    size: 10,
    chunkSize: 4,
    totalChunks: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...over,
  };
}

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'chunk-store-test-'));
  process.env.ETCH_CHUNK_ROOT = root;
});

afterEach(async () => {
  delete process.env.ETCH_CHUNK_ROOT;
  await rm(root, { recursive: true, force: true });
});

describe('isSafeId', () => {
  it('accepts UUIDs and rejects traversal attempts', () => {
    expect(isSafeId('11111111-2222-3333-4444-555555555555')).toBe(true);
    expect(isSafeId('../../etc/passwd')).toBe(false);
    expect(isSafeId('sessions/x')).toBe(false);
    expect(isSafeId('')).toBe(false);
  });
});

describe('session lifecycle', () => {
  it('creates, reads, and deletes a session', async () => {
    await createSession(manifest());
    const m = await getSession('11111111-2222-3333-4444-555555555555');
    expect(m?.name).toBe('clip.mp4');
    expect(m?.totalChunks).toBe(3);
    await deleteSession('11111111-2222-3333-4444-555555555555');
    expect(await getSession('11111111-2222-3333-4444-555555555555')).toBeNull();
  });

  it('returns null for unknown or unsafe ids', async () => {
    expect(await getSession('99999999-2222-3333-4444-555555555555')).toBeNull();
    expect(await getSession('../evil')).toBeNull();
  });
});

describe('chunk writes', () => {
  it('stores chunks idempotently and reports received indices', async () => {
    const m = manifest();
    await createSession(m);
    await writeChunk(m.sessionId, 0, Buffer.alloc(4, 1), 4);
    await writeChunk(m.sessionId, 2, Buffer.alloc(2, 3), 2);
    // re-upload of the same index is fine (resume-safe)
    await writeChunk(m.sessionId, 0, Buffer.alloc(4, 1), 4);
    expect(await receivedIndices(m.sessionId)).toEqual([0, 2]);
  });

  it('rejects a chunk whose bytes do not match the declared size', async () => {
    const m = manifest();
    await createSession(m);
    await expect(
      writeChunk(m.sessionId, 0, Buffer.alloc(3, 1), 4)
    ).rejects.toThrow();
  });
});

describe('assembleSession', () => {
  it('concatenates chunks in order and verifies the total size', async () => {
    const m = manifest();
    await createSession(m);
    await writeChunk(m.sessionId, 2, Buffer.from([7, 8]), 2);
    await writeChunk(m.sessionId, 0, Buffer.from([1, 2, 3, 4]), 4);
    await writeChunk(m.sessionId, 1, Buffer.from([5, 6, 0, 0]), 4);
    const data = await assembleSession(m);
    expect([...data]).toEqual([1, 2, 3, 4, 5, 6, 0, 0, 7, 8]);
  });

  it('throws on a missing chunk instead of producing a truncated file', async () => {
    const m = manifest();
    await createSession(m);
    await writeChunk(m.sessionId, 0, Buffer.alloc(4, 1), 4);
    await expect(assembleSession(m)).rejects.toThrow(/chunk 1.*missing/);
  });

  it('throws when assembled bytes do not match the declared size', async () => {
    const m = manifest({ size: 11 });
    await createSession(m);
    await writeChunk(m.sessionId, 0, Buffer.alloc(4, 1), 4);
    await writeChunk(m.sessionId, 1, Buffer.alloc(4, 1), 4);
    await writeChunk(m.sessionId, 2, Buffer.alloc(2, 1), 2);
    await expect(assembleSession(m)).rejects.toThrow(/does not match/);
  });
});

describe('final files', () => {
  it('stores and reads back a finalized file with its metadata', async () => {
    const meta = {
      fileId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      userId: 'user-1',
      name: 'clip.mp4',
      mimeType: 'video/mp4',
      size: 3,
      createdAt: Date.now(),
    };
    await storeFinal(meta, Buffer.from([1, 2, 3]));
    const rec = await getFinal(meta.fileId);
    expect(rec?.meta.name).toBe('clip.mp4');
    expect([...(rec?.data ?? [])]).toEqual([1, 2, 3]);
    await deleteFinal(meta.fileId);
    expect(await getFinal(meta.fileId)).toBeNull();
  });

  it('rejects reads where the stored bytes disagree with metadata', async () => {
    const meta = {
      fileId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      userId: 'user-1',
      name: 'clip.mp4',
      mimeType: 'video/mp4',
      size: 999, // lie
      createdAt: Date.now(),
    };
    await storeFinal(meta, Buffer.from([1, 2, 3]));
    expect(await getFinal(meta.fileId)).toBeNull();
  });
});

describe('sweepStale', () => {
  it('removes expired sessions but keeps fresh ones', async () => {
    const old = manifest({
      sessionId: '11111111-2222-3333-4444-555555555555',
      updatedAt: Date.now() - 3 * 60 * 60 * 1000,
    });
    const fresh = manifest({
      sessionId: '22222222-2222-3333-4444-555555555555',
      updatedAt: Date.now(),
    });
    await createSession(old);
    await createSession(fresh);
    await sweepStale(true);
    expect(await getSession(old.sessionId)).toBeNull();
    expect((await getSession(fresh.sessionId))?.sessionId).toBe(fresh.sessionId);
  });
});
