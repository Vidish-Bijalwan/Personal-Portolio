import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-food-photography-restaurant-menus",
  title: "AI Food Photography for Restaurant Menus: No Shoot Needed",
  description:
    "Restaurant menus need appetizing photos without a full shoot. How to brief AI food photography — steam, texture, plating — and which shots still need a camera.",
  date: "2026-10-07",
  category: "Guides",
  tags: ["food photography", "restaurants", "menus", "AI images", "India"],
  readingMinutes: 6,
  answer: [
    t("AI food photography generates menu-ready dish shots from a written brief — cuisine, plating, lighting, and angle — without booking a food photographer. On "),
    link("Etch", "/"),
    t(", a food shot costs a flat "),
    t("₹29"),
    t(" as a product photo — you describe the dish and the look, pay over UPI, and get a human-reviewed image, most orders within 24 hours. It works best for stylized menu and delivery-app imagery; hero shots of signature dishes still deserve a real camera."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29", url: "https://tryetch.online/pricing" },
    { label: "VEED AI tools — food and product creative tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "How much does AI food photography cost for a restaurant?",
      a: "On Etch, each food shot costs a flat ₹29 — the product-photo price. A 20-dish menu section costs roughly the price of one AI photo per dish, with no photographer day-rate, no food stylist, and no studio. Remakes are ₹5 if a dish needs a second pass.",
    },
    {
      q: "Will AI food photos look like my actual dishes?",
      a: "Attach reference photos of your real dishes and the AI will match the plating, portion style, and key ingredients. Perfect one-to-one accuracy isn't guaranteed — that's why you should always compare the delivered shot against the real plate and request a ₹5 remake if something material differs.",
    },
    {
      q: "Can I use AI food photos on Zomato and Swiggy?",
      a: "Yes, but honesty matters more on delivery apps than anywhere else: customers compare the photo with what arrives. Brief the AI for realistic portions and your actual plating — inflated imagery earns bad reviews. Check each platform's current image guidelines before uploading.",
    },
    {
      q: "What should I write in a food photography prompt?",
      a: "Name the dish and cuisine, describe the plating and key visible ingredients, set the surface and background, and specify the light: “butter chicken in a black bowl, cream swirl, naan beside, dark wooden table, soft side light, gentle steam, overhead shot.”",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "make-product-ads-with-ai",
    "what-is-pay-per-creation-ai",
  ],
  body: [
    p(
      t("A restaurant menu with no photos sells less than one with good ones — everyone in the business knows this, and everyone dreads the food shoot: the photographer, the stylist, the dishes going cold under hot lights, the bill. "),
      t("AI food photography"),
      t(" offers a third option: brief the dish in words, get a menu-ready shot, and spend the shoot budget on ingredients instead.")
    ),
    h2("The anatomy of an appetizing AI food shot"),
    p(
      t("Appetite is physics: steam, gloss, and texture. A prompt that ignores them produces a beautiful still life nobody wants to eat. Build every food prompt from these five parts:")
    ),
    list(
      [t("The dish, named precisely: “masala dosa, golden crisp, potato masala visible at the fold”")],
      [t("What's glistening: “ghee sheen on the dosa, sambar in a steel bowl with a steam wisp”")],
      [t("The surface: “dark slate”, “banana leaf”, “white ceramic on rustic wood”")],
      [t("The light: “soft window light from the left” — never harsh overhead, which kills texture")],
      [t("The angle: “45-degree angle” for most dishes, “overhead flat-lay” for thalis and spreads")],
    ),
    callout("tip",
      t("The two words that most improve AI food shots: “gentle steam” and “shallow depth of field”. Steam signals fresh-and-hot; shallow focus makes the hero dish pop while the background melts into appetite-friendly blur.")
    ),
    h2("Match the shot to where it will live"),
    table(
      ["Placement", "Brief this", "Avoid"],
      [
        ["Printed menu", "“clean white background, even lighting, true colors”", "Moody dark shots — they print muddy"],
        ["Delivery apps", "“bright, high contrast, dish fills 80% of frame”", "Wide lifestyle scenes — thumbnails are tiny"],
        ["Instagram", "“rustic table, hands tearing naan, motion”", "Overhead flat-lays — everyone posts those"],
        ["Hoarding / banner", "“dramatic side light, generous negative space for text”", "Busy compositions — text needs room"],
      ]
    ),
    h2("The honesty rule for food"),
    p(
      t("Food is the one category where AI imagery carries real risk: a customer who receives a thali that looks nothing like the photo doesn't leave a bad review of the AI — they leave a bad review of you. Three rules: brief realistic portions, match your actual plating with a reference photo, and never generate a dish you don't serve. AI is a photographer here, not a menu inventor.")
    ),
    h2("Which shots still need a real camera"),
    p(
      t("Be honest about the boundary. Your signature dish — the one people travel for — deserves a real photographer who can taste the brief. Action shots (tandoor flames, a chef tossing a wok) are hard for AI to render convincingly. And anything where the exact look of the dish is the product promise should be shot, not generated. Use AI for the other eighty percent: sides, beverages, desserts, thali variants, and seasonal specials.")
    ),
    h2("Costing a full menu refresh"),
    p(
      t("Count your dishes, brief each one with the five-part formula, and attach a phone photo of the real plate as reference. At "),
      t("₹29"),
      t(" per shot on "),
      link("Etch", "/create"),
      t(", a 24-dish menu refresh is a predictable per-dish cost with no shoot day, no stylist, and no reshoot fees — remakes are "),
      t("₹5"),
      t(" each. The "),
      link("pricing page", "/pricing"),
      t(" lists every price before you order, and each image passes a human quality check.")
    ),
    h2("From menu shots to promo videos"),
    p(
      t("Once the stills exist, they become video assets: a 5-second clip of your best dishes with text overlay makes a strong Instagram ad. Etch's "),
      link("Video Studio", "/video-studio"),
      t(" adds voice-over, captions, and trim at "),
      t("₹29"),
      t(" per finished video — the stills you already ordered do the visual heavy lifting.")
    ),
    cta(
      "Get menu-ready food shots for ₹29 each",
      "Brief the dish, attach a reference photo, pay with UPI — human-reviewed before delivery.",
      "Create food photography",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
