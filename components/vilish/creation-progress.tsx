"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CreationProgress — the waiting-room showpiece.
 *
 * A calm, professional "creation in progress" visual: an aspect-ratio
 * card with a soft accent-tinted gradient and a slow sheen sweep,
 * centered motif and phase dots. Replaces the old cartoonish grill /
 * popcorn animations. Theme-aware via var(--pro-*) tokens.
 *
 * `phase` (0-3) lights that many of the four phase dots.
 */
export function phaseForStage(stage: string | null | undefined): number {
  const s = (stage ?? "").toLowerCase();
  if (/plat|polish|final|quality|review/.test(s)) return 3;
  if (/cook|creat|generat|render|cut|voice|caption/.test(s)) return 2;
  if (/fir|warm|heat|setup|prepar/.test(s)) return 1;
  return 0;
}

export default function CreationProgress({
  aspectRatio = "4 / 5",
  phase = 0,
  className,
}: {
  aspectRatio?: string;
  phase?: number;
  className?: string;
}) {
  const lit = Math.max(0, Math.min(3, phase));
  return (
    <div
      role="img"
      aria-label="Your creation is being prepared"
      className={cn(
        "relative w-full overflow-hidden rounded-[20px] border",
        className
      )}
      style={{
        aspectRatio,
        borderColor: "var(--pro-border-soft)",
        background:
          "radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--pro-accent) 14%, transparent), transparent 60%), var(--pro-bg-elev)",
        boxShadow: "var(--pro-card-shadow)",
      }}
    >
      {/* slow sheen sweep */}
      <div
        aria-hidden="true"
        className="fg-sheen absolute inset-0 motion-reduce:animate-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, color-mix(in srgb, var(--pro-fg) 9%, transparent) 50%, transparent 60%)",
          backgroundSize: "250% 100%",
        }}
      />
      {/* centered motif */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <span
          aria-hidden="true"
          className="fg-pulse-ring relative inline-flex h-16 w-16 items-center justify-center rounded-full motion-reduce:animate-none"
          style={{
            border: "1px solid color-mix(in srgb, var(--pro-accent) 55%, transparent)",
            background: "color-mix(in srgb, var(--pro-accent) 12%, transparent)",
          }}
        >
          <Sparkles
            className="h-6 w-6"
            style={{ color: "var(--pro-accent)" }}
          />
        </span>
        {/* phase dots */}
        <span className="flex items-center gap-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i <= lit ? 22 : 6,
                background:
                  i <= lit
                    ? "var(--pro-accent)"
                    : "color-mix(in srgb, var(--pro-fg) 22%, transparent)",
                opacity: i <= lit ? 1 : 0.55,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
