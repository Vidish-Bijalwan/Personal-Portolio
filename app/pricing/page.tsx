"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  MousePointerClick,
  QrCode,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Counter from "@/components/motion/Counter";
import Marquee from "@/components/motion/Marquee";
import MagneticButton from "@/components/motion/MagneticButton";
import { MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme";

interface Tier {
  name: string;
  price: string;
  blurb: string;
  action?: { label: string; href: string };
  comingSoon?: boolean;
}

/* Exact pricing data — prices and copy unchanged. */
const TIERS: Tier[] = [
  {
    name: "Single image",
    price: "₹29",
    blurb: "One AI image at your chosen quality and aspect ratio. Live price shown before you pay.",
    action: { label: "Create one", href: "/create" },
  },
  {
    name: "4-pack",
    price: "₹79",
    blurb: "Four images in one bundle — iterate on a concept without paying four times.",
    action: { label: "Create", href: "/create" },
  },
  {
    name: "Product photo",
    price: "₹49",
    blurb: "Studio-grade product shot from a description or reference.",
    action: { label: "Create", href: "/create" },
  },
  {
    name: "5s clip",
    price: "₹99",
    blurb: "Short AI video generation.",
    comingSoon: true,
  },
  {
    name: "Remake",
    price: "₹19",
    blurb: "Didn't land? Regenerate any finished image with the same settings for less.",
  },
];

/* Emphasized tier — rendered with .v-iris-border. */
const POPULAR_TIER = "4-pack";

/** Numeric amount derived from the exact price string (no data change). */
function amountOf(t: Tier): number {
  return Number(t.price.replace(/[^\d]/g, ""));
}

const TICKER_ITEMS = [
  "One creation. One price.",
  "No subscription",
  "Exact price before you pay",
  "Failed renders refunded",
  "Human QC on every order",
  "No credits, no wallets",
];

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

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Describe it",
    text: "Write what you want on the create page. Pick a style, see the exact price.",
  },
  {
    icon: QrCode,
    title: "Pay with UPI",
    text: "Scan, pay the shown amount, drop your UTR. No account needed until checkout.",
  },
  {
    icon: Truck,
    title: "Get it delivered",
    text: "A human reviews and fulfills your order — your finished creation, delivered to you.",
  },
];

function PopularBadge() {
  const reduced = usePrefersReducedMotion();
  const inner = (
    <span className="v-iris-bg rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#080808]">
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
          ? "v-iris-border shadow-[0_0_44px_-12px_rgba(139,92,246,0.5)] "
          : "border-white/[0.08] hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] ") +
        (tier.comingSoon ? "opacity-60 " : "")
      }
    >
      {popular && (
        <span
          aria-hidden="true"
          className="v-iris-bg pointer-events-none absolute -inset-px -z-10 rounded-[18px] opacity-40 blur-xl"
        />
      )}

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

      <p className="mt-3 text-[34px] font-semibold tabular-nums tracking-[-0.01em]">
        {tier.comingSoon ? (
          tier.price
        ) : (
          <Counter to={amountOf(tier)} prefix="₹" duration={1.2} />
        )}
      </p>

      <p className="mt-2 flex-1 text-[13px] leading-6 text-white/[0.58]">{tier.blurb}</p>

      {tier.action && !tier.comingSoon && (
        <Link
          href={tier.action.href}
          className={
            "mt-5 inline-flex items-center justify-center gap-1.5 rounded-[10px] border px-4 py-2.5 text-[13px] font-medium text-[#F5F5F3] transition-all " +
            (popular
              ? "v-iris-bg border-transparent text-[#080808] hover:brightness-110"
              : "border-white/[0.12] bg-[#18181B] hover:border-white/30 hover:bg-[#1E1E22]")
          }
        >
          {tier.action.label} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </motion.div>
  );
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-white/45">
            Pricing
          </p>
          <h1 className="font-display mt-3 text-[34px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            One creation.{" "}
            <span className="v-iris-text">One price.</span>
            <br />
            No subscription.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58]">
            Pay per creation. You always see the exact price before anything is
            charged, and failed renders are refunded automatically.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-8">
          <div className="overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#101012] py-3">
            <Marquee speed={55} gap={48}>
              {TICKER_ITEMS.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-3 whitespace-nowrap text-[13px] font-medium text-white/[0.65]"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-300/80" />
                  {t}
                </span>
              ))}
            </Marquee>
          </div>
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
                className="v-iris-bg pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-15 blur-3xl"
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
              What you&apos;re <span className="v-iris-text">not</span> paying for
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
          <Reveal>
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              How it works
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="relative h-full rounded-[16px] border border-white/[0.08] bg-[#121214] p-5">
                  <span className="font-display v-iris-text text-[28px] font-bold leading-none">
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

        <Reveal className="mt-10">
          <div className="flex flex-col items-center gap-4 rounded-[20px] border border-white/[0.08] bg-[#101012] px-6 py-10 text-center sm:py-12">
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] sm:text-[30px]">
              Your idea, <span className="v-iris-text">made real</span> —
              from ₹19
            </h2>
            <p className="max-w-md text-[14px] leading-6 text-white/[0.55]">
              Describe it once. See the exact price. Pay with UPI. We handle
              the rest.
            </p>
            <Link href="/create" aria-label="Start creating">
              <MagneticButton>
                <span className="v-iris-bg inline-flex items-center gap-2 rounded-[12px] px-7 py-3.5 text-[15px] font-semibold text-[#080808]">
                  Start creating <ArrowRight className="h-4 w-4" />
                </span>
              </MagneticButton>
            </Link>
          </div>
        </Reveal>
      </main>
      <VilishFooter />
    </div>
  );
}
