import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "make-product-ads-with-ai",
  title: "How to Make Product Ads with AI: Photo to Finished Video",
  description:
    "Turn a product photo into a finished video ad with AI: script, voice-over, captions, trim. A step-by-step workflow with Etch's ₹29 product photos.",
  date: "2026-10-06",
  category: "Sellers",
  tags: ["product ads", "video ads", "AI", "Video Studio", "sellers"],
  readingMinutes: 6,
  answer: [
    t("An AI product ad workflow has four steps: (1) generate a studio-grade product photo ("),
    t("₹29 on Etch"),
    t("), (2) generate or shoot a short product clip, (3) add an AI voice-over and auto captions in "),
    link("Video Studio", "/video-studio"),
    t(" ("),
    t("₹29 per finished video"),
    t("), and (4) trim with a text overlay for the hook. Total: a finished ad for a few hundred rupees — no shoot, no editor, no subscription."),
  ],
  sources: [
    { label: "Etch pricing — product photo and Video Studio prices", url: "https://vidish.me/pricing" },
    { label: "TalkPix product video ads — how AI ad templates are priced", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "What do I need to start making AI product ads?",
      a: "A product (or a clear description of it) and a 30–60 second script. Etch handles the rest: ₹29 for the product photo, ₹19 if you want a 5-second AI clip generated, and ₹29 per Video Studio job for voice-over, captions, or trim + text.",
    },
    {
      q: "How long does it take to make an AI product ad?",
      a: "Every Etch order passes a human quality check before download, and you can track live progress while you wait. The hands-on part — writing the script and describing the visuals — is under an hour for a short ad.",
    },
    {
      q: "Will an AI ad look cheap?",
      a: "It looks as good as your inputs: a well-briefed product photo, a tight script, and clean captions. The common failure is a rambling script, not the AI — write short sentences and cut ruthlessly.",
    },
    {
      q: "Can I run AI-made ads on Instagram and YouTube?",
      a: "Yes — export in the platform's format (9:16 for reels/shorts). Some platforms ask you to label AI-generated content; check the current policy where you publish.",
    },
    {
      q: "How do I know if my AI ad is working?",
      a: "Watch thumb-stop rate first (are people pausing on it?) and click-through second. Because each creative costs a few hundred rupees to produce, you can afford to test five variants and keep the winner — something shoot economics rarely allow.",
    },
    {
      q: "What script length works for a 30-second ad?",
      a: "About 60–75 words of spoken script, plus on-screen text for the offer. Write the hook first, the benefit second, and the call to action last — then cut a third of what's left. Short ads outperform long ones at every budget.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "ai-voice-over-reels-india",
    "auto-captions-instagram-reels",
  ],
  body: [
    p(
      t("A product ad used to mean a shoot day, an editor, and a voice artist. The AI version needs one person, one script, and a few hundred rupees. This is the complete workflow — photo to finished video — using "),
      link("Etch", "/"),
      t("'s actual products and prices.")
    ),
    h2("Step 1 — The product photo (₹29)"),
    p(
      t("Everything starts with a strong still. Order a "),
      link("product photo", "/create?service=product-photo"),
      t(" for "),
      t("₹29"),
      t(": describe the product, the surface, the light. Our "),
      link("product photography guide", "/blog/ai-product-photography-india-sellers"),
      t(" covers briefing in detail. This one image becomes your ad's hero frame, thumbnail, and catalog shot — triple duty.")
    ),
    h2("Step 2 — The clip"),
    p(
      t("Two options. Generate a 5-second AI clip from a description for "),
      t("₹19"),
      t(" on the "),
      link("create page", "/create?media=video"),
      t(" — good for cinematic product reveals — or shoot 10 seconds on your phone. Phone footage is fine; the AI polish in step 3 does the heavy lifting.")
    ),
    h2("Step 3 — Voice-over + captions (₹29/job)"),
    p(
      t("Write a 40–60 word script: hook in the first line, one benefit per sentence, call to action last. Then in "),
      link("Video Studio", "/video-studio"),
      t(", add an "),
      link("AI voice-over", "/blog/ai-voice-over-reels-india"),
      t(" (pick Warm for friendly, Energetic for launches) and "),
      link("auto captions", "/blog/auto-captions-instagram-reels"),
      t(" — each a "),
      t("₹29"),
      t(" job. Sound-on viewers get the narration; muted scrollers get the text.")
    ),
    callout("tip",
      t("The first 2 seconds decide everything. Open with the product in motion or a bold claim on screen — never a logo sting. Logos go at the end.")
    ),
    h2("Step 4 — Trim + text overlay (₹29/job)"),
    p(
      t("Cut the dead air, then burn in your hook as text: the price, the offer, the CTA. A "),
      link("Video Studio", "/video-studio"),
      t(" trim + text job is "),
      t("₹29"),
      t(". Keep total runtime under 30 seconds for reels and shorts.")
    ),
    h2("The full budget"),
    table(
      ["Step", "What", "Cost"],
      [
        ["1", "AI product photo", "₹29"],
        ["2", "5s AI clip (or phone footage)", "₹19 (or free)"],
        ["3", "Voice-over job", "₹29"],
        ["3", "Captions job", "₹29"],
        ["4", "Trim + text job", "₹29"],
        ["Total", "Finished video ad", "A few hundred rupees — less with phone footage"],
      ]
    ),
    callout("tip",
      t("Make the thumbnail from the product photo, not a video frame — the ₹29 still is higher resolution than any extracted frame and looks sharper in feeds.")
    ),
    h2("Distribution checklist: where the ad goes"),
    p(
      t("A finished ad is only half the job. Export 9:16 for reels, shorts, and status; 1:1 for feed posts; 16:9 if it ever touches YouTube proper. Upload natively to each platform rather than cross-posting one link — native uploads get meaningfully better reach. And keep the "),
      link("pricing page", "/pricing"),
      t(" bookmarked: when the first ad works, the next five variants cost the same per step, so scaling winners is arithmetic, not a new budget approval.")
    ),
    p(
      t("Track one metric per ad: thumb-stop rate (did they pause?) for the hook, and click-through for the offer. Kill losers fast, double down on winners — the per-creation model makes this cheap enough to actually do.")
    ),
    h2("What makes AI ads convert"),
    list(
      [t("One product, one promise per ad. Three benefits means zero remembered.")],
      [t("Show the product in the first frame — no mystery openings.")],
      [t("Price or offer on screen, not just in the caption.")],
      [t("Native format: 9:16, captions burned in, under 30 seconds.")],
      [t("Test variants: the ₹29 price point makes A/B testing thumbnails and hooks genuinely cheap.")],
    ),
    cta(
      "Start your ad with a ₹29 product photo",
      "The hero frame everything else builds on.",
      "Create a product photo",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
