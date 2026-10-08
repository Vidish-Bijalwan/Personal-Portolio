"use client";

import { cn } from "@/lib/utils";

/**
 * PopcornReel — the paid-video waiting-room showpiece, same delight bar as
 * the burger grill. Backend stages:
 *   frame 0 — "Rolling cameras": reels spin, spotlights sway
 *   frame 1 — "Rendering frames": popcorn pops into the bucket
 *   frame 2 — "Cutting the final": clapper board snaps
 *
 * prefers-reduced-motion: watch.css kills the loops and hides ambient
 * particles, leaving a calm static scene + text status.
 */
export function reelFrameForStage(stage: string | null): number {
  const s = (stage ?? "").toLowerCase();
  if (s.includes("cut") || s.includes("final")) return 2;
  if (s.includes("render") || s.includes("frame")) return 1;
  return 0;
}

function Reel({ cx, cy, r, duration, delay = "0s" }: { cx: number; cy: number; r: number; duration: string; delay?: string }) {
  const holes = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * r * 0.55, y: cy + Math.sin(rad) * r * 0.55 };
  });
  return (
    <g className="fg-reel" style={{ animationDuration: duration, animationDelay: delay }}>
      <circle cx={cx} cy={cy} r={r} fill="#141416" stroke="#2E2E33" strokeWidth="2.5" />
      {holes.map((h, i) => (
        <circle key={i} cx={h.x} cy={h.y} r={r * 0.18} fill="#08080A" stroke="#3B3B42" strokeWidth="1.5" />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.14} fill="#FFB627" />
    </g>
  );
}

const KERNELS = [
  { cx: 170, r: 6, delay: "0s", px: "-34px" },
  { cx: 195, r: 5, delay: "-0.45s", px: "-12px" },
  { cx: 215, r: 6.5, delay: "-0.9s", px: "10px" },
  { cx: 240, r: 5, delay: "-1.3s", px: "30px" },
  { cx: 182, r: 4.5, delay: "-0.2s", px: "-24px" },
  { cx: 228, r: 5.5, delay: "-1.6s", px: "22px" },
  { cx: 205, r: 4, delay: "-1.05s", px: "0px" },
];

export default function PopcornReel({
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
      aria-label="A film projector popping popcorn while your clip renders"
    >
      {/* spotlight beams (ambient) */}
      <g className="fg-ambient">
        <polygon points="30,0 110,0 80,230 0,230" fill="#FFE9A8" className="fg-beam" />
        <polygon points="310,0 390,0 420,230 340,230" fill="#FFF3D6" className="fg-beam" style={{ animationDelay: "-2.5s" }} />
      </g>

      {/* film strip hanging between the reels */}
      <g className="fg-ambient">
        <rect x="150" y="18" width="120" height="26" rx="4" fill="#141416" stroke="#2E2E33" strokeWidth="2" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={158 + i * 14} y="24" width="8" height="14" rx="2" fill="#2E2E33" />
        ))}
      </g>

      <Reel cx={88} cy={120} r={52} duration="6s" />
      <Reel cx={332} cy={104} r={38} duration="9s" delay="-3s" />

      {/* projector body */}
      <rect x="140" y="200" width="140" height="20" rx="8" fill="#141416" stroke="#2E2E33" strokeWidth="2" />
      <circle cx="210" cy="210" r="5" fill="#FFE9A8" className="fg-sizzle" />

      {/* popping kernels (ambient, frame 1+) */}
      {frame >= 1 && (
        <g className="fg-ambient" fill="#F7E3B0">
          {KERNELS.map((k, i) => (
            <g key={i} className="fg-pop" style={{ animationDelay: k.delay, ["--px" as string]: k.px }}>
              <circle cx={k.cx} cy={196} r={k.r} />
              <circle cx={k.cx - k.r * 0.3} cy={196 - k.r * 0.3} r={k.r * 0.35} fill="#FFF6DD" />
            </g>
          ))}
        </g>
      )}

      {/* popcorn bucket */}
      <g>
        <polygon points="150,208 270,208 250,300 170,300" fill="#1B1B1E" stroke="#2E2E33" strokeWidth="2" />
        <polygon points="172,208 192,208 186,300 170,300" fill="#E5484D" opacity="0.9" />
        <polygon points="214,208 234,208 232,300 218,300" fill="#E5484D" opacity="0.9" />
        <polygon points="150,208 270,208 268,224 152,224" fill="#E5484D" opacity="0.9" />
        <ellipse cx="210" cy="208" rx="60" ry="12" fill="#0D0D0F" stroke="#2E2E33" strokeWidth="2" />
        {/* popcorn mound */}
        <g fill="#F7E3B0">
          <circle cx="175" cy="200" r="11" />
          <circle cx="200" cy="194" r="13" />
          <circle cx="228" cy="196" r="11" />
          <circle cx="248" cy="202" r="9" />
          <circle cx="188" cy="188" r="8" fill="#FFF6DD" />
          <circle cx="222" cy="186" r="8" fill="#FFF6DD" />
        </g>
      </g>

      {/* frame 2: clapper board snaps */}
      {frame >= 2 && (
        <g className="fg-drop" transform="translate(296,168)">
          <rect x="0" y="0" width="88" height="54" rx="6" fill="#141416" stroke="#2E2E33" strokeWidth="2" />
          <g className="fg-clap">
            <rect x="-4" y="-20" width="96" height="22" rx="6" fill="#F5F5F3" />
            {Array.from({ length: 5 }, (_, i) => (
              <polygon
                key={i}
                points={`${6 + i * 18},-20 ${16 + i * 18},-20 ${10 + i * 18},2 ${0 + i * 18},2`}
                fill="#141416"
              />
            ))}
          </g>
          <circle cx="44" cy="30" r="9" fill="none" stroke="#FFB627" strokeWidth="2.5" className="fg-sizzle" />
          <polygon points="41,25 41,35 49,30" fill="#FFB627" />
        </g>
      )}

      {/* sparkles when the final cut lands */}
      {frame >= 2 && (
        <g className="fg-ambient">
          <path d="M120,240 l3,8 8,3 -8,3 -3,8 -3,-8 -8,-3 8,-3 z" fill="#FFE9A8" className="fg-twinkle" />
          <path d="M300,240 l2.5,7 7,2.5 -7,2.5 -2.5,7 -2.5,-7 -7,-2.5 7,-2.5 z" fill="#FFC93C" className="fg-twinkle" style={{ animationDelay: "-0.7s" }} />
        </g>
      )}
    </svg>
  );
}
