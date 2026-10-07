import type { MetadataRoute } from "next";

/**
 * Canonical site URL — overridable via NEXT_PUBLIC_SITE_URL (Vercel env).
 * Fallback is the live production domain verified in Google Search Console.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryetch.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
