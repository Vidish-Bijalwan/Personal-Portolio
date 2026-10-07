import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { TOOL_DIRECTORY } from "../src/lib/tools/directory";
import { USE_CASES } from "../src/lib/usecases/usecases";

const ROUTES = [
  "/",
  "/create",
  "/pricing",
  "/examples",
  "/tools",
  "/video-studio",
  "/about",
  "/about/portfolio",
  "/blog",
  "/trends",
  "/privacy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidish.me";
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
  return [...staticRoutes, ...toolRoutes, ...useCaseRoutes, ...postRoutes];
}
