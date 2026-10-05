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
