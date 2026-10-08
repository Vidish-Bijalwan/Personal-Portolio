/**
 * Poster Studio gallery — category filter + template grid.
 * Client component; thumbnails are static assets under /pro/poster-templates/.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  POSTER_CATEGORIES,
  POSTER_TEMPLATES,
  templateById,
  type PosterCategory,
} from "@/data/poster-templates/templates";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import DemoPreview from "./demo-preview";

export default function PosterGallery() {
  const [category, setCategory] = useState<PosterCategory | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      category === "All"
        ? POSTER_TEMPLATES
        : POSTER_TEMPLATES.filter((t) => t.category === category),
    [category],
  );
  const selected = useMemo(
    () => (selectedId ? (templateById(selectedId) ?? null) : null),
    [selectedId],
  );

  const selectTemplate = (id: string) => {
    setSelectedId(id);
    // Scroll to the preview panel after it renders.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById("poster-demo-preview");
        if (!el) return;
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        el.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      });
    });
  };

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-16 text-center sm:pt-24">
          <Stagger className="flex flex-col items-center">
            <StaggerItem>
              <p className="pro-eyebrow">Poster Studio</p>
            </StaggerItem>
            <StaggerItem>
              <h1
                className="pro-display mt-5 text-[36px] font-bold leading-[1.06] sm:text-[56px]"
                style={{ color: "var(--pro-fg)" }}
              >
                Posters that look designed.{" "}
                <span style={{ color: "var(--pro-accent)" }}>
                  Customized in minutes.
                </span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p
                className="pro-body mx-auto mt-5 max-w-xl text-[15px] leading-7 sm:text-[16px]"
                style={{ color: "var(--pro-muted)" }}
              >
                Pick a template, rewrite the words, choose your colors — then
                generate your poster. You see a preview first and pay only for
                the clean file.
              </p>
            </StaggerItem>
          </Stagger>

          {/* category filter */}
          <Reveal delay={0.2} className="mt-8">
            <div
              className="flex flex-wrap items-center justify-center gap-2"
              role="tablist"
              aria-label="Filter by category"
            >
              {(["All", ...POSTER_CATEGORIES] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={category === c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[13px] font-medium transition",
                  )}
                  style={{
                    borderColor:
                      category === c
                        ? "var(--pro-accent)"
                        : "var(--pro-border-soft)",
                    background:
                      category === c
                        ? "var(--pro-accent)"
                        : "transparent",
                    color:
                      category === c
                        ? "var(--pro-btn-ink)"
                        : "var(--pro-muted)",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* demo preview — empty state until a template is selected */}
      <DemoPreview
        key={selected?.id ?? "empty"}
        template={selected}
        onClose={() => setSelectedId(null)}
      />

      <section aria-label="Poster templates" className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {filtered.map((t) => {
            const active = t.id === selectedId;
            return (
              <div
                key={t.id}
                className="pro-card pro-lift group overflow-hidden"
                style={{
                  boxShadow: "var(--pro-card-shadow)",
                  outline: active ? "2px solid var(--pro-accent)" : undefined,
                  outlineOffset: active ? 2 : undefined,
                }}
              >
                <button
                  type="button"
                  onClick={() => selectTemplate(t.id)}
                  aria-pressed={active}
                  aria-label={`Preview a sample of the ${t.name} template`}
                  className="relative block aspect-[4/5] w-full overflow-hidden bg-black/10 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ outlineColor: "var(--pro-accent)" }}
                >
                  <Image
                    src={t.thumbnail}
                    alt={`${t.name} poster template`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
                    style={{ background: "var(--pro-bg)", color: "var(--pro-fg)" }}
                  >
                    {t.category}
                  </span>
                  <span className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold"
                      style={{ background: "var(--pro-bg)", color: "var(--pro-fg)" }}
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                      Preview sample
                    </span>
                  </span>
                </button>
                <div className="p-4">
                  <h3
                    className="pro-display text-[15px] font-bold"
                    style={{ color: "var(--pro-fg)" }}
                  >
                    {t.name}
                  </h3>
                  <p
                    className="pro-body mt-1 line-clamp-2 text-[12.5px] leading-5"
                    style={{ color: "var(--pro-muted)" }}
                  >
                    {t.tagline}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => selectTemplate(t.id)}
                      aria-pressed={active}
                      className="pro-body text-[13px] font-semibold underline underline-offset-4"
                      style={{ color: "var(--pro-muted)" }}
                    >
                      {active ? "Previewing" : "Preview"}
                    </button>
                    <Link
                      href={`/posters/${t.id}`}
                      className="pro-body inline-flex items-center gap-1 text-[13px] font-semibold"
                      style={{ color: "var(--pro-accent)" }}
                    >
                      Customize <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p
            className="pro-body py-16 text-center text-[14px]"
            style={{ color: "var(--pro-muted)" }}
          >
            No templates in this category yet.
          </p>
        )}
      </section>
    </main>
  );
}
