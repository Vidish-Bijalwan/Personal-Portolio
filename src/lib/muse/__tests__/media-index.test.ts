import { describe, expect, it } from "vitest";
import {
  getMediaIndex,
  isMediaIndexAvailable,
  MediaIndexUnavailableError,
} from "@/lib/muse/media-index";

describe("media-index stub (honest unavailable state)", () => {
  it("reports unavailable with a human reason", () => {
    const index = getMediaIndex();
    expect(index.status).toBe("unavailable");
    expect(isMediaIndexAvailable(index)).toBe(false);
    expect(index.reason).toMatch(/not wired up yet/);
  });

  it("transcribe throws instead of fabricating segments", async () => {
    const index = getMediaIndex();
    await expect(index.transcribe(new Uint8Array([1, 2, 3]), "video/mp4")).rejects.toBeInstanceOf(
      MediaIndexUnavailableError,
    );
  });

  it("detectShots throws instead of fabricating shots", async () => {
    const index = getMediaIndex();
    await expect(index.detectShots(new Uint8Array([1, 2, 3]), "video/mp4")).rejects.toBeInstanceOf(
      MediaIndexUnavailableError,
    );
  });
});
