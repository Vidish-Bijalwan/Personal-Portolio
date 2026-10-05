import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";

interface Tier {
  name: string;
  price: string;
  blurb: string;
  action?: { label: string; href: string };
  comingSoon?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Single image",
    price: "₹29",
    blurb: "One AI image at your chosen quality and aspect ratio. Live price shown before you pay.",
    action: { label: "Create one", href: "/create" },
  },
  {
    name: "4-pack",
    price: "₹79",
    blurb: "Four images in one bundle — iterate on a concept without paying four times.",
    action: { label: "Create", href: "/create" },
  },
  {
    name: "Product photo",
    price: "₹49",
    blurb: "Studio-grade product shot from a description or reference.",
    action: { label: "Create", href: "/create" },
  },
  {
    name: "5s clip",
    price: "₹99",
    blurb: "Short AI video generation.",
    comingSoon: true,
  },
  {
    name: "Remake",
    price: "₹19",
    blurb: "Didn't land? Regenerate any finished image with the same settings for less.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[36px]">
          No subscription. No credits.
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-white/[0.58]">
          Pay per creation. You always see the exact price before anything is
          charged, and failed renders are refunded automatically.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              aria-disabled={t.comingSoon}
              className={
                "flex flex-col rounded-[16px] border border-white/[0.08] bg-[#121214] p-6 " +
                (t.comingSoon ? "opacity-60" : "")
              }
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold">{t.name}</h2>
                {t.comingSoon && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/60">
                    <Clock className="h-3 w-3" /> Video — coming soon
                  </span>
                )}
              </div>
              <p className="mt-3 text-[30px] font-semibold tabular-nums tracking-[-0.01em]">
                {t.price}
              </p>
              <p className="mt-2 flex-1 text-[13px] leading-6 text-white/[0.58]">{t.blurb}</p>
              {t.action && !t.comingSoon && (
                <Link
                  href={t.action.href}
                  className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium text-[#F5F5F3] hover:border-white/25"
                >
                  {t.action.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-[13px] leading-6 text-white/40">
          Prices include payment fees and taxes — the number you see is the
          number you pay. Nothing else is added at checkout.
        </p>
      </main>
      <VilishFooter />
    </div>
  );
}
