/**
 * Rate limiter tests — pure decision function with an injectable clock.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getClientIp,
  __resetRateLimits,
  AUTH_RATE_LIMIT,
} from '../rate-limit';

beforeEach(() => {
  __resetRateLimits();
});

describe('checkRateLimit', () => {
  it('allows up to maxAttempts within the window', () => {
    const now = 1_000_000;
    for (let i = 0; i < AUTH_RATE_LIMIT.maxAttempts; i++) {
      expect(checkRateLimit('1.2.3.4', 'login', now).allowed).toBe(true);
    }
  });

  it('trips after maxAttempts and reports retryAfterSec', () => {
    const now = 1_000_000;
    for (let i = 0; i < AUTH_RATE_LIMIT.maxAttempts; i++) {
      checkRateLimit('5.6.7.8', 'login', now);
    }
    const blocked = checkRateLimit('5.6.7.8', 'login', now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it('resets after the window passes', () => {
    const now = 1_000_000;
    for (let i = 0; i < AUTH_RATE_LIMIT.maxAttempts + 2; i++) {
      checkRateLimit('9.9.9.9', 'login', now);
    }
    expect(checkRateLimit('9.9.9.9', 'login', now).allowed).toBe(false);
    const later = now + AUTH_RATE_LIMIT.windowMs + 1;
    expect(checkRateLimit('9.9.9.9', 'login', later).allowed).toBe(true);
  });

  it('isolates buckets per IP and per key', () => {
    const now = 2_000_000;
    for (let i = 0; i < AUTH_RATE_LIMIT.maxAttempts; i++) {
      checkRateLimit('10.0.0.1', 'login', now);
    }
    expect(checkRateLimit('10.0.0.1', 'login', now).allowed).toBe(false);
    // different IP: fresh budget
    expect(checkRateLimit('10.0.0.2', 'login', now).allowed).toBe(true);
    // different key: fresh budget
    expect(checkRateLimit('10.0.0.1', 'signup', now).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('prefers the first x-forwarded-for entry', () => {
    const req = new Request('http://x/', {
      headers: { 'x-forwarded-for': '203.0.113.7, 70.41.3.18' },
    });
    expect(getClientIp(req)).toBe('203.0.113.7');
  });
  it('falls back to x-real-ip, then unknown', () => {
    expect(getClientIp(new Request('http://x/', { headers: { 'x-real-ip': '198.51.100.9' } }))).toBe(
      '198.51.100.9',
    );
    expect(getClientIp(new Request('http://x/'))).toBe('unknown');
  });
});
