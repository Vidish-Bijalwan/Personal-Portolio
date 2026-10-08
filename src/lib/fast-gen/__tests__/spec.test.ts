/**
 * Etch fast-gen — unit tests for the speculative hash/match/expiry logic.
 * These functions are shared verbatim between the browser composer and the
 * server routes, so both sides provably compute the same hash.
 */
import { describe, expect, it } from 'vitest';
import {
  SPEC_DEBOUNCE_MS,
  SPEC_TTL_MS,
  hash64,
  normalizeSpecPrompt,
  specHashMatches,
  specIsExpired,
  specKey,
  speculativeHash,
} from '../spec';

describe('normalizeSpecPrompt', () => {
  it('trims, collapses whitespace, and lowercases', () => {
    expect(normalizeSpecPrompt('  A  red\n\tballoon  ')).toBe('a red balloon');
  });

  it('leaves already-clean prompts unchanged', () => {
    expect(normalizeSpecPrompt('a red balloon')).toBe('a red balloon');
  });
});

describe('specKey / speculativeHash', () => {
  const input = {
    prompt: 'A red balloon',
    quality: 'studio',
    aspectRatio: '1:1',
    mediaType: 'image',
  };

  it('is deterministic across calls', () => {
    expect(speculativeHash(input)).toBe(speculativeHash(input));
    expect(speculativeHash(input)).toMatch(/^[0-9a-f]{16}$/);
  });

  it('ignores case and whitespace-only prompt edits', () => {
    const edited = { ...input, prompt: '  a   RED balloon\n' };
    expect(speculativeHash(edited)).toBe(speculativeHash(input));
  });

  it('changes when any option changes', () => {
    expect(speculativeHash({ ...input, quality: 'cinema' })).not.toBe(
      speculativeHash(input)
    );
    expect(speculativeHash({ ...input, aspectRatio: '9:16' })).not.toBe(
      speculativeHash(input)
    );
    expect(speculativeHash({ ...input, prompt: 'a blue balloon' })).not.toBe(
      speculativeHash(input)
    );
  });

  it('specKey joins the normalized fields', () => {
    expect(specKey(input)).toBe('a red balloon|studio|1:1|image');
  });
});

describe('hash64', () => {
  it('produces 16 lowercase hex chars and avalanches', () => {
    expect(hash64('hello')).toMatch(/^[0-9a-f]{16}$/);
    expect(hash64('hello')).not.toBe(hash64('hellp'));
    expect(hash64('')).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe('specHashMatches', () => {
  const input = {
    prompt: 'a red balloon',
    quality: 'studio',
    aspectRatio: '1:1',
    mediaType: 'image',
  };
  const hash = speculativeHash(input);

  it('matches the hash computed from the same inputs', () => {
    expect(specHashMatches(hash, input)).toBe(true);
  });

  it('rejects a hash for different inputs (edited prompt after speculation)', () => {
    expect(
      specHashMatches(hash, { ...input, prompt: 'a red balloon at sunset' })
    ).toBe(false);
  });

  it('rejects empty / non-string hashes', () => {
    expect(specHashMatches('', input)).toBe(false);
    expect(specHashMatches(null as unknown as string, input)).toBe(false);
  });
});

describe('specIsExpired', () => {
  it('treats null/undefined/invalid as expired', () => {
    expect(specIsExpired(null)).toBe(true);
    expect(specIsExpired(undefined)).toBe(true);
    expect(specIsExpired('not-a-date')).toBe(true);
  });

  it('is not expired while the expiry is in the future, expired once past', () => {
    const now = new Date('2026-10-08T12:00:00Z');
    expect(specIsExpired(new Date(now.getTime() + 60_000), now)).toBe(false);
    expect(specIsExpired(new Date(now.getTime() - 1), now)).toBe(true);
    expect(specIsExpired(now, now)).toBe(true);
  });

  it('accepts ISO strings as well as Dates', () => {
    const now = new Date('2026-10-08T12:00:00Z');
    expect(
      specIsExpired(
        new Date(now.getTime() + 60_000).toISOString(),
        now
      )
    ).toBe(false);
  });
});

describe('timing constants', () => {
  it('debounce is ~3s and TTL is 10 minutes', () => {
    expect(SPEC_DEBOUNCE_MS).toBe(3000);
    expect(SPEC_TTL_MS).toBe(10 * 60 * 1000);
  });
});
