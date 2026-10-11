import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-hands-text-break-briefing-guide",
  title: "Why AI Hands and Text Still Break — and How to Brief Around It",
  description:
    "AI hands and AI text break for the same statistical reason. Here's the plain-English explanation — and the briefing tricks that keep them out of your product photos.",
  date: "2026-10-11",
  category: "Guides",
  tags: ["AI artifacts", "briefing", "product photos", "limitations", "sellers"],
  readingMinutes: 6,
  answer: [
    t("AI image models learn from pixels, not anatomy — they have never held anything, so hands with many small joints come out with extra fingers or merged shapes. Text breaks for the same reason: the model treats letters as shapes, not language, so long words warp. The fix is briefing, not hoping: keep hands out of frame or cropped at the wrist, keep on-image text to three or four short words, and describe anything that must be exact. Brief once on "),
    link("the create page", "/create?service=product-photo"),
    t(" — a "),
    t("₹15"),
    t(" order with a "),
    t("₹5"),
    t(" remake as backup costs less than a reshoot. Flat prices are on "),
    link("the pricing page", "/pricing"),
    t("."),
  ],
  sources: [
    { label: "Diffusion models — how AI image generation works (Wikipedia)", url: "https://en.wikipedia.org/wiki/Diffusion_model" },
    { label: "Etch pricing — ₹15 single, ₹5 remake", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "Why are hands specifically so hard for AI image models?",
      a: "A hand is dozens of small joints in constant, subtle motion — and photos rarely show the same hand pose twice. Training data gives the model millions of hands but no single stable template, and no understanding that a hand has exactly five fingers. So it approximates: sometimes five, sometimes six, sometimes merged. Faces, by contrast, are symmetric and frontal in most photos, which is why AI faces improved years before AI hands did.",
    },
    {
      q: "Can AI get short text right on packaging and signs?",
      a: "Sometimes, for one or two short words — and you should always treat it as luck, not capability. The model renders text as texture, not as characters with meaning, so longer words and fine print warp reliably. If your product's label text must be legible, the safe brief is a clean pack shot where the label is photographed straight-on and large — and if text is business-critical, say so in the brief so the human quality check screens for it specifically.",
    },
    {
      q: "Do negative prompts like “no extra fingers” work?",
      a: "They help a little but they don't solve it — the model doesn't reason about anatomy, so “five fingers” is as statistical as everything else it makes. The reliable approach is compositional: brief the shot so the failure mode can't appear at all. Crop hands out, show the product instead of the hand holding it, keep text minimal. Prevention beats correction.",
    },
    {
      q: "What if the delivered image still has an artifact?",
      a: "That's exactly what remakes are for. A ₹5 remake lets you point at the specific miss — “regenerate the hand area” or “fix the warped label text” — without re-briefing the whole image. It's cheaper than living with a broken detail on a listing photo, and it's why ordering through a human-checked service beats rolling the dice on raw model output yourself.",
    },
  ],
  related: [
    "prompt-engineering-5-part-formula",
    "phone-snap-to-listing-ready-ai-pipeline",
    "remake-economics-ai-revisions",
  ],
  body: [
    p(
      t("Every AI image tool has the same two haunted categories: hands and text. Six fingers. Merged cutlery where a hand should be. A product label that reads almost-English. These aren't bugs in one model — they're consequences of how every diffusion model learns. Understand the reason once, and the briefing workarounds become obvious instead of superstitious.")
    ),
    h2("The thirty-second explanation"),
    p(
      t("Diffusion models learn by studying millions of images as pure pixel statistics — they learn what pixels tend to appear near other pixels, with no model of the physical world underneath. A model has never held a cup; it has only seen pixel patterns labelled “hand holding cup.” That works brilliantly for common, stable patterns (a face, frontal and symmetric) and breaks on complex, variable ones. Hands are the classic failure: dozens of joints, endless poses, always partially occluded — there is no single template to copy, so the model blends several and invents a sixth finger. Text fails the same way: the model doesn't read. It has no alphabet in its head. Letters are just curvy shapes it remembers co-occurring, so “almost-words” emerge — close enough to fool you at a glance, wrong when you zoom.")
    ),
    h2("The briefing rules that actually work"),
    table(
      ["Failure mode", "What to brief instead", "Why it works"],
      [
        ["Hands holding product", "Product on surface, or hand cropped at wrist", "Removes the complex anatomy entirely"],
        ["On-image text / labels", "Max 3–4 short words, or text-free shot", "Short glyph strings warp less; none warp never"],
        ["Fine print on packaging", "Straight-on, large label; flag as critical in brief", "Gives the QC step a clear thing to check"],
        ["Fingers near the product", "Overhead flat-lay or ghost-mannequin style", "Occlusion is where fingers merge — avoid the geometry"],
      ]
    ),
    h2("Brief the composition, not the anatomy"),
    p(
      t("The most common mistake in a brief is describing what you want to see (“a hand holding the diya”) instead of describing a composition where the hard part can't fail (“the diya on a brass tray, warm light, no hands in frame”). Composition-first briefing works because it sidesteps the model's weakness rather than betting against it. Same for text: instead of “the banner should say FESTIVE SALE 50% OFF in gold,” brief “gold banner, festive background, no text” — and add the text yourself afterward in any editor, where letters are actual letters.")
    ),
    callout("tip",
      t("The zoom test: if a detail only looks right at thumbnail size and breaks when you zoom, it will break on a customer's zoomed product view too. Flag zoom-critical details (label text, jewelry clasps, stitching) in the brief so they get screened at full size.")
    ),
    h2("What the human quality check catches"),
    p(
      t("This is where ordering through a human-checked service earns its keep. Before any image is delivered, a person screens it for exactly these statistical misses — extra fingers, merged objects, warped label text, background shapes melting into the product. On a DIY tool, every one of those artifacts is your problem to spot at midnight. Here, the "),
      t("₹15"),
      t(" order price includes someone whose job is to notice what the model got wrong.")
    ),
    h2("When it still slips through: the ₹5 remake"),
    list(
      [t("Point at the specific miss: “regenerate the hand area” or “the label text is garbled” — surgical feedback gets surgical fixes.")],
      [t("Change the composition in the remake brief, not just the wording — crop the hand out instead of asking for “better fingers.”")],
      [t("For label-critical products, order the remake with a straight-on reference photo of the real label attached.")],
      [t("If two remakes miss the same detail, change the shot concept — the model is telling you that composition is outside its reliable range.")],
    ),
    h2("Ordering an artifact-safe product photo"),
    p(
      t("Write your brief composition-first: product, surface, lighting, background, and explicitly what to exclude (“no hands, no text in image”). Submit it on "),
      link("the create page", "/create?service=product-photo"),
      t(" for "),
      t("₹15"),
      t(", and treat the "),
      t("₹5"),
      t(" remake as your safety net, not an admission of failure. The flat catalog — including the "),
      t("₹49"),
      t(" 4-pack for variant sets — is on "),
      link("the pricing page", "/pricing"),
      t(".")
    ),
    cta(
      "Brief it so it can't break",
      "A composition-first brief on the create page — product, surface, light, and what's excluded — keeps hands and text failures out of frame.",
      "Create a product photo order",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
