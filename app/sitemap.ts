import type { MetadataRoute } from "next";

const ROUTES = ["/", "/create", "/pricing", "/examples", "/about", "/about/portfolio"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidish.me";
  return ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
