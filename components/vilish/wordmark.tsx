import { useId } from "react";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  /** Height of the glyph mark in px; the word scales proportionally. */
  size?: number;
  /** Ink tone for the word on dark backgrounds. */
  tone?: "light" | "dim";
  className?: string;
};

/**
 * Vidish wordmark — a custom-built brand mark, not typed text.
 *
 * Glyph: an aperture hexagon (iris motif) cut by a signal slash, holding a
 * bold "V" whose vertex is a neon-lime signal node — cyberpunk-studio character
 * in ~32px of geometry.
 *
 * Word: "VIDISH" in tight uppercase tracking with the "I" replaced by a
 * gradient signal bar, echoing the brand's lime → cyan → magenta wash
 * (`v-iris-text` in app/globals.css).
 *
 * Accessibility/SEO: the wrapper exposes a single accessible name ("Vidish")
 * and hides the decorative per-letter spans from assistive tech.
 *
 * Static by design — a logo should not distract. No animation, so there is
 * nothing for prefers-reduced-motion to disable.
 */
export default function Wordmark({ size = 22, tone = "light", className }: WordmarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `vwm-grad-${uid}`;

  return (
    <span
      role="img"
      aria-label="Vidish"
      className={cn(
        "inline-flex select-none items-center",
        tone === "light" ? "text-[#F5F5F3]" : "text-white/70",
        className,
      )}
      style={{ fontSize: size * 0.72, lineHeight: 1 }}
    >
      {/* ── glyph: aperture hexagon + signal slash + V + node ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="5"
            y1="27"
            x2="27"
            y2="5"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#D7FF3F" />
            <stop offset="0.55" stopColor="#00F0FF" />
            <stop offset="1" stopColor="#FF2D78" />
          </linearGradient>
        </defs>
        {/* aperture ring */}
        <path
          d="M16 3.2 27.4 9.8v14.4L16 30.8 4.6 24.2V9.8L16 3.2Z"
          stroke={`url(#${gradId})`}
          strokeWidth="1.7"
          opacity="0.9"
        />
        {/* signal slash cutting across the aperture */}
        <path
          d="M8.2 24.4 23.8 7.6"
          stroke={`url(#${gradId})`}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* the V */}
        <path
          d="M10.7 11.2 16 21.7 21.3 11.2"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* signal node at the vertex */}
        <circle cx="16" cy="21.7" r="2.1" fill="#D7FF3F" />
      </svg>
      {/* ── the word: crafted spacing, signal-bar "I" ── */}
      <span
        aria-hidden="true"
        className="ml-[0.55em] font-bold tracking-[0.3em]"
        style={{ marginRight: "-0.3em" /* absorb trailing letter-spacing */ }}
      >
        V<span className="v-iris-text">I</span>DISH
      </span>
    </span>
  );
}
