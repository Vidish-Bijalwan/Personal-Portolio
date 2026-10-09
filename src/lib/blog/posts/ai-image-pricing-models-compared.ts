import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-image-pricing-models-compared",
  title: "AI Image Pricing Models: Per-Image vs Credits vs Plans",
  description:
    "Per-image, credit packs, subscriptions — AI image pricing is a maze. What each model really costs a small business, and 7 questions to ask before you pay.",
  date: "2026-10-07",
  category: "Pricing",
  tags: ["pricing", "comparison", "business", "AI images", "guide"],
  readingMinutes: 6,
  answer: [
    t("AI image tools price three ways: per-image (pay for each finished image), credit packs (prepaid tokens with expiry and waste), and subscriptions (monthly fee whether you create or not). For small businesses with uneven creative needs, per-image pricing wastes the least — you pay only when you order. On "),
    link("Etch", "/"),
    t(", pricing is per-image and public: "),
    t("₹15"),
    t(" a single image, "),
    t("₹29"),
    t(" a product photo, "),
    t("₹49"),
    t(" a 4-pack, "),
    t("₹5"),
    t(" a remake — no credits, no subscription, no expiry."),
  ],
  sources: [
    { label: "Etch pricing — full catalog", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — credit-based AI pricing", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "What is per-image AI pricing?",
      a: "You pay a fixed price for each finished image — ₹15 for a single image or ₹29 for a product photo on Etch — and nothing otherwise. No monthly fee, no prepaid balance, no expiring credits. It maps exactly to your actual usage: ten images cost ten times the per-image price.",
    },
    {
      q: "Why do credit packs waste money?",
      a: "Credits are bought in bundles, priced per generation (not per finished image), and often expire. Failed or rejected generations can consume credits, and leftover balances sit unused. The pack looks cheaper per unit until you count the waste — expired credits and paid-for misses.",
    },
    {
      q: "When does a subscription make sense?",
      a: "If you generate a high, steady volume every single month — dozens of images weekly, year-round — a subscription's flat fee can beat per-image pricing. For seasonal businesses, campaign-based work, or anyone starting out, subscriptions charge you in the quiet months too.",
    },
    {
      q: "What should I ask before paying any AI image tool?",
      a: "Seven questions: is the price per finished image or per generation? Do credits expire? Do failed generations cost money? Is there a free trial of real output? Who checks quality? What's the revision price? Can I leave without losing prepaid balance? Honest tools answer all seven plainly.",
    },
  ],
  related: [
    "what-is-pay-per-creation-ai",
    "ai-video-without-subscription",
    "how-much-does-ai-video-cost-india",
  ],
  body: [
    p(
      t("Nobody buys AI images the way they buy groceries — with a clear price per item. Instead the industry sells you currencies: credits, tokens, gems, monthly plans with “generous” allowances. "),
      t("AI image pricing models"),
      t(" are designed to make comparison hard. Let's make it easy.")
    ),
    h2("The three models, honestly"),
    table(
      ["", "Per-image", "Credit packs", "Subscription"],
      [
        ["You pay", "Fixed price per finished image", "Prepaid bundle of credits", "Monthly fee"],
        ["Quiet months cost", "Nothing", "Credits may expire", "Full fee anyway"],
        ["Failed generations", "You only pay for delivered images", "May consume credits", "Count against your allowance"],
        ["Price clarity", "Total known before ordering", "Needs credit-to-image math", "Needs usage math to justify"],
        ["Leaving", "Nothing lost", "Unused balance lost", "Cancel, lose access"],
      ]
    ),
    h2("Where the money actually leaks"),
    list(
      [t("Expiry. Credits that vanish after 30 or 90 days are a transfer from you to the platform. Check the expiry before the per-credit price.")],
      [t("Per-generation vs per-image. If one finished image takes three generations, the “cheap” per-generation price triples. Per-image pricing charges the finished result.")],
      [t("Revision pricing. Some tools charge full price for every tweak. Etch's remake is a flat ₹5 — the revision price should always be public.")],
      [t("The quiet-month tax. A subscription you use twice in December costs the same as one you use daily in October. Seasonal businesses pay this tax hardest.")],
    ),
    callout("tip",
      t("The one-line test: can you state your total cost before you order? “Four product photos at ₹29 each” passes. “About 800 credits, depending on generations” fails. If the tool can't tell you the total upfront, that's information — about the tool.")
    ),
    h2("Do the math for your volume"),
    p(
      t("Take your last three months of creative needs — not your aspirations, your actual orders. A boutique needing 8 product shots a month pays "),
      t("₹29"),
      t(" × 8 monthly on per-image pricing, and nothing at all in a month with no shoots. A subscription bills you the same in the quiet month as in the busy one. A credit pack leaves a balance you'll scramble to spend before expiry. Per-image pricing is the only model where your cost curve matches your usage curve exactly.")
    ),
    h2("A worked example: the festive campaign"),
    p(
      t("Say you need Diwali creatives for your store: four festive images. Per-image pricing: a "),
      t("₹49"),
      t(" 4-pack, total known before you order. Credit-pack route: buy a bundle, spend generations per image, hope the festive rush doesn't eat your balance on retries. Subscription route: pay the full month for a week's campaign. The per-image total is the only one you can write on a whiteboard with confidence — and if one image misses, a "),
      t("₹5"),
      t(" remake fixes it without touching the rest of the budget.")
    ),
    h2("The 7-question transparency checklist"),
    p(
      t("Before you pay any AI image tool, get straight answers to these — in writing, on their pricing page:")
    ),
    list(
      [t("Is the price per finished image or per generation attempt?")],
      [t("Do credits or allowances expire? When?")],
      [t("Do failed or rejected generations cost me anything?")],
      [t("Can I try the real output before paying — not a demo gallery?")],
      [t("Who checks quality before delivery — a human or nobody?")],
      [t("What does a revision cost, exactly?")],
      [t("If I stop paying, do I lose prepaid balance or my delivered images?")],
    ),
    h2("Why Etch prices per image"),
    p(
      t("The catalog is public on the "),
      link("pricing page", "/pricing"),
      t(": single image "),
      t("₹15"),
      t(", 4-pack "),
      t("₹49"),
      t(", product photo "),
      t("₹29"),
      t(", 5-second clip "),
      t("₹19"),
      t(", Video Studio job "),
      t("₹29"),
      t(", remake "),
      t("₹5"),
      t(". No credits to expire, no subscription to cancel, no quiet-month tax. You can also try 3 free images a day before spending anything — the trial is real output, not a slideshow. Order on "),
      link("the create page", "/create"),
      t(", pay over UPI, and every image passes a human quality check.")
    ),
    cta(
      "See the whole catalog — no fine print",
      "Every price public, per-image, payable over UPI.",
      "View pricing",
      "/pricing"
    ),
  ],
};

export default post;
