/**
 * Chunked upload — pure planning logic tests (chunk math, resume merge,
 * intake validation, retry backoff).
 */
import { describe, expect, it } from 'vitest';
import {
  CHUNKED_MAX_IMAGE_BYTES,
  CHUNKED_MAX_VIDEO_BYTES,
  CHUNK_UPLOAD_THRESHOLD_BYTES,
  DEFAULT_CHUNK_BYTES,
  MAX_CHUNK_BYTES,
  MIN_CHUNK_BYTES,
  chunkRange,
  mergeReceivedIndices,
  missingIndices,
  planChunks,
  retryDelayMs,
  shouldUseChunkedUpload,
  validateChunkableFile,
} from '../chunk-plan';

describe('planChunks', () => {
  it('splits evenly divisible sizes exactly', () => {
    const p = planChunks(4 * DEFAULT_CHUNK_BYTES, DEFAULT_CHUNK_BYTES);
    expect(p.chunkSize).toBe(DEFAULT_CHUNK_BYTES);
    expect(p.totalChunks).toBe(4);
  });

  it('rounds up for a partial last chunk', () => {
    const p = planChunks(2.5 * 1024 * 1024, 1024 * 1024);
    expect(p.totalChunks).toBe(3);
  });

  it('a file smaller than one chunk is a single chunk', () => {
    const p = planChunks(100, 1024 * 1024);
    expect(p.totalChunks).toBe(1);
  });

  it('clamps an oversized requested chunk to MAX_CHUNK_BYTES', () => {
    const p = planChunks(10 * 1024 * 1024, 8 * 1024 * 1024);
    expect(p.chunkSize).toBe(MAX_CHUNK_BYTES);
    expect(p.totalChunks).toBe(5);
  });

  it('clamps a tiny requested chunk up to MIN_CHUNK_BYTES', () => {
    const p = planChunks(1024 * 1024, 1024);
    expect(p.chunkSize).toBe(MIN_CHUNK_BYTES);
  });

  it('rejects non-positive sizes', () => {
    expect(() => planChunks(0)).toThrow();
    expect(() => planChunks(-5)).toThrow();
  });

  it('100 MB video needs exactly 100 default chunks', () => {
    const p = planChunks(100 * 1024 * 1024);
    expect(p.totalChunks).toBe(100);
  });
});

describe('chunkRange', () => {
  it('covers the file exactly with no gaps or overlaps', () => {
    const size = 2_500_000;
    const { chunkSize, totalChunks } = planChunks(size, 1_000_000);
    let cursor = 0;
    for (let i = 0; i < totalChunks; i++) {
      const r = chunkRange(i, chunkSize, size);
      expect(r.start).toBe(cursor);
      expect(r.end).toBeGreaterThan(r.start);
      cursor = r.end;
    }
    expect(cursor).toBe(size);
  });
});

describe('shouldUseChunkedUpload', () => {
  it('uses direct upload at/below the 4 MB threshold', () => {
    expect(shouldUseChunkedUpload(CHUNK_UPLOAD_THRESHOLD_BYTES)).toBe(false);
    expect(shouldUseChunkedUpload(1024)).toBe(false);
  });
  it('uses chunked upload above the threshold', () => {
    expect(shouldUseChunkedUpload(CHUNK_UPLOAD_THRESHOLD_BYTES + 1)).toBe(true);
  });
});

describe('mergeReceivedIndices', () => {
  it('merges local + server progress, sorted and de-duplicated', () => {
    expect(mergeReceivedIndices([0, 2, 2], [1, 2, 5], 6)).toEqual([0, 1, 2, 5]);
  });
  it('drops out-of-range indices from a stale resume record', () => {
    expect(mergeReceivedIndices([0, 99, -1, 1.5], [2], 3)).toEqual([0, 2]);
  });
  it('handles empty inputs', () => {
    expect(mergeReceivedIndices([], [], 4)).toEqual([]);
  });
});

describe('missingIndices', () => {
  it('lists only the gaps, ascending', () => {
    expect(missingIndices([0, 2], 4)).toEqual([1, 3]);
  });
  it('returns everything when nothing was received', () => {
    expect(missingIndices([], 3)).toEqual([0, 1, 2]);
  });
  it('returns nothing when complete', () => {
    expect(missingIndices([0, 1, 2], 3)).toEqual([]);
  });
});

describe('validateChunkableFile', () => {
  it('accepts a normal image', () => {
    expect(
      validateChunkableFile({ name: 'a.png', size: 1024, type: 'image/png' })
    ).toBeNull();
  });
  it('accepts a large video within the 100 MB total', () => {
    expect(
      validateChunkableFile({
        name: 'clip.mp4',
        size: 90 * 1024 * 1024,
        type: 'video/mp4',
      })
    ).toBeNull();
  });
  it('rejects images over the 8 MB per-file total', () => {
    const msg = validateChunkableFile({
      name: 'big.png',
      size: CHUNKED_MAX_IMAGE_BYTES + 1,
      type: 'image/png',
    });
    expect(msg).toContain('8');
    expect(msg).toContain('big.png');
  });
  it('rejects videos over the 100 MB per-file total', () => {
    const msg = validateChunkableFile({
      name: 'huge.mp4',
      size: CHUNKED_MAX_VIDEO_BYTES + 1,
      type: 'video/mp4',
    });
    expect(msg).toContain('100');
  });
  it('rejects non image/video extensions', () => {
    expect(
      validateChunkableFile({ name: 'evil.exe', size: 1024, type: '' })
    ).toContain("isn't an image or video");
  });
  it('rejects a MIME that contradicts the extension family', () => {
    const msg = validateChunkableFile({
      name: 'x.png',
      size: 1024,
      type: 'video/mp4',
    });
    expect(msg).toContain('rejected to be safe');
  });
  it('rejects empty files', () => {
    expect(
      validateChunkableFile({ name: 'a.png', size: 0, type: 'image/png' })
    ).toContain('empty');
  });
});

describe('retryDelayMs', () => {
  it('grows exponentially and stays bounded', () => {
    const d0 = retryDelayMs(0);
    const d3 = retryDelayMs(3);
    expect(d0).toBeGreaterThanOrEqual(400);
    expect(d0).toBeLessThan(700);
    expect(d3).toBeGreaterThanOrEqual(3200);
    expect(retryDelayMs(99)).toBeLessThanOrEqual(8000);
  });
});
