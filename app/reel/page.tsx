import Link from "next/link";
import { ArrowRight, PencilLine, Tag, Wallet } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import MagneticButton from "@/components/motion/MagneticButton";
import { priceOf, type PriceEntry } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";

export const metadata = {
  title: "Etch — pay only when you create",
  description:
    "Pay-per-use AI images & video — no subscription. Describe your idea, see the exact price, pay once over UPI and download.",
  alternates: { canonical: "/reel" },
};

/* Price anchors — derived from the canonical catalog, never hardcoded. */
const ANCHORS: Array<{
  id: PriceEntry["id"];
  name: string;
  blurb: string;
  href: string;
}> = [
  {
    id: "single-image",
    name: "Single image",
    blurb: "One AI image from your description.",
    href: "/create?service=single-image",
  },
  {
    id: "product-photo",
    name: "Product photo",
    blurb: "Studio-grade shot for your listing or shop.",
    href: "/create?service=product-photo",
  },
  {
    id: "clip-5s",
    name: "5-second clip",
    blurb: "A short AI video from your description.",
    href: "/create?media=video",
  },
];

const STEPS = [
  {
    icon: PencilLine,
    title: "Describe",
    text: "Type what you want — an image, a product shot, or a short video.",
  },
  {
    icon: Tag,
    title: "See exact price",
    text: "The price is shown up front, before anything is charged.",
  },
  {
    icon: Wallet,
    title: "Pay once over UPI",
    text: "Pay the exact amount, get your creation to download. Nothing renews.",
  },
];

function StartCta({ label = "Start creating" }: { label?: string }) {
  return (
    <Link href="/create" aria-label="Start creating">
      <MagneticButton>
        <span className="pro-cta inline-flex items-center gap-2 rounded-[12px] px-7 py-3.5 text-[15px] font-semibold text-[var(--pro-btn-ink)]">
          {label} <ArrowRight className="h-4 w-4" />
        </span>
      </MagneticButton>
    </Link>
  );
}

export default function ReelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            From the reel
          </p>
          <h1 className="font-display mt-3 text-[32px] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[48px]">
            Stop paying ₹2,000/month for{" "}
            <span className="pro-accent-text">AI tools</span> you barely use.
          </h1>
          <p className="mt-2 text-[12px] text-white/40">
            ₹2,000/month is a typical range — not a specific provider&apos;s
            price.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58]">
            Etch is a studio that makes AI images and videos for you — describe
            your idea, see the exact price, pay once over UPI. No monthly plan,
            no credits, no commitment.
          </p>
          <div className="mt-8 flex justify-center">
            <StartCta />
          </div>
          <p className="mt-4 text-[13px] text-white/50">
            No subscription · Exact price before you pay · Failed renders
            refunded automatically
          </p>
        </Reveal>

        <div className="mt-14">
          <Reveal>
            <h2 className="font-display text-center text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              Real prices, <span className="pro-accent-text">per creation</span>
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
            {ANCHORS.map((a) => (
              <StaggerItem key={a.id} className="h-full">
                <Link
                  href={a.href}
                  className="flex h-full flex-col rounded-[16px] border border-white/[0.08] bg-[#121214] p-5 transition-colors hover:border-white/25"
                >
                  <p className="text-[13px] font-medium text-white/60">
                    {a.name}
                  </p>
                  <p className="mt-2 text-[32px] font-semibold tabular-nums tracking-[-0.01em]">
                    {formatINR(priceOf(a.id))}
                  </p>
                  <p className="mt-2 flex-1 text-[13px] leading-6 text-white/[0.55]">
                    {a.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/75">
                    Create <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="mt-14">
          <Reveal>
            <h2 className="font-display text-center text-[22px] font-semibold tracking-[-0.01em] sm:text-[26px]">
              How it works
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="h-full rounded-[16px] border border-white/[0.08] bg-[#121214] p-5">
                  <span className="font-display pro-accent-text text-[28px] font-bold leading-none">
                    {i + 1}
                  </span>
                  <s.icon className="mt-3 h-5 w-5 text-white/70" strokeWidth={1.8} />
                  <h3 className="mt-2 text-[15px] font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-white/[0.55]">
                    {s.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Reveal className="mt-14">
          <div className="flex flex-col items-center gap-4 rounded-[20px] border border-white/[0.08] bg-[#101012] px-6 py-10 text-center">
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] sm:text-[30px]">
              Pay only <span className="pro-accent-text">when you create</span>
            </h2>
            <p className="max-w-md text-[14px] leading-6 text-white/[0.55]">
              From {formatINR(priceOf("single-image"))} per image. Nothing
              monthly, nothing hidden.
            </p>
            <StartCta />
            <p className="text-[13px] text-white/40">
              No subscription · Exact price before you pay · Failed renders
              refunded automatically
            </p>
          </div>
        </Reveal>
      </main>
      <VilishFooter />
    </div>
  );
}
