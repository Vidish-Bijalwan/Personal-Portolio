import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-mobile-accessories-macro-shots",
  title: "AI Macro Shots for Mobile Covers & Accessories: Detail That Sells",
  description:
    "Phone cases sell on detail: texture, cutout precision, button fit. How Indian sellers brief AI macro shots for ₹29, keep colors true — and when to use a real photo.",
  date: "2026-10-10",
  category: "Sellers",
  tags: ["mobile accessories", "product photography", "sellers", "AI", "India"],
  readingMinutes: 6,
  answer: [
    t("AI macro shots render close-up product images — texture, camera cutouts, edge finishing — from your description plus a reference photo, at a flat "),
    t("₹29"),
    t(" per product photo on "),
    link("Etch", "/"),
    t(". They are excellent for showing finish and color; they cannot guarantee exact cutout dimensions, so fit-critical details like button alignment still deserve a real photo."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29", url: "https://vidish.me/pricing" },
    { label: "Etch pricing — tryetch.online", url: "https://tryetch.online/pricing" },
    { label: "Amazon Seller Central India", url: "https://sellercentral.amazon.in/" },
  ],
  faqs: [
    {
      q: "How much does an AI macro shot of a phone case cost?",
      a: "On Etch it costs the standard product photo rate: a flat ₹29 per finished image, paid over UPI, delivered after a human quality check. A full listing set of five macro shots — front, back, camera cutout, edge detail, lifestyle — comes to 145 rupees at the single-photo rate, or less if you use the ₹49 4-pack.",
    },
    {
      q: "Will the AI get my camera cutout dimensions exactly right?",
      a: "No — and this is the one honest limit to plan around. The AI renders a convincing cutout, but it cannot guarantee millimeter-accurate dimensions or exact button alignment for your SKU. Use AI macro shots to sell texture, finish, and color; show a real photo for any image where a buyer would measure the fit.",
    },
    {
      q: "How do I keep the colors true to my actual SKU?",
      a: "Attach a reference photo of the real product and name the color precisely — “midnight navy matte TPU” beats “blue case”. Color mismatch is one of the most common reasons buyers raise returns, so review the delivered image against your physical stock before publishing it to a listing.",
    },
    {
      q: "Can I use AI macro shots as my main listing images on Amazon or Flipkart?",
      a: "Yes, as long as the images honestly represent what the buyer receives. AI macro shots work well for finish and texture; pair them with one real photo of the cutouts and buttons so buyers can verify the fit. Misleading imagery creates returns no matter how the image was made.",
    },
  ],
  related: [
    "ai-electronics-product-shots-india",
    "ai-product-photography-india-sellers",
    "background-removal-vs-ai-backgrounds",
  ],
  body: [
    p(
      t("Phone cases and accessories are sold on details nobody reads about. A buyer zooms the thumbnail, checks the camera cutout, studies the edge finishing, and compares the color against the phone they already own. For sellers, that means the listing lives or dies on macro shots — close-ups that prove the finish is premium and the fit is precise. Here is how to brief AI macro shots that earn that zoom-in, at "),
      t("₹29"),
      t(" a shot, and where to draw the line between AI and a real camera.")
    ),
    h2("Why accessories sell on detail"),
    p(
      t("A t-shirt listing can survive on a flat-lay. A phone case cannot, because the buyer is checking three things in seconds: does the texture look like the price, is the camera cutout clean and centered, and do the buttons line up? Get any one of those wrong and the buyer moves to the next listing. Get them right and the case looks worth twice its price. Macro shots answer those three questions before the buyer reads a word of the description.")
    ),
    h2("What AI macro shots can and can't do"),
    p(
      t("An AI macro shot starts from your description and a reference photo of your real product, then renders a studio-quality close-up: dramatic side light on a leather texture, a razor-clean cutout edge, a matte finish with soft reflections. What it cannot do is guarantee exact geometry. The cutout will look right, but if your SKU's camera hole is 2mm off-center, the render will not faithfully reproduce that. Treat AI as a finish-and-feel tool, not an engineering drawing.")
    ),
    callout("warn",
      t("Hard rule: AI cannot guarantee exact cutout dimensions or button alignment. Never let an AI macro shot be the ONLY image showing a fit-critical detail. One real photo of the case on the actual phone model covers you against fit complaints.")
    ),
    h2("Briefing the cutout shot"),
    p(
      t("The cutout close-up is the money shot of every case listing. Brief it deliberately: name the phone model, describe the cutout shape, and ask for an angle that shows the edge finishing, not just a flat top-down view.")
    ),
    list(
      [t("Angle the cutout: “three-quarter macro angle on the camera cutout, showing the raised edge lip and the clean inner wall”. A slight tilt proves depth and finishing in a way a flat shot never does.")],
      [t("Show edge finishing: call out beveled edges, brushed metal buttons, or the matte rim explicitly — “smooth beveled edge catching a soft highlight”.")],
      [t("Keep the case on a neutral surface: dark grey or stone, so the cutout shadow reads clearly. Busy backgrounds hide the detail you are paying to show.")],
      [t("Attach your reference photo: the real case, shot in daylight. The AI matches shape and proportions from it, and you check the render against the physical unit.")],
    ),
    h2("Keep colors true to the SKU"),
    p(
      t("Color mismatch is the fastest route to a return in accessories. “Blue” covers a hundred shades; the buyer’s phone is one exact shade, and they will notice if the render drifted. Name the color the way your SKU does — “midnight navy matte TPU, cool undertone” — and state the finish: matte, gloss, frosted, leather grain. Then hold the delivered image next to the physical case in daylight before it goes live. If it drifted, a "),
      t("₹5 remake"),
      t(" is cheaper than a return.")
    ),
    callout("tip",
      t("Photograph your reference in daylight against white paper, not under warm room light. The AI inherits the color cast of your reference — a yellow-lit reference bakes yellow into every render downstream.")
    ),
    h2("Texture reads louder than color"),
    p(
      t("At thumbnail size, buyers cannot tell navy from midnight black — but they can tell cheap plastic from premium leather. That is why the second macro shot in every good listing is a texture close-up: the weave of a fabric case, the grain of leather, the brushed lines of a metal bumper. Material words do the heavy lifting here: “saffiano leather cross-hatch”, “soft-touch liquid silicone”, “carbon-fiber weave”. One strong texture word in the brief is worth a paragraph of scene description.")
    ),
    h2("A five-image macro set that covers a listing"),
    table(
      ["Image", "What it proves", "Brief one-liner"],
      [
        ["Hero front", "Overall design", "Straight-on hero, case floating on dark stone, soft key light"],
        ["Camera cutout macro", "Precision", "Three-quarter macro on the cutout, raised edge lip, clean inner wall"],
        ["Texture close-up", "Material quality", "Extreme close-up of the back texture, side light raking across the grain"],
        ["Edge and buttons", "Finish", "Low-angle macro on the side edge, beveled rim catching a highlight"],
        ["On the phone", "Fit (use real photo)", "Real photo of the case fitted on the actual phone model"],
      ]
    ),
    p(
      t("Five images at "),
      t("₹29"),
      t(" each comes to 145 rupees for the set — or use the "),
      t("₹49"),
      t(" 4-pack for the four AI shots plus one single, bringing the AI portion to 78 rupees (₹49 + ₹29). The fifth image, the fit photo, costs you a phone and a window. This split — AI for finish, camera for fit — is the honest workflow for accessories. The full catalog pricing is on the "),
      link("pricing page", "/pricing"),
      t(".")
    ),
    h2("When the macro shot is not enough"),
    p(
      t("Some accessories genuinely need a camera. If the product's whole pitch is a mechanical feature — a magnetic mount's grip, a stand's hinge angle, a lens attachment's optics — an AI render can mislead even when it tries to be accurate. And for a flagship launch with influencer unboxings, real photography still earns its fee. AI macro shots dominate the long tail: the thirty color variants, the seasonal refreshes, the new-SKU tests. Start your bestsellers with the five-image set, and scale what converts.")
    ),
    p(
      t("Once the stills are done, the same renders can anchor short video ads — spin views, texture pans, unboxing-style sequences. Etch's "),
      link("Video Studio", "/video-studio"),
      t(" builds those from your product images at "),
      t("₹29"),
      t(" per finished video, a natural next step after the listing set is live.")
    ),
    cta(
      "Get your first accessory macro shot for ₹29",
      "Attach a daylight reference photo, name the material and color precisely, and get a studio-grade macro after a human quality check.",
      "Create a product photo",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
