"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptInsight } from "@/src/lib/vilish/prompt-insight";
import {
  examplePrice,
  exampleThumbSrc,
  isExampleItem,
  type ExampleItem,
} from "@/components/vilish/examples";

function DetailChip({ k, v, accent }: { k: string; v: string; accent: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] py-1.5 pl-3 pr-3.5 text-[12.5px]">
      <span
        className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{ color: accent }}
      >
        {k}
      </span>
      <span className="truncate text-white/80">{v}</span>
    </span>
  );
}

const ASPECT_LABELS: Record<string, string> = {
  "1:1": "Square",
  "4:5": "Portrait",
  "9:16": "Portrait",
  "16:9": "Landscape",
};

/** "6 Oct, 10:42 PM" in the user's timezone — honest metadata, never a promise. */
function formatFinished(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * ResultPanel — the done-state side panel. Creation details: the prompt,
 * what we understood, aspect ratio, and when the preview landed.
 * Every value comes from the status API — nothing is invented.
 */
export function ResultPanel({
  prompt,
  insight,
  aspectRatio,
  finishedAt,
}: {
  prompt: string | null | undefined;
  insight: PromptInsight | null;
  aspectRatio: string | null | undefined;
  finishedAt: string | null | undefined;
}) {
  const subject = insight?.subject ?? "your idea";
  const styles = insight?.styles ?? [];
  const mood = insight?.mood ?? null;
  const aspect = (aspectRatio ?? "").trim();

  return (
    <aside
      aria-label="Creation details"
      className="w-full rounded-[18px] border border-white/[0.09] bg-[#101012] p-5 sm:p-6"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--pro-accent)]">
        Creation details
      </p>

      <section className="mt-4" aria-label="Your prompt">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
          <FileText className="h-3.5 w-3.5 text-white/50" />
          Your prompt
        </p>
        <p className="mt-2 text-[13px] leading-6 text-white/65">
          {prompt?.trim() ? `\u201C${prompt.trim()}\u201D` : "—"}
        </p>
      </section>

      <section className="mt-5" aria-label="What we understood">
        <div className="flex flex-wrap gap-2">
          <DetailChip k="Subject" v={subject} accent="var(--pro-accent)" />
          {styles.map((s) => (
            <DetailChip key={s} k="Style" v={s} accent="var(--pro-accent)" />
          ))}
          {mood && <DetailChip k="Mood" v={mood} accent="var(--pro-accent)" />}
        </div>
      </section>

      <dl className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-4 text-[13px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/40">Format</dt>
          <dd className="font-medium text-white/80">
            {aspect ? `${aspect}${ASPECT_LABELS[aspect] ? ` · ${ASPECT_LABELS[aspect]}` : ""}` : "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/40">Preview ready</dt>
          <dd className="font-medium tabular-nums text-white/80">
            {finishedAt ? formatFinished(finishedAt) : "—"}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

/**
 * MoreFromGrill — keeps the user browsing after a finished preview instead
 * of dropping them at a dead end. Pulls 4 real examples from the public
 * manifest (rotated daily), each card linking to /examples with its real
 * catalog-derived price. Never renders when the manifest can't load.
 */
export function MoreFromGrill() {
  const [items, setItems] = useState<ExampleItem[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/examples/manifest.json", { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : []))
      .then((m: unknown) => {
        if (!alive || !Array.isArray(m) || m.length === 0) return;
        const day = Math.floor(Date.now() / 86400000);
        const picked: ExampleItem[] = [];
        for (let i = 0; i < 4 && picked.length < m.length; i++) {
          const cand = m[(day + i) % m.length];
          if (isExampleItem(cand)) picked.push(cand);
        }
        if (alive) setItems(picked);
      })
      .catch(() => {
        /* manifest missing — render nothing rather than a broken strip */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section aria-label="Keep creating" className="mt-12 w-full">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[19px] font-semibold tracking-[-0.01em] text-[#F5F5F3] sm:text-[22px]">
          Keep creating
        </h2>
        <Link
          href="/examples"
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[var(--pro-accent)] hover:opacity-90"
        >
          All examples
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.src}
            href="/examples"
            className={cn(
              "group overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#101012]",
              "transition-colors hover:border-white/25"
            )}
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-black">
              {/* Video entries carry an .mp4 src, which never decodes in an
                  image element — the poster frame is the render-safe thumb. */}
              <img
                src={exampleThumbSrc(item)}
                alt={item.alt ?? `${item.prompt.slice(0, 80)} — AI-generated example`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
            <div className="px-3.5 py-3">
              <p className="truncate text-[13px] font-medium text-white/85">
                {item.prompt.length > 48 ? `${item.prompt.slice(0, 48)}…` : item.prompt}
              </p>
              <p className="mt-1 text-[12px] text-white/45">
                from <span className="font-semibold text-[var(--pro-accent)]">{examplePrice(item)}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
