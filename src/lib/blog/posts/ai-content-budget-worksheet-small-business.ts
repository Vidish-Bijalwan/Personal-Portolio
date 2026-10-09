import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-content-budget-worksheet-small-business",
  title: "AI Content Budget Worksheet for Small Business",
  description:
    "A practical monthly worksheet for AI content: sample budgets at per-creation prices, a remake contingency line, and when the ₹49 4-pack beats ordering singles.",
  date: "2026-10-09",
  category: "Pricing",
  tags: ["budgeting", "pricing", "small business", "content planning", "sellers"],
  readingMinutes: 6,
  answer: [
    t("Budget one month of AI content as a worksheet: list every image, video and edit the month needs, price each line at a per-creation rate — "),
    t("₹15"),
    t(" singles, "),
    t("₹49"),
    t(" 4-packs, "),
    t("₹19"),
    t(" videos, "),
    t("₹29"),
    t(" Video Studio jobs, "),
    t("₹5"),
    t(" remakes — and total it before you spend anything. A typical seller's month lands in the low hundreds of rupees, with a small remake contingency instead of surprise costs. See the full catalog on "),
    link("Etch's pricing page", "/pricing"),
    t(", then place the month's orders from "),
    link("the create page", "/create?service=pack-4"),
    t("."),
  ],
  sources: [
    { label: "Etch pricing — the per-creation catalog", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — a subscription-priced alternative", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "How much should a small business budget for AI content each month?",
      a: "It depends on output, but the worksheet model makes it concrete: a typical seller ordering a dozen images, two videos, a couple of edits and a few remakes lands in the low hundreds of rupees at per-creation prices. Start with the festival-month example in this post, then trim the quantities to match your catalog size and posting rhythm.",
    },
    {
      q: "Is a subscription cheaper than pay-per-creation for a small business?",
      a: "Only if you create heavily every single month without gaps. A subscription charges you in quiet months too, and caps or credit systems can limit what feels like a fixed fee. Fill the worksheet for three months, total it, and compare that number against the subscription's monthly fee before committing.",
    },
    {
      q: "What if I never use the remake contingency?",
      a: "Then you simply spent less than budgeted — the contingency is a ceiling, not a fee. You only pay ₹5 when you actually order a remake, so an unused contingency line costs you nothing.",
    },
    {
      q: "Can I mix 4-packs and singles in the same month?",
      a: "Yes — that is the point of the worksheet. Use ₹49 4-packs for variants of one product (festive backgrounds, colourways, angles) and ₹15 singles for unrelated items or one-off needs. The worked example below does exactly that.",
    },
  ],
  related: [
    "ai-image-pricing-models-compared",
    "etch-vs-subscription-ai-tools",
    "what-is-pay-per-creation-ai",
  ],
  body: [
    p(
      t("Most small businesses don't have a content problem — they have a content budgeting problem. Every month needs fresh creatives: new listings, festive campaigns, sale announcements, social posts. And every month the cost arrives as a surprise — a subscription renewal here, an upsell there, a watermark-removal fee you didn't see coming. The fix is boring and effective: a monthly worksheet. You list what the month needs, price each line at a known per-creation rate, and see the total before you spend a single rupee.")
    ),
    p(
      t("This works because per-creation pricing turns content into a normal line-item expense, like packaging or courier charges. When every output has a fixed price — "),
      t("₹15"),
      t(" for a single image, "),
      t("₹49"),
      t(" for a 4-pack, "),
      t("₹19"),
      t(" for a video, "),
      t("₹29"),
      t(" for a Video Studio job, "),
      t("₹5"),
      t(" for a remake — budgeting stops being guesswork. Below is the worksheet itself, then two worked examples: a quiet month and a festival month.")
    ),
    h2("The one-month worksheet"),
    p(
      t("Copy this into a spreadsheet or a notebook on the first of every month. Each row is one content need; quantities are yours to adjust. The unit prices are the per-creation catalog — you pay only for what you order, and the total at the bottom is your month's content budget, known in advance.")
    ),
    table(
      ["Content need", "Qty", "Unit price", "Line cost (rupees)"],
      [
        ["Product photos — new listings and social", "8", "₹29", "232"],
        ["Festive 4-pack — one product, four backgrounds", "2", "₹29", "98"],
        ["Short product videos for reels and ads", "2", "₹5", "38"],
        ["Video Studio jobs — captions, trims, text overlays", "2", "₹15", "58"],
        ["Remake contingency — expected misses", "3", "₹5", "15"],
        ["Monthly total", "", "", "441"],
      ]
    ),
    h2("What a typical month actually looks like"),
    p(
      t("Take a handmade jewellery seller in Jaipur posting daily on Instagram and maintaining an Amazon and Flipkart catalog. Her month: eight single images for new SKUs — one clean product shot per new piece. Two festive 4-packs, because Diwali-season listings need the same necklace on four different backgrounds to test which converts. Two short product videos for reels, since video reach outperforms stills on her account. Two Video Studio jobs to add captions and trims to footage she shot on her phone. And three expected remakes, because roughly one image in five misses the brief on the first try — lighting slightly off, a background detail that needs fixing.")
    ),
    p(
      t("Notice what the worksheet does to her decision-making. Without it, she orders reactively: a single here, a video there, and the month ends with a vague sense of overspending. With it, she sees the whole month on one page, spots that the two 4-packs are her best-value lines, and knows her worst-case spend is 441 rupees before she orders anything. Quiet discipline, not deprivation.")
    ),
    h2("Always budget a remake line"),
    p(
      t("The remake contingency is the line most sellers skip — and the one that saves the budget from surprises. AI generation is a creative process, not a vending machine: assume one image in five needs a small correction. Three remakes at "),
      t("₹5"),
      t(" each is a 15-rupee line item. Compare that with the traditional alternative — rebooking a photographer, restaging products, losing days — and the contingency looks less like pessimism and more like professionalism. Unused contingency is simply money you didn't spend; the line costs nothing until you actually order a remake.")
    ),
    callout("tip",
      t("Budget the month on paper, but order in batches. Brief all four images of a 4-pack together in one order so they are treated as a set — same product, consistent lighting and style across all four backgrounds. Batching briefs is also how you keep remakes rare.")
    ),
    h2("When the worksheet pushes you toward the 4-pack"),
    p(
      t("The worksheet makes the pack-vs-single trade-off visible before you order. Four singles at "),
      t("₹15"),
      t(" each cost 60 rupees in total; the "),
      t("₹49"),
      t(" 4-pack delivers four images for noticeably less. So whenever a row shows four or more images of the SAME product — festive variants, background options, colourways, angle tests — the pack row wins. When the images are unrelated products scattered across the month, the singles row is the honest choice. A worksheet that mixes both, like the example above, is usually the right answer — and there is a full breakdown of the trade-off in the 4-pack versus singles guide.")
    ),
    h2("Festival month vs quiet month"),
    p(
      t("Run the worksheet twice a year: once for normal months, once for festival season. A quiet month might be six singles (174), one product video ("),
      t("₹19"),
      t("), and one remake contingency ("),
      t("₹5"),
      t(") — 292 in total. A festival month is the full worksheet above. The point isn't the exact numbers; it's that you decide the spend deliberately, in advance, instead of discovering it at month's end. Small businesses that do this for two or three months start to see their real pattern — and most find their average month is cheaper than they feared, because per-creation pricing has no standing fee eating money in slow weeks.")
    ),
    h2("Why subscriptions don't fit this worksheet"),
    p(
      t("Try putting a monthly subscription on the worksheet and the problem shows up immediately: it is a fixed cost regardless of output. Quiet month with three images? Same fee. Festival month with thirty? Same fee, plus the risk of hitting generation caps or credit limits exactly when you need the tool most. Per-creation totals scale with your actual output, which is what a small business budget should track. If you are comparing, the honest test is on the "),
      link("pricing page", "/pricing"),
      t(": total your worksheet for three months and set it beside the subscription's monthly fee. Most sellers find the worksheet total wins — and the months they create nothing cost nothing.")
    ),
    h2("Turn the worksheet into orders"),
    p(
      t("Once the sheet is filled, place the month's orders on the "),
      link("create page", "/create?service=pack-4"),
      t(" — start with the 4-packs, since briefing them as a set gives the most consistent results, then singles, videos and edits. Check the "),
      link("pricing page", "/pricing"),
      t(" first so you are working from the current catalog; the five prices are the whole model, and the worksheet only works if the numbers you budget are the numbers you pay.")
    ),
    list(
      [t("Step 1 — Fill the worksheet on the 1st of the month: rows for images, packs, videos, edits, and the remake contingency.")],
      [t("Step 2 — Brief 4-packs as sets: one product, four directions, identical product description across all four.")],
      [t("Step 3 — Order singles for unrelated items as they come up through the month.")],
      [t("Step 4 — Keep the remake line for genuine misses; two remakes per image is the sensible limit before rewriting the brief.")],
      [t("Step 5 — On the 30th, compare planned vs actual spend and adjust next month's quantities.")],
    ),
    cta(
      "Budget planned? Place the month's orders",
      "Singles, 4-packs, videos and remakes — every line of your worksheet, ordered per-creation.",
      "Start creating",
      "/create?service=pack-4"
    ),
  ],
};

export default post;
