import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "credit-packs-vs-flat-pricing",
  title: "Credit Packs vs Flat Pricing: Which Wastes Less Money?",
  description:
    "Credit packs promise discounts but add expiry dates, conversion math, and stranded balances. Flat per-order pricing wastes nothing — an honest comparison.",
  date: "2026-10-11",
  category: "Pricing",
  tags: ["pricing", "credit packs", "pay-per-creation", "cost", "sellers"],
  readingMinutes: 6,
  answer: [
    t("Credit packs sell you currency, not content: you buy 100 credits, learn that an image costs 7 credits and a video costs 40, and watch the remainder expire or strand. Flat pricing sells you finished units — "),
    t("₹15"),
    t(" per image, "),
    t("₹49"),
    t(" per 4-pack, "),
    t("₹19"),
    t(" per AI video, "),
    t("₹29"),
    t(" per Video Studio job, "),
    t("₹5"),
    t(" per remake — with no conversion math, no expiry, and no stranded balance. The pack “discount” only beats flat pricing if you use every credit before expiry, which almost nobody does. Compare on "),
    link("the pricing page", "/pricing"),
    t(" and test with a single order on "),
    link("the create page", "/create?service=product-photo"),
    t("."),
  ],
  sources: [
    { label: "Etch pricing — the flat catalog: ₹15 / ₹49 / ₹29 / ₹5", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — a credit/subscription-priced alternative", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "Aren't credit packs cheaper per image than flat pricing?",
      a: "On paper, sometimes — a 100-credit pack can imply a lower per-image figure than ₹15. In practice, the realized price includes the credits you never spend: the odd 13 credits stranded below any useful purchase, the pack that expired during your slow month. Divide what you actually paid by what you actually used (the same real-per-unit math as our subscription guide) and the pack discount usually evaporates.",
    },
    {
      q: "What's the expiry trap exactly?",
      a: "Many credit packs expire — 30, 90, or 365 days. Expiry converts your purchase from an asset into a deadline: you either generate content you don't need to “use up” credits, or you forfeit money. Flat per-order pricing has no expiry because there's nothing to expire — you buy one finished image, you receive one finished image.",
    },
    {
      q: "Why do companies prefer selling credits over flat prices?",
      a: "Because breakage is profitable. Every expired credit and every stranded sub-threshold balance is revenue with zero delivery cost — the same economics as gift cards. Flat pricing removes breakage entirely, which is precisely why it's rarer: it only earns money by delivering things customers want.",
    },
    {
      q: "Is there any buyer who should choose credit packs?",
      a: "High-volume, predictable buyers who will genuinely exhaust the pack before expiry — studios with a steady pipeline who've measured their burn rate. If that's you, do the division with your real numbers and buy the pack with open eyes. For everyone with spiky, seasonal, or experimental usage, flat pricing wastes less.",
    },
  ],
  related: [
    "real-cost-of-free-ai-tools",
    "ai-image-pricing-models-compared",
    "ai-4-pack-vs-single-orders",
  ],
  body: [
    p(
      t("Credit packs feel like a deal the way bulk anything feels like a deal — until you do the accounting. The pitch is always the same: buy 100 credits now, pay less per generation. What's buried in the pitch is that you're no longer buying content; you're buying a private currency with an exchange rate, a minimum purchase, and often an expiry date. Here's how to compare that honestly against flat per-order pricing.")
    ),
    h2("What you're actually buying in each model"),
    table(
      ["", "Credit pack", "Flat per-order (Etch)"],
      [
        ["Unit of purchase", "Credits (a private currency)", "Finished assets"],
        ["Price of one image", "“7 credits” — do the division yourself", "₹15, printed on the page"],
        ["Price of one video job", "“40 credits” — same homework", "₹29, printed on the page"],
        ["Leftover balance", "Stranded below the next useful purchase", "Impossible — there is no balance"],
        ["Expiry", "Common: 30–365 days", "Nothing to expire"],
        ["Cost of a dead month", "Your credits tick toward expiry", "Zero"],
      ]
    ),
    h2("The three ways packs quietly cost more"),
    list(
      [t("Stranded balances. Packs are sized so the remainder rarely buys anything useful — 13 credits left when everything costs 20+. That remainder is money you paid for nothing, and it repeats every pack.")],
      [t("Expiry pressure. A deadline on your purchase manufactures demand you don't have: generating filler content to “use up” credits, or forfeiting the balance. Either way, you paid for value you didn't want.")],
      [t("Conversion fog. When an image costs “7 credits,” price comparison requires arithmetic most buyers never do — which is the point. Flat ₹15 needs no calculator, so it gets compared honestly.")],
    ),
    h2("The honest math: realized price per unit"),
    p(
      t("Take any credit pack you've bought. Divide the rupees you paid by the finished assets you actually used before expiry — not generated, used. That realized price is the only number that matters, and for most small buyers it lands well above the pack's advertised per-unit figure. Now compare it against flat: "),
      t("₹15"),
      t(" per single image, "),
      t("₹49"),
      t(" per 4-pack of variants, "),
      t("₹19"),
      t(" per AI video clip, "),
      t("₹29"),
      t(" per Video Studio job, "),
      t("₹5"),
      t(" per remake. No division required — the price on the page is the price of the thing.")
    ),
    callout("tip",
      t("The gift-card test: if a pricing model would be illegal as a gift card in your country (expiry, fees, stranded balances), ask why it's acceptable as software pricing. The economics are identical — breakage as a revenue line.")
    ),
    h2("When packs genuinely win"),
    p(
      t("This isn't a universal verdict. If you run a studio with a measured, steady burn rate — you know you'll consume 200 images a quarter, every quarter — a well-priced pack with a long expiry is a legitimate bulk discount, and you should take it. The honest buyer in that position has done the realized-price division and confirmed the pack wins on their numbers. Everyone else — spiky sellers, seasonal campaigns, experimenters — pays the breakage tax.")
    ),
    h2("Try the flat month"),
    p(
      t("The cheapest experiment in pricing is one month of flat ordering: buy exactly what you need, one "),
      t("₹15"),
      t(" image or "),
      t("₹49"),
      t(" 4-pack at a time, from "),
      link("the create page", "/create?service=product-photo"),
      t(", and total the month. Compare it against your last credit-pack cycle's realized price per unit. Most small sellers discover the “discount” was costing them money — and the full flat catalog is on "),
      link("the pricing page", "/pricing"),
      t(" with nothing to convert and nothing to expire.")
    ),
    cta(
      "One flat month, honest numbers",
      "Order exactly what you need — singles, 4-packs, Video Studio — and compare the total against your last credit pack.",
      "Create your first order",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
