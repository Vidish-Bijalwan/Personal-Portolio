import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-voice-over-reels-india",
  title: "AI Voice-Over for Reels: A Creator's Guide for India",
  description:
    "Add AI voice-over to your reels without a studio or mic. How TTS voice-over works, what it costs (₹39/job on Pixaura), and how to write scripts that sound natural.",
  date: "2026-10-06",
  category: "Creators",
  tags: ["voice-over", "TTS", "reels", "Video Studio", "India"],
  readingMinutes: 6,
  answer: [
    t("AI voice-over (text-to-speech) turns a written script into spoken audio you can lay over your video — no microphone or recording setup needed. On "),
    link("Pixaura's Video Studio", "/video-studio"),
    t(", a voice-over job costs a flat "),
    t("₹39 per finished video"),
    t(": you upload your clip, paste your script (up to 2000 characters), pick a voice vibe — Warm, Energetic, Calm, or Bold — and the finished video is delivered with the voice-over mixed in."),
  ],
  sources: [
    { label: "Pixaura Video Studio — voice-over & TTS at ₹39/job", url: "https://vidish.me/pricing" },
    { label: "VEED AI tools — voice generation and audio tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "How does AI voice-over work?",
      a: "You provide a script as text and choose a voice style. A text-to-speech engine generates the spoken audio, which is then mixed with your video — the original audio is ducked (lowered) under the voice so both are audible. Pixaura's Video Studio does this at ₹39 per finished video.",
    },
    {
      q: "How long a script can I use?",
      a: "Pixaura's voice-over accepts scripts up to 2000 characters — roughly 2–3 minutes of spoken audio depending on pace. For a 30-second reel, 60–75 words is the sweet spot.",
    },
    {
      q: "Will the AI voice sound robotic?",
      a: "Modern TTS voices are far from the old robotic readers, but script quality matters more than the engine: short sentences, conversational words, and explicit pauses (commas, line breaks) make the biggest difference. Pick the vibe that matches your content — Warm for storytelling, Energetic for promos.",
    },
    {
      q: "Can I use AI voice-over for client or commercial work?",
      a: "The finished video is yours to use, including commercially. As with any AI-generated media, check the platform's disclosure norms — some platforms ask you to label AI-generated content.",
    },
    {
      q: "What if I don't like the first voice-over?",
      a: "Rewrite the weak lines first — most “bad AI voice” problems are script problems. If the delivery itself misses, Pixaura's Video Studio jobs are priced per finished video (₹39), so re-running with a different vibe is a contained cost, not a sunk subscription.",
    },
    {
      q: "Which voice vibe should I pick?",
      a: "Warm suits storytelling and testimonials, Energetic suits launches and promos, Calm suits explainers and tutorials, Bold suits trailers and announcements. When unsure, Warm is the safest default — it flatters the widest range of scripts.",
    },
  ],
  related: [
    "auto-captions-instagram-reels",
    "how-much-does-ai-video-cost-india",
    "make-product-ads-with-ai",
  ],
  body: [
    p(
      t("Some creators love the camera but hate the mic — room echo, traffic noise, retakes. "),
      t("AI voice-over"),
      t(" removes the recording step entirely: write the script, pick a voice, get a finished video. Here's how to do it well, what it costs, and the mistakes that make TTS sound cheap.")
    ),
    h2("What you're actually buying"),
    p(
      t("A "),
      link("Video Studio", "/video-studio"),
      t(" voice-over job is one finished video for "),
      t("₹39"),
      t(": your uploaded clip + generated speech mixed professionally (original audio ducked underneath), delivered after processing. No subscription, no per-minute metering — the job price is the price.")
    ),
    h2("Writing scripts that don't sound like a robot"),
    list(
      [t("Write how you talk. “Here's the thing about Jaipur's blue streets” beats “This document concerns the cerulean architecture of Jaipur.”")],
      [t("One idea per sentence. TTS handles short sentences far better than nested clauses.")],
      [t("Use punctuation as direction: commas for breaths, ellipses for dramatic pauses, exclamation marks sparingly.")],
      [t("Read it aloud once yourself. If you stumble, the AI will too — rewrite the line.")],
      [t("Match vibe to content: Warm for stories and testimonials, Energetic for launches, Calm for explainers, Bold for trailers.")],
    ),
    callout("tip",
      t("Time your script: English averages ~800 characters per minute of speech. A 30-second reel needs roughly 350–400 characters. Write to the clock, not the page.")
    ),
    h2("Voice-over vs recording yourself"),
    table(
      ["", "AI voice-over (₹39/job)", "Record yourself"],
      [
        ["Setup", "None — script in, video out", "Mic, quiet room, retakes"],
        ["Consistency", "Identical delivery every take", "Varies with energy and day"],
        ["Languages/accents", "Depends on available voices", "Only your own"],
        ["Authenticity", "Good, but listeners can tell", "Unmistakably you"],
        ["Best for", "Faceless channels, ads, explainers", "Personal brand, vlogs"],
      ]
    ),
    h2("The workflow, step by step"),
    list(
      [t("Upload your clip (or your generated one) in "), link("Video Studio", "/video-studio"), t(".")],
      [t("Paste your script — up to 2000 characters — and pick a voice vibe.")],
      [t("Start the job (₹39 flat) and wait for processing.")],
      [t("Preview the result. The voice sits over your video with the original audio lowered beneath it.")],
    ),
    callout("tip",
      t("Save your best-performing scripts. A script that converted once will convert again with a new visual — voice-over makes creative reuse nearly free.")
    ),
    h2("Where voice-over fits in your content stack"),
    p(
      t("Voice-over is one step in a pipeline. The typical stack: generate or shoot the visual (an AI image from "),
      t("₹19"),
      t(" on the "),
      link("create page", "/create"),
      t(", or a 5-second AI clip at "),
      t("₹89"),
      t("), add the voice-over, then captions. Each step is priced separately on the "),
      link("pricing page", "/pricing"),
      t(" — which means you only pay for the steps you need. A talking-head video you shot yourself skips straight to captions; a faceless explainer uses the full stack.")
    ),
    p(
      t("Batch your scripts. Writing four scripts in one sitting and running four voice-over jobs is far more efficient than context-switching weekly — and because there's no subscription clock ticking, batching whenever suits you costs exactly the same as spreading it out.")
    ),
    h2("Pair it with captions"),
    p(
      t("Most reel viewers watch muted first. A voice-over plus burned-in captions covers both audiences — sound-on gets the narration, sound-off gets the text. Pixaura's Video Studio also does "),
      link("auto-captioning", "/blog/auto-captions-instagram-reels"),
      t(" at the same "),
      t("₹39 per finished video"),
      t(", and you can combine voice-over and captions across jobs for a fully finished reel.")
    ),
    cta(
      "Add a voice-over for ₹39",
      "Script in, finished video out. Four voice vibes to choose from.",
      "Open Video Studio",
      "/video-studio"
    ),
  ],
};

export default post;
