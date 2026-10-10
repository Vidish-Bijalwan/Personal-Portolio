/**
 * "Demo for every feature" wiring gate.
 *
 * Every intake surface must mount a SeeItInAction demo block backed by a real
 * explainer asset:
 * - the 8 video-studio tools (VIDEO_TOOLS) and the 4 create modes
 *   (clip-5s, single-image, pack-4, product-photo) resolve via TOOL_DIRECTORY,
 *   have toolDetail steps, and ship an explainer mp4 + poster;
 * - Poster Studio (not a tool) ships poster.mp4 + poster-poster.jpg.
 */
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { VIDEO_TOOLS } from "@/lib/video/constants";
import { toolById } from "@/lib/tools/directory";
import { toolDetail } from "@/lib/tools/details";

const EXPLAINERS = path.resolve(__dirname, "../../../public/tools/explainers");
const MAX_BYTES = 2 * 1024 * 1024;

function hasFaststart(file: string): boolean {
  const buf = readFileSync(file);
  const moov = buf.indexOf(Buffer.from("moov"));
  const mdat = buf.indexOf(Buffer.from("mdat"));
  return moov !== -1 && mdat !== -1 && moov < mdat;
}

function probeDuration(file: string): number {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf-8" },
  );
  return parseFloat(out.trim());
}

describe("see-it-in-action wiring", () => {
  it("every video-studio tool resolves to a demo-backed tool", () => {
    expect(VIDEO_TOOLS).toHaveLength(8);
    for (const id of VIDEO_TOOLS) {
      expect(toolById(id), `toolById(${id})`).toBeTruthy();
      expect(toolDetail(id)?.steps, `steps(${id})`).toHaveLength(3);
      expect(existsSync(path.join(EXPLAINERS, `${id}.mp4`)), `${id}.mp4`).toBe(true);
      expect(existsSync(path.join(EXPLAINERS, `${id}-poster.jpg`)), `${id}-poster.jpg`).toBe(true);
    }
  });

  it("every /create mode resolves to a demo-backed tool", () => {
    for (const id of ["clip-5s", "single-image", "pack-4", "product-photo"] as const) {
      expect(toolById(id), `toolById(${id})`).toBeTruthy();
      expect(toolDetail(id)?.steps, `steps(${id})`).toHaveLength(3);
      expect(existsSync(path.join(EXPLAINERS, `${id}.mp4`)), `${id}.mp4`).toBe(true);
      expect(existsSync(path.join(EXPLAINERS, `${id}-poster.jpg`)), `${id}-poster.jpg`).toBe(true);
    }
  });

  it("poster studio ships a compact walkthrough asset", () => {
    const mp4 = path.join(EXPLAINERS, "poster.mp4");
    const poster = path.join(EXPLAINERS, "poster-poster.jpg");
    expect(existsSync(mp4), "poster.mp4").toBe(true);
    expect(existsSync(poster), "poster-poster.jpg").toBe(true);
    expect(statSync(mp4).size, "poster.mp4 size").toBeLessThanOrEqual(MAX_BYTES);
    expect(hasFaststart(mp4), "poster.mp4 faststart").toBe(true);
    expect(probeDuration(mp4), "poster.mp4 duration").toBeLessThanOrEqual(15);
  });
});
