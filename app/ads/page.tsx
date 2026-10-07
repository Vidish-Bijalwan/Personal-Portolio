/**
 * /ads — Etch Ad Studio.
 *
 * A 4-step flow for small business owners who need ads/posters for their
 * products: describe the product, pick a concept from the Ad Concept Memory
 * bank, style it (palette / typography / layout), then deep-link into the
 * /create composer with the finished prompt. No subscriptions — pay per ad.
 */
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import AdsFlow from "./ads-flow";

export const metadata = {
  title: "Ad Studio — make ads for your business | Etch",
  description:
    "Ads for your business: pick a proven ad concept, style it with your colors and fonts, and get a ready-to-generate prompt. Posters, banners and ad creatives for your store or startup — pay per ad, no subscription.",
  alternates: { canonical: "/ads" },
};

export default function AdsPage() {
  return (
    <div className="pro-surface min-h-screen">
      <VilishNav />
      <AdsFlow />
      <VilishFooter />
    </div>
  );
}
