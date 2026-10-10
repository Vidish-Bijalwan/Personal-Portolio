import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "festive-sale-banners-ai-workflow",
  title: "Festive Sale Banners: A Step-by-Step AI Workflow for Sellers",
  description:
    "Festive banner workflow for Indian sellers: real offers, AI images from ₹15, minimal text overlays, and variants sized for WhatsApp status and marketplace listings.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["festive sales", "sale banners", "ai", "whatsapp", "sellers"],
  readingMinutes: 6,
  answer: [
    t("Festive sale banners work when the offer is real, the product shot is clean, and the text is readable on a phone screen. The practical workflow: fix your offer first (no fake MRPs), generate the banner image with AI — a single image costs "),
    t("₹15"),
    t(" or a product photo costs "),
    t("₹29"),
    t(" on "),
    link("Etch", "/"),
    t(" — keep any text on the image to a few short words, add prices in your own editor, and cut one variant per surface: WhatsApp status, Instagram, and your marketplace listing."),
  ],
  sources: [
    { label: "Etch pricing — single image ₹15, product photo ₹29", url: "https://vidish.me/pricing" },
    { label: "Amazon Seller Central India — seller hub", url: "https://sellercentral.amazon.in/" },
  ],
  faqs: [
    {
      q: "How much does a festive sale banner cost with AI?",
      a: "On Etch, the banner image costs ₹15 for a single AI image, or ₹29 if you want your actual product in the shot as a product photo. You add the offer text yourself in your own editor, so the total stays at the price of one or two generations. A remake is ₹5 if the first version misses the mood.",
    },
    {
      q: "Can AI write the sale text directly on the banner?",
      a: "It can try, but fine text — prices, dates, Hindi or other scripts — often comes out garbled. The reliable workflow is to generate a text-free background with empty space for copy, then add your headline and offer in your own editor, where you control spelling, fonts, and alignment.",
    },
    {
      q: "What size should my WhatsApp status sale banner be?",
      a: "Vertical, 9:16 — the full-screen status format. Keep the headline in the top third and the product centered so nothing important hides behind the reply bar or status UI. Instagram feed posts want square 1:1, and marketplace listing banners are usually wide landscape.",
    },
    {
      q: "How often should I change my banner during the festive week?",
      a: "Three beats work well: a teaser about a week before the sale, the main launch banner on day one, and a last-48-hours variant carrying the real end date. Same offer, refreshed visuals — it stops repeat viewers from scrolling past on autopilot.",
    },
  ],
  related: [
    "festive-creatives-ai-playbook",
    "make-product-ads-with-ai",
    "ai-image-generator-india-pay-per-creation",
  ],
  body: [
    p(
      t("Every October, the same thing happens in Indian ecommerce: sellers who planned their festive creatives in September look calm, and everyone else is panic-designing banners on the morning of Dhanteras. This workflow is for the second group. It takes you from offer to finished banners — sized for WhatsApp status, Instagram, and marketplace listings — without a designer on retainer.")
    ),
    h2("Step 1: Fix a real offer before you design anything"),
    p(
      t("A banner is just packaging for an offer. Decide the offer first and write it down in one line: product, discount or bundle, and the dates it runs. “Flat 10% off all kurtis, Oct 18–27” is an offer. “Big festive sale!!!” is not. Banners built on vague offers get vague clicks, and banners built on fake offers get angry customers.")
    ),
    callout("warn",
      t("Never invent a fake MRP to make a discount look bigger — a struck-through price that never existed misleads buyers and burns trust fast. Offer the real price you can honor, and let the banner design carry the excitement instead.")
    ),
    h2("Step 2: Generate the banner image with AI"),
    p(
      t("Start with the background and mood, not the product. Describe the festive scene — deep maroon and gold for Diwali, pine green and warm light for Christmas — and leave negative space where your text will go. On Etch, a single AI image costs "),
      t("₹15"),
      t("; if the hero is your actual product — a kurti, a gift hamper, a diya set — order a product photo for "),
      t("₹29"),
      t(" and attach a reference photo so the item stays accurate. The "),
      link("pricing page", "/pricing"),
      t(" lists both plainly.")
    ),
    p(
      t("Brief like this: “Diwali festive background, deep maroon with gold diyas and marigold petals, warm glow, empty center space for text, no people, no text on the image.” One generation, human-reviewed, delivered — and a remake is "),
      t("₹5"),
      t(" if the mood is off.")
    ),
    h2("Step 3: Keep text on the image to a minimum"),
    p(
      t("AI image tools still garble fine text — especially price figures and non-Latin scripts. The reliable move is to generate a clean background with space for copy, then add the words yourself in Canva, Picsart, or any phone editor: one headline, one offer line, one call to action. “Diwali Edit — Flat 10% Off — Shop Now” fits on a phone screen. A paragraph does not.")
    ),
    callout("tip",
      t("Export the AI image at the highest resolution offered, then add text in your editor. Text added by you stays crisp on zoom; text baked into the AI image often arrives with a misspelled word you only notice after posting.")
    ),
    h2("Step 4: Cut one variant per surface"),
    p(
      t("One banner does not fit everywhere. WhatsApp status is vertical, Instagram feed is square, and marketplace listing slots are usually landscape. Generate the base scene once, then ask for the same scene recomposed for each ratio — or crop in your editor, keeping the product and headline in the safe center.")
    ),
    table(
      ["Surface", "Shape", "What to keep in frame"],
      [
        ["WhatsApp status", "Vertical 9:16", "Headline in the top third; product centered"],
        ["Instagram post", "Square 1:1", "Product hero plus one offer line"],
        ["Marketplace listing banner", "Wide landscape", "Product left, offer text right, no clutter"],
      ]
    ),
    h2("Step 5: Refresh the creative during festive week"),
    p(
      t("Attention decays fast during sale season. Plan three beats: a teaser five to seven days before (“Sale starts Oct 18”), the main banner on launch day, and a “last 2 days” variant with urgency in the copy — not a fake countdown, just the real end date. Changing the background color between beats makes a repeat viewer stop again. Three image generations at "),
      t("₹15"),
      t(" each is still less than what many sellers pay for a single stock-photo license.")
    ),
    list(
      [t("Teaser (a week before): announce the date, show the product line, hold the price.")],
      [t("Launch (day one): full offer, all surfaces, pin it wherever you can.")],
      [t("Last call (final 48 hours): same layout, warmer urgent copy, the real end date.")],
    ),
    cta(
      "Build your festive banners from ₹15",
      "One AI image, your offer text added in your editor, sized for every surface you sell on.",
      "Create a banner image",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
