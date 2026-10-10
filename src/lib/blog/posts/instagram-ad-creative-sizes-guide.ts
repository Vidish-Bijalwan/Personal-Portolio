import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "instagram-ad-creative-sizes-guide",
  title: "Instagram Ad Creative Sizes Guide: Dimensions, Safe Zones, Formats",
  description:
    "Exact Instagram ad creative sizes — feed, stories, reels, carousel — plus safe zones and the five sizing mistakes that quietly waste small-business ad budgets.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["instagram ads", "creative sizes", "safe zones", "ad formats", "meta ads"],
  readingMinutes: 7,
  answer: [
    t("Instagram ad creative sizes: feed images 1080×1080 (1:1) or 1080×1350 (4:5); stories and reels ads 1080×1920 (9:16); carousel cards 1080×1080 each. Keep text and logos inside the safe zone — clear of the top profile bar, the bottom CTA and caption area, and the right-hand action rail — because Meta crops and overlays UI on top of your creative. Export JPG at high quality or PNG for text-heavy designs, and never stretch a square creative into a vertical slot."),
  ],
  sources: [
    { label: "Meta — Ads Guide (formats and specs)", url: "https://www.facebook.com/business/ads-guide" },
    { label: "Hootsuite — Social media image sizes guide", url: "https://blog.hootsuite.com/social-media-image-sizes-guide/" },
    { label: "Later — Social media image sizes", url: "https://later.com/blog/social-media-image-sizes/" },
  ],
  faqs: [
    {
      q: "What is the best image size for Instagram feed ads?",
      a: "1080×1350 pixels (4:5 portrait) for feed ads — it takes up the most screen space in the feed, which means more attention per rupee of spend. Square 1080×1080 works too and is the required size for carousel cards. Landscape (1200×628) is the weakest option on Instagram; avoid it unless you are running the same creative on Facebook's right column.",
    },
    {
      q: "What are safe zones in stories and reels ads?",
      a: "The areas Meta's own interface covers: the profile name bar at the top (roughly the top 14% of the 1080×1920 frame), the caption, CTA button and progress indicators at the bottom (roughly the bottom 20%), and the like/comment/share rail on the right edge in reels. Keep all text, logos, prices and faces inside the middle band of the frame. Anything important placed under those overlays is invisible in the actual ad.",
    },
    {
      q: "Can I use the same creative for feed and stories?",
      a: "Not without reformatting. A 1:1 square dropped into a 9:16 stories slot gets letterboxed with dead space top and bottom, and your text shrinks to unreadable. Build two versions from the same elements: a square/portrait for feed and a full-bleed 1080×1920 for stories and reels. This one extra step is the difference between a professional-looking ad and one that screams \u201Cboosted by accident\u201D.",
    },
    {
      q: "How much does it cost to get correctly-sized ad creatives made?",
      a: "On Etch, a single AI image is ₹15 and a 4-pack of variants is ₹49 — useful when you need the same creative resized across feed, stories, and reels. A poster is ₹29. You pay per creation over UPI with no subscription; see the pricing page for the full catalog.",
    },
  ],
  related: [
    "aspect-ratios-explained-platforms",
    "make-product-ads-with-ai",
    "ai-product-photography-india-sellers",
  ],
  body: [
    p(
      t("A shop owner in Jaipur once showed me his stories ad: a beautiful product photo, completely ruined because the price text sat exactly where Instagram puts its \u201CSend message\u201D button. He had paid for the clicks; nobody could read the price. Creative size mistakes are the quietest budget-killer in Instagram advertising \u2014 the ad runs, the money spends, and the message never lands. This guide gives you the exact dimensions, the safe zones Meta's interface eats into, and the five errors to stop making.")
    ),
    h2("The four placements that matter"),
    p(
      t("Instagram offers a dozen placements, but small businesses run four. Memorize these numbers \u2014 they cover 95% of real ad spend:")
    ),
    table(
      ["Placement", "Aspect ratio", "Pixel size", "Notes"],
      [
        ["Feed (single image)", "1:1 or 4:5", "1080×1080 or 1080×1350", "4:5 portrait takes the most feed space. Best default."],
        ["Stories", "9:16", "1080×1920", "Full-bleed vertical. Leave top and bottom clear of UI."],
        ["Reels (ads)", "9:16", "1080×1920", "Same frame as stories, plus a right-hand action rail."],
        ["Carousel", "1:1", "1080×1080 per card", "2\u201310 cards, all the same size. First card does the stopping."],
      ]
    ),
    h2("Safe zones: where your text must live"),
    p(
      t("A safe zone is the part of your creative that no interface element covers. Meta lays its own UI on top of your image or video: the account bar at the top, the caption and CTA button at the bottom, and in reels, the like/comment/share icons down the right edge. Design inside the remaining middle band. Practical rules of thumb for a 1080×1920 stories or reels creative: keep critical text out of the top 250 pixels and the bottom 350 pixels, and keep the right 120 pixels clear in reels. For feed ads, remember the ad copy sits below the image and truncates after about 125 characters \u2014 so the image itself must carry the offer, not rely on the caption. The test that never lies: publish the creative, open it on your own phone, and screenshot what you actually see. If the price is under a button, move it.")
    ),
    h2("Five sizing errors that waste ad budgets"),
    list(
      [t("Stretching a square into stories. A 1:1 creative in a 9:16 slot gets shrunk into the middle with empty bars top and bottom. Your text becomes postage-stamp sized. Build a real 1080×1920 version.")],
      [t("Tiny text. If it is not readable on a phone held at arm's length at half brightness, it does not exist. Headlines should be at least 1/10th of the frame height; body text has no business being on an image at all.")],
      [t("Logo in the corner \u2014 the wrong corner. Bottom-right logos die under the reels action rail; top-left dies under the profile bar. Put logos in the safe middle or centered.")],
      [t("Text on busy backgrounds. A price written over a patterned fabric photo is invisible. Put text on a solid pill or a soft dark scrim \u2014 a semi-transparent band that keeps the photo visible but the words readable.")],
      [t("One creative, every placement. Feed, stories, and reels have different shapes and different UI overlays. One file cannot serve all three well; make two or three versions from the same elements.")],
    ),
    h2("Text on image: the practical rule"),
    p(
      t("Meta no longer formally penalizes text-heavy images the way it once did, but human eyes still do. The rule that holds: the image should say one thing \u2014 the offer, the price, or the hook \u2014 and the caption says the rest. \u201CDiwali Sale \u2014 Kurtis Rs 499\u201D on the image; sizes, fabrics, and the WhatsApp number in the caption. If your image needs more than seven words, split it into a carousel where each card says one thing."),
    ),
    h2("Export settings that keep it sharp"),
    p(
      t("Size right, export wrong, and the ad still looks blurry. Use these settings when you save the final file: JPG at 90\u2013100% quality for photos, PNG for text-heavy designs and logos (JPG artifacts eat small text), sRGB color, and exactly the pixel dimensions above \u2014 not larger, because Meta recompresses uploads and oversized files get mangled worse. For video ads: 1080×1920, 30fps, H.264, under 4GB, with the first frame already carrying the hook since many viewers never unmute. Name your files by placement \u2014 feed-4x5.jpg, stories-9x16.jpg \u2014 so you never upload the wrong one at midnight before a sale.")
    ),
    callout("tip",
      t("Before spending a rupee: run every creative through the \u201Cthumb test\u201D. Shrink it to the size of your phone's thumbnail, glance for one second, and ask: what is the offer, and what do I tap? If you cannot answer both, resize or rewrite \u2014 not after the budget is spent.")
    ),
    cta(
      "Need the same creative in every size?",
      "Get ad images made at ₹15 each, or a 4-pack of variants for ₹49 \u2014 feed, stories, and reels versions from one brief.",
      "Create ad images",
      "/create"
    ),
    p(
      t("Sizes change slowly, but Meta does tweak specs \u2014 re-check the ads guide once a year. For what each size costs to produce, the "),
      link("pricing page", "/pricing"),
      t(" lists every Etch price plainly, per creation, no subscription.")
    ),
  ],
};

export default post;
