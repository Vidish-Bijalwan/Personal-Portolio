import { describe, expect, it } from "vitest";
import { MISSING_REFERENCE_MESSAGE, needsReferencePhoto, referenceFieldState } from "@/lib/person-reference";

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

describe("referenceFieldState", () => {
  it("marks the field required when the prompt needs a person and no file is attached", () => {
    const s = referenceFieldState("Use my photo, cinematic portrait", false);
    expect(s.required).toBe(true);
    expect(s.labelSuffix).toBe("(required)");
    expect(s.warning).toContain("attach their photo");
  });

  it("clears the requirement once a file is attached", () => {
    const s = referenceFieldState("Use my photo, cinematic portrait", true);
    expect(s.required).toBe(false);
    expect(s.labelSuffix).toBe("(optional)");
    expect(s.warning).toBeNull();
  });

  it("stays optional for ordinary prompts", () => {
    const s = referenceFieldState("A mountain landscape", false);
    expect(s.required).toBe(false);
    expect(s.labelSuffix).toBe("(optional)");
    expect(s.warning).toBeNull();
  });
});

describe("MISSING_REFERENCE_MESSAGE", () => {
  it("is explicit and never says optional", () => {
    expect(MISSING_REFERENCE_MESSAGE).toContain("have to attach their photo");
    expect(MISSING_REFERENCE_MESSAGE.toLowerCase()).not.toContain("optional");
  });
});
