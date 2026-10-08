"use client";

/**
 * Etch Ad Studio — step 3, "Make it yours".
 *
 * The four customize pickers (concept, colors, typography, layout) live in a
 * single-open accordion so the step no longer overwhelms. Selection state is
 * owned by the caller and passed in as props — collapsing or expanding a
 * section never touches a pick.
 *
 * The freeform path (no concept selected — the user skipped the bank with
 * their own description) keeps working exactly as before: the concept section
 * shows the own-description state and offers a way back to the bank.
 */

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import {
  type Concept,
  type ConceptMedia,
  type LayoutPattern,
  type Palette,
  type TypographyPairing,
} from "@/lib/ads/concepts";
import { Accordion, nextAccordionOpen, type AccordionSection } from "./accordion";
import { ACCORDION_SECTION_IDS } from "./accordion-state";
import { artForConcept } from "./concept-art";
import { cn } from "../../lib/utils";

export interface AdsCustomizeProps {
  product: string;
  /** null on the freeform path (user skipped the concept bank). */
  concept: Concept | null;
  media: ConceptMedia;
  concepts: Concept[];
  palettes: Palette[];
  typographies: TypographyPairing[];
  layouts: LayoutPattern[];
  paletteName: string;
  typographyName: string;
  layoutName: string;
  onPaletteChange: (name: string) => void;
  onTypographyChange: (name: string) => void;
  onLayoutChange: (name: string) => void;
  onConceptChange: (id: string) => void;
  finalPrompt: string;
  /** Back to the concept bank (step 2). */
  onBack: () => void;
  /** Review & create (step 4). */
  onNext: () => void;
  /** Test hook: which section starts open. Defaults to the first section. */
  initialOpenId?: string | null;
}

export default function AdsCustomize(props: AdsCustomizeProps) {
  const {
    concept,
    media,
    concepts,
    palettes,
    typographies,
    layouts,
    paletteName,
    typographyName,
    layoutName,
    onPaletteChange,
    onTypographyChange,
    onLayoutChange,
    onConceptChange,
    finalPrompt,
    onBack,
    onNext,
    initialOpenId = ACCORDION_SECTION_IDS[0],
  } = props;

  const [openId, setOpenId] = useState<string | null>(initialOpenId);
  useEffect(() => {
    if (initialOpenId) setOpenId(initialOpenId);
  }, [initialOpenId]);
  const mediaConcepts = concepts.filter((c) => c.media === media);

  /* ------------------------- concept section ------------------------- */
  const conceptBody = concept ? (
    <div>
      <div
        className="flex items-center gap-3 rounded-[10px] border p-3"
        style={{ borderColor: "var(--pro-accent)", background: "var(--pro-bg-elev)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artForConcept(concept)}
          alt=""
          className="h-14 w-20 shrink-0 rounded-[8px] object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-semibold" style={{ color: "var(--pro-fg)" }}>
            {concept.name}
          </p>
          <p className="truncate text-[12.5px]" style={{ color: "var(--pro-muted)" }}>
            Selected — switch below if you like
          </p>
        </div>
        <Check className="ml-auto h-5 w-5 shrink-0" style={{ color: "var(--pro-accent)" }} />
      </div>
      <div className="mt-4 grid max-h-[380px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {mediaConcepts.map((c) => {
          const selected = c.id === concept.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onConceptChange(c.id);
                setOpenId("palette");
              }}
              aria-pressed={selected}
              className={cn("overflow-hidden rounded-[10px] border text-left")}
              style={{
                borderColor: selected ? "var(--pro-accent)" : "var(--pro-border-soft)",
                background: selected ? "var(--pro-bg-elev)" : "transparent",
              }}
            >
              <div className="relative aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artForConcept(c)} alt="" className="h-full w-full object-cover" loading="lazy" />
                {selected && (
                  <span
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ background: "var(--pro-accent)", color: "var(--pro-bg)" }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <p className="truncate px-3 py-2 text-[13px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                {c.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="rounded-[10px] border border-dashed p-5 text-center" style={{ borderColor: "var(--pro-border)" }}>
      <Sparkles className="mx-auto h-6 w-6" style={{ color: "var(--pro-accent)" }} />
      <p className="mt-2 text-[14.5px] font-semibold" style={{ color: "var(--pro-fg)" }}>
        Using your own description
      </p>
      <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--pro-muted)" }}>
        You skipped the concept bank — your product description goes straight
        into the ad prompt. Want a proven starting point instead?
      </p>
      <button
        type="button"
        onClick={onBack}
        className="pro-btn-secondary mt-4 inline-flex"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Browse the concept bank
      </button>
    </div>
  );

  /* ------------------------- palette section ------------------------- */
  const paletteBody = (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {palettes.map((p) => {
        const active = p.name === paletteName;
        return (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              onPaletteChange(p.name);
              setOpenId("typography");
            }}
            aria-pressed={active}
            className="rounded-[10px] border p-3 text-left"
            style={{
              borderColor: active ? "var(--pro-accent)" : "var(--pro-border-soft)",
              background: active ? "var(--pro-bg-elev)" : "transparent",
            }}
          >
            <span className="flex gap-1">
              {p.colors.map((col) => (
                <span
                  key={col}
                  className="h-6 w-6 rounded-full border"
                  style={{ background: col, borderColor: "var(--pro-border-soft)" }}
                  title={col}
                />
              ))}
            </span>
            <span className="mt-2 block text-[13.5px] font-semibold" style={{ color: "var(--pro-fg)" }}>
              {p.name}
            </span>
            <span className="block text-[12px]" style={{ color: "var(--pro-faint)" }}>
              {p.mood}
            </span>
          </button>
        );
      })}
    </div>
  );

  /* ------------------------ typography section ------------------------ */
  const typographyBody = (
    <div className="space-y-2">
      {typographies.map((t) => {
        const active = t.name === typographyName;
        return (
          <button
            key={t.name}
            type="button"
            onClick={() => {
              onTypographyChange(t.name);
              setOpenId("layout");
            }}
            aria-pressed={active}
            className="w-full rounded-[10px] border p-3.5 text-left"
            style={{
              borderColor: active ? "var(--pro-accent)" : "var(--pro-border-soft)",
              background: active ? "var(--pro-bg-elev)" : "transparent",
            }}
          >
            <span className="flex items-center justify-between">
              <span className="text-[14px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                {t.name}
              </span>
              {active && <Check className="h-4 w-4" style={{ color: "var(--pro-accent)" }} />}
            </span>
            <span className="mt-0.5 block text-[12.5px]" style={{ color: "var(--pro-muted)" }}>
              {t.mood}
            </span>
          </button>
        );
      })}
    </div>
  );

  /* -------------------------- layout section -------------------------- */
  const layoutBody = (
    <div className="space-y-2">
      {layouts.map((l) => {
        const active = l.name === layoutName;
        return (
          <button
            key={l.name}
            type="button"
            onClick={() => {
              onLayoutChange(l.name);
              setOpenId(null);
            }}
            aria-pressed={active}
            className="w-full rounded-[10px] border p-3.5 text-left"
            style={{
              borderColor: active ? "var(--pro-accent)" : "var(--pro-border-soft)",
              background: active ? "var(--pro-bg-elev)" : "transparent",
            }}
          >
            <span className="flex items-center justify-between">
              <span className="text-[14px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                {l.name}
              </span>
              {active && <Check className="h-4 w-4" style={{ color: "var(--pro-accent)" }} />}
            </span>
            <span className="mt-0.5 block text-[12.5px]" style={{ color: "var(--pro-muted)" }}>
              Eye path: {l.eye_path}
            </span>
          </button>
        );
      })}
    </div>
  );

  const sections: AccordionSection[] = [
    {
      id: "concept",
      index: "1",
      title: "Concept",
      summary: concept ? concept.name : "Your own description",
      body: conceptBody,
    },
    {
      id: "palette",
      index: "2",
      title: "Colors",
      summary: paletteName,
      body: paletteBody,
    },
    {
      id: "typography",
      index: "3",
      title: "Typography",
      summary: typographyName,
      body: typographyBody,
    },
    {
      id: "layout",
      index: "4",
      title: "Layout",
      summary: layoutName,
      body: layoutBody,
    },
  ];

  return (
    <section className="mt-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Accordion
            sections={sections}
            openId={openId}
            onToggle={(id) => setOpenId((cur) => nextAccordionOpen(cur, id))}
          />
          <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "var(--pro-faint)" }}>
            Your picks are saved as you go — collapsing a section never loses them.
          </p>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="pro-card p-7" style={{ boxShadow: "var(--pro-card-shadow)" }}>
            <h2 className="pro-display text-xl font-bold" style={{ color: "var(--pro-fg)" }}>
              Live prompt preview
            </h2>
            <p className="mt-1.5 text-[13px]" style={{ color: "var(--pro-muted)" }}>
              This exact prompt goes to the composer on the next step.
            </p>
            <p
              className="mt-4 max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-[10px] border p-4 text-[13.5px] leading-relaxed"
              style={{
                borderColor: "var(--pro-border-soft)",
                background: "var(--pro-bg-sunken)",
                color: "var(--pro-fg)",
              }}
            >
              {finalPrompt}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={onBack} className="pro-btn-secondary inline-flex">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </button>
              <button type="button" onClick={onNext} className="pro-btn-primary inline-flex">
                Review & create <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: keep the CTA reachable without scrolling back up. */}
      <div
        className="sticky bottom-0 z-20 -mx-4 mt-6 border-t px-4 py-3 lg:hidden"
        style={{
          borderColor: "var(--pro-border-soft)",
          background: "color-mix(in srgb, var(--pro-bg) 94%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <button type="button" onClick={onNext} className="pro-btn-primary w-full">
          Review & create <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
