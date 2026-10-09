import type { BlogPost } from "../types";
import { t, link, p, h2, list, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "repurpose-video-into-shorts-ai-trim",
  title: "One Video, 10 Shorts: AI Trim and Reframe Playbook",
  description:
    "One recording, a week of shorts. The trim-and-reframe workflow: picking the strongest moments, reframing to 9:16, captioning for silent viewing, batching it all.",
  date: "2026-10-09",
  category: "Creators",
  tags: ["repurposing", "shorts", "video trim", "9:16", "captions"],
  readingMinutes: 6,
  answer: [
    t("Start from one strong recording — a tutorial, a demo, a Q&A. Trim out the dead air and tangents, cut around the strongest moments, reframe each to 9:16 with the subject centered, and add captions for silent viewing. One dense recording can realistically become a week of shorts. On "),
    link("Video Studio", "/create?service=video-studio"),
    t(", trimming, 9:16 reframing, and auto-captioning are handled as a "),
    link("₹29", "/pricing"),
    t(" job."),
  ],
  sources: [
    { label: "Etch pricing — Video Studio ₹29", url: "https://tryetch.online/pricing" },
    { label: "VEED — AI video tools", url: "https://www.veed.io/tools/ai-video" },
    { label: "TalkPix — AI video pricing", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "How many shorts can I realistically get from one video?",
      a: "It depends on density, not length. A tight ten-minute tutorial with clear segments can yield around ten shorts; a loose conversation might yield three good ones and a lot of filler. Record with cut points in mind — pauses between segments, self-contained answers — and the yield goes up without extra recording time.",
    },
    {
      q: "How long should each short be?",
      a: "Long enough for one idea, short enough that nothing drags — most repurposed moments land well under a minute. If a stretch needs more than that, it is usually two shorts hiding inside one. Cut at the natural break and give each idea its own hook.",
    },
    {
      q: "Will reframed horizontal video look bad in vertical?",
      a: "Only if you auto-crop and hope. Deliberate reframing — speaker’s eyes in the upper third, subject fully in frame, punching in tighter than feels comfortable — looks intentional on a phone screen. When the original framing truly fights vertical, make the short about one subject instead of cramming in two.",
    },
    {
      q: "What does repurposing cost on Etch?",
      a: "A Video Studio job is ₹29: trimming, 9:16 reframing, text overlays, and auto-captioning in one order. If you need original footage generated instead of repurposed, a full AI video is ₹19. Both are listed on the pricing page.",
    },
  ],
  related: [
    "auto-captions-instagram-reels",
    "ai-voice-over-reels-india",
    "ai-video-without-subscription",
  ],
  body: [
    p(
      t("Recording is the expensive part. You set up the light, you get the energy right, you talk for ten minutes straight — and then the footage sits on your phone because turning it into posts feels like a second job. It does not have to be. One dense recording contains several shorts already; the work is extraction, not creation. Trim the dead air, cut around the strongest moments, reframe each to vertical, add captions — and a single recording becomes a week of posts.")
    ),
    h2("Start with a recording worth cutting"),
    p(
      t("Repurposing multiplies what exists; it cannot create what does not. A recording repurposes well when it is dense: a tutorial with clear steps, a product demo with a visible before-and-after, a Q&A where each answer stands alone, a story with a beginning, a turn, and a payoff. Record with repurposing in mind: pause between segments, restate the point at the start of each answer, and keep tangents short. Those pauses become your cut points later. A rambling twenty-minute conversation with one good insight gives you one short and nineteen minutes of regret; a tight ten-minute tutorial with five clear segments gives you five shorts and a week’s calendar.")
    ),
    h2("Finding the strongest moments"),
    p(
      t("Watch the recording once at 1.5x speed with one question: which stretches could stand alone as a short? Mark them. The strongest moments usually share a few signals:")
    ),
    list(
      [t("A clear before-and-after: the demo, the transformation, the result on screen.")],
      [t("The surprising answer: the moment you say the thing the viewer did not expect.")],
      [t("The concrete step: one instruction the viewer can use today, not theory.")],
      [t("The energy peak: where you sped up, laughed, or leaned in — energy reads on camera.")],
      [t("The self-contained story: a beginning, a middle, and a payoff inside one stretch.")],
    ),
    h2("Trim first, reframe second"),
    p(
      t("Order of operations matters. First, trim: cut the filler words, the dead air, the false starts, the tangent about your lunch. A short survives on density — every second should earn its place. If a stretch needs more than a minute, it might be two shorts, not one. Only after the cut is tight do you reframe. Trimming first keeps you from carefully reframing footage you are about to delete, and it tells you the true length of each short before you commit to a layout.")
    ),
    h2("Reframing to 9:16 without awkward crops"),
    p(
      t("Horizontal footage squeezed into a vertical frame is where repurposed shorts go to look amateur. The fix is deliberate reframing, not auto-crop-and-hope: keep the speaker’s eyes in the upper third, keep the subject — the product, the demo, the whiteboard — fully inside the frame, and do not be afraid to punch in. A tighter crop on a talking head looks intentional; a wide shot with the subject lost in the middle looks like an accident. When the original framing fights you — two people far apart, a wide whiteboard — split the difference: alternate between the two subjects, or let the short be about one of them. One clear subject per short beats two cramped ones.")
    ),
    callout("tip",
      t("Punch in 10–20% tighter than feels comfortable. Phone screens are small; the crop that looks aggressive on your laptop looks correct on a phone.")
    ),
    h2("Captions for silent viewing"),
    p(
      t("Every short you ship without captions is a short half your potential audience skips. People watch in places where sound is off — commutes, offices, queues — and even with sound on, captions help viewers follow fast speech. Manual captioning is the part everyone dreads, which is exactly why it should be automated: transcription plus timing, reviewed once for names and product terms. Style the captions to match your hook overlays — same font family, same position logic — so the whole short looks like one designed object instead of footage with text pasted on.")
    ),
    h2("Batching a week of shorts from one recording"),
    p(
      t("The real payoff of repurposing is batching. Do the extraction work once, in one sitting, and the week’s content is done:")
    ),
    list(
      [t("Trim all the moments first, in one pass — do not polish one short at a time.")],
      [t("Reframe the batch: same 9:16 template, same caption style, same hook-overlay position.")],
      [t("Write the hook overlay for each short from the three formulas — question, claim, number.")],
      [t("Review the batch on mute, on your phone. If a short does not work silent, fix the captions or the crop.")],
      [t("Schedule them across the week; keep the strongest moment for the day your audience is most active.")],
    ),
    p(
      t("On Etch, Video Studio handles the mechanical half — trimming, 9:16 reframing, and auto-captioning — as a ₹29 job, so the batch goes from “a weekend of editing” to an afternoon of reviewing cuts. The full catalog, including the ₹19 AI video for original footage, is on the "),
      link("pricing page", "/pricing"),
      t(".")
    ),
    h2("The part you still cannot skip"),
    p(
      t("Automation handles the mechanical work; judgment stays yours. Watch every short before it ships — auto-trim can cut a pause that was actually dramatic timing, and reframing can crop out the product at the crucial second. Ten minutes of review per short is the difference between a feed that looks repurposed and a feed that looks produced. The goal was never zero effort; it was turning a week of editing into an afternoon of decisions.")
    ),
    cta(
      "Turn one recording into a week of shorts",
      "Video Studio trims, reframes to 9:16, and auto-captions — one ₹29 job.",
      "Repurpose a video",
      "/create?service=video-studio"
    ),
  ],
};

export default post;
