import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "background-removal-vs-ai-backgrounds",
  title: "Background Removal vs AI Backgrounds: When to Use Which",
  description:
    "Clean cutout or styled scene? How sellers decide between background removal and AI-generated backgrounds — with marketplace rules, cost math, and honest limits.",
  date: "2026-10-08",
  category: "Guides",
  tags: ["background removal", "product photography", "sellers", "ecommerce"],
  readingMinutes: 6,
  answer: [
    t("Background removal isolates your product on a clean backdrop — best for marketplace main images and catalogs. AI backgrounds place it in a styled scene — best for ads, social, and brand storytelling. On "),
    link("Etch", "/"),
    t(", an AI product photo with a generated background costs "),
    t("₹29"),
    t(". Rule of thumb: the main listing image stays clean and honest; the second, third, and ad images can go cinematic."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI image pricing reference", url: "https://www.talkpix.ai/pricing" },
    { label: "VEED AI tools — AI photo and video tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "What is the difference between background removal and AI backgrounds?",
      a: "Background removal cuts the product out of its photo and places it on a plain backdrop — the product is real, only the surroundings change. AI backgrounds generate an entirely new scene around the product — a marble counter, a beach at sunset — so the setting is imagined while the product stays true.",
    },
    {
      q: "Which one should be my Amazon or Flipkart main image?",
      a: "Use a clean, honest image for the main slot — most marketplaces require or strongly prefer plain backgrounds there, and it's where buyers judge what they're actually buying. Save styled AI backgrounds for the secondary images, A+ content, and your ads. Always check your marketplace's current image rules.",
    },
    {
      q: "Will an AI background misrepresent my product?",
      a: "Only if you let it change the product. Brief explicitly: “keep the product identical — same shape, color, label, proportions — change only the background to…”. Attach a reference photo of the real product. The scene is marketing; the product must stay factual.",
    },
    {
      q: "How much does an AI background product shot cost?",
      a: "On Etch, a product photo with an AI-generated background costs a flat ₹29, with a human quality check before delivery. A remake is ₹5 if the background overpowers the product or a detail drifts.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "amazon-listing-images-ai-india",
    "flipkart-catalog-refresh-ai",
  ],
  body: [
    p(
      t("Every product photo answers two questions: “what is it?” and “why do I want it?”. "),
      t("Background removal"),
      t(" answers the first — a clean, distraction-free view of the product. "),
      t("AI backgrounds"),
      t(" answer the second — the product living its best life in a scene that sells the dream. Sellers need both, in different slots. Here's how to choose.")
    ),
    h2("Background removal: the honest workhorse"),
    p(
      t("A cutout on a clean background is the least glamorous and most important product image you'll make. It's what marketplaces want for the main image, what comparison shoppers trust, and what keeps returns low — because the buyer sees the product, not a fantasy. Use it for: the primary listing image on every marketplace, catalog grids where consistency matters, and any product where color and detail accuracy drive the purchase (apparel, cosmetics, electronics).")
    ),
    h2("AI backgrounds: the storyteller"),
    p(
      t("Once the honest shot exists, AI backgrounds do the selling around it. A steel bottle on a misty mountain trail. A diya set on a festive table glowing at dusk. A skincare serum on wet marble with eucalyptus. These are the images for Instagram ads, carousel second-images, festive campaigns, and your own website's hero sections — places where mood converts. One product, many stories, "),
      t("₹29"),
      t(" per scene.")
    ),
    h2("When each wins: the decision table"),
    table(
      ["Situation", "Use", "Why"],
      [
        ["Marketplace main image", "Background removal", "Marketplace rules + buyer trust"],
        ["Instagram / Facebook ad", "AI background", "Mood and scroll-stopping power"],
        ["Catalog grid (40 SKUs)", "Background removal", "Consistency across the range"],
        ["Festive campaign (Diwali sale)", "AI background", "Seasonal storytelling"],
        ["Color-critical product", "Background removal", "Accuracy over atmosphere"],
        ["Brand website hero", "AI background", "Aspirational first impression"],
      ]
    ),
    callout("tip",
      t("The winning listing uses both: image 1 is the clean honest shot, images 2–4 are AI-background lifestyle scenes. Trust first, desire second — in that order.")
    ),
    h2("Briefing an AI background that keeps the product truthful"),
    list(
      [t("Attach a reference photo of your actual product — labels, logos, and proportions follow the reference.")],
      [t("State the inviolable: “keep the product identical — same shape, color, label text, proportions.”")],
      [t("Describe the scene separately: “on a rustic wooden table, morning light, blurred kitchen background.”")],
      [t("Name the no-gos: “no hands holding the product, no extra objects touching it, no text overlays.”")],
      [t("Check the result against the real product side by side before publishing.")],
    ),
    h2("The cost math for a full listing"),
    p(
      t("A complete listing image set — one clean shot plus three lifestyle scenes — costs four product photos at "),
      t("₹29"),
      t(" each on "),
      link("Etch", "/"),
      t(". Compare that with a styled photoshoot: props, location or studio time, photographer day rate — per product. The "),
      link("pricing page", "/pricing"),
      t(" lists the flat catalog; no subscriptions, no credits, pay per image over UPI.")
    ),
    h2("What AI backgrounds can't do"),
    p(
      t("Honest limits: AI can't photograph a product that doesn't exist yet with engineering accuracy, and reflective or transparent products (glass, chrome) need a good reference photo to render materials believably. If a background generation drifts — wrong label, warped shape — don't publish it; order the "),
      t("₹5 remake"),
      t(" with a tighter brief. The background is allowed to be imagination. The product never is.")
    ),
    h2("Ordering both from one reference photo"),
    p(
      t("The efficient move is to shoot one excellent reference photo per product — clean daylight, true colors, sharp detail — and derive everything from it: the background-removed main image, two or three AI-background lifestyle scenes, and festive variants later. One photo session, a whole image system. When the reference is strong, every derivative stays accurate, because they're all anchored to the same truth.")
    ),
    cta(
      "Get a styled product shot for ₹29",
      "Attach your product photo, describe the scene, keep the product identical — human-checked before delivery.",
      "Create a product photo",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
