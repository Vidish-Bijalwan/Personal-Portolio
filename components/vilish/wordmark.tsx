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
 * Pixaura wordmark — a custom-built brand mark, not typed text.
 *
 * Glyph: a "pixel core" (rotated square, lime → cyan gradient) ringed by two
 * broken aura arcs (cyan + magenta) — pixels with an aura, in ~32px.
 *
 * Word: "PIXAURA" in tight uppercase tracking with the "X" rendered as a
 * gradient cross-glyph, echoing the brand's lime → cyan → magenta wash.
 *
 * Accessibility/SEO: single accessible name ("Pixaura"), decorative
 * per-letter spans hidden from assistive tech. Static by design.
 */
export default function Wordmark({ size = 22, tone = "light", className }: WordmarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `pxw-grad-${uid}`;

  return (
    <span
      role="img"
      aria-label="Pixaura"
      className={cn(
        "inline-flex select-none items-center",
        tone === "light" ? "text-[#F5F5F3]" : "text-white/70",
        className,
      )}
      style={{ fontSize: size * 0.72, lineHeight: 1 }}
    >
      {/* ── glyph: pixel core + aura rings ── */}
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
          <linearGradient id={gradId} x1="8" y1="24" x2="24" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D7FF3F" />
            <stop offset="55%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#FF2D78" />
          </linearGradient>
        </defs>
        {/* aura rings (broken) */}
        <circle
          cx="16"
          cy="16"
          r="12.5"
          stroke="#00F0FF"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="52 26.5"
          transform="rotate(-35 16 16)"
        />
        <circle
          cx="16"
          cy="16"
          r="15"
          stroke="#FF2D78"
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="30 64.2"
          transform="rotate(70 16 16)"
        />
        {/* pixel core */}
        <rect
          x="11.2"
          y="11.2"
          width="9.6"
          height="9.6"
          rx="1.6"
          transform="rotate(45 16 16)"
          fill={`url(#${gradId})`}
        />
        {/* pixel sparks on the rings */}
        <rect x="25.4" y="6.2" width="3.4" height="3.4" rx="0.8" fill="#D7FF3F" transform="rotate(24 27.1 7.9)" />
        <rect x="3.2" y="22.4" width="3" height="3" rx="0.8" fill="#00F0FF" transform="rotate(-18 4.7 23.9)" />
      </svg>

      {/* ── word: PIXAURA, X as gradient cross ── */}
      <span aria-hidden="true" className="ml-[0.42em] font-display font-bold tracking-[0.18em]">
        {"PIX".split("").map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
        <span className="px-aura-text">X</span>
        {"AURA".split("").map((ch, i) => (
          <span key={`a${i}`}>{ch}</span>
        ))}
      </span>
    </span>
  );
}
