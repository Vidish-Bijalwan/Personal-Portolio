"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, RefreshCcw, ShieldCheck, Tag } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Composer from "@/components/vilish/composer";
import GenerativeField from "@/components/motion/GenerativeField";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Counter from "@/components/motion/Counter";
import Marquee from "@/components/motion/Marquee";
import MagneticButton from "@/components/motion/MagneticButton";
import Carousel from "@/components/motion/Carousel";

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
      <VilishNav />

      <main>
        {/* ── hero ─────────────────────────────────────────── */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
          <GenerativeField className="absolute inset-0" />
          {/* legibility veil + blend into the next section */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,transparent_0%,rgba(8,8,8,0.55)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#080808]"
          />

          <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:pt-32">
            <Stagger className="flex flex-col items-center">
              <StaggerItem>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50 sm:text-[12px]">
                  Pay-per-creation AI studio
                </p>
              </StaggerItem>
              <StaggerItem>
                <h1 className="mt-5 text-[40px] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-[64px] lg:text-[76px]">
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

        {/* ── marquee strip ────────────────────────────────── */}
        <section aria-label="Studio promises" className="border-y border-white/[0.08] py-4">
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
            <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
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
              <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
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

        {/* ── stats band ───────────────────────────────────── */}
        <section
          aria-label="Studio stats"
          className="mt-16 border-y border-white/[0.08] bg-white/[0.015] sm:mt-24"
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
        <section className="mx-auto max-w-3xl px-4 pb-24 pt-4 text-center sm:pb-32">
          <Reveal>
            <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
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
        </section>
      </main>

      <VilishFooter />
    </div>
  );
}
