import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { TOOL_DIRECTORY } from "../src/lib/tools/directory";
import { USE_CASES } from "../src/lib/usecases/usecases";

/**
 * Canonical site URL — overridable via NEXT_PUBLIC_SITE_URL (Vercel env).
 * Fallback is the live production domain verified in Google Search Console.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryetch.online";

/**
 * Static public routes — every directory under app/ with a page.tsx that is
 * public (not /api/*, not /admin/*, not auth-gated watch/generation pages).
 */
const ROUTES = [
  "/",
  "/create",
  "/ads",
  "/pricing",
  "/examples",
  "/tools",
  "/video-studio",
  "/about",
  "/about/portfolio",
  "/blog",
  "/trends",
  "/privacy",
  "/terms",
  "/refunds",
  "/contact",
  "/reel",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const staticRoutes: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
  const toolRoutes: MetadataRoute.Sitemap = TOOL_DIRECTORY.map((t) => ({
    url: `${base}/tools/${t.id}`,
    lastModified: new Date(),
  }));
  const useCaseRoutes: MetadataRoute.Sitemap = USE_CASES.map((u) => ({
    url: `${base}/${u.slug}`,
    lastModified: new Date(),
  }));
  const postRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updated ? new Date(post.updated) : new Date(post.date),
  }));

  // Dedupe defensively — every URL must be unique and crawlable.
  const seen = new Set<string>();
  const entries = [
    ...staticRoutes,
    ...toolRoutes,
    ...useCaseRoutes,
    ...postRoutes,
  ].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return entries;
}
