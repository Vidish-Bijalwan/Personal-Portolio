/**
 * /create — reskinned into the Etch pro design language (2026-10-07).
 *
 * Pro-theme tokens only: .pro-surface, .pro-display, .pro-card, .pro-body,
 * and colors via var(--pro-*) so both dark and light themes work.
 * Copy speaks to small business owners buying ads — professional, no slang.
 */
import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Wallet } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Composer from "@/components/vilish/composer";
import UnifiedIntake from "@/components/muse/unified-intake";
import FulfillmentNotices from "@/components/vilish/fulfillment-notices";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { PRICE_CATALOG, composerServiceById, priceOf, type ComposerServiceId } from "@/src/lib/pricing/catalog";
import { VIDEO_DURATION_MAX_S, videoClipPricePaise } from "@/src/lib/pricing/engine";
import { templateById } from "@/src/lib/trends/templates";
import { formatINR } from "@/src/lib/vilish/types";

export const metadata = {
  title: "Make an ad for your product — pay per creation | Etch",
  description: `Describe your ad in plain words, see the exact price before you pay. Images from ${formatINR(priceOf("single-image"))}, video clips from ${formatINR(priceOf("clip-5s"))} for 5s up to ${formatINR(videoClipPricePaise(VIDEO_DURATION_MAX_S))} for a full minute. One UPI payment, no subscription.`,
  alternates: { canonical: "/create" },
};

const TRUST = [
  { icon: Wallet, label: "UPI payments" },
  { icon: ShieldCheck, label: "Human QC on every order" },
  { icon: BadgeCheck, label: "Exact price first" },
];

const NEXT = [
  {
    num: "01",
    title: "Generate",
    text: "Describe your ad and hit Generate — creation starts immediately. No payment upfront, no account needed.",
  },
  {
    num: "02",
    title: "Preview first",
    text: "See your watermarked preview as soon as it's ready. A human reviews every paid generation before delivery.",
  },
  {
    num: "03",
    title: "Unlock the clean file",
    text: "Love it? One payment for the exact quoted price unlocks the clean HD file to download and post.",
  },
];

/* Rendered from the canonical price catalog — never hardcode prices here. */
const TEASER = PRICE_CATALOG.filter((p) =>
  ["single-image", "product-photo", "pack-4", "clip-5s", "video-studio"].includes(p.id),
).map((p) => ({ label: p.id === "video-studio" ? "Video Studio job" : p.label, price: formatINR(p.paise) }));

/** Standard eyebrow in the pro design language. */
function Eyebrow({ children }: { children: string }) {
  return <p className="pro-eyebrow">{children}</p>;
}

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ media?: string; service?: string; template?: string; prompt?: string }>;
}) {
  const sp = await searchParams;
  // Trend-template deep link, e.g. /create?service=pack-4&template=diwali-night.
  // The template's service is authoritative; video templates force video mode.
  const template = templateById(sp?.template);
  const templateIsVideo = template?.service === "clip-5s";
  const initialMedia = templateIsVideo ? "video" : sp?.media === "video" ? "video" : "image";
  const isVideo = initialMedia === "video";
  // Deep link from pricing cards, e.g. /create?service=product-photo.
  // Invalid values fall back to single-image; ignored in video mode.
  const initialService: ComposerServiceId | undefined = !isVideo
    ? ((template && template.service !== "clip-5s" ? template.service : undefined) ??
      composerServiceById(sp?.service)?.id ?? undefined)
    : undefined;

  return (
    <div className="pro-surface pro-body min-h-screen">
      <VilishNav />

      <main>
        {/* ── composer hero ─────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="relative mx-auto w-full max-w-5xl px-4 pb-8 pt-16 sm:pt-24">
            <Stagger className="flex flex-col items-center">
              <StaggerItem>
                <Eyebrow>Ads for your business — pay per creation</Eyebrow>
              </StaggerItem>
              <StaggerItem>
                <h1
                  className="pro-display mt-5 text-[36px] font-bold leading-[1.06] sm:text-[56px]"
                  style={{ color: "var(--pro-fg)" }}
                >
                  {isVideo ? (
                    <>
                      Describe the clip.{" "}
                      <span style={{ color: "var(--pro-accent)" }}>
                        We&apos;ll make it move.
                      </span>
                    </>
                  ) : (
                    <>
                      Describe your product.{" "}
                      <span style={{ color: "var(--pro-accent)" }}>
                        We&apos;ll design the ad.
                      </span>
                    </>
                  )}
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p
                  className="pro-body mx-auto mt-5 max-w-xl text-[15px] leading-7 sm:text-[16px]"
                  style={{ color: "var(--pro-muted)" }}
                >
                  {isVideo
                    ? `Describe your clip. ${formatINR(priceOf("clip-5s"))} for 5 seconds, up to ${formatINR(videoClipPricePaise(VIDEO_DURATION_MAX_S))} for a full minute — exact price shown before you pay, fulfilled by an operator with human QC.`
                    : "Type what you want in plain words — you see the exact price before anything is charged. One UPI payment, human quality review, your finished ad to download."}
                </p>
              </StaggerItem>
              <StaggerItem>
                <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
                  {TRUST.map((t) => (
                    <li
                      key={t.label}
                      className="pro-body flex items-center gap-2 text-[13px] font-medium"
                      style={{ color: "var(--pro-muted)" }}
                    >
                      <t.icon
                        className="h-4 w-4"
                        strokeWidth={1.8}
                        style={{ color: "var(--pro-accent)" }}
                        aria-hidden
                      />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            </Stagger>

            {/* The unified intake — the default way to start a creation.
                Drop assets, add references, describe in plain words. */}
            <Reveal delay={0.25} className="mt-10 text-left">
              <UnifiedIntake />
            </Reveal>

            {/* The classic composer, kept as the explicit manual override */}
            <Reveal delay={0.1} className="mt-8 text-left">
              <p
                className="pro-body mb-3 text-[13px]"
                style={{ color: "var(--pro-faint)" }}
              >
                Prefer the classic step-by-step flow? The Image / Video clip /
                Edit video options are right here.
              </p>
              <div
                className="pro-card p-4 sm:p-7"
                style={{ boxShadow: "var(--pro-card-shadow)" }}
              >
                <Composer variant="page" initialMedia={initialMedia} initialService={initialService} initialTemplate={template ?? undefined} initialPrompt={typeof sp?.prompt === "string" ? sp.prompt.slice(0, 2000) : undefined} />
              </div>
            </Reveal>

            <div className="mt-5 text-left">
              <FulfillmentNotices />
            </div>
            <Reveal delay={0.1}>
              <p
                className="pro-body mx-auto mt-6 max-w-xl text-center text-[13px] leading-6"
                style={{ color: "var(--pro-faint)" }}
              >
                Every order is quoted at a fixed, human-reviewed price — the
                number you see is the number you pay. If a render fails,
                you&apos;re refunded automatically — no support ticket, no wait.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── what happens next ─────────────────────────────── */}
        <section
          aria-label="What happens next"
          className="border-t"
          style={{ borderColor: "var(--pro-border-soft)" }}
        >
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <Reveal>
              <Eyebrow>After you create</Eyebrow>
              <h2
                className="pro-display mt-3 text-[26px] font-bold sm:text-[34px]"
                style={{ color: "var(--pro-fg)" }}
              >
                Three steps.{" "}
                <span style={{ color: "var(--pro-accent)" }}>Zero guesswork.</span>
              </h2>
            </Reveal>
            <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              {NEXT.map((n) => (
                <StaggerItem key={n.num} className="h-full">
                  <div
                    className="pro-card pro-lift h-full p-7"
                    style={{ boxShadow: "var(--pro-card-shadow)" }}
                  >
                    <p
                      className="pro-display text-[13px] font-bold tabular-nums"
                      style={{ color: "var(--pro-accent)", letterSpacing: "0.18em" }}
                    >
                      {n.num}
                    </p>
                    <h3
                      className="pro-display mt-4 text-[20px] font-bold leading-snug"
                      style={{ color: "var(--pro-fg)" }}
                    >
                      {n.title}
                    </h3>
                    <p
                      className="pro-body mt-3 max-w-[28ch] text-[14.5px] leading-[1.7]"
                      style={{ color: "var(--pro-muted)" }}
                    >
                      {n.text}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── pricing hint ──────────────────────────────────── */}
        <section
          aria-label="Pricing hint"
          className="border-t"
          style={{ borderColor: "var(--pro-border-soft)" }}
        >
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-16">
            <Reveal>
              <Eyebrow>Per-creation pricing</Eyebrow>
            </Reveal>
            <Stagger className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {TEASER.map((t) => (
                <StaggerItem key={t.label}>
                  <p
                    className="pro-body text-[13px]"
                    style={{ color: "var(--pro-muted)" }}
                  >
                    {t.label}{" "}
                    <span
                      className="pro-body font-semibold tabular-nums"
                      style={{ color: "var(--pro-fg)" }}
                    >
                      {t.price}
                    </span>
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1} className="mt-7">
              <Link
                href="/pricing"
                className="pro-body inline-flex items-center gap-1.5 text-[14px] font-medium underline underline-offset-4"
                style={{ color: "var(--pro-fg)", textDecorationColor: "var(--pro-border)" }}
              >
                See full pricing <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── examples link ─────────────────────────────────── */}
        <section
          aria-label="Examples"
          className="border-t"
          style={{ borderColor: "var(--pro-border-soft)" }}
        >
          <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-16">
            <Reveal>
              <h2
                className="pro-display text-[24px] font-bold sm:text-[30px]"
                style={{ color: "var(--pro-fg)" }}
              >
                Need ideas for your next ad?{" "}
                <span style={{ color: "var(--pro-accent)" }}>
                  See what&apos;s possible.
                </span>
              </h2>
              <p
                className="pro-body mx-auto mt-3 max-w-md text-[14px] leading-6"
                style={{ color: "var(--pro-muted)" }}
              >
                Every example shows the prompt and the exact price it sold for.
              </p>
              <Link
                href="/examples"
                className="pro-body mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium underline underline-offset-4"
                style={{ color: "var(--pro-fg)", textDecorationColor: "var(--pro-border)" }}
              >
                Browse examples <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <VilishFooter />
    </div>
  );
}
