import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brush,
  Check,
  ShieldCheck,
  Sparkles,
  Tag,
  Wallet,
} from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata = {
  title: "How Etch works — human-reviewed AI creations | Etch",
  description:
    "How Etch works: describe your idea, see the exact price, pay once with UPI. A human reviews every creation before delivery. No subscription.",
  alternates: { canonical: "/about" },
};

const HOW = [
  {
    step: "01",
    title: "Describe it",
    text: "Write what you want in plain words. Pick a style and aspect ratio.",
  },
  {
    step: "02",
    title: "See the exact price",
    text: "One fixed price, shown before you pay. No credits, no wallets.",
  },
  {
    step: "03",
    title: "Pay once with UPI",
    text: "Scan, pay, drop your UTR. No account needed until checkout.",
  },
  {
    step: "04",
    title: "Human QC + delivery",
    text: "A human reviews and creates your piece. You download it once it passes QC.",
  },
];

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Human QC",
    text: "Every order passes a human quality check before delivery. If a render fails, you're refunded automatically.",
  },
  {
    icon: Tag,
    title: "Exact pricing",
    text: "The price you see is the price you pay — shown before you commit, never after.",
  },
  {
    icon: Wallet,
    title: "Simple UPI payments",
    text: "Pay per creation with UPI. No subscription, no credit packs, no surprise fees.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            About
          </p>
          <h1 className="font-display mt-3 max-w-[24ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[52px]">
            An AI studio with <span className="pro-accent-text">a human</span> in the loop.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/[0.62]">
            Etch is a pay-per-creation AI media studio. No subscription, no
            credits, no render roulette: you describe what you want, see the exact
            price, pay once, and a human reviews and delivers every creation. AI
            does the heavy lifting; a person makes sure it&apos;s worth your money.
          </p>
        </Reveal>

        <section aria-label="How it works" className="mt-16">
          <Reveal>
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              How it works
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW.map((h) => (
              <StaggerItem key={h.step} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-white/[0.16]">
                  <span
                    aria-hidden
                    className="font-display text-[26px] font-bold leading-none text-white/25 tabular-nums"
                  >
                    {h.step}
                  </span>
                  <h3 className="mt-3 text-[15px] font-semibold text-[#F5F5F3]">{h.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-white/[0.55]">
                    {h.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section aria-label="Why trust Etch" className="mt-16">
          <Reveal>
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              Why people trust it
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
            {TRUST.map((t) => (
              <StaggerItem key={t.title} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-white/[0.16]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04]">
                    <t.icon className="h-5 w-5 text-white/85" strokeWidth={1.8} aria-hidden />
                  </span>
                  <h3 className="mt-5 text-[15px] font-semibold text-[#F5F5F3]">{t.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-white/[0.55]">
                    {t.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section aria-label="What you can make" className="mt-16">
          <Reveal>
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              What you can make
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Sparkles, text: "Images — portraits, posters, concepts, scenes. From ₹19." },
              { icon: Brush, text: "Edits — retouch, restyle, recolor, remove backgrounds. From ₹19." },
              { icon: BadgeCheck, text: "Ads — studio-grade product shots and campaign creatives. From ₹39." },
              { icon: Check, text: "Remakes — didn't land? Regenerate any finished piece for ₹19." },
            ].map((r, i) => (
              <StaggerItem key={i}>
                <div className="flex h-full items-start gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/[0.16]">
                  <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-white/70" strokeWidth={1.8} aria-hidden />
                  <span className="text-[14px] leading-6 text-white/[0.7]">{r.text}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/create"
                className="pro-cta inline-flex items-center gap-2 rounded-[12px] px-7 py-3.5 text-[15px] font-semibold text-[var(--pro-btn-ink)]"
              >
                Start creating <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href="/examples"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
              >
                Browse examples
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
              >
                Full pricing
              </Link>
            </div>
          </Reveal>
        </section>

        <Reveal className="mt-16">
          <section aria-label="The human behind the studio">
            <div className="rounded-[20px] border border-white/[0.08] bg-[#101012] p-8 sm:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                The human behind the studio
              </p>
              <p className="mt-3 max-w-xl text-[14px] leading-7 text-white/[0.62]">
                Etch is run by Vidish Bijalwan — the human who reviews
                your brief, checks every creation, and makes sure it&apos;s worth
                what you paid.
              </p>
              <Link
                href="/about/portfolio"
                className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
              >
                The human behind the studio <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
      <VilishFooter />
    </div>
  );
}
