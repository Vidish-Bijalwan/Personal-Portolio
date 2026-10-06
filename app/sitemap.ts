import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";

const ROUTES = [
  "/",
  "/create",
  "/pricing",
  "/examples",
  "/tools",
  "/about",
  "/about/portfolio",
  "/blog",
  "/trends",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidish.me";
  const staticRoutes: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
  const postRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updated ? new Date(post.updated) : new Date(post.date),
  }));
  return [...staticRoutes, ...postRoutes];
}
