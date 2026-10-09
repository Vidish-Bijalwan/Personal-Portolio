import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "flipkart-catalog-refresh-ai",
  title: "Flipkart Catalog Refresh: Seasonal Variants on a Small Budget",
  description:
    "Diwali, wedding season, summer — refresh your Flipkart catalog with seasonal AI product variants on a small budget. Strategy, briefing tips, and the honest limits.",
  date: "2026-10-08",
  category: "Sellers",
  tags: ["Flipkart", "catalog", "seasonal", "sellers", "ecommerce", "India"],
  readingMinutes: 6,
  answer: [
    t("Seasonal catalog refreshes — Diwali backgrounds in October, summer brights in March — lift click-through without reshooting anything. On "),
    link("Etch", "/"),
    t(", each AI product variant costs a flat "),
    t("₹29"),
    t(", so refreshing ten listings stays well under five hundred rupees. Keep the main image clean and marketplace-compliant; use seasonal variants for secondary images and campaign creatives."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI image pricing reference", url: "https://www.talkpix.ai/pricing" },
    { label: "VEED AI tools — AI photo and video tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "Why refresh my Flipkart catalog seasonally?",
      a: "Shoppers buy with the season — festive gifting, wedding shopping, summer essentials. Listings whose imagery echoes the moment feel current and relevant, while year-old photos feel stale. A seasonal refresh is one of the cheapest conversion levers a seller has, because the product doesn't change — only its presentation does.",
    },
    {
      q: "How much does a seasonal refresh cost with AI?",
      a: "On Etch, each AI product variant costs ₹29 flat — so ten seasonal variants stay well under five hundred rupees total. A traditional reshoot for the same refresh would mean photographer fees, props, and studio time per product. The pricing page lists the full catalog.",
    },
    {
      q: "Which images should I refresh — all of them?",
      a: "Start with bestsellers: your top ten SKUs drive most of the revenue. Keep the main image clean and compliant; refresh the secondary images with seasonal scenes, and build festive creatives for ads. Once the template works, roll it through the long tail.",
    },
    {
      q: "Will Flipkart penalize AI-generated images?",
      a: "Flipkart's image rules concern clarity, accuracy, and compliance — not the tool that made the image. Keep the product truthful, keep the main image clean, follow the marketplace's image guidelines, and AI-generated seasonal variants are simply marketing creatives like any other.",
    },
  ],
  related: [
    "amazon-listing-images-ai-india",
    "ai-product-photography-india-sellers",
    "background-removal-vs-ai-backgrounds",
  ],
  body: [
    p(
      t("Indian e-commerce runs on seasons: Diwali gifting, the wedding months, summer essentials, monsoon needs. Big brands reshoot catalogs every season; small sellers watch their year-old photos go stale because a reshoot costs more than the refresh is worth. "),
      t("AI seasonal variants"),
      t(" break that trade-off — the same product, re-presented for the moment, at "),
      t("₹29"),
      t(" a variant.")
    ),
    h2("The seasonal calendar for Indian sellers"),
    list(
      [t("Diwali (Oct–Nov): warm golds, diyas, gift-ready styling — India's biggest shopping season deserves your best refresh.")],
      [t("Wedding season (Nov–Feb): rich maroons, festive tablescapes, premium gifting presentation.")],
      [t("Summer (Mar–Jun): bright daylight, fresh colors, cooling cues for relevant categories.")],
      [t("Monsoon (Jul–Sep): cozy indoor moods for home and lifestyle products.")],
      [t("Back-to-school / New Year: clean, fresh-start aesthetics for stationery, fitness, and planners.")],
    ),
    h2("The refresh strategy: bestsellers first"),
    p(
      t("Don't boil the ocean. Rank your SKUs by revenue, take the top ten, and give each one seasonal secondary image. That's ten variants at "),
      t("₹29"),
      t(" each — well under five hundred rupees for a catalog refresh that touches most of your sales. Measure click-through for two weeks; if the festive variants outperform, roll the template through the next twenty SKUs. Data first, scale second.")
    ),
    callout("tip",
      t("Build one seasonal prompt template and reuse it across SKUs: “warm Diwali evening scene, diyas glowing softly in the blurred background, product sharply in focus, festive but not cluttered”. Consistency makes ten products look like one brand campaign.")
    ),
    h2("What to brief for each variant"),
    table(
      ["Variant", "Brief the scene", "Keep constant"],
      [
        ["Diwali edition", "Diya glow, marigold accents, warm evening light", "Product shape, color, label"],
        ["Wedding season", "Rich festive table, maroon and gold tones", "Product shape, color, label"],
        ["Summer fresh", "Bright daylight, airy minimal background", "Product shape, color, label"],
        ["Gifting special", "Elegant gift-box styling, ribbon details", "Product shape, color, label"],
      ]
    ),
    p(
      t("The discipline is in the right column: the product never changes, only its stage. Attach a reference photo of the real product with every order so labels and proportions stay accurate across all variants.")
    ),
    h2("Main image stays clean — always"),
    p(
      t("The seasonal variant is for secondary images and campaign creatives, not the main listing slot. The main image is where buyers verify what they're buying; keep it clean, accurate, and compliant with Flipkart's image guidelines. Festive imagination belongs in images two through five, where it creates desire without confusing the purchase decision.")
    ),
    h2("From refresh to campaign"),
    p(
      t("The same seasonal variants double as ad creatives for Flipkart and Meta campaigns — one generation, two jobs. And when the season ends, the variants become next year's starting templates; tweak the year-specific details and re-generate. Your seasonal marketing becomes a repeatable system instead of an annual panic. The full price list is on the "),
      link("pricing page", "/pricing"),
      t(" — flat per-image pricing, pay over UPI, human quality check included.")
    ),
    h2("Measuring whether the refresh worked"),
    p(
      t("A refresh without measurement is decoration. Before you roll out seasonal variants, note your baseline: click-through rate and conversion for the SKUs you're refreshing, over the previous two comparable weeks. After the new images go live, give the marketplace algorithm a few days to settle, then compare. What you're looking for is direction and magnitude — did festive imagery lift clicks on gifting categories? Did summer brights move the needle on relevant products? Keep the winners, revert the underperformers, and write down what worked. Next season's template gets smarter, and the season after that, you're refreshing from evidence instead of instinct. Share the winning template with your whole catalog team so every seller benefits. Over two or three seasons, this measurement habit turns your refresh calendar into a compounding advantage competitors can't copy by simply spending more.")
    ),
    cta(
      "Refresh your bestsellers for ₹29 a variant",
      "One seasonal template, ten SKUs, well under five hundred rupees — delivered human-checked.",
      "Create seasonal variants",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
