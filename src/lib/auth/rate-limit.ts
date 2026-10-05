/**
 * In-memory per-IP rate limiter for auth endpoints.
 *
 * SECURITY NOTE: this is single-instance memory. Behind multiple serverless
 * instances an attacker gets N× the budget (N = instance count). This is
 * acceptable for launch; upgrade to a shared store (Redis/Upstash) if abuse
 * is observed. Buckets self-expire; a periodic sweep caps memory growth.
 */

export const AUTH_RATE_LIMIT = {
  /** sliding window per key+IP */
  windowMs: 60_000,
  /** max attempts per window */
  maxAttempts: 5,
} as const;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  if (buckets.size < 10_000) return;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

export interface RateLimitDecision {
  allowed: boolean;
  /** seconds until the window resets (0 when allowed) */
  retryAfterSec: number;
}

/** Pure-ish decision function — injectable clock for tests. */
export function checkRateLimit(
  ip: string,
  key: string,
  now: number = Date.now(),
): RateLimitDecision {
  sweep(now);
  const mapKey = `${key}:${ip}`;
  const existing = buckets.get(mapKey);
  if (!existing || existing.resetAt <= now) {
    buckets.set(mapKey, { count: 1, resetAt: now + AUTH_RATE_LIMIT.windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= AUTH_RATE_LIMIT.maxAttempts) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/** Best-effort client IP behind Vercel/proxies. */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Test hook — clears all buckets. */
export function __resetRateLimits(): void {
  buckets.clear();
}
