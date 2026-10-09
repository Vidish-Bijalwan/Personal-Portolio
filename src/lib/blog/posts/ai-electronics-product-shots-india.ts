import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-electronics-product-shots-india",
  title: "Crisp AI Product Shots for Electronics Accessories",
  description:
    "Metal, glass and cable detail: how electronics sellers get crisp tech product shots with AI — reflections, macro port shots, desk scenes — at ₹29 an image.",
  date: "2026-10-09",
  category: "Sellers",
  tags: ["electronics", "product photography", "accessories", "sellers", "macros"],
  readingMinutes: 6,
  answer: [
    t("AI product photography handles the hardest parts of tech imagery — metal and glass reflections, macro detail of ports and cables, and lifestyle desk setups — for "),
    t("₹29"),
    t(" per image or "),
    t("₹49"),
    t(" for a 4-pack. It works from your phone photo as a reference, so the product's actual shape, ports and branding stay accurate. Order on "),
    link("the create page", "/create?service=product-photo"),
    t(" with a clear reference photo; dark backgrounds for premium SKUs, clean white for marketplace listings."),
  ],
  sources: [
    { label: "Etch pricing — ₹29 image, ₹49 4-pack", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI product photography comparison", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "How much do AI product shots cost for electronics accessories?",
      a: "₹29 per image or ₹49 for a 4-pack on Etch. A typical accessory set — hero shot, macro detail, lifestyle desk scene, and packaging or scale shot — is one 4-pack per SKU. Pay per creation over UPI; there's no subscription or minimum order.",
    },
    {
      q: "Can AI get metal and glass reflections right?",
      a: "Better than a phone camera with no lighting, yes — and that's the point. Reflections are the part of tech photography that demands softboxes and tents in a real studio. With AI you describe the reflection style (“soft studio reflection on brushed metal”) and iterate. Inspect the delivery for warped logos or melted edges, which are the classic failure modes.",
    },
    {
      q: "Should I use dark or white backgrounds for tech products?",
      a: "Use both, deliberately. Clean white (or very light grey) backgrounds are the marketplace standard — Amazon and Flipkart listings look right and comparable on white. Dark, moody backgrounds are for your own site, social ads and premium positioning. One 4-pack can cover both: two whites, two darks.",
    },
    {
      q: "How do I keep the product accurate — ports, buttons, logos?",
      a: "Attach a straight-on reference photo and name the details that must not change: port positions, button layout, logo placement, cable connectors. Then verify the delivery against the physical product at full zoom. AI is excellent at scenes and lighting; the product's functional details are where you must be the strictest critic.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "background-removal-vs-ai-backgrounds",
    "amazon-listing-images-ai-india",
  ],
  body: [
    p(
      t("Electronics accessories — chargers, cables, earbuds, cases, stands — live and die by their product photos. The category is brutally comparative: your cable sits next to eleven other cables on a search results page, and the one with the crispest hero shot gets the click. Traditional tech photography is expensive precisely because of the materials: metal reflects everything, glass shows every fingerprint, and black-on-black products need serious lighting. AI product photography at "),
      t("₹29"),
      t(" per image removes the studio from the equation while keeping the part that matters — accuracy about the actual product.")
    ),
    h2("Reflections: the studio's hardest job, AI's party trick"),
    p(
      t("In a real studio, photographing a brushed-metal charger means light tents, flags, and an hour of moving softboxes to get a reflection that reads “premium” instead of “chaotic”. With AI, you specify the reflection as part of the brief: “soft gradient reflection on dark brushed metal, single clean highlight, dark grey studio background.” The generator has seen thousands of premium tech ads and reproduces their lighting language fluently. Your job shifts from lighting technician to art director — describe the mood, then judge the result.")
    ),
    callout("tip",
      t("For metal products, ask for “one controlled highlight” explicitly. Unspecified reflections come back busy and random; a single clean highlight reads expensive every time.")
    ),
    h2("Macro shots: ports, cables, connectors"),
    p(
      t("The second image every tech listing needs is the detail shot: the USB-C connector, the braided cable weave, the charging port, the button cluster. These are trust images — they answer “will this fit my device?” before the buyer reads the specs. Phone macros are usually disappointing: shallow depth of field, harsh flash, visible dust. AI macros give you the clean, deep-focus product-detail look of a spec sheet, built from your reference photo. Always cross-check connector shapes and port counts against the real product — a beautiful macro of a wrong connector is a return.")
    ),
    h2("Scale without lying"),
    p(
      t("Tech accessories have a scale problem: a power bank photographed alone could be any size. The honest fixes are showing the product in a hand (relative scale is fine when the hand is generic), beside a common object, or in a lifestyle scene with natural proportions. What crosses the line is altering the product's proportions to look sleeker or shrinking a competitor-looking detail out of frame. Describe the scene, never the reshape.")
    ),
    h2("Lifestyle desk setups"),
    p(
      t("The third image in the set is the aspiration shot: your earbuds case on a clean desk next to a laptop, the cable coiled beside a notebook, the stand holding a phone at a workspace. These scenes do the emotional work that white-background shots can't — they place the product in the buyer's life. Brief them with restraint: one or two supporting objects, a coherent colour story, and your product unmistakably the hero. Cluttered desk scenes bury the product and the click.")
    ),
    h2("Dark vs clean white: run both"),
    table(
      ["", "Clean white background", "Dark / moody background"],
      [
        ["Best for", "Amazon / Flipkart listings, comparison shopping", "Your own site, Instagram ads, premium SKUs"],
        ["Mood", "Honest, comparable, utilitarian", "Premium, dramatic, brand-led"],
        ["Reflection style", "Soft, minimal", "Strong single highlight"],
        ["Props", "None — product only", "One or two, restrained"],
      ]
    ),
    h2("A 4-pack brief for one accessory"),
    p(
      t("One "),
      t("₹49"),
      t(" 4-pack covers an accessory's full image set. Brief it as a set so the aesthetic holds together:")
    ),
    list(
      [t("Image 1 — hero on clean white: straight-on, full product, soft shadow. The marketplace workhorse.")],
      [t("Image 2 — macro detail: connector, port, or material close-up with deep focus.")],
      [t("Image 3 — dark premium shot: single controlled highlight, minimal props.")],
      [t("Image 4 — lifestyle desk scene: product in a believable workspace, hero of the frame.")],
    ),
    p(
      t("Keep one style thread across all four — same product colour accuracy, same logo treatment, same overall restraint — and the set reads as one brand instead of four stock photos. The full "),
      link("pricing page", "/pricing"),
      t(" lists every per-creation price plainly; accessories rarely need anything beyond the 4-pack per SKU.")
    ),
    h2("The accuracy checklist"),
    list(
      [t("Ports and connectors match the real product — count and shape.")],
      [t("Logo placement, size and spelling are exactly right.")],
      [t("Cable length and proportions look believable, not stretched.")],
      [t("Buttons, LEDs and labels are where they actually are.")],
      [t("Colours match the physical product under daylight, not just the render.")],
    ),
    cta(
      "Crisp tech shots at ₹29",
      "Reflections, macros and desk scenes — your real product, human-reviewed.",
      "Create your product photos",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
