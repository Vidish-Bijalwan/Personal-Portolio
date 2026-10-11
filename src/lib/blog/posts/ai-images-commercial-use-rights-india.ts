import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-images-commercial-use-rights-india",
  title: "What “Commercial Use” Means for AI-Generated Images in India",
  description:
    "Two separate questions hide inside “can I use this commercially”: the tool's license, and who owns an AI image. A practical guide for Indian sellers and creators.",
  date: "2026-10-11",
  category: "Explainers",
  tags: ["commercial use", "licensing", "copyright", "India", "sellers"],
  readingMinutes: 6,
  answer: [
    t("“Commercial use” is actually two questions. First: does the tool's license let you use the image to sell things? Most paid AI tools — including pay-per-creation services like Etch — grant this; free tiers often don't. Second: who owns the copyright in an AI-generated image? That part is unsettled everywhere, including India, where the Copyright Act predates generative AI and doesn't address AI authorship explicitly. The practical rule: buy (don't scrape) your images, read the tool's license terms, keep your order receipts, and never generate trademarked logos or real people's faces. Start with a licensed order on "),
    link("the create page", "/create?service=product-photo"),
    t(" and check "),
    link("the pricing page", "/pricing"),
    t(" for the flat catalog. This is general information, not legal advice."),
  ],
  sources: [
    { label: "AI and copyright — the unsettled ownership question (Wikipedia)", url: "https://en.wikipedia.org/wiki/Artificial_intelligence_and_copyright" },
    { label: "US Copyright Office — AI and authorship guidance", url: "https://copyright.gov/ai/" },
  ],
  faqs: [
    {
      q: "Can I legally use an AI-generated product photo on my Amazon or Flipkart listing?",
      a: "If the tool's license grants you commercial use — and paid services like Etch are built around exactly that — yes for the license part. The unsettled part is copyright ownership of the image itself, which matters mainly if someone copies YOUR listing images and you want to enforce against them. For the everyday question “can I put this on my listing,” a paid license plus your order receipt is the standard, defensible setup.",
    },
    {
      q: "What does India's Copyright Act say about AI-generated works?",
      a: "India's Copyright Act, 1957 was written decades before generative AI and doesn't address AI authorship directly. Globally, copyright offices have generally required meaningful human authorship for protection — the US Copyright Office's guidance is the clearest statement of that position. In practice, Indian sellers should treat AI images as licensed assets (the tool's terms decide what you may do) rather than assuming full copyright ownership the way you'd own a photo you shot yourself.",
    },
    {
      q: "Is a free AI tool's image safe to use commercially?",
      a: "Often not. Free tiers commonly restrict commercial use, add watermarks, or claim broader rights over outputs — that's part of the real cost of “free” tools. If an image will appear on packaging, ads, or listings that earn you money, generate it on a paid tier or per-order service whose terms explicitly allow commercial use, and keep the receipt.",
    },
    {
      q: "What should I never generate, license-wise?",
      a: "Trademarked logos and brand marks, real identifiable people's faces, and artwork in a living artist's distinctive style presented as theirs. The tool's license doesn't protect you from trademark or personality-rights claims — those attach to what's depicted, not how it was made. When in doubt, brief original compositions: your product, a generic setting, no brand marks.",
    },
  ],
  related: [
    "ai-photoshoot-cost-comparison-india",
    "what-happens-after-you-pay",
    "pricing-transparency-checklist-ai-tools",
  ],
  body: [
    p(
      t("Sellers ask “can I use this commercially?” about AI images the way they ask about stock photos — expecting one yes-or-no. But two different legal ideas are hiding inside that question, and confusing them is how people end up either over-worried (refusing to use perfectly licensed images) or under-cautious (assuming a paid tool's license answers every question). Here's the separation, in plain language. One disclaimer first: this is general information for business planning, not legal advice — for high-stakes uses like packaging or trademarks, talk to an IP lawyer.")
    ),
    h2("Question 1: the license — may I use it to sell things?"),
    p(
      t("This is the question that matters day-to-day, and it has a clean answer: it depends on the tool's terms. Paid tiers and per-order services are built for commercial work — you pay, you get a license to use the output in listings, ads, and packaging. Free tiers are the trap: many restrict commercial use, watermark outputs, or reserve rights over what you make. The rule is boring and reliable: read the license before the image goes anywhere that earns money, and prefer services whose business model is selling you commercial outputs, not harvesting your usage.")
    ),
    h2("Question 2: ownership — who holds the copyright?"),
    p(
      t("This one is genuinely unsettled worldwide. Copyright has historically protected human authorship, and AI-generated images sit in an uncomfortable gap: the person who wrote the brief didn't draw anything, and the model isn't a legal person. Copyright offices internationally have leaned toward requiring meaningful human creative input for protection, and India's statute — written in 1957 — simply doesn't contemplate the question. What this means practically: treat AI images as licensed assets rather than owned property. Your protection against copycats comes from the tool's terms and your business speed, not from a copyright registration certificate.")
    ),
    table(
      ["Situation", "What protects you", "What doesn't"],
      [
        ["Using the image on your listing", "The tool's commercial-use license", "Assuming “I paid, so I own the copyright”"],
        ["A competitor copies your AI listing image", "Platform takedown + your order receipts showing prior use", "A copyright registration you probably can't get"],
        ["Free-tier image in a paid ad", "Nothing — check the free tier's terms first", "“Everyone does it”"],
        ["AI image with a brand logo in it", "Nothing — trademark risk is separate", "The tool's license"],
      ]
    ),
    h2("The receipt habit"),
    list(
      [t("Keep every order receipt or invoice — it's your proof of a legitimate commercial license and of prior use.")],
      [t("Screenshot or save the tool's license terms on the day you order; terms change, and your usage is governed by what they said then.")],
      [t("Note the date and order ID with the final file, the way you'd file a photographer's release form.")],
      [t("For packaging and trademarks — the highest-stakes uses — get an IP lawyer's sign-off, not a blog post's.")],
    ),
    callout("warn",
      t("The license covers the tool's grant to you. It does not cover what's depicted: a trademarked logo, a celebrity's face, or a distinctive artwork style can create liability no license can waive. Brief original compositions — your product, generic settings, no brand marks.")
    ),
    h2("How this works on Etch"),
    p(
      t("Etch's model is pay-per-creation: you order on "),
      link("the create page", "/create?service=product-photo"),
      t(" — a single image is "),
      t("₹15"),
      t(", a 4-pack "),
      t("₹49"),
      t(" — and each order is a commercial transaction with a receipt, which is the cleanest possible paper trail for the license question. The images go through a human quality check before delivery, so what you receive is a finished, licensed asset rather than a raw model output. The full flat catalog is on "),
      link("the pricing page", "/pricing"),
      t(". For the ownership question, the same honesty applies as everywhere: the license is clear, the deeper copyright theory is unsettled — and for listing images, ads, and catalogs, the license is the part that does the work.")
    ),
    cta(
      "Licensed images, with receipts",
      "Every Etch order is a commercial transaction with a receipt — the clean paper trail your catalog needs.",
      "Create your first order",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
