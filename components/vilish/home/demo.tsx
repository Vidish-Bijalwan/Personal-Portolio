/**
 * "Watch it work" — animated prompt → price → creation → download loop.
 *
 * Pure CSS / framer-motion animation, no video files. Loops through a
 * four-phase cycle: the prompt types itself, the fixed price pops in,
 * a shimmer "rendering" bar runs, then the finished card lands with a
 * Download. Renders the static end-state under prefers-reduced-motion.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ShieldCheck, Sparkles } from "lucide-react";
import { priceOf } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";
import { Section, Reveal } from "./reveal";

const PROMPT =
  "A brass lantern on a wooden table, warm morning light, cozy and cinematic";
/** Catalog id behind the demo (never hardcode the price). */
const DEMO_SERVICE = "single-image" as const;
const TYPING_MS_PER_CHAR = 26;
const PRICE_HOLD_MS = 1500;
const RENDER_MS = 2100;
const DONE_HOLD_MS = 3200;

type Phase = "typing" | "price" | "rendering" | "done";

/** Full finished state, shown as-is when the user prefers reduced motion. */
function StaticDemo({ price }: { price: string }) {
  return (
    <div
      className="pro-card mx-auto max-w-2xl p-6 sm:p-8"
      style={{ boxShadow: "var(--pro-card-shadow)" }}
    >
      <PromptRow typed={PROMPT} cursor={false} />
      <div className="mt-4">
        <PriceTag price={price} animated={false} />
      </div>
      <div className="mt-5">
        <FinishedCard price={price} animated={false} />
      </div>
    </div>
  );
}

function PromptRow({ typed, cursor = true }: { typed: string; cursor?: boolean }) {
  return (
    <div
      className="rounded-[14px] border p-4"
      style={{
        borderColor: "var(--pro-border-soft)",
        background: "var(--pro-bg-elev)",
      }}
    >
      <p
        className="pro-body flex items-center gap-2 text-[12px] font-semibold uppercase"
        style={{ color: "var(--pro-muted)", letterSpacing: "0.14em" }}
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Your prompt
      </p>
      <p
        className="pro-body mt-2 min-h-[3.25rem] text-[15px] leading-[1.6]"
        style={{ color: "var(--pro-fg)" }}
        aria-live="polite"
      >
        {typed}
        {cursor && (
          <span
            className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse"
            style={{ background: "var(--pro-accent)" }}
            aria-hidden
          />
        )}
      </p>
    </div>
  );
}

function PriceTag({ price, animated = true }: { price: string; animated?: boolean }) {
  const body = (
    <>
      <span
        className="pro-display text-[17px] font-bold tabular-nums"
        style={{ color: "var(--pro-accent)" }}
      >
        {price}
      </span>
      <span className="pro-body text-[13px]" style={{ color: "var(--pro-muted)" }}>
        fixed price — shown before you pay
      </span>
    </>
  );
  const cls =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2";
  const style = {
    borderColor: "var(--pro-accent)",
    background: "var(--pro-bg-elev)",
  } as const;
  if (!animated) {
    return (
      <div className={cls} style={style}>
        {body}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className={cls}
      style={style}
    >
      {body}
    </motion.div>
  );
}

function RenderBar() {
  return (
    <div
      className="overflow-hidden rounded-[14px] border p-4"
      style={{
        borderColor: "var(--pro-border-soft)",
        background: "var(--pro-bg-elev)",
      }}
    >
      <p
        className="pro-body text-[12px] font-semibold uppercase"
        style={{ color: "var(--pro-muted)", letterSpacing: "0.14em" }}
      >
        Creating your image
      </p>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full"
        style={{ background: "var(--pro-border-soft)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--pro-accent), var(--pro-accent-soft))",
          }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: RENDER_MS / 1000, ease: "easeInOut" }}
        />
      </div>
      <p className="pro-body mt-2 text-[13px]" style={{ color: "var(--pro-muted)" }}>
        Rendering, then a human review before delivery…
      </p>
    </div>
  );
}

function FinishedCard({ price, animated = true }: { price: string; animated?: boolean }) {
  const card = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pro/ad-skincare.jpg"
        alt="Finished creation: a warm, cinematic product shot"
        className="aspect-[16/10] w-full object-cover"
      />
      <div
        className="flex items-center justify-between gap-3 p-4"
        style={{ background: "var(--pro-bg-elev)" }}
      >
        <div>
          <p className="pro-display text-[15px] font-bold" style={{ color: "var(--pro-fg)" }}>
            Your finished image
          </p>
          <p className="pro-body text-[13px]" style={{ color: "var(--pro-muted)" }}>
            HD download · {price} paid once
          </p>
        </div>
        <Link
          href="/create?service=single-image"
          className="pro-btn-primary inline-flex items-center gap-2 !px-5 !py-2.5 text-[14px]"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download
        </Link>
      </div>
    </>
  );
  const cls = "overflow-hidden rounded-[14px] border";
  const style = { borderColor: "var(--pro-border-soft)" } as const;
  if (!animated) {
    return (
      <div className={cls} style={style}>
        {card}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={cls}
      style={style}
    >
      {card}
    </motion.div>
  );
}

export function DemoSection() {
  const reduceMotion = useReducedMotion();
  const price = formatINR(priceOf(DEMO_SERVICE));
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedLen, setTypedLen] = useState(0);
  /** Bump at the end of each cycle so the whole timeline re-runs. */
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(fn, ms));

    // Phase 1: type the prompt.
    setTypedLen(0);
    setPhase("typing");
    const typer = window.setInterval(() => {
      setTypedLen((n) => {
        if (n >= PROMPT.length) {
          window.clearInterval(typer);
          return n;
        }
        return n + 1;
      });
    }, TYPING_MS_PER_CHAR);
    timers.push(typer);

    // Phases 2–4, chained after typing completes, then loop.
    const typingMs = PROMPT.length * TYPING_MS_PER_CHAR + 450;
    later(() => setPhase("price"), typingMs);
    later(() => setPhase("rendering"), typingMs + PRICE_HOLD_MS);
    later(() => setPhase("done"), typingMs + PRICE_HOLD_MS + RENDER_MS);
    later(
      () => setCycle((c) => c + 1),
      typingMs + PRICE_HOLD_MS + RENDER_MS + DONE_HOLD_MS,
    );

    return () => {
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
    };
  }, [reduceMotion, cycle]);

  if (reduceMotion) {
    return (
      <Section
        eyebrow="Watch it work"
        title="From words to download in minutes."
        lede="One prompt, one fixed price, one finished image. This is the whole process — nothing hidden in between."
      >
        <StaticDemo price={price} />
        <ReassuranceLine />
      </Section>
    );
  }

  return (
    <Section
      eyebrow="Watch it work"
      title="From words to download in minutes."
      lede="One prompt, one fixed price, one finished image. This is the whole process — nothing hidden in between."
    >
      <div
        className="pro-card mx-auto max-w-2xl p-6 sm:p-8"
        style={{ boxShadow: "var(--pro-card-shadow)" }}
      >
        <PromptRow typed={PROMPT.slice(0, typedLen)} />
        <div className="mt-4 min-h-[3rem]">
          {(phase === "price" || phase === "rendering" || phase === "done") && (
            <PriceTag price={price} />
          )}
        </div>
        <div className="mt-2">
          {phase === "rendering" && <RenderBar key="render" />}
          {phase === "done" && <FinishedCard price={price} />}
        </div>
      </div>
      <ReassuranceLine />
    </Section>
  );
}

/** Honest skepticism-defuser — restates the /pricing + /about guarantee. */
function ReassuranceLine() {
  return (
    <Reveal className="mx-auto mt-8 flex max-w-2xl items-start gap-3">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
        style={{
          borderColor: "var(--pro-accent)",
          background: "var(--pro-bg-elev)",
          color: "var(--pro-accent)",
        }}
      >
        <ShieldCheck className="h-4 w-4" aria-hidden />
      </span>
      <p className="pro-body text-[15px] leading-[1.65]" style={{ color: "var(--pro-muted)" }}>
        Worried AI output will look cheap? Every order is human-reviewed before
        delivery — if a render fails, you&apos;re refunded automatically.
      </p>
    </Reveal>
  );
}
