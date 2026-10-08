"use client";

import { useEffect, useState } from "react";
import { Dices, Info, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptInsight } from "@/src/lib/vilish/prompt-insight";

export interface RemixPreset {
  label: string;
  suffix: string;
}

export const REMIX_PRESETS: RemixPreset[] = [
  { label: "Cinematic", suffix: "cinematic film still, dramatic lighting" },
  { label: "Anime", suffix: "anime style illustration, vibrant" },
  { label: "Photoreal", suffix: "ultra photorealistic photograph" },
  { label: "Oil painting", suffix: "classical oil painting" },
  { label: "Neon noir", suffix: "neon noir, cyberpunk glow" },
  { label: "Watercolor", suffix: "soft watercolor painting" },
];

const TIPS = [
  "Free previews render one at a time — yours is in the queue.",
  "Lighting words like \u201crim light\u201d shape the result more than adjectives.",
  "Your full-res file unlocks after the preview — only if you love it.",
];

function Chip({ k, v, accent }: { k: string; v: string; accent: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] py-1.5 pl-3 pr-3.5 text-[12.5px]">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: accent }}>
        {k}
      </span>
      <span className="truncate text-white/80">{v}</span>
    </span>
  );
}

export default function WaitingPanel({
  insight,
  showRemix,
  busyPreset,
  remixError,
  onRemix,
}: {
  insight: PromptInsight | null;
  /** Remix only works for images — the free tier rejects video. */
  showRemix: boolean;
  busyPreset: string | null;
  remixError: string | null;
  onRemix: (suffix: string) => void;
}) {
  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 7000);
    return () => clearInterval(t);
  }, []);

  const subject = insight?.subject ?? "your idea";
  const styles = insight?.styles ?? [];
  const mood = insight?.mood ?? null;

  return (
    <aside
      aria-label="While you wait"
      className="w-full rounded-[18px] border border-white/[0.09] bg-[#101012] p-5 sm:p-6"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--pro-accent)]">
        While you wait
      </p>

      {/* 1 — what we understood from the prompt */}
      <section className="mt-4" aria-label="What we understood from your prompt">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
          <Sparkles className="h-3.5 w-3.5 text-[var(--pro-accent)]" />
          What we understood
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Chip k="Subject" v={subject} accent="var(--pro-accent)" />
          {styles.map((s) => (
            <Chip key={s} k="Style" v={s} accent="var(--pro-accent)" />
          ))}
          {mood && <Chip k="Mood" v={mood} accent="var(--pro-accent)" />}
        </div>
      </section>

      {/* 2 — remix it (images only) */}
      {showRemix && (
        <section className="mt-6" aria-label="Remix your prompt">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
            <Dices className="h-3.5 w-3.5 text-[var(--pro-accent)]" />
            Remix it — same idea, new style
          </p>
          <p className="mt-1 text-[12px] leading-5 text-white/40">
            Starts a fresh free preview with the style added to your prompt.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {REMIX_PRESETS.map((p) => {
              const busy = busyPreset === p.suffix;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onRemix(p.suffix)}
                  disabled={busyPreset !== null}
                  className={cn(
                    "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[13px] font-medium text-white/85 transition-colors",
                    busyPreset === null && "hover:border-[var(--pro-accent)]/50 hover:text-white",
                    busy && "cursor-wait opacity-70"
                  )}
                >
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />}
                  {p.label}
                </button>
              );
            })}
          </div>
          {remixError && (
            <p className="mt-2.5 text-[12.5px] leading-5 text-red-300/80" role="alert">
              {remixError}
            </p>
          )}
        </section>
      )}

      {/* 3 — honest tips */}
      <section className="mt-6" aria-label="Good to know">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
          <Info className="h-3.5 w-3.5 text-white/50" />
          Good to know
        </p>
        <p key={tipIdx} className="fg-caption mt-2 min-h-[40px] text-[12.5px] leading-5 text-white/55">
          {TIPS[tipIdx]}
        </p>
      </section>
    </aside>
  );
}
