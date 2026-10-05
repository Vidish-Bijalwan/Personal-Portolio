import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Wallet } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Composer from "@/components/vilish/composer";
import FulfillmentNotices from "@/components/vilish/fulfillment-notices";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const TRUST = [
  { icon: Wallet, label: "UPI payments" },
  { icon: ShieldCheck, label: "Human QC on every order" },
  { icon: BadgeCheck, label: "Exact price first" },
];

const NEXT = [
  {
    num: "01",
    title: "Pay",
    text: "One UPI payment for the exact quoted price. No account needed until checkout.",
  },
  {
    num: "02",
    title: "Human review + creation",
    text: "A human reviews your brief and creates your piece — checked before anything ships.",
  },
  {
    num: "03",
    title: "QC + delivery",
    text: "Your creation passes quality control, then lands in your hands to download.",
  },
];

const TEASER = [
  { label: "Single image", price: "₹29" },
  { label: "Product photo", price: "₹49" },
  { label: "4-pack", price: "₹79" },
  { label: "5s clip", price: "₹99" },
];

/** Standard eyebrow, matching the homepage section headers. */
function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
      {children}
    </p>
  );
}

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ media?: string }>;
}) {
  const sp = await searchParams;
  const initialMedia = sp?.media === "video" ? "video" : "image";
  const isVideo = initialMedia === "video";

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />

      <main>
        {/* ── composer hero ─────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(215,255,63,0.07)_0%,transparent_60%)]"
          />
          <div className="relative mx-auto w-full max-w-3xl px-4 pb-8 pt-16 text-center sm:pt-24">
            <Stagger className="flex flex-col items-center">
              <StaggerItem>
                <Eyebrow>Create — pay per creation</Eyebrow>
              </StaggerItem>
              <StaggerItem>
                <h1 className="font-display mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-[56px]">
                  {isVideo ? (
                    <>
                      Describe the clip.{" "}
                      <span className="v-iris-text">We&apos;ll make it move.</span>
                    </>
                  ) : (
                    <>
                      Describe it.{" "}
                      <span className="v-iris-text">We&apos;ll make it real.</span>
                    </>
                  )}
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-white/[0.62] sm:text-[16px]">
                  {isVideo
                    ? "Describe the 5-second clip. ₹99, made for you in minutes — exact price shown before you pay."
                    : "Type what you want in plain words — you see the exact price before anything is charged. One UPI payment, human quality review, your finished piece to download."}
                </p>
              </StaggerItem>
              <StaggerItem>
                <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
                  {TRUST.map((t) => (
                    <li
                      key={t.label}
                      className="flex items-center gap-2 text-[13px] text-white/60"
                    >
                      <t.icon className="h-4 w-4 text-white/75" strokeWidth={1.8} />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            </Stagger>

            {/* The composer, presented as the hero element */}
            <Reveal delay={0.3} className="mt-10 text-left">
              <div className="relative">
                <span
                  aria-hidden
                  className="v-iris-bg pointer-events-none absolute -inset-px rounded-[22px] opacity-35 blur-xl"
                />
                <div className="v-iris-border relative rounded-[20px] border bg-[#0C0C0E] p-4 sm:p-7">
                  <Composer variant="page" initialMedia={initialMedia} />
                </div>
              </div>
            </Reveal>

            <div className="mt-5 text-left">
              <FulfillmentNotices />
            </div>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-xl text-center text-[13px] leading-6 text-white/40">
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
          className="border-t border-white/[0.08] bg-[#0B0B0C]"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <Reveal>
              <Eyebrow>After you create</Eyebrow>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Three steps. <span className="text-[#00F0FF]">Zero guesswork.</span>
              </h2>
            </Reveal>
            <Stagger className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
              {NEXT.map((n) => (
                <StaggerItem key={n.num} className="relative">
                  <span
                    aria-hidden
                    className="font-display inline-block text-[44px] font-semibold leading-none tracking-[-0.02em] text-white/[0.92] tabular-nums sm:text-[52px]"
                  >
                    {n.num}
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold text-[#F5F5F3]">
                    {n.title}
                  </h3>
                  <p className="mt-1.5 max-w-[28ch] text-[14px] leading-6 text-white/55">
                    {n.text}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── pricing hint ──────────────────────────────────── */}
        <section
          aria-label="Pricing hint"
          className="border-t border-white/[0.08]"
        >
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-16">
            <Reveal>
              <Eyebrow>Per-creation pricing</Eyebrow>
            </Reveal>
            <Stagger className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {TEASER.map((t) => (
                <StaggerItem key={t.label}>
                  <p className="text-[13px] text-white/55">
                    {t.label}{" "}
                    <span className="font-semibold tabular-nums text-[#F5F5F3]">
                      {t.price}
                    </span>
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1} className="mt-7">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
              >
                See full pricing <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── examples link ─────────────────────────────────── */}
        <section aria-label="Examples" className="border-t border-white/[0.08]">
          <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-16">
            <Reveal>
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] sm:text-[30px]">
                Not sure what to make?{" "}
                <span className="v-iris-text">See what&apos;s possible.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-white/[0.55]">
                Every example shows the prompt and the exact price it sold for.
              </p>
              <Link
                href="/examples"
                className="mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
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
