import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import {
  AnswerBlock,
  BlockRenderer,
  FaqSection,
  PostCard,
  PostMeta,
  SourcesSection,
} from "@/src/components/blog/blog-ui";
import { BLOG_SLUGS, getPost, getRelated } from "@/lib/blog";
import { richTextToPlain } from "@/lib/blog/types";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryetch.online";

export function generateStaticParams() {
  return BLOG_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${base}/blog/${post.slug}`;
  return {
    title: `${post.title} | Etch Blog`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: "Etch",
      type: "article",
      publishedTime: post.date,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = getRelated(post);
  const url = `${base}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(post.updated ? { dateModified: post.updated } : {}),
    author: { "@type": "Organization", name: "Etch", url: base },
    publisher: { "@type": "Organization", name: "Etch", url: base },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <VilishNav />
      <main className="relative mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-white/40">
          <Link href="/" className="transition-colors hover:text-white/80">
            Home
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <Link href="/blog" className="transition-colors hover:text-white/80">
            Blog
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span className="text-white/60">{post.category}</span>
        </nav>

        <h1 className="font-display mt-5 text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[#F5F5F3] sm:text-[40px]">
          {post.title}
        </h1>
        <div className="mt-4">
          <PostMeta post={post} />
        </div>

        <div className="mt-8">
          <AnswerBlock post={post} />
        </div>

        <article className="mt-8 space-y-6">
          {post.body.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </article>

        <div className="mt-10">
          <FaqSection post={post} />
        </div>

        <div className="mt-10">
          <SourcesSection post={post} />
        </div>

        {related.length > 0 && (
          <section aria-label="Related guides" className="mt-14">
            <h2 className="font-display text-[21px] font-semibold text-[#F5F5F3]">
              Keep reading
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {related.map((r) => (
                <PostCard key={r.slug} post={r} />
              ))}
            </div>
          </section>
        )}
      </main>
      <VilishFooter />
    </>
  );
}
