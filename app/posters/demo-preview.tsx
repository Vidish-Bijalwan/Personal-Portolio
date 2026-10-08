/**
 * Demo preview panel for Poster Studio.
 *
 * Empty state when no template is selected; otherwise a large preview area
 * pairing the template's artwork at large size with a live "Sample output"
 * mock. The palette picker and field editors below re-render the mock
 * instantly — everything is client-side, no API calls, no new dependencies.
 *
 * The parent keys this component by template id so fields/palette reset
 * cleanly whenever a different template is selected.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PosterTemplate } from "@/data/poster-templates/templates";
import { paletteFor } from "@/lib/posters/compose";
import SampleOutput from "./sample-output";

interface DemoPreviewProps {
  template: PosterTemplate | null;
  onClose: () => void;
}

const labelClass = "pro-body mb-1.5 block text-[13px] font-semibold";

export default function DemoPreview({ template, onClose }: DemoPreviewProps) {
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries((template?.fields ?? []).map((f) => [f.key, f.default])),
  );
  const [paletteId, setPaletteId] = useState(
    () => template?.palettes[0]?.id ?? "",
  );

  if (!template) {
    return (
      <section
        aria-label="Demo preview"
        className="mx-auto w-full max-w-6xl px-4 pb-14"
      >
        <div
          className="pro-card flex flex-col items-center px-6 py-12 text-center sm:py-16"
          style={{ boxShadow: "var(--pro-card-shadow)" }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background:
                "color-mix(in srgb, var(--pro-accent) 12%, transparent)",
              color: "var(--pro-accent)",
            }}
          >
            <Eye className="h-5 w-5" strokeWidth={2} />
          </span>
          <h2
            className="pro-display mt-4 text-[22px] font-bold sm:text-[26px]"
            style={{ color: "var(--pro-fg)" }}
          >
            See a live sample before you commit
          </h2>
          <p
            className="pro-body mt-2 max-w-md text-[14px] leading-6"
            style={{ color: "var(--pro-muted)" }}
          >
            Pick any template below to open its demo preview — large artwork
            plus a styled sample of the output that updates live as you try
            your own words and colors.
          </p>
        </div>
      </section>
    );
  }

  const palette = paletteFor(template, paletteId);
  const setField = (key: string, maxLength: number) => (value: string) => {
    setFields((prev) => ({ ...prev, [key]: value.slice(0, maxLength) }));
  };

  return (
    <section
      id="poster-demo-preview"
      aria-label={`Demo preview: ${template.name}`}
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 pb-14"
    >
      <div
        className="pro-card overflow-hidden p-5 sm:p-8"
        style={{ boxShadow: "var(--pro-card-shadow)" }}
      >
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="pro-eyebrow">Demo preview</p>
            <h2
              className="pro-display mt-2 text-[24px] font-bold leading-tight sm:text-[30px]"
              style={{ color: "var(--pro-fg)" }}
            >
              {template.name}
            </h2>
            <p
              className="pro-body mt-1 text-[14px]"
              style={{ color: "var(--pro-muted)" }}
            >
              {template.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href={`/posters/${template.id}`}
              className="pro-btn-primary inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] px-5 py-2.5 text-[14px] font-semibold"
            >
              Customize <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close demo preview"
              className="flex h-11 w-11 items-center justify-center rounded-full border transition"
              style={{
                borderColor: "var(--pro-border-soft)",
                color: "var(--pro-muted)",
              }}
            >
              <X className="h-4.5 w-4.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* large previews: artwork + sample output */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
          <figure className="min-w-0">
            <figcaption
              className="pro-body mb-2.5 text-[12.5px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--pro-faint)" }}
            >
              Template artwork
            </figcaption>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-black/10">
              <Image
                src={template.thumbnail}
                alt={`${template.name} template artwork`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </figure>
          <figure className="min-w-0">
            <figcaption
              className="pro-body mb-2.5 text-[12.5px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--pro-faint)" }}
            >
              Sample output{" "}
              <span className="font-normal normal-case tracking-normal">
                — live
              </span>
            </figcaption>
            <SampleOutput
              template={template}
              fields={fields}
              paletteId={paletteId}
            />
          </figure>
        </div>
        <p
          className="pro-body mt-4 text-[12.5px] leading-5"
          style={{ color: "var(--pro-faint)" }}
        >
          Styled mock built from your words and palette — the generated poster
          follows this layout, with AI-rendered artwork in place of the flat
          background.
        </p>

        {/* live controls */}
        <div
          className="mt-6 grid gap-7 border-t pt-7 lg:grid-cols-[1fr_1.25fr]"
          style={{ borderColor: "var(--pro-border-soft)" }}
        >
          <div>
            <p className={labelClass} style={{ color: "var(--pro-fg)" }}>
              Color palette
            </p>
            <div className="flex flex-wrap gap-2.5">
              {template.palettes.map((p) => {
                const selected = p.id === paletteId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaletteId(p.id)}
                    aria-pressed={selected}
                    className="flex items-center gap-2.5 rounded-full border py-2 pl-2.5 pr-4 transition"
                    style={{
                      borderColor: selected
                        ? "var(--pro-accent)"
                        : "var(--pro-border-soft)",
                      background: selected
                        ? "color-mix(in srgb, var(--pro-accent) 10%, transparent)"
                        : "transparent",
                    }}
                  >
                    <span className="flex -space-x-1.5">
                      {p.swatches.map((s) => (
                        <span
                          key={s}
                          className="h-6 w-6 rounded-full border border-black/10"
                          style={{ background: s }}
                        />
                      ))}
                    </span>
                    <span
                      className="pro-body text-[13px] font-medium"
                      style={{ color: "var(--pro-fg)" }}
                    >
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <p
              className="pro-body mt-3 text-[12.5px] leading-5"
              style={{ color: "var(--pro-faint)" }}
            >
              {palette.name} — {palette.prompt}
            </p>
          </div>
          <div>
            <p className={labelClass} style={{ color: "var(--pro-fg)" }}>
              Your words{" "}
              <span
                className="font-normal"
                style={{ color: "var(--pro-faint)" }}
              >
                — the sample updates as you type
              </span>
            </p>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {template.fields.map((f) => (
                <div key={f.key}>
                  <label
                    htmlFor={`demo-field-${template.id}-${f.key}`}
                    className={cn(labelClass, "text-[12.5px]")}
                    style={{ color: "var(--pro-fg)" }}
                  >
                    {f.label}
                    <span
                      className="ml-2 font-normal tabular-nums"
                      style={{ color: "var(--pro-faint)" }}
                    >
                      {(fields[f.key] ?? "").length}/{f.maxLength}
                    </span>
                  </label>
                  <input
                    id={`demo-field-${template.id}-${f.key}`}
                    type="text"
                    value={fields[f.key] ?? ""}
                    maxLength={f.maxLength}
                    onChange={(e) =>
                      setField(f.key, f.maxLength)(e.target.value)
                    }
                    placeholder={f.default}
                    className="pro-body w-full rounded-[10px] border px-3.5 py-2.5 text-[14px] outline-none transition"
                    style={{
                      borderColor: "var(--pro-border-soft)",
                      background: "var(--pro-bg)",
                      color: "var(--pro-fg)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
