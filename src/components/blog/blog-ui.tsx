import Link from "next/link";
import type { BlogBlock, BlogPost, RichText } from "@/lib/blog/types";
import { formatBlogDate, postAuthor } from "@/lib/blog/types";

/* Shared server-rendered blog UI in the Etch cyberpunk language.
 * No client JS — pure static markup for SEO and speed. */

export function RichText({ text }: { text: RichText }) {
  return (
    <>
      {text.map((s, i) =>
        s.href ? (
          s.href.startsWith("http") ? (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pro-accent)] underline decoration-[var(--pro-accent)]/40 underline-offset-2 transition-colors hover:text-[var(--pro-accent)] hover:decoration-[var(--pro-accent)]/60"
            >
              {s.t}
            </a>
          ) : (
            <Link
              key={i}
              href={s.href}
              className="text-[var(--pro-accent)] underline decoration-[var(--pro-accent)]/40 underline-offset-2 transition-colors hover:text-[var(--pro-accent)] hover:decoration-[var(--pro-accent)]/60"
            >
              {s.t}
            </Link>
          )
        ) : (
          <span key={i}>{s.t}</span>
        )
      )}
    </>
  );
}

export function BlockRenderer({ block }: { block: BlogBlock }) {
  switch (block.kind) {
    case "p":
      return (
        <p className="text-[15.5px] leading-7 text-white/70">
          <RichText text={block.text} />
        </p>
      );
    case "h2":
      return (
        <h2 className="font-display pt-4 text-[21px] font-semibold tracking-[-0.01em] text-[#F5F5F3]">
          {block.text}
        </h2>
      );
    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-[15px] leading-6 text-white/70"
            >
              <span
                aria-hidden
                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--pro-btn)]"
              />
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full min-w-[480px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="bg-white/[0.04]">
                {block.head.map((h, i) => (
                  <th
                    key={i}
                    className="border-b border-white/[0.08] px-4 py-3 font-semibold text-[#F5F5F3]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 1 ? "bg-white/[0.02]" : undefined}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border-b border-white/[0.06] px-4 py-3 align-top leading-6 text-white/65"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const tones = {
        tip: "border-[var(--pro-accent)]/30 bg-[var(--pro-accent)]/[0.06]",
        note: "border-[var(--pro-accent)]/30 bg-[var(--pro-accent)]/[0.06]",
        warn: "border-[var(--pro-accent)]/30 bg-[var(--pro-accent)]/[0.06]",
      } as const;
      const labels = { tip: "Tip", note: "Note", warn: "Heads up" } as const;
      return (
        <aside
          className={`rounded-xl border px-5 py-4 ${tones[block.tone]}`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
            {labels[block.tone]}
          </p>
          <p className="mt-1.5 text-[14.5px] leading-6 text-white/75">
            <RichText text={block.text} />
          </p>
        </aside>
      );
    }
    case "cta":
      return (
        <div className="pro-ring-border relative overflow-hidden rounded-2xl border bg-white/[0.02] px-6 py-6">
          <p className="font-display text-[18px] font-semibold text-[#F5F5F3]">
            {block.title}
          </p>
          <p className="mt-1.5 text-[14px] leading-6 text-white/55">
            {block.body}
          </p>
          <Link
            href={block.href}
            className="pro-cta mt-4 inline-flex min-h-[44px] items-center rounded-[10px] px-5 py-2.5 text-[14px] font-semibold text-[var(--pro-btn-ink)] transition-opacity hover:opacity-90"
          >
            {block.label}
          </Link>
        </div>
      );
  }
}

/** The AEO/GEO answer block — concise factual summary near the top. */
export function AnswerBlock({ post }: { post: BlogPost }) {
  return (
    <section
      aria-label="Quick answer"
      className="rounded-2xl border border-[var(--pro-accent)]/25 bg-[var(--pro-accent)]/[0.05] px-6 py-5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--pro-accent)]">
        The short answer
      </p>
      <p className="mt-2 text-[15.5px] leading-7 text-white/85">
        <RichText text={post.answer} />
      </p>
    </section>
  );
}

export function FaqSection({ post }: { post: BlogPost }) {
  return (
    <section aria-label="Frequently asked questions" className="pt-2">
      <h2 className="font-display text-[21px] font-semibold tracking-[-0.01em] text-[#F5F5F3]">
        Frequently asked questions
      </h2>
      <div className="mt-4 space-y-3">
        {post.faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4"
          >
            <summary className="cursor-pointer list-none text-[15px] font-medium text-[#F5F5F3] transition-colors group-hover:text-[var(--pro-accent)] [&::-webkit-details-marker]:hidden">
              {f.q}
            </summary>
            <p className="mt-2.5 text-[14.5px] leading-6 text-white/65">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function SourcesSection({ post }: { post: BlogPost }) {
  return (
    <section aria-label="Sources" className="pt-2">
      <h2 className="font-display text-[17px] font-semibold text-[#F5F5F3]">
        Sources
      </h2>
      <ul className="mt-3 space-y-2">
        {post.sources.map((s, i) => (
          <li key={i} className="text-[13.5px] text-white/55">
            <span className="mr-2 text-white/30">[{i + 1}]</span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pro-accent)]/90 underline decoration-[var(--pro-accent)]/30 underline-offset-2 transition-colors hover:text-[var(--pro-accent)]"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Byline: author + published date (+ updated date when present) + reading time. */
export function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-white/45">
      <span className="font-medium text-white/75">By {postAuthor(post)}</span>
      <span aria-hidden>·</span>
      <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
      {post.updated ? (
        <>
          <span aria-hidden>·</span>
          <span>
            Updated{" "}
            <time dateTime={post.updated}>{formatBlogDate(post.updated)}</time>
          </span>
        </>
      ) : null}
      <span aria-hidden>·</span>
      <span>{post.readingMinutes} min read</span>
      <span className="rounded-full border border-[var(--pro-accent)]/30 bg-[var(--pro-accent)]/[0.07] px-2.5 py-0.5 font-medium text-[var(--pro-accent)]">
        {post.category}
      </span>
    </div>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-[var(--pro-accent)]/35 hover:bg-white/[0.035]"
    >
      <PostMeta post={post} />
      <h2 className="font-display mt-3 text-[19px] font-semibold leading-snug tracking-[-0.01em] text-[#F5F5F3] transition-colors group-hover:text-[var(--pro-accent)]">
        {post.title}
      </h2>
      <p className="mt-2.5 flex-1 text-[14px] leading-6 text-white/55">
        {post.description}
      </p>
      <span className="mt-4 text-[13.5px] font-medium text-[var(--pro-accent)] transition-colors group-hover:text-[var(--pro-accent)]">
        Read the guide →
      </span>
    </Link>
  );
}
