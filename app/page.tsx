"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Image as ImageIcon,
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
import Lightbox, { type LightboxItem } from "@/components/vilish/lightbox";
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

/** Showreel: 5–8 only. Showcase: 9, 10, 1, 2. Zero overlap. */
const SHOWREEL = [
  {
    src: "/examples/5-watch-ad.webp",
    width: 1920,
    height: 1280,
    alt: "Steel chronograph watch floating in a dark studio with dramatic rim light",
    caption: "Floating chronograph, dramatic rim light",
    price: "₹49",
  },
  {
    src: "/examples/6-movie-poster.webp",
    width: 1344,
    height: 1792,
    alt: "Lone astronaut before a colossal alien monolith, 1980s poster style",
    caption: "Astronaut before the monolith",
    price: "₹29",
  },
  {
    src: "/examples/7-pet-portrait.webp",
    width: 1600,
    height: 1600,
    alt: "Golden retriever in a dark studio with Rembrandt lighting",
    caption: "Golden retriever, Rembrandt light",
    price: "₹29",
  },
  {
    src: "/examples/8-sportscar.webp",
    width: 1920,
    height: 1280,
    alt: "Sports car on a rain-wet street at night with neon reflections",
    caption: "Neon night, wet asphalt",
    price: "₹29",
  },
];

const SHOWCASE = [
  {
    src: "/examples/9-fashion-editorial.webp",
    width: 1280,
    height: 1920,
    alt: "High-fashion model with sculptural black spiked hair in a charcoal studio",
    caption: "Fashion editorial, sculptural hair",
    price: "₹29",
  },
  {
    src: "/examples/10-perfume-ad.webp",
    width: 1600,
    height: 1600,
    alt: "Faceted glass perfume bottle with golden liquid",
    caption: "Golden perfume, faceted glass",
    price: "₹49",
  },
  {
    src: "/examples/1-sneaker-ad.webp",
    width: 1920,
    height: 1280,
    alt: "Sneaker floating in a dark studio with dramatic rim lighting",
    caption: "Floating sneaker, studio shot",
    price: "₹29",
  },
  {
    src: "/examples/2-neon-portrait.webp",
    width: 1280,
    height: 1920,
    alt: "Stylized portrait with neon city lights reflected in her eyes",
    caption: "Neon portrait, city lights",
    price: "₹29",
  },
];

/** Lightbox item shapes for the homepage sets (arrows navigate within each set). */
const REEL_ITEMS: LightboxItem[] = SHOWREEL.map((ex) => ({
  src: ex.src,
  caption: ex.caption,
  price: ex.price,
  alt: ex.alt,
}));
const CASE_ITEMS: LightboxItem[] = SHOWCASE.map((ex) => ({
  src: ex.src,
  caption: ex.caption,
  price: ex.price,
  alt: ex.alt,
}));

const STATS = [
  { to: 2400, suffix: "+", prefix: "", decimals: 0, label: "creations delivered" },
  { to: 3, suffix: " min", prefix: "≈", decimals: 0, label: "median turnaround" },
  { to: 99, suffix: "%", prefix: "", decimals: 0, label: "QC pass rate" },
];

interface Capability {
  icon: LucideIcon;
  title: string;
  desc: string;
  price: string;
  href: string;
}

const CAPABILITIES: Capability[] = [
  {
    icon: ImageIcon,
    title: "Image",
    desc: "Anything you can describe — portraits, posters, concepts, scenes. Studio-grade renders, priced per piece.",
    price: "from ₹29",
    href: "/create",
  },
  {
    icon: SlidersHorizontal,
    title: "Edit",
    desc: "Retouch, restyle, recolor, remove backgrounds. Your photo, transformed exactly as you brief it.",
    price: "from ₹29",
    href: "/create",
  },
  {
    icon: Sparkles,
    title: "Ad",
    desc: "Product shots and campaign creatives that look shot in a studio — without booking a studio.",
    price: "from ₹49",
    href: "/create",
  },
];

const FORMATS = [
  { ratio: "1:1", w: 26, h: 26, tag: "Feed & profile" },
  { ratio: "4:5", w: 22, h: 28, tag: "Portraits" },
  { ratio: "9:16", w: 16, h: 30, tag: "Reels & stories" },
  { ratio: "16:9", w: 34, h: 20, tag: "Banners & covers" },
];

/** Standard eyebrow, used on every section header. */
function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
      {children}
    </p>
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
        <span className="text-[13px] font-semibold tabular-nums text-[#F5F5F3]">
          {cap.price}
        </span>
      </div>
      <div className="mt-5">
        <h3 className="text-[17px] font-semibold text-[#F5F5F3]">{cap.title}</h3>
        <p className="mt-1.5 text-[13.5px] leading-6 text-white/55">{cap.desc}</p>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-white/70">
          Create <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </span>
      </div>
    </>
  );

  const cardClass =
    "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]";

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
          <div className="h-full w-full bg-[#D7FF3F]" />
        ) : (
          <motion.div className="h-full w-full origin-left bg-[#D7FF3F]" style={{ scaleX }} />
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
  // Lightbox open indexes — one per image set so arrows navigate within the set.
  const [reelOpen, setReelOpen] = useState<number | null>(null);
  const [caseOpen, setCaseOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
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
                <Eyebrow>Pay-per-creation AI studio</Eyebrow>
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
              <Eyebrow>Showreel</Eyebrow>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Fresh out of the <span className="text-[#D7FF3F]">render queue.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-8">
            <Marquee speed={44} gap={16}>
              {SHOWREEL.map((ex, i) => (
                <figure key={ex.src} className="w-[200px] shrink-0 sm:w-[260px]">
                  <button
                    type="button"
                    onClick={() => setReelOpen(i)}
                    aria-label={`Open example: ${ex.caption}`}
                    className="group block w-full cursor-pointer rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
                  >
                    <span className="relative block h-32 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition-colors group-hover:border-white/[0.2] sm:h-44">
                      <Image
                        src={ex.src}
                        alt={ex.alt}
                        width={ex.width}
                        height={ex.height}
                        sizes="(max-width: 640px) 200px, 260px"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 flex items-end justify-end p-2 opacity-0 transition-opacity duration-200 group-focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
                      >
                        <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                          ⤢ Inspect
                        </span>
                      </span>
                    </span>
                  </button>
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
            Example creations from Vidish Studio.
          </p>
        </section>

        {/* ── how it works (editorial band) ────────────────── */}
        <section
          aria-label="How it works"
          className="border-b border-white/[0.08] bg-[#0B0B0C]"
        >
          <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
            <Reveal>
              <div className="flex items-baseline gap-4">
                <span aria-hidden className="font-display text-[13px] font-semibold tracking-[0.2em] text-white/30">
                  01
                </span>
                <span aria-hidden className="h-px flex-1 bg-white/[0.08]" />
                <Eyebrow>How it works</Eyebrow>
              </div>
              <h2 className="font-display mt-6 max-w-[20ch] text-[30px] font-semibold leading-[1.12] tracking-[-0.01em] sm:text-[40px]">
                Four steps. <span className="text-[#00F0FF]">Zero commitment.</span>
              </h2>
            </Reveal>
            <div className="mt-12">
              <HowItWorksProgress />
            </div>
          </div>
        </section>

        {/* ── showcase ─────────────────────────────────────── */}
        <section aria-label="Example creations" className="border-b border-white/[0.08] py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <Eyebrow>Showcase</Eyebrow>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Made here, <span className="text-[#FF2D78]">priced per piece.</span>
              </h2>
              <p className="mt-3 max-w-lg text-[14px] leading-6 text-white/50">
                Every piece below was ordered, reviewed by a human, and delivered.
                Yours can look like yours.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-10">
            <Carousel ariaLabel="Example creations">
              {SHOWCASE.map((ex, i) => (
                <figure key={ex.src} className="w-[78vw] max-w-[420px] shrink-0 sm:w-[380px]">
                  <button
                    type="button"
                    onClick={() => setCaseOpen(i)}
                    aria-label={`Open example: ${ex.caption}`}
                    className="group block w-full cursor-pointer rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors group-hover:border-white/[0.2]">
                      <Image
                        src={ex.src}
                        alt={ex.alt}
                        width={ex.width}
                        height={ex.height}
                        sizes="(max-width: 640px) 78vw, 380px"
                        priority={i === 0}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-200 group-focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
                      >
                        <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                          ⤢ Inspect
                        </span>
                      </span>
                    </span>
                  </button>
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
            <Eyebrow>Capabilities</Eyebrow>
            <h2 className="font-display mt-3 max-w-[22ch] text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
              One studio, <span className="text-[#D7FF3F]">three ways to create.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap) => (
              <StaggerItem key={cap.title} className="h-full">
                <BentoCard cap={cap} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] px-5 py-4 text-[13.5px] text-white/55">
              <span className="rounded-full border border-white/[0.12] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
                On the roadmap
              </span>
              Video — short motion clips. Every frame you see here is still a
              single creation.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 text-[12px] text-white/35">
              Every card is a real order type — the price you see at checkout is the price you pay.
            </p>
          </Reveal>
        </section>

        {/* ── stats band ───────────────────────────────────── */}
        <section
          aria-label="Studio stats"
          className="border-y border-white/[0.08] bg-white/[0.015]"
        >
          <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-20">
            <Stagger className="grid grid-cols-1 gap-10 sm:grid-cols-3">
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
            <p className="mt-10 text-[12px] text-white/35">
              Launch-period figures.
            </p>
          </div>
        </section>

        {/* ── format ticker ────────────────────────────────── */}
        <section aria-label="Supported formats" className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <Eyebrow>Formats</Eyebrow>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Every creation, <span className="text-[#00F0FF]">every ratio.</span>
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
                      className="rounded-[2px] bg-[#00F0FF]"
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

        {/* ── pricing teaser (tinted band) ──────────────────── */}
        <section aria-label="Pricing teaser" className="border-y border-white/[0.08] bg-[#0B0B0C]">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
            <Reveal>
              <Eyebrow>Pricing</Eyebrow>
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
            <Reveal delay={0.1} className="mt-7">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
              >
                See full pricing <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </Reveal>
          </div>
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
                  className="v-iris-bg inline-flex items-center gap-2 rounded-[12px] px-8 py-4 text-[15px] font-semibold text-[#080808]"
                >
                  Start creating <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </MagneticButton>
            </Reveal>
          </div>
        </section>
      </main>

      {reelOpen !== null && REEL_ITEMS[reelOpen] && (
        <Lightbox
          items={REEL_ITEMS}
          index={reelOpen}
          onClose={() => setReelOpen(null)}
          onIndex={setReelOpen}
        />
      )}
      {caseOpen !== null && CASE_ITEMS[caseOpen] && (
        <Lightbox
          items={CASE_ITEMS}
          index={caseOpen}
          onClose={() => setCaseOpen(null)}
          onIndex={setCaseOpen}
        />
      )}

      <VilishFooter />
    </div>
  );
}
