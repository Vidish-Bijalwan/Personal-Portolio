/**
 * Shared use-case landing page (/for-sellers, /for-creators, /for-marketers).
 *
 * Server component. Renders from a UseCase record: honest hero, tool cards
 * with real deep links + catalog prices, example cards, template pills,
 * a 4-step strip, FAQs (with FAQPage JSON-LD), and a CTA band.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import SectionHeader from "@/components/vilish/section-header";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { toolById } from "@/src/lib/tools/directory";
import { examplePrice, exampleHref } from "@/components/vilish/examples";
import type { UseCase } from "@/src/lib/usecases/usecases";

const STEPS = [
  { step: "Describe", desc: "Brief it like you'd brief a designer — plain words work." },
  { step: "See price", desc: "The exact price is shown before you commit. No subscription." },
  { step: "Pay once", desc: "One UPI payment. A human reviews your creation before delivery." },
  { step: "Download", desc: "Your file, yours to keep — listings, feeds, campaigns." },
];

export default function UseCasePage({ usecase }: { usecase: UseCase }) {
  const tools = usecase.toolIds
    .map((id) => toolById(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: usecase.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <VilishNav />
      <main>
        {/* hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: `${usecase.accent}14` }}
          />
          <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-12 sm:pt-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <Reveal>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                    {usecase.kicker}
                  </p>
                  <h1 className="font-display mt-4 text-[38px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
                    {usecase.title}{" "}
                    <span style={{ color: usecase.accent }}>{usecase.titleAccent}</span>
                  </h1>
                  <p className="mt-5 max-w-[46ch] text-[15px] leading-7 text-white/60">
                    {usecase.subtitle}
                  </p>
                </Reveal>
                <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/create"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] px-7 py-3 text-[15px] font-semibold text-[#080808] transition-opacity hover:opacity-95"
                    style={{ background: usecase.accent }}
                  >
                    Start creating <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
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
                    <BadgeCheck className="h-4 w-4" style={{ color: usecase.accent }} strokeWidth={1.8} />
                    Human QC on every order · Pay per creation · No subscription
                  </p>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.1]">
                  <Image
                    src={usecase.heroImage}
                    alt={usecase.heroImageAlt}
                    width={880}
                    height={880}
                    priority
                    className="aspect-square w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* tools for this job */}
        <section aria-label="Tools for this job" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <SectionHeader
              kicker="The toolkit"
              title={
                <>
                  Tools for <span style={{ color: usecase.accent }}>this job.</span>
                </>
              }
              subtitle="Each one is live right now — the price shown is the price you pay."
            />
            <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((t) => {
                const Icon = t.icon;
                return (
                  <StaggerItem key={t.id} className="h-full">
                    <Link
                      href={t.href}
                      aria-label={`Open ${t.name} — ${t.price}`}
                      className="group flex h-full min-h-[44px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.035] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04]"
                          style={{ color: usecase.accent }}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <span className="shrink-0 rounded-full border border-white/[0.12] px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-[#F5F5F3]">
                          {t.price}
                        </span>
                      </span>
                      <span className="mt-4 text-[16px] font-semibold text-[#F5F5F3]">{t.name}</span>
                      <span className="mt-1.5 flex-1 text-[13px] leading-6 text-white/50">{t.tagline}</span>
                      <span
                        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold"
                        style={{ color: usecase.accent }}
                      >
                        Open tool
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                      </span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* examples */}
        <section aria-label="Made for this" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <SectionHeader
              kicker="Proof, not promises"
              title={
                <>
                  Made for <span style={{ color: usecase.accent }}>this.</span>
                </>
              }
              subtitle="Real example creations. Tap any one to order something like it."
            />
            <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {usecase.examples.map((ex) => (
                <StaggerItem key={ex.src} className="h-full">
                  <figure className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                    <Image
                      src={ex.src}
                      alt={`${ex.caption} — AI-generated example`}
                      width={640}
                      height={800}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 pt-12">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-semibold text-white">{ex.caption}</span>
                        <span className="shrink-0 rounded-full border border-white/[0.14] bg-black/70 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                          {examplePrice({ service: ex.service })}
                        </span>
                      </span>
                      <Link
                        href={exampleHref({ service: ex.service })}
                        aria-label={`Make one like this: ${ex.caption}`}
                        className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-80"
                        style={{ color: usecase.accent }}
                      >
                        Make one like this <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </Link>
                    </figcaption>
                  </figure>
                </StaggerItem>
              ))}
            </Stagger>

            {/* templates */}
            <Reveal delay={0.1} className="mt-10">
              <p className="flex items-center gap-2 text-[13px] font-medium text-white/50">
                <Sparkles className="h-4 w-4" style={{ color: usecase.accent }} strokeWidth={1.8} />
                Or start from a ready-made template:
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {usecase.templates.map((tpl) => (
                  <Link
                    key={tpl.id}
                    href={`/trends?template=${tpl.id}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-5 py-2 text-[13.5px] font-medium text-white/75 transition-all hover:-translate-y-0.5 hover:border-white/25 hover:text-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {tpl.label}
                    <ArrowRight className="h-3.5 w-3.5 text-white/35" strokeWidth={2} />
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* how it works */}
        <section aria-label="How it works" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <SectionHeader
              kicker="How it works"
              title={
                <>
                  Four steps. <span style={{ color: usecase.accent }}>Zero commitment.</span>
                </>
              }
            />
            <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <StaggerItem key={s.step}>
                  <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                    <p className="font-display text-[13px] font-bold tabular-nums" style={{ color: usecase.accent }}>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-3 text-[15px] font-semibold text-[#F5F5F3]">{s.step}</p>
                    <p className="mt-1.5 text-[13px] leading-6 text-white/50">{s.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* faq */}
        <section aria-label="Frequently asked questions" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <SectionHeader
              kicker="FAQ"
              title={
                <>
                  Questions, <span style={{ color: usecase.accent }}>answered straight.</span>
                </>
              }
            />
            <div className="mt-10 grid grid-cols-1 gap-3">
              {usecase.faqs.map((f, i) => (
                <Reveal key={f.q} delay={Math.min(i * 0.04, 0.2)}>
                  <details className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-colors open:bg-white/[0.03] hover:border-white/[0.16]">
                    <summary className="flex min-h-[44px] cursor-pointer list-none items-baseline gap-4 px-5 py-4 outline-none focus-visible:ring-2 sm:px-6 [&::-webkit-details-marker]:hidden" style={{ ["--tw-ring-color" as string]: usecase.accent }}>
                      <span aria-hidden className="font-display text-[12px] font-semibold tabular-nums opacity-70" style={{ color: usecase.accent }}>
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

            <Reveal delay={0.1} className="mt-12 text-center">
              <Link
                href="/create"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] px-8 py-3.5 text-[15px] font-semibold text-[#080808] transition-opacity hover:opacity-95"
                style={{ background: usecase.accent }}
              >
                Start creating <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <p className="mt-4">
                <Link
                  href="/pricing"
                  className="text-[13px] font-medium text-white/55 underline decoration-white/25 underline-offset-4 hover:text-white/85 hover:decoration-white/60"
                >
                  How pricing works
                </Link>
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <VilishFooter />
    </div>
  );
}
