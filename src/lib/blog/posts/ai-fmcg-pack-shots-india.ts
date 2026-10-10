import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-fmcg-pack-shots-india",
  title: "AI Pack Shots for FMCG Sellers: Thumbnails That Sell",
  description:
    "FMCG pack shots live or die on 2-inch thumbnails. How Indian grocery sellers brief AI pack shots that stay label-legible, flavor-coded, and honest — for ₹29 each.",
  date: "2026-10-10",
  category: "Sellers",
  tags: ["fmcg", "product photography", "ecommerce", "grocery", "sellers"],
  readingMinutes: 6,
  answer: [
    t("AI pack shots give grocery and FMCG sellers studio-quality product images from a description and a reference photo, at a flat "),
    t("₹29"),
    t(" per photo. Brief for a straight-on front label, keep flavor variants color-coded, keep every regulatory claim honest — AI scenes are illustrative, so nutritional panels and net-weight text must match your real pack. One prompt template can carry a whole product line."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29", url: "https://vidish.me/pricing" },
    { label: "Amazon Seller Central India — product image guidance", url: "https://sellercentral.amazon.in/" },
  ],
  faqs: [
    {
      q: "Can AI generate my product’s front label accurately?",
      a: "Yes, if you attach a clear photo of the real pack as a reference. The AI follows your actual label design, colors, and logo. Read every word in the delivered image before it goes live — fine nutritional text and net-weight lines sometimes need a ₹5 remake pass, and a remade version is cheaper than a customer complaint.",
    },
    {
      q: "How much does one AI pack shot cost?",
      a: "One AI product photo costs a flat ₹29 on Etch — pay per photo over UPI, no subscription. A 4-pack of images costs ₹49 if you need multiple angles of the same pack, and a remake is ₹5 if a detail comes out wrong.",
    },
    {
      q: "How should flavor or variant packs look different from each other?",
      a: "Give each variant its own color-coding in the brief — masala in red, mint in green, original in yellow — and keep the background and lighting identical across variants. Shoppers compare variants in thumbnail rows, so visual consistency is what makes the difference readable at small sizes.",
    },
    {
      q: "Can I use AI pack shots on Amazon, Flipkart, and quick-commerce apps?",
      a: "Yes — the delivered image is yours to use on any marketplace. Make sure the pack shown matches what ships: same variant, same weight, same front-of-pack claims. Misleading pack imagery creates returns and listing complaints no matter how the photo was made.",
    },
  ],
  related: [
    "amazon-listing-images-ai-india",
    "ai-food-photography-restaurant-menus",
    "flipkart-catalog-refresh-ai",
  ],
  body: [
    p(
      t("A grocery pack gets about two inches of screen space on a phone. That is the entire billboard: your label, your flavor cue, your variant — all legible before a thumb scrolls past. For FMCG sellers, the pack shot is not decoration; it is the listing. "),
      t("AI pack shots"),
      t(" give you studio-grade versions of that image without renting a studio, at "),
      t("₹29"),
      t(" per photo. Here is how to brief them so small screens love your packs — and how to keep them honest.")
    ),
    h2("The 2-inch thumbnail test"),
    p(
      t("Open your marketplace app and screenshot your own listing next to three competitors. Zoom out until the pack is thumbnail-sized. If your flavor name, brand color, or front-of-pack claim is not readable at that size, the AI brief was wrong — not the AI. The single most useful habit for FMCG pack shots: judge every delivered image at thumbnail size first, full size second. A pack that reads at two inches converts; a pack that only impresses full-screen loses the click it never earned.")
    ),
    callout("tip",
      t("Check your pack shot at actual phone-thumbnail size before approving it. If the flavor name and brand mark are not readable there, request a remake for ₹5 with tighter framing rather than shipping a beautiful image nobody can read.")
    ),
    h2("How to brief an AI pack shot that stays legible"),
    p(
      t("FMCG briefs need more structure than a generic product shot because the label is the content. A good brief names the pack, the face, the variant, and the background — in that order.")
    ),
    list(
      [t("Name the exact pack: “250g stand-up pouch of masala roasted peanuts, front face square to camera”. Vague briefs (“snack pack”) give vague packs.")],
      [t("Demand the front label straight-on: “front label facing camera, no tilt, centered”. Angled 3/4 shots look premium but shrink the readable label area — use them as image two, never image one.")],
      [t("Color-code the variant: “masala variant in deep red, consistent with the reference pack”. Flavor confusion is the number-one complaint in multi-variant lines.")],
      [t("Fix the background: “clean light-grey seamless background, soft shadow”. Busy backgrounds steal legibility at thumbnail size.")],
      [t("Attach the real pack photo as a reference so the logo, brand colors, and front-of-pack claims follow your actual artwork.")],
    ),
    h2("Three shots every FMCG listing needs"),
    table(
      ["Shot", "Angle", "Job it does"],
      [
        ["Hero", "Straight-on front label", "Wins the thumbnail — label fully readable"],
        ["3/4 lifestyle", "Pack at 45 degrees on a kitchen shelf scene", "Sells the usage moment, builds trust"],
        ["Variant lineup", "All flavors side by side, same lighting", "Stops variant mix-ups, lifts basket size"],
      ]
    ),
    p(
      t("A "),
      t("4-pack of images for ₹49"),
      t(" covers the hero plus the two supporting shots in one order — a practical way to build a complete listing set without re-briefing from scratch. The "),
      link("pricing page", "/pricing"),
      t(" lists it plainly: single AI image ₹15, product photo ₹29, 4-pack ₹49.")
    ),
    h2("Keeping claims honest: the label-text rule"),
    p(
      t("This is the hard rule for FMCG AI shots. The AI image is illustrative — it shows your pack beautifully, but it is not a legal document. Every nutritional panel, net-weight figure, MRP, FSSAI logo, and front-of-pack claim in the delivered image must match your real packaging word for word. If the generator renders a plausible-looking but wrong “protein 12g” or a slightly off net-weight line, do not ship it. Request a "),
      t("remake for ₹5"),
      t(" with a note pointing at the exact text, or composite the true label panel from a real photograph onto the AI scene.")
    ),
    callout("warn",
      t("Never let AI invent claims on your pack: no invented “100% organic”, “sugar-free”, or “doctor recommended” badges that are not on your real product. Marketplaces and regulators both treat pack claims as your words, however the image was made.")
    ),
    h2("One template for the whole product line"),
    p(
      t("The real win for FMCG is not one pretty pack shot — it is forty consistent ones. Write a single master brief and reuse it: same background, same lighting phrase, same camera distance. Change only the pack name, variant color, and flavor callouts per SKU. The result reads as one brand across the shelf instead of forty experiments. When the festive season comes, swap just the background line — “Diwali diyas bokeh background” — and rerun the line for a seasonal refresh at "),
      t("₹29"),
      t(" a pack instead of a new shoot.")
    ),
    h2("What ₹29 buys — and what it does not"),
    p(
      t("One finished pack image from your description plus a reference photo, reviewed by a human before delivery. The "),
      link("Video Studio", "/video-studio"),
      t(" can later turn that still into a short ad with voice-over and captions at "),
      t("₹29 per finished video"),
      t(" — useful for quick-commerce banners and social. What it does not buy: a legal guarantee of label accuracy (your job to verify), or a replacement for real pack photography when a marketplace specifically demands unedited product photos for compliance checks.")
    ),
    p(
      t("Start with your five best-selling SKUs: one hero shot each, judged at thumbnail size. Once the template is proven, roll the line through in batches. And for the photography side of restaurant menus and food brands, the same briefing discipline applies — see "),
      link("our guide to AI food photography for restaurants", "/blog/ai-food-photography-restaurant-menus"),
      t(".")
    ),
    cta(
      "Get your first pack shot for ₹29",
      "Describe the pack, attach a photo of the real label, pay with UPI — delivered after a human quality check.",
      "Create a pack shot",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
