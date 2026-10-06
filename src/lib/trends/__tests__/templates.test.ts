/**
 * Trend templates — data validation gate.
 * Every template must map to a real catalog service, carry a usable prompt,
 * and deep-link correctly. A bad template fails the suite, never ships.
 */
import { describe, expect, it } from "vitest";
import {
  TEMPLATES,
  TREND_THEMES,
  TRENDS_UPDATED,
  templateById,
  templateHref,
  templateInputsLabel,
  templatePricePaise,
  templatesByNewest,
  validateTemplate,
  type Template,
} from "@/lib/trends/templates";
import { priceOf } from "@/lib/pricing/catalog";

function allIds(): string[] {
  return TEMPLATES.map((t) => t.id);
}

describe("trend templates gate", () => {
  it("ships a curated set (12–18 templates)", () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(12);
    expect(TEMPLATES.length).toBeLessThanOrEqual(18);
  });

  it("every template passes the validation gate", () => {
    const ids = allIds();
    for (const t of TEMPLATES) {
      const others = ids.filter((i) => i !== t.id);
      expect(validateTemplate(t, others)).toEqual([]);
    }
  });

  it("covers every theme", () => {
    const covered = new Set(TEMPLATES.map((t) => t.theme));
    for (const theme of TREND_THEMES) {
      expect(covered.has(theme)).toBe(true);
    }
  });

  it("ids are unique", () => {
    const ids = allIds();
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("price always equals the live catalog price for the service", () => {
    for (const t of TEMPLATES) {
      expect(templatePricePaise(t)).toBe(priceOf(t.service));
    }
  });

  it("deep links route image templates via ?service= and video via ?media=video", () => {
    for (const t of TEMPLATES) {
      const href = templateHref(t);
      expect(href).toContain(`template=${t.id}`);
      if (t.service === "clip-5s") {
        expect(href).toBe(`/create?media=video&template=${t.id}`);
      } else {
        expect(href).toBe(`/create?service=${t.service}&template=${t.id}`);
      }
    }
  });

  it("inputs label is honest about photo requirements", () => {
    const withPhotos = TEMPLATES.find((t) => t.photoSlots.length > 0)!;
    expect(templateInputsLabel(withPhotos)).toMatch(/photos? ·/);
    const textOnly = TEMPLATES.find((t) => t.photoSlots.length === 0)!;
    expect(templateInputsLabel(textOnly)).toBe("Text prompt only");
  });

  it("newest ordering is by addedOn descending", () => {
    const sorted = templatesByNewest();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].addedOn >= sorted[i].addedOn).toBe(true);
    }
  });

  it("templateById resolves and returns null for unknown ids", () => {
    expect(templateById(TEMPLATES[0].id)?.id).toBe(TEMPLATES[0].id);
    expect(templateById("no-such-template")).toBeNull();
    expect(templateById(null)).toBeNull();
    expect(templateById("../../../etc")).toBeNull();
  });

  it("TRENDS_UPDATED is a valid recent date", () => {
    expect(/^\d{4}-\d{2}-\d{2}$/.test(TRENDS_UPDATED)).toBe(true);
    expect(Date.parse(TRENDS_UPDATED)).not.toBeNaN();
  });
});

describe("validateTemplate rejects bad data", () => {
  const good: Template = { ...TEMPLATES[0] };

  it("rejects unknown services (not in catalog)", () => {
    const bad = { ...good, id: "x-bad", service: "talking-photo" as never };
    expect(validateTemplate(bad, []).length).toBeGreaterThan(0);
  });

  it("rejects duplicate ids", () => {
    expect(validateTemplate(good, [good.id]).length).toBeGreaterThan(0);
  });

  it("rejects empty or overlong prompts", () => {
    expect(
      validateTemplate({ ...good, id: "x-1", prompt: "" }, []).length
    ).toBeGreaterThan(0);
    expect(
      validateTemplate({ ...good, id: "x-2", prompt: "too short" }, []).length
    ).toBeGreaterThan(0);
  });

  it("rejects invalid aspects and themes", () => {
    expect(
      validateTemplate({ ...good, id: "x-3", aspect: "3:2" as never }, []).length
    ).toBeGreaterThan(0);
    expect(
      validateTemplate({ ...good, id: "x-4", theme: "Sports" as never }, []).length
    ).toBeGreaterThan(0);
  });
});

describe("product video-ad track (Phase 3)", () => {
  const AD_IDS = ["billboard-launch", "unboxing-spotlight", "ad-remix-pack"];

  it("ships the product-ad templates under Products", () => {
    for (const id of AD_IDS) {
      const t = templateById(id);
      expect(t).toBeDefined();
      expect(t!.theme).toBe("Products");
      expect(t!.badge).toBe("New");
    }
  });

  it("ad templates map to real catalog services with real prices", () => {
    for (const id of AD_IDS) {
      const t = templateById(id)!;
      expect(validateTemplate(t, allIds().filter((i) => i !== id))).toEqual([]);
      expect(templatePricePaise(t)).toBe(priceOf(t.service));
    }
  });

  it("every ad template routes product-photo → video-studio via followUp", () => {
    for (const id of AD_IDS) {
      const t = templateById(id)!;
      expect(t.followUp).toBeDefined();
      expect(t.followUp!.href).toBe("/video-studio");
      expect(t.followUp!.label.length).toBeGreaterThan(0);
      // No dead destinations, no placeholder hrefs.
      expect(t.followUp!.href).not.toMatch(/#|coming-soon|tbd/i);
    }
  });

  it("rejects bad followUp data", () => {
    const good: Template = { ...TEMPLATES[0] };
    expect(
      validateTemplate(
        { ...good, id: "x-f1", followUp: { label: "", href: "/video-studio" } },
        [],
      ).length,
    ).toBeGreaterThan(0);
    expect(
      validateTemplate(
        { ...good, id: "x-f2", followUp: { label: "Ok", href: "https://x.com" } },
        [],
      ).length,
    ).toBeGreaterThan(0);
    expect(
      validateTemplate(
        { ...good, id: "x-f3", followUp: { label: "Ok", href: "/video-studio" } },
        [],
      ),
    ).toEqual([]);
  });
});
