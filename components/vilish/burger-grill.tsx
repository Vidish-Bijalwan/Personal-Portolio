"use client";

import { cn } from "@/lib/utils";

/**
 * BurgerGrill — the free-tier waiting-room showpiece.
 * A BIG, unmistakable burger assembles layer by layer on a glowing grill,
 * driven by the backend stage string:
 *   frame 0 — grill heating (queued / unknown stages)
 *   frame 1 — "Firing up the grill": bottom bun drops
 *   frame 2 — "Cooking your creation": patty sizzles (steam + grill marks)
 *   frame 3 — "Plating it up": cheese / tomato / lettuce / top bun stack
 *
 * prefers-reduced-motion: watch.css kills the loops, leaving a calm static
 * burger + text status.
 */
export function burgerFrameForStage(stage: string | null): number {
  const s = (stage ?? "").toLowerCase();
  if (s.includes("plat")) return 3;
  if (s.includes("cook")) return 2;
  if (s.includes("fir") || s.includes("grill") || s.includes("heat") || s.includes("warm"))
    return 1;
  return 0;
}

const SESAME = [
  { cx: 160, cy: 108, r: 7, rot: -18 },
  { cx: 196, cy: 96, r: 7, rot: 8 },
  { cx: 232, cy: 100, r: 7, rot: 20 },
  { cx: 262, cy: 114, r: 6.5, rot: -10 },
  { cx: 180, cy: 126, r: 6.5, rot: 14 },
  { cx: 220, cy: 128, r: 7, rot: -22 },
  { cx: 248, cy: 134, r: 6, rot: 5 },
];

const STEAM = [
  { d: "M170,64 q8,-14 0,-28 q-8,-14 0,-28", delay: "0s" },
  { d: "M212,60 q8,-14 0,-28 q-8,-14 0,-28", delay: "-0.9s" },
  { d: "M254,64 q8,-14 0,-28 q-8,-14 0,-28", delay: "-1.7s" },
];

const FLAMES = [
  { d: "M120,298 q-10,-22 0,-36 q10,14 0,36", delay: "0s", fill: "#FF9F1C" },
  { d: "M210,300 q-12,-26 0,-44 q12,18 0,44", delay: "-0.6s", fill: "#FFB627" },
  { d: "M300,298 q-10,-22 0,-36 q10,14 0,36", delay: "-1.1s", fill: "#FF9F1C" },
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
      viewBox="0 0 420 340"
      className={cn("fg-animated w-full max-w-[420px]", className)}
      role="img"
      aria-label="A burger being grilled, assembling layer by layer"
    >
      <defs>
        <linearGradient id="fg-bun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD98A" />
          <stop offset="100%" stopColor="#EE9F3A" />
        </linearGradient>
        <linearGradient id="fg-patty" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A4A22" />
          <stop offset="100%" stopColor="#4E2C12" />
        </linearGradient>
        <radialGradient id="fg-emberglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ember glow under the grill */}
      <ellipse cx="210" cy="306" rx="150" ry="20" fill="url(#fg-emberglow)" className="fg-glow" />

      {/* flames */}
      <g className="fg-ambient">
        {FLAMES.map((f, i) => (
          <path
            key={i}
            d={f.d}
            fill={f.fill}
            opacity="0.85"
            className="fg-ember"
            style={{ animationDelay: f.delay }}
          />
        ))}
      </g>

      {/* grill grate */}
      <rect x="60" y="288" width="300" height="26" rx="13" fill="#1B1B1F" stroke="#3A3A42" strokeWidth="2" />
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1={84 + i * 25}
          y1="292"
          x2={84 + i * 25}
          y2="310"
          stroke="#4A4A55"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <rect x="92" y="314" width="14" height="18" rx="7" fill="#2A2A30" />
      <rect x="314" y="314" width="14" height="18" rx="7" fill="#2A2A30" />

      {/* frame 1: bottom bun */}
      {frame >= 1 && (
        <g className="fg-drop">
          <rect x="105" y="252" width="210" height="36" rx="18" fill="url(#fg-bun)" stroke="#C77B24" strokeWidth="2" />
          <rect x="125" y="260" width="170" height="8" rx="4" fill="#FFD98A" opacity="0.5" />
        </g>
      )}

      {/* frame 2: patty sizzles */}
      {frame >= 2 && (
        <g className="fg-drop" style={{ animationDelay: "0.12s" }}>
          <g className="fg-ambient">
            {STEAM.map((s, i) => (
              <path
                key={i}
                d={s.d}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.45"
                className="fg-steam"
                style={{ animationDelay: s.delay }}
              />
            ))}
          </g>
          <rect x="95" y="218" width="230" height="36" rx="18" fill="url(#fg-patty)" stroke="#3A2010" strokeWidth="2" />
          {[130, 175, 220, 265].map((x) => (
            <line
              key={x}
              x1={x}
              y1="224"
              x2={x + 14}
              y2="248"
              stroke="#8A5A2E"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.8"
            />
          ))}
        </g>
      )}

      {/* frame 3: cheese, tomato, lettuce, top bun */}
      {frame >= 3 && (
        <g>
          <g className="fg-drop" style={{ animationDelay: "0.2s" }}>
            <g transform="rotate(-4 210 200)">
              <rect x="100" y="192" width="220" height="22" rx="8" fill="#FFC93C" stroke="#D99A1F" strokeWidth="2" />
              <path d="M140,214 q2,12 -6,18 q-10,-4 -8,-18 z" fill="#FFC93C" />
              <path d="M225,214 q2,14 -6,20 q-10,-4 -8,-20 z" fill="#FFC93C" />
              <path d="M290,214 q2,10 -5,15 q-9,-3 -7,-15 z" fill="#FFC93C" />
            </g>
          </g>
          <g className="fg-drop" style={{ animationDelay: "0.32s" }}>
            <ellipse cx="210" cy="184" rx="98" ry="15" fill="#E5484D" stroke="#B23236" strokeWidth="2" />
            <ellipse cx="210" cy="182" rx="78" ry="9" fill="#F2736A" opacity="0.65" />
          </g>
          <g className="fg-drop" style={{ animationDelay: "0.44s" }}>
            <path
              d="M104,168 q21,-15 42,0 t42,0 t42,0 t42,0 t42,0"
              fill="none"
              stroke="#7BC96F"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <path
              d="M104,168 q21,-15 42,0 t42,0 t42,0 t42,0 t42,0"
              fill="none"
              stroke="#A5E09B"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
          <g className="fg-drop" style={{ animationDelay: "0.56s" }}>
            <path
              d="M104,166 C104,104 150,72 210,72 C270,72 316,104 316,166 Z"
              fill="url(#fg-bun)"
              stroke="#C77B24"
              strokeWidth="2"
            />
            {SESAME.map((s, i) => (
              <ellipse
                key={i}
                cx={s.cx}
                cy={s.cy}
                rx={s.r}
                ry={s.r * 0.62}
                fill="#FFE9B8"
                transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
              />
            ))}
            <g className="fg-ambient" fill="#D7FF3F">
              <path
                d="M84,120 l3.5,9 9,3.5 -9,3.5 -3.5,9 -3.5,-9 -9,-3.5 9,-3.5 z"
                className="fg-twinkle"
              />
              <path
                d="M338,132 l3,8 8,3 -8,3 -3,8 -3,-8 -8,-3 8,-3 z"
                className="fg-twinkle"
                style={{ animationDelay: "-0.8s" }}
                fill="#00F0FF"
              />
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}
