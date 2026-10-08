"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../../src/lib/motion/theme";
import { resolvePetalPalette, type PetalPalette } from "./petal-palette";

/* ── Gold petal drift — hero background ──────────────────────────
   Lightweight canvas animation: slow-drifting gold petals with gentle
   rotation and sway, depth-layered (soft blurred background petals +
   crisp foreground ones), wrapping seamlessly for an infinite loop.

   Theme-aware: next-themes toggles `light` / `dark` on <html> (pro theme:
   dark tokens on :root, light overrides under .light). Petals use a
   deeper antique gold on light backgrounds and a luminous brighter gold
   on dark — watched live via MutationObserver so a theme toggle
   re-tints without remounting.

   prefers-reduced-motion → a handful of static petals, no animation.
   Perf: sprites are pre-rendered offscreen (blur baked in), DPR-aware,
   rAF only while the hero is on-screen and the tab is visible.
   ──────────────────────────────────────────────────────────────── */

export type { PetalPalette } from "./petal-palette";
export { resolvePetalPalette } from "./petal-palette";

interface Petal {
  x: number;
  y: number;
  size: number; // long axis, px
  angle: number;
  spin: number; // rad/s
  vy: number; // px/s downward drift
  swayAmp: number;
  swayFreq: number;
  phase: number;
  depth: number; // 0 = far (soft/dim) … 1 = near (crisp)
  alpha: number;
  tint: number; // 0..1 — per-petal color variation
}

const STATIC_COUNT = 10;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function makePetal(w: number, h: number, palette: PetalPalette): Petal {
  const depth = Math.random();
  const size = rand(10, 30) * (0.6 + depth * 0.8);
  return {
    x: rand(-40, w + 40),
    y: rand(-60, h + 60),
    size,
    angle: rand(0, Math.PI * 2),
    spin: rand(-0.35, 0.35),
    vy: rand(7, 22) * (0.5 + depth * 0.9),
    swayAmp: rand(14, 46),
    swayFreq: rand(0.12, 0.34),
    phase: rand(0, Math.PI * 2),
    depth,
    alpha: rand(palette.alphaMin, palette.alphaMax) * (0.45 + depth * 0.55),
    tint: Math.random(),
  };
}

/** Petal path, pointing up, centered at origin, long axis = s. */
function petalPath(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.beginPath();
  ctx.moveTo(0, -s / 2);
  ctx.bezierCurveTo(s * 0.44, -s * 0.3, s * 0.36, s * 0.3, 0, s / 2);
  ctx.bezierCurveTo(-s * 0.36, s * 0.3, -s * 0.44, -s * 0.3, 0, -s / 2);
  ctx.closePath();
}

/**
 * Pre-render a petal sprite. Far petals get a baked-in soft blur (drawn
 * tiny then upscaled) so the frame loop never pays per-petal ctx.filter.
 */
function makeSprite(
  size: number,
  soft: boolean,
  stops: [string, string, string],
  highlight: string,
): HTMLCanvasElement {
  const pad = size * 0.5;
  const full = Math.ceil(size + pad * 2);
  const c = document.createElement("canvas");
  c.width = full;
  c.height = full;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  const render = (target: CanvasRenderingContext2D, s: number, scale: number) => {
    target.save();
    target.translate(full / 2 / scale, full / 2 / scale);
    petalPath(target, s);
    const g = target.createLinearGradient(0, -s / 2, 0, s / 2);
    g.addColorStop(0, stops[0]);
    g.addColorStop(0.55, stops[1]);
    g.addColorStop(1, stops[2]);
    target.fillStyle = g;
    target.fill();
    // Soft top highlight — catches the "light".
    const hg = target.createRadialGradient(
      -s * 0.08, -s * 0.22, 0,
      -s * 0.08, -s * 0.22, s * 0.34,
    );
    hg.addColorStop(0, highlight);
    hg.addColorStop(1, "rgba(255,255,255,0)");
    target.fillStyle = hg;
    petalPath(target, s);
    target.fill();
    target.restore();
  };

  if (soft) {
    // Render at 1/3 resolution into a scratch, then upscale = cheap blur.
    const tiny = document.createElement("canvas");
    const ts = Math.max(2, Math.round(full / 3));
    tiny.width = ts;
    tiny.height = ts;
    const tctx = tiny.getContext("2d");
    if (tctx) {
      tctx.scale(ts / full, ts / full);
      render(tctx, size, ts / full);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(tiny, 0, 0, full, full);
      return c;
    }
  }
  render(ctx, size, 1);
  return c;
}

export default function PetalDrift({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let petals: Petal[] = [];
    let palette = resolvePetalPalette(
      document.documentElement.classList.contains("light"),
    );
    let sprites = new Map<string, HTMLCanvasElement>();
    let raf = 0;
    let last = 0;
    let visible = true; // tab visible
    let onScreen = true; // hero in viewport
    let disposed = false;

    const spriteKey = (p: Petal) =>
      `${Math.round(p.size)}-${p.depth < 0.45 ? "soft" : "crisp"}-${
        p.tint < 0.5 ? "a" : "b"
      }`;

    const getSprite = (p: Petal): HTMLCanvasElement => {
      const key = spriteKey(p);
      let s = sprites.get(key);
      if (!s) {
        const soft = p.depth < 0.45;
        // Slight per-petal tint variation: shift the mid stop.
        const stops: [string, string, string] =
          p.tint < 0.5
            ? palette.stops
            : [palette.stops[0], palette.stops[2], palette.stops[1]];
        s = makeSprite(p.size, soft, stops, palette.highlight);
        sprites.set(key, s);
      }
      return s;
    };

    const drawPetal = (p: Petal, t: number) => {
      const sprite = getSprite(p);
      const half = sprite.width / 2;
      const sx = p.x + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(sx, p.y);
      ctx.rotate(p.angle);
      ctx.drawImage(sprite, -half, -half, sprite.width, sprite.height);
      ctx.restore();
    };

    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = 1.7; // fixed "moment" so sway/rotation look intentional
      for (const p of petals) drawPetal({ ...p, angle: p.phase }, t);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nw = Math.max(1, Math.round(rect.width));
      const nh = Math.max(1, Math.round(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      if (nw === w && nh === h) return;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const count = reduced
        ? STATIC_COUNT
        : Math.max(36, Math.min(64, Math.floor(w / 24)));
      petals = Array.from({ length: count }, () => makePetal(w, h, palette));
      if (reduced) drawStatic();
    };

    const frame = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!visible || !onScreen) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const t = now / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        // Seamless wrap — petal re-enters from the top.
        const m = 60;
        if (p.y - m > h) {
          p.y = -m;
          p.x = rand(-40, w + 40);
        }
        drawPetal(p, t);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVis);

    // Live theme adaptation — next-themes flips .light on <html>.
    const mo = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains("light");
      const next = resolvePetalPalette(isLight);
      if (next.stops[1] !== palette.stops[1]) {
        palette = next;
        sprites = new Map();
        for (const p of petals) {
          p.alpha =
            rand(palette.alphaMin, palette.alphaMax) *
            (0.45 + p.depth * 0.55);
        }
        if (reduced) drawStatic();
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    resize();
    if (!reduced) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
