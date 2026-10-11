import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-broll-talking-head-videos",
  title: "AI B-Roll: Filling the Gaps in Talking-Head Videos",
  description:
    "Talking-head videos lose viewers when nothing changes on screen. Here's how to plan AI B-roll cutaways — what to generate, when to cut, and what it costs.",
  date: "2026-10-11",
  category: "Creators",
  tags: ["B-roll", "video", "talking head", "reels", "creators"],
  readingMinutes: 6,
  answer: [
    t("B-roll is the cutaway footage that covers your edits and illustrates what you're saying — and it's the difference between a talking head people watch and one they scroll past. The workflow: script first, mark every noun you say that could be shown, generate those shots as "),
    t("₹19"),
    t(" AI video clips or "),
    t("₹15"),
    t(" AI images with a slow zoom, and cut to a new visual every few seconds of narration. One "),
    t("₹29"),
    t(" Video Studio job assembles the cut — trimming, 9:16 reframing, and captions included. Plan your cutaways on "),
    link("the create page", "/create?service=video-studio"),
    t(" and check "),
    link("the pricing page", "/pricing"),
    t(" for the flat catalog."),
  ],
  sources: [
    { label: "Veed — AI video tools for creators", url: "https://www.veed.io/tools/ai-video" },
    { label: "Etch pricing — ₹19 AI video, ₹29 Video Studio", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "How often should B-roll cut in during a talking-head video?",
      a: "As a working rule, the viewer should see something new every few seconds — a cutaway, a zoom, a graphic, a clip. You don't need a hard number; watch your own video on mute at 2x speed and mark every stretch where the frame sits unchanged for too long. Those flat stretches are your B-roll shopping list.",
    },
    {
      q: "Should B-roll be video clips or still images?",
      a: "Motion wins when the thing you're describing moves — a product in use, a process, a place. Still images with a slow zoom (the Ken Burns move) are fine for concepts, quotes, and before/after states, and they cost less at ₹15 versus ₹19 a clip. A strong video mixes both: clips for energy, stills for emphasis.",
    },
    {
      q: "What's the cheapest way to add B-roll to an existing video?",
      a: "Script-map first (free), generate only the cutaways you marked (₹15 images or ₹19 clips each), then one ₹29 Video Studio job for the assembly — trim, 9:16 reframe, and captions. A ten-cutaway video lands well under what a single hour of an editor's time would cost, and you only pay for the shots you actually use.",
    },
    {
      q: "Does B-roll actually improve retention?",
      a: "It improves the thing retention depends on: visual change. Viewers decide in the first seconds whether a video will keep feeding them new information, and a static talking head signals “this won't change.” B-roll is how you keep that promise — every cutaway is a small delivery of the variety the viewer was promised. No tool can fix a boring script, but B-roll fixes a boring frame.",
    },
  ],
  related: [
    "repurpose-video-into-shorts-ai-trim",
    "ai-video-hooks-text-overlays",
    "faceless-youtube-channels-ai-stack",
  ],
  body: [
    p(
      t("Watch any talking-head video that holds you to the end and count the cuts. The speaker's face is rarely on screen for more than a few seconds at a stretch — there's always a product close-up, a screen recording, a clip, a graphic sliding in. That's B-roll: the secondary footage that illustrates the narration, covers the edit points, and keeps the eye fed. The good news for creators without a camera crew: every cutaway you need can now be generated for the price of a chai.")
    ),
    h2("Start with the script, not the footage"),
    p(
      t("B-roll fails when it's decoration — pretty clips that don't match the words. The fix is script-mapping: take your finished script and highlight every noun that could be shown. “I tested this serum for 30 days” → a calendar graphic, a bottle close-up, a texture shot. “The packaging felt premium” → an unboxing-style clip. “Sales doubled” → an animated-style chart visual. Each highlight becomes one line on your B-roll list. This takes twenty minutes and it's the difference between B-roll that illustrates and B-roll that distracts.")
    ),
    h2("What to generate for each cutaway"),
    table(
      ["Cutaway type", "Generate as", "Catalog price"],
      [
        ["Product in use / process / place", "AI video clip", "₹19"],
        ["Concept, quote, before/after state", "AI image + slow zoom", "₹15"],
        ["Full assembly: trim + 9:16 + captions", "Video Studio job", "₹29"],
        ["One cutaway that missed", "Remake of that single asset", "₹5"],
      ]
    ),
    p(
      t("The economics are what make this practical for Indian creators. A talking-head video with eight cutaways — five clips and three stills — costs (5 × ₹19) + (3 × ₹15) + one ₹29 assembly job: a finished, captioned vertical video for less than a single restaurant meal. You pay per asset, so a video that needs four cutaways costs less than one that needs twelve. There's no subscription meter running while you plan.")
    ),
    h2("The cut rhythm"),
    list(
      [t("Cut on the noun, not the pause: the visual should land exactly when you say the word it illustrates.")],
      [t("Vary the shot scale — wide, medium, close-up — so consecutive cutaways don't feel like the same shot.")],
      [t("Return to the face for opinions and punchlines; cut away for evidence and illustration. Face = trust, B-roll = proof.")],
      [t("Never let a generated clip run longer than the sentence it illustrates — trim ruthlessly.")],
      [t("Captions stay on through everything: most viewers meet your B-roll on mute first.")],
    ),
    callout("tip",
      t("The mute test: watch your assembled video with the sound off. If you can follow the argument from the visuals and captions alone, the B-roll is doing its job. If it's just a face talking, add cutaways until the mute version makes sense.")
    ),
    h2("A practical ordering workflow"),
    p(
      t("One: finish the script and mark your cutaway nouns. Two: order the stills and clips — batch the stills as a "),
      t("₹49"),
      t(" 4-pack when several share one product or style, singles at "),
      t("₹15"),
      t(" otherwise, clips at "),
      t("₹19"),
      t(" where motion matters. Three: upload everything plus your talking-head footage in a "),
      link("Video Studio order", "/create?service=video-studio"),
      t(" — one "),
      t("₹29"),
      t(" job handles trimming, 9:16 reframing, text overlays, and auto-captioning. Four: review the cut, and use "),
      t("₹5"),
      t(" remakes only on the cutaways that missed, not the whole video. The flat prices for each step are on "),
      link("the pricing page", "/pricing"),
      t(".")
    ),
    cta(
      "Assemble your next video for ₹29",
      "One Video Studio job: your footage plus AI cutaways, trimmed, reframed to 9:16, and captioned.",
      "Open Video Studio",
      "/create?service=video-studio"
    ),
  ],
};

export default post;
