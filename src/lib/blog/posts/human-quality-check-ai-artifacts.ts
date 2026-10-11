import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "human-quality-check-ai-artifacts",
  title: "How the Human Quality Check Catches AI Artifacts",
  description:
    "AI models fail in predictable ways — extra fingers, warped text, melting backgrounds. What a human quality check screens for before your order ships.",
  date: "2026-10-11",
  category: "Explainers",
  tags: ["quality check", "AI artifacts", "fulfillment", "sellers", "explainers"],
  readingMinutes: 6,
  answer: [
    t("A human quality check is a trained person screening every generated image before delivery — for the failure modes models produce predictably: extra or merged fingers, garbled text, warped logos, background shapes melting into the product, and anatomy that breaks at full size. Anything that fails goes back for regeneration; only clean images ship. It's the difference between raw model output and a finished asset, and it's included in every "),
    t("₹15"),
    t(" Etch order. See the order lifecycle on "),
    link("the create page", "/create?service=product-photo"),
    t(" and the flat prices on "),
    link("the pricing page", "/pricing"),
    t("."),
  ],
  sources: [
    { label: "Diffusion models — why artifacts happen (Wikipedia)", url: "https://en.wikipedia.org/wiki/Diffusion_model" },
    { label: "Etch pricing — ₹15 single with human QC included", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "What exactly does the human quality check look at?",
      a: "A fixed checklist, every image, at full resolution: hands and fingers (count and shape), any text or logos (legibility), product geometry (does it match the reference photos?), edges where product meets background (no melting or halos), and overall composition against the brief. It's deliberately boring — checklists beat inspiration for catching errors.",
    },
    {
      q: "Why can't the AI check its own work?",
      a: "Because the checker would share the generator's blind spots. A model that can't count fingers reliably when drawing them can't count them reliably when reviewing, either — it learned the same pixel statistics. Human review works precisely because human vision is built on a physical understanding of the world: we know hands have five fingers the way no pixel model does.",
    },
    {
      q: "What happens when an image fails the check?",
      a: "It goes back for regeneration against the same brief — you never see the failed version, and you're never charged extra for the retry. The failed attempt costs the service time, not you money. That's the economic point of the check: the service absorbs the model's miss rate so your ₹15 always buys a finished image.",
    },
    {
      q: "Does the quality check catch taste issues, like a bad background choice?",
      a: "It catches execution errors, not creative disagreements. A warped logo fails the check; a background you find boring but matches your brief passes it — the checker's job is “did we make what was asked, correctly,” not “would I have chosen this.” If the delivered image is correct but not to your taste, that's what the ₹5 remake is for: redirect the creative direction surgically.",
    },
  ],
  related: [
    "what-happens-after-you-pay",
    "remake-economics-ai-revisions",
    "ai-image-generator-india-pay-per-creation",
  ],
  body: [
    p(
      t("Every AI image generator produces misses — it's statistical, not personal. Diffusion models learn pixel patterns without understanding the physical world, so they reliably produce a small catalogue of failures: the extra finger, the almost-word, the logo that melts at the edges. On a DIY tool, catching those is your job, at midnight, squinting at thumbnails. On a human-fulfilled service, there's a dedicated step for it. Here's what that step actually does.")
    ),
    h2("Why artifacts are predictable (and therefore catchable)"),
    p(
      t("The good news about AI failures is that they're not random — they cluster in the same places every time, because they come from the same cause: the model approximating things it has no physical understanding of. Hands, text, fine repetitive patterns (fabric weaves, grill meshes), reflections, and the boundary where product meets background. A checklist built from those known failure modes catches the overwhelming majority of misses, because the model's weaknesses are stable even as its strengths improve.")
    ),
    h2("The artifact catalogue"),
    table(
      ["Artifact", "What it looks like", "Where it hides"],
      [
        ["Extra / merged fingers", "Six fingers, fused digits", "Hands near the product, small in frame"],
        ["Garbled text", "Almost-words on labels and signs", "Any on-image text longer than a word or two"],
        ["Warped logos", "Brand marks that smear or morph", "Packaging close-ups"],
        ["Background melt", "Product edges dissolving into the scene", "Busy or low-contrast backgrounds"],
        ["Anatomy breaks", "Wrong proportions, impossible joints", "Full-size view — invisible in thumbnails"],
        ["Texture mush", "Fabric or detail rendered as smear", "Zoomed product views"],
      ]
    ),
    h2("The check itself: full-size, checklist, every image"),
    list(
      [t("Full resolution, not thumbnails — most artifacts are invisible at preview size and obvious at zoom.")],
      [t("Hands and text first — the two highest-failure categories get checked before anything else.")],
      [t("Against the reference photos — does the product's shape, colour, and detail match what the seller sent?")],
      [t("Against the brief — is this the background, angle, and mood that was ordered?")],
      [t("Edge inspection — product boundaries, reflections, and shadows get a dedicated pass.")],
    ),
    callout("tip",
      t("The thumbnail trap: never approve an AI image from its thumbnail. Artifacts scale with resolution — a hand that looks fine at 200px can be a six-fingered disaster at 2000px. The quality check exists because someone has to look at full size, every time.")
    ),
    h2("What QC doesn't do (honestly)"),
    p(
      t("Two limits, stated plainly. First, taste: the check verifies correct execution of your brief, not whether your brief was inspired — a boring-but-correct image passes. Second, physics the brief didn't specify: if you didn't mention the label text mattered, the checker may not scrutinize it the way you would. The fix for both is the same — write the brief with your real priorities in it, flag zoom-critical details explicitly, and keep the "),
      t("₹5"),
      t(" remake as your creative redirect tool.")
    ),
    h2("Why this is included in a ₹15 order"),
    p(
      t("The economics only work because the check is a step in a pipeline, not a favour. The service absorbs the model's miss rate — failed generations cost operator time, never your money — and your "),
      t("₹15"),
      t(" buys the finished, checked image or nothing at all. Compare that against raw model output, where every miss costs you another generation, another prompt tweak, another midnight screening session. Order on "),
      link("the create page", "/create?service=product-photo"),
      t(" — the human check runs before anything reaches you, and the flat catalog is on "),
      link("the pricing page", "/pricing"),
      t(".")
    ),
    cta(
      "Get the checked version",
      "Every ₹15 order includes the human quality check — full-size screening for artifacts before delivery.",
      "Create a product photo order",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
