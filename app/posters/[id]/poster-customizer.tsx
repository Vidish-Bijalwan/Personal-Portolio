/**
 * Poster template customizer — edit fields, pick a palette, describe changes,
 * then generate via the standard /create composer (deep link with the composed
 * prompt). Zero new payment logic: the /create flow owns generation + unlock.
 */
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PosterTemplate } from "@/data/poster-templates/templates";
import {
  composePosterPrompt,
  composePromptPreview,
  paletteFor,
} from "@/lib/posters/compose";
import { priceOf, type ComposerServiceId } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";

const SERVICE: ComposerServiceId = "single-image";

export default function PosterCustomizer({ template }: { template: PosterTemplate }) {
  const router = useRouter();
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.fields.map((f) => [f.key, f.default])),
  );
  const [paletteId, setPaletteId] = useState(template.palettes[0].id);
  const [freeText, setFreeText] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const palette = paletteFor(template, paletteId);
  const prompt = useMemo(
    () => composePosterPrompt(template, { fields, paletteId, freeText }),
    [template, fields, paletteId, freeText],
  );
  const preview = useMemo(
    () => composePromptPreview(template, { fields, paletteId, freeText }),
    [template, fields, paletteId, freeText],
  );

  // Store the raw keystroke value (length-clamped only). Sanitization happens
  // at prompt-compose time in composePosterPrompt — sanitizing here would
  // trim trailing spaces on every keystroke and make multi-word input impossible.
  const setField = (key: string, maxLength: number) => (value: string) => {
    setFields((prev) => ({ ...prev, [key]: value.slice(0, maxLength) }));
  };

  const handleGenerate = () => {
    const url =
      `/create?service=${SERVICE}&prompt=` + encodeURIComponent(prompt);
    router.push(url);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:pt-14">
      <Link
        href="/posters"
        className="pro-body inline-flex items-center gap-1.5 text-[13.5px] font-medium"
        style={{ color: "var(--pro-muted)" }}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} /> All templates
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* template preview */}
        <div>
          <div
            className="pro-card overflow-hidden"
            style={{ boxShadow: "var(--pro-card-shadow)" }}
          >
            <div className="relative aspect-[4/5] bg-black/10">
              <Image
                src={template.thumbnail}
                alt={`${template.name} poster template`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <span
                className="absolute left-4 top-4 rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ background: "var(--pro-bg)", color: "var(--pro-fg)" }}
              >
                {template.category}
              </span>
            </div>
          </div>
          <p
            className="pro-body mt-4 text-[13px] leading-6"
            style={{ color: "var(--pro-faint)" }}
          >
            This is the template&apos;s sample. Your words and colors replace
            the sample text when you generate.
          </p>
        </div>

        {/* customizer */}
        <div>
          <p className="pro-eyebrow">Customize template</p>
          <h1
            className="pro-display mt-3 text-[30px] font-bold leading-tight sm:text-[38px]"
            style={{ color: "var(--pro-fg)" }}
          >
            {template.name}
          </h1>
          <p
            className="pro-body mt-2 text-[14.5px]"
            style={{ color: "var(--pro-muted)" }}
          >
            {template.tagline}
          </p>

          {/* text fields */}
          <div className="mt-7 space-y-4">
            {template.fields.map((f) => (
              <div key={f.key}>
                <label
                  htmlFor={`poster-field-${f.key}`}
                  className="pro-body mb-1.5 block text-[13px] font-semibold"
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
                  id={`poster-field-${f.key}`}
                  type="text"
                  value={fields[f.key] ?? ""}
                  maxLength={f.maxLength}
                  onChange={(e) => setField(f.key, f.maxLength)(e.target.value)}
                  placeholder={f.default}
                  className="pro-body w-full rounded-[10px] border px-4 py-3 text-[14.5px] outline-none transition"
                  style={{
                    borderColor: "var(--pro-border-soft)",
                    background: "var(--pro-bg)",
                    color: "var(--pro-fg)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* palette picker */}
          <div className="mt-7">
            <p
              className="pro-body mb-2.5 text-[13px] font-semibold"
              style={{ color: "var(--pro-fg)" }}
            >
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
                    className={cn(
                      "flex items-center gap-2.5 rounded-full border py-2 pl-2.5 pr-4 transition",
                    )}
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
          </div>

          {/* free-text changes */}
          <div className="mt-7">
            <label
              htmlFor="poster-freetext"
              className="pro-body mb-1.5 block text-[13px] font-semibold"
              style={{ color: "var(--pro-fg)" }}
            >
              Describe what to change{" "}
              <span className="font-normal" style={{ color: "var(--pro-faint)" }}>
                (optional)
              </span>
            </label>
            <textarea
              id="poster-freetext"
              value={freeText}
              maxLength={500}
              rows={3}
              onChange={(e) => setFreeText(e.target.value.slice(0, 500))}
              placeholder='e.g. "make it more festive" or "add a fireworks background"'
              className="pro-body w-full resize-none rounded-[10px] border px-4 py-3 text-[14.5px] outline-none transition"
              style={{
                borderColor: "var(--pro-border-soft)",
                background: "var(--pro-bg)",
                color: "var(--pro-fg)",
              }}
            />
          </div>

          {/* prompt preview */}
          <button
            type="button"
            onClick={() => setShowPrompt((v) => !v)}
            className="pro-body mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium underline underline-offset-4"
            style={{ color: "var(--pro-muted)" }}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            {showPrompt ? "Hide" : "Preview"} the generation prompt
          </button>
          {showPrompt && (
            <pre
              className="pro-body mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-[10px] border p-4 text-[12px] leading-5"
              style={{
                borderColor: "var(--pro-border-soft)",
                background: "var(--pro-bg)",
                color: "var(--pro-muted)",
              }}
            >
              {prompt}
            </pre>
          )}
          {!showPrompt && (
            <p
              className="pro-body mt-3 text-[12.5px] leading-5"
              style={{ color: "var(--pro-faint)" }}
            >
              {preview}
            </p>
          )}

          {/* generate */}
          <button
            type="button"
            onClick={handleGenerate}
            className="pro-btn-primary mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[15.5px] font-semibold sm:w-auto"
          >
            Generate poster — {formatINR(priceOf(SERVICE))}
            <ArrowRight className="h-4.5 w-4.5" strokeWidth={2} />
          </button>
          <p
            className="pro-body mt-3 text-[12.5px] leading-5"
            style={{ color: "var(--pro-faint)" }}
          >
            Generates like any other image: you see a watermarked preview
            first, and pay {formatINR(priceOf(SERVICE))} only to unlock the
            clean file.
          </p>
        </div>
      </div>
    </main>
  );
}
