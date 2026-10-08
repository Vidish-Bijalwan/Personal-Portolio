import { describe, expect, it } from "vitest";
import { progressForStage } from "@/lib/vilish/progress";

describe("progressForStage", () => {
  it("returns 100 when done", () => {
    expect(progressForStage("Polishing the final cut", "done")).toBe(100);
    expect(progressForStage(null, "done")).toBe(100);
    expect(progressForStage("anything", "DELIVERED")).toBe(100);
  });

  it("returns 8 when queued", () => {
    expect(progressForStage(null, "queued")).toBe(8);
    expect(progressForStage("Waiting for an operator", "processing")).toBe(8);
  });

  it("maps the video-studio watcher stages", () => {
    expect(progressForStage("Recording your voice-over", "processing")).toBe(30);
    expect(progressForStage("Listening and captioning", "processing")).toBe(50);
    expect(progressForStage("Cutting your clip", "processing")).toBe(65);
    expect(progressForStage("Polishing the final cut", "processing")).toBe(88);
  });

  it("maps the Phase 4 real-tool watcher stages", () => {
    expect(progressForStage("Compressing your video", "processing")).toBe(60);
    expect(progressForStage("Extracting your audio", "processing")).toBe(60);
    expect(progressForStage("Building your GIF", "processing")).toBe(60);
    expect(progressForStage("Mixing in your audio", "processing")).toBe(60);
    expect(progressForStage("Cleaning background noise", "processing")).toBe(55);
  });

  it("is case-insensitive", () => {
    expect(progressForStage("RECORDING YOUR VOICE-OVER", "processing")).toBe(30);
  });

  it("falls back to a midpoint for unknown stages", () => {
    const p = progressForStage("Doing something mysterious", "processing");
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(100);
  });

  it("never returns outside 0–100", () => {
    for (const [stage, status] of [
      [null, null],
      ["", ""],
      ["x", "queued"],
      ["y", "done"],
    ] as Array<[string | null, string | null]>) {
      const p = progressForStage(stage, status);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
  });
});

describe("progressForStage time-aware creep", () => {
  it("adds elapsed-time creep on top of the stage base", () => {
    const twoMinAgo = new Date(Date.now() - 120_000).toISOString();
    // "Preparing" base is 20; 120s / 6 = 20, capped at +12 → 32
    expect(progressForStage("Warming up", "processing", twoMinAgo)).toBe(32);
  });

  it("does not creep without a createdAt", () => {
    expect(progressForStage("Warming up", "processing")).toBe(20);
  });

  it("never exceeds 97 before done", () => {
    const longAgo = new Date(Date.now() - 3600_000).toISOString();
    expect(progressForStage("Polishing the final cut", "processing", longAgo)).toBeLessThanOrEqual(97);
  });

  it("done still returns 100 regardless of time", () => {
    const longAgo = new Date(Date.now() - 3600_000).toISOString();
    expect(progressForStage("anything", "done", longAgo)).toBe(100);
  });
});
