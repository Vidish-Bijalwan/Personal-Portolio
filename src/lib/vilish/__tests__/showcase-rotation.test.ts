/**
 * Showcase rotation tests — the pool must reshuffle deterministically per
 * seed (SSR/client agreement), never lose or duplicate items, and never
 * mutate the input.
 */
import { describe, expect, it } from "vitest";
import { daySeed, mulberry32, shuffled } from "../showcase-rotation";

const POOL = ["a", "b", "c", "d", "e", "f", "g", "h"];

describe("daySeed", () => {
  it("is a stable integer for the same day", () => {
    const d = new Date(Date.UTC(2026, 9, 6, 12, 0, 0));
    expect(daySeed(d)).toBe(daySeed(new Date(Date.UTC(2026, 9, 6, 23, 59, 59))));
    expect(Number.isInteger(daySeed(d))).toBe(true);
  });

  it("changes across days", () => {
    const a = daySeed(new Date(Date.UTC(2026, 9, 6)));
    const b = daySeed(new Date(Date.UTC(2026, 9, 7)));
    expect(a).not.toBe(b);
  });
});

describe("mulberry32", () => {
  it("is deterministic per seed", () => {
    const r1 = mulberry32(42);
    const r2 = mulberry32(42);
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()]);
  });

  it("emits values in [0, 1)", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("shuffled", () => {
  it("is deterministic: same seed, same order", () => {
    expect(shuffled(POOL, 123)).toEqual(shuffled(POOL, 123));
  });

  it("actually rotates: some seed differs from the input order", () => {
    const orders = [1, 2, 3, 4, 5].map((s) => shuffled(POOL, s).join(","));
    expect(new Set(orders).size).toBeGreaterThan(1);
    expect(orders.some((o) => o !== POOL.join(","))).toBe(true);
  });

  it("preserves every item exactly once (no loss, no duplicates)", () => {
    for (const seed of [0, 1, 99, 123456]) {
      const out = shuffled(POOL, seed);
      expect(out).toHaveLength(POOL.length);
      expect([...out].sort()).toEqual([...POOL].sort());
    }
  });

  it("never mutates the input array", () => {
    const input = [...POOL];
    shuffled(input, 5);
    expect(input).toEqual(POOL);
  });

  it("handles edge cases", () => {
    expect(shuffled([], 1)).toEqual([]);
    expect(shuffled(["only"], 1)).toEqual(["only"]);
  });
});
