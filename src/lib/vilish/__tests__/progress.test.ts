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

describe("progressForStage — real pipeline stages, never time-based", () => {
  it("tracks the queue → claim → generate → watermark → deliver pipeline", () => {
    expect(progressForStage("Waiting in the queue", "queued")).toBe(8);
    expect(progressForStage("Claimed by a worker", "generating")).toBe(15);
    expect(progressForStage("Warming up the grill", "generating")).toBe(20);
    expect(progressForStage("Cooking your creation", "generating")).toBe(55);
    expect(progressForStage("Plating it up", "generating")).toBe(80);
    expect(progressForStage("Watermarking your file", "generating")).toBe(92);
    expect(progressForStage("Delivering your file", "generating")).toBe(95);
    expect(progressForStage("Delivering your file", "done")).toBe(100);
  });

  it("is a pure function of stage + status — no clock involved", () => {
    // The signature no longer accepts a timestamp at all: the bar can only
    // move when the pipeline reports a new stage or status.
    expect(progressForStage.length).toBe(2);
    expect(progressForStage("Warming up the grill", "generating")).toBe(20);
  });

  it("never exceeds 99 before done", () => {
    expect(progressForStage("Delivering your file", "generating")).toBeLessThanOrEqual(99);
  });

  it("done still returns 100", () => {
    expect(progressForStage("anything", "done")).toBe(100);
  });
});
