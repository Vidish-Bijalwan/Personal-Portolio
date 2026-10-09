import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "remake-economics-ai-revisions",
  title: "Remake Economics: Why ₹5 Revisions Beat Reshoots",
  description:
    "Every creative misses sometimes. The math of fixing it: a ₹5 AI remake vs a reshoot's day-rate, studio, and scheduling — and when a remake isn't the answer.",
  date: "2026-10-07",
  category: "Pricing",
  tags: ["remakes", "pricing", "revisions", "AI images", "sellers"],
  readingMinutes: 5,
  answer: [
    t("A remake fixes a missed AI image for a flat "),
    t("₹5"),
    t(" — a fraction of the original order and nothing like a reshoot's cost. On "),
    link("Etch", "/"),
    t(", you describe what to change, pay over UPI, and get the revised image after a human quality check, most orders within 24 hours. Remakes are for direction tweaks — new background, warmer light, fixed detail — not for entirely new concepts, which deserve a fresh order."),
  ],
  sources: [
    { label: "Etch pricing — remake ₹5", url: "https://tryetch.online/pricing" },
    { label: "VEED AI tools — revision and editing workflows", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "How much does a Etch remake cost?",
      a: "A flat ₹5 — listed plainly on the pricing page. You describe what should change about the delivered image, pay over UPI, and receive the revised version after a human quality check. There's no limit per order, but each remake is a separate ₹5 order.",
    },
    {
      q: "What counts as a remake vs a new order?",
      a: "A remake adjusts the existing image: change the background, fix a detail, warm the lighting, reframe the crop. A new order is a new concept: a different product, a different scene, a different campaign. If your revision note rewrites the whole brief, order fresh — it's cleaner and the result is better.",
    },
    {
      q: "How do remakes compare to traditional reshoots?",
      a: "A reshoot means rebooking the photographer, the studio, and the products — day-rates and scheduling measured in days. A ₹5 remake is a revised brief and a day's turnaround. The economics only break down if you remake the same image many times, which usually means the original brief was unclear.",
    },
    {
      q: "How many remakes is too many?",
      a: "Two. If the second remake still misses, the brief — not the generator — is the problem. Rewrite the prompt from scratch with the lessons learned (most “misses” are vague lighting or missing reference photos) and place a fresh order instead of a third remake.",
    },
  ],
  related: [
    "what-is-pay-per-creation-ai",
    "ai-photoshoot-cost-comparison-india",
    "ai-product-photography-india-sellers",
  ],
  body: [
    p(
      t("No creative process hits the brief every time. Photographers reshoot, designers revise, and AI image buyers — "),
      t("remake"),
      t(". The question is what a miss costs you. In traditional photography, a miss costs a reshoot: another day-rate, another studio booking, another round of scheduling. In pay-per-creation AI, a miss costs "),
      t("₹5"),
      t(" and a sentence describing what to change.")
    ),
    h2("The real cost of a miss"),
    table(
      ["", "₹5 remake (Etch)", "Traditional reshoot"],
      [
        ["Price", "₹5, flat", "Day-rate + studio + logistics"],
        ["Turnaround", "Most orders within 24 hours", "Days to weeks of scheduling"],
        ["Effort", "One revised brief", "Rebooking everyone and everything"],
        ["Risk", "Near zero — worst case, another ₹5", "Real money and calendar time"],
      ]
    ),
    h2("What remakes are for"),
    p(
      t("Remakes fix direction, not concept. The image is 80% right and needs a nudge: “warmer light”, “remove the extra chair in the background”, “make the label text match the reference”, “tighter crop on the product”. Describe the delta precisely — the operator revises against your note, and the human quality check verifies the fix landed.")
    ),
    callout("tip",
      t("Write remake notes like a director, not a critic. “The background feels off” gets you a guess; “replace the busy street background with a clean beige studio backdrop, keep everything else identical” gets you the fix in one pass.")
    ),
    h2("What remakes are NOT for"),
    list(
      [t("A new concept. “Actually, let's do the beach version instead of the studio version” is a fresh order, not a remake.")],
      [t("A different product. New SKU, new order — the pricing is per creation for a reason.")],
      [t("Endless iteration. Three remakes deep on one image means the brief was never clear; rewrite it and start fresh.")],
      [t("Fixing a bad reference. If the attached photo was blurry, no remake recovers the detail — reshoot the reference on your phone in daylight.")],
    ),
    h2("The two-remake rule"),
    p(
      t("Here's the discipline that keeps remake economics working: allow yourself two remakes per image. The first fixes the obvious miss. The second refines. If you're ordering a third, stop — the original brief was vague, and another tweak won't save it. Rewrite the prompt with everything you've learned (nine times out of ten: the lighting was underspecified or the reference photo was missing) and place a clean new order at "),
      t("₹15"),
      t(" or "),
      t("₹29"),
      t(".")
    ),
    h2("Remakes and the 4-pack"),
    p(
      t("If you're ordering variants anyway, the "),
      t("₹49"),
      t(" 4-pack changes the remake math further: four related images ordered together, each individually remakeable at "),
      t("₹5"),
      t(". Brief the pack as a set — same product, four backgrounds — and the remakes stay surgical: fix one background without touching the other three. It's the cheapest way to A/B test creative directions when you don't yet know which one converts.")
    ),
    h2("Budgeting for misses honestly"),
    p(
      t("Plan like a professional: assume one in five images needs a remake. On a 20-image catalog at "),
      t("₹29"),
      t(" each, that's four expected remakes at "),
      t("₹5"),
      t(" — a small, predictable line item, not a budget surprise. Compare that with padding a traditional shoot budget for reshoot days, and the "),
      link("pricing page", "/pricing"),
      t(" starts to look like the honest option it is.")
    ),
    h2("Ordering a remake"),
    p(
      t("Open your delivered image, note exactly what should change, and place the remake on "),
      link("Etch's create page", "/create"),
      t(" referencing the original order. Pay "),
      t("₹5"),
      t(" over UPI; the revised image goes through the same human quality check before delivery. Most remakes land within 24 hours — faster than scheduling a reshoot call, let alone the reshoot.")
    ),
    cta(
      "Fix it for ₹5, not a reshoot",
      "Describe what to change, pay with UPI — revised and human-reviewed.",
      "Order a remake",
      "/create?service=single-image"
    ),
  ],
};

export default post;
