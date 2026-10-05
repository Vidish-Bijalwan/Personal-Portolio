import type { MetadataRoute } from "next";

const ROUTES = ["/", "/create", "/pricing", "/examples", "/about"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vilish.studio";
  return ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
