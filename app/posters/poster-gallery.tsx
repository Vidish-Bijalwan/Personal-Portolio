/**
 * Poster Studio gallery — category filter + template grid.
 * Client component; thumbnails are static assets under /pro/poster-templates/.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  POSTER_CATEGORIES,
  POSTER_TEMPLATES,
  type PosterCategory,
} from "@/data/poster-templates/templates";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export default function PosterGallery() {
  const [category, setCategory] = useState<PosterCategory | "All">("All");
  const filtered = useMemo(
    () =>
      category === "All"
        ? POSTER_TEMPLATES
        : POSTER_TEMPLATES.filter((t) => t.category === category),
    [category],
  );

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

      <section aria-label="Poster templates" className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {filtered.map((t) => (
            <Link
              key={t.id}
              href={`/posters/${t.id}`}
              className="pro-card pro-lift group overflow-hidden"
              style={{ boxShadow: "var(--pro-card-shadow)" }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black/10">
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
              </div>
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
                <span
                  className="pro-body mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold"
                  style={{ color: "var(--pro-accent)" }}
                >
                  Customize <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
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
