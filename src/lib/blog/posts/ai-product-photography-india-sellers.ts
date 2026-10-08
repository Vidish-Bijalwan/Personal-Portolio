import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-product-photography-india-sellers",
  title: "AI Product Photography for Indian Sellers: A Practical Guide",
  description:
    "How Indian sellers get studio-grade product photos with AI for ₹39 each — no photoshoot, no studio rental. What to prepare, what to expect, and honest limits.",
  date: "2026-10-06",
  category: "Sellers",
  tags: ["product photography", "AI", "ecommerce", "India", "sellers"],
  readingMinutes: 6,
  answer: [
    t("AI product photography creates studio-grade product shots from a description or a reference photo, without a physical photoshoot. On "),
    link("Etch", "/"),
    t(", a product photo costs a flat "),
    t("₹39"),
    t(" — you describe the product and the look you want, pay over UPI, and receive a human-reviewed image. It suits sellers who need clean catalog shots fast; it doesn't replace a full brand campaign shoot."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹39", url: "https://vidish.me/pricing" },
    { label: "VEED AI tools — product-focused AI video and image tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "How much does AI product photography cost in India?",
      a: "On Etch, one AI product photo costs a flat ₹39 — the price is shown before you order and you pay per photo over UPI. A traditional product photoshoot in India typically involves photographer fees, studio rental, and editing time, which is why per-photo AI pricing suits sellers with small catalogs.",
    },
    {
      q: "What do I need to provide for an AI product photo?",
      a: "A clear description of the product (material, color, size cues) and the style you want — for example, “matte black steel bottle on a marble surface, soft daylight”. If you have an existing photo of the product, you can attach it as a reference so details stay accurate.",
    },
    {
      q: "Will the AI get my product's details right?",
      a: "Attach a reference photo of your actual product whenever accuracy matters — labels, logos, and proportions follow the reference. Every Etch creation also passes a human quality check before delivery, and a remake costs ₹9 if the first version misses.",
    },
    {
      q: "Can I use AI product photos on Amazon, Flipkart, or my Shopify store?",
      a: "Yes — the delivered image is yours to use across marketplaces and your own store. Make sure the image honestly represents the product customers will receive; misleading imagery creates returns regardless of how it was made.",
    },
  ],
  related: [
    "ai-image-generator-india-pay-per-creation",
    "make-product-ads-with-ai",
    "ai-photoshoot-cost-comparison-india",
  ],
  body: [
    p(
      t("Good product photos sell. For years, getting them meant hiring a photographer, booking a studio, and waiting days for edits — a real barrier for a small seller with forty SKUs. "),
      t("AI product photography"),
      t(" collapses that into a single order: describe the product, pick the look, pay "),
      t("₹39"),
      t(", and get a studio-grade shot. Here's how to use it well — and where its limits are.")
    ),
    h2("What you actually get for ₹39"),
    p(
      t("One finished product image, generated from your description (plus an optional reference photo), reviewed by a human before delivery. The "),
      link("pricing page", "/pricing"),
      t(" lists it plainly: "),
      t("Product photo — ₹39"),
      t(". No subscription, no credit pack, no “contact sales”.")
    ),
    h2("How to brief an AI product photo that looks real"),
    list(
      [t("Name the product precisely: material, color, finish. “Hand-poured soy candle in an amber glass jar” beats “candle”.")],
      [t("Describe the scene, not just the object: “on a light oak table, soft morning window light, shallow depth of field”.")],
      [t("State the angle and crop: “straight-on hero shot, centered, generous negative space for text”.")],
      [t("Attach a reference photo of your real product when labels, logos, or proportions must match.")],
      [t("Mention what to avoid: “no hands, no watermark, no distorted text on the label”.")],
    ),
    callout("tip",
      t("Marketplace thumbnails are tiny. Brief for high contrast and a clean background first; the lifestyle scene can be your second image. The shot that wins the click is usually the simplest one.")
    ),
    h2("AI product photo vs a traditional shoot"),
    table(
      ["", "AI product photo (Etch)", "Traditional photoshoot"],
      [
        ["Cost", "₹39 per finished photo", "Photographer day-rate + studio + editing"],
        ["Turnaround", "Operator-fulfilled, human-reviewed", "Days to weeks"],
        ["Revisions", "Remake for ₹9", "Reshoot scheduling + fees"],
        ["Consistency across SKUs", "Same prompt template, repeatable", "Depends on the shoot day"],
        ["Physical props & models", "Simulated", "Real — better for complex scenes"],
      ]
    ),
    h2("Honest limits"),
    p(
      t("AI won't photograph what doesn't exist yet — a prototype with exact engineering details is safer shot traditionally. Extremely fine label text can need a remake pass (that's what the "),
      t("₹9 remake"),
      t(" is for). And for a flagship brand campaign with models, sets, and art direction, a human crew still earns its fee. AI product photography wins on the long tail: catalog shots, variants, seasonal refreshes, and test listings.")
    ),
    h2("From photo to product ad"),
    p(
      t("Once you have the still, the same product can star in a short video ad. Etch's "),
      link("Video Studio", "/video-studio"),
      t(" adds voice-over, captions, and trim + text overlay to your clips at "),
      t("₹39 per finished video"),
      t(" — a practical next step after your catalog shots are done. There's a full walkthrough in "),
      link("our guide to making product ads with AI", "/blog/make-product-ads-with-ai"),
      t(".")
    ),
    h2("Preparing your product for its AI close-up"),
    p(
      t("AI can't photograph dirt. Wipe the product, shoot the reference in daylight against a plain background, and capture the true colors — the AI builds on what you give it. For reflective products (steel, glass), a reference shot from a slight angle helps the generator understand the material better than a flat front-on photo.")
    ),
    p(
      t("Consistency across a catalog comes from reusing a prompt template. Write one master description of your lighting and background — “soft daylight, light grey seamless background, gentle shadow” — and only change the product line per SKU. Your forty listings will look like one brand, not forty experiments.")
    ),
    h2("Scaling from one photo to a full catalog"),
    p(
      t("Start with your bestsellers: five products, one photo each, "),
      t("₹39"),
      t(" apiece. Once the style template is proven, roll through the catalog in batches. At these prices, refreshing seasonal imagery — Diwali backgrounds in October, summer brights in March — becomes routine instead of a budget meeting. And when you're ready to move, "),
      link("product video ads", "/blog/make-product-ads-with-ai"),
      t(" reuse the same photos as hero frames.")
    ),
    cta(
      "Get your first product photo for ₹39",
      "Describe it, attach a reference, pay with UPI — delivered after a human quality check.",
      "Create a product photo",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
