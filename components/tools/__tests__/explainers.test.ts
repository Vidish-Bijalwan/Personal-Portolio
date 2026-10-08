/**
 * WS1 — tool explainer assets.
 *
 * The ExplainerVideo component and /tools/[tool] page expect, for every id in
 * TOOL_DIRECTORY: public/tools/explainers/<id>.mp4 (h264, yuv420p, 960x540,
 * <=2MB, faststart) and public/tools/explainers/<id>-poster.jpg.
 */
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { TOOL_DIRECTORY } from "@/lib/tools/directory";

const DIR = path.resolve(__dirname, "../../../public/tools/explainers");
const MAX_BYTES = 2 * 1024 * 1024;

function probe(file: string) {
  const out = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=codec_name,width,height,pix_fmt,duration",
      "-of",
      "json",
      file,
    ],
    { encoding: "utf-8" },
  );
  return JSON.parse(out).streams[0] as {
    codec_name: string;
    width: number;
    height: number;
    pix_fmt: string;
    duration: string;
  };
}

/** faststart: moov box must appear before mdat in the file. */
function hasFaststart(file: string): boolean {
  const buf = readFileSync(file);
  const moov = buf.indexOf(Buffer.from("moov"));
  const mdat = buf.indexOf(Buffer.from("mdat"));
  return moov !== -1 && mdat !== -1 && moov < mdat;
}

describe("tool explainer assets", () => {
  it("covers every tool in TOOL_DIRECTORY", () => {
    expect(TOOL_DIRECTORY.length).toBe(12);
  });

  for (const tool of TOOL_DIRECTORY) {
    const mp4 = path.join(DIR, `${tool.id}.mp4`);
    const poster = path.join(DIR, `${tool.id}-poster.jpg`);

    it(`${tool.id}: mp4 exists and fits the spec`, () => {
      expect(existsSync(mp4), `${mp4} missing`).toBe(true);
      const size = statSync(mp4).size;
      expect(size, `${tool.id}.mp4 is ${size} bytes, over 2MB`).toBeLessThanOrEqual(MAX_BYTES);

      const s = probe(mp4);
      expect(s.codec_name).toBe("h264");
      expect(s.pix_fmt).toBe("yuv420p");
      expect(s.width).toBe(960);
      expect(s.height).toBe(540);
      const dur = parseFloat(s.duration);
      expect(dur).toBeGreaterThan(7.5);
      expect(dur).toBeLessThan(8.5);
      expect(hasFaststart(mp4), `${tool.id}.mp4 missing faststart`).toBe(true);
    });

    it(`${tool.id}: poster jpg exists`, () => {
      expect(existsSync(poster), `${poster} missing`).toBe(true);
      expect(statSync(poster).size).toBeGreaterThan(0);
    });
  }
});
