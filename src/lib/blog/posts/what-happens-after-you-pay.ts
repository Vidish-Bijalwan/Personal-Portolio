import type { BlogPost } from "../types";
import { t, link, p, h2, list, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "what-happens-after-you-pay",
  title: "After You Tap “I've Paid”: Your Order's Full Journey",
  description:
    "What happens between your UPI payment and delivery on Etch: verification, the operator queue, generation, human review, and delivery — with honest timelines.",
  date: "2026-10-07",
  category: "Explainers",
  tags: ["orders", "UPI", "fulfillment", "how it works", "Etch"],
  readingMinutes: 5,
  answer: [
    t("After you pay on "),
    link("Etch", "/"),
    t(" and tap “I've paid”, your order moves through five stages: payment verification against your UTR, the operator queue, generation from your brief, a human quality check, and delivery to your account. Most orders complete within 24 hours. You can track the stage live on the watch page, and a remake costs "),
    t("₹5"),
    t(" if the result misses your brief."),
  ],
  sources: [
    { label: "Etch create — place an order", url: "https://tryetch.online/create" },
    { label: "Etch pricing — full catalog", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "How do I pay for a Etch order?",
      a: "With UPI — scan the QR or pay to the listed VPA, then submit your UTR (the 12-digit transaction reference from your UPI app) and tap “I've paid”. An operator verifies the payment against the UTR before your order enters the generation queue. Keep your UPI app's transaction history handy until verification completes.",
    },
    {
      q: "How long does an order take?",
      a: "Most orders are delivered within 24 hours. The watch page shows your order's live stage — queued, generating, in review, or delivered — so you're never guessing. Festive weeks and sale seasons are busier; ordering a few days early is wise for deadline work.",
    },
    {
      q: "What if my payment isn't verified?",
      a: "Verification matches your submitted UTR against the received payment. If the UTR is mistyped, verification stalls — double-check the 12 digits from your UPI app before submitting. If a payment genuinely didn't go through on your end, no order is created and nothing is charged beyond what your bank shows.",
    },
    {
      q: "What does the human quality check actually check?",
      a: "That the image matches your brief, that there are no obvious generation artifacts (warped details, garbled text, extra limbs), and that the file is clean and full-resolution. Orders that fail the check go back for regeneration before you ever see them — that's the point of the stage.",
    },
  ],
  related: [
    "what-is-pay-per-creation-ai",
    "ai-image-generator-india-pay-per-creation",
    "make-product-ads-with-ai",
  ],
  body: [
    p(
      t("Pay-per-creation sounds simple — pay, get the thing — but between your UPI payment and the delivered image there's a real pipeline with real people in it. Here's exactly "),
      t("what happens after you tap “I've paid”"),
      t(", stage by stage, with honest timelines.")
    ),
    h2("Stage 1: Payment verification"),
    p(
      t("You pay via UPI and submit your UTR — the 12-digit reference your UPI app shows after payment. An operator matches that UTR against received payments. This is deliberately manual: it's what keeps pricing honest and fraud-free without forcing you through a payment gateway's fees. Verification usually completes within a few hours; mistyped UTRs are the most common delay, so copy the digits carefully from your UPI app's history.")
    ),
    h2("Stage 2: The operator queue"),
    p(
      t("Verified orders enter the fulfillment queue in order. Your place in the queue is visible on the watch page — no black box. Queue position depends on how many orders arrived before yours; festive weeks are the busiest. This is also why Etch quotes “most orders within 24 hours” instead of promising instant: a reviewed, queued process has real capacity, and honesty about it beats a fake instant timer.")
    ),
    callout("tip",
      t("In a hurry? Order before you need it. The queue is shortest on weekday mornings; festive-season evenings are the peak. For deadline work like a sale launch, place the order 2–3 days early and use the buffer for a possible ₹5 remake round.")
    ),
    h2("Stage 3: Generation"),
    p(
      t("An operator runs your brief through the generation pipeline — your prompt, your reference photos, the service you ordered (single image at "),
      t("₹15"),
      t(", product photo at "),
      t("₹29"),
      t(", 5-second clip at "),
      t("₹19"),
      t(", Video Studio job at "),
      t("₹29"),
      t("). If your brief is missing something critical — say, no reference photo for a product that needs one — the order may be flagged for clarification rather than guessed at. A clear brief is the fastest thing you can do for your own order.")
    ),
    h2("Stage 4: Human quality check"),
    p(
      t("Every creation is reviewed by a person before it reaches you. The check covers three things: does it match your brief, are there generation artifacts (warped hands, garbled label text, melted backgrounds), and is the file clean and full-resolution? Failed checks go back for regeneration — you never see the rejects. This stage is the difference between a generation tool and a fulfillment service, and it's why the occasional order takes the full 24 hours instead of two.")
    ),
    h2("Stage 5: Delivery"),
    p(
      t("The finished file lands in your account, ready to download at full resolution — yours to use across your store, socials, and ads. The watch page marks the order delivered and keeps your history. If the result misses your brief, a remake is "),
      t("₹5"),
      t(": describe what to change, and the order re-enters the pipeline at the generation stage.")
    ),
    h2("The whole journey, at a glance"),
    list(
      [t("You brief → pay via UPI → submit UTR → tap “I've paid”.")],
      [t("Operator verifies your payment against the UTR.")],
      [t("Order queues; watch your live position on the watch page.")],
      [t("Operator generates from your brief and references.")],
      [t("Human reviews; failures regenerate before you see them.")],
      [t("Delivered to your account, full resolution, yours to use.")],
    ),
    h2("Why it works this way"),
    p(
      t("The manual steps — UTR verification, the operator queue, human review — are features, not legacy. They keep prices at "),
      t("₹15"),
      t("–"),
      t("₹19"),
      t(" instead of gateway-inflated, catch the failures automation would ship to you, and keep a person accountable for your order. The "),
      link("pricing page", "/pricing"),
      t(" lists every price; the "),
      link("create page", "/create"),
      t(" starts the journey. Tap “I've paid” — you'll know exactly where your order stands, the whole way.")
    ),
    cta(
      "Place your first order",
      "Brief it, pay via UPI, track it live — delivered after human review.",
      "Create now",
      "/create?service=single-image"
    ),
  ],
};

export default post;
