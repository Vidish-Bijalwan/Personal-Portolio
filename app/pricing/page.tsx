"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Counter from "@/components/motion/Counter";
import MagneticButton from "@/components/motion/MagneticButton";
// NOTE: task specified @/lib/motion/theme, but the motion theme currently
// lives at @/src/lib/motion/theme (the only existing path). See NOTES.
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

const REASSURANCES = [
  { icon: BadgeCheck, text: "Exact price before you pay" },
  { icon: ShieldCheck, text: "Failed renders refunded" },
  { icon: Sparkles, text: "Human QC on every order" },
];

function TierCard({ tier }: { tier: Tier }) {
  const reduced = usePrefersReducedMotion();
  const popular = tier.name === POPULAR_TIER;

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -4 }}
      transition={MOTION.springs.ui}
      aria-disabled={tier.comingSoon}
      className={
        "relative flex h-full flex-col rounded-[16px] border bg-[#121214] p-6 " +
        (popular ? "v-iris-border " : "border-white/[0.08] ") +
        (tier.comingSoon ? "opacity-60" : "")
      }
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold">{tier.name}</h2>
        {popular && (
          <span className="v-iris-bg rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#080808]">
            Most popular
          </span>
        )}
        {tier.comingSoon && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/60">
            Soon
          </span>
        )}
      </div>

      <p className="mt-3 text-[30px] font-semibold tabular-nums tracking-[-0.01em]">
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
            "mt-5 inline-flex items-center justify-center gap-1.5 rounded-[10px] border px-4 py-2.5 text-[13px] font-medium text-[#F5F5F3] transition-colors " +
            (popular
              ? "v-iris-border hover:opacity-90"
              : "border-white/[0.12] bg-[#18181B] hover:border-white/25")
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
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[36px]">
            No subscription. No credits.
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-white/[0.58]">
            Pay per creation. You always see the exact price before anything is
            charged, and failed renders are refunded automatically.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t) => (
            <StaggerItem key={t.name} className="h-full">
              <TierCard tier={t} />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
          {REASSURANCES.map((r, i) => (
            <Reveal key={r.text} delay={i * 0.08} className="inline-block">
              <span className="inline-flex items-center gap-2 text-[13px] font-medium text-white/70">
                <r.icon className="h-4 w-4 text-white/50" />
                {r.text}
              </span>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-[13px] leading-6 text-white/40">
          Prices include payment fees and taxes — the number you see is the
          number you pay. Nothing else is added at checkout.
        </p>

        <Reveal className="mt-12 flex justify-center">
          <Link href="/create" aria-label="Start creating">
            <MagneticButton>
              <span className="v-iris-bg inline-flex items-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold text-[#080808]">
                Start creating <ArrowRight className="h-4 w-4" />
              </span>
            </MagneticButton>
          </Link>
        </Reveal>
      </main>
      <VilishFooter />
    </div>
  );
}
