/**
 * Pixaura blog — quality gate, slug validation, sitemap generation.
 *
 * The gate is the contract the daily pipeline must satisfy: every post
 * (seeded or cron-generated) passes validatePost() or it doesn't ship.
 */
import { describe, it, expect } from "vitest";
import {
  validatePost,
  postWordCount,
  type BlogPost,
} from "@/lib/blog/types";
import { BLOG_POSTS, BLOG_SLUGS, getPost } from "@/lib/blog";

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "test-post-slug",
    title: "A Valid Test Post Title",
    description:
      "A valid meta description that sits comfortably inside the required character-count window for SEO, long enough to pass the gate.",
    date: "2026-10-06",
    category: "Tests",
    tags: ["test"],
    readingMinutes: 5,
    answer: [{ t: "A concise factual answer block for testing." }],
    sources: [
      { label: "Pixaura pricing", url: "https://vidish.me/pricing" },
      { label: "Example source", url: "https://example.com/page" },
    ],
    faqs: [
      { q: "Question one?", a: "Answer one." },
      { q: "Question two?", a: "Answer two." },
      { q: "Question three?", a: "Answer three." },
    ],
    related: [],
    body: [
      { kind: "p", text: [{ t: "An opening paragraph with a link to " }, { t: "create", href: "/create" }, { t: " and " }, { t: "pricing", href: "/pricing" }, { t: "." }] },
      // Pad to the word-count window without affecting other assertions.
      { kind: "p", text: [{ t: Array(950).fill("word").join(" ") }] },
    ],
    ...overrides,
  };
}

describe("blog quality gate", () => {
  it("accepts a well-formed post", () => {
    expect(validatePost(makePost(), ["test-post-slug"])).toEqual([]);
  });

  it("rejects bad slugs", () => {
    for (const slug of ["Bad_Slug", "UPPER", "has space", "-leading", "trailing-", ""]) {
      const errs = validatePost(makePost({ slug }), [slug]);
      expect(errs.some((e) => e.startsWith("bad slug"))).toBe(true);
    }
  });

  it("rejects short/long descriptions and bad dates", () => {
    expect(
      validatePost(makePost({ description: "too short" }), ["test-post-slug"]).some((e) =>
        e.includes("description")
      )
    ).toBe(true);
    expect(
      validatePost(makePost({ date: "06-10-2026" }), ["test-post-slug"]).some((e) =>
        e.includes("bad date")
      )
    ).toBe(true);
  });

  it("enforces the 900–1600 word window", () => {
    const short = makePost({
      body: [{ kind: "p", text: [{ t: "tiny" }] }],
      faqs: [{ q: "q", a: "a" }],
    });
    // restore required counts so only word-count fails
    short.faqs = [
      { q: "q1", a: "a1" },
      { q: "q2", a: "a2" },
      { q: "q3", a: "a3" },
    ];
    expect(
      validatePost(short, ["test-post-slug"]).some((e) => e.includes("word count"))
    ).toBe(true);
  });

  it("requires answer block, ≥3 FAQs, ≥2 https sources", () => {
    expect(
      validatePost(makePost({ answer: [] }), ["test-post-slug"]).some((e) =>
        e.includes("answer block")
      )
    ).toBe(true);
    expect(
      validatePost(makePost({ faqs: [{ q: "q", a: "a" }] }), ["test-post-slug"]).some(
        (e) => e.includes("FAQs")
      )
    ).toBe(true);
    expect(
      validatePost(
        makePost({ sources: [{ label: "x", url: "http://insecure.com" }] }),
        ["test-post-slug"]
      ).some((e) => e.includes("https")
      )
    ).toBe(true);
  });

  it("requires internal links to /create and /pricing", () => {
    const noLinks = makePost({
      body: [{ kind: "p", text: [{ t: Array(950).fill("word").join(" ") }] }],
    });
    const errs = validatePost(noLinks, ["test-post-slug"]);
    expect(errs.some((e) => e.includes("/create"))).toBe(true);
    expect(errs.some((e) => e.includes("/pricing"))).toBe(true);
  });

  it("rejects claims about features Pixaura doesn't have", () => {
    const bad = makePost({
      body: [
        {
          kind: "p",
          text: [
            { t: "Try our amazing " },
            { t: "voice cloning", href: "/create" },
            { t: " feature today. " },
            { t: Array(950).fill("word").join(" ") },
            { t: " See " },
            { t: "pricing", href: "/pricing" },
            { t: "." },
          ],
        },
      ],
    });
    expect(
      validatePost(bad, ["test-post-slug"]).some((e) => e.includes("forbidden claim"))
    ).toBe(true);
  });

  it("rejects prices not in the catalog", () => {
    const bad = makePost({
      body: [
        {
          kind: "p",
          text: [
            { t: "Only " },
            { t: "₹999" },
            { t: " per image! " },
            { t: "See " },
            { t: "create", href: "/create" },
            { t: " and " },
            { t: "pricing", href: "/pricing" },
            { t: ". " },
            { t: Array(950).fill("word").join(" ") },
          ],
        },
      ],
    });
    expect(
      validatePost(bad, ["test-post-slug"]).some((e) => e.includes("unknown price"))
    ).toBe(true);
  });

  it("validates related slugs against the registry", () => {
    expect(
      validatePost(makePost({ related: ["no-such-post"] }), ["test-post-slug"]).some(
        (e) => e.includes("unknown related slug")
      )
    ).toBe(true);
    expect(
      validatePost(makePost({ related: ["test-post-slug"] }), ["test-post-slug"]).some(
        (e) => e.includes("itself")
      )
    ).toBe(true);
  });
});

describe("seeded posts", () => {
  it("ships 10 posts", () => {
    expect(BLOG_POSTS.length).toBe(10);
  });

  it("every seeded post passes the quality gate", () => {
    for (const post of BLOG_POSTS) {
      const errs = validatePost(post, BLOG_SLUGS);
      expect(errs, `post ${post.slug}`).toEqual([]);
    }
  });

  it("slugs are unique and well-formed", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) {
      expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(getPost(s)).toBeDefined();
    }
  });

  it("word counts are within the 900–1600 window", () => {
    for (const post of BLOG_POSTS) {
      const w = postWordCount(post);
      expect(w, `post ${post.slug}`).toBeGreaterThanOrEqual(900);
      expect(w, `post ${post.slug}`).toBeLessThanOrEqual(1600);
    }
  });
});

describe("sitemap generation", () => {
  it("includes every blog post URL plus static routes", async () => {
    // Imported through vitest's pipeline so the @/ alias resolves.
    const mod = (await import("../../../../app/sitemap")) as {
      default: () => { url: string }[];
    };
    const urls = mod.default().map((e) => e.url);
    for (const post of BLOG_POSTS) {
      expect(urls).toContain(`https://vidish.me/blog/${post.slug}`);
    }
    for (const route of ["/", "/create", "/pricing", "/blog"]) {
      expect(urls).toContain(`https://vidish.me${route}`);
    }
    // no duplicates
    expect(new Set(urls).size).toBe(urls.length);
  });
});
