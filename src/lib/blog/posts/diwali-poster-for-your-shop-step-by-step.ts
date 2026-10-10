import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "diwali-poster-for-your-shop-step-by-step",
  title: "Diwali Poster for Your Shop: A Step-by-Step DIY Guide",
  description:
    "Make a Diwali poster for your shop in one afternoon: exact print and WhatsApp sizes, a five-block layout, print-safe colors, free fonts, and a free Canva workflow.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["Diwali", "poster", "Canva", "DIY", "print", "small business"],
  readingMinutes: 6,
  answer: [
    t("A good Diwali shop poster needs five things: the right size (1080×1920 px for WhatsApp status, 2480×3508 px for A4 print), a five-block layout (background, headline, visual, offer, footer), print-safe colors (deep maroon, navy, or emerald with gold), two readable fonts (one display, one body), and a PDF export with 3 mm bleed. Build it free in Canva in an afternoon, or have one made on "),
    link("Etch", "/create"),
    t(" for "),
    t("₹29"),
    t("."),
  ],
  sources: [
    { label: "Canva — free design tool", url: "https://www.canva.com/" },
    { label: "Google Fonts — free commercial-use fonts", url: "https://fonts.google.com/" },
    { label: "Etch pricing — poster ₹29", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "What is the best free tool for making a Diwali poster?",
      a: "Canva's free tier is the best starting point: Diwali templates, plenty of free elements, and a PDF Print export that print shops accept. Adobe Express is a solid alternative. Avoid tools that watermark free exports — a watermark across the headline kills the poster's credibility.",
    },
    {
      q: "What size should a Diwali poster be for WhatsApp status?",
      a: "1080×1920 pixels (9:16). Design at exactly that size so nothing gets cropped. Keep all text inside the middle 60% of the height — phone status UIs overlay the top and bottom edges with your name, reply bar, and progress indicators, and text parked there gets hidden.",
    },
    {
      q: "Why do my printed posters look darker than on screen?",
      a: "Screens emit light; paper reflects it. Dark backgrounds print even darker, and neon brights print muddy. Fix it by printing one A4 test copy before the full run, then bumping brightness 5–10% and softening pure blacks to dark charcoal (#1A1A1A) in the design. Also ask the printer to convert to CMYK — RGB colors shift on press, especially golds.",
    },
    {
      q: "Can I use Hindi (Devanagari) text on my Diwali poster?",
      a: "Yes, and you should if your customers read Hindi — but type it yourself in the design tool. AI image generators garble Devanagari badly, producing letterforms that look festive at a glance and wrong on reading. In Canva, use Tiro Devanagari Hindi (free on Google Fonts) paired with a Latin display font in a matching weight.",
    },
    {
      q: "How much does it cost to have a Diwali poster made instead?",
      a: "On Etch a made-for-you poster costs ₹29 — flat, UPI payment, human quality check before delivery. The free tier (3 AI images a day) covers festive background scenes if you keep the design in-house. Full catalog on the pricing page.",
    },
  ],
  related: [
    "festive-creatives-ai-playbook",
    "ai-wedding-card-invitation-design",
    "aspect-ratios-explained-platforms",
  ],
  body: [
    p(
      t("Every October, Indian high streets turn into a competition of Diwali posters — and most of them are made on a phone in a single afternoon. You don't need a designer to make one that holds its own. You need the right size, a five-block layout, colors that survive the print shop, and a font people can read from across the road. This guide walks through all of it, step by step, using free tools.")
    ),
    h2("Step 1: Pick your size before you design anything"),
    p(
      t("Posters fail when they're designed at one size and squeezed into another. Decide where the poster lives first — most shops need two versions, one for the phone and one for print:"),
      t("")
    ),
    table(
      ["Where it goes", "Design size", "Notes"],
      [
        ["WhatsApp status / story", "1080 × 1920 px", "9:16; keep text in the middle 60% of the height"],
        ["Instagram post", "1080 × 1080 px", "Square; doubles as a catalog thumbnail"],
        ["A4 shop print", "2480 × 3508 px", "300 DPI; one per counter and window"],
        ["A3 poster", "3508 × 4961 px", "300 DPI; readable from across the street"],
        ["Flex banner 3 × 2 ft", "2160 × 1440 px", "72 DPI suffices for flex"],
      ]
    ),
    p(
      t("Design each version at its real size from the start — stretching a 1080-px WhatsApp graphic to A3 gives a blurry poster and a wasted print run.")
    ),
    h2("Step 2: Lock the layout in five blocks"),
    p(
      t("Every effective shop poster — Diwali or otherwise — is five blocks stacked in a fixed order. Get the order right and even a simple poster reads clearly in two seconds:"),
      t("")
    ),
    list(
      [t("Background: a deep festive color or a diya/marigold scene, dark enough that white or gold text pops.")],
      [t("Headline: “Shubh Deepavali” or “Diwali Sale — Up to 30% Off” in the largest type on the poster, top third. One message only.")],
      [t("Visual anchor: your hero product or a festive element (diya cluster, gift box, marigold toran) in the middle.")],
      [t("Offer strip: the deal in plain words — dates, discount, inclusions. “20–25 Oct • Flat 25% off kurtis • Free gift wrapping.”")],
      [t("Footer: shop name, address or landmark, phone number, timings. The block most DIY posters forget — and the one that brings footfall.")],
    ),
    callout("tip",
      t("Leave breathing room. A poster crammed edge-to-edge reads as noise from three metres away. If every block touches the next, shrink everything 10% and let the background show at the edges.")
    ),
    h2("Step 3: Use Diwali colors that print the way they look on screen"),
    p(
      t("Diwali is a gold-and-jewel-tones festival, which is lucky — those colors print well. Pick one palette and commit; mixing all three on one poster looks like three posters arguing. Three palettes with hex codes you can paste into Canva:"),
      t("")
    ),
    table(
      ["Palette", "Hex codes", "Best for"],
      [
        ["Royal Maroon & Gold", "#7B1E1E, #D4AF37, #FFF8E7", "Clothing, jewellery, sweets"],
        ["Midnight Blue & Gold", "#101F3C, #D4AF37, #F5F0E1", "Electronics, premium products"],
        ["Emerald & Gold", "#0F5B43, #C9A227, #FFFDF5", "Grocery, home goods, gifting"],
      ]
    ),
    callout("warn",
      t("Neon brights — pure green, hot pink, electric blue — look festive on screen and print muddy. Print one A4 test copy before ordering the full run.")
    ),
    h2("Step 4: Pick two fonts — one for the headline, one for the rest"),
    p(
      t("Typography is what separates a poster that reads from the road from one that doesn't. Two rules carry 90% of the weight: never use more than two fonts, and the headline must be readable at three metres (roughly 10% of the poster's height). These are free on Google Fonts and safe for commercial use:"),
      t("")
    ),
    list(
      [t("Headline (display): Yatra One or Tiro Devanagari Hindi for festive Hindi headlines; Playfair Display Bold or Poppins ExtraBold for English. Decorative fonts are headline-only.")],
      [t("Body (offer + footer): Poppins Regular, Inter, or Noto Sans. Boring is the point — plain type scans fastest.")],
      [t("Hindi + English pairing: pair Tiro Devanagari Hindi with a Latin font in a matching weight (both Bold). Mismatched weights look like two different posters.")],
      [t("Sizing ladder: headline biggest, offer medium, footer smallest — but keep the phone number legible at arm's length. When in doubt, go one size bigger.")],
    ),
    h2("Step 5: Build it free in Canva (or Adobe Express)"),
    p(
      t("Now assemble. In Canva's free tier:"),
      t("")
    ),
    list(
      [t("Create a design with Custom Size and enter your dimensions from Step 1 — 1080 × 1920 for the WhatsApp version, 2480 × 3508 for A4 print.")],
      [t("Set the background: a solid palette color from Step 3, or a free “diya” photo from Canva's library darkened with a 40–60% black overlay so text stays readable.")],
      [t("Add the five blocks in order, top to bottom. Use the font pairing from Step 4. Keep the headline to one line if possible.")],
      [t("Place your product photo or festive element as the visual anchor. Need a background scene? Etch's free tier gives 3 AI images a day — generate “brass diyas on dark maroon, warm glow” and drop it in.")],
      [t("Export: for print, use Share → Download → PDF Print (not PNG — print shops need PDF). For WhatsApp, download as PNG at full size.")],
    ),
    callout("tip",
      t("Type all text yourself in the design tool — do not bake text into an AI-generated background. AI image generators garble lettering, especially Devanagari, producing shapes that look like text until a customer tries to read them. Generated art for the background, your own typing for every word.")
    ),
    h2("Step 6: The print-shop checklist"),
    p(
      t("Before you pay for a print run, run this checklist — it catches the mistakes that cost real money:"),
      t("")
    ),
    list(
      [t("Exported as PDF Print with 3 mm bleed on all sides (Canva: tick “Crop marks and bleed” on the PDF Print download screen).")],
      [t("One A4 test print done and checked in daylight — colors, headline size, and the phone number legibility confirmed.")],
      [t("Ask the printer to convert RGB to CMYK; golds and maroons shift on press, and a good printer shows a proof.")],
      [t("Paper: 170 gsm gloss or matte for counter posters, 130 gsm for handouts. For flex banners, confirm eyelet positions if it hangs outdoors.")],
      [t("Proofread with a second person: phone number digit by digit, offer dates, shop name spelling. A wrong number is money in the bin.")],
    ),
    h2("If you'd rather have it made: the honest math"),
    p(
      t("DIY costs one focused afternoon. If that afternoon is worth more than the poster, the alternative is straightforward: a made-for-you poster on "),
      link("Etch's create page", "/create"),
      t(" costs "),
      t("₹29"),
      t(" — flat, UPI payment, human quality check before delivery. The free tier (3 AI images a day) covers festive background scenes if you want to keep the design in-house but need art you can't shoot. Compare the full catalog on the "),
      link("pricing page", "/pricing"),
      t(", and whichever route you take, run Step 6's checklist before anything goes to print.")
    ),
    cta(
      "Get your Diwali poster made for ₹29",
      "Flat price, UPI payment, human-reviewed before delivery — or start free with 3 AI images a day for the background art.",
      "Create your poster",
      "/create?service=poster"
    ),
  ],
};

export default post;
