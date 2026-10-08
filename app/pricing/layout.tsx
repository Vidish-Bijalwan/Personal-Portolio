import {
  VIDEO_CLIP_5S_PRICE_RUPEES,
  priceOf,
} from "@/lib/pricing/catalog";
import {
  VIDEO_DURATION_MAX_S,
  videoClipPricePaise,
} from "@/lib/pricing/engine";
import { formatINR } from "@/src/lib/vilish/types";

/** Video clip range line — always derived from the canonical 5s clip price. */
const clipRangeLine = `video clips ${formatINR(
  VIDEO_CLIP_5S_PRICE_RUPEES * 100,
)} for 5s up to ${formatINR(videoClipPricePaise(VIDEO_DURATION_MAX_S))} for a full minute`;

export const metadata = {
  title: "Pricing — one creation, one price, no subscription | Etch",
  description: `Etch pricing: AI images from ${formatINR(
    priceOf("single-image"),
  )}, 4-packs ${formatINR(priceOf("pack-4"))}, product photos ${formatINR(
    priceOf("product-photo"),
  )}, ${clipRangeLine}, video tools ${formatINR(
    priceOf("tool-basic"),
  )}–${formatINR(priceOf("video-studio"))}, remakes ${formatINR(
    priceOf("remake"),
  )}. Pay per creation with UPI.`,
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
