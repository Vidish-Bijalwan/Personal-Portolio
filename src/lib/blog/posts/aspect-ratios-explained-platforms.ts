import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "aspect-ratios-explained-platforms",
  title: "Aspect Ratios Explained: Pick the Right One for Every Platform",
  description:
    "1:1 vs 4:5 vs 9:16 vs 16:9 — what aspect ratios actually mean, which one each platform wants, and how to brief AI images so nothing important gets cropped.",
  date: "2026-10-08",
  category: "Guides",
  tags: ["aspect ratio", "Instagram", "YouTube", "creators", "guide"],
  readingMinutes: 6,
  answer: [
    t("Aspect ratio is simply width versus height: 1:1 is square, 4:5 is portrait, 9:16 is full vertical, 16:9 is widescreen. Instagram feed favors 4:5, Reels and Shorts need 9:16, YouTube wants 16:9. When ordering AI images on "),
    link("Etch", "/"),
    t(" — "),
    t("₹15"),
    t(" per image — state the ratio in your brief so the composition is built for it; cropping a square image into vertical throws away half the frame."),
  ],
  sources: [
    { label: "Etch pricing — single image ₹15", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI image pricing reference", url: "https://www.talkpix.ai/pricing" },
    { label: "VEED AI tools — AI video and image tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "What is aspect ratio in simple terms?",
      a: "The shape of the image, written as width:height. 1:1 is a perfect square, 16:9 is a widescreen rectangle (your TV), 9:16 is the same rectangle turned upright (your phone held vertically), and 4:5 is a slightly tall portrait. Same content, different shapes — and each platform has a favorite.",
    },
    {
      q: "Which aspect ratio should I use for Instagram?",
      a: "For the feed, 4:5 portrait takes up the most screen space as people scroll — more presence than a 1:1 square. For Reels and Stories, use 9:16 full vertical. For profile grids, 1:1 squares keep the grid tidy. Match the ratio to the placement, not the other way round.",
    },
    {
      q: "Can I just crop one image for all platforms?",
      a: "You can, but cropping is surgery: turning a 16:9 landscape into 9:16 vertical discards roughly two-thirds of the frame, usually including something important. It's far better to generate — or brief — each ratio natively. The ₹49 4-pack is a natural fit: one concept, multiple crops planned from the start.",
    },
    {
      q: "Does aspect ratio affect AI image quality?",
      a: "It affects composition, not quality. A prompt briefed as “9:16 vertical” gets a composition designed for vertical — subject placement, negative space, and balance all adapt. A square image cropped to vertical gets none of that. Always state the ratio up front.",
    },
  ],
  related: [
    "ai-youtube-thumbnails-india",
    "auto-captions-instagram-reels",
    "ai-trends-templates-explained",
  ],
  body: [
    p(
      t("Every creator has felt this pain: a beautiful image, posted, and the platform crops out the product, the face, or the headline. The culprit is almost always "),
      t("aspect ratio"),
      t(" — the shape of the image versus the shape of the slot it fills. Get the ratio right at creation time and the problem disappears. Here's the complete, jargon-free map.")
    ),
    h2("The four ratios that matter"),
    list(
      [t("1:1 SQUARE — the classic. Instagram grid posts, profile thumbnails, WhatsApp display pictures. Balanced, safe, but takes less feed space than portrait.")],
      [t("4:5 PORTRAIT — Instagram feed's sweet spot. Taller than square, so it dominates the scroll without demanding full-screen attention.")],
      [t("9:16 VERTICAL — full phone screen. Reels, Stories, Shorts, WhatsApp Status. The fastest-growing shape in Indian content consumption.")],
      [t("16:9 WIDESCREEN — YouTube videos and thumbnails, presentations, website heroes. The landscape default.")],
    ),
    h2("Which ratio for which platform"),
    table(
      ["Placement", "Best ratio", "Notes"],
      [
        ["Instagram feed post", "4:5", "Maximum scroll presence; keep text central"],
        ["Instagram Reels / Stories", "9:16", "Full vertical; keep key elements away from edges"],
        ["YouTube video / thumbnail", "16:9", "Widescreen; thumbnails need central safe area"],
        ["YouTube Shorts", "9:16", "Vertical, like Reels"],
        ["WhatsApp Status", "9:16", "Full-screen vertical"],
        ["Facebook feed", "4:5 or 1:1", "Portrait performs, square is safe"],
        ["Website hero", "16:9", "Wide banner compositions"],
        ["Pitch decks", "16:9", "Standard slide shape"],
      ]
    ),
    callout("tip",
      t("When in doubt, generate the tallest version first. It's easier to crop a 9:16 vertical down to 4:5 than to stretch a square upward — you can't invent pixels that were never composed.")
    ),
    h2("Safe areas: the invisible frame inside the frame"),
    p(
      t("Platforms overlay their own UI on your image — profile pictures, like buttons, captions, progress bars. On Reels and Shorts, the bottom fifth and the right edge are effectively dead zones. Brief accordingly: “9:16 vertical, keep the subject and any key detail in the central area, no important elements near the edges.” A composition that respects safe areas looks intentional everywhere; one that doesn't looks accidentally cropped everywhere.")
    ),
    h2("How to brief ratios when ordering AI images"),
    p(
      t("State the ratio as part of the camera section of your prompt: “9:16 vertical composition, subject centered with headroom”. On "),
      link("Etch", "/"),
      t(", one image costs "),
      t("₹15"),
      t(" — and planning ratios up front is free. For a campaign that needs three placements, the "),
      t("₹49 4-pack"),
      t(" covers the variants: same concept, three native compositions, no destructive cropping. See the "),
      link("pricing page", "/pricing"),
      t(" for the full catalog.")
    ),
    h2("Resolution: what actually matters"),
    p(
      t("Ratio is shape; resolution is detail. For social feeds, anything at or above the platform's display size looks sharp — the platforms compress uploads anyway. What matters more than pixel counts: generate at the final ratio (not a crop), keep text large enough to survive compression, and check the image at phone size before publishing. If it reads clearly as a 5cm thumbnail, it works.")
    ),
    h2("Common ratio mistakes to avoid"),
    list(
      [t("Designing square, posting vertical: the crop eats the subject. Brief the delivery ratio from the start.")],
      [t("Text near the edges on Reels: profile icons and captions cover it. Keep wording central with generous margins.")],
      [t("One image for every placement: a 16:9 YouTube thumbnail squeezed into a 1:1 Instagram post looks accidental.")],
      [t("Ignoring the grid: Instagram profile grids crop to square — check that your 4:5 posts still read as squares.")],
      [t("Forgetting WhatsApp: forwards and statuses are vertical-first in India; landscape creatives arrive tiny.")],
    ),
    cta(
      "Generate your next creative in the right ratio for ₹15",
      "State the ratio in your brief — 4:5 for feed, 9:16 for Reels, 16:9 for YouTube.",
      "Create a ratio-perfect image",
      "/create?service=single-image"
    ),
  ],
};

export default post;
