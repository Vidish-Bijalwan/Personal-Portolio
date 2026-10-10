/**
 * Homepage pricing strip — exact-limits pricing above the fold.
 *
 * Physical price framing (Fliki/Runway pattern): one price = one finished
 * thing. Every price is derived from the catalog via priceOf() + formatINR()
 * — no hardcoded rupee strings anywhere in this file.
 *
 * Renders as a slim, contrasty banner between <Hero> and <TrustStrip>.
 * It must not break the video-first hero (PR #54): it is a static,
 * low-height strip with no motion of its own.
 */
import Link from "next/link";
import { priceOf } from "@/lib/pricing/catalog";
import { formatINR } from "@/lib/vilish/types";
import { PRICING_STRIP_ITEMS } from "./pricing-strip-data";

export default function PricingStrip() {
  return (
    <section
      aria-label="Fixed pricing"
      // pro-dark-zone: the strip sits over its own dark scrim in both
      // themes — the light-theme remap must not wash out this banner.
      className="pro-dark-zone border-b border-white/[0.08] bg-[#131315]"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
          {PRICING_STRIP_ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col">
              <span className="pro-display text-[26px] font-bold tabular-nums leading-none text-[#F5F5F3]">
                {formatINR(priceOf(item.id))}
              </span>
              <span className="mt-1.5 text-[13px] leading-5 text-white/[0.62]">
                = {item.label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[13px] font-medium text-white/[0.72]">
          no subscription · pay with UPI · exact price before you pay
        </p>
        <p
          className="mt-1 text-[12.5px] text-white/[0.48]"
          lang="hi"
        >
          बिना सब्सक्रिप्शन · UPI से पेमेंट · पहले कीमत, फिर भुगतान
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-block text-[13px] font-semibold text-[var(--pro-accent)] hover:opacity-80"
        >
          See full pricing
        </Link>
      </div>
    </section>
  );
}
