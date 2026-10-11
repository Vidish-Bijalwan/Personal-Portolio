import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "phone-reference-photos-ai-briefs",
  title: "Shooting Reference Photos on Your Phone for Better AI Briefs",
  description:
    "The quality of your AI product photo is decided before generation — by your reference photos. How to shoot phone references that make the brief unambiguous.",
  date: "2026-10-11",
  category: "Guides",
  tags: ["reference photos", "briefing", "product photography", "phone photography", "sellers"],
  readingMinutes: 6,
  answer: [
    t("AI generation is only as good as the brief, and the brief is only as good as the reference photos. Shoot your product on your phone in soft daylight, straight-on and at 45 degrees plus one top-down, include a scale reference like a coin, and photograph the label straight and large if text matters. Clean, honest references mean the operator has nothing to guess — and your "),
    t("₹15"),
    t(" order comes back right the first time. Submit references on "),
    link("the create page", "/create?service=product-photo"),
    t(" and check the flat catalog on "),
    link("the pricing page", "/pricing"),
    t("."),
  ],
  sources: [
    { label: "Etch pricing — ₹15 single, ₹49 4-pack", url: "https://tryetch.online/pricing" },
    { label: "Veed — AI video tools for creators", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "Do I need a good phone camera for reference photos?",
      a: "No — any phone from the last five years is fine. Reference photos aren't the final image; they're information. What matters is honest light, sharp focus, and true colour, not megapixels. A mid-range phone in daylight beats a flagship in a yellow-lit room every time.",
    },
    {
      q: "How many reference photos should I attach to a brief?",
      a: "Three to five: straight-on front, 45-degree angle, top-down, one close-up of the important detail (label, texture, clasp), and one scale shot with a coin or ruler. More than six usually adds noise — the operator needs clarity, not a photoshoot. One perfect set beats twenty casual snaps.",
    },
    {
      q: "Should I edit or filter my reference photos?",
      a: "Don't. No filters, no beauty mode, no heavy contrast — every edit is misinformation about your product's real colour and shape. The only acceptable edits are cropping and straightening. If the colour is wrong in the reference, it will be wrong in the generated image, and no brief text fully corrects it.",
    },
    {
      q: "What if my product is reflective or transparent?",
      a: "Shoot it against a plain dark background in soft, indirect light — direct light blows out reflective surfaces into white blobs with no recoverable detail. For glass or clear packaging, a dark background reveals the shape; a white background makes it vanish. Mention the material explicitly in the brief (“glossy black plastic,” “frosted glass”) so it's briefed as a material, not a colour.",
    },
  ],
  related: [
    "phone-snap-to-listing-ready-ai-pipeline",
    "prompt-engineering-5-part-formula",
    "background-removal-vs-ai-backgrounds",
  ],
  body: [
    p(
      t("Here's the uncomfortable truth about AI product photos: the generation step gets all the attention, but the reference photos decide the outcome. A vague, yellow-lit, blurry phone snap forces the operator to guess your product's shape, colour, and details — and guesses are where artifacts and “that's not my product” come from. Ten minutes of deliberate phone photography is the highest-ROI step in the entire pipeline. Here's exactly how to do it.")
    ),
    h2("Light: the one thing that matters most"),
    p(
      t("Shoot in soft daylight — near a window, never in direct sun, never under warm indoor bulbs. Direct sun creates harsh shadows and blown highlights that hide detail; indoor tungsten light paints everything yellow and lies about colour. The test: hold a white piece of paper next to your product. If the paper looks white in your photo, your light is honest. If it looks cream or blue, move. Overcast daylight is the best free studio in existence.")
    ),
    h2("The five-shot reference set"),
    table(
      ["Shot", "How", "What it tells the operator"],
      [
        ["Straight-on front", "Phone at product's mid-height, level", "True proportions and layout"],
        ["45-degree angle", "Same height, stepped to the side", "Depth, shape, how surfaces meet"],
        ["Top-down", "Phone parallel above, product centered", "Footprint and arrangement"],
        ["Detail close-up", "Tap to focus on the label / texture / clasp", "What must be exact"],
        ["Scale shot", "Coin or ruler beside the product", "Real size — kills all guessing"],
      ]
    ),
    p(
      t("Five shots, two minutes each, and the brief becomes unambiguous: proportions from the front, depth from the angle, exact details from the close-up, true size from the scale shot. Attach all five to your order on "),
      link("the create page", "/create?service=product-photo"),
      t(" — a "),
      t("₹15"),
      t(" order with complete references comes back right far more often than a "),
      t("₹15"),
      t(" order with one blurry snap and a paragraph of hopeful description.")
    ),
    h2("The don'ts that ruin references"),
    list(
      [t("No filters, no beauty mode, no “vivid” colour boost — every edit lies about the product's true appearance.")],
      [t("No cluttered backgrounds — a busy tablecloth becomes visual noise the operator must mentally erase.")],
      [t("No motion blur — brace the phone on a stack of books; tap to focus and wait half a second before shooting.")],
      [t("No mixed lighting — window light plus tubelight creates two colour temperatures in one photo; pick one.")],
      [t("Don't hide flaws — a scratch visible in the reference can be briefed around; a scratch discovered later looks like a generation error.")],
    ),
    callout("tip",
      t("The colour-card trick: photograph a coin or a standard object with known colour (a ₹10 coin works) in the same light as your product. It gives the operator — and you — an objective colour anchor if the product's shade is ever disputed.")
    ),
    h2("Special cases: reflective, transparent, tiny"),
    p(
      t("Glossy and reflective products need indirect light and a dark background — you're photographing reflections, so control what reflects. Transparent products (glass, clear packaging) need a dark background to read as shapes at all. Tiny products (jewellery, accessories) need the macro approach: get close, tap to focus, and shoot the scale reference — without it, a 2cm earring and a 6cm pendant brief identically. Name the material in the brief text: “glossy,” “matte,” “frosted glass” are materials, and materials generate differently from colours.")
    ),
    h2("From references to finished photos"),
    p(
      t("Good references compress the whole pipeline: fewer clarification rounds, fewer remakes, faster delivery. Order the set as "),
      t("₹15"),
      t(" singles for unrelated products, or batch one product's variant needs as a "),
      t("₹49"),
      t(" 4-pack — the same five references serve all four directions. The flat catalog is on "),
      link("the pricing page", "/pricing"),
      t(". Ten minutes with your phone in daylight is the cheapest quality upgrade in AI product photography, and it's entirely in your hands.")
    ),
    cta(
      "Put your references to work",
      "Attach your five-shot reference set to a ₹15 order and get back a finished, human-checked product photo.",
      "Create a product photo order",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
