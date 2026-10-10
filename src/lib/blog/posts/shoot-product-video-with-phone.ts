import type { BlogPost } from "../types";
import { t, link, p, h2, list, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "shoot-product-video-with-phone",
  title: "Shoot Product Videos on Your Phone: Shots, Light, Free Editing",
  description:
    "Your phone is enough for product videos: the 8-shot list for any product, window-light setups, settings to lock, and a free CapCut/VN editing workflow for shops.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["product video", "phone videography", "reels", "capcut", "small business"],
  readingMinutes: 8,
  answer: [
    t("You can shoot a selling product video with just your phone: one window for light, a locked focus and exposure, and an 8-shot list — hero, detail, in-use, scale, unboxing, materials, lifestyle, and B-roll. Shoot at 1080p 30fps, keep each shot 3\u20135 seconds, edit free in CapCut or VN Video Editor, add auto-captions, and structure the final cut as hook (0\u20133s), demo (3\u201310s), CTA (10\u201315s). Clean the lens first — it fixes more \u201Cbad camera\u201D complaints than any setting."),
  ],
  sources: [
    { label: "CapCut — free video editor", url: "https://www.capcut.com/" },
    { label: "VN Video Editor — official site", url: "https://www.vlognow.com/" },
    { label: "Apple — iPhone camera basics", url: "https://support.apple.com/en-in/guide/iphone/iph263472f32/ios" },
  ],
  faqs: [
    {
      q: "Do I need a tripod or gimbal for product videos?",
      a: "Not to start. A stack of books, a mug, or a Rs 300 mini tripod holds the phone steady for tabletop shots, which is where 80% of product video happens. A gimbal only matters for walking shots, which most product videos do not need. Spend your first money on a white thermocol sheet as a bounce reflector, not on stabilization gear.",
    },
    {
      q: "Should I shoot in 4K or 1080p?",
      a: "1080p at 30fps for everyday product videos. It edits smoothly on a phone, uploads fast, and looks identical to 4K on Instagram, which compresses everything anyway. Use 4K only when you plan to crop or zoom into the footage in editing — the extra pixels give you room to reframe. For a 15-second reel, 1080p is the practical choice.",
    },
    {
      q: "CapCut or VN Video Editor — which free editor should I learn?",
      a: "Both are genuinely free for the basics and both run on phones. CapCut has the better auto-captioning and trend templates; VN has a cleaner timeline and no watermark on exports, and many editors prefer its manual controls. Learn one properly rather than both halfway — the skills transfer. Avoid editors that stamp a watermark unless you pay; it instantly cheapens a product ad.",
    },
    {
      q: "What if my product video still looks amateur after all this?",
      a: "Nine times out of ten it is the light, not the phone. Reshoot near a big window with the room lights off, lock exposure on the product, and clean the lens. If the product itself needs a scene you cannot shoot — a festive background, a lifestyle setting, a model hand — a 5-second AI clip on Etch is ₹19 per creation, which is often cheaper than renting a location. See the pricing page for details.",
    },
  ],
  related: [
    "ai-video-hooks-text-overlays",
    "auto-captions-instagram-reels",
    "ai-video-without-subscription",
  ],
  body: [
    p(
      t("The shops winning on reels are not the ones with cameras. They are the ones with a window, a clean lens, and a shot list. A phone from the last five years shoots better video than the DSLRs of a decade ago \u2014 what separates a selling product video from a shaky clip is planning the shots, controlling the light, and editing with intent. This guide is the complete workflow: what to shoot, how to light it, which settings to lock, and how to edit it free on your phone.")
    ),
    h2("The 8-shot list that covers any product"),
    p(
      t("Professionals never \u201Cjust film the product\u201D. They collect a shot list \u2014 short clips, 3 to 5 seconds each \u2014 and assemble the video from the best ones. This list works for a kurti, a jar of pickles, a phone cover, or a candle. Shoot every item on it; you will use most of them.")
    ),
    list(
      [t("Hero shot. The product alone, centered, filling the frame, on a clean background. This is your thumbnail and your opening frame.")],
      [t("Detail/macro. Get close \u2014 the stitching, the glaze, the texture, the clasp. Customers buy details they can almost feel.")],
      [t("In-use shot. The product doing its job: the cream being applied, the bag being carried, the diya being lit.")],
      [t("Scale shot. A hand, a coin, or a familiar object next to the product. Online shoppers cannot pick things up; show them the size.")],
      [t("Unboxing/packaging. Open the box or pouch on camera. This shot sells trust \u2014 it answers \u201Cwhat will actually arrive?\u201D")],
      [t("Materials flat-lay. Ingredients, fabric swatches, or components arranged neatly from above. Great for food, skincare, and craft.")],
      [t("Lifestyle. The product in a real setting: the kurti worn at a doorway, the candle on a dinner table. One aspirational shot per video.")],
      [t("B-roll texture. Slow pours, steam, fabric moving, pages turning \u2014 3 seconds of pure texture to cut between the talking parts.")],
    ),
    h2("Light: one window beats three cheap LEDs"),
    p(
      t("Light is 70% of video quality. The good news: the best light is free. Shoot next to a large window with soft daylight \u2014 morning or late afternoon, not harsh noon sun. Put the product at a 45-degree angle to the window so one side has gentle shadow; flat front light looks like a passport photo. Turn OFF your room's tubelight or yellow bulb while shooting: mixed light (daylight + tubelight) creates ugly color casts no filter fixes. Bounce light back into the shadow side with a white thermocol sheet, a white bedsheet, or even a newspaper \u2014 hold it opposite the window and watch the shadows lift. If you must shoot at night, use one single warm bulb close to the product rather than the room's ceiling light, and white-balance will stay sane.")
    ),
    h2("Steady and sharp: 6 phone settings to lock"),
    p(
      t("Auto-everything is the enemy of product video. Your phone constantly refocuses and re-exposes, which makes footage pulse and hunt. Lock it down:")
    ),
    list(
      [t("Clean the lens. A smudged lens is the number-one cause of hazy \u201Cbad camera\u201D footage. Wipe it with a soft cloth before every shoot.")],
      [t("Turn on the grid (Settings \u2192 Camera \u2192 Grid). Place the product on the grid intersections, keep horizons level.")],
      [t("Lock focus and exposure. Tap and hold on the product until \u201CAE/AF Lock\u201D appears (iPhone) or the lock icon engages (Android). Now the phone stops hunting.")],
      [t("Shoot 1080p at 30fps. Smooth to edit, fast to upload, and Instagram compresses everything to this anyway.")],
      [t("Stabilize the phone. A Rs 300 mini tripod, a stack of books, or a mug \u2014 anything beats a hand for tabletop shots.")],
      [t("Silence the phone. Airplane mode or Do Not Disturb: one notification vibration mid-shot ruins the take.")],
    ),
    h2("Sound: shoot silent or speak close"),
    p(
      t("For product videos, you have two honest options. Option one: shoot silent and let music plus captions carry it \u2014 this is how most product reels work, and it sidesteps bad audio entirely. Option two: record a voice-over, but get the phone within an arm's length of your mouth in a quiet room (fan off, windows closed), or record the voice separately in the phone's voice recorder app and lay it under the video in editing. Never narrate from across the room; distant phone audio sounds like a bathroom and no viewer survives it.")
    ),
    h2("Edit free: the CapCut / VN workflow"),
    p(
      t("Both CapCut and VN Video Editor are free on phones and do everything a product video needs. The workflow, step by step:")
    ),
    list(
      [t("Import your shots and delete ruthlessly. Keep only the sharp, well-lit takes \u2014 ten good seconds beat thirty mediocre ones.")],
      [t("Assemble in story order: hero \u2192 problem or context \u2192 in-use \u2192 detail \u2192 CTA. Drag, drop, trim the heads and tails of every clip.")],
      [t("Add auto-captions (CapCut: Text \u2192 Auto captions). Most viewers watch muted; captions keep them.")],
      [t("Put the hook as big text on the first frame: \u201CPOV: your candles finally burn evenly\u201D, \u201CRs 499 kurtis that look Rs 1,499\u201D.")],
      [t("Add music from the app's own library \u2014 it is cleared for platform use, which random downloaded songs are not. Duck it under any voice.")],
      [t("Color: one light touch. Bump brightness and contrast slightly if the footage is dull; do not stack five filters.")],
      [t("Export at 1080×1920, 30fps, high quality. Check the file plays clean before posting.")],
    ),
    h2("The 15-second product reel skeleton"),
    p(
      t("Structure beats inspiration. For a standard product reel, use this skeleton and fill it with your shots: seconds 0\u20133, the hook \u2014 big text plus your most striking shot, promising one thing. Seconds 3\u201310, the demo \u2014 in-use, detail, and scale shots cut quickly, one proof per cut. Seconds 10\u201315, the CTA \u2014 the product at rest, price or offer on screen, and the spoken or written action: \u201CWhatsApp to order.\u201D Fifteen seconds, three acts, one product, one action. Shoot the list, edit the skeleton, post, repeat \u2014 that repetition is the whole strategy.")
    ),
    callout("tip",
      t("Batch your shoots. One hour of window light gives you the shot list for four or five products if you line them up. Shooting one product per day wastes your best light and your momentum \u2014 batch shooting is how solo shop owners post daily without burning out.")
    ),
    cta(
      "Shot it yourself, need a scene you can't film?",
      "A 5-second AI video clip is ₹19 per creation \u2014 festive backgrounds, lifestyle settings, and product scenes without renting a location.",
      "Create a video clip",
      "/create?service=video-studio"
    ),
    p(
      t("Everything above costs nothing but an hour and a window. When you need a scene your phone cannot reach, check the "),
      link("pricing page", "/pricing"),
      t(" \u2014 every price is per creation, listed plainly, no subscription.")
    ),
  ],
};

export default post;
