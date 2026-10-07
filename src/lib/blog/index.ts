/**
 * Etch blog registry — the single list of every published post.
 *
 * Posts live in ./posts/*.ts (one file per post) so the daily pipeline can
 * append new ones without touching existing files. Add the import + entry
 * here when a new post file lands.
 */
import type { BlogPost } from "./types";

import aiImageGeneratorIndia from "./posts/ai-image-generator-india-pay-per-creation";
import aiProductPhotographyIndia from "./posts/ai-product-photography-india-sellers";
import aiVideoCostIndia from "./posts/how-much-does-ai-video-cost-india";
import aiVideoNoSubscription from "./posts/ai-video-without-subscription";
import aiVoiceOverReels from "./posts/ai-voice-over-reels-india";
import autoCaptionsReels from "./posts/auto-captions-instagram-reels";
import payPerCreationExplained from "./posts/what-is-pay-per-creation-ai";
import aiVsPhotoshootIndia from "./posts/ai-photoshoot-cost-comparison-india";
import productAdsWithAi from "./posts/make-product-ads-with-ai";
import aiTrendTemplates from "./posts/ai-trends-templates-explained";

export const BLOG_POSTS: BlogPost[] = [
  aiImageGeneratorIndia,
  aiProductPhotographyIndia,
  aiVideoCostIndia,
  aiVideoNoSubscription,
  aiVoiceOverReels,
  autoCaptionsReels,
  payPerCreationExplained,
  aiVsPhotoshootIndia,
  productAdsWithAi,
  aiTrendTemplates,
]
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug);

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelated(post: BlogPost, limit = 3): BlogPost[] {
  const related = post.related
    .map(getPost)
    .filter((p): p is BlogPost => Boolean(p));
  if (related.length >= limit) return related.slice(0, limit);
  // Backfill with newest posts so the section is never empty.
  for (const p of BLOG_POSTS) {
    if (p.slug !== post.slug && !related.includes(p)) {
      related.push(p);
      if (related.length >= limit) break;
    }
  }
  return related.slice(0, limit);
}

export const BLOG_CATEGORIES = [...new Set(BLOG_POSTS.map((p) => p.category))];
