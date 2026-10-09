import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "prompt-engineering-5-part-formula",
  title: "Prompt Engineering Basics: The 5-Part Prompt Formula",
  description:
    "Stop getting random AI images. The 5-part prompt formula — subject, style, scene, light, camera — with Indian-context examples you can copy and adapt today.",
  date: "2026-10-08",
  category: "Guides",
  tags: ["prompt engineering", "AI images", "tutorial", "guide"],
  readingMinutes: 7,
  answer: [
    t("A reliable AI-image prompt has five parts: subject (exactly what), style (the visual language), scene (where and what's around), light (time, source, mood), and camera (angle, lens feel, ratio). On "),
    link("Etch", "/"),
    t(", where each finished image costs "),
    t("₹15"),
    t(", a complete prompt wastes fewer generations: specificity in, accuracy out. Write all five parts before you order, and iterate on one part at a time."),
  ],
  sources: [
    { label: "Etch pricing — single image ₹15", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI image pricing reference", url: "https://www.talkpix.ai/pricing" },
    { label: "VEED AI tools — AI creative tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "What is the 5-part prompt formula?",
      a: "Subject, style, scene, light, camera. Subject: the exact thing (“hand-poured soy candle in amber glass”). Style: the visual language (“warm lifestyle photography”). Scene: surroundings (“on a light oak table beside dried flowers”). Light: (“soft morning window light”). Camera: (“straight-on, shallow depth of field”). Five parts, one complete instruction.",
    },
    {
      q: "How long should my prompt be?",
      a: "Long enough to cover all five parts — usually two to four sentences. One vague sentence (“a nice candle photo”) forces the AI to guess; a paragraph of purple prose adds noise it will interpret literally. Aim for precise and plain: concrete nouns beat adjectives.",
    },
    {
      q: "What if the first image isn't right?",
      a: "Change one part at a time. If the composition is good but the mood is wrong, keep subject/scene/camera and rewrite only the light and style. On Etch a remake costs ₹5, and the ₹49 4-pack lets you test four variations of one part in a single order.",
    },
    {
      q: "Do I need to learn prompt engineering to use Etch?",
      a: "No — describe what you want in plain words and the system handles the rest. But the five parts help you describe it better: most disappointing results come from under-specified briefs, not from the technology. Ten minutes with this formula noticeably improves first-try results.",
    },
  ],
  related: [
    "ai-image-generator-india-pay-per-creation",
    "ai-product-photography-india-sellers",
    "make-product-ads-with-ai",
  ],
  body: [
    p(
      t("Most bad AI images aren't the model's fault — they're the prompt's. “A beautiful product photo” could mean a hundred things, so the AI picks one at random and you pay for the lottery ticket. "),
      t("Prompt engineering"),
      t(" sounds technical, but it's just structured describing: give the model the five decisions it can't make for you, and it stops guessing. At "),
      t("₹15"),
      t(" per finished image, every avoided re-roll is money kept.")
    ),
    h2("The five parts, with an example"),
    p(
      t("Here's a complete prompt built with the formula — a D2C candle brand's hero shot:")
    ),
    list(
      [t("SUBJECT — the exact thing: “hand-poured soy candle in an amber glass jar, cream label with minimal black text”.")],
      [t("STYLE — the visual language: “warm lifestyle product photography, premium D2C brand aesthetic”.")],
      [t("SCENE — where and what's around: “on a light oak table beside dried eucalyptus, soft linen cloth underneath”.")],
      [t("LIGHT — time, source, mood: “soft morning window light from the left, gentle shadows, cozy glow”.")],
      [t("CAMERA — angle and framing: “straight-on hero shot, centered, shallow depth of field, 4:5 portrait crop”.")],
    ),
    callout("tip",
      t("Write the prompt, then read it back and ask: could this describe two very different images? If yes, the vague part is the one the AI will randomize. Tighten that part first.")
    ),
    h2("Common mistakes, fixed"),
    table(
      ["Mistake", "Why it fails", "Fix"],
      [
        ["“Make it premium”", "Vague — premium means different things", "Name the cues: “matte black, gold foil accents, dark background”"],
        ["Contradictory adjectives", "“Cozy yet dramatic” pulls two ways", "Pick one mood per generation"],
        ["Forgetting the background", "AI fills the void randomly", "Always include the scene part"],
        ["No negative guidance", "Unwanted elements appear", "Add “no hands, no watermark, no extra objects”"],
        ["Changing everything on retry", "You learn nothing", "Change one part at a time"],
      ]
    ),
    h2("Indian-context prompting: be specific, get specificity"),
    p(
      t("Generic prompts produce generic imagery — often Western-default. “A family celebrating” tends toward imagery that doesn't look like your audience. Name the specifics: “a North Indian family celebrating Diwali, marigold torans on the door, diyas on the balcony railing, evening”. Festivals, clothing, architecture, street scenes — the model knows them, but only if you ask. This is the cheapest quality upgrade in AI imagery: ten extra words of cultural specificity.")
    ),
    p(
      t("The same applies to products. “Ayurvedic face oil” gets you a prettier result than “face oil” because it anchors the styling — brass bowls, neem leaves, warm wood. Your product's context is a prompt asset; spend it.")
    ),
    h2("Iterating without burning money"),
    p(
      t("Treat generation like a conversation, not a slot machine. First order: your best five-part prompt. Review against the brief part by part — subject right? light wrong? Then revise only the failing part. The "),
      t("₹49 4-pack"),
      t(" is the iteration tool: four variants of one concept in a single order, so you can test “morning light vs evening glow vs studio softbox vs golden hour” side by side instead of guessing sequentially. Check the "),
      link("pricing page", "/pricing"),
      t(" for the full menu.")
    ),
    h2("Steal this template"),
    p(
      t("Copy, fill, generate: “[SUBJECT with exact details], [STYLE / visual language], [SCENE with surroundings], [LIGHT with time and mood], [CAMERA angle and crop]. No [things to avoid].” Keep a running doc of prompts that worked — your best prompts are reusable assets. A seller with forty SKUs and one proven prompt template has a catalog; a seller re-rolling from scratch every time has a hobby. Review your template quarterly: as your brand evolves, the style and light parts are usually what need updating, while subject and camera stay constant.")
    ),
    cta(
      "Test the formula for ₹15",
      "Write your five parts, order a single image, and see how close the first try lands.",
      "Try a five-part prompt",
      "/create?service=single-image"
    ),
  ],
};

export default post;
