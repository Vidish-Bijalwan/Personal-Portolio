import { BLOG_POSTS } from "@/lib/blog";
import { richTextToPlain } from "@/lib/blog/types";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidish.me";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = BLOG_POSTS.map((post) => {
    const url = `${base}/blog/${post.slug}`;
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.date + "T00:00:00Z").toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Pixaura Blog — AI Creation Guides for India</title>
    <link>${base}/blog</link>
    <description>Practical guides to AI images, video, voice-over, and captions — with real Indian pricing.</description>
    <language>en-IN</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
