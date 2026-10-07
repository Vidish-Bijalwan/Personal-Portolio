/**
 * Etch blog — content model + quality gate.
 *
 * Every post is a typed object (not free-form markdown) so the quality gate
 * can enforce the SEO/AEO contract mechanically:
 *  - valid slug, SEO title/description lengths
 *  - word-count window (900–1600)
 *  - answer block + FAQs (chatbot citation)
 *  - real sources (https URLs, no invented citations)
 *  - internal links to /create and /pricing in every post
 *  - honest scope: never claims features Etch doesn't have
 *  - prices match the canonical catalog when mentioned
 */

export interface TextSegment {
  t: string;
  /** External or internal href. Rendered as a link when present. */
  href?: string;
}

export type RichText = TextSegment[];

export type BlogBlock =
  | { kind: "p"; text: RichText }
  | { kind: "h2"; text: string }
  | { kind: "list"; items: RichText[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "callout"; tone: "tip" | "note" | "warn"; text: RichText }
  | { kind: "cta"; title: string; body: string; label: string; href: string };

export interface BlogSource {
  label: string;
  url: string;
}

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Meta description, 120–160 chars. */
  description: string;
  /** ISO date, e.g. "2026-10-06". */
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  readingMinutes: number;
  /** Concise factual answer block near the top — the AEO/GEO citation target. */
  answer: RichText;
  sources: BlogSource[];
  faqs: BlogFaq[];
  /** Slugs of related posts (must exist in the registry). */
  related: string[];
  body: BlogBlock[];
}

/* ------------------------------------------------------------------ */
/* Quality gate                                                        */
/* ------------------------------------------------------------------ */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Features Etch does NOT have — claiming any of these fails the gate.
 * Kept to concrete product features (not business-model words like
 * "subscription", which appear legitimately in comparison copy). */
const FORBIDDEN_CLAIMS = [
  "talking photo",
  "voice cloning",
  "song generator",
  "ai influencer",
  "talking objects",
  "free unlimited",
];

/** Canonical prices (paise) — must match src/lib/pricing/catalog.ts. */
const KNOWN_PRICES: Record<string, number> = {
  "₹19": 1900,
  "₹69": 6900,
  "₹39": 3900,
  "₹89": 8900,
  "₹9": 900,
};

export function richTextToPlain(rt: RichText): string {
  return rt.map((s) => s.t).join("");
}

export function blockToPlain(b: BlogBlock): string {
  switch (b.kind) {
    case "p":
      return richTextToPlain(b.text);
    case "h2":
      return b.text;
    case "list":
      return b.items.map(richTextToPlain).join(" ");
    case "table":
      return [...b.head, ...b.rows.flat()].join(" ");
    case "callout":
      return richTextToPlain(b.text);
    case "cta":
      return `${b.title} ${b.body} ${b.label}`;
  }
}

export function postWordCount(post: BlogPost): number {
  const parts = [
    post.title,
    post.description,
    richTextToPlain(post.answer),
    ...post.body.map(blockToPlain),
    ...post.faqs.flatMap((f) => [f.q, f.a]),
  ];
  return parts
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function collectHrefs(post: BlogPost): string[] {
  const hrefs: string[] = [];
  const grab = (rt: RichText) => {
    for (const s of rt) if (s.href) hrefs.push(s.href);
  };
  grab(post.answer);
  for (const b of post.body) {
    if (b.kind === "p" || b.kind === "callout") grab(b.text);
    else if (b.kind === "list") b.items.forEach(grab);
    else if (b.kind === "cta") hrefs.push(b.href);
  }
  for (const s of post.sources) hrefs.push(s.url);
  return hrefs;
}

/**
 * Returns a list of human-readable violations. Empty = passes the gate.
 * `knownSlugs` is the full registry so `related` links can be validated.
 */
export function validatePost(post: BlogPost, knownSlugs: string[]): string[] {
  const errors: string[] = [];

  if (!SLUG_RE.test(post.slug)) errors.push(`bad slug: ${post.slug}`);
  if (post.title.length === 0 || post.title.length > 70)
    errors.push(`title must be 1–70 chars (got ${post.title.length})`);
  if (post.description.length < 120 || post.description.length > 165)
    errors.push(
      `description must be 120–165 chars (got ${post.description.length})`
    );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(Date.parse(post.date)))
    errors.push(`bad date: ${post.date}`);

  const words = postWordCount(post);
  if (words < 900 || words > 1600)
    errors.push(`word count must be 900–1600 (got ${words})`);

  if (post.answer.length === 0) errors.push("missing AEO answer block");
  if (post.faqs.length < 3)
    errors.push(`need ≥3 FAQs (got ${post.faqs.length})`);
  if (post.sources.length < 2)
    errors.push(`need ≥2 cited sources (got ${post.sources.length})`);
  for (const s of post.sources) {
    if (!/^https:\/\//.test(s.url))
      errors.push(`source URL must be https: ${s.url}`);
  }

  const hrefs = collectHrefs(post);
  if (!hrefs.some((h) => h === "/create" || h.startsWith("/create?")))
    errors.push("post must link to /create");
  if (!hrefs.some((h) => h === "/pricing" || h.startsWith("/pricing")))
    errors.push("post must link to /pricing");

  for (const r of post.related) {
    if (r === post.slug) errors.push(`post relates to itself: ${r}`);
    else if (!knownSlugs.includes(r)) errors.push(`unknown related slug: ${r}`);
  }

  const haystack = [
    post.title,
    post.description,
    richTextToPlain(post.answer),
    ...post.body.map(blockToPlain),
    ...post.faqs.flatMap((f) => [f.q, f.a]),
  ]
    .join(" ")
    .toLowerCase();
  for (const claim of FORBIDDEN_CLAIMS) {
    if (haystack.includes(claim))
      errors.push(`forbidden claim (feature we don't have): "${claim}"`);
  }

  // Prices mentioned must be real catalog prices.
  const priceMentions = haystack.match(/₹\d+/g) ?? [];
  for (const pm of priceMentions) {
    if (!(pm in KNOWN_PRICES))
      errors.push(`unknown price mentioned: ${pm} (not in catalog)`);
  }

  return errors;
}
