import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clapperboard,
  Images,
  Package,
  RefreshCcw,
  Tag,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Reveal, Parallax, Section } from "./reveal";
import type { GalleryItem } from "./gallery";
import { Gallery } from "./gallery";
import { HeroCarousel, type CarouselSlide } from "./carousel";
import type { FaqItem } from "./faq";
import { FaqSection } from "./faq";
import type { ToolEntry } from "@/src/lib/tools/directory";

/* ── Hero ─────────────────────────────────────────── */

export function Hero({
  singleImagePrice,
  slides,
}: {
  singleImagePrice: string;
  slides: CarouselSlide[];
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <Parallax amount={44}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="pro-eyebrow">Pay-per-creation AI studio</p>
            <h1
              className="pro-display mt-5 text-[38px] font-bold leading-[1.06] sm:text-[60px]"
              style={{ color: "var(--pro-fg)" }}
            >
              Studio-quality AI images and video, priced per creation.
            </h1>
            <p
              className="pro-body mx-auto mt-6 max-w-[58ch] text-[16.5px] leading-[1.65] sm:text-[18px]"
              style={{ color: "var(--pro-muted)" }}
            >
              No subscriptions. No expiring credits. See the exact price before
              you pay — from {singleImagePrice} per image, payable over UPI.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/create" className="pro-btn-primary w-full sm:w-auto">
                Start creating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/examples" className="pro-btn-secondary w-full sm:w-auto">
                See examples
              </Link>
            </div>
          </Reveal>
        </Parallax>

        {/* Infinite hero carousel — real finished work, prompt on click */}
        <HeroCarousel slides={slides} />
      </div>
    </section>
  );
}

/* ── Trust strip — honest proof only, zero invented numbers ── */

const TRUST: { icon: LucideIcon; label: string }[] = [
  { icon: BadgeCheck, label: "No subscription" },
  { icon: Tag, label: "Exact price before you pay" },
  { icon: Wallet, label: "UPI payments" },
  { icon: RefreshCcw, label: "Failed renders refunded" },
];

export function TrustStrip() {
  return (
    <section aria-label="Why Etch" className="border-y" style={{ borderColor: "var(--pro-border-soft)" }}>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
        {TRUST.map((t, i) => (
          <Reveal key={t.label} delay={i * 60}>
            <div className="flex items-center justify-center gap-2.5">
              <t.icon
                className="h-[18px] w-[18px] shrink-0"
                strokeWidth={2}
                style={{ color: "var(--pro-accent)" }}
                aria-hidden
              />
              <span
                className="pro-body text-[14px] font-semibold"
                style={{ color: "var(--pro-fg)" }}
              >
                {t.label}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── How it works ── */

const STEPS = [
  {
    n: "01",
    title: "Describe what you want",
    copy: "Type a prompt in plain words, or start from a ready-made template. Portraits, product photos, posters, ad creatives, short video clips.",
  },
  {
    n: "02",
    title: "See the exact price",
    copy: "Every service shows its fixed price before you commit. No credits to buy, no meters running, no checkout surprises.",
  },
  {
    n: "03",
    title: "Pay once, download",
    copy: "Pay securely over UPI. Your finished file is ready to download — and there is no subscription attached to it.",
  },
];

export function HowItWorks() {
  return (
    <Section
      eyebrow="How it works"
      title="Three steps. No learning curve."
      lede="If you can describe it, you can make it. The whole process takes minutes, and you only pay when the result is yours."
    >
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 80}>
            <div
              className="pro-card h-full p-7"
              style={{ boxShadow: "var(--pro-card-shadow)" }}
            >
              <p
                className="pro-display text-[13px] font-bold tabular-nums"
                style={{ color: "var(--pro-accent)", letterSpacing: "0.18em" }}
              >
                {s.n}
              </p>
              <h3
                className="pro-display mt-4 text-[20px] font-bold leading-snug"
                style={{ color: "var(--pro-fg)" }}
              >
                {s.title}
              </h3>
              <p
                className="pro-body mt-3 text-[14.5px] leading-[1.7]"
                style={{ color: "var(--pro-muted)" }}
              >
                {s.copy}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

/* ── Why pay-per-creation ── */

export interface WhyPillar {
  icon: LucideIcon;
  title: string;
  copy: string;
}

const PILLAR_ICONS: LucideIcon[] = [Tag, BadgeCheck, Check, Wallet];

export function WhyPillars({
  pillars,
}: {
  pillars: { title: string; copy: string }[];
}) {
  return (
    <Section
      eyebrow="Why pay-per-creation"
      title="Own what you make. Nothing else."
      lede="Subscriptions charge you for the months you forget. Etch charges you for the work you actually get."
    >
      <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {pillars.map((p, i) => {
          const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
          return (
            <Reveal as="li" key={p.title} delay={(i % 2) * 80}>
              <div className="flex gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border"
                  style={{
                    borderColor: "var(--pro-border-soft)",
                    background: "var(--pro-bg-elev)",
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={1.9}
                    style={{ color: "var(--pro-accent)" }}
                    aria-hidden
                  />
                </span>
                <div>
                  <h3
                    className="pro-display text-[18px] font-bold"
                    style={{ color: "var(--pro-fg)" }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="pro-body mt-2 max-w-[46ch] text-[14.5px] leading-[1.7]"
                    style={{ color: "var(--pro-muted)" }}
                  >
                    {p.copy}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

/* ── Gallery ── */

export function ExamplesGallery({ items }: { items: GalleryItem[] }) {
  return (
    <Section
      eyebrow="Examples"
      title="Real work, real prices."
      lede="Everything below was made on Etch. The price shown is what that exact kind of creation costs — taken straight from the price list, never rounded for marketing."
    >
      <Gallery items={items} />
      <Reveal className="mt-8 text-center">
        <Link
          href="/examples"
          className="pro-btn-secondary"
        >
          Browse all examples
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </Section>
  );
}

/* ── Templates (restored from the classic homepage) ── */

export interface TemplateCardItem {
  id: string;
  name: string;
  description: string;
  badge?: string;
  price: string;
  aspect: string;
  inputsLabel: string;
  href: string;
}

export function TemplatesShowcase({ templates }: { templates: TemplateCardItem[] }) {
  return (
    <Section
      eyebrow="Templates"
      title="Start from a ready-made template."
      lede="Pick a look and make it yours. Every template shows its exact price before you pay — some ask for a photo, some need only words."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t, i) => (
          <Reveal key={t.id} delay={(i % 3) * 70}>
            <article
              className="pro-card pro-lift flex h-full flex-col p-6"
              style={{ boxShadow: "var(--pro-card-shadow)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="pro-body text-[12px] font-bold uppercase"
                  style={{ color: "var(--pro-faint)", letterSpacing: "0.14em" }}
                >
                  {t.aspect} · {t.inputsLabel}
                </span>
                {t.badge ? (
                  <span
                    className="pro-body shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                    style={{
                      background: "var(--pro-bg-sunken)",
                      color: "var(--pro-accent)",
                      border: "1px solid var(--pro-border-soft)",
                    }}
                  >
                    {t.badge}
                  </span>
                ) : null}
              </div>
              <h3
                className="pro-display mt-4 text-[19px] font-bold"
                style={{ color: "var(--pro-fg)" }}
              >
                {t.name}
              </h3>
              <p
                className="pro-body mt-2 flex-1 text-[14px] leading-[1.65]"
                style={{ color: "var(--pro-muted)" }}
              >
                {t.description}
              </p>
              <div
                className="mt-5 flex items-center justify-between border-t pt-4"
                style={{ borderColor: "var(--pro-border-soft)" }}
              >
                <span
                  className="pro-display text-[20px] font-bold tabular-nums"
                  style={{ color: "var(--pro-fg)" }}
                >
                  {t.price}
                </span>
                <Link
                  href={t.href}
                  className="pro-body inline-flex min-h-[40px] items-center gap-1.5 text-[14px] font-semibold"
                  style={{ color: "var(--pro-accent)" }}
                  aria-label={`Use template: ${t.name}, ${t.price}`}
                >
                  Use template
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-8 text-center">
        <Link href="/trends" className="pro-btn-secondary">
          Browse all templates
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </Section>
  );
}

/* ── Tools directory (restored from the classic homepage) ── */

export function ToolsDirectory({
  groups,
}: {
  groups: { label: string; tools: ToolEntry[] }[];
}) {
  return (
    <Section
      eyebrow="Tools"
      title="Every tool. One honest price."
      lede="Twelve tools, all live right now — AI generation and real media processing. Each card opens the real thing at its exact price."
    >
      <div className="flex flex-col gap-10">
        {groups.map((g) => (
          <div key={g.label}>
            <p
              className="pro-body mb-4 text-[12.5px] font-bold uppercase"
              style={{ color: "var(--pro-faint)", letterSpacing: "0.16em" }}
            >
              {g.label}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {g.tools.map((t, i) => {
                const Icon = t.icon;
                return (
                  <Reveal key={t.id} delay={(i % 4) * 60}>
                    <Link
                      href={t.href}
                      className="pro-card pro-lift flex h-full flex-col p-5"
                      style={{ boxShadow: "var(--pro-card-shadow)" }}
                      aria-label={`${t.name} — ${t.price}. Open the tool.`}
                    >
                      <span className="flex items-center justify-between">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-[10px]"
                          style={{ background: "var(--pro-bg-sunken)" }}
                        >
                          <Icon
                            className="h-5 w-5"
                            strokeWidth={1.9}
                            style={{ color: "var(--pro-accent)" }}
                            aria-hidden
                          />
                        </span>
                        <span
                          className="pro-body rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={{
                            background: "var(--pro-bg-sunken)",
                            color: "var(--pro-muted)",
                            border: "1px solid var(--pro-border-soft)",
                          }}
                        >
                          {t.badge}
                        </span>
                      </span>
                      <span
                        className="pro-display mt-4 text-[16.5px] font-bold"
                        style={{ color: "var(--pro-fg)" }}
                      >
                        {t.name}
                      </span>
                      <span
                        className="pro-body mt-1.5 flex-1 text-[13px] leading-[1.6]"
                        style={{ color: "var(--pro-muted)" }}
                      >
                        {t.tagline}
                      </span>
                      <span
                        className="pro-body mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold tabular-nums"
                        style={{ color: "var(--pro-fg)" }}
                      >
                        {t.price}
                        <ArrowRight
                          className="h-4 w-4"
                          style={{ color: "var(--pro-accent)" }}
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Blog teasers (restored from the classic homepage) ── */

export interface BlogTeaser {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingMinutes: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogTeasers({ posts }: { posts: BlogTeaser[] }) {
  return (
    <Section
      eyebrow="From the blog"
      title="Guides worth your time."
      lede="Practical write-ups on AI image and video costs, quality, and workflows — written for people who make things."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 70}>
            <Link
              href={`/blog/${p.slug}`}
              className="pro-card pro-lift flex h-full flex-col p-6"
              style={{ boxShadow: "var(--pro-card-shadow)" }}
              aria-label={`Read: ${p.title}`}
            >
              <p className="pro-eyebrow">{p.category}</p>
              <h3
                className="pro-display mt-3 text-[19px] font-bold leading-snug"
                style={{ color: "var(--pro-fg)" }}
              >
                {p.title}
              </h3>
              <p
                className="pro-body mt-2.5 line-clamp-2 flex-1 text-[14px] leading-[1.65]"
                style={{ color: "var(--pro-muted)" }}
              >
                {p.description}
              </p>
              <p
                className="pro-body mt-5 text-[12.5px] font-semibold"
                style={{ color: "var(--pro-faint)" }}
              >
                {formatDate(p.date)} · {p.readingMinutes} min read
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-8 text-center">
        <Link href="/blog" className="pro-btn-secondary">
          Read all guides
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </Section>
  );
}

/* ── Pricing ── */

export interface PriceTier {
  id: string;
  name: string;
  price: string;
  blurb: string;
  /** Optional — sections.tsx falls back to a per-id icon map. */
  icon?: LucideIcon;
  href: string;
  featured?: boolean;
}

const TIER_ICONS: Record<string, LucideIcon> = {
  "single-image": Images,
  "pack-4": Package,
  "product-photo": Zap,
  "clip-5s": Clapperboard,
};

export function PricingTable({ tiers }: { tiers: PriceTier[] }) {
  return (
    <Section
      eyebrow="Pricing"
      title="One creation. One price."
      lede="Four services, four fixed prices. Pick one, see the price, pay once. Remakes start cheaper because iterating shouldn't cost full price twice."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t, i) => {
          const Icon = TIER_ICONS[t.id] ?? Images;
          return (
            <Reveal key={t.id} delay={i * 70}>
              <article
                className="pro-card pro-lift flex h-full flex-col p-7"
                style={{
                  boxShadow: "var(--pro-card-shadow)",
                  borderColor: t.featured
                    ? "var(--pro-accent)"
                    : "var(--pro-border-soft)",
                  borderWidth: t.featured ? 1.5 : 1,
                }}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-[10px]"
                  style={{ background: "var(--pro-bg-sunken)" }}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={1.9}
                    style={{ color: "var(--pro-accent)" }}
                    aria-hidden
                  />
                </span>
                <h3
                  className="pro-display mt-5 text-[17px] font-bold"
                  style={{ color: "var(--pro-fg)" }}
                >
                  {t.name}
                </h3>
                <p
                  className="pro-display mt-2 text-[34px] font-bold tabular-nums"
                  style={{ color: "var(--pro-fg)" }}
                >
                  {t.price}
                </p>
                <p
                  className="pro-body mt-2 flex-1 text-[13.5px] leading-[1.65]"
                  style={{ color: "var(--pro-muted)" }}
                >
                  {t.blurb}
                </p>
                <Link
                  href={t.href}
                  className="pro-body mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[10px] border text-[14px] font-semibold transition-colors"
                  style={{
                    borderColor: "var(--pro-border)",
                    color: "var(--pro-fg)",
                  }}
                  aria-label={`${t.name} — ${t.price}. Start creating.`}
                >
                  Choose {t.name.toLowerCase()}
                </Link>
              </article>
            </Reveal>
          );
        })}
      </div>
      <Reveal delay={120}>
        <p
          className="pro-body mt-8 text-center text-[13px]"
          style={{ color: "var(--pro-faint)" }}
        >
          Prices include GST. Every price on this page comes from the same
          price list the checkout uses —{" "}
          <Link
            href="/pricing"
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--pro-accent)" }}
          >
            full pricing details
          </Link>
          .
        </p>
      </Reveal>
    </Section>
  );
}

/* ── Final CTA ── */

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 sm:pb-32">
      <Reveal>
        <div
          className="pro-card overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20"
          style={{
            background: "var(--pro-bg-elev)",
            boxShadow: "var(--pro-card-shadow)",
          }}
        >
          <h2
            className="pro-display mx-auto max-w-[20ch] text-[30px] font-bold leading-[1.14] sm:text-[42px]"
            style={{ color: "var(--pro-fg)" }}
          >
            Pay only for what you make.
          </h2>
          <p
            className="pro-body mx-auto mt-4 max-w-[52ch] text-[15.5px] leading-[1.7]"
            style={{ color: "var(--pro-muted)" }}
          >
            Three free images every day. When you need more, pick a service,
            see the price, pay once over UPI. No subscription, ever.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/create" className="pro-btn-primary w-full sm:w-auto">
              Start creating
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="pro-btn-secondary w-full sm:w-auto">
              Compare services
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export { FaqSection };
export type { FaqItem };
