import type { BlogPost } from "../types";
import { t, link, p, h2, list, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-video-hooks-text-overlays",
  title: "AI Video Hooks: First-3-Second Text Overlays That Stop Thumbs",
  description:
    "Reels are won or lost in the first 3 seconds. A guide to text-overlay hooks — question, claim, and number formulas — styled for your brand, paired with captions.",
  date: "2026-10-09",
  category: "Creators",
  tags: ["video hooks", "text overlays", "reels", "captions", "video studio"],
  readingMinutes: 6,
  answer: [
    t("A text-overlay hook is the on-screen line that earns the next 30 seconds of attention. The reliable formulas: a sharp question, a bold claim you can prove, or a specific number. Keep it to one idea in a few words, styled in your brand font and colors, and pair it with auto-captioned dialogue so muted viewers stay watching. On "),
    link("Video Studio", "/create?service=video-studio"),
    t(", captions are generated automatically and the whole job — captions, trim, and text — costs "),
    link("₹29", "/pricing"),
    t("."),
  ],
  sources: [
    { label: "Etch pricing — Video Studio ₹29", url: "https://tryetch.online/pricing" },
    { label: "VEED — AI video tools", url: "https://www.veed.io/tools/ai-video" },
    { label: "TalkPix — AI video pricing", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "How long should a text-overlay hook be?",
      a: "Three to six words, one idea. If you need a comma, you need a shorter hook. The overlay is a door, not the room — its only job is the swipe decision. Put the explanation in the captions and the voice-over, where the viewer is already staying.",
    },
    {
      q: "Should the overlay repeat what I am saying?",
      a: "No — complement it. If your first spoken line is “here are three lighting mistakes”, your overlay should be the bolder version: “3 lighting mistakes ruin every reel”. Repetition wastes the most valuable three seconds of the video saying the same thing twice.",
    },
    {
      q: "Do I need expensive fonts or motion graphics for hooks?",
      a: "No. Heavy weight, high contrast, one brand color — that is the whole system. Motion helps only after the words are right: a slide-in will not save a vague hook. Spend your effort on the sentence, then set it in your template.",
    },
    {
      q: "How much does it cost to add hooks and captions?",
      a: "On Etch, a Video Studio job is ₹29 — trimming, text overlays, and auto-captioning in one order, paid over UPI. A full AI video is ₹19. Check the pricing page for the complete catalog.",
    },
  ],
  related: [
    "auto-captions-instagram-reels",
    "ai-video-without-subscription",
    "ai-youtube-thumbnails-india",
  ],
  body: [
    p(
      t("Every reel fights the same battle: the thumb hovering over the screen, one twitch away from swiping. The video itself only gets a chance if the first thing the viewer reads earns a second look. That first thing is usually the text overlay — the big line sitting on top of the opening frame. Get it right and the viewer stays for the payoff; get it wrong and nothing else in the video matters, because nobody watches it.")
    ),
    h2("Why the first 3 seconds decide everything"),
    p(
      t("Open any short-video app and watch what your own thumb does. You give each video about three seconds — a glance at the opening frame, a half-second of sound, and a decision. Creators obsess over hooks in the spoken script, but the spoken hook arrives late: by the time you have said “in this video I am going to show you”, the swipe has already happened. The text overlay is the only part of your video that the viewer processes before deciding. It works when sound is off, it works before the first word is spoken, and it sets the question the rest of the video answers. A good overlay does not describe the video; it creates an open loop the viewer wants closed.")
    ),
    h2("The three formulas that keep working"),
    p(
      t("Thousands of creators, one pattern. The overlays that consistently earn the watch fall into three formulas. They work because each one gives the brain a reason not to swipe: curiosity, disbelief, or specificity. Learn all three, then rotate them so your feed does not feel repetitive.")
    ),
    list(
      [t("The question hook. Ask the exact question your viewer is already thinking: “Why does nobody buy from your product page?” A question creates a gap between what the viewer knows and what they want to know — and the only way to close it is to keep watching. Works best when the question is specific enough to feel personal and broad enough to pull in your target audience.")],
      [t("The bold claim. State something the viewer half-disbelieves: “Your captions are losing you customers.” Disbelief is sticky — people stay to see whether you are right. The rule is honesty: the video must actually prove the claim. A claim the video cannot back up earns the watch once and loses the follower forever.")],
      [t("The number. Lead with a concrete figure: “3 lighting mistakes ruin every product reel.” Numbers promise structure — the viewer knows there are three things coming and roughly how long the payoff takes. Odd, specific numbers beat round ones: “3 mistakes” outperforms “some mistakes”, and “₹29” beats “cheap”.")],
    ),
    h2("Styling overlays to match your brand"),
    p(
      t("A hook earns the watch; a brand earns the follow. If every creator in your niche uses the same white bold text on a black bar, your overlays should not. Pick one font, one or two sizes, and a fixed position — top third, center, wherever your face is not — and use them on every video for a month. Viewers start recognizing your videos before they read a word, which is exactly what a brand is: recognition that arrives before comprehension. Keep contrast brutal: text must survive a phone screen at half brightness in daylight. That means heavy weights and never thin script fonts over busy footage. If the footage is busy, put the text on a solid shape — a brand-colored pill or a soft dark scrim — rather than fighting the background.")
    ),
    list(
      [t("One font everywhere — your brand font, or the closest heavy sans you own.")],
      [t("Two sizes max: hook size and caption size. More than that looks accidental.")],
      [t("Fixed position: the same corner or third of the frame in every video.")],
      [t("Brand color for the keyword: keep the overlay mostly neutral, and color the one word that matters.")],
      [t("Test on a real phone at low brightness before you lock the template.")],
    ),
    h2("Pairing hooks with auto-captioning"),
    p(
      t("The hook gets the first three seconds; captions keep the next thirty. A viewer who stays for the overlay still leaves if the video is hard to follow on mute — and many people watch with sound off, in offices, metros, and family rooms where audio is not an option. Auto-captioning solves this without the manual drudgery of typing every line: the dialogue is transcribed and timed for you. The pairing matters because the hook and the captions do different jobs. The hook is one bold line engineered for the swipe decision; the captions are the quiet infrastructure that keeps a muted viewer oriented line by line. On Etch, Video Studio generates captions automatically as part of the ₹29 job — the same job that handles trimming and text overlays — so the whole package is one order, one price, listed plainly on the "),
      link("pricing page", "/pricing"),
      t(".")
    ),
    h2("A 20-minute hook workflow"),
    p(
      t("You do not need an hour per video. Here is the routine that keeps hooks sharp without turning every post into a copywriting project:")
    ),
    list(
      [t("Draft three hooks per video — one question, one claim, one number — before you edit.")],
      [t("Pick the one you would tap. If none of them makes you curious, the video’s angle is the problem, not the words.")],
      [t("Set it in your brand template: same font, same position, keyword in brand color.")],
      [t("Watch the first three seconds on mute. If the overlay alone does not earn the watch, rewrite it.")],
      [t("Save every hook that performs. After a month you own a personal swipe file of proven openers.")],
    ),
    h2("What hooks cannot fix"),
    p(
      t("Honesty check: a brilliant overlay on a boring video buys you three extra seconds of a boring video. Hooks amplify what is there; they do not replace it. If viewers consistently leave at second five, the problem is pacing or payoff, not typography. And no overlay survives a mismatch — a hype-style hook on a slow tutorial trains viewers to distrust your next hook. Match the overlay’s energy to the video’s actual delivery, and let the analytics, not your ego, pick which formula your audience prefers.")
    ),
    callout("tip",
      t("Steal like a researcher, not a copier: collect hooks from creators outside your niche, note which formula each uses, then rewrite the winner in your own words for your own topic. The formula is free; the sentence must be yours.")
    ),
    cta(
      "Stop the thumb in 3 seconds",
      "Video Studio adds your hook overlays, auto-captions, and trim in one ₹29 job.",
      "Create a video",
      "/create?service=video-studio"
    ),
  ],
};

export default post;
