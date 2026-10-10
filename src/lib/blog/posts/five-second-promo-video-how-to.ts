import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "five-second-promo-video-how-to",
  title: "How to Make a 5-Second Promo Video That Actually Gets Watched",
  description:
    "Make a 5-second promo video on your phone: the hook-product-CTA structure, free editing apps, exact export settings, and the mistakes that kill short promos.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["promo video", "reels", "CapCut", "DIY", "short video", "small business"],
  readingMinutes: 6,
  answer: [
    t("A 5-second promo video works when it follows a strict structure: seconds 0–1 deliver the hook (the offer or the most striking visual), seconds 1–4 show the product in motion, and seconds 4–5 carry the call to action (shop name + “DM to order”). Shoot vertical 1080×1920 at 30 fps, edit in CapCut or VN (both free), export as H.264 MP4, and add burned-in captions — most viewers watch muted. If you'd rather have it made, a 5-second clip on "),
    link("Etch", "/create"),
    t(" costs "),
    t("₹19"),
    t("."),
  ],
  sources: [
    { label: "CapCut — free video editor", url: "https://www.capcut.com/" },
    { label: "YouTube Audio Library — free music", url: "https://www.youtube.com/audiolibrary" },
    { label: "Etch pricing — 5s clip ₹19", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "What is the best free app for making a 5-second promo video?",
      a: "CapCut (free tier) is the best all-rounder: precise trimming, text animations, transitions, and a built-in music library. VN Video Editor is the best fully-free alternative with no watermark and pro-level keyframing. InShot is the simplest if you only need trim + text + music. All three export 1080×1920 without a watermark on their free tiers.",
    },
    {
      q: "What export settings should I use for a promo video?",
      a: "1080×1920 pixels (9:16), 30 fps, H.264 codec in an MP4 container, bitrate 8–12 Mbps. That plays crisply on Instagram, WhatsApp status, and YouTube Shorts without a giant file. Avoid 4K for a 5-second promo — it quadruples render and upload time for zero visible gain on a phone screen.",
    },
    {
      q: "Should a 5-second promo have music or voiceover?",
      a: "Music, not voiceover — five seconds is too short for a spoken sentence to land. Pick an upbeat royalty-free track from CapCut's library or the YouTube Audio Library, and cut your visual beats to the music's pulse. Keep it 6–10 dB below full volume so it energizes without overwhelming. And add captions anyway: most viewers watch muted.",
    },
    {
      q: "How do I make people watch instead of swiping past?",
      a: "The first frame decides. Start mid-action or on the offer — a hand lifting a steaming plate, “FLAT 40% OFF” filling the frame — never a fade-in, never your logo animating. In testing across small-brand promos, clips that open on the product or the deal consistently out-retain clips that open on branding. Your logo belongs in the last second, not the first.",
    },
  ],
  related: [
    "ai-video-hooks-text-overlays",
    "ai-video-without-subscription",
    "repurpose-video-into-shorts-ai-trim",
  ],
  body: [
    p(
      t("Five seconds is the hardest video length in marketing: too short for a story, too long for a single image, and exactly the length of a WhatsApp status attention span. But that constraint is the point — a 5-second promo forces you to say one thing, and one thing said well beats a 30-second ramble every time. This guide gives you the structure, the free apps, and the exact settings to make one on your phone this evening.")
    ),
    h2("The structure: hook, product, CTA"),
    p(
      t("Every second is budgeted. Write your plan as three beats before you shoot anything:"),
    ),
    table(
      ["Seconds", "Beat", "What the viewer sees"],
      [
        ["0–1", "Hook", "The offer or the most striking visual, full-frame. “FLAT 40% OFF”, a hand lifting a steaming plate, glitter falling on the product."],
        ["1–4", "Product", "The product in motion: rotating, being used, worn, opened. Movement is mandatory — a static product shot for 3 seconds reads as a frozen video."],
        ["4–5", "CTA", "Shop name, what to do next, how. “DM to order • Free delivery in Jaipur.” Big text, high contrast, readable in one glance."],
      ]
    ),
    p(
      t("One message per video. “Diwali sale on kurtis, DM to order” is a video. “Diwali sale plus new arrivals plus our story plus timings” is four videos — make four, post them across the week.")
    ),
    h2("Shoot it: 60 seconds of footage is plenty"),
    p(
      t("You need about a minute of raw footage to cut a great five seconds. Shoot with the same discipline as product photography:"),
    ),
    list(
      [t("Vertical, always: hold the phone upright, 1080×1920, 30 fps. A 5-second promo lives on status, reels, and shorts — all vertical.")],
      [t("Lock exposure and focus (tap-and-hold) so brightness doesn't pulse between clips.")],
      [t("Shoot each beat separately: 5 seconds of the hook visual, 10 seconds of product motion from two angles, 5 seconds of a clean end-frame for the CTA text. Multiple takes are free.")],
      [t("Move the product, not the camera: rotate it, pour into it, wear it, open the box. Camera movement in a 5-second clip usually just adds blur.")],
      [t("Capture 2–3 seconds of “handles” — extra footage before and after each beat — so your cuts don't feel chopped.")],
    ),
    h2("Edit it free: CapCut in 15 minutes"),
    p(
      t("CapCut's free tier does everything a 5-second promo needs. The workflow:"),
    ),
    list(
      [t("New project → 9:16. Import your clips; trim each beat to its budgeted length (hook 1s, product 3s, CTA 1s). Be ruthless — the trim tool is the whole craft.")],
      [t("Order the beats: hook first, product, CTA last. Add a 2–4 frame cross-dissolve only if a hard cut jars; hard cuts are usually punchier at this length.")],
      [t("Text: add the offer as large animated text on the hook beat (CapCut → Text → Templates has promo styles), and the shop name + CTA on the final beat. Keep text inside the central safe area — status and reel UIs crop the edges.")],
      [t("Captions: if anyone speaks, add burned-in captions (Text → Auto Captions, then fix the errors manually). Most viewers watch muted; uncaptioned speech is a wasted beat.")],
      [t("Music: pick an upbeat track from CapCut's library or the YouTube Audio Library, trim to 5 seconds, fade the last half-second. Duck it slightly under any voice.")],
      [t("Color: one tap of “Adjust” — slight contrast and saturation lift, consistent across all three beats so the clip feels like one piece.")],
    ),
    callout("tip",
      t("Watch it on mute before exporting. If the message survives with the sound off — offer readable, product visible, CTA clear — it's ready. If it needs the audio to make sense, your text overlays are too small.")
    ),
    h2("Export settings that just work everywhere"),
    table(
      ["Setting", "Value", "Why"],
      [
        ["Resolution", "1080 × 1920", "Native for status, reels, shorts — no cropping anywhere"],
        ["Frame rate", "30 fps", "Matches phone footage; smooth without huge files"],
        ["Codec / container", "H.264 in MP4", "Universal playback on every app and phone"],
        ["Bitrate", "8–12 Mbps", "Crisp on phones without a 50 MB upload"],
        ["Audio", "AAC 128 kbps", "Clean music/voice at small size"],
      ]
    ),
    p(
      t("In CapCut: Export → Resolution 1080p → Frame rate 30 → export. The file lands around 5–8 MB — uploads to WhatsApp status in seconds even on patchy data.")
    ),
    h2("Mistakes that kill short promos"),
    list(
      [t("Opening on your logo. The first frame is rented attention — spend it on the offer or the product, not branding.")],
      [t("Fade-ins and slow zooms. Five seconds has no time for atmosphere; start mid-action.")],
      [t("Tiny text. If the CTA isn't readable on a phone held at arm's length, it doesn't exist.")],
      [t("Two messages in one clip. Split them — two 5-second videos outperform one confused 5-second video.")],
      [t("No captions. Muted autoplay is the default feed behavior; speech without captions is silence.")],
      [t("4K export for a 5-second clip. It only slows your upload — nobody sees the difference on a phone.")],
    ),
    h2("The batch trick: one shoot, a week's promos"),
    p(
      t("Shoot 10 minutes of product motion once — the product rotating, being used, packed, handed over — and you have raw material for a dozen 5-second promos. Swap the hook text and CTA per video: one for the Diwali offer, one for the new arrival, one for the bestseller. Same footage, three campaigns. Small brands that post consistently beat small brands that post beautifully but rarely.")
    ),
    h2("If you'd rather have it made"),
    p(
      t("DIY costs an evening of learning and about 20 minutes per video once you're fluent. If you'd rather skip straight to the finished clip, a 5-second promo on "),
      link("Etch's create page", "/create"),
      t(" costs "),
      t("₹19"),
      t(" — flat, UPI payment, human quality check before delivery. Many shops split it: DIY the weekly offer clips with this guide, order the festive hero clip. The full catalog is on the "),
      link("pricing page", "/pricing"),
      t(".")
    ),
    cta(
      "Get a 5-second promo made for ₹19",
      "Flat price, UPI payment, human-reviewed — or make this week's clips yourself with the guide above.",
      "Create your promo clip",
      "/create?service=5s-clip"
    ),
  ],
};

export default post;
