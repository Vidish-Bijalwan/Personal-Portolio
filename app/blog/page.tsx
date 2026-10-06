import type { Metadata } from "next";
import Link from "next/link";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import { PostCard } from "@/src/components/blog/blog-ui";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/lib/blog";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidish.me";

export const metadata: Metadata = {
  title: "Blog — AI Creation Guides for India | Pixaura",
  description:
    "Practical guides to AI images, video, voice-over, and captions — with real Indian pricing, no subscription talk. Pay-per-creation explained honestly.",
  alternates: { canonical: `${base}/blog` },
  openGraph: {
    title: "Blog — AI Creation Guides for India | Pixaura",
    description:
      "Practical guides to AI images, video, voice-over, and captions — with real Indian pricing.",
    url: `${base}/blog`,
    siteName: "Pixaura",
    type: "website",
  },
};

export default function BlogIndexPage() {
  return (
    <>
      <VilishNav />
      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00F0FF]">
          Pixaura Blog
        </p>
        <h1 className="font-display mt-3 max-w-[20ch] text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#F5F5F3] sm:text-[44px]">
          Guides to creating with AI,{" "}
          <span className="text-[#D7FF3F]">priced honestly</span>
        </h1>
        <p className="mt-4 max-w-[60ch] text-[15.5px] leading-7 text-white/60">
          No hype, no fake statistics — just practical walkthroughs with real
          Indian pricing. Every guide states exact costs upfront and links to
          the pages where you can act on it.
        </p>

        <div className="mt-6 flex flex-wrap gap-2" aria-label="Categories">
          {BLOG_CATEGORIES.map((c) => (
            <span
              key={c}
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-[12.5px] text-white/60"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        <p className="mt-12 text-center text-[13.5px] text-white/40">
          New guides publish daily.{" "}
          <Link href="/pricing" className="text-[#00F0FF] hover:text-[#D7FF3F]">
            See real prices
          </Link>{" "}
          or{" "}
          <Link href="/create" className="text-[#00F0FF] hover:text-[#D7FF3F]">
            start creating
          </Link>
          .
        </p>
      </main>
      <VilishFooter />
    </>
  );
}
