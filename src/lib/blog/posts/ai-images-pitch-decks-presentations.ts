import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-images-pitch-decks-presentations",
  title: "AI Images for Pitch Decks and Presentations That Look Pro",
  description:
    "Ditch the stale stock photos. How founders and teams use AI imagery for pitch decks — concept visuals, metaphors, covers — for ₹15 a slide, plus the honesty rules.",
  date: "2026-10-08",
  category: "Guides",
  tags: ["pitch deck", "presentations", "startups", "AI images", "B2B"],
  readingMinutes: 6,
  answer: [
    t("AI-generated images give pitch decks and presentations custom visuals — concept metaphors, cover art, section dividers — for "),
    t("₹15"),
    t(" per image on "),
    link("Etch", "/"),
    t(", replacing overused stock photos. Use AI for illustrative and metaphorical imagery; never use it to fabricate data, charts, traction screenshots, or team photos. Investors forgive a plain slide — they don't forgive a misleading one."),
  ],
  sources: [
    { label: "Etch pricing — single image ₹15", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI image pricing reference", url: "https://www.talkpix.ai/pricing" },
    { label: "VEED AI tools — AI creative tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "What kinds of deck images work best as AI generations?",
      a: "Concept and metaphor visuals: the problem slide's illustration, the vision slide's artwork, cover images, and section dividers. These are places where custom imagery beats stock. Keep photography-style realism for things that must be true — your product, your team, your customers.",
    },
    {
      q: "How much does AI imagery for a full deck cost?",
      a: "A typical 12-slide deck needs four to six custom visuals. At ₹15 per image on Etch — or ₹49 for a 4-pack of variants — a fully illustrated deck costs less than a single stock-photo subscription month. Most founders spend under two hundred rupees on art for the whole deck.",
    },
    {
      q: "Can I use AI images in an investor pitch deck?",
      a: "Yes, for illustrative purposes. The honest boundary: AI imagery must never fabricate evidence — no AI-generated charts implying traction, no fake product screenshots, no invented customer logos, no synthetic team photos. Art illustrates; evidence must be real.",
    },
    {
      q: "What ratio should deck images be?",
      a: "Most decks are 16:9 widescreen. Brief your images as 16:9 compositions so they fill slides edge-to-edge without awkward cropping or letterboxing. Cover slides can go full-bleed; section dividers work as wide banners.",
    },
  ],
  related: [
    "aspect-ratios-explained-platforms",
    "ai-youtube-thumbnails-india",
    "what-is-pay-per-creation-ai",
  ],
  body: [
    p(
      t("Every investor has seen the same handshake stock photo, the same diverse-team-around-a-table, the same rocket-launch metaphor. Stock libraries made every deck look identical — and identical is forgettable. "),
      t("AI-generated imagery"),
      t(" lets a founder art-direct their own deck: a cover visual nobody else has, metaphors matched to the actual narrative, section art in one consistent style. At "),
      t("₹15"),
      t(" an image, the budget excuse is gone too.")
    ),
    h2("Where custom imagery wins in a deck"),
    list(
      [t("Cover slide: a single striking visual that encodes your thesis — a fintech for kirana stores deserves better than a generic skyline.")],
      [t("Problem slide: illustrate the pain vividly. A powerful metaphor here does more than three bullet points.")],
      [t("Vision slide: show the future you're building, rendered beautifully. This is the slide investors remember.")],
      [t("Section dividers: small consistent artworks that give the deck rhythm and a designed feel.")],
      [t("Team slide backgrounds: subtle textures or brand-pattern art behind real team photos (the photos themselves stay real).")],
    ),
    h2("The honesty rules for investor decks"),
    p(
      t("This matters more than the aesthetics. AI imagery in a fundraising deck must never fabricate evidence: no AI-generated growth charts, no synthetic product screenshots, no invented customer logos, no fake office photos. Illustrate ideas freely; document facts truthfully. One discovered fabrication ends the conversation — and possibly the relationship. When an image is illustrative, a small “concept illustration” caption keeps everything clean.")
    ),
    callout("warn",
      t("Never AI-generate traction evidence: charts, dashboards, testimonials, press logos, or user counts. Investors diligence everything, and a fabricated chart is a trust-ending event, not a design choice.")
    ),
    h2("A consistent visual language across the deck"),
    p(
      t("The difference between “AI images in a deck” and “a designed deck” is consistency. Pick one style anchor and repeat it in every brief: “flat vector illustration, deep navy and amber palette, subtle grain” or “cinematic photography, warm tones, shallow depth of field”. Generate the cover first, approve the style, then brief every subsequent image as “same style as the cover”. Five images sharing one language read as a brand; five random beautiful images read as a mood board.")
    ),
    h2("What a deck's worth of AI art actually costs"),
    table(
      ["Need", "Etch option", "Cost"],
      [
        ["Cover visual", "Single image", "₹15"],
        ["Problem + vision metaphors", "4-pack (variants to choose)", "₹49"],
        ["2–3 section dividers", "Single images", "₹15 each"],
        ["Full deck art (6 visuals)", "Mix of singles + one 4-pack", "Well under a stock subscription"],
      ]
    ),
    p(
      t("Compare that with a stock subscription you keep paying for, or a designer engaged for a week. The full catalog with flat per-image prices is on the "),
      link("pricing page", "/pricing"),
      t(" — no subscription, pay per image over UPI.")
    ),
    h2("Briefing deck art: the executive summary version"),
    p(
      t("Keep prompts art-directed and simple: subject, style anchor, 16:9 composition, “no text” (add slide titles in your deck tool for crisp typography). Example: “wide 16:9 illustration, small kirana store glowing warmly at dusk on a dark street, flat vector style, deep navy and amber, no text, generous empty space on the left for headline.” Generate, place, present — and if the first version misses, a "),
      t("₹5 remake"),
      t(" is cheaper than redesigning the slide around a wrong image.")
    ),
    h2("Presenting the visuals in the room"),
    p(
      t("A final practical note: AI art looks best when you treat it like art direction, not decoration. Give each visual room to breathe — full-bleed covers, generous margins on metaphor slides — and resist the urge to shrink a beautiful image into a corner beside six bullet points. If a slide has a strong visual, cut the text to a headline and talk the detail. Investors remember the deck that felt designed; nobody remembers slide seven's third bullet.")
    ),
    cta(
      "Art-direct your deck for ₹15 an image",
      "One style anchor, 16:9 compositions, no text in the artwork — add titles in your slide tool.",
      "Create deck visuals",
      "/create?service=single-image"
    ),
  ],
};

export default post;
