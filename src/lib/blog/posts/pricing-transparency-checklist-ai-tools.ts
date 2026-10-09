import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "pricing-transparency-checklist-ai-tools",
  title: "Pricing Transparency Checklist: 7 Questions to Ask AI Tools",
  description:
    "Per-output prices or credit mazes? Watermarks on paid plans? Revision costs? Seven concrete questions to ask any AI image or video tool before you pay one rupee.",
  date: "2026-10-09",
  category: "Pricing",
  tags: ["pricing", "transparency", "checklist", "buying guide", "creators"],
  readingMinutes: 6,
  answer: [
    t("Before paying any AI image or video tool, ask seven questions: what is the per-output price in rupees, is the paid tier watermark-free, what does a revision cost, do you get commercial rights, what does the subscription renew at, is there a human quality review, and what is the refund or remake policy. If a tool can't answer all seven plainly, its pricing isn't transparent. Etch's answers are on the "),
    link("pricing page", "/pricing"),
    t(" — "),
    t("₹15"),
    t(" singles, "),
    t("₹49"),
    t(" 4-packs, "),
    t("₹19"),
    t(" videos, "),
    t("₹29"),
    t(" Video Studio jobs, "),
    t("₹5"),
    t(" remakes — and you can order from "),
    link("the create page", "/create?service=single-image"),
    t("."),
  ],
  sources: [
    { label: "Etch pricing — the five-price catalog", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — a subscription-priced alternative", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "Why do so many AI tools use credits instead of rupee prices?",
      a: "Credits let a tool show one simple number while the real per-output cost hides behind conversion math — and credit packs expire, break oddly across features, or price different outputs differently. A transparent tool tells you the per-output price in rupees, the way a menu lists prices per dish instead of selling you 'food credits'.",
    },
    {
      q: "Should I worry about watermarks on paid plans?",
      a: "Yes — some tools watermark even paid outputs on lower tiers, or charge extra for clean downloads. Before paying, confirm the paid tier delivers watermark-free files. On Etch, the split is explicit: the free tier is watermarked previews, paid orders are delivered clean.",
    },
    {
      q: "Do I own the commercial rights to AI images I pay for?",
      a: "It varies by tool, which is exactly why it's on the checklist. Some services grant full commercial use on paid tiers; others restrict it or stay vague. Read the terms for the specific tier you're buying — 'paid' and 'commercially usable' are not automatically the same thing.",
    },
    {
      q: "What if the generated result is bad — do I get my money back?",
      a: "Most AI tools don't refund generations, because the compute was already spent. The honest alternatives are a cheap, fixed revision price or a human review that catches misses before delivery. Etch does both: ₹5 remakes and a human quality check on every paid order.",
    },
  ],
  related: [
    "ai-image-pricing-models-compared",
    "what-is-pay-per-creation-ai",
    "what-happens-after-you-pay",
  ],
  body: [
    p(
      t("AI tool pricing has a transparency problem. Credit packs, tiered feature locks, renewal rates buried in fine print, revision costs discovered after the first miss — the industry has learned every trick of the mobile-game store. This checklist is your defense: seven concrete questions to ask any AI image or video tool before you pay. A trustworthy tool answers all seven in plain language. A tool that dodges them is telling you something too.")
    ),
    h2("1. What is the per-output price, in rupees?"),
    p(
      t("The single most revealing question. Many tools answer in credits, tokens, or “generations” — units that obscure the real cost until you've already bought a pack. Demand the conversion: how many rupees does one finished image cost, one finished video? If the answer requires a calculator and a help-center article, the pricing is designed to confuse. A transparent catalog looks like Etch's: "),
      t("₹15"),
      t(" for a single image, "),
      t("₹49"),
      t(" for a 4-pack, "),
      t("₹19"),
      t(" for a video — prices per output, in rupees, on the "),
      link("pricing page", "/pricing"),
      t(".")
    ),
    h2("2. Is the paid tier watermark-free?"),
    p(
      t("It sounds absurd to ask — you paid, of course the watermark is gone — but some tools watermark lower paid tiers or charge extra for clean downloads. A watermarked paid output is a preview you were charged for. Confirm before paying that the tier you're buying delivers clean files, and check what the free tier's watermark looks like so you can use it honestly for what it is: a style test, not a deliverable.")
    ),
    h2("3. What does a revision cost?"),
    p(
      t("AI generation misses sometimes — wrong background, off lighting, a detail that needs fixing. The revision policy is where budgets actually break: some tools charge full price for every regeneration, turning one miss into double the cost. Ask for the revision price up front. A flat, cheap revision fee — Etch's is "),
      t("₹5"),
      t(" per remake — means misses are a predictable line item instead of a budget surprise. If the tool has no revision path at all, every miss is a full-price reorder.")
    ),
    h2("4. Do I get commercial rights?"),
    p(
      t("“I paid for it” and “I can use it in my ads” are different statements. Some tools restrict commercial use to higher tiers; others stay vague in their terms and leave you exposed. If your images will appear on product listings, paid ads, or client work, get the commercial-use answer in writing for the exact tier you're buying. Vagueness here is a red flag — rights should be a sentence, not a legal scavenger hunt.")
    ),
    h2("5. What does the subscription renew at — and what happens if I cancel?"),
    p(
      t("Introductory pricing, annual-billing discounts shown as monthly rates, and credits that expire when you cancel: subscription renewals are where the real price hides. Ask three sub-questions: what is the renewal price (not the intro price), do unused credits or generations roll over, and can you still download your past work after cancelling? A tool confident in its value answers all three without making you hunt.")
    ),
    h2("6. Is there a human review before delivery?"),
    p(
      t("Fully automated pipelines ship whatever the model produces — including the obvious misses a human would catch in seconds. A human quality check before delivery is the difference between “AI-generated” and “AI-assisted professional work.” Ask whether anyone looks at the output before it reaches you, and what happens when the reviewer spots a problem. On Etch, every paid order passes a human review, which is part of why the remake rate stays low.")
    ),
    h2("7. What is the refund or remake policy?"),
    p(
      t("Most AI tools don't refund generations — the compute is spent the moment you click. That's fair, but it makes the fallback policy critical. The honest versions: a cheap fixed-price remake path, a re-generation allowance for clear misses, or a human review that prevents most misses from reaching you. “No refunds, no revisions, no review” means you absorb 100% of the model's failure rate. Know that before you pay, not after your third bad render.")
    ),
    callout("tip",
      t("Run this checklist as a table when comparing two or three tools: one row per question, one column per tool. The tool with the most plain-language answers usually wins — and the exercise takes ten minutes, which is less time than disputing one surprise charge.")
    ),
    h2("Etch's answers to its own checklist"),
    p(
      t("Fair is fair — here's the checklist applied to Etch itself. Per-output prices in rupees: "),
      t("₹15"),
      t(" single, "),
      t("₹49"),
      t(" 4-pack, "),
      t("₹19"),
      t(" video, "),
      t("₹29"),
      t(" Video Studio job, "),
      t("₹5"),
      t(" remake — all on the "),
      link("pricing page", "/pricing"),
      t(". Paid outputs are delivered clean and watermark-free; the free tier is explicitly watermarked previews. Revisions are a flat "),
      t("₹5"),
      t(". There is no subscription, so there is no renewal rate and nothing to cancel. Every paid order passes a human quality check before delivery. Order from the "),
      link("create page", "/create?service=single-image"),
      t(" and pay per creation over UPI.")
    ),
    cta(
      "A pricing page that answers all seven",
      "Five prices, no credits, no renewal traps — check the catalog, then order per creation.",
      "See transparent pricing",
      "/pricing"
    ),
  ],
};

export default post;
