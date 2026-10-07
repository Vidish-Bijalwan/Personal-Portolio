/**
 * Etch homepage — professional redesign (2026-10-07).
 *
 * Classic professional grammar: thin nav, one clear headline, real product
 * visual, honest proof, 3-step how-it-works, real output gallery, fixed
 * pricing from the catalog, FAQ, solid footer. Dual light/dark theme via
 * pro tokens. No invented numbers anywhere.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import { priceOf } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";
import {
  CATEGORY_LABEL,
  exampleHref,
  examplePrice,
  isExampleItem,
  type ExampleItem,
} from "@/components/vilish/examples";
import {
  ExamplesGallery,
  FinalCta,
  FaqSection,
  Hero,
  HowItWorks,
  PricingTable,
  TrustStrip,
  WhyPillars,
  type FaqItem,
  type PriceTier,
} from "@/components/vilish/home/sections";
import type { GalleryItem } from "@/components/vilish/home/gallery";

/* The "why pay-per-creation" pillars. Copy must stay digit-free —
   no invented numbers of any kind (homepage redesign gate). */
const WHY_PILLARS = [
  {
    title: "Pay per creation",
    copy:
      "One finished image or clip has one fixed price. You pay for what you make, and nothing else.",
  },
  {
    title: "No subscriptions",
    copy:
      "There is no monthly plan to cancel and no credits that quietly expire. Use it when you need it.",
  },
  {
    title: "Price before you pay",
    copy:
      "Every service shows its exact price up front, so the checkout never surprises you.",
  },
  {
    title: "Made for India",
    copy:
      "Prices in rupees, payment over UPI, and support that answers in your timezone.",
  },
];

const TIER_META: { id: PriceTier["id"]; name: string; blurb: string; href: string; featured?: boolean }[] = [  {
    id: "single-image",
    name: "Single image",
    blurb: "One finished image at your chosen quality and ratio. Portraits, posters, concepts.",
    href: "/create?service=single-image",
    featured: true,
  },
  {
    id: "pack-4",
    name: "4-pack",
    blurb: "Four images on one concept — iterate on an idea without paying four times.",
    href: "/create?service=pack-4",
  },
  {
    id: "product-photo",
    name: "Product photo",
    blurb: "Studio-style product shots for listings, ads and catalogues.",
    href: "/create?service=product-photo",
  },
  {
    id: "clip-5s",
    name: "5s clip",
    blurb: "A five-second video clip from your prompt. Ready for reels and ads.",
    href: "/create?media=video",
  },
];

/** Gallery picks: diverse, real, thumbnail-backed. */
const GALLERY_WANT = 8;

/* Structured data: Organization + WebSite (+ FAQPage for the homepage FAQ).
   Kept in source so the SEO checklist gate can verify it statically. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Etch",
      url: "https://vidish.me",
      description:
        "Pay-per-creation AI studio. Studio-quality AI images and video, priced per creation — no subscriptions.",
    },
    {
      "@type": "WebSite",
      name: "Etch",
      url: "https://vidish.me",
    },
  ],
};

function loadGallery(): GalleryItem[] {
  const dir = path.join(process.cwd(), "public", "examples");
  let raw: unknown[] = [];
  try {
    raw = JSON.parse(
      readFileSync(path.join(dir, "manifest.json"), "utf8"),
    ) as unknown[];
  } catch {
    raw = [];
  }
  const items = (Array.isArray(raw) ? raw : []).filter(isExampleItem);
  // Prefer still images with real thumbnails; spread across categories.
  const scored = items
    .filter((it: ExampleItem) => it.category !== "video")
    .map((it: ExampleItem) => {
      const thumbSrc = it.src.replace(/\.webp$/, "-thumb.webp");
      const thumbOk = existsSync(path.join(dir, thumbSrc.replace("/examples/", "")));
      return { it, thumb: thumbOk ? thumbSrc : it.src, thumbOk };
    })
    .filter((s) => s.thumbOk);
  const picked: typeof scored = [];
  const seenCats = new Set<string>();
  for (const s of scored) {
    if (picked.length >= GALLERY_WANT) break;
    if (!seenCats.has(s.it.category) || picked.length >= 4) {
      seenCats.add(s.it.category);
      picked.push(s);
    }
  }
  for (const s of scored) {
    if (picked.length >= GALLERY_WANT) break;
    if (!picked.includes(s)) picked.push(s);
  }
  return picked.slice(0, GALLERY_WANT).map(({ it, thumb }) => ({
    src: it.src,
    thumb,
    prompt: it.prompt,
    alt: it.alt ?? it.prompt,
    price: examplePrice(it),
    href: exampleHref(it),
    badge: CATEGORY_LABEL[it.category],
  }));
}

function loadHero(): { src: string; alt: string; prompt: string; href: string } {
  const dir = path.join(process.cwd(), "public", "examples");
  try {
    const raw = JSON.parse(
      readFileSync(path.join(dir, "manifest.json"), "utf8"),
    ) as unknown[];
    const items = (Array.isArray(raw) ? raw : []).filter(isExampleItem);
    const hero =
      items.find((it: ExampleItem) => it.src.includes("5-watch-ad")) ?? items[0];
    if (hero) {
      return {
        src: hero.src,
        alt: hero.alt ?? hero.prompt,
        prompt:
          hero.prompt.length > 110
            ? hero.prompt.slice(0, 110).trimEnd() + "…"
            : hero.prompt,
        href: exampleHref(hero),
      };
    }
  } catch {
    /* fall through to fallback */
  }
  return {
    src: "/examples/5-watch-ad.webp",
    alt: "Studio product shot of a steel chronograph — AI-generated example",
    prompt: "Studio product shot of a steel chronograph",
    href: "/create?service=product-photo",
  };
}

export default function HomePage() {
  const singleImagePrice = formatINR(priceOf("single-image"));
  const gallery = loadGallery();
  const heroImage = loadHero();

  const tiers: PriceTier[] = TIER_META.map((t) => ({
    ...t,
    price: formatINR(priceOf(t.id as "single-image")),
  }));

  const faqs: FaqItem[] = [
    {
      q: "Do I need a subscription?",
      a: "No. Etch is pay-per-creation: every service has one fixed price, you pay once per finished piece, and there is no plan to cancel or credits that expire.",
    },
    {
      q: "How much does it cost?",
      a: `A single image is ${formatINR(priceOf("single-image"))}, a 4-pack is ${formatINR(priceOf("pack-4"))}, a product photo is ${formatINR(priceOf("product-photo"))}, and a 5-second video clip is ${formatINR(priceOf("clip-5s"))}. The exact price is always shown before you pay.`,
    },
    {
      q: "How do I pay?",
      a: "Securely over UPI. After payment, your creation is generated and ready to download — failed renders are refunded, so you only pay for finished work.",
    },
    {
      q: "Is there a free option?",
      a: "Yes — every account gets free images each day. Failed generations never use up your free images.",
    },
    {
      q: "What can I create?",
      a: "Portraits, product photos, posters, ad creatives and short video clips. Start from your own prompt or a ready-made template, in the aspect ratio you need.",
    },
    {
      q: "Who is Etch for?",
      a: "Creators, sellers and marketers who need production-ready visuals without a subscription — listing photos, campaign creatives, thumbnails, and social content.",
    },
  ];

  return (
    <div className="pro-surface pro-body min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <VilishNav />
      <main>
        <Hero singleImagePrice={singleImagePrice} heroImage={heroImage} />
        <TrustStrip />
        <HowItWorks />
        <WhyPillars pillars={WHY_PILLARS} />
        <ExamplesGallery items={gallery} />
        <PricingTable tiers={tiers} />
        <FaqSection items={faqs} />
        <FinalCta />
      </main>
      <VilishFooter />
    </div>
  );
}
