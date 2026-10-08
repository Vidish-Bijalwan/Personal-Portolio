/**
 * Madam Muse — unified intake (CONTRACTS.md §4/§6).
 *
 * Follows the repo's file-content gate pattern: the .tsx is asserted via
 * source (node env has no DOM), pure logic via imports from the DOM-free
 * src/lib/muse/intake-prompt module.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  compileIntakePrompt,
  deriveTaskType,
} from "../../../src/lib/muse/intake-prompt";
import type { CreativeBrief } from "../../../src/lib/muse/brief";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const src = readFileSync(join(root, "components", "muse", "unified-intake.tsx"), "utf8");
const pageSrc = readFileSync(join(root, "app", "create", "page.tsx"), "utf8");
const composerSrc = readFileSync(join(root, "components", "vilish", "composer.tsx"), "utf8");

describe("unified-intake source gates", () => {
  it("primary zone: drag-drop + click-to-upload + paste + mobile accept", () => {
    expect(src).toContain("onDrop");
    expect(src).toContain("onDragOver");
    expect(src).toMatch(/type="file"/);
    expect(src).toContain("image/*,video/*");
    expect(src).toContain("onPaste");
    expect(src).toContain('addEventListener("paste"');
  });

  it("shows thumbnail preview with dims + size", () => {
    expect(src).toContain("createObjectURL");
    expect(src).toMatch(/formatDims/);
    expect(src).toMatch(/formatBytes/);
  });

  it("reference strip: auto role chip + override dropdown, never forced", () => {
    expect(src).toContain("Add reference");
    expect(src).toContain("roleConfidence");
    expect(src).toMatch(/<select/);
    expect(src).toContain("roleUserOverride");
    // override is optional — no required labeling
    expect(src).not.toMatch(/required.*role|role.*required/i);
  });

  it("instruction textarea with brief-style placeholder examples", () => {
    expect(src).toContain("muse-instruction");
    expect(src).toContain("keep my watch the same");
  });

  it("derived mode badge is display-only (no mode picker)", () => {
    expect(src).toContain("deriveTaskType");
    expect(src).toContain("Detected:");
    expect(src).not.toMatch(/setDerivedMode|setTaskType/);
  });

  it("submits to POST /api/create/brief and renders Looks right / Edit instruction", () => {
    expect(src).toContain('"/api/create/brief"');
    expect(src).toContain("Looks right");
    expect(src).toContain("Edit instruction");
  });

  it("Continue hands compiled prompt + files to the existing order flow", () => {
    expect(src).toContain("compilePrompt");
    expect(src).toContain("initialPrompt");
    expect(src).toContain("initialFiles");
    // reuses the existing Composer — does not rebuild pricing/payment
    expect(src).toContain('from "@/components/vilish/composer"');
    expect(src).not.toMatch(/Cashfree|Razorpay|payment-modal/i);
  });

  it("uses pro design tokens, no gimmick styling", () => {
    expect(src).toContain("var(--pro-");
    expect(src).not.toMatch(/neon|cyberpunk|gradient-to-br/i);
  });
});

describe("/create wiring", () => {
  it("mounts UnifiedIntake as the default view, Composer kept below", () => {
    expect(pageSrc).toContain("UnifiedIntake");
    const intakePos = pageSrc.indexOf("<UnifiedIntake");
    const composerPos = pageSrc.indexOf("<Composer");
    expect(intakePos).toBeGreaterThan(-1);
    expect(composerPos).toBeGreaterThan(-1);
    expect(intakePos).toBeLessThan(composerPos);
  });
});

describe("Composer handover prop", () => {
  it("accepts optional initialFiles and validates them on init", () => {
    expect(composerSrc).toContain("initialFiles?: File[]");
    expect(composerSrc).toContain("validateUploads");
  });
});

describe("deriveTaskType", () => {
  const img = { kind: "image", name: "a.jpg", mime: "image/jpeg", width: 800, height: 600, sizeBytes: 10 } as const;
  const vid = { kind: "video", name: "a.mp4", mime: "video/mp4", width: 640, height: 480, sizeBytes: 10 } as const;

  it("primary video → video-edit; primary image → image-edit", () => {
    expect(deriveTaskType(vid, "add captions")).toBe("video-edit");
    expect(deriveTaskType(img, "make it darker")).toBe("image-edit");
  });

  it("no assets: video words → video-generate, otherwise image-generate", () => {
    expect(deriveTaskType(null, "make a 10s clip of my cafe")).toBe("video-generate");
    expect(deriveTaskType(null, "design a Diwali poster")).toBe("image-generate");
    expect(deriveTaskType(null, "")).toBe("image-generate");
  });
});

function sampleBrief(): CreativeBrief {
  return {
    version: 1,
    taskType: "image-edit",
    instruction: "keep my watch the same, use ref 1's layout, darker",
    primary: { kind: "image", name: "watch.jpg", mime: "image/jpeg", width: 1200, height: 800, sizeBytes: 500000 },
    references: [
      {
        id: "ref_01",
        kind: "image",
        name: "layout.png",
        mime: "image/png",
        width: 800,
        height: 600,
        sizeBytes: 200000,
        role: "composition",
        roleConfidence: 0.6,
        roleUserOverride: false,
      },
      {
        id: "ref_02",
        kind: "image",
        name: "swatch.png",
        mime: "image/png",
        width: 400,
        height: 400,
        sizeBytes: 50000,
        role: "palette",
        roleConfidence: 0.65,
        roleUserOverride: true,
        palette: ["#1a1a1a", "#c9a227"],
      },
    ],
    preserve: ["product", "logo"],
    modifiers: ["darker"],
    exclusions: [],
    visualFamily: "editorial poster",
    outputSpec: { media: "image", aspectRatio: "4:5", quality: "studio" },
  };
}

describe("compileIntakePrompt", () => {
  it("spells out each reference by role — never averaged", () => {
    const c = compileIntakePrompt(sampleBrief());
    expect(c.referenceDirectives).toHaveLength(2);
    expect(c.referenceDirectives[0]).toContain("ref_01");
    expect(c.referenceDirectives[0]).toContain("composition");
    expect(c.prompt).toContain("never average references together");
  });

  it("includes preserve list, modifiers, palette and family", () => {
    const c = compileIntakePrompt(sampleBrief());
    expect(c.prompt).toContain("Must preserve: product, logo");
    expect(c.prompt).toContain("Apply: darker");
    expect(c.prompt).toContain("#1a1a1a");
    expect(c.prompt).toContain("editorial poster");
  });

  it("always carries anti-generic exclusions", () => {
    const c = compileIntakePrompt(sampleBrief());
    for (const phrase of [
      "no empty glossy backgrounds",
      "no random decorative shapes",
      "no fake premium shine",
      "no stock look",
      "no waxy faces",
      "no garbled text",
    ]) {
      expect(c.prompt).toContain(phrase);
    }
  });

  it("handles text-only briefs (null primary, no refs)", () => {
    const b = sampleBrief();
    b.primary = null;
    b.references = [];
    const c = compileIntakePrompt(b);
    expect(c.prompt).toContain("keep my watch the same");
    expect(c.referenceDirectives).toEqual([]);
  });
});
