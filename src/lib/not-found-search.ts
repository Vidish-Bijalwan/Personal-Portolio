/**
 * Etch 404-page search index.
 *
 * Pure data logic for the not-found search box: the index is built from REAL
 * site data (key pages, the canonical TOOL_DIRECTORY, and the published
 * blog registry) — no invented entries, no fake backend.
 */

import { TOOL_DIRECTORY } from "./tools/directory";
import { BLOG_POSTS } from "./blog";

export type SearchKind = "page" | "tool" | "post";

export interface SearchItem {
  label: string;
  href: string;
  desc: string;
  kind: SearchKind;
}

/** Hand-curated key pages. Every href must exist in app/. */
export const KEY_PAGES: SearchItem[] = [
  { label: "Home", href: "/", desc: "Etch — pay-per-creation AI media studio", kind: "page" },
  { label: "Create", href: "/create", desc: "Describe it, see the price, pay per piece", kind: "page" },
  { label: "Pricing", href: "/pricing", desc: "One creation, one price — no subscription", kind: "page" },
  { label: "All tools", href: "/tools", desc: "Every working tool in one place", kind: "page" },
  { label: "Blog", href: "/blog", desc: "Guides on AI creation and pay-per-creation", kind: "page" },
  { label: "Examples", href: "/examples", desc: "Real creations made with Etch", kind: "page" },
  { label: "Video Studio", href: "/video-studio", desc: "Voice-over, captions, trim and text for video", kind: "page" },
  { label: "Trends", href: "/trends", desc: "Trending templates to create from", kind: "page" },
  { label: "For creators", href: "/for-creators", desc: "Etch for content creators", kind: "page" },
  { label: "For marketers", href: "/for-marketers", desc: "Etch for marketing teams", kind: "page" },
  { label: "For sellers", href: "/for-sellers", desc: "Product photos and ads for sellers", kind: "page" },
  { label: "About", href: "/about", desc: "What Etch is and how it works", kind: "page" },
];

/** Full index: key pages + every real tool + every published blog post. */
export function buildSearchIndex(): SearchItem[] {
  return [
    ...KEY_PAGES,
    ...TOOL_DIRECTORY.map((t) => ({
      label: t.name,
      href: t.href,
      desc: t.tagline,
      kind: "tool" as const,
    })),
    ...BLOG_POSTS.map((p) => ({
      label: p.title,
      href: `/blog/${p.slug}`,
      desc: p.description,
      kind: "post" as const,
    })),
  ];
}

/**
 * Rank matches for a query. Every query word must match somewhere in the
 * item (AND semantics); label matches outrank description matches.
 * Returns at most `limit` items, best first. Empty for < 2 chars.
 */
export function filterSearchIndex(
  items: SearchItem[],
  query: string,
  limit = 8
): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const words = q.split(/\s+/).filter(Boolean);

  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const label = item.label.toLowerCase();
    const hay = `${item.label} ${item.desc} ${item.kind}`.toLowerCase();
    let score = 0;
    let ok = true;
    for (const w of words) {
      if (label.includes(w)) score += 3;
      else if (hay.includes(w)) score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (ok) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
