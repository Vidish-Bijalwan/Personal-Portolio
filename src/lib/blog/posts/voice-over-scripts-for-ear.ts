import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "voice-over-scripts-for-ear",
  title: "Voice-Over Scripts: Write for the Ear, Not the Eye",
  description:
    "Voice-over scripts fail on the page. How to write conversationally, test by reading aloud, pace for TTS voice-over, and match script length to your video.",
  date: "2026-10-09",
  category: "Creators",
  tags: ["voice-over", "scriptwriting", "TTS", "reels", "video studio"],
  readingMinutes: 6,
  answer: [
    t("A voice-over script works when it sounds like a person talking, not an article being read aloud. Write short sentences, use contractions and spoken transitions, read every draft out loud, and time it with a stopwatch so the words fit the video. For "),
    link("TTS voice-over", "/create?service=video-studio"),
    t(", punctuate for the ear — commas where you would breathe, full stops where you would stop — because the voice reads exactly what is written. A "),
    link("₹29", "/pricing"),
    t(" Video Studio job includes the TTS voice-over."),
  ],
  sources: [
    { label: "Etch pricing — Video Studio ₹29", url: "https://tryetch.online/pricing" },
    { label: "VEED — AI video tools", url: "https://www.veed.io/tools/ai-video" },
    { label: "TalkPix — AI video pricing", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "Can I just paste my blog post as a voice-over script?",
      a: "You will regret it. Blog posts are written for the eye — long sentences, formal transitions, ideas that need re-reading. A pasted post read aloud sounds stiff and runs long. Rewrite it: short sentences, contractions, one idea per beat, then read it aloud to check.",
    },
    {
      q: "How do I time a script to fit a 30-second video?",
      a: "Read it aloud at natural pace with a stopwatch. If it runs over, cut examples before ideas — one strong example beats three thin ones. If it runs under, add a pause or repeat the key line before the payoff. Then read it once more against the actual video to confirm they finish together.",
    },
    {
      q: "Does punctuation really matter for TTS voice-over?",
      a: "Yes — more than for human readers. A TTS voice reads exactly what is written, so punctuation is stage direction: commas are breaths, full stops are complete stops. Write short sentences with deliberate punctuation and the pacing takes care of itself.",
    },
    {
      q: "What does a TTS voice-over cost on Etch?",
      a: "It is part of a Video Studio job at ₹29 — script to voice-over, plus trimming, captions, and text overlays in the same order. A full AI video with voice-over built in is ₹19. See the pricing page for the catalog.",
    },
  ],
  related: [
    "ai-voice-over-reels-india",
    "auto-captions-instagram-reels",
    "faceless-youtube-channels-ai-stack",
  ],
  body: [
    p(
      t("Most voice-over scripts fail before the microphone turns on. They fail on the page — written like articles, full of long sentences and formal words, then read aloud by a voice that has no choice but to sound stiff. The fix is not a better voice; it is a better script. Writing for the ear is a different skill from writing for the eye, and it is learnable in an afternoon.")
    ),
    h2("Written language vs spoken language"),
    p(
      t("Nobody talks the way they write. Writing tolerates complexity — the reader can re-read a sentence. Listening does not — the listener gets one pass. Spoken language is shorter, looser, and more repetitive than written language, and that is a feature: repetition and simplicity are how ears follow along.")
    ),
    table(
      ["Written (for the eye)", "Spoken (for the ear)"],
      [
        ["It is essential to ensure optimal lighting conditions.", "Get the lighting right — it matters more than the camera."],
        ["Furthermore, creators should consider the following three points.", "Three things. First —"],
        ["One must not underestimate the importance of consistency.", "Do not underestimate consistency. Seriously."],
        ["In conclusion, we can observe that repurposing is beneficial.", "So: repurpose everything."],
      ]
    ),
    h2("The short-sentence rule"),
    p(
      t("If your script has one rule, make it this: one idea per sentence, and sentences a breath long. Long sentences force the voice — human or synthetic — to rush the middle and gasp at the end. Short sentences create natural pauses, and pauses are where emphasis lives. Read this aloud: “Video Studio trims your footage, reframes it to vertical, adds captions automatically, and delivers a finished short.” Now this: “Video Studio trims your footage. Reframes it to vertical. Adds captions automatically. Done.” Same information; the second version sounds like a person. When a sentence runs past two lines on the page, split it. Your ear will thank you.")
    ),
    h2("Contractions, transitions, and talking like a person"),
    p(
      t("Write “don’t”, not “do not”. Write “here’s the thing”, not “it should be noted that”. Spoken transitions are signposts — “so”, “now”, “here’s why”, “watch this” — that tell the listener where the thought is going. A few are load-bearing; a script without them sounds like bullet points being read. But keep them honest: if you would not say it to a friend, do not write it in the script. The test is always the same — does this sound like someone talking, or someone reading?")
    ),
    h2("The read-aloud test"),
    p(
      t("Every script gets read aloud before it is final. Not skimmed — read, out loud, at performance pace. You will catch what silent reading hides:")
    ),
    list(
      [t("Tongue-twisters: phrases that look fine and tie your mouth in knots.")],
      [t("Breathless stretches: anywhere you run out of air, the sentence is too long.")],
      [t("Robotic patches: formal words (“utilize”, “facilitate”) that nobody says.")],
      [t("Missing signposts: spots where you stumble because the thought jumps.")],
      [t("Wrong emphasis: if you stress the wrong word, the sentence is built wrong.")],
    ),
    p(
      t("Fix what you find, then read it again. Two passes catch nearly everything.")
    ),
    h2("Pacing for TTS voice-over"),
    p(
      t("A TTS voice-over reads exactly what is written — including every awkward comma and runaway sentence. That literalness is why punctuation becomes stage direction: commas are breaths, full stops are complete stops, line breaks are pauses. Write short sentences and the pacing takes care of itself; write one long winding sentence and the voice will sprint through it. Read your script aloud once at the pace you want, then match the punctuation to that performance — if you paused, the script needs a full stop.")
    ),
    callout("tip",
      t("TTS voices are consistent and fast, which suits tutorials and explainers — but they will not improvise warmth into a flat script. The personality has to be in the words. Write the warmth; the voice will carry it.")
    ),
    h2("Matching script length to video length"),
    p(
      t("The most common scripting mistake is writing too much. A script that runs long forces a choice: speed up the voice until it sounds anxious, or let the video end while words are still coming. Neither works. Instead, time it: read the script aloud at natural pace with a stopwatch, then compare against the video length. Over by a third? Cut examples, not ideas — one strong example beats three thin ones. Under? Add a pause, a repeated key line, or a beat of silence before the payoff; silence is pacing too. Write to the video’s skeleton: a hook line for the first three seconds, one idea per beat after that, and a closing line that lands exactly as the video ends. When the words and the pictures finish together, the whole thing feels produced. The "),
      link("pricing page", "/pricing"),
      t(" lists the ₹29 Video Studio job and the ₹19 full AI video, so you can budget the voice-over before you write a word.")
    ),
    h2("What a voice-over cannot fix"),
    p(
      t("A voice-over — human or AI — performs the script it is given. It cannot rescue a video with no point, and it cannot make a boring idea interesting; it can only deliver the words clearly. If the script is a list of features with no story, the voice-over will be a clear, well-paced list of features with no story. Fix the script first: one idea, spoken language, timed to the video. The voice is the last 10% of the work, not the first.")
    ),
    cta(
      "Give your video a voice that sounds human",
      "Video Studio’s TTS voice-over reads your ear-written script — one ₹29 job.",
      "Add a voice-over",
      "/create?service=video-studio"
    ),
  ],
};

export default post;
