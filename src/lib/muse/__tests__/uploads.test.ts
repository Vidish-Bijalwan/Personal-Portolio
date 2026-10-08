/**
 * Madam Muse upload validation tests: magic-byte sniffing + the contract
 * error shape `{ error: 'too_large' | 'bad_type', message }`.
 */
import { describe, expect, it } from 'vitest';
import {
  contentMismatchMessage,
  sniffMime,
  validateMuseUploads,
  verifyUploadContents,
  type MuseUploadFile,
} from '../uploads';
import { ATTACH_MAX_FILE_BYTES } from '@/lib/vilish/attachments';

function pad(head: number[], total = 64): Uint8Array {
  const b = new Uint8Array(total);
  b.set(head, 0);
  return b;
}

const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG = pad([0xff, 0xd8, 0xff, 0xe0]);
const GIF = pad([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const WEBP = pad([0x52, 0x49, 0x46, 0x46, 0x24, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
const MP4 = pad([0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
const WEBM = pad([0x1a, 0x45, 0xdf, 0xa3]);
const PDF = pad([0x25, 0x50, 0x44, 0x46, 0x2d]);
const EXE = pad([0x4d, 0x5a, 0x90, 0x00]); // MZ header

function file(name: string, data: Uint8Array, type = ''): MuseUploadFile {
  return { name, type, size: data.length, data };
}

describe('sniffMime', () => {
  it('detects image and video signatures', () => {
    expect(sniffMime(PNG)).toBe('image/png');
    expect(sniffMime(JPEG)).toBe('image/jpeg');
    expect(sniffMime(GIF)).toBe('image/gif');
    expect(sniffMime(WEBP)).toBe('image/webp');
    expect(sniffMime(MP4)).toBe('video/mp4');
    expect(sniffMime(WEBM)).toBe('video/webm');
    expect(sniffMime(PDF)).toBe('application/pdf');
  });
  it('returns null for unknown bytes', () => {
    expect(sniffMime(EXE)).toBeNull();
    expect(sniffMime(new Uint8Array(0))).toBeNull();
  });
});

describe('contentMismatchMessage', () => {
  it('accepts matching content', () => {
    expect(contentMismatchMessage('a.png', 'png', PNG)).toBeNull();
    expect(contentMismatchMessage('clip.mp4', 'mp4', MP4)).toBeNull();
  });
  it('rejects an executable masquerading as an image', () => {
    const msg = contentMismatchMessage('evil.png', 'png', EXE);
    expect(msg).toContain('evil.png');
    expect(msg).toContain('.png');
  });
  it('passes extensions without known magic (txt/md) untouched', () => {
    expect(contentMismatchMessage('note.txt', 'txt', EXE)).toBeNull();
  });
});

describe('validateMuseUploads (contract policy: image/* + video/*)', () => {
  it('accepts valid PNG/JPEG/MP4 fixtures', () => {
    const r = validateMuseUploads([
      file('ref.png', PNG, 'image/png'),
      file('photo.jpg', JPEG, 'image/jpeg'),
      file('clip.mp4', MP4, 'video/mp4'),
    ]);
    expect(r).toEqual({ ok: true });
  });
  it('rejects an executable masquerading as an image', () => {
    const r = validateMuseUploads([file('evil.png', EXE, 'image/png')]);
    expect(r.ok).toBe(false);
    expect(r.error).toBe('bad_type');
    expect(r.message).toContain('evil.png');
  });
  it('rejects oversize files with too_large', () => {
    const big = new Uint8Array(ATTACH_MAX_FILE_BYTES + 1);
    big.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const r = validateMuseUploads([file('huge.png', big)]);
    expect(r.ok).toBe(false);
    expect(r.error).toBe('too_large');
  });
  it('rejects non image/video types with bad_type', () => {
    const r = validateMuseUploads([file('doc.pdf', PDF, 'application/pdf')]);
    expect(r.ok).toBe(false);
    expect(r.error).toBe('bad_type');
  });
  it('rejects too many files', () => {
    const files = Array.from({ length: 6 }, (_, i) =>
      file(`r${i}.png`, PNG)
    );
    const r = validateMuseUploads(files);
    expect(r.ok).toBe(false);
    expect(r.error).toBe('bad_type');
  });
});

describe('verifyUploadContents (additive check for existing routes)', () => {
  async function asFiles(entries: MuseUploadFile[]) {
    return entries.map((f) => ({
      name: f.name,
      type: f.type,
      arrayBuffer: async () => f.data.buffer as unknown as ArrayBuffer,
    }));
  }
  it('returns null for genuine files', async () => {
    const msg = await verifyUploadContents(
      await asFiles([file('a.png', PNG), file('b.pdf', PDF, 'application/pdf')])
    );
    expect(msg).toBeNull();
  });
  it('returns a message for a masquerading executable', async () => {
    const msg = await verifyUploadContents(await asFiles([file('evil.png', EXE)]));
    expect(msg).toContain('evil.png');
  });
  it('skips unverifiable extensions (txt)', async () => {
    const msg = await verifyUploadContents(
      await asFiles([file('note.txt', EXE, 'text/plain')])
    );
    expect(msg).toBeNull();
  });
});
