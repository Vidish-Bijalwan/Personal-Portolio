/**
 * Seeded showcase rotation — the showcase pool reshuffles so repeat visits
 * surface different pieces instead of the same four every time.
 *
 * Determinism strategy (avoids SSR/client hydration mismatch):
 *  - The initial render uses a day-seeded shuffle (UTC day number). The
 *    server and the first client render compute the same seed, so the HTML
 *    matches.
 *  - `useRotatedPool` then re-shuffles once on mount with a random seed, so
 *    every visit shows a fresh order.
 *
 * Pure helpers are exported for unit tests; components should use the hook.
 */
import { useEffect, useState } from "react";

/** UTC day number — stable across server and client for the same day. */
export function daySeed(date: Date = new Date()): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86_400_000,
  );
}

/** mulberry32 — tiny deterministic PRNG for the Fisher-Yates shuffle. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle with a numeric seed. Pure: same (items, seed) always
 * yields the same order. Never mutates the input.
 */
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const arr = [...items];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Rotate a pool of showcase items. First render (SSR + hydration) uses the
 * day seed; on mount — and whenever the input array identity changes (e.g.
 * a category tab switch) — it re-shuffles with a random seed for per-visit
 * variety. `count` caps how many of the shuffled pool are shown.
 *
 * Callers must pass a referentially stable array (module constant or
 * useMemo), otherwise the effect re-runs every render.
 */
export function useRotatedPool<T>(items: readonly T[], count?: number): T[] {
  const take = (list: readonly T[]) =>
    count === undefined ? [...list] : list.slice(0, count);
  const [pool, setPool] = useState<T[]>(() => take(shuffled(items, daySeed())));
  useEffect(() => {
    setPool(take(shuffled(items, (Math.random() * 2 ** 31) | 0)));
    // Intentionally keyed on items identity only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  return pool;
}
