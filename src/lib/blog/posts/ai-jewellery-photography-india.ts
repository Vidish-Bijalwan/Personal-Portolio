import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-jewellery-photography-india",
  title: "AI Jewellery Photography: Capturing Shine, Honestly",
  description:
    "Jewellery is the hardest product to photograph — reflections, sparkle, scale. How to brief AI jewellery shots that look luxurious without lying, at ₹29 per image.",
  date: "2026-10-07",
  category: "Sellers",
  tags: ["jewellery", "product photography", "sellers", "AI images", "India"],
  readingMinutes: 6,
  answer: [
    t("AI jewellery photography works when you brief the hard parts explicitly: metal finish, stone cuts, and honest scale. On "),
    link("Etch", "/"),
    t(", a jewellery shot costs a flat "),
    t("₹29"),
    t(" — you describe the piece and the setting, optionally attach a reference photo, pay over UPI, and get a human-reviewed image, most orders within 24 hours. It suits catalog and social shots; high-ticket pieces still deserve a real macro photographer."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI product imagery pricing", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "Can AI capture jewellery sparkle realistically?",
      a: "Yes, if you brief the lighting: “soft directional light, sparkle on the facets, deep shadows for contrast.” AI renders gemstone fire convincingly in stylized shots. For extreme macro detail of a specific stone's cut and clarity, a real photographer with a macro lens still wins.",
    },
    {
      q: "How much does AI jewellery photography cost?",
      a: "On Etch, each jewellery shot costs a flat ₹29. A ten-piece collection catalog is ten orders — compared with a jewellery shoot's photographer, lighting rig, and macro setup, the per-piece cost is a fraction. Remakes are ₹5.",
    },
    {
      q: "How do I show the true scale of a jewellery piece?",
      a: "Brief a scale cue explicitly: “ring on a model's finger”, “necklace on a bust stand”, or “earrings beside a coin for scale.” Never let AI invent proportions — compare the delivered shot against the real piece, since wrong scale is the fastest way to lose a jewellery buyer's trust.",
    },
    {
      q: "Will AI get my design's details right?",
      a: "Attach a clear reference photo of the actual piece and name what must stay identical: the setting style, stone arrangement, and engraving. AI is excellent at restaging — same design, new background and light — but always verify fine details before publishing.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "ai-photoshoot-cost-comparison-india",
    "ai-image-generator-india-pay-per-creation",
  ],
  body: [
    p(
      t("Jewellery breaks cameras. Tiny, reflective, and unforgiving — a gold necklace bounces every light in the room back at the lens, and diamonds turn into white blobs without precise lighting. Traditional jewellery photography needs macro lenses, light tents, and patience. "),
      t("AI jewellery photography"),
      t(" skips the physics lab and goes straight to the image — with one condition: you must brief like a jeweller, not a dreamer.")
    ),
    h2("Why jewellery is the hardest AI product shot"),
    p(
      t("Three things make jewellery hard: reflections (metal mirrors its environment), sparkle (facets need directional light to fire), and scale (a pendant the size of a coin must read as precious, not tiny). Generic prompts produce generic gold blobs. Specific prompts produce catalogue pieces. The difference is always in the brief.")
    ),
    h2("The jewellery brief formula"),
    list(
      [t("The piece, exactly: “22k gold jhumka earrings, temple design, pearl drops”")],
      [t("Metal and stones: “polished yellow gold, uncut polki diamonds, ruby accents”")],
      [t("The light: “single soft light from upper left, dark background, strong contrast for sparkle”")],
      [t("The stage: “on black velvet”, “on a marble bust”, “worn on a model's ear, hair pulled back”")],
      [t("The scale cue: “macro detail”, “shown on hand for scale”, “beside a 1-rupee coin”")],
    ),
    callout("tip",
      t("Dark backgrounds are jewellery's best friend: black velvet or deep charcoal makes gold glow and diamonds fire. Brief “dark background, dramatic side lighting” for hero shots and save bright lifestyle scenes for social posts.")
    ),
    h2("The shine problem, solved in the prompt"),
    p(
      t("Flat, dull metal is the classic AI jewellery failure — it happens when the prompt says “gold necklace” and nothing about light. Metal needs something to reflect: “softbox reflection in the gold”, “gradient reflection across the bangle”, “catchlights on each facet”. You're describing a lighting setup, not just an object. If the first render looks matte, that's a lighting brief problem — a "),
      t("₹5"),
      t(" remake with better light direction fixes it.")
    ),
    h2("Honesty rules for jewellery"),
    p(
      t("Jewellery buyers are the most detail-sensitive customers in e-commerce, and the stakes are high: a piece that arrives looking different from its photo is a return plus a trust wound. Non-negotiable rules: the design must match your actual piece (use reference photos), the scale must be honest (brief scale cues), and never upgrade the stones in the image — no rendering cubic zirconia as solitaire fire. AI restages; it must not redesign.")
    ),
    h2("Catalog shots vs campaign shots"),
    table(
      ["", "Catalog shots", "Campaign shots"],
      [
        ["Background", "“clean white or soft grey, even light”", "“dark velvet, dramatic light, festive props”"],
        ["Purpose", "Marketplace listings, your store", "Instagram, ads, festive campaigns"],
        ["Accuracy bar", "Highest — must match the piece", "High — same design, moodier light"],
        ["Volume", "Every SKU needs one", "A few heroes per collection"],
      ]
    ),
    h2("Costing a collection"),
    p(
      t("A ten-piece collection needs ten catalog shots plus three or four campaign heroes. At "),
      t("₹29"),
      t(" per shot on "),
      link("Etch", "/create"),
      t(", the whole collection's imagery is a predictable per-piece cost — no macro lens rental, no light tent, no shoot day. The "),
      link("pricing page", "/pricing"),
      t(" shows every price upfront, and each image is human-reviewed before delivery. For festive collections, order campaign variants early — Diwali and wedding-season rushes are real. And keep one master prompt template per metal finish: once the gold-on-black-velvet look is proven, every new SKU inherits it.")
    ),
    h2("When the camera still wins"),
    p(
      t("High-ticket solitaires and polki pieces where a buyer zooms into the stone deserve a macro photographer — no AI disclaimer needed, just physics. Use AI for the catalog breadth and campaign mood, and reserve the camera for the pieces where microscopic fidelity closes the sale.")
    ),
    cta(
      "Get jewellery shots for ₹29 each",
      "Brief the piece precisely, attach a reference photo, pay with UPI — human-reviewed before delivery.",
      "Create jewellery photography",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
