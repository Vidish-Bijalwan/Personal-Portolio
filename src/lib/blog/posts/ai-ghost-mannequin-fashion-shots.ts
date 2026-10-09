import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-ghost-mannequin-fashion-shots",
  title: "Ghost-Mannequin Fashion Shots with AI: A Seller's Guide",
  description:
    "The invisible-mannequin look that makes apparel listings convert — how fashion sellers brief AI ghost-mannequin shots for ₹29 and keep sizing honest.",
  date: "2026-10-08",
  category: "Sellers",
  tags: ["fashion", "apparel", "ghost mannequin", "sellers", "ecommerce"],
  readingMinutes: 6,
  answer: [
    t("Ghost-mannequin shots show garments in 3D form with no visible model or mannequin — the e-commerce standard for apparel. AI generation on "),
    link("Etch", "/"),
    t(" produces the look for "),
    t("₹29"),
    t(" per product photo from a flat garment photo plus a detailed brief. It handles presentation; fit and drape honesty still comes from accurate garment photos and truthful size charts — AI can't verify how a kurta falls on a real body."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI image pricing reference", url: "https://www.talkpix.ai/pricing" },
    { label: "VEED AI tools — AI photo and video tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "What is a ghost-mannequin product shot?",
      a: "It's the apparel photo where the garment appears worn by an invisible person — you see the 3D shape, collar, and drape, but no model or mannequin. Traditionally it needs a mannequin, a photographer, and Photoshop compositing. AI generation now produces the same look from a flat garment photo and a brief.",
    },
    {
      q: "How much does an AI ghost-mannequin shot cost?",
      a: "On Etch, one product photo costs a flat ₹29, with a human quality check before delivery. A remake is ₹5 if the drape or proportions need another pass. Compare that with mannequin rental, studio time, and retouching per garment in a traditional workflow.",
    },
    {
      q: "Can AI show how the garment actually fits?",
      a: "Honestly, only partially. AI renders plausible drape beautifully, but it can't verify true fit on real bodies — that's what size charts, flat-lay measurements, and customer reviews are for. Use AI for presentation; keep fit information factual and measurement-based.",
    },
    {
      q: "How do I keep 50 garments looking consistent?",
      a: "One master prompt template: same background, same lighting, same framing, same invisible-form style. Change only the garment description per SKU. Consistent listings look like one brand; inconsistent ones look like a reseller aggregator.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "background-removal-vs-ai-backgrounds",
    "remake-economics-ai-revisions",
  ],
  body: [
    p(
      t("Scroll any fashion marketplace and you'll see it: garments floating in perfect 3D form, no model, no mannequin, every fold in place. The "),
      t("ghost-mannequin look"),
      t(" is the visual language of serious apparel selling — it shows shape and drape while keeping full attention on the garment. Traditionally it demanded a mannequin, a studio, and skilled retouching per piece. AI now generates it from a flat photo and a good brief, at "),
      t("₹29"),
      t(" a garment.")
    ),
    h2("What to photograph before you order"),
    p(
      t("AI builds on what you give it. Photograph each garment flat or on a hanger in daylight: front, back, and a close-up of fabric texture and any prints or embroidery. True colors matter enormously in fashion — shoot a color-reference frame beside a neutral grey card if you can. The AI's job is presentation; your photos supply the truth about the garment.")
    ),
    h2("Shooting reference photos that the AI can trust"),
    p(
      t("The quality gap between good and bad AI fashion shots is almost entirely the reference photo. Lay the garment completely flat and smooth out wrinkles — the AI reads every fold as intentional drape. Shoot straight down from directly above to avoid perspective distortion, and include a ruler or coin in one frame for scale if proportions are tricky. For patterned garments, photograph the repeat unit clearly; for dark garments, add side lighting so texture doesn't vanish into shadow. Ten careful minutes per garment saves multiple "),
      t("₹5 remake"),
      t(" rounds later.")
    ),
    h2("The ghost-mannequin brief formula"),
    list(
      [t("Garment, precisely: “men's navy cotton kurta, mandarin collar, knee-length, subtle self-texture”.")],
      [t("The invisible form: “displayed on an invisible mannequin, natural 3D drape, no visible model or stand”.")],
      [t("Presentation: “front view, symmetrical, studio lighting, light grey seamless background”.")],
      [t("Details to preserve: “keep the embroidery pattern, button placement, and hem exactly as in the reference”.")],
      [t("The no-gos: “no human model, no mannequin visible, no hangers, no wrinkles beyond natural drape”.")],
    ),
    callout("tip",
      t("Indian ethnic wear — kurtas, sarees, lehengas — has drape characteristics AI handles well when briefed specifically. Name the garment type and its signature drape: “saree pleats falling naturally”, “anarkali flare”.")
    ),
    h2("Consistency: the 50-SKU system"),
    table(
      ["Keep constant", "Change per SKU", "Why"],
      [
        ["Background and lighting", "Garment description", "One brand look"],
        ["Framing and crop", "Color and pattern details", "Comparable listings"],
        ["Invisible-form style", "Size shown (photograph each size)", "Honest representation"],
        ["File naming convention", "SKU in the filename", "Catalog sanity"],
      ]
    ),
    p(
      t("Write the template once, then only the garment line changes. Your fiftieth listing will match your first — something traditional shoots struggle with across different shoot days. See the "),
      link("pricing page", "/pricing"),
      t(" for per-image costs; at this price, re-shooting the whole catalog in a new style is a decision, not a budget meeting.")
    ),
    h2("The honesty line: drape vs fit"),
    p(
      t("Here's where fashion sellers must stay disciplined. AI renders beautiful, plausible drape — but “plausible” isn't “true”. A buyer deciding between sizes needs facts: a real size chart with garment measurements, fabric composition, and care instructions. Never let a gorgeous AI render substitute for measurement data, and never describe fit based on the render (“relaxed fit”) unless the garment truly is. Presentation sells the click; honesty about fit prevents the return.")
    ),
    h2("Variants that earn their keep"),
    p(
      t("Beyond the standard front shot, consider: a back view for garments with interesting detailing, a fabric close-up for premium materials, and a styled flat-lay for social. Each is another "),
      t("₹29"),
      t(" product photo — or test the "),
      t("₹49 4-pack"),
      t(" when you want four presentation variants of one hero garment to compare. If a drape looks off, the "),
      t("₹5 remake"),
      t(" with a tightened brief beats publishing a wrong-looking garment.")
    ),
    cta(
      "Get the ghost-mannequin look for ₹29",
      "Flat garment photo in, 3D invisible-form shot out — human-checked before delivery.",
      "Create a fashion product shot",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
