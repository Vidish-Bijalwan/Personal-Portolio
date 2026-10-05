/**
 * Pixaura — unit tests for the free-tier / paid-video policy.
 * Pure logic: no DB, no network.
 */
import { describe, it, expect } from 'vitest';
import {
  FREE_DAILY_CAP,
  PROMPT_MAX,
  PROMPT_MIN,
  UNLOCK_PRICE_PAISE,
  VIDEO_PRICE_PAISE,
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
  STUCK_AFTER_MINUTES,
  canRetryFromStatus,
  canTransition,
  countsTowardCap,
  failureMessageFor,
  isFreeTier,
  isGenerationErrorCode,
  isKnownStage,
  isStuck,
  isValidPrompt,
  isVideo,
  istDayStart,
  maxBytesForMime,
  mimeForMagic,
  suggestSaferPrompt,
} from '../policy';

describe('constants', () => {
  it('exposes the product constants', () => {
    expect(FREE_DAILY_CAP).toBe(3);
    expect(PROMPT_MAX).toBe(2000);
    expect(PROMPT_MIN).toBe(1);
    expect(UNLOCK_PRICE_PAISE).toBe(2900); // ₹29
    expect(VIDEO_PRICE_PAISE).toBe(9900); // ₹99
    expect(IMAGE_MAX_BYTES).toBe(8 * 1024 * 1024);
    expect(VIDEO_MAX_BYTES).toBe(32 * 1024 * 1024);
  });
});

describe('istDayStart', () => {
  // IST = UTC+5:30. 23:59 IST Oct 5 == 18:29 UTC Oct 5;
  // 00:01 IST Oct 6 == 18:31 UTC Oct 5.
  it('splits 23:59 IST and 00:01 IST into different days', () => {
    const late = new Date(Date.UTC(2026, 9, 5, 18, 29, 0)); // 23:59 IST Oct 5
    const early = new Date(Date.UTC(2026, 9, 5, 18, 31, 0)); // 00:01 IST Oct 6
    const a = istDayStart(late);
    const b = istDayStart(early);
    expect(a.getTime()).not.toBe(b.getTime());
    // Oct 5 00:00 IST == Oct 4 18:30 UTC
    expect(a.toISOString()).toBe('2026-10-04T18:30:00.000Z');
    expect(b.toISOString()).toBe('2026-10-05T18:30:00.000Z');
  });

  it('keeps two times on the same IST day together', () => {
    const morning = new Date(Date.UTC(2026, 9, 5, 1, 0, 0)); // 06:30 IST Oct 5
    const night = new Date(Date.UTC(2026, 9, 5, 18, 0, 0)); // 23:30 IST Oct 5
    expect(istDayStart(morning).getTime()).toBe(istDayStart(night).getTime());
  });

  it('handles exactly midnight IST', () => {
    const midnight = new Date(Date.UTC(2026, 9, 4, 18, 30, 0)); // 00:00 IST Oct 5
    expect(istDayStart(midnight).toISOString()).toBe('2026-10-04T18:30:00.000Z');
  });
});

describe('countsTowardCap', () => {
  it('counts queued/generating/done free images', () => {
    for (const status of ['queued', 'generating', 'done']) {
      expect(countsTowardCap({ status })).toBe(true);
      expect(countsTowardCap({ status, tier: 'free', mediaType: 'image' })).toBe(true);
    }
  });

  it('never counts failed rows', () => {
    expect(countsTowardCap({ status: 'failed' })).toBe(false);
  });

  it('never counts videos or paid rows', () => {
    expect(countsTowardCap({ status: 'queued', mediaType: 'video' })).toBe(false);
    expect(countsTowardCap({ status: 'done', mediaType: 'video', tier: 'paid' })).toBe(false);
    expect(countsTowardCap({ status: 'queued', tier: 'paid' })).toBe(false);
  });
});

describe('canTransition', () => {
  it('allows the queued → generating → done/failed chain', () => {
    expect(canTransition('queued', 'generating')).toBe(true);
    expect(canTransition('generating', 'done')).toBe(true);
    expect(canTransition('generating', 'failed')).toBe(true);
  });

  it('allows queued → failed (fast fail)', () => {
    expect(canTransition('queued', 'failed')).toBe(true);
  });

  it('rejects skips, reversals and terminal exits', () => {
    expect(canTransition('queued', 'done')).toBe(false);
    expect(canTransition('generating', 'queued')).toBe(false);
    expect(canTransition('done', 'failed')).toBe(false);
    expect(canTransition('done', 'generating')).toBe(false);
    expect(canTransition('failed', 'queued')).toBe(false);
    expect(canTransition('failed', 'generating')).toBe(false);
    expect(canTransition('queued', 'queued')).toBe(false);
  });

  it('rejects unknown states', () => {
    expect(canTransition('nope', 'done')).toBe(false);
    expect(canTransition('queued', 'nope')).toBe(false);
  });
});

describe('isValidPrompt', () => {
  it('accepts 1..2000 chars after trimming', () => {
    expect(isValidPrompt('a')).toBe(true);
    expect(isValidPrompt('x'.repeat(2000))).toBe(true);
    expect(isValidPrompt('  hello  ')).toBe(true);
  });

  it('rejects empty, over-long and non-string prompts', () => {
    expect(isValidPrompt('')).toBe(false);
    expect(isValidPrompt('   ')).toBe(false);
    expect(isValidPrompt('x'.repeat(2001))).toBe(false);
    expect(isValidPrompt(null)).toBe(false);
    expect(isValidPrompt(undefined)).toBe(false);
    expect(isValidPrompt(42)).toBe(false);
  });
});

describe('isVideo / isFreeTier', () => {
  it('classifies media and tier strings', () => {
    expect(isVideo('video')).toBe(true);
    expect(isVideo('image')).toBe(false);
    expect(isFreeTier('free')).toBe(true);
    expect(isFreeTier('paid')).toBe(false);
  });
});

describe('mimeForMagic', () => {
  it('sniffs JPEG, PNG and MP4 magic bytes', () => {
    expect(mimeForMagic(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 1]))).toBe('image/jpeg');
    expect(
      mimeForMagic(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ).toBe('image/png');
    // MP4: 'ftyp' box at offset 4
    expect(
      mimeForMagic(
        new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d])
      )
    ).toBe('video/mp4');
  });

  it('returns null for garbage or truncated input', () => {
    expect(mimeForMagic(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]))).toBeNull();
    expect(mimeForMagic(new Uint8Array([]))).toBeNull();
    expect(mimeForMagic(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });

  it('maps mimes to size caps', () => {
    expect(maxBytesForMime('image/jpeg')).toBe(8 * 1024 * 1024);
    expect(maxBytesForMime('image/png')).toBe(8 * 1024 * 1024);
    expect(maxBytesForMime('video/mp4')).toBe(32 * 1024 * 1024);
  });
});

describe('isKnownStage', () => {
  it('recognizes canonical stage keywords', () => {
    for (const s of ['queued', 'rendering', 'watermarking', 'delivering']) {
      expect(isKnownStage(s)).toBe(true);
    }
    expect(isKnownStage('zzz')).toBe(false);
    expect(isKnownStage(null)).toBe(false);
    expect(isKnownStage(undefined)).toBe(false);
  });
});

describe('failure classes', () => {
  it('recognizes the advisory error codes', () => {
    expect(isGenerationErrorCode('content_refused')).toBe(true);
    expect(isGenerationErrorCode('technical')).toBe(true);
    expect(isGenerationErrorCode('other')).toBe(false);
    expect(isGenerationErrorCode(null)).toBe(false);
    expect(isGenerationErrorCode(undefined)).toBe(false);
  });

  it('maps each class to fixed user-safe copy, never raw text', () => {
    const refused = failureMessageFor('content_refused');
    expect(refused).toContain('declined');
    expect(refused).toContain('free tries are untouched');
    expect(failureMessageFor('technical')).toContain('grill flared up');
    // unknown / missing codes fall back to the technical message
    expect(failureMessageFor('traceback: foo')).toBe(failureMessageFor('technical'));
    expect(failureMessageFor(undefined)).toBe(failureMessageFor('technical'));
  });

  it('never consumes quota: failed rows excluded whatever the class', () => {
    expect(countsTowardCap({ status: 'failed' })).toBe(false);
    // countsTowardCap is status-driven; the DB counter must match
    expect(STUCK_AFTER_MINUTES).toBe(15);
  });
});

describe('suggestSaferPrompt', () => {
  it('rephrases common safety triggers, preserving the rest', () => {
    expect(suggestSaferPrompt('a dragon on fire')).toBe(
      'a dragon lit by warm dramatic light'
    );
    expect(suggestSaferPrompt('portrait with blood on the floor')).toBe(
      'portrait with red paint on the floor'
    );
    expect(suggestSaferPrompt('BURNING city at night')).toBe(
      'glowing with warm light city at night'
    );
  });

  it('only replaces whole words (firefly is safe)', () => {
    expect(suggestSaferPrompt('a firefly in a jar')).toBeNull();
  });

  it('returns null when nothing matches or input is not a string', () => {
    expect(suggestSaferPrompt('a calm lake at dawn')).toBeNull();
    expect(suggestSaferPrompt(null)).toBeNull();
    expect(suggestSaferPrompt(undefined)).toBeNull();
    expect(suggestSaferPrompt('')).toBeNull();
  });
});

describe('isStuck', () => {
  const now = Date.UTC(2026, 9, 5, 12, 0, 0);

  it('flags queued/generating rows idle past the threshold', () => {
    const old = new Date(now - 16 * 60 * 1000);
    expect(isStuck('queued', old, now)).toBe(true);
    expect(isStuck('generating', old, now)).toBe(true);
  });

  it('does not flag fresh rows or terminal rows', () => {
    const fresh = new Date(now - 5 * 60 * 1000);
    expect(isStuck('queued', fresh, now)).toBe(false);
    expect(isStuck('generating', fresh, now)).toBe(false);
    const old = new Date(now - 60 * 60 * 1000);
    expect(isStuck('done', old, now)).toBe(false);
    expect(isStuck('failed', old, now)).toBe(false);
  });

  it('handles string timestamps and bad input', () => {
    const old = new Date(now - 20 * 60 * 1000).toISOString();
    expect(isStuck('queued', old, now)).toBe(true);
    expect(isStuck('queued', null, now)).toBe(false);
    expect(isStuck('queued', 'not-a-date', now)).toBe(false);
  });
});

describe('canRetryFromStatus', () => {
  it('allows retries from failed and still-open rows', () => {
    expect(canRetryFromStatus('failed')).toBe(true);
    expect(canRetryFromStatus('queued')).toBe(true);
    expect(canRetryFromStatus('generating')).toBe(true);
  });

  it('never retries finished or unknown rows', () => {
    expect(canRetryFromStatus('done')).toBe(false);
    expect(canRetryFromStatus('nope')).toBe(false);
  });
});
