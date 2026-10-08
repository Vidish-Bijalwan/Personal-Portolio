/**
 * Chunked upload — server orchestration tests: initiate validation,
 * chunk write guards, finalize (assembly + magic-byte check on the
 * assembled file), and resolve scoping. Runs against a temp
 * ETCH_CHUNK_ROOT; no network, no DB.
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  finalizeChunkedUpload,
  getUploadStatus,
  initiateChunkedUpload,
  resolveChunkedUploads,
  writeUploadChunk,
} from '../chunked-uploads';
import { writeChunk, getSession } from '../chunk-store';

const PNG_HEAD = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2];
const EXE_HEAD = [0x4d, 0x5a, 0x90, 0x00, 3, 0, 0, 0, 4, 0]; // MZ…

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'chunked-uploads-test-'));
  process.env.ETCH_CHUNK_ROOT = root;
});

afterEach(async () => {
  delete process.env.ETCH_CHUNK_ROOT;
  await rm(root, { recursive: true, force: true });
});

/** Full happy path: initiate → chunks → finalize. Returns the fileId. */
async function uploadBytes(
  userId: string,
  name: string,
  mime: string,
  bytes: number[],
  chunkSize = 65536
): Promise<string> {
  const init = await initiateChunkedUpload(userId, {
    name,
    size: bytes.length,
    mimeType: mime,
    chunkSize,
  });
  expect(init.ok).toBe(true);
  const s = init.session!;
  for (let i = 0; i < s.totalChunks; i++) {
    const start = i * s.chunkSize;
    const slice = Buffer.from(bytes.slice(start, start + s.chunkSize));
    await writeChunk(s.sessionId, i, slice, slice.byteLength);
  }
  const fin = await finalizeChunkedUpload(userId, s.sessionId);
  expect(fin.ok).toBe(true);
  return fin.file!.fileId;
}

describe('initiateChunkedUpload', () => {
  it('rejects non image/video extensions', async () => {
    const r = await initiateChunkedUpload('u1', {
      name: 'evil.exe',
      size: 100,
      mimeType: 'application/x-msdownload',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("isn't an image or video");
  });

  it('rejects images over the 8 MB per-file total', async () => {
    const r = await initiateChunkedUpload('u1', {
      name: 'big.png',
      size: 9 * 1024 * 1024,
      mimeType: 'image/png',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain('8');
  });

  it('accepts videos up to the 100 MB per-file total with a sane plan', async () => {
    const r = await initiateChunkedUpload('u1', {
      name: 'clip.mp4',
      size: 100 * 1024 * 1024,
      mimeType: 'video/mp4',
    });
    expect(r.ok).toBe(true);
    expect(r.session!.chunkSize).toBeLessThanOrEqual(2 * 1024 * 1024);
    expect(r.session!.totalChunks).toBe(100);
  });

  it('rejects videos over 100 MB', async () => {
    const r = await initiateChunkedUpload('u1', {
      name: 'huge.mp4',
      size: 101 * 1024 * 1024,
      mimeType: 'video/mp4',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain('100');
  });

  it('rejects a MIME that contradicts the extension', async () => {
    const r = await initiateChunkedUpload('u1', {
      name: 'x.png',
      size: 100,
      mimeType: 'video/mp4',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain('rejected to be safe');
  });
});

describe('writeUploadChunk', () => {
  it('410s an unknown session (expired / other instance) — never fakes success', async () => {
    const r = await writeUploadChunk(
      'u1',
      '99999999-2222-3333-4444-555555555555',
      0,
      Buffer.alloc(4)
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(410);
  });

  it('403s a session owned by another user', async () => {
    const init = await initiateChunkedUpload('owner', {
      name: 'a.png',
      size: 8,
      mimeType: 'image/png',
      chunkSize: 4,
    });
    const r = await writeUploadChunk(
      'intruder',
      init.session!.sessionId,
      0,
      Buffer.alloc(4)
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(403);
  });

  it('413s a chunk over the 2 MB cap', async () => {
    const init = await initiateChunkedUpload('u1', {
      name: 'a.mp4',
      size: 3 * 1024 * 1024,
      mimeType: 'video/mp4',
    });
    const r = await writeUploadChunk(
      'u1',
      init.session!.sessionId,
      0,
      Buffer.alloc(2 * 1024 * 1024 + 1)
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(413);
  });

  it('400s an out-of-range chunk index', async () => {
    const init = await initiateChunkedUpload('u1', {
      name: 'a.png',
      size: 8,
      mimeType: 'image/png',
      chunkSize: 4,
    });
    const r = await writeUploadChunk(
      'u1',
      init.session!.sessionId,
      7,
      Buffer.alloc(4)
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(400);
  });

  it('accepts a valid chunk and reports progress', async () => {
    const init = await initiateChunkedUpload('u1', {
      name: 'a.png',
      size: 8,
      mimeType: 'image/png',
      chunkSize: 4,
    });
    const s = init.session!;
    const r = await writeUploadChunk('u1', s.sessionId, 0, Buffer.alloc(4, 9));
    expect(r.ok).toBe(true);
    expect(r.receivedCount).toBe(1);
    const st = await getUploadStatus('u1', s.sessionId);
    expect(st.ok).toBe(true);
    expect(st.session!.received).toEqual([0]);
  });
});

describe('finalizeChunkedUpload', () => {
  it('assembles a valid PNG and promotes it to a finalized file', async () => {
    const fileId = await uploadBytes('u1', 'a.png', 'image/png', PNG_HEAD);
    expect(typeof fileId).toBe('string');
  });

  it('fails clearly when a chunk is missing — never a truncated file', async () => {
    // 200 KB file in 64 KB chunks → 4 chunks; skip chunk 1.
    const bytes = [...PNG_HEAD, ...new Array(200_000 - PNG_HEAD.length).fill(7)];
    const init = await initiateChunkedUpload('u1', {
      name: 'a.png',
      size: bytes.length,
      mimeType: 'image/png',
      chunkSize: 65536,
    });
    const s = init.session!;
    expect(s.totalChunks).toBe(4);
    for (const i of [0, 2, 3]) {
      const start = i * s.chunkSize;
      const slice = Buffer.from(bytes.slice(start, start + s.chunkSize));
      await writeChunk(s.sessionId, i, slice, slice.byteLength);
    }
    const fin = await finalizeChunkedUpload('u1', s.sessionId);
    expect(fin.ok).toBe(false);
    expect(fin.error).toMatch(/chunk 1.*missing/);
  });

  it('rejects assembled bytes that masquerade (exe renamed to .png)', async () => {
    const init = await initiateChunkedUpload('u1', {
      name: 'evil.png',
      size: EXE_HEAD.length,
      mimeType: 'image/png',
      chunkSize: 4,
    });
    const s = init.session!;
    for (let i = 0; i < s.totalChunks; i++) {
      const start = i * s.chunkSize;
      const slice = Buffer.from(EXE_HEAD.slice(start, start + s.chunkSize));
      await writeChunk(s.sessionId, i, slice, slice.byteLength);
    }
    const fin = await finalizeChunkedUpload('u1', s.sessionId);
    expect(fin.ok).toBe(false);
    expect(fin.status).toBe(400);
    expect(fin.error).toContain('claims to be a .png file');
    // the poisoned session is destroyed, not left behind
    expect(await getSession(s.sessionId)).toBeNull();
  });

  it('410s an expired/unknown session', async () => {
    const fin = await finalizeChunkedUpload(
      'u1',
      '99999999-2222-3333-4444-555555555555'
    );
    expect(fin.ok).toBe(false);
    expect(fin.status).toBe(410);
  });
});

describe('resolveChunkedUploads', () => {
  it('resolves a finalized fileId into a File for the order routes', async () => {
    const fileId = await uploadBytes('u1', 'a.png', 'image/png', PNG_HEAD);
    const r = await resolveChunkedUploads('u1', [fileId]);
    expect(r.ok).toBe(true);
    expect(r.files).toHaveLength(1);
    expect(r.files![0].name).toBe('a.png');
    expect(r.files![0].size).toBe(PNG_HEAD.length);
    expect(r.files![0].type).toBe('image/png');
    const bytes = new Uint8Array(await r.files![0].arrayBuffer());
    expect([...bytes.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('410s an unknown fileId (expired before the order)', async () => {
    const r = await resolveChunkedUploads('u1', [
      '99999999-2222-3333-4444-555555555555',
    ]);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(410);
  });

  it('403s a fileId owned by another user', async () => {
    const fileId = await uploadBytes('owner', 'a.png', 'image/png', PNG_HEAD);
    const r = await resolveChunkedUploads('intruder', [fileId]);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(403);
  });

  it('400s a malformed fileId', async () => {
    const r = await resolveChunkedUploads('u1', ['../../etc/passwd']);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(400);
  });

  it('de-duplicates repeated ids', async () => {
    const fileId = await uploadBytes('u1', 'a.png', 'image/png', PNG_HEAD);
    const r = await resolveChunkedUploads('u1', [fileId, fileId]);
    expect(r.ok).toBe(true);
    expect(r.files).toHaveLength(1);
  });
});
