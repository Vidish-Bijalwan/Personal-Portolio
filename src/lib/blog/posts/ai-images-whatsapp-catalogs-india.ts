import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-images-whatsapp-catalogs-india",
  title: "AI Images for WhatsApp Catalogs and Broadcast Lists",
  description:
    "WhatsApp catalogs run on tiny square thumbnails. Generate bright, consistent AI product images for ₹15–₹29 — and keep every photo honest so returns stay low.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["whatsapp", "AI images", "sellers", "India", "catalog"],
  readingMinutes: 6,
  answer: [
    t("WhatsApp Business catalogs display products as small square thumbnails, so sellers need bright, high-contrast, consistent product images. AI images at "),
    t("₹15"),
    t(" for a single image or "),
    t("₹29"),
    t(" for a product photo on "),
    link("Etch", "/"),
    t(" let sellers keep one background style across all SKUs and refresh festival catalogs cheaply. The hard rule: the photo must honestly represent the product — misleading images drive returns that cost far more than any photo.")
  ],
  sources: [
    { label: "Etch pricing — single image ₹15, product photo ₹29", url: "https://vidish.me/pricing" },
    { label: "YouTube Creators — official creator resources", url: "https://www.youtube.com/intl/ALL_in/creators/" },
  ],
  faqs: [
    {
      q: "Why do WhatsApp catalog images need a different approach?",
      a: "WhatsApp catalog thumbnails are small and square, viewed on a phone screen often in bright light. High contrast, clean backgrounds, and consistent styling across SKUs matter more than elaborate scenes — the product must read clearly at a glance.",
    },
    {
      q: "How much does it cost to image a full WhatsApp catalog with AI?",
      a: "On Etch, a single AI image costs ₹15 and a product photo costs ₹29, with a ₹5 remake if a version misses. Because you reuse one background template across SKUs, the per-product cost stays flat as the catalog grows.",
    },
    {
      q: "How do I keep backgrounds consistent across dozens of SKUs?",
      a: "Write one master style line — for example, “soft daylight, warm beige background, gentle shadow, centered, square crop” — and reuse it verbatim in every brief, changing only the product description. Consistency comes from the template, not from re-describing the style each time.",
    },
    {
      q: "Can AI images mislead buyers and increase returns?",
      a: "Only if you let them. The photo must show the real product in its true color and form — never a fancier variant than what you ship. Returns in India cost you the courier both ways plus the customer’s trust; an honest photo is always cheaper.",
    },
  ],
  related: [
    "make-product-ads-with-ai",
    "ai-image-generator-india-pay-per-creation",
    "flipkart-catalog-refresh-ai",
  ],
  body: [
    p(
      t("For lakhs of Indian sellers, the storefront is a WhatsApp chat. The catalog tab shows a grid of tiny square thumbnails, and buyers decide in seconds whether to tap. That grid is a design problem: bright, high-contrast, consistent images win; a messy mix of phone snaps loses. AI generation is a practical way to get there without a shoot — here is how to do it right.")
    ),
    h2("Why WhatsApp thumbnails are a different design problem"),
    p(
      t("Marketplace listings give you a large hero image and a zoom view. WhatsApp gives you a small square viewed on a phone, often outdoors in harsh light. Detail matters less than clarity: strong contrast between product and background, the product filling most of the frame, and colors that read correctly at a glance. Brief every image for the thumbnail first — the elaborate lifestyle scene can wait for your website.")
    ),
    h2("The consistent-background trick across SKUs"),
    p(
      t("A catalog looks professional when every product sits in the same world. Write one master style line and reuse it verbatim in every order, changing only the product description. Something like: “soft daylight, warm beige background, gentle shadow, centered, square crop, no hands, no text”. Fifty products, one line, one brand.")
    ),
    list(
      [t("Pick one background family — light, dark, or festive — and hold it for the whole catalog.")],
      [t("Keep the lighting description identical so products don’t look shot on different days.")],
      [t("Use the same crop and framing language every time: “centered, generous margins, square”.")],
      [t("Brief for contrast first: dark products on light backgrounds, light products on mid-tone ones.")],
    ),
    callout("tip",
      t("Test the style line on three products before ordering the rest of the catalog. If those three thumbnails look like siblings in your WhatsApp catalog, the template is proven — roll it through every SKU.")
    ),
    h2("What to order: ₹15 image vs ₹29 product photo"),
    table(
      ["", "Single AI image — ₹15", "AI product photo — ₹29"],
      [
        ["Best for", "Festival banners, announcement creatives, backgrounds", "The catalog product shots themselves"],
        ["Reference photo", "Optional", "Attach your real product — accuracy matters here"],
        ["Human quality check", "Yes", "Yes"],
        ["Remake", "₹5", "₹5"],
        ["Use for the thumbnail grid", "Occasionally", "This is the workhorse"],
      ]
    ),
    p(
      t("The "),
      link("pricing page", "/pricing"),
      t(" lists both plainly. Most sellers use the ₹29 product photo for every catalog SKU and the ₹15 image for broadcast creatives — festival greetings, sale announcements, new-arrival banners that go out to broadcast lists.")
    ),
    h2("Refreshing catalogs for festivals"),
    p(
      t("Diwali, Rakhi, Eid, Christmas — Indian selling runs on the festival calendar, and catalogs that look seasonal convert better. Because each image costs ₹15–₹29, refreshing the whole catalog for a festival is a small routine expense instead of a photoshoot project. Keep the same style template and just swap the background family: diyas and marigolds for Diwali, pastels for Holi, deep reds for the wedding season. The products stay consistent; the mood changes.")
    ),
    h2("Broadcast lists need creatives, not just catalog shots"),
    p(
      t("Broadcast messages go to customers who already know you — they need a reason to open, not just a product grid. Pair a ₹15 announcement creative (festival offer, new arrival, restock alert) with the catalog link so the tap leads somewhere ready to buy. One creative per broadcast, kept in the same visual family as the catalog, keeps the brand coherent from message to checkout.")
    ),
    callout("warn",
      t("Honesty rule: the photo must match the parcel. Never show a fancier variant, a brighter color, or a bigger size than what you ship. In India, a return costs you courier charges both ways plus the customer’s trust — one honest photo is always cheaper than one misleading one.")
    ),
    h2("What AI can’t fix for your catalog"),
    p(
      t("AI can’t invent your product’s true color from a badly lit phone photo — shoot the reference in daylight. It can’t reproduce very fine label microtext reliably in one pass, and it won’t photograph a physical prop you don’t have. These are small limits, but stating them plainly is what keeps your catalog honest and your returns low. For the full phone-to-listing workflow, see "),
      link("the AI product photo pipeline guide", "/blog/phone-snap-to-listing-ready-ai-pipeline"),
      t(".")
    ),
    cta(
      "Image your whole WhatsApp catalog for ₹15–₹29 a photo",
      "One style template, human-checked delivery, ₹5 remakes — bright thumbnails that tap well.",
      "Create catalog images",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
