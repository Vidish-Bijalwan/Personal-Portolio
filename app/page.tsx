"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Clapperboard,
  Image as ImageIcon,
  Megaphone,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Composer from "@/components/vilish/composer";
import GenerativeField from "@/components/motion/GenerativeField";
import HeroVideo from "@/components/motion/HeroVideo";
import FlyingElements from "@/components/motion/FlyingElements";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Counter from "@/components/motion/Counter";
import Marquee from "@/components/motion/Marquee";
import MagneticButton from "@/components/motion/MagneticButton";
import Carousel from "@/components/motion/Carousel";
import { MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme";

const TRUST = [
  { icon: Tag, label: "No subscription" },
  { icon: BadgeCheck, label: "Exact price first" },
  { icon: RefreshCcw, label: "Cheap remakes" },
  { icon: ShieldCheck, label: "Failed renders refunded" },
];

const FLOW = [
  { step: "Describe", desc: "Describe the image you want in plain words." },
  { step: "See price", desc: "The exact price is shown before you commit." },
  { step: "Pay once", desc: "One UPI payment. No subscription." },
  { step: "Download", desc: "Download your creation once it passes QC." },
];

const TEASER = [
  { label: "Single image", price: "₹29" },
  { label: "4-pack", price: "₹79" },
  { label: "Product photo", price: "₹49" },
  { label: "Remake", price: "₹19" },
];

const MARQUEE_ITEMS = ["NO SUBSCRIPTION", "EXACT PRICE FIRST", "HUMAN QC", "₹29 FROM"];

const EXAMPLES = [
  {
    src: "/examples/1-sneaker-ad.webp",
    width: 1920,
    height: 1280,
    alt: "Sneaker floating in a dark studio with dramatic rim lighting",
    caption: "Cinematic studio shot of a floating sneaker",
    price: "₹29",
  },
  {
    src: "/examples/2-neon-portrait.webp",
    width: 1280,
    height: 1920,
    alt: "Stylized portrait with neon city lights reflected in her eyes",
    caption: "Neon-lit portrait, city lights in her eyes",
    price: "₹29",
  },
  {
    src: "/examples/3-travel-poster.webp",
    width: 1344,
    height: 1792,
    alt: "Himalayan peaks at dawn in a vintage travel poster style",
    caption: "Himalayan peaks at dawn, vintage travel poster",
    price: "₹29",
  },
  {
    src: "/examples/4-food-photo.webp",
    width: 1920,
    height: 1280,
    alt: "Overhead shot of a gourmet burger on dark slate",
    caption: "Overhead gourmet burger on dark slate",
    price: "₹49",
  },
];

const STATS = [
  { to: 2400, suffix: "+", prefix: "", decimals: 0, label: "creations delivered" },
  { to: 3, suffix: " min", prefix: "≈", decimals: 0, label: "median turnaround" },
  { to: 99, suffix: "%", prefix: "", decimals: 0, label: "QC pass rate" },
];

type Flourish = "shimmer" | "orbit" | "pulse" | "sweep";

interface Capability {
  icon: LucideIcon;
  title: string;
  desc: string;
  price?: string;
  badge?: string;
  flourish: Flourish;
  href: string | null;
}

const CAPABILITIES: Capability[] = [
  {
    icon: ImageIcon,
    title: "Image",
    desc: "Anything you can describe — portraits, posters, concepts, scenes. Studio-grade renders, priced per piece.",
    price: "from ₹29",
    flourish: "shimmer",
    href: "/create",
  },
  {
    icon: SlidersHorizontal,
    title: "Edit",
    desc: "Retouch, restyle, recolor, remove backgrounds. Your photo, transformed exactly as you brief it.",
    price: "from ₹29",
    flourish: "orbit",
    href: "/create",
  },
  {
    icon: Megaphone,
    title: "Ad",
    desc: "Product shots and campaign creatives that look shot in a studio — without booking a studio.",
    price: "from ₹49",
    flourish: "pulse",
    href: "/create",
  },
  {
    icon: Clapperboard,
    title: "Video",
    desc: "Short motion clips are on the roadmap. Until then, every frame you see here is a single still creation.",
    badge: "Coming soon",
    flourish: "sweep",
    href: null,
  },
];

const FORMATS = [
  { ratio: "1:1", w: 26, h: 26, tag: "Feed & profile" },
  { ratio: "4:5", w: 22, h: 28, tag: "Portraits" },
  { ratio: "9:16", w: 16, h: 30, tag: "Reels & stories" },
  { ratio: "16:9", w: 34, h: 20, tag: "Banners & covers" },
];

/** Mini motion flourish per bento card — CSS-keyframed, static under reduced motion. */
function CardFlourish({ kind }: { kind: Flourish }) {
  const reduced = usePrefersReducedMotion();

  if (kind === "shimmer") {
    return (
      <div
        aria-hidden
        className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]"
      >
        <div
          className={`v-iris-bg h-full w-1/3 rounded-full ${reduced ? "" : "v-bento-shimmer"}`}
        />
      </div>
    );
  }
  if (kind === "orbit") {
    return (
      <div aria-hidden className="relative h-9 w-9">
        <span className="absolute inset-0 rounded-full border border-white/[0.14]" />
        <span
          className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#FF2D78] ${reduced ? "ml-[-3px] mt-[-3px]" : "v-bento-orbit"}`}
        />
      </div>
    );
  }
  if (kind === "pulse") {
    return (
      <span
        aria-hidden
        className={`inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.12] px-3.5 text-[12px] font-semibold tabular-nums text-[#F5F5F3] ${reduced ? "" : "v-bento-pulse"}`}
      >
        <span className="v-iris-bg h-1.5 w-1.5 rounded-full" />
        QC passed
      </span>
    );
  }
  // sweep
  return (
    <div aria-hidden className="relative h-9 w-full max-w-[180px]">
      <div className="absolute inset-0 rounded-full border border-dashed border-white/[0.16]" />
      <div
        className={`absolute inset-y-[3px] left-[3px] w-10 rounded-full bg-gradient-to-r from-[#FF2D78]/40 to-[#00F0FF]/10 ${reduced ? "" : "v-bento-sweep"}`}
      />
    </div>
  );
}

function BentoCard({ cap }: { cap: Capability }) {
  const reduced = usePrefersReducedMotion();
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04]">
          <cap.icon className="h-5 w-5 text-white/85" strokeWidth={1.8} aria-hidden />
        </span>
        <CardFlourish kind={cap.flourish} />
      </div>
      <div className="mt-5">
        <h3 className="text-[17px] font-semibold text-[#F5F5F3]">{cap.title}</h3>
        <p className="mt-1.5 text-[13.5px] leading-6 text-white/55">{cap.desc}</p>
      </div>
      <div className="mt-5 flex items-center justify-between">
        {cap.price ? (
          <span className="text-[13px] font-semibold tabular-nums text-[#F5F5F3]">
            {cap.price}
          </span>
        ) : (
          <span className="rounded-full border border-[#FF2D78]/40 bg-[#FF2D78]/10 px-2.5 py-0.5 text-[12px] font-semibold text-[#FF7AA8]">
            {cap.badge}
          </span>
        )}
        {cap.href && (
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-white/70">
            Create <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </span>
        )}
      </div>
    </>
  );

  const cardClass =
    "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]";

  if (!cap.href) {
    return (
      <article className={`${cardClass} opacity-90`} aria-label={`${cap.title} — ${cap.badge}`}>
        {inner}
      </article>
    );
  }

  const linked = (
    <Link href={cap.href} className={cardClass} aria-label={`Create: ${cap.title}`}>
      {inner}
    </Link>
  );

  if (reduced) return linked;

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -6, scale: 1.015 }}
      transition={MOTION.springs.ui}
    >
      {linked}
    </motion.div>
  );
}

/** Bento keyframes (keyframes injected once; classes static under reduced motion). */
function BentoStyles(): ReactNode {
  return (
    <style>{`
      @keyframes v-bento-shimmer { 0% { transform: translateX(-110%); } 100% { transform: translateX(320%); } }
      .v-bento-shimmer { animation: v-bento-shimmer 2.8s ease-in-out infinite; }
      @keyframes v-bento-orbit { from { transform: rotate(0deg) translateX(14px); } to { transform: rotate(360deg) translateX(14px); } }
      .v-bento-orbit { animation: v-bento-orbit 4s linear infinite; }
      @keyframes v-bento-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
      .v-bento-pulse { animation: v-bento-pulse 2.4s ease-in-out infinite; }
      @keyframes v-bento-sweep { 0% { transform: translateX(0); opacity: 0; } 15% { opacity: 1; } 70% { transform: translateX(120px); opacity: 1; } 100% { transform: translateX(132px); opacity: 0; } }
      .v-bento-sweep { animation: v-bento-sweep 3.4s ease-in-out infinite; }
    `}</style>
  );
}

function HowItWorksProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} className="relative">
      {/* progress line (desktop) */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-[26px] hidden h-px bg-white/[0.08] sm:block"
      >
        {reduced ? (
          <div className="v-iris-bg h-full w-full" />
        ) : (
          <motion.div className="v-iris-bg h-full w-full origin-left" style={{ scaleX }} />
        )}
      </div>
      <Stagger className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:gap-6">
        {FLOW.map((f, i) => (
          <StaggerItem key={f.step} className="relative">
            <span
              aria-hidden
              className="relative z-10 inline-block bg-[#080808] pr-4 text-[44px] font-semibold leading-none tracking-[-0.02em] text-white/[0.92] tabular-nums sm:text-[52px]"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-[17px] font-semibold text-[#F5F5F3]">{f.step}</h3>
            <p className="mt-1.5 max-w-[26ch] text-[14px] leading-6 text-white/55">{f.desc}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

export default function VilishLanding() {
  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <BentoStyles />
      <VilishNav />

      <main>
        {/* ── hero ─────────────────────────────────────────── */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
          {/* Video owns the hero — GenerativeField moved to the closing CTA. */}
          <HeroVideo className="absolute inset-0" />
          <FlyingElements className="absolute inset-0 z-[1]" density={0.7} />

          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:pt-32">
            <Stagger className="flex flex-col items-center">
              <StaggerItem>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50 sm:text-[12px]">
                  Pay-per-creation AI studio
                </p>
              </StaggerItem>
              <StaggerItem>
                <h1 className="font-display mt-5 text-[40px] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-[64px] lg:text-[76px]">
                  One creation. <span className="v-iris-text">One price.</span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-white/[0.62] sm:text-[17px]">
                  Generate AI images without another monthly subscription. See the exact
                  price before you pay — from ₹29.
                </p>
              </StaggerItem>
              <StaggerItem>
                <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
                  {TRUST.map((t) => (
                    <li
                      key={t.label}
                      className="flex items-center gap-2 text-[13px] text-white/60"
                    >
                      <t.icon className="h-4 w-4 text-white/75" strokeWidth={1.8} />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            </Stagger>

            <Reveal delay={0.35} className="mt-9 w-full max-w-2xl">
              <Composer variant="hero" />
            </Reveal>
          </div>
        </section>

        {/* ── showreel strip ───────────────────────────────── */}
        <section aria-label="Example showreel" className="border-b border-white/[0.08] py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FF2D78]" strokeWidth={1.8} aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                  Showreel
                </p>
              </div>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Fresh out of the <span className="v-iris-text">render queue.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-8">
            <Marquee speed={44} gap={16}>
              {EXAMPLES.map((ex) => (
                <figure key={ex.src} className="w-[200px] shrink-0 sm:w-[260px]">
                  <div className="relative h-32 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] sm:h-44">
                    <Image
                      src={ex.src}
                      alt={ex.alt}
                      width={ex.width}
                      height={ex.height}
                      sizes="(max-width: 640px) 200px, 260px"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-2.5 flex items-center justify-between gap-2 px-0.5">
                    <span className="truncate text-[12px] text-white/50">{ex.caption}</span>
                    <span className="shrink-0 rounded-full border border-white/[0.12] px-2 py-px text-[11px] font-semibold tabular-nums text-[#F5F5F3]">
                      {ex.price}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </Marquee>
          </Reveal>
          <p className="mt-6 text-center text-[12px] text-white/35">
            All images above are examples made with Vidish Studio — yours will look like yours.
          </p>
        </section>

        {/* ── marquee strip ────────────────────────────────── */}
        <section aria-label="Studio promises" className="border-b border-white/[0.08] py-4">
          <Marquee speed={56} gap={56}>
            {MARQUEE_ITEMS.map((item) => (
              <span key={item} className="flex items-center gap-14">
                <span className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/55">
                  {item}
                </span>
                <span aria-hidden className="v-iris-bg h-1.5 w-1.5 rounded-full" />
              </span>
            ))}
          </Marquee>
        </section>

        {/* ── how it works ─────────────────────────────────── */}
        <section
          aria-label="How it works"
          className="mx-auto max-w-5xl px-4 py-20 sm:py-28"
        >
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
              How it works
            </p>
            <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
              Four steps. <span className="text-white/45">Zero commitment.</span>
            </h2>
          </Reveal>
          <div className="mt-12">
            <HowItWorksProgress />
          </div>
        </section>

        {/* ── showcase ─────────────────────────────────────── */}
        <section aria-label="Example creations" className="py-4 sm:py-8">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                Showcase
              </p>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Made here, <span className="v-iris-text">priced per piece.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-10">
            <Carousel ariaLabel="Example creations">
              {EXAMPLES.map((ex, i) => (
                <figure key={ex.src} className="w-[78vw] max-w-[420px] shrink-0 sm:w-[380px]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                    <Image
                      src={ex.src}
                      alt={ex.alt}
                      width={ex.width}
                      height={ex.height}
                      sizes="(max-width: 640px) 78vw, 380px"
                      priority={i === 0}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 flex items-baseline justify-between gap-3 px-1">
                    <span className="truncate text-[13px] text-white/55">{ex.caption}</span>
                    <span className="shrink-0 rounded-full border border-white/[0.12] px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-[#F5F5F3]">
                      {ex.price}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </Carousel>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 text-center">
            <Link
              href="/examples"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
            >
              View all examples <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </Reveal>
        </section>

        {/* ── capability bento ─────────────────────────────── */}
        <section aria-label="What you can create" className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
              Capabilities
            </p>
            <h2 className="font-display mt-3 max-w-[22ch] text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
              One studio, <span className="v-iris-text">four ways to create.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((cap) => (
              <StaggerItem key={cap.title} className="h-full">
                <BentoCard cap={cap} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <p className="mt-8 text-[12px] text-white/35">
              Every card is a real order type — the price you see at checkout is the price you pay.
            </p>
          </Reveal>
        </section>

        {/* ── stats band ───────────────────────────────────── */}
        <section
          aria-label="Studio stats"
          className="border-y border-white/[0.08] bg-white/[0.015]"
        >
          <Stagger className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-14 text-center sm:grid-cols-3 sm:py-20">
            {STATS.map((s) => (
              <StaggerItem key={s.label}>
                <p className="text-[44px] font-semibold leading-none tracking-[-0.02em] tabular-nums sm:text-[52px]">
                  <Counter
                    to={s.to}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                  />
                </p>
                <p className="mt-2.5 text-[14px] text-white/55">{s.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="-mt-6 pb-10 text-center text-[12px] text-white/35 sm:-mt-10">
            Launch-period figures.
          </p>
        </section>

        {/* ── format ticker ────────────────────────────────── */}
        <section aria-label="Supported formats" className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                Formats
              </p>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Every creation, <span className="v-iris-text">every ratio.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-8">
            <Marquee speed={36} gap={20}>
              {FORMATS.map((f) => (
                <div
                  key={f.ratio}
                  className="flex shrink-0 items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] py-3.5 pl-4 pr-5"
                >
                  <span
                    aria-hidden
                    className="flex items-center justify-center rounded-md border border-[#FF2D78]/50 bg-[#FF2D78]/[0.08]"
                    style={{ width: f.w + 14, height: f.h + 10 }}
                  >
                    <span
                      className="rounded-[2px] bg-gradient-to-br from-[#00F0FF] to-[#FF2D78]"
                      style={{ width: f.w, height: f.h }}
                    />
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold tabular-nums text-[#F5F5F3]">
                      {f.ratio}
                    </span>
                    <span className="block text-[12px] text-white/50">{f.tag}</span>
                  </span>
                </div>
              ))}
            </Marquee>
          </Reveal>
          <p className="mt-6 text-center text-[12px] text-white/35">
            Pick the ratio when you order — no resizes, no surprises.
          </p>
        </section>

        {/* ── pricing teaser ───────────────────────────────── */}
        <section aria-label="Pricing teaser" className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
          <Reveal>
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
              Pricing
            </p>
          </Reveal>
          <Stagger className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {TEASER.map((t) => (
              <StaggerItem key={t.label}>
                <p className="text-[13px] text-white/55">
                  {t.label}{" "}
                  <span className="font-semibold tabular-nums text-[#F5F5F3]">
                    {t.price}
                  </span>
                </p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1} className="mt-7 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
            >
              See full pricing <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </Reveal>
        </section>

        {/* ── closing CTA ──────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <GenerativeField className="absolute inset-0" density={0.8} />
          <FlyingElements className="absolute inset-0" density={0.5} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,transparent_0%,rgba(8,8,8,0.6)_100%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-20 text-center sm:pb-32 sm:pt-28">
            <Reveal>
              <h2 className="font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
                Pay per creation, <span className="v-iris-text">not per month.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12} className="mt-9">
              <MagneticButton>
                <Link
                  href="/create"
                  className="v-iris-bg inline-flex items-center gap-2 rounded-[12px] px-8 py-4 text-[15px] font-semibold text-white"
                >
                  Start creating <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </MagneticButton>
            </Reveal>
          </div>
        </section>
      </main>

      <VilishFooter />
    </div>
  );
}
