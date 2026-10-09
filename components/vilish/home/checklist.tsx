/**
 * "Everything Etch does — checked off" — numbered checklist of all
 * 8 catalog services in the reel's checklist visual language.
 *
 * Each row: number (01–08), service name, one-line plain-English
 * description, the real price from the Oct 8 catalog (derived via
 * priceOf — never hardcoded), and a link to its tool page (verified
 * against the tool directory where an entry exists). The ✓ animates
 * in as each row scrolls into view (framer-motion whileInView); under
 * prefers-reduced-motion the checks render already checked.
 */
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { priceOf, type PriceEntry } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";
import { toolById } from "@/src/lib/tools/directory";
import { Section } from "./reveal";

interface ChecklistRow {
  /** Catalog id — the single source of the price. */
  priceId: PriceEntry["id"];
  name: string;
  blurb: string;
  href: string;
}

/** Tool-page links are taken from the tool directory (toolById) so a
 *  renamed route updates here automatically; entries without a
 *  directory listing point at their parent flow. */
const ROWS: ChecklistRow[] = [
  {
    priceId: "single-image",
    name: "Single image",
    blurb: "One finished image, from your words, in your aspect ratio.",
    href: toolById("single-image")?.href ?? "/create",
  },
  {
    priceId: "pack-4",
    name: "4-pack",
    blurb: "Four variations on one idea — explore before you commit.",
    href: toolById("pack-4")?.href ?? "/create?service=pack-4",
  },
  {
    priceId: "product-photo",
    name: "Product photo",
    blurb: "Listing-ready shots, without booking a photo shoot.",
    href: toolById("product-photo")?.href ?? "/create?service=product-photo",
  },
  {
    priceId: "clip-5s",
    name: "5-second clip",
    blurb: "A short video clip from your prompt, ready for reels and ads.",
    href: toolById("clip-5s")?.href ?? "/create?media=video",
  },
  {
    priceId: "video-studio",
    name: "Video Studio",
    blurb: "AI voice-overs and captions for the footage you already have.",
    href: toolById("tts")?.href ?? "/video-studio",
  },
  {
    priceId: "remake",
    name: "Remake",
    blurb: "Didn't land? Re-run any order from your original brief.",
    href: "/create",
  },
  {
    priceId: "tool-basic",
    name: "Basic tools",
    blurb: "Everyday converters and compressors — MP4→MP3, GIF, and more.",
    href: toolById("compress")?.href ?? "/video-studio",
  },
  {
    priceId: "tool-plus",
    name: "Plus tools",
    blurb: "Heavier jobs: trim with text, audio mixing, noise reduction.",
    href: toolById("trim")?.href ?? "/video-studio",
  },
];

function CheckBadge({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  const cls =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border";
  const style = {
    borderColor: "var(--pro-accent)",
    background: "var(--pro-bg-elev)",
    color: "var(--pro-accent)",
  } as const;
  if (reduced) {
    return (
      <span className={cls} style={style} aria-hidden>
        <Check className="h-4.5 w-4.5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <motion.span
      className={cls}
      style={style}
      aria-hidden
      initial={{ scale: 0, rotate: -30, opacity: 0 }}
      whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay }}
    >
      <Check className="h-4.5 w-4.5" strokeWidth={3} />
    </motion.span>
  );
}

export function ChecklistSection() {
  const reduced = useReducedMotion();
  return (
    <Section
      eyebrow="The full menu"
      title="Everything Etch does — checked off."
      lede="Eight services, eight fixed prices. Pick the one you need, see the price up front, pay once."
    >
      <ol className="mx-auto max-w-3xl">
        {ROWS.map((row, i) => (
          <li key={row.priceId}>
            <Link
              href={row.href}
              className="group flex items-center gap-4 border-b py-4 sm:gap-6 sm:py-5"
              style={{ borderColor: "var(--pro-border-soft)" }}
              aria-label={`${row.name}, ${formatINR(priceOf(row.priceId))}`}
            >
              <span
                className="pro-display w-10 shrink-0 text-[14px] font-bold tabular-nums"
                style={{ color: "var(--pro-accent)", letterSpacing: "0.12em" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <CheckBadge delay={i * 0.04} />
              <span className="min-w-0 flex-1">
                <motion.span
                  className="pro-display block text-[17px] font-bold leading-snug sm:text-[19px]"
                  style={{ color: "var(--pro-fg)" }}
                  initial={reduced ? false : { opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-12% 0px" }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                >
                  {row.name}
                </motion.span>
                <span
                  className="pro-body mt-0.5 block text-[14px] leading-[1.6]"
                  style={{ color: "var(--pro-muted)" }}
                >
                  {row.blurb}
                </span>
              </span>
              <span
                className="pro-display shrink-0 text-[16px] font-bold tabular-nums sm:text-[18px]"
                style={{ color: "var(--pro-fg)" }}
              >
                {formatINR(priceOf(row.priceId))}
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                style={{ color: "var(--pro-accent)" }}
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  );
}
