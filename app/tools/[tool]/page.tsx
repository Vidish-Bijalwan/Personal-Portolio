/**
 * /tools/[tool] — one honest detail page per working tool.
 *
 * Rendered from the canonical TOOL_DIRECTORY (never a parallel list):
 * unknown ids 404 via notFound(). Prices are catalog-derived; copy comes
 * from TOOL_DETAILS, which states real limitations alongside the pitch.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Check, TriangleAlert } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import SectionHeader from "@/components/vilish/section-header";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { cn } from "@/lib/utils";
import { TOOL_DIRECTORY, toolById, toolsByGroup } from "@/src/lib/tools/directory";
import { toolDetail } from "@/src/lib/tools/details";

export function generateStaticParams() {
  return TOOL_DIRECTORY.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool: toolId } = await params;
  const tool = toolById(toolId);
  if (!tool) return { title: "Tool not found | Etch" };
  return {
    title: `${tool.name} — ${tool.price} per ${tool.group === "create" ? "creation" : "job"} | Etch`,
    description: `${tool.name}: ${tool.tagline}. ${tool.price}, no subscription. One creation, one price.`,
    alternates: { canonical: `/tools/${tool.id}` },
  };
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool: toolId } = await params;
  const tool = toolById(toolId);
  const detail = toolDetail(toolId);
  if (!tool || !detail) notFound();

  const Icon = tool.icon;
  const related = toolsByGroup(tool.group).filter((t) => t.id !== tool.id);
  const accent = "#7da2ff"; // pro accent (legacy palette removed 2026-10-07)

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: detail.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Etch ${tool.name}`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: tool.price, priceCurrency: "INR" },
    description: detail.what,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vidish.me/" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://vidish.me/tools" },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `https://vidish.me/tools/${tool.id}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <VilishNav />
      <main>
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:pt-16">
          {/* breadcrumb */}
          <Reveal>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] text-white/40">
              <Link href="/" className="transition-colors hover:text-white/80">
                Home
              </Link>
              <span aria-hidden>/</span>
              <Link href="/tools" className="transition-colors hover:text-white/80">
                Tools
              </Link>
              <span aria-hidden>/</span>
              <span className="text-white/70">{tool.name}</span>
            </nav>
          </Reveal>

          {/* hero */}
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <Reveal>
                <p className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                      tool.badge === "AI"
                        ? "border-[var(--pro-accent)]/30 text-[var(--pro-accent)]"
                        : "border-[var(--pro-accent)]/30 text-[var(--pro-accent)]",
                    )}
                  >
                    {tool.badge === "AI" ? "AI" : "Real processing"}
                  </span>
                  <span className="rounded-full border border-white/[0.12] px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-[#F5F5F3]">
                    {tool.price}
                  </span>
                </p>
                <h1 className="font-display mt-4 flex items-center gap-4 text-[38px] font-semibold tracking-[-0.02em] sm:text-[52px]">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04]"
                    style={{ color: accent }}
                  >
                    <Icon className="h-7 w-7" strokeWidth={1.8} />
                  </span>
                  {tool.name}
                </h1>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-7 text-white/60">{detail.what}</p>
              </Reveal>
              <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={tool.href}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] px-7 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)] transition-opacity hover:opacity-95"
                  style={{ background: accent }}
                >
                  {detail.cta} <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex min-h-[44px] items-center rounded-[12px] border border-white/[0.14] px-7 py-3 text-[15px] font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  See pricing
                </Link>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-6 flex items-center gap-2 text-[12.5px] text-white/40">
                  <BadgeCheck className="h-4 w-4" style={{ color: accent }} strokeWidth={1.8} />
                  Human QC on every order · Pay per creation · No subscription
                </p>
              </Reveal>
            </div>

            {/* best for / limitations */}
            <div className="space-y-4">
              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    <Check className="h-4 w-4" style={{ color: accent }} strokeWidth={2.2} />
                    Best for
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {detail.bestFor.map((b) => (
                      <li key={b} className="text-[13.5px] leading-6 text-white/70">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    <TriangleAlert className="h-4 w-4 text-[#FFB020]" strokeWidth={2} />
                    Honest limitations
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {detail.limitations.map((l) => (
                      <li key={l} className="text-[13.5px] leading-6 text-white/55">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>

          {/* how it works */}
          <section aria-label="How it works" className="mt-20">
            <SectionHeader
              kicker="How it works"
              title={
                <>
                  Three steps to <span style={{ color: accent }}>done.</span>
                </>
              }
            />
            <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {detail.steps.map((s, i) => (
                <StaggerItem key={s.title}>
                  <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                    <p className="font-display text-[13px] font-bold tabular-nums" style={{ color: accent }}>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-3 text-[15px] font-semibold text-[#F5F5F3]">{s.title}</p>
                    <p className="mt-1.5 text-[13px] leading-6 text-white/50">{s.copy}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          {/* faq */}
          <section aria-label="Frequently asked questions" className="mt-20">
            <SectionHeader
              kicker="FAQ"
              title={
                <>
                  Questions, <span style={{ color: accent }}>answered straight.</span>
                </>
              }
            />
            <div className="mt-10 grid grid-cols-1 gap-3">
              {detail.faqs.map((f, i) => (
                <Reveal key={f.q} delay={Math.min(i * 0.04, 0.16)}>
                  <details className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-colors open:bg-white/[0.03] hover:border-white/[0.16]">
                    <summary className="flex min-h-[44px] cursor-pointer list-none items-baseline gap-4 px-5 py-4 outline-none focus-visible:ring-2 sm:px-6 [&::-webkit-details-marker]:hidden">
                      <span aria-hidden className="font-display text-[12px] font-semibold tabular-nums opacity-70" style={{ color: accent }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15px] font-medium text-[#F5F5F3]">{f.q}</span>
                    </summary>
                    <p className="px-5 pb-5 pl-[52px] pr-6 text-[13.5px] leading-6 text-white/55 sm:px-6 sm:pl-[60px]">
                      {f.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </section>

          {/* related tools */}
          <section aria-label="Related tools" className="mt-20">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                More in {tool.group === "create" ? "Create" : "Video Studio"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {related.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tools/${t.id}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-5 py-2 text-[13.5px] font-medium text-white/75 transition-all hover:-translate-y-0.5 hover:border-white/25 hover:text-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {t.name}
                    <span className="text-[12.5px] font-semibold tabular-nums text-white/45">{t.price}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white/35" strokeWidth={2} />
                  </Link>
                ))}
              </div>
            </Reveal>
          </section>

          {/* final CTA */}
          <Reveal delay={0.1} className="mt-20 text-center">
            <Link
              href={tool.href}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] px-8 py-3.5 text-[15px] font-semibold text-[var(--pro-btn-ink)] transition-opacity hover:opacity-95"
              style={{ background: accent }}
            >
              {detail.cta} — {tool.price} <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
            <p className="mt-4 text-[12.5px] text-white/40">
              One creation. One price. No subscription.
            </p>
          </Reveal>
        </div>
      </main>
      <VilishFooter />
    </div>
  );
}
