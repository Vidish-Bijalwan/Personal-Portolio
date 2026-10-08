import { describe, expect, it } from "vitest";
import { needsReferencePhoto } from "@/lib/person-reference";

describe("needsReferencePhoto", () => {
  it("detects reference-photo phrases (case-insensitive)", () => {
    expect(needsReferencePhoto("Put the person in the reference on a beach")).toBe(true);
    expect(needsReferencePhoto("Use my photo, cinematic portrait")).toBe(true);
    expect(needsReferencePhoto("Make this person smile")).toBe(true);
    expect(needsReferencePhoto("Keep the face, change the background")).toBe(true);
    expect(needsReferencePhoto("A poster of the man in the photo")).toBe(true);
    expect(needsReferencePhoto("REFERENCE PHOTO: woman, neon city")).toBe(true);
    expect(needsReferencePhoto("Same person, different outfit")).toBe(true);
    expect(needsReferencePhoto("Recreate the face of the uploaded photo")).toBe(true);
  });

  it("does not false-positive on ordinary prompts", () => {
    expect(needsReferencePhoto("A personal portrait of a warrior")).toBe(false);
    expect(needsReferencePhoto("A beautiful face in soft light")).toBe(false);
    expect(needsReferencePhoto("My photographic memory of Goa")).toBe(false);
    expect(needsReferencePhoto("Person walking in the rain, cinematic")).toBe(false);
    expect(needsReferencePhoto("A family photo on the wall")).toBe(false);
    expect(needsReferencePhoto("")).toBe(false);
    expect(needsReferencePhoto(null)).toBe(false);
  });

  it("matches the watcher's conservative intent: phrases, not single words", () => {
    // "personal" contains no phrase; "photo" alone is not a phrase
    expect(needsReferencePhoto("personal branding shoot")).toBe(false);
    expect(needsReferencePhoto("photo of a mountain")).toBe(false);
  });
});
