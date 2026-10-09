import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-skincare-beauty-shots-india",
  title: "AI Beauty Shots for Skincare Brands: No Studio Needed",
  description:
    "D2C skincare brands can get clean flat-lays, ingredient close-ups and shelf scenes with AI product photography at ₹29 an image — the product itself never altered.",
  date: "2026-10-09",
  category: "Sellers",
  tags: ["skincare", "D2C", "product photography", "beauty", "sellers"],
  readingMinutes: 6,
  answer: [
    t("Yes — AI product photography gives D2C skincare brands clean flat-lays, ingredient close-ups, texture macros and model-free shelf scenes for "),
    t("₹29"),
    t(" per image or "),
    t("₹49"),
    t(" for a 4-pack, with a human quality check before delivery. It replaces the studio booking, not the product: the jar, tube or bottle in your listing must match what ships, so the honesty rule is that AI changes everything around the product — never the product itself. Order from "),
    link("the create page", "/create?service=product-photo"),
    t(" with a phone photo of your product as reference."),
  ],
  sources: [
    { label: "Etch pricing — ₹29 image, ₹49 4-pack", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI product photography comparison", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "How much do AI beauty shots cost on Etch?",
      a: "₹29 for a single image or ₹49 for a 4-pack of related images — for example, the same moisturiser jar in a flat-lay, an ingredient close-up, a shelf scene and a label shot. That's the listed catalog price; you pay per creation over UPI, no subscription.",
    },
    {
      q: "Will the product in the photo look exactly like my real product?",
      a: "That's the non-negotiable rule. The AI can style the background, lighting and scene freely, but the product itself — shape, label, colours, text — must match your reference photo. If a delivered image alters the product, flag it: the human quality check exists precisely to catch that, and a ₹5 remake fixes it.",
    },
    {
      q: "Can AI shoot ingredient close-ups I don't have photos of?",
      a: "Yes, this is where it shines. You won't get a clean macro of aloe pulp or saffron strands with a phone camera and no lighting. Describe the ingredient as a scene element around your product — but never let the AI redesign your label or claim ingredients that aren't in your formula.",
    },
    {
      q: "Do I need models for skincare product shots?",
      a: "No. Most D2C listing and ad images work better without models: the product, its texture and its ingredients carry the story. Model-free shelf scenes and flat-lays avoid the mismatch between a stock model's skin and what your customer will see. If your brand uses models, shoot those separately — don't fake them with AI.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "ai-jewellery-photography-india",
    "amazon-listing-images-ai-india",
  ],
  body: [
    p(
      t("Skincare is one of the hardest categories to photograph well and one of the easiest to photograph badly. A phone photo of a serum bottle on a bathroom counter looks honest but cheap; a full studio shoot looks premium but costs a day-rate, a stylist, props, and retouching. For a D2C brand listing on Amazon, Flipkart or its own site, AI product photography has quietly become the middle path: studio-quality scenes at "),
      t("₹29"),
      t(" per image, built around your actual product.")
    ),
    h2("The shot list that sells skincare"),
    p(
      t("Skincare buyers want to see four things before they add to cart: what the product looks like, what's in it, what it feels like, and where it fits in their life. Each maps to a shot type that AI handles well:")
    ),
    list(
      [t("Flat-lays. The hero grid shot: your jar or tube arranged with complementary props — dried flowers, a silk cloth, ingredient elements — on a clean surface. The single most versatile image for listings and ads.")],
      [t("Ingredient close-ups. Turmeric, aloe, rose petals, saffron strands arranged artfully around the product. Signals “natural” without a paragraph of copy.")],
      [t("Texture and macro shots. A swatch of cream, a drop of serum on glass, foam on skin-free surfaces. Texture sells efficacy before a single review exists.")],
      [t("Model-free shelf scenes. Your product on a styled bathroom shelf or vanity — aspirational lifestyle context with zero model-licensing headaches.")],
      [t("Label close-ups. A crisp, legible shot of the actual label — claims, ingredient list, net quantity. Boring, and one of the highest-converting images you'll run.")],
    ),
    h2("Label legibility is the whole game"),
    p(
      t("Here's what separates amateur AI attempts from professional ones: the label. A gorgeous flat-lay with garbled or hallucinated label text is worse than useless — it erodes trust and can invite compliance questions. Always attach a clear, straight-on photo of your product as the reference, and inspect the delivered image at full zoom: every word on the label should be crisp and match your real packaging. The "),
      link("Etch create page", "/create?service=product-photo"),
      t(" lets you anchor the generation to your reference photo for exactly this reason.")
    ),
    callout("tip",
      t("Order label close-ups as a dedicated image, not a crop of a lifestyle scene. A macro shot exists for one job — legibility — and it's the image your most careful buyers will zoom into.")
    ),
    h2("The honesty rule: never alter the product"),
    p(
      t("This is the line that matters for beauty brands. AI should change everything around the product — the background, the props, the lighting, the mood — and nothing about the product itself. The jar's shape, the label design, the fill level, the cap colour: all must match what ships to the customer. A prettier-but-wrong product photo isn't marketing, it's a return and a one-star review waiting to happen. Check every delivery against the physical product, not just against the brief.")
    ),
    callout("warn",
      t("Never let AI “improve” your packaging, add ingredients to the scene that aren't in your formula, or generate before/after skin results. The first two are deception; the third is a compliance risk in Indian cosmetics advertising.")
    ),
    h2("Keeping a consistent brand look"),
    p(
      t("The second failure mode is inconsistency: ten products, ten different aesthetics, and your storefront looks like a marketplace pile instead of a brand. The fix is a style brief you reuse for every order — same background family, same lighting temperature, same prop restraint — plus the "),
      t("₹49"),
      t(" 4-pack to shoot a product's image set in one sitting. Brief the pack as a set: “same product, same warm-beige minimal aesthetic, four scenes.”")
    ),
    table(
      ["Decision", "Consistent brands do", "Inconsistent brands do"],
      [
        ["Backgrounds", "One family: warm beige / soft white / stone", "A different trend every SKU"],
        ["Lighting", "Soft daylight, same direction every time", "Mixed warm, cool, and neon"],
        ["Props", "Two to three, repeated across SKUs", "Everything from the props box"],
        ["Label treatment", "Always legible, always accurate", "Stylised until unreadable"],
      ]
    ),
    h2("What it actually costs"),
    p(
      t("A single product's image set — flat-lay, ingredient scene, texture macro, shelf scene — is a "),
      t("₹49"),
      t(" 4-pack. Ten SKUs is ten 4-packs. Compare that with a studio day that covers maybe eight to ten products for a day-rate plus stylist plus props plus retouching, and the "),
      link("pricing page", "/pricing"),
      t(" explains why small D2C brands moved first: the per-creation price makes professional imagery a per-SKU decision, not a quarterly budget event.")
    ),
    h2("Briefing checklist for skincare"),
    list(
      [t("Attach a straight-on, well-lit phone photo of each product — this is your label-truth anchor.")],
      [t("Name your background family and lighting once, reuse it for every SKU.")],
      [t("List the exact ingredients that may appear as scene props — and nothing else.")],
      [t("Request one dedicated label-legibility macro per product.")],
      [t("State what's off-limits: no models, no altered packaging, no invented claims.")],
    ),
    cta(
      "Get studio-quality beauty shots at ₹29",
      "Flat-lays, ingredient close-ups and shelf scenes — your real product, human-reviewed.",
      "Create your product photos",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
