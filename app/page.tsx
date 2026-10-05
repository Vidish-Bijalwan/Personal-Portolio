import Link from "next/link";
import { ArrowRight, BadgeCheck, RefreshCcw, ShieldCheck, Tag } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Composer from "@/components/vilish/composer";

const TRUST = [
  { icon: Tag, label: "No subscription" },
  { icon: BadgeCheck, label: "Exact price first" },
  { icon: RefreshCcw, label: "Cheap remakes" },
  { icon: ShieldCheck, label: "Failed renders refunded" },
];

const FLOW = ["Describe", "See price", "Pay once", "Download"];

const TEASER = [
  { label: "Single image", price: "₹29" },
  { label: "4-pack", price: "₹79" },
  { label: "Product photo", price: "₹49" },
  { label: "Remake", price: "₹19" },
];

export default function VilishLanding() {
  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />

      <main>
        {/* hero */}
        <section className="mx-auto max-w-3xl px-4 pt-16 text-center sm:pt-24">
          <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[52px]">
            One creation.{" "}
            <span className="v-iris-text">One price.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58] sm:text-[17px]">
            Generate AI images without another monthly subscription. See the exact
            price before you pay — from ₹29.
          </p>

          {/* trust row */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-[13px] text-white/55">
                <t.icon className="h-4 w-4 text-white/70" strokeWidth={1.8} />
                {t.label}
              </li>
            ))}
          </ul>
        </section>

        {/* hero composer */}
        <section className="mx-auto max-w-2xl px-4 pt-8 sm:pt-10">
          <Composer variant="hero" />
        </section>

        {/* how it works — horizontal flow, not cards */}
        <section className="mx-auto max-w-3xl px-4 pt-16 sm:pt-20" aria-label="How it works">
          <div className="flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap border-t border-b border-white/[0.08] py-5">
            {FLOW.map((step, i) => (
              <div key={step} className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="text-[12px] tabular-nums text-white/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[14px] font-medium text-[#F5F5F3]">{step}</span>
                {i < FLOW.length - 1 && (
                  <ArrowRight className="mx-1 h-4 w-4 shrink-0 text-white/25 sm:mx-3" strokeWidth={1.8} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* pricing teaser */}
        <section className="mx-auto max-w-3xl px-4 pt-12 sm:pt-16" aria-label="Pricing teaser">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TEASER.map((t) => (
              <p key={t.label} className="text-[13px] text-white/50">
                {t.label}{" "}
                <span className="font-semibold text-[#F5F5F3] tabular-nums">{t.price}</span>
              </p>
            ))}
          </div>
          <p className="mt-5 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
            >
              See full pricing <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </p>
        </section>

        {/* closing CTA */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] sm:text-[28px]">
            Pay per creation, not per month.
          </h2>
          <Link
            href="/create"
            className="v-iris-bg mt-6 inline-flex items-center gap-2 rounded-[10px] px-6 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-95"
          >
            Start creating <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <VilishFooter />
    </div>
  );
}
