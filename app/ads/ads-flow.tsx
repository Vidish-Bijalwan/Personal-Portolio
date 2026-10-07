"use client";

/**
 * Etch Ad Studio — 4-step client flow.
 *
 * 1. Your product  — describe it + optional reference photo (kept in
 *    component state only; attached later in the composer).
 * 2. Pick a concept — filter the concept bank by category and media.
 * 3. Make it yours — palette / typography / layout pickers with a live
 *    preview of the final generation prompt.
 * 4. Create — final prompt, deep-link into /create, copy button.
 *
 * All prices come from the canonical price catalog; nothing is invented.
 */

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ImagePlus,
  Sparkles,
} from "lucide-react";
import {
  buildFinalPrompt,
  conceptService,
  getConcepts,
  getLayouts,
  getPalettes,
  getTypography,
  matchConcepts,
  type Concept,
  type ConceptMedia,
} from "@/src/lib/ads/concepts";
import { composerServiceById, priceOf } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";
import { cn } from "@/lib/utils";

/* Card art: reuse the shipped pro hero images as decorative style
   references, mapped by concept category family. */
const CATEGORY_ART: Record<string, string> = {
  beauty: "/pro/ad-skincare.jpg",
  fashion: "/pro/ad-apparel.jpg",
  studio: "/pro/hero-perfume.jpg",
  "technical-showcase": "/pro/hero-watch-exploded.jpg",
  tech: "/pro/hero-watch-exploded.jpg",
  premium: "/pro/hero-watch-exploded.jpg",
  unboxing: "/pro/hero-watch-exploded.jpg",
  lifestyle: "/pro/hero-watch-box.jpg",
  promotional: "/pro/hero-watch-box.jpg",
  seasonal: "/pro/hero-watch-box.jpg",
  festive: "/pro/hero-watch-box.jpg",
  "social-proof": "/pro/hero-watch-box.jpg",
  food: "/pro/ad-burger.jpg",
  dynamic: "/pro/ad-shoe.jpg",
  urban: "/pro/ad-shoe.jpg",
  stylized: "/pro/ad-apparel.jpg",
  transformation: "/pro/ad-skincare.jpg",
  video: "/pro/hero-headphones.jpg",
};

function artFor(category: string): string {
  return CATEGORY_ART[category] ?? "/pro/hero-headphones.jpg";
}

function prettyCategory(c: string): string {
  return c
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const STEPS = ["Your product", "Pick a concept", "Make it yours", "Create"];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Ad Studio steps">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-[12.5px] font-semibold",
              )}
              style={{
                background: current
                  ? "var(--pro-accent)"
                  : done
                    ? "var(--pro-fg)"
                    : "var(--pro-bg-sunken)",
                color: current || done ? "var(--pro-bg)" : "var(--pro-muted)",
              }}
              aria-current={current ? "step" : undefined}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </span>
            <span
              className="text-[13.5px] font-medium"
              style={{ color: current ? "var(--pro-fg)" : "var(--pro-muted)" }}
            >
              {label}
            </span>
            {n < STEPS.length && (
              <span className="mx-1 h-px w-6" style={{ background: "var(--pro-border)" }} aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function AdsFlow() {
  const concepts = useMemo(() => getConcepts(), []);
  const palettes = useMemo(() => getPalettes(), []);
  const typographies = useMemo(() => getTypography(), []);
  const layouts = useMemo(() => getLayouts(), []);

  const [step, setStep] = useState(1);
  const [product, setProduct] = useState("");
  const [refFile, setRefFile] = useState<File | null>(null);
  const [refPreview, setRefPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [media, setMedia] = useState<ConceptMedia>("image");
  const [conceptId, setConceptId] = useState<string | null>(null);
  const [paletteName, setPaletteName] = useState<string>(() => palettes[0]?.name ?? "");
  const [typographyName, setTypographyName] = useState<string>(() => typographies[0]?.name ?? "");
  const [layoutName, setLayoutName] = useState<string>(() => layouts[0]?.name ?? "");
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of concepts) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [concepts]);

  const filtered = useMemo(() => {
    const base = matchConcepts("", media, concepts);
    return category === "all" ? base : base.filter((c) => c.category === category);
  }, [concepts, media, category]);

  const concept: Concept | null = useMemo(
    () => concepts.find((c) => c.id === conceptId) ?? null,
    [concepts, conceptId]
  );

  const finalPrompt = useMemo(
    () => buildFinalPrompt(concept, product, paletteName, typographyName, layoutName),
    [concept, product, paletteName, typographyName, layoutName]
  );

  const service = concept ? conceptService(concept) : null;
  const serviceInfo = service ? composerServiceById(service) : null;
  const priceLine = service
    ? `${serviceInfo?.label ?? service} — ${formatINR(priceOf(service))}`
    : `5s clip — ${formatINR(priceOf("clip-5s"))}`;

  const deepLink = useMemo(() => {
    const promptParam = `prompt=${encodeURIComponent(finalPrompt.slice(0, 2000))}`;
    return service ? `/create?${promptParam}&service=${service}` : `/create?media=video&${promptParam}`;
  }, [finalPrompt, service]);

  function onFile(f: File | null) {
    if (refPreview) URL.revokeObjectURL(refPreview);
    if (!f) {
      setRefFile(null);
      setRefPreview(null);
      return;
    }
    setRefFile(f);
    setRefPreview(URL.createObjectURL(f));
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the prompt text is still selectable above */
    }
  }

  /* Honest empty state: the bank failed to load. */
  if (concepts.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="pro-eyebrow">Ad Studio</p>
        <h1 className="pro-display mt-3 text-4xl font-bold" style={{ color: "var(--pro-fg)" }}>
          Ads for your business
        </h1>
        <div className="pro-card mt-8 p-8 text-center" style={{ boxShadow: "var(--pro-card-shadow)" }}>
          <Sparkles className="mx-auto h-8 w-8" style={{ color: "var(--pro-muted)" }} />
          <p className="mt-4 text-[16px] font-semibold" style={{ color: "var(--pro-fg)" }}>
            The concept library is unavailable right now
          </p>
          <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--pro-muted)" }}>
            We couldn&apos;t load the ad concepts. Please try again later — or head
            straight to the composer and describe your ad in your own words.
          </p>
          <Link href="/create" className="pro-btn-primary mt-6 inline-flex">
            Go to the composer <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <p className="pro-eyebrow">Ad Studio</p>
      <h1
        className="pro-display mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl"
        style={{ color: "var(--pro-fg)" }}
      >
        Ads for your business
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed" style={{ color: "var(--pro-muted)" }}>
        Posters, banners and ad creatives for your store or startup. Pick a proven
        concept, style it your way, and generate it — pay per ad, no subscription.
      </p>

      <div className="mt-8">
        <Stepper step={step} />
      </div>

      {/* ------------------------------ Step 1 ------------------------------ */}
      {step === 1 && (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="pro-card p-7" style={{ boxShadow: "var(--pro-card-shadow)" }}>
            <h2 className="pro-display text-xl font-bold" style={{ color: "var(--pro-fg)" }}>
              Your product
            </h2>
            <p className="mt-1.5 text-[14px]" style={{ color: "var(--pro-muted)" }}>
              Describe what you sell in a line or two — it goes straight into the ad prompt.
            </p>
            <label
              htmlFor="ads-product"
              className="mt-5 block text-[13px] font-semibold"
              style={{ color: "var(--pro-fg)" }}
            >
              Product description
            </label>
            <input
              id="ads-product"
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. handmade ceramic chai kulhads, set of 6"
              className="mt-2 w-full rounded-[10px] border px-4 py-3 text-[15px]"
              style={{
                borderColor: "var(--pro-border)",
                background: "var(--pro-bg)",
                color: "var(--pro-fg)",
              }}
            />
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={product.trim().length === 0}
                className="pro-btn-primary inline-flex disabled:cursor-not-allowed disabled:opacity-40"
              >
                Pick a concept <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="pro-card p-7" style={{ boxShadow: "var(--pro-card-shadow)" }}>
            <h2 className="pro-display text-xl font-bold" style={{ color: "var(--pro-fg)" }}>
              Reference photo <span style={{ color: "var(--pro-faint)" }} className="text-[14px] font-medium">(optional)</span>
            </h2>
            <p className="mt-1.5 text-[14px]" style={{ color: "var(--pro-muted)" }}>
              A photo of your product helps keep the ad true to it. It stays in this
              tab — nothing is uploaded.
            </p>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            {refPreview ? (
              <div className="mt-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--pro-border-soft)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={refPreview} alt="Reference preview" className="h-full w-full object-cover" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <p className="truncate text-[13px]" style={{ color: "var(--pro-muted)" }}>
                    {refFile?.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => onFile(null)}
                    className="text-[13px] font-medium underline"
                    style={{ color: "var(--pro-accent)" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed px-6 py-10 transition-colors"
                style={{ borderColor: "var(--pro-border)", color: "var(--pro-muted)" }}
              >
                <ImagePlus className="h-7 w-7" />
                <span className="text-[14.5px] font-medium">Choose a photo of your product</span>
                <span className="text-[12.5px]">JPG or PNG, kept on this device</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* ------------------------------ Step 2 ------------------------------ */}
      {step === 2 && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex rounded-[10px] border p-1"
              style={{ borderColor: "var(--pro-border)" }}
              role="group"
              aria-label="Media type"
            >
              {(["image", "video"] as ConceptMedia[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMedia(m); setConceptId(null); }}
                  className={cn("rounded-[8px] px-4 py-2 text-[13.5px] font-semibold capitalize")}
                  style={{
                    background: media === m ? "var(--pro-fg)" : "transparent",
                    color: media === m ? "var(--pro-bg)" : "var(--pro-muted)",
                  }}
                >
                  {m === "image" ? "Poster" : "Video ad"}
                </button>
              ))}
            </div>
            <p className="text-[13px]" style={{ color: "var(--pro-faint)" }}>
              {filtered.length} concept{filtered.length === 1 ? "" : "s"}
              {media === "video" && " — video concepts are a small set for now; this is all of them"}
            </p>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Category filter">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium")}
              style={{
                borderColor: category === "all" ? "var(--pro-fg)" : "var(--pro-border)",
                background: category === "all" ? "var(--pro-fg)" : "transparent",
                color: category === "all" ? "var(--pro-bg)" : "var(--pro-muted)",
              }}
            >
              All
            </button>
            {categories.map(([c, n]) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className="shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium"
                style={{
                  borderColor: category === c ? "var(--pro-fg)" : "var(--pro-border)",
                  background: category === c ? "var(--pro-fg)" : "transparent",
                  color: category === c ? "var(--pro-bg)" : "var(--pro-muted)",
                }}
              >
                {prettyCategory(c)} · {n}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="pro-card mt-6 p-10 text-center">
              <p className="text-[15px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                No concepts in this combination yet
              </p>
              <p className="mt-2 text-[14px]" style={{ color: "var(--pro-muted)" }}>
                Try a different category or switch to posters.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const selected = c.id === conceptId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setConceptId(c.id)}
                    aria-pressed={selected}
                    className={cn("pro-card pro-lift overflow-hidden text-left")}
                    style={{
                      boxShadow: "var(--pro-card-shadow)",
                      outline: selected ? "2px solid var(--pro-accent)" : "none",
                      outlineOffset: 2,
                    }}
                  >
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={artFor(c.category)}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <span
                        className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
                        style={{ background: "var(--pro-bg)", color: "var(--pro-fg)" }}
                      >
                        {prettyCategory(c.category)}
                      </span>
                      {selected && (
                        <span
                          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"
                          style={{ background: "var(--pro-accent)", color: "var(--pro-bg)" }}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="pro-display text-[16px] font-bold" style={{ color: "var(--pro-fg)" }}>
                        {c.name}
                      </h3>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--pro-muted)" }}>
                        {c.description}
                      </p>
                      <p className="mt-2.5 text-[12.5px]" style={{ color: "var(--pro-faint)" }}>
                        Best for: {c.best_for}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <button type="button" onClick={() => setStep(1)} className="pro-btn-secondary inline-flex">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!concept}
              className="pro-btn-primary inline-flex disabled:cursor-not-allowed disabled:opacity-40"
            >
              Style it <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* ------------------------------ Step 3 ------------------------------ */}
      {step === 3 && concept && (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="pro-card p-7" style={{ boxShadow: "var(--pro-card-shadow)" }}>
              <h2 className="pro-display text-xl font-bold" style={{ color: "var(--pro-fg)" }}>
                Colors
              </h2>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {palettes.map((p) => {
                  const active = p.name === paletteName;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setPaletteName(p.name)}
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
            </div>

            <div className="pro-card p-7" style={{ boxShadow: "var(--pro-card-shadow)" }}>
              <h2 className="pro-display text-xl font-bold" style={{ color: "var(--pro-fg)" }}>
                Typography
              </h2>
              <div className="mt-4 space-y-2">
                {typographies.map((t) => {
                  const active = t.name === typographyName;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setTypographyName(t.name)}
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
            </div>

            <div className="pro-card p-7" style={{ boxShadow: "var(--pro-card-shadow)" }}>
              <h2 className="pro-display text-xl font-bold" style={{ color: "var(--pro-fg)" }}>
                Layout
              </h2>
              <div className="mt-4 space-y-2">
                {layouts.map((l) => {
                  const active = l.name === layoutName;
                  return (
                    <button
                      key={l.name}
                      type="button"
                      onClick={() => setLayoutName(l.name)}
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
            </div>
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
                <button type="button" onClick={() => setStep(2)} className="pro-btn-secondary inline-flex">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="pro-btn-primary inline-flex">
                  Review & create <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------ Step 4 ------------------------------ */}
      {step === 4 && concept && (
        <section className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="pro-card p-7 lg:col-span-3" style={{ boxShadow: "var(--pro-card-shadow)" }}>
            <h2 className="pro-display text-xl font-bold" style={{ color: "var(--pro-fg)" }}>
              Your ad prompt
            </h2>
            <div className="mt-4 flex flex-wrap gap-2 text-[12.5px]" style={{ color: "var(--pro-muted)" }}>
              <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--pro-border-soft)" }}>
                {concept.name}
              </span>
              {paletteName && (
                <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--pro-border-soft)" }}>
                  {paletteName}
                </span>
              )}
              {typographyName && (
                <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--pro-border-soft)" }}>
                  {typographyName}
                </span>
              )}
              {layoutName && (
                <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--pro-border-soft)" }}>
                  {layoutName}
                </span>
              )}
            </div>
            <p
              className="mt-4 max-h-[380px] overflow-y-auto whitespace-pre-wrap rounded-[10px] border p-4 text-[13.5px] leading-relaxed"
              style={{
                borderColor: "var(--pro-border-soft)",
                background: "var(--pro-bg-sunken)",
                color: "var(--pro-fg)",
              }}
            >
              {finalPrompt}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href={deepLink} className="pro-btn-primary inline-flex">
                Create this ad <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button type="button" onClick={copyPrompt} className="pro-btn-secondary inline-flex">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy prompt"}
              </button>
              <button type="button" onClick={() => setStep(3)} className="text-[13.5px] font-medium underline" style={{ color: "var(--pro-accent)" }}>
                Back to styling
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="pro-card p-7" style={{ boxShadow: "var(--pro-card-shadow)" }}>
              <h2 className="pro-display text-xl font-bold" style={{ color: "var(--pro-fg)" }}>
                What happens next
              </h2>
              <ol className="mt-4 space-y-3 text-[14px] leading-relaxed" style={{ color: "var(--pro-muted)" }}>
                <li>
                  <strong style={{ color: "var(--pro-fg)" }}>1.</strong> The composer opens with
                  your prompt pre-filled and the service pre-selected (
                  <strong style={{ color: "var(--pro-fg)" }}>{priceLine}</strong> — no subscription).
                </li>
                <li>
                  <strong style={{ color: "var(--pro-fg)" }}>2.</strong> Attach your reference
                  photo on the next screen — the composer picks it up there.
                </li>
                <li>
                  <strong style={{ color: "var(--pro-fg)" }}>3.</strong> Pay once over UPI and a
                  human reviews your brief before anything is created.
                </li>
              </ol>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
