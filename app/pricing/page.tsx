"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Counter from "@/components/motion/Counter";
import MagneticButton from "@/components/motion/MagneticButton";
import { MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme";
import { PRICE_CATALOG, priceOf, type PriceEntry } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";

interface TierMeta {
  blurb: string;
  action?: { label: string; href: string };
  comingSoon?: boolean;
}

/* Per-tier copy. Prices come from PRICE_CATALOG — never hardcode them here.
 * Card CTAs deep-link into the composer with the matching service
 * preselected, so the price the card advertises is the price quoted. */
const TIER_META: Record<PriceEntry["id"], TierMeta> = {
  "single-image": {
    blurb:
      "One AI image at your chosen quality and aspect ratio. Live price shown before you pay.",
    action: { label: "Create one", href: "/create?service=single-image" },
  },
  "pack-4": {
    blurb:
      "Four images in one bundle — iterate on a concept without paying four times.",
    action: { label: "Create", href: "/create?service=pack-4" },
  },
  "product-photo": {
    blurb: "Studio-grade product shot from a description or reference.",
    action: { label: "Create", href: "/create?service=product-photo" },
  },
  "clip-5s": {
    blurb: `A 5-second AI video clip from your description — or up to a full minute; the price scales with length (${formatINR(priceOf("clip-5s"))} per 5-second block). Fulfilled by an operator and human-reviewed before delivery.`,
    action: { label: "Create a clip", href: "/create?media=video" },
  },
  "video-studio": {
    blurb: `Voice-over & TTS, auto-captioning, or trim + text overlay on your video. One finished video per job — ${formatINR(priceOf("video-studio"))} for the AI jobs, ${formatINR(priceOf("tool-plus"))} or ${formatINR(priceOf("tool-basic"))} for simple processing.`,
    action: { label: "Open Video Studio", href: "/video-studio" },
  },
  remake: {
    blurb:
      "Didn't land? Regenerate any finished image with the same settings for less.",
  },
  "tool-basic": {
    blurb: `Trivial converters — MP4→MP3, GIF maker, video compressor. Real ffmpeg processing, ${formatINR(priceOf("tool-basic"))} a job.`,
    action: { label: "Open Video Studio", href: "/video-studio" },
  },
  "tool-plus": {
    blurb: `Heavier processing — trim & text, add audio, noise reduction. ${formatINR(priceOf("tool-plus"))} a job.`,
    action: { label: "Open Video Studio", href: "/video-studio" },
  },
};

interface Tier {
  name: string;
  price: string;
  blurb: string;
  action?: { label: string; href: string };
  comingSoon?: boolean;
}

/* Tiers rendered from the canonical catalog — price drift fails the catalog test. */
const TIERS: Tier[] = PRICE_CATALOG.map((p) => ({
  name: p.label,
  price: formatINR(p.paise),
  ...TIER_META[p.id],
}));

/* Emphasized tier — rendered with .pro-ring-border. */
const POPULAR_TIER = "4-pack";

/** Numeric amount derived from the exact price string (no data change). */
function amountOf(t: Tier): number {
  return Number((t.price ?? "0").replace(/[^\d]/g, ""));
}

const PROMISES = [
  {
    icon: BadgeCheck,
    title: "No subscription",
    text: "Nobody charges you for a month you didn't create in.",
  },
  {
    icon: ShieldCheck,
    title: "No credit packs",
    text: "No leftover credits expiring in a wallet you'll forget about.",
  },
  {
    icon: Sparkles,
    title: "No surprise fees",
    text: "The price on the card is the price at checkout. Taxes and payment fees included.",
  },
];

/* Order lifecycle — the operator model: payment verified first, then a
   human reviews, creates, and quality-checks your piece. */
const PRICING_FAQS = [
  {
    q: "How do I pay for my creation?",
    a: "With UPI. After you approve the quoted price, you get a QR code and a VPA — pay the exact amount from any UPI app, then tap “I've paid”. The studio confirms it directly; no UTR or screenshot needed.",
  },
  {
    q: "What happens after I pay?",
    a: "Your payment is verified against the order first. Then a human reviews your brief and references, your piece is created to spec, quality-checked against your brief, and delivered to your dashboard ready to download.",
  },
  {
    q: "How long until I get my creation?",
    a: "Every paid creation passes a human quality check before delivery, so it's not instant — you can track live progress in your dashboard from payment to download.",
  },
  {
    q: "Are there really no subscriptions or hidden fees?",
    a: "None. You pay once per creation — the price on the card is the price at checkout, taxes and payment fees included. Nothing renews, nothing auto-charges, no credits to manage.",
  },
  {
    q: "What if my creation fails or isn't right?",
    a: `Failed renders are refunded, and remakes cost just ${formatINR(priceOf("remake"))} — iterate cheaply until it's right.`,
  },
  {
    q: "Can I use my creations commercially?",
    a: "Yes. Once delivered, the image or video is yours — use it for your shop, listings, social media, or client work.",
  },
];

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Payment verified",
    text: "Your UPI payment is confirmed against the order before anything else moves.",
  },
  {
    icon: UserCheck,
    title: "Human review",
    text: "A human reviews your brief and references — clarifying anything unclear first.",
  },
  {
    icon: Sparkles,
    title: "Creation",
    text: "Your piece is created to spec, iterated until it's right.",
  },
  {
    icon: BadgeCheck,
    title: "QC",
    text: "Quality control: every piece is checked against your brief before delivery.",
  },
  {
    icon: PackageCheck,
    title: "Delivered",
    text: "Your finished creation is delivered to you, ready to download.",
  },
];

function PopularBadge() {
  const reduced = usePrefersReducedMotion();
  const inner = (
    <span className="rounded-full bg-[var(--pro-btn)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pro-btn-ink)]">
      Most popular
    </span>
  );
  if (reduced) return inner;
  return (
    <motion.span
      animate={{ scale: [1, 1.09, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      className="inline-flex"
    >
      {inner}
    </motion.span>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const reduced = usePrefersReducedMotion();
  const popular = tier.name === POPULAR_TIER;

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -8, scale: 1.015 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={MOTION.springs.lively}
      aria-disabled={tier.comingSoon}
      className={
        "relative flex h-full flex-col rounded-[18px] border bg-[#121214] p-6 " +
        (popular
          ? "pro-ring-border shadow-[var(--pro-card-shadow)] "
          : "border-white/[0.08] hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] ") +
        (tier.comingSoon ? "opacity-60 " : "")
      }
    >

      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-[17px] font-semibold tracking-[0.01em]">
          {tier.name}
        </h2>
        {popular && <PopularBadge />}
        {tier.comingSoon && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/60">
            Coming soon
          </span>
        )}
      </div>

      {tier.price && (
        <p className="mt-3 text-[34px] font-semibold tabular-nums tracking-[-0.01em]">
          <Counter to={amountOf(tier)} prefix="₹" duration={1.2} />
        </p>
      )}

      <p className="mt-2 flex-1 text-[13px] leading-6 text-white/[0.58]">{tier.blurb}</p>

      {tier.action && !tier.comingSoon && (
        <Link
          href={tier.action.href}
          className={
            "mt-5 inline-flex items-center justify-center gap-1.5 rounded-[10px] border px-4 py-2.5 text-[13px] font-medium transition-all " +
            (popular
              ? "pro-cta border-transparent text-[var(--pro-btn-ink)] hover:brightness-110"
              : "border-white/[0.12] bg-[#18181B] text-[#F5F5F3] hover:border-white/30 hover:bg-[#1E1E22]")
          }
        >
          {tier.action.label} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </motion.div>
  );
}

const COMPARISON_ROWS: Array<{
  label: string;
  etch: string;
  etchSub?: string;
  typical: string;
}> = [
  {
    label: "Monthly cost when you create nothing",
    etch: formatINR(0),
    etchSub: "nothing renews, nothing auto-charges",
    typical: "₹1,500–2,500/mo",
  },
  {
    label: "Cost per image",
    etch: `from ${formatINR(priceOf("single-image"))}`,
    etchSub: "pay per creation, nothing else",
    typical: "bundled — but you pay every month regardless",
  },
  {
    label: "Unused credits",
    etch: "no credits, no expiry",
    typical: "expire monthly on most plans",
  },
  {
    label: "Price shown before you pay",
    etch: "yes — every time",
    typical: "varies",
  },
  {
    label: "Keep your files forever",
    etch: "yes",
    typical: "yes",
  },
];

function CompareSection() {
  return (
    <Reveal>
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
        Etch vs the <span className="pro-accent-text">subscription habit</span>
      </h2>
      <div className="mt-6 overflow-x-auto rounded-[16px] border border-white/[0.08]">
        <table className="w-full min-w-[560px] border-collapse bg-[#121214] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="w-[34%] px-5 py-4 font-medium text-white/40">
                <span className="sr-only">Feature</span>
              </th>
              <th className="w-[33%] px-5 py-4">
                <span className="pro-accent-text font-display text-[16px] font-semibold">
                  Etch
                </span>
              </th>
              <th className="w-[33%] px-5 py-4 text-[15px] font-semibold text-white/80">
                Typical AI subscription
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((r, i) => (
              <tr
                key={r.label}
                className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/[0.06]" : ""}
              >
                <th
                  scope="row"
                  className="px-5 py-4 align-top text-[13px] font-medium leading-5 text-white/55"
                >
                  {r.label}
                </th>
                <td className="px-5 py-4 align-top">
                  <span className="font-semibold text-[#F5F5F3]">{r.etch}</span>
                  {r.etchSub && (
                    <span className="mt-0.5 block text-[12px] leading-5 text-white/45">
                      {r.etchSub}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 align-top leading-6 text-white/55">
                  {r.typical}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] leading-5 text-white/40">
        Subscription column shows a typical market range — not any specific
        provider&apos;s price. Every Etch figure comes straight from our price
        catalog.
      </p>
    </Reveal>
  );
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            Pricing
          </p>
          <h1 className="font-display mt-3 text-[34px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            One creation.{" "}
            <span className="pro-accent-text">One price.</span>
            <br />
            No subscription.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58]">
            Pay per creation. You always see the exact price before anything is
            charged, and failed renders are refunded automatically.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t) => (
            <StaggerItem key={t.name} className="h-full">
              <TierCard tier={t} />
            </StaggerItem>
          ))}
          <StaggerItem className="h-full">
            <motion.div
              whileHover={{ y: -8 }}
              transition={MOTION.springs.lively}
              className="relative flex h-full flex-col justify-center overflow-hidden rounded-[18px] border border-dashed border-white/[0.14] bg-[#0E0E10] p-6"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--pro-accent)] opacity-15 blur-3xl"
              />
              <h2 className="font-display text-[17px] font-semibold">
                Not sure yet?
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-white/[0.58]">
                Browse example creations first — every one shows the exact price
                it sold for.
              </p>
              <Link
                href="/examples"
                className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium text-[#F5F5F3] transition-colors hover:border-white/30"
              >
                See examples <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </StaggerItem>
        </Stagger>

        <div className="mt-16">
          <Reveal>
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              What you&apos;re <span className="pro-accent-text">not</span> paying for
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
            {PROMISES.map((p) => (
              <StaggerItem key={p.title}>
                <div className="flex h-full flex-col rounded-[16px] border border-white/[0.08] bg-[#121214] p-5">
                  <p.icon className="h-5 w-5 text-white/70" strokeWidth={1.8} />
                  <h3 className="mt-3 text-[15px] font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-white/[0.55]">
                    {p.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="mt-16">
          <CompareSection />
        </div>

        <div className="mt-16">
          <Reveal>
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              Your order&apos;s lifecycle
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="relative h-full rounded-[16px] border border-white/[0.08] bg-[#121214] p-5">
                  <span className="font-display pro-accent-text text-[28px] font-bold leading-none">
                    {i + 1}
                  </span>
                  <s.icon className="mt-3 h-5 w-5 text-white/70" strokeWidth={1.8} />
                  <h3 className="mt-2 text-[15px] font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-white/[0.55]">
                    {s.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <p className="mt-10 text-[13px] leading-6 text-white/40">
          Prices include payment fees and taxes — the number you see is the
          number you pay. Nothing else is added at checkout.
        </p>

        <div className="mt-16">
          <Reveal>
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              Pricing <span className="pro-accent-text">questions</span>
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-3">
            {PRICING_FAQS.map((f, i) => (
              <Reveal key={f.q} delay={Math.min(i * 0.04, 0.2)}>
                <details className="group rounded-[16px] border border-white/[0.08] bg-[#121214] px-5 py-4 open:border-white/[0.16]">
                  <summary className="cursor-pointer list-none text-[15px] font-semibold text-[#F5F5F3] [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {f.q}
                      <span aria-hidden className="text-white/40 transition-transform group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-2.5 text-[13.5px] leading-6 text-white/[0.58]">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: PRICING_FAQS.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }}
          />
        </div>

        <Reveal className="mt-10">
          <div className="flex flex-col items-center gap-4 rounded-[20px] border border-white/[0.08] bg-[#101012] px-6 py-10 text-center sm:py-12">
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] sm:text-[30px]">
              Your idea, <span className="pro-accent-text">made real</span> —
              from {formatINR(priceOf("single-image"))}
            </h2>
            <p className="max-w-md text-[14px] leading-6 text-white/[0.55]">
              Describe it once. See the exact price. Pay with UPI. We handle
              the rest.
            </p>
            <Link href="/create" aria-label="Start creating">
              <MagneticButton>
                <span className="pro-cta inline-flex items-center gap-2 rounded-[12px] px-7 py-3.5 text-[15px] font-semibold text-[var(--pro-btn-ink)]">
                  Start creating <ArrowRight className="h-4 w-4" />
                </span>
              </MagneticButton>
            </Link>
            <p className="text-[13px] text-white/40">
              Not sure yet?{" "}
              <Link href="/examples" className="underline underline-offset-4 hover:text-white/70">
                See what {formatINR(priceOf("single-image"))} makes
              </Link>
            </p>
          </div>
        </Reveal>
      </main>
      <VilishFooter />
    </div>
  );
}
