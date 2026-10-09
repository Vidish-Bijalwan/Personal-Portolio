import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "amazon-listing-images-ai-india",
  title: "Amazon Listing Images: AI Shots That Convert in India",
  description:
    "Amazon India listings live or die on images. The 6-image formula that converts, infographic rules, and how ₹29 AI shots fit the workflow — honestly.",
  date: "2026-10-07",
  category: "Sellers",
  tags: ["Amazon", "listing images", "ecommerce", "sellers", "India"],
  readingMinutes: 6,
  answer: [
    t("Amazon listings that convert use a formula: a clean white-background hero, 5–6 supporting shots (lifestyle, scale, features, infographics), and honest representation of the product. On "),
    link("Etch", "/"),
    t(", AI listing shots cost a flat "),
    t("₹29"),
    t(" each — you brief the shot, attach a reference photo for accuracy, pay over UPI, and get a human-reviewed image, most orders within 24 hours. AI excels at the supporting shots; the hero shot should match the product exactly."),
  ],
  sources: [
    { label: "Amazon Seller Central India — listing image guidance", url: "https://sellercentral.amazon.in/" },
    { label: "Etch pricing — product photo ₹29", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "How many images does an Amazon listing need?",
      a: "Amazon allows multiple images per listing, and listings with a full image set — hero, lifestyle, scale, feature callouts, packaging — consistently outperform single-image listings. The practical minimum is six: one clean hero plus five supporting shots that answer buyer questions before they're asked.",
    },
    {
      q: "How much do AI Amazon listing images cost?",
      a: "On Etch, each AI listing shot costs a flat ₹29. A full six-image set is six orders — no photographer, no studio, no editing fees. A remake is ₹5 if a shot needs adjusting, which is far cheaper than reshooting a product.",
    },
    {
      q: "Will Amazon accept AI-generated listing images?",
      a: "Amazon's image requirements are technical — size, background, and content rules — not about how the image was made. AI shots that meet the requirements and honestly represent the product are fine. Always check Seller Central's current image guidelines, since policies change.",
    },
    {
      q: "Can AI shots show the product accurately?",
      a: "Attach a reference photo of your actual product and describe what must stay identical — logo, label text, proportions, color. The human quality check catches obvious mismatches, and the ₹5 remake exists for the rest. For the hero image, accuracy matters most, so brief it carefully.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "make-product-ads-with-ai",
    "ai-photoshoot-cost-comparison-india",
  ],
  body: [
    p(
      t("On Amazon India, the buy box is won on price and reviews — but the click is won on images. A shopper scrolling search results decides in under two seconds, and the decision is almost entirely visual. "),
      t("Amazon listing images"),
      t(" are not decoration; they are the product page doing its job.")
    ),
    h2("The 6-image formula that converts"),
    p(
      t("High-converting listings follow the same structure. Brief one AI shot per slot:")
    ),
    list(
      [t("Hero: product on pure white background, filling 85% of the frame, true colors. This is the thumbnail — clarity beats creativity.")],
      [t("Lifestyle: the product in use — “steel bottle on a desk beside a laptop, morning light”. Context sells.")],
      [t("Scale: product beside a familiar object — “hand holding the earbuds case”. Kills the “smaller than I expected” review.")],
      [t("Features: close-up of the key detail — “zipper macro, fabric texture visible”.")],
      [t("What's in the box: flat-lay of contents — “box open, all accessories arranged”. Reduces “missing item” complaints.")],
      [t("Infographic: clean graphic with 3–4 feature callouts. Add text in your editor, not in the AI prompt — AI text rendering is unreliable.")],
    ),
    callout("tip",
      t("The lifestyle shot is where AI earns its fee. A traditional shoot needs the location, props, and setup for one lifestyle image; AI generates five lifestyle variants in five orders and you keep the winner. Brief different rooms, lights, and moods and A/B test the thumbnails. Re-shoot the hero only when the product itself changes — everything else is a brief away.")
    ),
    h2("Briefing AI shots that Amazon will accept"),
    p(
      t("Amazon's image rules are technical: minimum dimensions, white background for the main image, no extra objects in the hero, and content restrictions on certain categories. Read the current requirements on "),
      link("Seller Central", "https://sellercentral.amazon.in/"),
      t(" before ordering — then brief each shot to comply: “product centered on pure white background, no props, no text” for the hero; anything goes (within policy) for the supporting shots.")
    ),
    h2("The accuracy contract"),
    p(
      t("Here's the honest deal: your listing images are a promise, and returns are the penalty for breaking it. AI images must represent the product customers receive — same color, same proportions, same packaging. Attach reference photos, compare every delivered shot against the real product, and use the "),
      t("₹5"),
      t(" remake when something's off. Misleading imagery doesn't just hurt conversion; it manufactures returns and bad reviews.")
    ),
    h2("AI shots vs a product shoot for Amazon"),
    table(
      ["", "AI shots (Etch)", "Traditional shoot"],
      [
        ["Cost for 6 images", "₹29 each, predictable", "Day rate + studio + editing"],
        ["Turnaround", "Most orders within 24 hours", "Days to weeks"],
        ["Variants", "Cheap to generate and test", "Each variant costs shoot time"],
        ["Hero accuracy", "Good with reference photos", "Exact — it's the real product"],
        ["Lifestyle scenes", "Any location imaginable", "Limited to the shoot day"],
      ]
    ),
    h2("The workflow that works"),
    p(
      t("Start with the hero: order it first, compare ruthlessly with the product, remake if needed. Then order the five supporting shots in one batch — "),
      link("Etch's create page", "/create"),
      t(" takes the briefs, "),
      t("₹29"),
      t(" each over UPI, and every image passes a human quality check. Upload the set, watch which thumbnails pull clicks in your seller reports, and iterate the weak slots with new variants. The "),
      link("pricing page", "/pricing"),
      t(" keeps the math simple: no subscription, no credits, just per-image pricing.")
    ),
    h2("When to call a photographer instead"),
    p(
      t("If your product's exact texture, transparency, or reflective finish is the selling point — glassware, jewellery, high-gloss electronics — a real camera still wins on fidelity. Use AI for the volume game (variants, lifestyle, seasonal refreshes) and the camera for the shots where physics matters most.")
    ),
    cta(
      "Get Amazon-ready listing shots for ₹29 each",
      "Brief all six slots, attach reference photos, pay with UPI — human-reviewed before delivery.",
      "Create listing images",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
