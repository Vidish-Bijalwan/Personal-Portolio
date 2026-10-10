import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "thumbnail-text-120px-creators",
  title: "Thumbnail Text That Works at 120 Pixels Wide",
  description:
    "YouTube thumbnails render ~120px wide on mobile feeds. Five rules for text readable at a glance: 3–5 words, heavy type, clear zones — plus why AI text garbles.",
  date: "2026-10-10",
  category: "Creators",
  tags: ["thumbnails", "youtube", "creators", "India", "design"],
  readingMinutes: 6,
  answer: [
    t("On a mobile feed, a YouTube thumbnail renders about 120 pixels wide — your text must survive that size. Use 3–5 words in a heavy sans-serif at high contrast, placed in a clear zone away from faces, and judge every design at thumbnail size, never at canvas size. AI image generators are good at the background scene but their baked-in text often garbles — generate the image for "),
    t("₹15"),
    t(", then add the words yourself in your editor for full control."),
  ],
  sources: [
    { label: "Etch pricing — AI image ₹15, remake ₹5", url: "https://tryetch.online/pricing" },
    { label: "YouTube Creators — official creator resources", url: "https://www.youtube.com/intl/ALL_in/creators/" },
    { label: "VEED AI tools — AI video and thumbnail workflows", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "Why does my thumbnail text look fine on my laptop but unreadable on my phone?",
      a: "You designed at full canvas size, but YouTube’s mobile feed and search results shrink thumbnails to roughly 120 pixels wide. Text that is comfortably readable at 1280 pixels can collapse into a grey smudge at feed size. Always shrink your design to thumbnail width and check it on your phone before publishing.",
    },
    {
      q: "Can AI generate the text on my thumbnail directly?",
      a: "It can try, but image generators are notoriously bad at rendering text — letters morph, spellings drift, and anything beyond a word or two in plain English tends to garble. The reliable workflow is to let AI paint the background scene and add the words yourself in your editor, where you control the font, stroke, and position.",
    },
    {
      q: "How many words should a YouTube thumbnail have?",
      a: "Three to five words, maximum. Every extra word forces a smaller font, and smaller fonts die first at 120 pixels. One short phrase that makes a single promise beats a sentence every time — the video title carries the detail, the thumbnail carries the hook.",
    },
    {
      q: "What does an AI thumbnail background cost on Etch?",
      a: "A single AI image costs ₹15 on Etch, and a remake is ₹5 if the first version misses. The text layer is yours to add in your own editor at no cost. Full pricing is on the pricing page.",
    },
  ],
  related: [
    "ai-video-hooks-text-overlays",
    "ai-youtube-thumbnails-india",
    "faceless-youtube-channels-ai-stack",
  ],
  body: [
    p(
      t("Most creators design thumbnails on a laptop at full canvas size, then publish into a feed where the thumbnail is the size of a postage stamp. In India, where the overwhelming share of YouTube watch time happens on phones, your thumbnail competes at roughly 120 pixels wide — next to a dozen others, for about one second of attention. Everything below is built for that reality, not the canvas.")
    ),
    h2("Why 120 pixels is the real canvas"),
    p(
      t("The mobile home feed, search results, and suggested videos all shrink thumbnails hard. Fine lines vanish, thin fonts dissolve, and busy compositions turn to noise. If your text needs squinting at full size, it is invisible at feed size. Rule zero of thumbnail text: shrink the design to thumbnail width and look at it on your phone — at arm’s length, in one glance — before you publish. What fails that test fails everywhere.")
    ),
    h2("The five rules of tiny-readable text"),
    list(
      [t("3–5 words maximum. Every extra word forces a smaller font, and smaller fonts die first at 120 pixels.")],
      [t("Heavy sans-serif, tight tracking. Bold grotesques survive compression; thin and decorative fonts dissolve into the background.")],
      [t("High contrast or nothing. Bright text on dark zones, dark text on bright zones — never mid-grey on mid-grey. A thick stroke or soft drop shadow buys you one more contrast grade.")],
      [t("Give text its own zone. Never place words over faces, hands, or busy texture — the eye reads the face first and the text loses. The bottom-right corner belongs to the video timestamp, so avoid it too.")],
      [t("One message per thumbnail. The text plus the expression should make a single promise together. If the text repeats the video title word-for-word, one of them is wasted — the thumbnail’s job is the hook, the title’s job is the detail.")],
    ),
    callout("tip",
      t("The phone test is the whole QA process: export the thumbnail, hold your phone at arm’s length, glance for one second. If you can read the words and feel the emotion in that one glance, it ships. At feed speed, you get exactly that long — design for it.")
    ),
    h2("AI thumbnails and the garbled-text problem"),
    p(
      t("Image generators are genuinely good at the hard parts of a thumbnail — dramatic lighting, expressive subjects, clean composition. But ask one to render text and the letters morph: spellings drift, strokes fuse, and anything beyond a word or two in plain English tends to garble. Mixed-language and stylized text garbles worse. This is not a prompting problem you fix with a better prompt — it is how these models handle letterforms.")
    ),
    p(
      t("So split the job. Let AI paint the scene, and add the words yourself in your editor, where you control the exact font, stroke, shadow, and position down to the pixel. You get the best of both: an AI-grade background and human-grade typography.")
    ),
    h2("The workflow that works"),
    p(
      t("On Etch, an AI thumbnail background costs "),
      t("₹15"),
      t(" — describe the scene, get a human-reviewed image, and if it misses, a remake is "),
      t("₹5"),
      t(". The text layer stays entirely yours in whatever editor you already use. The division of labour looks like this:")
    ),
    table(
      ["Step", "Who does it", "Cost"],
      [
        ["Background scene + subject", "AI image (Etch)", "₹15 per image"],
        ["Text, stroke, shadow, placement", "You, in your editor", "Your time, full control"],
        ["Background doesn’t land? Try again", "AI remake", "₹5"],
        ["Finished thumbnail text that garbles", "Nobody — don’t ship it", "A lost click"],
      ]
    ),
    p(
      t("See the "),
      link("pricing page", "/pricing"),
      t(" for the full catalog. When the thumbnail style is proven on a few videos, batch your backgrounds the same way sellers batch product shots: one consistent look per series, so subscribers recognise your videos at feed speed before reading a single word.")
    ),
    h2("Where captions fit in"),
    p(
      t("Thumbnail text wins the click; captions keep the viewer. For Shorts especially, burnt-in captions matter as much as the thumbnail did — most Shorts are watched with sound off at first. Etch’s Video Studio adds auto-captioning, voice-over, trim, and text overlay at "),
      t("₹29"),
      t(" per finished video. Use the same typographic discipline there: short phrases, heavy type, high contrast — captions are thumbnail text that moves.")
    ),
    h2("Judge at feed size, ship with confidence"),
    p(
      t("The creators who win thumbnails are not the ones with the best canvas — they are the ones who test at the size their audience actually sees. Three to five heavy words, a clear zone, one promise, checked on a phone at arm’s length. Generate the background with AI, own the typography yourself, and never let a garbled letter cost you a click.")
    ),
    cta(
      "Get a thumbnail background for ₹15",
      "Describe the scene, add your own text in your editor, and ship a thumbnail built for the phone feed.",
      "Create a thumbnail image",
      "/create?service=thumbnail"
    ),
  ],
};

export default post;
