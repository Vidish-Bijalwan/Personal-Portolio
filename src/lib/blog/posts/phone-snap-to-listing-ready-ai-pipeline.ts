import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "phone-snap-to-listing-ready-ai-pipeline",
  title: "From Phone Snap to Listing-Ready: The AI Product Photo Pipeline",
  description:
    "Shoot a clean phone reference, write a sharp brief, order the AI product photo for ₹29, get a human-checked delivery — and fix misses with a ₹5 remake.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["product photography", "AI", "sellers", "India", "ecommerce"],
  readingMinutes: 6,
  answer: [
    t("The AI product photo pipeline has five steps: shoot a clean, well-lit reference photo of the real product on your phone; write a brief describing the look you want; order the AI product photo on "),
    link("Etch", "/"),
    t(" for "),
    t("₹29"),
    t("; review the human-checked delivery; and request a "),
    t("₹5"),
    t(" remake if anything is off. The reference photo is the foundation — a blurry, cluttered snap produces a poor result no matter how good the brief is."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29, remake ₹5", url: "https://vidish.me/pricing" },
    { label: "Amazon Seller Central India — product image guidance", url: "https://sellercentral.amazon.in/" },
  ],
  faqs: [
    {
      q: "Can I just use a random phone photo as the reference?",
      a: "Only if it is sharp, well-lit, and shows the real product against a plain background. The AI builds on what you give it — a blurry snap with harsh flash and clutter behind it produces a poor result. Clean reference in, clean studio shot out.",
    },
    {
      q: "How much does each product photo cost, including remakes?",
      a: "One AI product photo costs ₹29 on Etch. If the first version misses — wrong angle, off colors, a distorted label — a remake costs ₹5. Most sellers land the shot in one or two tries.",
    },
    {
      q: "Will the AI photo show my product exactly as it is?",
      a: "Proportions, colors, logos, and label text follow your reference photo, and every delivery passes a human quality check before it reaches you. But the photo must honestly represent what the buyer will receive — misleading imagery drives returns, which cost far more than any photo.",
    },
    {
      q: "How long does the whole pipeline take?",
      a: "Shooting the reference takes ten minutes in daylight. Writing the brief takes another ten. The order itself is operator-fulfilled and human-reviewed, so expect delivery the same day rather than the days or weeks a traditional shoot takes.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "prompt-engineering-5-part-formula",
    "amazon-listing-images-ai-india",
  ],
  body: [
    p(
      t("You do not need a camera, a studio, or a photographer to get a listing-ready product shot. You need a phone, ten minutes of daylight, a clear brief, and a per-photo AI service. Here is the exact pipeline — five steps, with the honest limits at each one. ")
    ),
    h2("Step 1 — Shoot a clean reference photo"),
    p(
      t("The reference photo is the single most important input. AI can change the background, the lighting, and the styling — but it cannot invent product details your photo does not show. Shoot near a window in daylight, put the product on a plain surface (a white bedsheet works), and get close enough that the product fills the frame.")
    ),
    list(
      [t("Do: wipe the product first — dust and fingerprints survive the whole pipeline.")],
      [t("Do: shoot straight-on and from a slight angle, so the AI understands the shape.")],
      [t("Do: capture true colors — daylight, no flash, no colored room lighting.")],
      [t("Don’t: shoot blurry, tilted, or cluttered photos — garbage reference means garbage result.")],
      [t("Don’t: use harsh flash — it flattens texture the AI then has to guess at.")],
      [t("Don’t: photograph a different variant than the one you’re listing — the buyer will compare.")],
    ),
    callout("warn",
      t("There is no step later in this pipeline that fixes a bad reference. If the snap is blurry, re-shoot it now — it takes two minutes and saves a remake cycle.")
    ),
    h2("Step 2 — Write the brief"),
    p(
      t("The brief tells the AI what the final shot should look like. Name the product precisely, describe the scene, state the angle, and say what to avoid. A good brief reads like this: “matte black steel water bottle, 1 litre, on a light oak table, soft morning window light, straight-on hero shot, no hands, no distorted label text”. Our "),
      link("5-part prompt formula", "/blog/prompt-engineering-5-part-formula"),
      t(" breaks this down into a repeatable template you can reuse across SKUs.")
    ),
    h2("Step 3 — Order the AI product photo for ₹29"),
    p(
      t("On the "),
      link("Etch creation page", "/create?service=product-photo"),
      t(", describe the product and the look you want, attach your reference photo, and pay "),
      t("₹29"),
      t(" over UPI. That’s the whole transaction — no subscription, no credit pack. The "),
      link("pricing page", "/pricing"),
      t(" lists it plainly alongside the other services.")
    ),
    h2("Step 4 — Review the human-checked delivery"),
    p(
      t("Every Etch creation passes a human quality check before delivery — someone looks at the image and confirms it matches the brief and the reference. When it arrives, compare it against three things: does it show your real product, does the color match, and is any label text clean? Check it on your phone at thumbnail size too, because that’s how buyers will first see it.")
    ),
    h2("Step 5 — Remake or ship"),
    table(
      ["Situation", "What to do"],
      [
        ["Label text looks distorted", "Request a ₹5 remake with a tighter reference — fine microtext is the hardest part of any AI photo."],
        ["Background or styling is off", "Request a ₹5 remake with a clearer scene description."],
        ["Color doesn’t match the real product", "Re-shoot the reference in neutral daylight first, then remake for ₹5."],
        ["Everything matches", "Ship it — the photo goes straight on the listing."],
      ]
    ),
    callout("note",
      t("A remake is for fixing misses, not for exploring five art directions. Get the reference and the brief right at steps 1–2 and you will rarely need one.")
    ),
    h2("Garbage in, garbage out — a concrete table"),
    table(
      ["Reference photo", "Likely result"],
      [
        ["Sharp, daylight, plain background", "Clean studio shot that matches the product."],
        ["Blurry or shaky", "Soft, mushy details the brief cannot rescue."],
        ["Harsh flash, yellow room light", "Wrong colors — the product looks different from reality."],
        ["Cluttered background", "Odd objects the AI may carry into the new scene."],
        ["A different product variant", "A beautiful photo of the wrong item — returns incoming."],
      ]
    ),
    h2("What AI still can’t do"),
    p(
      t("AI will not invent engineering details that don’t exist in your reference — a prototype with exact measurements is safer shot traditionally. It can’t reliably reproduce very fine label microtext in one pass, and it can’t photograph a physical prop or model you don’t actually have. Know the boundary, and the pipeline is genuinely a ten-minute job per product.")
    ),
    h2("From one photo to a whole catalog"),
    p(
      t("Once the first product lands, templatize the brief: keep the lighting and background lines identical and change only the product description per SKU. Your forty listings will look like one brand. The same photos can then become hero frames for short video ads — "),
      link("make product ads with AI", "/blog/make-product-ads-with-ai"),
      t(" covers that next step, and the "),
      link("Amazon listing image guide", "/blog/amazon-listing-images-ai-india"),
      t(" shows how to meet marketplace image rules with these shots.")
    ),
    cta(
      "Turn your phone snap into a studio shot for ₹29",
      "Attach the reference, write the brief, pay with UPI — delivered after a human quality check.",
      "Create a product photo",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
