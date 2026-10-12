import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "pay-per-creation-vs-credit-packs-expiry",
  title: "Pay-Per-Creation vs Credit Packs: The Expiry Trap Explained",
  description: "Credit packs can expire before you use them, stranding money you already paid. Pay-per-creation charges only for finished work — here is the trap in detail.",
  date: "2026-10-12",
  category: "Comparisons",
  tags: ["pricing", "credit packs", "comparison", "pay-per-creation", "expiry"],
  readingMinutes: 6,
  answer: [
    t("The expiry trap is simple: you pay upfront for credits, the credits carry a deadline, and any balance left when the deadline passes is money spent on nothing. Pay-per-creation avoids the trap by charging for a finished asset at the moment you order it — ₹15 for a single image, ₹49 for a 4-pack, ₹19 for a clip, ₹29 for Video Studio, and ₹5 for a remake — with no balance to strand. Compare the flat catalog on "),
    link("the create page", "/create?service=product-photo"),
    t(" and "),
    link("the pricing page", "/pricing"),
    t("."),
  ],
  sources: [
    { label: "Etch pricing — flat catalog, no subscription", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — a subscription and credit alternative", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "What happens to unused credits when a pack expires?",
      a: "On packs with an expiry rule, the unused balance is usually lost, which means you paid for assets you never received. The exact rule depends on the seller's terms, so check the expiry date, any grace period, and whether balances roll over before buying. That loss is the core of the expiry trap this article explains.",
    },
    {
      q: "Why do sellers offer credit packs if they disadvantage buyers?",
      a: "Packs bring cash forward and create breakage from expired and stranded credits, both of which help the seller. That does not make every pack dishonest, but it does mean the buyer should calculate the realised price from their own usage instead of trusting the advertised per-credit figure on the sales page.",
    },
    {
      q: "Is pay-per-creation always cheaper than a credit pack?",
      a: "Not always. A high-volume buyer who fully uses a well-priced pack before expiry can pay less per asset. Pay-per-creation is usually cheaper in realised terms for irregular, seasonal, or experimental usage, because nothing expires or strands. Compare using your own consumption record rather than choosing by slogan.",
    },
    {
      q: "How do I calculate my realised price from a credit pack?",
      a: "Divide the total rupees you paid for the pack by the number of finished assets from it that you actually used before expiry. Compare that figure with the flat price for the same asset, such as ₹15 for a single image or ₹49 for a 4-pack. If the realised figure is higher, the pack discount was not real for your usage pattern.",
    },
  ],
  related: ["credit-packs-vs-flat-pricing", "ai-image-pricing-models-compared", "subscription-vs-pay-per-creation-12-month-model"],
  body: [
    h2("How the trap is built"),
    p(t("A credit pack separates payment from delivery. You hand over money today for units you may use later, under rules the seller controls: conversion rates for different asset types, minimum balances, and an expiry window. Each rule is understandable alone, but together they create breakage, the industry term for paid value that is never redeemed. Breakage is not an accident in this model; it is a predictable source of profit, because a meaningful share of buyers will always have a slow month, a changed plan, or a leftover balance too small to spend.")),
    p(t("Expiry is the sharpest rule because it turns time into pressure. As the deadline approaches, a buyer must either invent work to consume credits or accept the loss. Invented work produces low-value content that clutters an account and consumes checking and publishing time, while accepted loss means the advertised per-unit price was never the real price. Both outcomes transfer value from the buyer to the seller without a finished, useful asset changing hands. That is the trap, and it operates even when every term was technically disclosed in small print.")),
    h2("The real price is the realised price"),
    p(t("To compare honestly, divide what you paid by the useful assets you actually received and used before expiry. That realised price is the only figure that belongs beside a flat per-order price. A pack that looked cheaper on the sales page often becomes more expensive under this division, especially for sellers with seasonal demand, creators with irregular posting, and anyone experimenting with a new format. Flat pricing has no such gap between advertised and realised price: the ₹15 on the page is the ₹15 for the finished single image, whether you order in a busy month or a quiet one.")),
    p(t("Stranded balances repeat the loss at a smaller scale. If a pack leaves a remainder below the cost of the next useful asset, that remainder is effectively a tip you never chose to give, and it can recur with every pack you buy. Some buyers respond by buying a larger pack to unlock the remainder, which deepens the same cycle. Pay-per-creation removes the remainder problem structurally, because there is no account balance at all: each order is complete in itself, paid by UPI for that finished work, with nothing left over to chase.")),
    h2("Who credit packs can still suit"),
    p(t("An honest comparison admits the exception. A buyer with high, steady, measured volume, who will certainly consume a pack well before expiry, can benefit from a genuine bulk discount. The key words are measured and certain: that buyer knows their monthly consumption from records, not hope, and has checked the realised price against flat alternatives. Studios and agencies with a continuous pipeline sometimes meet that test. Most small sellers and solo creators, whose demand arrives in festival peaks, launch bursts, and quiet gaps, do not, and the pack seller is counting on exactly that pattern.")),
    p(t("Before buying any pack, ask four questions in writing. When do the credits expire? What does each asset I actually need cost in credits? What happens to a balance below the next purchase? And what was my realised price on the last pack I bought? If a seller cannot answer plainly, or if your own last answer is uncomfortable, the flat model is the safer default. You can always move to a pack later with evidence in hand; unspending an expired balance is not an option in the other direction.")),
    h2("A calmer way to buy creative work"),
    p(t("Pay-per-creation aligns payment with value in the simplest possible way: order one finished asset, check it, use it, and order the next when a real need appears. That rhythm suits Indian small businesses whose cash flow is practical and whose demand is seasonal, because a quiet month costs nothing and a busy month scales one order at a time. There is no deadline manufacturing urgency, no conversion table to memorise, and no balance to protect. The discipline shifts from managing credits to managing briefs, which is where quality is actually created.")),
    p(t("Try a direct comparison for one month. Record every flat order, its purpose, and whether the asset was used, then compare the total and the realised price with your most recent credit-pack cycle. Keep the record brutally simple, because a comparison you maintain beats a sophisticated model you abandon. For most irregular buyers, the result settles the argument more convincingly than any sales page can, in either direction, and that evidence becomes the basis for a pricing habit that wastes less money every month that follows.")),
    h2("A short checklist before you order"),
    list(
      [t("Name the destination first — listing, catalogue, feed, or video — so the format matches the job.")],
      [t("Write the brief in concrete details: subject, material or topic, angle, light, and what must not appear.")],
      [t("Check the delivered asset at full size, especially text, hands, colour, and product edges.")],
      [t("Record what worked so the next brief reuses a proven template instead of starting from zero.")],
    ),
    callout("tip", t("Keep the first order small and specific. One proven template or format is worth more than a large, vague batch, because it teaches you exactly what to repeat and what to fix before you spend on volume.")),
    p(
      t("Ready to apply this? Start with one clear order on "),
      link("the create page", "/create?service=product-photo"),
      t(", check the result at full size, and compare the flat price on "),
      link("the pricing page", "/pricing"),
      t(" before you commit to a larger batch."),
    ),
    cta("Pay for finished work, not deadlines", "Order one asset at a flat price, use it, and let a quiet month cost you nothing.", "Create a single order", "/create?service=single-image"),
  ],
};

export default post;
