import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "subscription-vs-pay-per-creation-12-month-model",
  title: "Subscription vs Pay-Per-Creation: A 12-Month Cost Model",
  description:
    "A ₹15 AI image vs a monthly subscription: build a 12-month cost model from your real order volume and find the exact point where each pricing model wins.",
  date: "2026-10-11",
  category: "Pricing",
  tags: ["pricing", "subscription", "pay-per-creation", "cost model", "sellers"],
  readingMinutes: 6,
  answer: [
    t("The honest answer is a formula, not a verdict: take your monthly subscription price, divide it by the number of images or videos you actually used last month, and compare that real per-unit cost against flat pay-per-creation prices — "),
    t("₹15"),
    t(" for a single AI image, "),
    t("₹49"),
    t(" for a 4-pack, "),
    t("₹19"),
    t(" for an AI video clip, "),
    t("₹29"),
    t(" for a Video Studio job. Most small sellers land between 8 and 25 images a month, where subscriptions cost two to five times more per unit. Run the worksheet below with your own numbers, order a test image from "),
    link("the create page", "/create?service=product-photo"),
    t(" to anchor your comparison, and check "),
    link("the pricing page", "/pricing"),
    t(" for the flat catalog."),
  ],
  sources: [
    { label: "Etch pricing — ₹15 single, ₹49 4-pack, ₹29 Video Studio", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — a subscription-priced alternative for comparison", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "At what monthly volume does a subscription beat pay-per-creation?",
      a: "It depends entirely on the subscription's price, so do the division with your own numbers. If your subscription costs 500 rupees a month and you used 10 images, your real cost is 50 rupees per image — more than triple a ₹15 flat order. Subscriptions typically start winning around 40–60+ units a month, but only if your usage stays that high for the whole billing cycle. Run the worksheet in this post with your last three months of real usage.",
    },
    {
      q: "Don't subscriptions include unlimited generations?",
      a: "Read the fine print: most “unlimited” plans cap something — generations per day, priority queue, commercial-use rights, or resolution. The cap you don't notice in month one becomes the bottleneck in month six. A flat per-order price has no hidden throttle: ₹15 buys one finished image, every time, with a human quality check before delivery.",
    },
    {
      q: "What about months when I order nothing?",
      a: "That's where subscriptions quietly lose. A 500 rupees/month plan costs 6,000 rupees a year whether you use it or not — including the three months your store was seasonal or you were busy with fulfilment. Pay-per-creation costs zero in a dead month. If your content needs are spiky rather than steady, the 12-month model almost always favours pay-per-order.",
    },
    {
      q: "Is mixing both models ever sensible?",
      a: "Yes — a base subscription for your steady background needs (daily social posts) plus pay-per-creation for campaigns and experiments avoids the worst of both. But audit it quarterly: the moment your “steady background” volume drops, the subscription becomes a standing charge for nothing. Most small Indian sellers find pure pay-per-creation cheaper once they stop guessing and start measuring.",
    },
  ],
  related: [
    "etch-vs-subscription-ai-tools",
    "real-cost-of-free-ai-tools",
    "ai-content-budget-worksheet-small-business",
  ],
  body: [
    p(
      t("Every AI tool pricing page wants you to compare headline prices — “unlimited everything, one low monthly price” versus a per-image fee. That comparison is rigged, because you don't buy headline prices. You buy units of finished content across a year, with quiet months, campaign spikes, and remakes. The only honest comparison is a 12-month cost model built on your real usage. Here it is, step by step, with worked examples you can copy into a spreadsheet.")
    ),
    h2("Step 1: find your real per-unit cost"),
    p(
      t("Forget what the subscription advertises. Open your billing page and find what you actually paid last month. Then count what you actually used — finished images, finished videos, jobs you kept. Divide price by units. That number is your real per-unit cost, and it is almost always higher than you think, because it quietly includes every image you generated and never published, every experiment, and every month you barely logged in.")
    ),
    callout("tip",
      t("The three-month rule: average your usage over the last three months, not the last one. A Diwali month makes subscriptions look brilliant; February makes them look terrible. The average tells the truth.")
    ),
    h2("Step 2: the worked examples (illustrative)"),
    p(
      t("These examples use illustrative subscription figures so you can see the method — plug in your own subscription price and the flat catalog prices, which are fixed: "),
      t("₹15"),
      t(" per single AI image, "),
      t("₹49"),
      t(" for a 4-pack, "),
      t("₹19"),
      t(" per AI video clip, "),
      t("₹29"),
      t(" per Video Studio job, "),
      t("₹5"),
      t(" per remake.")
    ),
    table(
      ["Buyer profile", "Monthly usage", "Subscription (500 rupees/mo, illustrative)", "Pay-per-creation (Etch catalog)"],
      [
        ["Occasional seller", "8 images", "500 rupees → 62.50 rupees per image", "8 × ₹15 = 120 rupees"],
        ["Steady seller", "20 images + 2 video jobs", "500 rupees → 22.73 rupees per unit", "(20 × ₹15) + (2 × ₹29) = 358 rupees"],
        ["Campaign month", "40 images + 5 videos", "500 rupees → 11.11 rupees per unit", "(40 × ₹15) + (5 × ₹29) = 745 rupees"],
        ["Heavy studio", "80 images", "500 rupees → 6.25 rupees per image", "80 × ₹15 = 1,200 rupees (or 20 × ₹49 4-packs = 980 rupees)"],
      ]
    ),
    p(
      t("Three things jump out. First, the occasional seller overpays by roughly four times on a subscription — 500 rupees for what costs 120 rupees flat. Second, the steady seller still loses: 500 rupees beats 358 rupees. Third, the subscription only pulls ahead at genuinely heavy volume — 80 images a month, every month, with no off-season. Most small sellers live in the first two rows, not the fourth, which is exactly why subscriptions feel expensive even when the headline price looks small.")
    ),
    h2("What the 12-month view catches that monthly misses"),
    list(
      [t("Dead months. A 500 rupees/month plan costs 6,000 rupees a year even in months you order nothing. Pay-per-creation costs nothing when you're not ordering.")],
      [t("Campaign spikes. One festive month at 60 images makes any model look cheap per unit — but the subscription charged you the same in the quiet months around it.")],
      [t("Auto-renewal drift. The month you meant to cancel and didn't is a full month's charge for zero units — a line item pay-per-creation can never produce.")],
      [t("Feature bloat you rent. Subscription tiers bundle features you don't use; the per-unit math silently absorbs them.")],
      [t("Remakes and retries. On flat pricing, a ₹5 remake fixes one bad image. On subscriptions, retries are “free” but each one burns queue time and, on capped plans, your allowance.")],
    ),
    h2("The honest case FOR subscriptions"),
    p(
      t("This model is not a hit piece. Subscriptions genuinely win for one profile: high, consistent, predictable volume. If you are a studio pushing 50+ finished assets every single month with no seasonal dip, the per-unit math favours the plan — especially plans priced for teams. The mistake is buying the plan for the studio you imagine becoming instead of the seller you are today. Start flat, measure for three months, and only subscribe when your own numbers say the plan wins.")
    ),
    h2("Build your own 12-month model in ten minutes"),
    p(
      t("Open a spreadsheet. Column A: the last 12 months (or as many as you have). Column B: units of content you actually finished each month — images and video jobs. Column C: what you paid that month (subscription charges plus any one-off orders). Column D: C divided by B — your real per-unit cost that month. Now add a comparison column E: what the same month's units would have cost flat — images × ₹15 (or 4-packs × ₹49 where variants cluster), video jobs × ₹29, remakes × ₹5. Sum C and E across the year. The smaller total is your answer, and it's built from your data, not a pricing page's promises.")
    ),
    h2("Putting it into practice"),
    p(
      t("The cheapest way to calibrate the model is to run one real month flat. Order your normal volume one piece at a time — a single product photo from "),
      link("the create page", "/create?service=product-photo"),
      t(", a 4-pack for your variant sets, a Video Studio job for your reel edits — and total the bill. Compare it against your subscription receipt for the same month. Most sellers find the flat month 30–60% cheaper, and the receipts don't lie. The full catalog for your worksheet is on "),
      link("the pricing page", "/pricing"),
      t(".")
    ),
    cta(
      "Run one month flat and compare",
      "Order your normal monthly volume piece by piece — singles, 4-packs, Video Studio — and total the bill against your subscription receipt.",
      "Try the create page",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
