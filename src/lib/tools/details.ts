/**
 * Etch — per-tool detail content for /tools/[tool].
 *
 * Truthful, human-written copy for each of the 12 working tools: what it
 * does, what it's best for, its real limitations, 3 steps, and FAQs.
 *
 * HARD RULES:
 * - Only the 12 tools in TOOL_DIRECTORY may appear here (validated by test).
 * - No fake stats, no fake reviews, no invented numbers, no "trusted by".
 * - Limitations must be honest: operator fulfillment, engine availability,
 *   and known product gaps are stated, not hidden.
 * - Zero hardcoded ₹ literals — prices always come from the catalog via
 *   the page component (this file carries no prices at all).
 */

export interface ToolStep {
  title: string;
  copy: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolDetail {
  /** What the tool does — one honest paragraph. */
  what: string;
  bestFor: string[];
  limitations: string[];
  steps: [ToolStep, ToolStep, ToolStep];
  faqs: ToolFaq[];
  /** CTA label on the tool page. */
  cta: string;
}

export const TOOL_DETAILS: Record<string, ToolDetail> = {
  "single-image": {
    what: "Describe anything — a portrait, a poster, a concept, a scene — and get back a finished, high-resolution image. You write the brief in plain words, pick your aspect ratio, and an operator generates it for you.",
    bestFor: [
      "Portraits and character art",
      "Posters, thumbnails and covers",
      "Concept art and client mockups",
      "Wallpapers and profile art",
    ],
    limitations: [
      "One finished image per order — for four variations on one idea, use the 4-pack instead.",
      "Orders are fulfilled by an operator, not instantly — you pay, we generate, a human reviews it before delivery.",
      "Designs with lots of exact text (logos, signage) can misspell words — keep on-image text minimal.",
    ],
    steps: [
      { title: "Describe it", copy: "Write what you want in plain words and pick your aspect ratio — 1:1, 4:5, 9:16 or 16:9." },
      { title: "See the exact price", copy: "The price is shown before you commit. No credits, no subscription, no surprises." },
      { title: "Pay once, download", copy: "One UPI payment. A human QCs your image, then you download the full file." },
    ],
    faqs: [
      {
        q: "How long does it take?",
        a: "Orders are fulfilled by an operator after payment confirmation — you pay, we generate, a human reviews it before delivery. You'll see live progress stages while you wait.",
      },
      {
        q: "Can I send a reference photo?",
        a: "Yes — reference images are encouraged for product shots and style matching. Attach yours in the composer and describe what to keep from it.",
      },
      {
        q: "What resolution do I get?",
        a: "High-resolution output sized for your chosen aspect ratio — sharp enough for screens, prints and thumbnails.",
      },
      {
        q: "What if I don't like the result?",
        a: "Every order includes a cheap remake option, and nothing is delivered until it passes human QC.",
      },
    ],
    cta: "Start creating",
  },
  "pack-4": {
    what: "Four images on one concept for less than four singles. Pick your strongest, or hand a client options without paying four times.",
    bestFor: [
      "Iterating on one idea",
      "Giving clients options to choose from",
      "A/B testing thumbnails and ads",
      "Exploring styles before committing",
    ],
    limitations: [
      "Four labelled takes on one concept, fulfilled by an operator — not four separate automatic jobs.",
      "All four share your single brief, so they explore variations rather than four different ideas.",
    ],
    steps: [
      { title: "Write one brief", copy: "Describe the concept once — all four takes explore it from different angles." },
      { title: "See the exact price", copy: "The 4-pack price is shown up front. It's cheaper than four single images." },
      { title: "Pay once, pick your favourite", copy: "One UPI payment. A human QCs all four, then you download the set." },
    ],
    faqs: [
      {
        q: "Are the four images different?",
        a: "Yes — four distinct takes on your concept: different compositions, lighting or styling, all from your one brief.",
      },
      {
        q: "How long does it take?",
        a: "The 4-pack is fulfilled by an operator after payment confirmation, and every take passes human QC before delivery.",
      },
      {
        q: "Can I get four completely different ideas?",
        a: "The 4-pack explores one concept four ways. For different ideas, place separate single-image orders.",
      },
    ],
    cta: "Start creating",
  },
  "product-photo": {
    what: "Studio-grade product shots without booking a studio. Send a reference photo of your product (or describe it precisely) and get back clean, commercial-looking images for your listing, menu or ad.",
    bestFor: [
      "E-commerce listings and catalogs",
      "Food and restaurant menus",
      "Ad creatives and banners",
      "Social product announcements",
    ],
    limitations: [
      "Not a real photoshoot — results are best with a clear reference photo of your actual product.",
      "Fine print, tiny labels and exact packaging text may not reproduce perfectly.",
      "Orders are fulfilled by an operator and pass human QC before delivery.",
    ],
    steps: [
      { title: "Show your product", copy: "Attach a clear photo of your product, or describe it in detail — color, material, shape." },
      { title: "Pick the scene", copy: "Studio backdrop, lifestyle setting, flat-lay — describe the shot you want." },
      { title: "Pay once, download", copy: "One UPI payment. Human QC, then your product shot is ready to list." },
    ],
    faqs: [
      {
        q: "Do I need professional photos of my product first?",
        a: "No — a clear phone photo works as a reference. The clearer it is, the closer the result matches your product.",
      },
      {
        q: "Will it look like my actual product?",
        a: "That's the goal, and human QC checks it. If it misses, the cheap remake option has you covered.",
      },
      {
        q: "Can I get a plain white-background shot?",
        a: "Yes — ask for a clean studio backdrop in your brief. It's the most popular product-photo request.",
      },
      {
        q: "Who owns the image?",
        a: "You do. It's yours to use in listings, ads and packaging.",
      },
    ],
    cta: "Start creating",
  },
  "clip-5s": {
    what: "A 5-second AI video clip from your prompt — made for reels, intros, loops and product teasers.",
    bestFor: [
      "Reel intros and hooks",
      "Animated product teasers",
      "Looping backgrounds",
      "Character and portrait motion",
    ],
    limitations: [
      "5 seconds per clip — longer stories need multiple clips.",
      "Orders are fulfilled by an operator, not instant.",
      "Complex multi-shot narratives don't fit in 5 seconds — keep the motion idea simple.",
    ],
    steps: [
      { title: "Describe the motion", copy: "Write what should happen in the clip — describe the scene, the subject and the motion in plain words." },
      { title: "See the exact price", copy: "The per-clip price is shown before you commit. No subscription." },
      { title: "Pay once, download", copy: "One UPI payment. Human QC, then your 5-second clip is ready to post." },
    ],
    faqs: [
      {
        q: "What format do I get?",
        a: "A vertical 9:16 video file, ready to drop into reels, Shorts or TikTok.",
      },
      {
        q: "Can I animate my own photo?",
        a: "No — the 5s clip is made from your text prompt; animating your own photo isn't supported. Describe the scene you want instead, or use Product Photo plus a template for product shots.",
      },
      {
        q: "How long does it take?",
        a: "Clips are fulfilled by an operator after payment confirmation, and nothing ships until it passes human QC.",
      },
    ],
    cta: "Start creating",
  },
  tts: {
    what: "AI voice-over laid over your video, with your original audio ducked underneath it. Paste a script, pick a voice vibe, and get back your video narrated.",
    bestFor: [
      "Explainer and how-to videos",
      "Product walkthroughs",
      "Reels that need narration",
      "Replacing unclear recorded audio",
    ],
    limitations: [
      "AI voices reading your script — not a human voice actor, and it can't imitate or clone any specific person's voice. Great for narration, not for emotional performance.",
      "Scripts up to 2000 characters per job.",
      "Your original audio is ducked (lowered), not removed — use Add audio → Replace if you want it gone.",
    ],
    steps: [
      { title: "Upload your video", copy: "Drop in the MP4 you want narrated." },
      { title: "Paste your script", copy: "Up to 2000 characters. Pick a voice vibe: Warm, Energetic, Calm or Bold." },
      { title: "Get the narrated cut", copy: "We generate the voice-over, duck your audio under it, and deliver the finished video." },
    ],
    faqs: [
      {
        q: "Which languages are supported?",
        a: "English scripts work best. Other languages may work but aren't guaranteed — keep scripts simple for best results.",
      },
      {
        q: "Can I hear the voice before paying?",
        a: "The preview is watermarked so you can check the voice and timing before you download the clean file.",
      },
      {
        q: "What happens to my original audio?",
        a: "It's ducked to the background under the narration. If you'd rather remove it entirely, use Add audio in Replace mode.",
      },
    ],
    cta: "Open in Video Studio",
  },
  caption: {
    what: "Styled captions burned into your video — bold, readable, on-brand. Paste your own script; we build the captions from it.",
    bestFor: [
      "Reels and Shorts (most viewers watch muted)",
      "Talking-head videos",
      "Repurposing long videos into clips",
    ],
    limitations: [
      "Script mode only right now — automatic transcription isn't available, so have your text ready.",
      "Captions are burned in (part of the picture), not separate subtitle files.",
    ],
    steps: [
      { title: "Upload your video", copy: "Drop in the MP4 you want captioned." },
      { title: "Paste your script", copy: "Your words, in order — we time and style them for you." },
      { title: "Get the captioned cut", copy: "Styled captions are burned in and the finished video is delivered." },
    ],
    faqs: [
      {
        q: "Why can't I just upload and get captions automatically?",
        a: "Automatic transcription isn't available right now — script mode is the reliable path, and it's exact because the words are yours.",
      },
      {
        q: "Can I get an .srt file instead?",
        a: "This tool burns captions into the video itself, which is what reels and Shorts need. No separate subtitle file.",
      },
      {
        q: "What do the captions look like?",
        a: "Bold, high-contrast, bottom-center — styled to stay readable on phones.",
      },
    ],
    cta: "Open in Video Studio",
  },
  trim: {
    what: "Cut your video to the exact seconds you want, with an optional title card burned in. Real processing — fast, clean joins, no re-upload dance.",
    bestFor: [
      "Cutting reels down from long footage",
      "Adding a title card to a clip",
      "Extracting the best moment",
    ],
    limitations: [
      "Cuts are re-encoded for clean joins — quality stays high, but it's not lossless.",
      "One continuous cut per job — for multiple cuts, run the tool again on the result.",
    ],
    steps: [
      { title: "Upload and mark", copy: "Drop in your MP4 and set the start and end seconds." },
      { title: "Add text (optional)", copy: "A title card burned in at your chosen position." },
      { title: "Download the cut", copy: "Clean join, faststart encoding, ready to post." },
    ],
    faqs: [
      {
        q: "Will the cut lose quality?",
        a: "The cut is re-encoded at high quality for clean joins — visually lossless for posting.",
      },
      {
        q: "Can I cut out the middle of a video?",
        a: "Each job makes one continuous cut. For the best moment, set your start and end around it.",
      },
    ],
    cta: "Open in Video Studio",
  },
  compress: {
    what: "Shrink your video file without making it look bad. Real ffmpeg compression with three presets: Small, Balanced or Best quality.",
    bestFor: [
      "Videos that won't upload or send",
      "Faster WhatsApp and email sharing",
      "Freeing phone storage",
    ],
    limitations: [
      "Smaller files lose some detail — that's the trade. Balanced is the sweet spot for most videos.",
      "Already-tiny files won't shrink much further.",
    ],
    steps: [
      { title: "Upload your video", copy: "Drop in the MP4 that's too big." },
      { title: "Pick a preset", copy: "Small, Balanced or Best — we show you what each means." },
      { title: "Download the smaller file", copy: "Same video, fraction of the size, ready to share." },
    ],
    faqs: [
      {
        q: "How much smaller will my file get?",
        a: "Small is the most aggressive — big savings with some visible softening. Balanced is the sweet spot for most videos: much smaller files that still look sharp on phones and feeds.",
      },
      {
        q: "Will it still look good?",
        a: "Balanced and Best stay sharp on phones and social feeds. Small trades some detail for maximum shrinkage.",
      },
    ],
    cta: "Open in Video Studio",
  },
  convert: {
    what: "Pull the audio out of any MP4 as a 128kbps MP3. Real processing — your video's soundtrack, ready to keep.",
    bestFor: [
      "Saving a song or speech from a video",
      "Making ringtones and audio notes",
      "Extracting podcast audio",
    ],
    limitations: [
      "Output is 128kbps MP3 — great for listening, not for studio mastering.",
      "Video track is discarded — this tool only keeps the audio.",
    ],
    steps: [
      { title: "Upload your video", copy: "Drop in the MP4 with the audio you want." },
      { title: "We extract the audio", copy: "Converted to 128kbps MP3 with real processing." },
      { title: "Download the MP3", copy: "Your audio, ready to play anywhere." },
    ],
    faqs: [
      {
        q: "What quality is the MP3?",
        a: "128kbps — the standard for everyday listening, and it keeps files small.",
      },
      {
        q: "Is there a watermark on the audio?",
        a: "No — the MP3 is the MP3. (The download itself unlocks after payment, like every tool.)",
      },
    ],
    cta: "Open in Video Studio",
  },
  gif: {
    what: "Turn up to 10 seconds of your video into a crisp, shareable GIF. Palette-optimized for smooth colors at small file sizes.",
    bestFor: [
      "Reaction GIFs from your clips",
      "Shareable moments for chats",
      "Forum and comment-section replies",
    ],
    limitations: [
      "Max 10 seconds per GIF — pick your moment.",
      "GIFs are silent and lower-fidelity than video by nature.",
    ],
    steps: [
      { title: "Upload and mark", copy: "Drop in your MP4 and set the start and end (max 10s)." },
      { title: "Pick quality", copy: "Frame rate and width — we optimize the color palette automatically." },
      { title: "Download the GIF", copy: "Crisp, compact, ready to share anywhere." },
    ],
    faqs: [
      {
        q: "Why only 10 seconds?",
        a: "GIFs balloon in size fast. 10 seconds keeps them shareable instead of 50MB monsters.",
      },
      {
        q: "Will it have sound?",
        a: "No — the GIF format doesn't support audio.",
      },
    ],
    cta: "Open in Video Studio",
  },
  "add-audio": {
    what: "Lay music or a voice note over your video — mixed under the original audio, or replacing it entirely. Real processing, your second upload included.",
    bestFor: [
      "Adding trending audio to reels",
      "Background music for montages",
      "Replacing bad recorded audio",
    ],
    limitations: [
      "Mix mode ducks your video's audio under the new track; Replace mode removes it completely.",
      "The new audio is trimmed to the video length.",
    ],
    steps: [
      { title: "Upload both files", copy: "Your video plus the music or voice track." },
      { title: "Choose mix or replace", copy: "Blend the new audio under the original, or swap it out entirely." },
      { title: "Download the cut", copy: "Finished video with your soundtrack, ready to post." },
    ],
    faqs: [
      {
        q: "What audio formats can I upload?",
        a: "MP3 and other common audio formats work — if it plays on your phone, it almost certainly works here.",
      },
      {
        q: "Mix vs replace — what's the difference?",
        a: "Mix keeps your video's original sound quietly under the new audio. Replace removes the original sound completely.",
      },
    ],
    cta: "Open in Video Studio",
  },
  denoise: {
    what: "Clean background noise out of your video's audio with real ffmpeg processing — hum, hiss and rumble reduced, voices kept.",
    bestFor: [
      "Phone recordings with fan or AC hum",
      "Outdoor clips with wind rumble",
      "Room echo and hiss cleanup",
    ],
    limitations: [
      "Reduces steady background noise — it can't rescue clipped, distorted or extremely noisy audio.",
      "Three strengths: Light, Medium, Strong. Stronger isn't always better — it can thin out voices.",
    ],
    steps: [
      { title: "Upload your video", copy: "Drop in the MP4 with noisy audio." },
      { title: "Pick a strength", copy: "Light, Medium or Strong noise reduction." },
      { title: "Download the clean cut", copy: "Same video, noticeably cleaner sound." },
    ],
    faqs: [
      {
        q: "Will it remove voices?",
        a: "No — it targets steady background noise (hum, hiss, rumble) and leaves speech intact.",
      },
      {
        q: "My audio is really bad — will this fix it?",
        a: "Honestly: it helps a lot with moderate noise, but clipped or distorted audio can't be rescued by any tool.",
      },
    ],
    cta: "Open in Video Studio",
  },
};

/** Detail lookup — undefined for unknown ids (page renders notFound). */
export function toolDetail(id: string): ToolDetail | undefined {
  return TOOL_DETAILS[id];
}
