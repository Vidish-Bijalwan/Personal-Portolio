/**
 * Pixaura — prompt length policy tests (client helper).
 * Server-side enforcement is covered by the interpret tests
 * (interpretCreative throws on >2000 chars).
 */
import { describe, it, expect } from 'vitest';
import {
  PROMPT_MAX_LENGTH,
  PROMPT_MIN_LENGTH,
  checkPromptLength,
  countPromptChars,
  formatPromptCount,
} from '../prompt-limits';

describe('prompt char limit', () => {
  it('caps prompts at 2000 characters', () => {
    expect(PROMPT_MAX_LENGTH).toBe(2000);
  });

  it('accepts a prompt at exactly the limit', () => {
    expect(checkPromptLength('a'.repeat(2000))).toEqual({ ok: true });
  });

  it('rejects a prompt one character over the limit', () => {
    const r = checkPromptLength('a'.repeat(2001));
    expect(r.ok).toBe(false);
    expect(r.code).toBe('PROMPT_TOO_LONG');
    expect(r.message).toContain('2,000');
  });

  it('counts with the same units the server uses', () => {
    expect(countPromptChars('hello')).toBe(5);
    expect(countPromptChars('a'.repeat(2001))).toBe(2001);
  });

  it('rejects prompts below the minimum', () => {
    const r = checkPromptLength('hi');
    expect(r.ok).toBe(false);
    expect(r.code).toBe('PROMPT_TOO_SHORT');
  });

  it('respects the configured minimum', () => {
    expect(checkPromptLength('a'.repeat(PROMPT_MIN_LENGTH))).toEqual({
      ok: true,
    });
  });

  it('formats the live counter as "x / 2,000"', () => {
    expect(formatPromptCount('a'.repeat(1234))).toBe('1,234 / 2,000');
    expect(formatPromptCount('')).toBe('0 / 2,000');
  });
});
