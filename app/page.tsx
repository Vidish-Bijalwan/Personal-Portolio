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
  TemplatesShowcase,
  ToolsDirectory,
  BlogTeasers,
  type FaqItem,
  type PriceTier,
  type TemplateCardItem,
  type BlogTeaser,
} from "@/components/vilish/home/sections";
import type { CarouselSlide } from "@/components/vilish/home/carousel";
import type { GalleryItem } from "@/components/vilish/home/gallery";
import {
  TEMPLATES,
  templateHref,
  templatePricePaise,
  templateInputsLabel,
  type Template,
} from "@/src/lib/trends/templates";
import { toolsByGroup } from "@/src/lib/tools/directory";
import { BLOG_POSTS } from "@/src/lib/blog/index";
import { DemoSection } from "@/components/vilish/home/demo";
import { ChecklistSection } from "@/components/vilish/home/checklist";

/* Homepage SEO — video-first positioning (launch Oct 11): turn product
   photos into 5-second video ads, ₹19 per clip, pay-per-creation over UPI.
   Kept in page metadata (not root layout) so every page resolves its OWN
   canonical via alternates.canonical. */
export const metadata = {
  title: "Turn Product Photos into Video Ads — ₹19 per Clip | Etch",
  description:
    "Turn product photos into scroll-stopping video ads. Finished 5-second clips from ₹19 each — pay per creation over UPI. No subscription, no expiring credits.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Turn Product Photos into Video Ads — ₹19 per Clip | Etch",
    description:
      "Turn product photos into scroll-stopping video ads. Finished 5-second clips from ₹19 each — pay per creation over UPI. No subscription, no expiring credits.",
    siteName: "Etch",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Etch — one creation, one price. AI images and video tools with no subscription.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Turn Product Photos into Video Ads — ₹19 per Clip | Etch",
    description:
      "Turn product photos into scroll-stopping video ads. Finished 5-second clips from ₹19 each — pay per creation over UPI. No subscription, no expiring credits.",
    images: ["/og-image.png"],
  },
};

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
      url: "https://tryetch.online",
      description:
        "Pay-per-creation AI studio. Studio-quality AI images and video, priced per creation — no subscriptions.",
    },
    {
      "@type": "WebSite",
      name: "Etch",
      url: "https://tryetch.online",
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
    scenario: it.scenario,
    deliverable: it.deliverable,
  }));
}

/**
 * Hero slides: the 4 finished 5-second video ad demos FIRST (video-first
 * positioning), then the 4 existing product images. Video slides point at
 * public/hero/*.mp4 (no audio, <700KB each) with a poster frame; `src` is
 * the poster so the prompt dialog still shows an image for video slides.
 */
function loadHeroSlides(): CarouselSlide[] {
  const clipPrice = formatINR(priceOf("clip-5s"));
  const imagePrice = formatINR(priceOf("single-image"));
  const videos: CarouselSlide[] = [
    {
      kind: "video",
      video: "/hero/demo-watch.mp4",
      poster: "/hero/demo-watch.jpg",
      src: "/hero/demo-watch.jpg",
      alt: "Luxury black chronograph in a leather presentation box — 5-second video ad demo",
      prompt:
        "Cinematic 5-second product ad: a luxury black chronograph resting in an open leather presentation box, dark studio with a gold spotlight and drifting dust, slow dolly-in. Finished video clip, no audio.",
      price: clipPrice,
      href: "/create?media=video",
    },
    {
      kind: "video",
      video: "/hero/demo-perfume.mp4",
      poster: "/hero/demo-perfume.jpg",
      src: "/hero/demo-perfume.jpg",
      alt: "Square amber perfume bottle with jasmine in sunlit morning light — 5-second video ad demo",
      prompt:
        "Cinematic 5-second product ad: a square amber perfume bottle with a gold cap beside fresh jasmine on stone, warm morning light, slow left-to-right pan. Finished video clip, no audio.",
      price: clipPrice,
      href: "/create?media=video",
    },
    {
      kind: "video",
      video: "/hero/demo-skincare.mp4",
      poster: "/hero/demo-skincare.jpg",
      src: "/hero/demo-skincare.jpg",
      alt: "Skincare cream jar with gold lid among dewy botanicals in golden backlight — 5-second video ad demo",
      prompt:
        "Cinematic 5-second product ad: a skincare cream jar with a gold lid among dewy botanicals, golden backlight and soft mist, slow push-in. Finished video clip, no audio.",
      price: clipPrice,
      href: "/create?media=video",
    },
    {
      kind: "video",
      video: "/hero/demo-headphones.mp4",
      poster: "/hero/demo-headphones.jpg",
      src: "/hero/demo-headphones.jpg",
      alt: "Leather over-ear headphones on a desk with a vintage camera — 5-second video ad demo",
      prompt:
        "Cinematic 5-second product ad: leather over-ear headphones on a desk beside a vintage camera, warm window light with dust motes, slow lateral glide. Finished video clip, no audio.",
      price: clipPrice,
      href: "/create?media=video",
    },
  ];
  const images = [
    {
      src: "/pro/hero-watch-exploded.jpg",
      alt: "Meridian Chrono 41 by Meridian Horology — fictional luxury chronograph, exploded component view",
      prompt:
        "Exploded view of the fictional Meridian Chrono 41 chronograph by Meridian Horology: disassembled components — dial, gears, hands, crown, sapphire crystal, steel case — floating in precise vertical layers above a dark reflective studio surface, dramatic rim lighting, deep charcoal background with a soft spotlight glow, premium advertising photography, photorealistic, ultra detailed",
    },
    {
      src: "/pro/hero-watch-box.jpg",
      alt: "Meridian Chrono 41 by Meridian Horology — chronograph resting in an open velvet-lined presentation box",
      prompt:
        "The fictional Meridian Chrono 41 chronograph by Meridian Horology resting inside an open dark presentation box lined with black velvet, elegant warm spotlight from above, dark premium studio background with soft golden bokeh, refined product advertising photography, photorealistic, ultra detailed",
    },
    {
      src: "/pro/hero-headphones.jpg",
      alt: "Sonara Studio One by Sonara — cognac leather and brass wireless headphones on a walnut desk in warm window light",
      prompt:
        "The fictional Sonara Studio One wireless headphones by Sonara: cognac-brown leather earcups, brass yokes, charcoal knit headband, resting on a walnut desk beside a linen-covered notebook and a vintage 35mm film camera, warm late-afternoon window light raking from the left, plaster wall softly out of focus behind, shallow depth of field, honest lived-in creative studio scene, premium product photography, photorealistic",
    },
    {
      src: "/pro/hero-perfume.jpg",
      alt: "Aurelle Ambre Nuit by Aurelle — amber glass flacon with brushed-gold cap on a travertine vanity in morning light",
      prompt:
        "The fictional Aurelle Ambre Nuit perfume by Aurelle: heavy rectangular glass flacon with amber liquid and a brushed-gold cap, standing on a travertine marble vanity in real morning window light, fresh jasmine sprig and folded natural-linen cloth beside it, soft sheer-curtain glow, out-of-focus bedroom greenery behind, calm luxurious morning scene, premium product photography, photorealistic",
    },
  ];
  return [
    ...videos,
    ...images.map((s) => ({
      ...s,
      kind: "image" as const,
      price: imagePrice,
      href: "/create?service=single-image",
    })),
  ];
}

/** Restored sections: templates first by badge, then newest. */
function pickTemplates(): TemplateCardItem[] {
  const rank = (t: Template) => (t.badge ? 0 : 1);
  return [...TEMPLATES]
    .sort((a, b) => rank(a) - rank(b) || (a.addedOn < b.addedOn ? 1 : -1))
    .slice(0, 6)
    .map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      badge: t.badge,
      price: formatINR(templatePricePaise(t)),
      aspect: t.aspect,
      inputsLabel: templateInputsLabel(t),
      href: templateHref(t),
    }));
}

function pickBlogTeasers(): BlogTeaser[] {
  return BLOG_POSTS.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    date: p.date,
    readingMinutes: p.readingMinutes,
  }));
}

export default function HomePage() {
  const singleImagePrice = formatINR(priceOf("single-image"));
  const gallery = loadGallery();
  const heroSlides = loadHeroSlides();
  const templates = pickTemplates();
  const toolGroups = [
    { label: "Create", tools: toolsByGroup("create") },
    { label: "Video Studio", tools: toolsByGroup("video-studio") },
  ];
  const blogTeasers = pickBlogTeasers();

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
        <Hero singleImagePrice={singleImagePrice} slides={heroSlides} />
        <TrustStrip />
        <HowItWorks />
        <DemoSection />
        <ChecklistSection />
        <WhyPillars pillars={WHY_PILLARS} />
        <ExamplesGallery items={gallery} />
        <TemplatesShowcase templates={templates} />
        <ToolsDirectory groups={toolGroups} />
        <BlogTeasers posts={blogTeasers} />
        <PricingTable tiers={tiers} />
        <FaqSection items={faqs} />
        <FinalCta />
      </main>
      <VilishFooter />
    </div>
  );
}
