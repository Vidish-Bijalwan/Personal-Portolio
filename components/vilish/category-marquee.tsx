"use client";

import Link from "next/link";
import Marquee from "@/components/motion/Marquee";
import {
  MARQUEE_ACCENTS,
  MARQUEE_CATEGORIES,
} from "@/src/lib/vilish/marquee-categories";

/** Re-exported for tests and reuse. */
export { MARQUEE_CATEGORIES };

/**
 * CategoryMarquee — the honest lively banner.
 *
 * A flowing strip of REAL creation categories Pixaura makes. Standing rule:
 * no fake stats, reviews, customers, or activity — so there are no person
 * names here, no "X just generated Y", no counts. Every item links to
 * /examples. Reduced motion renders a static strip (handled by Marquee).
 */
export default function CategoryMarquee() {
  return (
    <div
      aria-label="What you can create with Pixaura"
      className="border-y border-white/[0.08] bg-white/[0.015] py-4"
    >
      <Marquee speed={42} gap={0} pauseOnHover>
        {MARQUEE_CATEGORIES.map((cat, i) => (
          <span key={cat} className="flex shrink-0 items-center">
            <Link
              href="/examples"
              className="whitespace-nowrap px-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-white motion-reduce:transition-none"
            >
              {cat}
            </Link>
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rotate-45"
              style={{ background: MARQUEE_ACCENTS[i % MARQUEE_ACCENTS.length], opacity: 0.8 }}
            />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
