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
 * The scene: layered flame tongues lick up through the grate from a bed of
 * pulsing coals — 4-stop gradients (pale-hot base → deep-red tip), a static
 * blurred bloom halo behind the crisp tongues, off-center side licks and
 * per-tongue lean so no two flames match, plus heat-shimmer wisps; every
 * burger layer carries its own gradient + highlight so it reads crafted,
 * not clip-art.
 *
 * prefers-reduced-motion: watch.css kills the loops (fg-animated *),
 * leaving a calm static grill + text status.
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

/** Flame tongues: center-x, tip height, half-width, lean (tip x-offset for
 * asymmetry), flicker timing.
 * The outer pair sits OUTSIDE the burger width (burger spans x 95-325) so
 * flames stay visible licking up beside the food in frames 2-3; the inner
 * tongues show through while the burger is still assembling (frames 0-1). */
const TONGUES = [
  { cx: 70, tip: 188, w: 22, lean: -9, delay: "0s", dur: "0.55s" },
  { cx: 138, tip: 206, w: 18, lean: 7, delay: "-0.2s", dur: "0.42s" },
  { cx: 182, tip: 178, w: 26, lean: -6, delay: "-0.35s", dur: "0.62s" },
  { cx: 226, tip: 198, w: 20, lean: 10, delay: "-0.1s", dur: "0.48s" },
  { cx: 270, tip: 212, w: 17, lean: -8, delay: "-0.45s", dur: "0.58s" },
  { cx: 350, tip: 184, w: 23, lean: 9, delay: "-0.28s", dur: "0.5s" },
];

/** Heat-shimmer wisps rising off the coal bed. */
const SHIMMER = [
  { d: "M150,296 q7,-16 -2,-32 q-8,-15 3,-30", delay: "0s" },
  { d: "M228,298 q-7,-16 3,-32 q8,-15 -3,-30", delay: "-1.2s" },
  { d: "M298,296 q7,-16 -2,-32 q-8,-15 3,-30", delay: "-2.1s" },
];

const COALS = [
  { cx: 96, cy: 326, rx: 30, ry: 13, delay: "0s" },
  { cx: 140, cy: 332, rx: 34, ry: 14, delay: "-0.4s" },
  { cx: 186, cy: 325, rx: 28, ry: 12, delay: "-0.8s" },
  { cx: 228, cy: 331, rx: 33, ry: 14, delay: "-0.2s" },
  { cx: 272, cy: 326, rx: 29, ry: 12, delay: "-0.6s" },
  { cx: 314, cy: 331, rx: 32, ry: 13, delay: "-1s" },
];

const EMBERS = [
  { cx: 120, cy: 296, r: 3.5, delay: "0s" },
  { cx: 190, cy: 300, r: 2.8, delay: "-1.1s" },
  { cx: 250, cy: 294, r: 3.2, delay: "-2s" },
  { cx: 305, cy: 298, r: 2.6, delay: "-0.6s" },
  { cx: 160, cy: 302, r: 2.4, delay: "-1.7s" },
];

function tonguePath(cx: number, tip: number, w: number, base: number, lean = 0): string {
  const tx = cx + lean;
  return (
    `M ${cx - w * 0.55},${base} ` +
    `C ${cx - w * 1.05},${base - 16} ${tx - w * 0.75},${tip + 44} ${tx},${tip} ` +
    `C ${tx + w * 0.55},${tip + 44} ${cx + w * 0.9},${base - 16} ${cx + w * 0.55},${base} Z`
  );
}

export default function BurgerGrill({
  frame,
  className,
}: {
  frame: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 420 360"
      className={cn("fg-animated w-full max-w-[420px]", className)}
      role="img"
      aria-label="A burger being grilled, assembling layer by layer"
    >
      <defs>
        <linearGradient id="fg-bun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE7AE" />
          <stop offset="55%" stopColor="#F7B04A" />
          <stop offset="100%" stopColor="#DE8A26" />
        </linearGradient>
        <linearGradient id="fg-patty" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8F5A28" />
          <stop offset="50%" stopColor="#6B3F1A" />
          <stop offset="100%" stopColor="#472712" />
        </linearGradient>
        <linearGradient id="fg-cheese" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD84D" />
          <stop offset="100%" stopColor="#F0A92E" />
        </linearGradient>
        <radialGradient id="fg-tomato" cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#F66166" />
          <stop offset="100%" stopColor="#C93237" />
        </radialGradient>
        <linearGradient id="fg-flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="38%" stopColor="#FFB627" />
          <stop offset="70%" stopColor="#FF7A1A" />
          <stop offset="100%" stopColor="#C22E08" />
        </linearGradient>
        <linearGradient id="fg-flame-mid" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFFDF4" />
          <stop offset="50%" stopColor="#FFE66D" />
          <stop offset="100%" stopColor="#FFC93C" />
        </linearGradient>
        <linearGradient id="fg-flame-core" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#FFF6C9" />
          <stop offset="100%" stopColor="#FFDD55" />
        </linearGradient>
        <radialGradient id="fg-fireglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#E8490F" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#E8490F" stopOpacity="0" />
        </radialGradient>
        <filter id="fg-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="fg-soft2" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <radialGradient id="fg-coal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8A3D" />
          <stop offset="60%" stopColor="#C44A12" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#7A2408" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fg-emberglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ambient heat glow under everything */}
      <ellipse cx="210" cy="322" rx="165" ry="26" fill="url(#fg-emberglow)" className="fg-glow" />

      {/* hot spots blooming behind the coals (static blur = cheap) */}
      <g filter="url(#fg-soft)" className="fg-glow" opacity="0.7">
        <ellipse cx="140" cy="328" rx="46" ry="14" fill="#FF5A12" />
        <ellipse cx="265" cy="329" rx="52" ry="15" fill="#FF5A12" />
      </g>

      {/* coal bed */}
      <g>
        {COALS.map((c, i) => (
          <g key={i}>
            <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="#241009" />
            <ellipse
              cx={c.cx}
              cy={c.cy - 2}
              rx={c.rx * 0.62}
              ry={c.ry * 0.6}
              fill="url(#fg-coal)"
              className="fg-sizzle"
              style={{ animationDelay: c.delay }}
            />
          </g>
        ))}
      </g>

      {/* back row of flames — darker, softer, offset for depth */}
      <g filter="url(#fg-soft2)" opacity="0.75">
        {TONGUES.map((t, i) => (
          <path
            key={`b${i}`}
            d={tonguePath(t.cx + 13, t.tip + 34, t.w * 0.8, 314, -t.lean * 0.5)}
            fill="url(#fg-flame-outer)"
          />
        ))}
      </g>

      {/* static bloom copy of the flame row — soft halo behind the crisp tongues */}
      <g filter="url(#fg-soft)" opacity="0.55" className="fg-glow">
        {TONGUES.map((t, i) => (
          <path
            key={i}
            d={tonguePath(t.cx, t.tip - 10, t.w * 1.08, 314, t.lean)}
            fill="#FF7A1A"
          />
        ))}
      </g>

      {/* layered flames licking up through the grate */}
      <g className="fg-ambient">
        {TONGUES.map((t, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          const lickCx = t.cx + dir * t.w * 0.78;
          return (
            <g
              key={i}
              className="fg-sizzle"
              style={{ animationDelay: t.delay, animationDuration: t.dur }}
            >
              <path
                d={tonguePath(t.cx, t.tip, t.w, 312, t.lean)}
                fill="url(#fg-flame-outer)"
                opacity="0.95"
              />
              <path
                d={tonguePath(t.cx, t.tip + 22, t.w * 0.62, 312, t.lean * 0.7)}
                fill="url(#fg-flame-mid)"
                opacity="0.95"
              />
              <path
                d={tonguePath(t.cx, t.tip + 46, t.w * 0.4, 312, t.lean * 0.4)}
                fill="url(#fg-flame-core)"
                opacity="0.9"
              />
              {/* off-center side lick breaks the teardrop symmetry */}
              <path
                d={tonguePath(lickCx, t.tip + 56, t.w * 0.38, 312, -t.lean * 0.6)}
                fill="url(#fg-flame-mid)"
                opacity="0.8"
              />
            </g>
          );
        })}
        {/* rising ember sparks */}
        {EMBERS.map((e, i) => (
          <circle
            key={`e${i}`}
            cx={e.cx}
            cy={e.cy}
            r={e.r}
            fill="#FFB627"
            className="fg-ember"
            style={{ animationDelay: e.delay }}
          />
        ))}
      </g>

      {/* heat shimmer rising off the coals */}
      <g opacity="0.28">
        {SHIMMER.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill="none"
            stroke="#FFD9A8"
            strokeWidth="6"
            strokeLinecap="round"
            className="fg-steam"
            style={{ animationDelay: s.delay }}
          />
        ))}
      </g>

      {/* grill grate */}
      <rect x="60" y="282" width="300" height="26" rx="13" fill="#141416" stroke="#33333A" strokeWidth="2" />
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1={84 + i * 25}
          y1="287"
          x2={84 + i * 25}
          y2="303"
          stroke="#4A4A55"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <rect x="92" y="308" width="14" height="20" rx="7" fill="#232329" />
      <rect x="314" y="308" width="14" height="20" rx="7" fill="#232329" />

      {/* frame 1: bottom bun */}
      {frame >= 1 && (
        <g className="fg-drop">
          <rect x="105" y="252" width="210" height="36" rx="18" fill="url(#fg-bun)" stroke="#B96A1B" strokeWidth="2" />
          <rect x="125" y="259" width="170" height="7" rx="3.5" fill="#FFF3D6" opacity="0.55" />
          <rect x="105" y="280" width="210" height="8" rx="4" fill="#B96A1B" opacity="0.35" />
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
          <rect x="115" y="224" width="190" height="6" rx="3" fill="#C98F4E" opacity="0.5" />
          {[130, 175, 220, 265].map((x) => (
            <line
              key={x}
              x1={x}
              y1="226"
              x2={x + 14}
              y2="248"
              stroke="#A06A35"
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
              <rect x="100" y="192" width="220" height="22" rx="8" fill="url(#fg-cheese)" stroke="#C98A1A" strokeWidth="2" />
              <rect x="112" y="195" width="196" height="5" rx="2.5" fill="#FFE9A8" opacity="0.7" />
              <path d="M140,214 q2,12 -6,18 q-10,-4 -8,-18 z" fill="#F0A92E" />
              <path d="M225,214 q2,14 -6,20 q-10,-4 -8,-20 z" fill="#F0A92E" />
              <path d="M290,214 q2,10 -5,15 q-9,-3 -7,-15 z" fill="#F0A92E" />
            </g>
          </g>
          <g className="fg-drop" style={{ animationDelay: "0.32s" }}>
            <ellipse cx="210" cy="184" rx="98" ry="15" fill="url(#fg-tomato)" stroke="#A82A2E" strokeWidth="2" />
            <ellipse cx="210" cy="181" rx="70" ry="6.5" fill="#FF9A9E" opacity="0.5" />
          </g>
          <g className="fg-drop" style={{ animationDelay: "0.44s" }}>
            <path
              d="M104,168 q21,-15 42,0 t42,0 t42,0 t42,0 t42,0"
              fill="none"
              stroke="#6FBE62"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <path
              d="M104,166 q21,-15 42,0 t42,0 t42,0 t42,0 t42,0"
              fill="none"
              stroke="#A8E6A1"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
          <g className="fg-drop" style={{ animationDelay: "0.56s" }}>
            <path
              d="M104,166 C104,104 150,72 210,72 C270,72 316,104 316,166 Z"
              fill="url(#fg-bun)"
              stroke="#B96A1B"
              strokeWidth="2"
            />
            <path
              d="M130,150 C140,110 170,88 210,84"
              fill="none"
              stroke="#FFF3D6"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.35"
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
