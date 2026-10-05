"use client";

import { cn } from "@/lib/utils";

/**
 * BurgerGrill — the free-tier waiting-room showpiece.
 * A burger assembles piece by piece on a glowing grill, driven by the
 * backend stage string:
 *   frame 0 — grill heating (queued / unknown stages)
 *   frame 1 — "Firing up the grill": heat glow + bottom bun drops
 *   frame 2 — "Cooking your creation": patty sizzles (particles, steam)
 *   frame 3 — "Plating it up": cheese / toppings / top bun stack
 *
 * prefers-reduced-motion: watch.css kills the loops and hides ambient
 * particles, leaving a calm static grill + text status.
 */
export function burgerFrameForStage(stage: string | null): number {
  const s = (stage ?? "").toLowerCase();
  if (s.includes("plat")) return 3;
  if (s.includes("cook")) return 2;
  if (s.includes("fir") || s.includes("grill") || s.includes("heat") || s.includes("warm"))
    return 1;
  return 0;
}

const EMBERS = [
  { cx: 120, cy: 200, r: 4, delay: "0s", fill: "#FF2D78" },
  { cx: 170, cy: 202, r: 3, delay: "-0.9s", fill: "#D7FF3F" },
  { cx: 220, cy: 200, r: 4.5, delay: "-1.7s", fill: "#00F0FF" },
  { cx: 270, cy: 202, r: 3, delay: "-0.4s", fill: "#FF2D78" },
  { cx: 310, cy: 200, r: 4, delay: "-2.2s", fill: "#D7FF3F" },
  { cx: 145, cy: 204, r: 2.5, delay: "-1.2s", fill: "#00F0FF" },
  { cx: 250, cy: 204, r: 2.5, delay: "-2.6s", fill: "#FF2D78" },
];

const STEAM = [
  { d: "M168,148 q7,-13 0,-26 q-7,-13 0,-26", delay: "0s" },
  { d: "M212,148 q7,-13 0,-26 q-7,-13 0,-26", delay: "-0.8s" },
  { d: "M256,148 q7,-13 0,-26 q-7,-13 0,-26", delay: "-1.6s" },
];

export default function BurgerGrill({
  frame,
  className,
}: {
  frame: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 420 320"
      className={cn("fg-animated w-full max-w-[420px]", className)}
      role="img"
      aria-label="A burger being grilled, assembling layer by layer"
    >
      <defs>
        <radialGradient id="fg-heat" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
          <stop offset="55%" stopColor="#FF2D78" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D7FF3F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fg-bun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7CE7B" />
          <stop offset="100%" stopColor="#D99A3D" />
        </linearGradient>
        <linearGradient id="fg-patty" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A5427" />
          <stop offset="100%" stopColor="#5C3617" />
        </linearGradient>
      </defs>

      {/* heat glow */}
      <ellipse cx="210" cy="210" rx="142" ry="22" fill="url(#fg-heat)" className="fg-glow" />

      {/* grill body */}
      <rect x="46" y="208" width="328" height="66" rx="18" fill="#141416" stroke="#2E2E33" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1={68 + i * 24}
          y1="218"
          x2={68 + i * 24}
          y2="264"
          stroke="#3B3B42"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <rect x="76" y="274" width="14" height="34" rx="7" fill="#232327" />
      <rect x="330" y="274" width="14" height="34" rx="7" fill="#232327" />
      {/* control knobs */}
      <circle cx="120" cy="258" r="8" fill="#0D0D0F" stroke="#3B3B42" strokeWidth="2" />
      <circle cx="120" cy="258" r="3" fill="#D7FF3F" className="fg-sizzle" />
      <circle cx="300" cy="258" r="8" fill="#0D0D0F" stroke="#3B3B42" strokeWidth="2" />
      <circle cx="300" cy="258" r="3" fill="#FF2D78" className="fg-sizzle" style={{ animationDelay: "-0.25s" }} />

      {/* rising embers (ambient) */}
      <g className="fg-ambient">
        {EMBERS.map((e, i) => (
          <circle
            key={i}
            cx={e.cx}
            cy={e.cy}
            r={e.r}
            fill={e.fill}
            className="fg-ember"
            style={{ animationDelay: e.delay }}
          />
        ))}
      </g>

      {/* frame 1: bottom bun drops */}
      {frame >= 1 && (
        <g className="fg-drop">
          <ellipse cx="210" cy="196" rx="104" ry="27" fill="url(#fg-bun)" />
          <ellipse cx="210" cy="190" rx="88" ry="18" fill="#F7CE7B" opacity="0.55" />
        </g>
      )}

      {/* frame 2: patty sizzles */}
      {frame >= 2 && (
        <g className="fg-drop">
          <g className="fg-ambient">
            {STEAM.map((s, i) => (
              <path
                key={i}
                d={s.d}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.7"
                className="fg-steam"
                style={{ animationDelay: s.delay }}
              />
            ))}
          </g>
          <polyline
            points="150,150 157,140 164,150 171,140"
            fill="none"
            stroke="#FF2D78"
            strokeWidth="3"
            strokeLinecap="round"
            className="fg-sizzle"
          />
          <polyline
            points="252,150 259,140 266,150 273,140"
            fill="none"
            stroke="#D7FF3F"
            strokeWidth="3"
            strokeLinecap="round"
            className="fg-sizzle"
            style={{ animationDelay: "-0.3s" }}
          />
          <rect x="104" y="164" width="212" height="27" rx="13.5" fill="url(#fg-patty)" />
          <rect x="140" y="172" width="34" height="6" rx="3" fill="#4A2B12" opacity="0.7" />
          <rect x="196" y="172" width="34" height="6" rx="3" fill="#4A2B12" opacity="0.7" />
          <rect x="252" y="172" width="34" height="6" rx="3" fill="#4A2B12" opacity="0.7" />
        </g>
      )}

      {/* frame 3: cheese, toppings, top bun */}
      {frame >= 3 && (
        <g className="fg-drop">
          {/* lettuce */}
          <path
            d="M112,150 q19,-13 38,0 t38,0 t38,0 t38,0 t38,0"
            fill="none"
            stroke="#7BC96F"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* cheese with drips */}
          <rect x="118" y="130" width="184" height="15" rx="4" fill="#FFD23F" transform="rotate(-3 210 138)" />
          <path d="M150,143 q0,10 -5,14 q-8,-2 -6,-14 z" fill="#FFD23F" />
          <path d="M238,143 q0,12 -6,16 q-8,-2 -5,-16 z" fill="#FFD23F" />
          {/* tomato */}
          <ellipse cx="210" cy="122" rx="66" ry="11" fill="#E5484D" />
          <ellipse cx="210" cy="120" rx="52" ry="7" fill="#F26D6D" opacity="0.6" />
          {/* top bun */}
          <path d="M116,118 C116,68 164,46 210,46 C256,46 304,68 304,118 Z" fill="url(#fg-bun)" />
          <ellipse cx="170" cy="70" rx="9" ry="5" fill="#F7E3B0" transform="rotate(-20 170 70)" />
          <ellipse cx="212" cy="62" rx="9" ry="5" fill="#F7E3B0" />
          <ellipse cx="252" cy="72" rx="9" ry="5" fill="#F7E3B0" transform="rotate(20 252 72)" />
          <ellipse cx="192" cy="88" rx="8" ry="4.5" fill="#F7E3B0" transform="rotate(-12 192 88)" />
          <ellipse cx="232" cy="90" rx="8" ry="4.5" fill="#F7E3B0" transform="rotate(12 232 90)" />
          {/* sparkle accents */}
          <g className="fg-ambient" fill="#D7FF3F">
            <path d="M96,84 l3,8 8,3 -8,3 -3,8 -3,-8 -8,-3 8,-3 z" className="fg-twinkle" />
            <path d="M326,96 l2.5,7 7,2.5 -7,2.5 -2.5,7 -2.5,-7 -7,-2.5 7,-2.5 z" className="fg-twinkle" style={{ animationDelay: "-0.7s" }} fill="#00F0FF" />
          </g>
        </g>
      )}
    </svg>
  );
}
