"use client";

import Image from "next/image";
import { usePrefersReducedMotion } from "@/src/lib/motion/theme";
import Marquee from "@/components/motion/Marquee";
import Reveal from "@/components/motion/Reveal";
import { examplePrice, isExampleItem } from "@/components/vilish/examples";
import manifest from "@/public/examples/manifest.json";

interface HeroAuroraProps {
  className?: string;
}

/**
 * Mobile-first hero backdrop: an animated aurora gradient. The desktop hero
 * keeps the ambient video loop; phones get this instead — the video never
 * quite worked on mobile GPUs and left the hero feeling empty.
 *
 * prefers-reduced-motion → static gradient, no animation.
 */
export default function HeroAurora({ className }: HeroAuroraProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={className} aria-hidden="true">
      <div className="absolute inset-0 bg-[#080808]" />
      <div
        className="absolute -left-1/4 top-[-10%] h-[55%] w-[80%] rounded-full bg-[#D7FF3F]/[0.13] blur-[90px]"
        style={reduced ? undefined : { animation: "v-aurora-a 14s ease-in-out infinite alternate" }}
      />
      <div
        className="absolute -right-1/4 top-[22%] h-[48%] w-[75%] rounded-full bg-[#00F0FF]/[0.12] blur-[90px]"
        style={reduced ? undefined : { animation: "v-aurora-b 18s ease-in-out infinite alternate" }}
      />
      <div
        className="absolute left-[15%] top-[52%] h-[40%] w-[70%] rounded-full bg-[#FF2D78]/[0.10] blur-[90px]"
        style={reduced ? undefined : { animation: "v-aurora-a 22s ease-in-out infinite alternate-reverse" }}
      />
      {/* legibility veils */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_30%,transparent_0%,rgba(8,8,8,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#080808]" />

      <style>{`
        @keyframes v-aurora-a {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to { transform: translate3d(9%, 14%, 0) scale(1.18); }
        }
        @keyframes v-aurora-b {
          from { transform: translate3d(0, 0, 0) scale(1.1); }
          to { transform: translate3d(-11%, -9%, 0) scale(0.94); }
        }
      `}</style>
    </div>
  );
}

/**
 * In-flow collage of real example creations with their prices — mobile hero
 * social proof. Decorative (aria-hidden); the real gallery lives on /examples.
 */
export function HeroCollage() {
  const items = (manifest as unknown[]).filter(isExampleItem).slice(0, 8);
  return (
    <Reveal delay={0.45} className="mt-10 w-full sm:hidden" aria-hidden="true">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
        Real creations, real prices
      </p>
      <Marquee speed={30} gap={10} pauseOnHover={false}>
        {items.map((it) => (
          <span
            key={it.src}
            className="relative block h-[112px] w-[100px] shrink-0 overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.03]"
          >
            <Image
              // Perf: 240px thumbnail variant — the full file is 6-8x heavier
              // and these render at 100px wide. Same image, fraction of bytes.
              src={it.src.replace(/\.webp$/, "-thumb.webp")}
              alt=""
              width={200}
              height={224}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute bottom-1 left-1 rounded-full bg-black/70 px-1.5 py-px text-[10px] font-semibold tabular-nums text-[#D7FF3F]">
              {examplePrice(it)}
            </span>
          </span>
        ))}
      </Marquee>
    </Reveal>
  );
}
